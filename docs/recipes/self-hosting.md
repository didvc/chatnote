# Self-Hosting

## Build for production

```bash
npm run build
npm run db:push   # creates data/chatnote.db if not present
```

## Run with systemd

Create `/etc/systemd/system/chatnote.service`:

```ini
[Unit]
Description=chatnote
After=network.target

[Service]
Type=simple
User=chatnote
WorkingDirectory=/opt/chatnote
ExecStart=/usr/bin/node dist/server/entry.mjs
Restart=on-failure
Environment=PORT=4321
Environment=CHATNOTE_CONFIG=/opt/chatnote/config.toml

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now chatnote
```

## Reverse proxy (Apache2)

Apache 2.0 license, but also an HTTP server — here's the reverse proxy config:

```apache
<VirtualHost *:443>
    ServerName notes.example.com

    ProxyPreserveHost On
    ProxyPass        / http://127.0.0.1:4321/
    ProxyPassReverse / http://127.0.0.1:4321/

    # Required for sendBeacon (incognito clear) to work
    ProxyPassMatch ^/api/ http://127.0.0.1:4321/api/

    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/notes.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/notes.example.com/privkey.pem
</VirtualHost>
```

## Reverse proxy (nginx)

```nginx
server {
    listen 443 ssl;
    server_name notes.example.com;

    location / {
        proxy_pass         http://127.0.0.1:4321;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
```

## Backup

```bash
cp data/chatnote.db data/chatnote.db.bak
tar czf uploads-$(date +%F).tar.gz data/uploads/
```

SQLite is a single file. Copy it while the server is idle, or use `.backup` via sqlite3 CLI for a hot backup.
