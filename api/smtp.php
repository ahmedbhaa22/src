<?php
/* ============================================================
   Minimal SMTP client (no dependencies) for cPanel hosting.
   Supports implicit TLS (port 465) and STARTTLS (port 587),
   AUTH LOGIN, and plain-text UTF-8 messages.
   ============================================================ */

declare(strict_types=1);

final class SmtpMailer
{
    private $sock = null;

    public function __construct(
        private string $host,
        private int $port,
        private string $user,
        private string $pass,
        private string $secure = 'auto', // 'ssl' | 'tls' | 'auto' | 'none' (local testing only)
        private int $timeout = 15
    ) {}

    /** Sends one plain-text email. Throws RuntimeException on any SMTP error. */
    public function send(string $fromEmail, string $fromName, string $to, string $subject, string $body, ?string $replyTo = null): void
    {
        $secure = $this->secure === 'auto' ? ($this->port === 465 ? 'ssl' : 'tls') : $this->secure;
        $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true]]);
        $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $this->host . ':' . $this->port;
        $this->sock = @stream_socket_client($remote, $errno, $errstr, $this->timeout, STREAM_CLIENT_CONNECT, $ctx);
        if (!$this->sock) {
            throw new RuntimeException("SMTP connect failed: $errstr ($errno)");
        }
        stream_set_timeout($this->sock, $this->timeout);

        try {
            $this->expect(220);
            $ehloHost = preg_replace('/[^A-Za-z0-9.\-]/', '', $_SERVER['SERVER_NAME'] ?? 'localhost') ?: 'localhost';
            $this->cmd("EHLO $ehloHost", 250);
            if ($secure === 'tls') {
                $this->cmd('STARTTLS', 220);
                if (!stream_socket_enable_crypto($this->sock, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                    throw new RuntimeException('SMTP STARTTLS failed');
                }
                $this->cmd("EHLO $ehloHost", 250);
            }
            $this->cmd('AUTH LOGIN', 334);
            $this->cmd(base64_encode($this->user), 334);
            $this->cmd(base64_encode($this->pass), 235);
            $this->cmd('MAIL FROM:<' . self::addr($fromEmail) . '>', 250);
            $this->cmd('RCPT TO:<' . self::addr($to) . '>', [250, 251]);
            $this->cmd('DATA', 354);

            $headers = [
                'Date: ' . date(DATE_RFC2822),
                'From: ' . self::encodeHeader($fromName) . ' <' . self::addr($fromEmail) . '>',
                'To: <' . self::addr($to) . '>',
                'Subject: ' . self::encodeHeader($subject),
                'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . (explode('@', self::addr($fromEmail))[1] ?? 'localhost') . '>',
                'MIME-Version: 1.0',
                'Content-Type: text/plain; charset=UTF-8',
                'Content-Transfer-Encoding: base64',
            ];
            if ($replyTo) {
                $headers[] = 'Reply-To: <' . self::addr($replyTo) . '>';
            }
            $data = implode("\r\n", $headers) . "\r\n\r\n" . rtrim(chunk_split(base64_encode(preg_replace('/\r?\n/', "\r\n", $body)), 76, "\r\n")) . "\r\n.";
            $this->cmd($data, 250);
            $this->cmd('QUIT', 221);
        } finally {
            if ($this->sock) {
                fclose($this->sock);
                $this->sock = null;
            }
        }
    }

    /** Header values never contain CR/LF, so a visitor can't add headers. */
    private static function addr(string $email): string
    {
        $email = trim(str_replace(["\r", "\n", '<', '>'], '', $email));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Invalid email address');
        }
        return $email;
    }

    private static function encodeHeader(string $s): string
    {
        $s = trim(str_replace(["\r", "\n"], ' ', $s));
        return preg_match('/[^\x20-\x7E]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
    }

    private function cmd(string $line, $expect): string
    {
        fwrite($this->sock, $line . "\r\n");
        return $this->expect($expect);
    }

    private function expect($codes): string
    {
        $codes = (array) $codes;
        $resp = '';
        while (($line = fgets($this->sock, 1024)) !== false) {
            $resp .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        $code = (int) substr($resp, 0, 3);
        if (!in_array($code, $codes, true)) {
            throw new RuntimeException('SMTP unexpected reply: ' . trim($resp));
        }
        return $resp;
    }
}
