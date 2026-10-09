# HABSCO Real Video Studio — VPS installation

This replaces the browser-only short animation with server-side MP4 rendering from actual uploaded video clips, generated spoken narration, and a soundtrack. It renders 720p H.264/AAC MP4 files at a minimum of 1,800 seconds (30 minutes). It does not invent real-world footage: an administrator must upload footage and music that HABSCO is permitted to publish.

## 1. Copy files to the VPS

From an SSH shell on the HABSCO Ubuntu 24.04 VPS, run these commands. They deploy only the video-studio files; do not pull or reset the whole website repository.

```bash
install -d -m 0755 /opt/habsco-video-studio /var/lib/habsco-video-studio /var/www/habsco-site/generated-videos /etc/habsco
cp /var/www/habsco-site/video-studio-api.py /opt/habsco-video-studio/video-studio-api.py
cp /var/www/habsco-site/video-studio-requirements.txt /opt/habsco-video-studio/requirements.txt
cp /var/www/habsco-site/habsco-video-studio.service /etc/systemd/system/habsco-video-studio.service
apt-get update
apt-get install -y ffmpeg python3-venv python3-pip
python3 -m venv /opt/habsco-video-studio/venv
/opt/habsco-video-studio/venv/bin/pip install --upgrade pip
/opt/habsco-video-studio/venv/bin/pip install -r /opt/habsco-video-studio/requirements.txt
```

## 2. Configure a private admin token

Generate a long random token and save it in the environment file. Do not put the token into HTML or commit it to GitHub.

```bash
TOKEN="$(openssl rand -hex 32)"
printf 'HABSCO_VIDEO_TOKEN=%s\nHABSCO_VIDEO_PORT=8790\nHABSCO_VIDEO_VOICE=en-NG-AbeoNeural\n' "$TOKEN" > /etc/habsco/video-studio.env
chmod 600 /etc/habsco/video-studio.env
chown root:root /etc/habsco/video-studio.env
chown -R www-data:www-data /var/lib/habsco-video-studio /var/www/habsco-site/generated-videos
chmod 750 /var/lib/habsco-video-studio
chmod 750 /var/www/habsco-site/generated-videos
systemctl daemon-reload
systemctl enable --now habsco-video-studio
systemctl status habsco-video-studio --no-pager
curl -fsS http://127.0.0.1:8790/health
```

Keep the value of `TOKEN` private. Enter it only in the Video Studio's Admin rendering token field. If you lose it, create a new value in `/etc/habsco/video-studio.env` and restart the service.

## 3. Add an Nginx route

In the active HTTPS server block for `www.habscosadaqah.org` (and the main domain if it uses a separate block), add this location before any generic catch-all location:

```nginx
location /api/video-studio/ {
    proxy_pass http://127.0.0.1:8790/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    client_max_body_size 2g;
    proxy_request_buffering off;
}
```

This maps `/api/video-studio/api/generate` to the service's `/api/generate` endpoint. The health endpoint remains private on `127.0.0.1:8790/health`.

Validate the exact active Nginx file before reloading:

```bash
nginx -t && systemctl reload nginx
curl -fsS http://127.0.0.1:8790/health
journalctl -u habsco-video-studio -n 80 --no-pager
```

## 4. Create a video

1. Open `https://www.habscosadaqah.org/video-studio.html`.
2. Enter a title and a complete original narration. Use a long enough script to produce a full-length spoken story.
3. Upload one or more real video clips and a soundtrack/ambience track that HABSCO is licensed to publish. Use several different clips; short source footage is repeated to fill the 30-minute timeline.
4. Enter the private token and select **Generate 30-minute MP4**.
5. Keep the page open while the server generates narration, normalizes footage and encodes the MP4. Use the download button when finished.

## Operational notes

- This is server-side rendering, not a guarantee of Hollywood-style AI-generated footage. It uses real uploaded footage plus synthesized narration and uploaded music.
- The service uses external speech synthesis and needs outbound internet access. A voice or service outage will cause a visible failure instead of a silent/fake narration.
- A 30-minute render consumes CPU, disk, bandwidth and time. Start with a modest number of source clips and monitor `journalctl -u habsco-video-studio -f` and free disk space.
- The current implementation keeps job status in memory, so a service restart loses status for active jobs. Do not restart during a render.
- Generated MP4s are saved under `/var/www/habsco-site/generated-videos/`. Set a retention policy and periodically remove old files to protect disk space.
- The API is protected by the admin token; do not expose port 8790 publicly. Nginx must proxy it only over localhost.
