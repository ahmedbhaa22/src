<?php
/* ============================================================
   SolidReach — package and "Get a Call" request endpoint
   POST /api/lead.php (JSON) → emails the request to the team.
   type "call" = Get a Call popup (first/last name, email, phone);
   anything else = package request from a pricing card.

   Protection, in order:
   - POST only, JSON only, body ≤ 16 KB
   - Origin/Referer must be one of ALLOWED_HOSTS
   - Honeypot field + minimum time on the form (bots)
   - Rate limits: per IP per hour/day, and a site-wide daily cap
   - Every field validated, trimmed and length-capped
   - Plain-text email; header values stripped of CR/LF
   Secrets live in config.php, which the deploy writes on the
   server from GitHub secrets. It is never committed.
   ============================================================ */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');

function out(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

/* ---------- config ---------- */
$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) {
    out(503, ['ok' => false, 'error' => 'not_configured']);
}
$cfg = require $cfgFile;
foreach (['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'lead_to'] as $k) {
    if (empty($cfg[$k])) {
        out(503, ['ok' => false, 'error' => 'not_configured']);
    }
}
$allowedHosts = $cfg['allowed_hosts'] ?? ['solidreachco.com', 'www.solidreachco.com'];
$limits = ($cfg['limits'] ?? []) + ['per_ip_hour' => 5, 'per_ip_day' => 15, 'site_day' => 200, 'min_seconds' => 3];
$dataDir = $cfg['data_dir'] ?? (__DIR__ . '/.data');

/* ---------- request shape ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    out(405, ['ok' => false, 'error' => 'method']);
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    out(415, ['ok' => false, 'error' => 'type']);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
if ($originHost === '' || !in_array($originHost, $allowedHosts, true)) {
    out(403, ['ok' => false, 'error' => 'origin']);
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if ($raw === false || strlen($raw) > 16384) {
    out(413, ['ok' => false, 'error' => 'size']);
}
$in = json_decode($raw, true);
if (!is_array($in)) {
    out(400, ['ok' => false, 'error' => 'json']);
}

/* ---------- bot checks (answer "ok" so bots learn nothing) ---------- */
if (trim((string) ($in['website'] ?? '')) !== '') {
    out(200, ['ok' => true]);
}
$elapsed = (int) ($in['elapsed'] ?? 0); // ms the form was open
if ($elapsed < $limits['min_seconds'] * 1000) {
    out(200, ['ok' => true]);
}

/* ---------- validation ---------- */
function str($v, int $max, bool $required = false, int $min = 0): ?string
{
    if (!is_string($v)) {
        return $required ? null : '';
    }
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '');
    $len = mb_strlen($v);
    if (($required && $len < max(1, $min)) || $len > $max) {
        return null;
    }
    return $v;
}
function oneLine(string $s): string
{
    return trim(preg_replace('/\s+/u', ' ', $s) ?? '');
}
function list_of($v, int $maxItems, int $maxLen): ?array
{
    if ($v === null) {
        return [];
    }
    if (!is_array($v) || count($v) > $maxItems) {
        return null;
    }
    $out = [];
    foreach ($v as $item) {
        $s = str($item, $maxLen, true);
        if ($s === null) {
            return null;
        }
        $out[] = oneLine($s);
    }
    return $out;
}

$isCall = ($in['type'] ?? '') === 'call';
if ($isCall) {
    /* "Get a Call" popup: just a name, email and phone */
    $f = [
        'first_name' => str($in['first_name'] ?? null, 60, true),
        'last_name'  => str($in['last_name'] ?? null, 60, true),
        'email'      => str($in['email'] ?? null, 254, true),
        'phone'      => str($in['phone'] ?? null, 30, true),
    ];
} else {
    $f = [
        'package'  => str($in['package'] ?? null, 120, true),
        'price'    => str($in['price'] ?? '', 40),
        'solution' => str($in['solution'] ?? '', 120),
        'needs'    => list_of($in['needs'] ?? [], 12, 60),
        'industry' => str($in['industry'] ?? '', 40),
        'name'     => str($in['name'] ?? null, 100, true, 2),
        'company'  => str($in['company'] ?? '', 120),
        'email'    => str($in['email'] ?? null, 254, true),
        'phone'    => str($in['phone'] ?? null, 30, true),
        'notes'    => str($in['notes'] ?? '', 2000),
    ];
}
$bad = array_keys(array_filter($f, fn($v) => $v === null));
if (!$bad) {
    if (!filter_var($f['email'], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $f['email'])) {
        $bad[] = 'email';
    }
    $digits = preg_replace('/\D/', '', $f['phone']);
    if (!preg_match('/^[0-9+().\-\s]+$/', $f['phone']) || strlen($digits) < 7 || strlen($digits) > 15) {
        $bad[] = 'phone';
    }
}
if ($bad) {
    out(422, ['ok' => false, 'error' => 'invalid', 'fields' => array_values(array_unique($bad))]);
}
foreach ($f as $k => $v) {
    if (is_string($v) && $k !== 'notes') {
        $f[$k] = oneLine($v);
    }
}

/* ---------- rate limits (small JSON files, locked) ---------- */
if (!is_dir($dataDir) && !@mkdir($dataDir, 0700, true)) {
    out(500, ['ok' => false, 'error' => 'server']);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$now = time();
$fp = fopen($dataDir . '/ratelimit.json', 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    out(500, ['ok' => false, 'error' => 'server']);
}
$rl = json_decode(stream_get_contents($fp) ?: '{}', true) ?: [];
$ipKey = hash('sha256', $ip . '|' . ($cfg['smtp_user'] ?? '')); // never store raw IPs
foreach ($rl as $k => $times) {
    $rl[$k] = array_values(array_filter((array) $times, fn($t) => $t > $now - 86400));
    if (!$rl[$k]) {
        unset($rl[$k]);
    }
}
$mine = $rl[$ipKey] ?? [];
$site = $rl['_site'] ?? [];
$lastHour = count(array_filter($mine, fn($t) => $t > $now - 3600));
$tooMany = $lastHour >= $limits['per_ip_hour'] || count($mine) >= $limits['per_ip_day'] || count($site) >= $limits['site_day'];
if (!$tooMany) {
    $rl[$ipKey] = array_merge($mine, [$now]);
    $rl['_site'] = array_merge($site, [$now]);
}
ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($rl));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);
if ($tooMany) {
    header('Retry-After: 3600');
    out(429, ['ok' => false, 'error' => 'rate']);
}

/* ---------- email ---------- */
if ($isCall) {
    $fullName = $f['first_name'] . ' ' . $f['last_name'];
    $subject = 'Call request: ' . $fullName;
    $lines = [
        'New "Get a Call" request from solidreachco.com',
        '',
        'First name: ' . $f['first_name'],
        'Last name:  ' . $f['last_name'],
        'Email:      ' . $f['email'],
        'Phone:      ' . $f['phone'],
        '',
        'Sent ' . gmdate('Y-m-d H:i') . ' UTC',
    ];
} else {
    $subject = 'Package request: ' . $f['package'] . ' — ' . $f['name'];
    $lines = [
        'New package request from solidreachco.com',
        '',
        'Package:   ' . $f['package'] . ($f['price'] !== '' ? ' (' . $f['price'] . ')' : ''),
        'Solution:  ' . ($f['solution'] ?: '-'),
        'Needs:     ' . ($f['needs'] ? implode(', ', $f['needs']) : '-'),
    ];
    if ($f['industry'] !== '') {
        $lines[] = 'Industry:  ' . $f['industry'];
    }
    array_push(
        $lines,
        '',
        'Name:      ' . $f['name'],
        'Company:   ' . ($f['company'] ?: '-'),
        'Email:     ' . $f['email'],
        'Phone:     ' . $f['phone'],
        '',
        'Notes:',
        $f['notes'] !== '' ? $f['notes'] : '-',
        '',
        'Sent ' . gmdate('Y-m-d H:i') . ' UTC'
    );
}

require __DIR__ . '/smtp.php';
try {
    $mailer = new SmtpMailer(
        (string) $cfg['smtp_host'],
        (int) $cfg['smtp_port'],
        (string) $cfg['smtp_user'],
        (string) $cfg['smtp_pass'],
        (string) ($cfg['smtp_secure'] ?? 'auto')
    );
    $mailer->send(
        (string) ($cfg['from_email'] ?? $cfg['smtp_user']),
        'SolidReach Website',
        (string) $cfg['lead_to'],
        $subject,
        implode("\n", $lines),
        $f['email']
    );
} catch (Throwable $e) {
    error_log('[lead] send failed: ' . $e->getMessage());
    out(502, ['ok' => false, 'error' => 'send']);
}

out(200, ['ok' => true]);
