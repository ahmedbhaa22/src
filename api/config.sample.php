<?php
/* Example only. The real api/config.php is written on the server by the
   deploy workflow from GitHub secrets (SMTP_HOST, SMTP_PORT, SMTP_USER,
   SMTP_PASS, LEAD_TO). Never commit real values. */
return [
    'smtp_host'   => 'mail.example.com',
    'smtp_port'   => 465,          // 465 = SSL, 587 = STARTTLS
    'smtp_secure' => 'auto',       // 'ssl', 'tls' or 'auto' (by port)
    'smtp_user'   => 'website@example.com',
    'smtp_pass'   => 'change-me',
    'from_email'  => 'website@example.com',
    'lead_to'     => 'info@example.com',
    'allowed_hosts' => ['solidreachco.com', 'www.solidreachco.com'],
    'limits' => ['per_ip_hour' => 5, 'per_ip_day' => 15, 'site_day' => 200, 'min_seconds' => 3],
];
