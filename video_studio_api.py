#!/usr/bin/env python3
"""HABSCO Video Studio API: real uploaded footage + generated narration + licensed music."""
import asyncio, json, os, re, shutil, subprocess, threading, uuid
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, abort
import edge_tts

BASE = Path(os.environ.get("HABSCO_VIDEO_HOME", "/var/lib/habsco-video-studio"))
OUTPUT = Path(os.environ.get("HABSCO_VIDEO_OUTPUT", "/var/lib/habsco-video-studio/output"))
TOKEN = os.environ.get("HABSCO_VIDEO_TOKEN", "")
VOICE = os.environ.get("HABSCO_VIDEO_VOICE", "en-NG-AbeoNeural")
MIN_SECONDS = 1800
MAX_UPLOAD = 2 * 1024 * 1024 * 1024
ALLOWED_VIDEO = {".mp4", ".mov", ".m4v", ".webm", ".mkv"}
ALLOWED_AUDIO = {".mp3", ".wav", ".m4a", ".aac", ".ogg"}
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD
BASE.mkdir(parents=True, exist_ok=True)
OUTPUT.mkdir(parents=True, exist_ok=True)
jobs = {}
lock = threading.Lock()

def authorized():
    supplied = request.headers.get("X-Habsco-Video-Token", "")
    return bool(TOKEN) and supplied and supplied == TOKEN

def run(cmd, **kwargs):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kwargs)
    if p.returncode:
        raise RuntimeError((p.stderr or p.stdout or "Media processing failed")[-2500:])
    return p.stdout

def save_upload(fs, target, allowed):
    ext = Path(fs.filename or "").suffix.lower()
    if ext not in allowed:
        raise ValueError("Unsupported file type: " + (ext or "(no extension)"))
    fs.save(target)
    if target.stat().st_size == 0:
        raise ValueError("An uploaded media file was empty.")
    return target

async def make_tts(text, path, workdir):
    # Split long scripts into manageable sections because hosted TTS endpoints limit request size.
    # The resulting parts are concatenated into one continuous spoken narration track.
    import re
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks, current = [], ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(sentence) > 2600:
            for start in range(0, len(sentence), 2400):
                part = sentence[start:start + 2400]
                if current:
                    chunks.append(current)
                    current = ""
                chunks.append(part)
            continue
        if len(current) + len(sentence) + 1 > 2600:
            chunks.append(current)
            current = sentence
        else:
            current = (current + " " + sentence).strip()
    if current:
        chunks.append(current)
    if not chunks:
        raise RuntimeError("The narration script is empty.")
    files = []
    for index, chunk in enumerate(chunks, 1):
        part = workdir / f"voice-part-{index:03d}.mp3"
        communicate = edge_tts.Communicate(chunk, VOICE, rate="+0%")
        await communicate.save(str(part))
        if not part.exists() or part.stat().st_size < 100:
            raise RuntimeError(f"Speech synthesis failed at narration part {index}.")
        files.append(part)
    listing = workdir / "voice-parts.txt"
    listing.write_text("\n".join("file '" + str(p) + "'" for p in files) + "\n", encoding="utf-8")
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing), "-c:a", "libmp3lame", "-q:a", "3", str(path)])

def make_ambient_bed(path):
    # Generate a gentle, synthetic ambience locally with FFmpeg; no stock-music API.
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
         "-f", "lavfi", "-i",
         "anoisesrc=color=pink:sample_rate=44100:amplitude=0.025:duration=1800",
         "-af", "lowpass=f=650,highpass=f=100,volume=0.28,afade=t=in:st=0:d=4",
         "-c:a", "aac", "-b:a", "96k", str(path)])

def worker(job_id, title, script, clips, music, workdir):
    try:
        with lock:
            jobs[job_id]["status"] = "processing"
            jobs[job_id]["message"] = "Preparing narration and real footage…"
        narration = workdir / "narration.mp3"
        if music is None:
            with lock:
                jobs[job_id]["message"] = "Creating a quiet ambient audio bed locally…"
            music = workdir / "generated-ambient.m4a"
            make_ambient_bed(music)
        asyncio.run(make_tts(script, narration, workdir))
        if not narration.exists() or narration.stat().st_size < 1000:
            raise RuntimeError("Narration audio could not be generated. Check the server's internet connection and TTS service.")
        speech_seconds = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(narration)]).strip() or "0")
        if speech_seconds < 1740:
            raise RuntimeError(f"The generated narration is only {int(speech_seconds // 60)} minutes long. Add more script text until the voice track reaches at least 29 minutes, then render again.")
        normalized = []
        for idx, clip in enumerate(clips, 1):
            out = workdir / f"clip-{idx:03d}.mp4"
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(clip),
                 "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=25,setsar=1",
                 "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
                 "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)])
            normalized.append(out)
            with lock:
                jobs[job_id]["message"] = f"Preparing footage {idx} of {len(clips)}…"
        # Build a real-footage playlist at least 30 minutes long. If supplied footage is shorter,
        # it is repeated; the interface warns the publisher to upload varied, licensed footage.
        playlist = workdir / "playlist.txt"
        lines, seconds, i = [], 0.0, 0
        durations = []
        for clip in normalized:
            raw = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(clip)]).strip()
            durations.append(max(1.0, float(raw or "1")))
        while seconds < MIN_SECONDS:
            clip = normalized[i % len(normalized)]
            lines.append("file '" + str(clip).replace("'", "'\\''") + "'")
            seconds += durations[i % len(durations)]
            i += 1
            if i > 20000:
                raise RuntimeError("Too many footage segments. Upload longer footage.")
        playlist.write_text("\n".join(lines) + "\n", encoding="utf-8")
        final = OUTPUT / (job_id + ".mp4")
        with lock:
            jobs[job_id]["message"] = "Rendering a minimum 30-minute MP4 with spoken narration and soundtrack…"
        # Music is looped as a bed; speech is kept clear and prioritized.
        run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "concat", "-safe", "0", "-i", str(playlist),
             "-i", str(narration), "-stream_loop", "-1", "-i", str(music),
             "-filter_complex", "[1:a]volume=1.0[voice];[2:a]volume=0.16[music];[voice][music]amix=inputs=2:duration=longest:dropout_transition=3,alimiter=limit=0.95[a]",
             "-map", "0:v:0", "-map", "[a]", "-t", str(MIN_SECONDS),
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "25", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
             "-metadata", "title=" + title[:120], "-metadata", "artist=HABSCO Sadaqah Jariyah Development Trust",
             str(final)])
        size = final.stat().st_size
        with lock:
            jobs[job_id].update(status="complete", message="Your MP4 is ready.", download="/generated-videos/" + final.name, bytes=size, title=title)
    except Exception as exc:
        with lock:
            jobs[job_id].update(status="failed", message=str(exc)[:1800])
    finally:
        shutil.rmtree(workdir, ignore_errors=True)

@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "habsco-video-studio"})

@app.post("/api/generate")
def generate():
    if not authorized():
        return jsonify({"error": "Admin video token is missing or invalid."}), 401
    title = (request.form.get("title") or "HABSCO Story").strip()[:120]
    script = (request.form.get("script") or "").strip()
    words = re.findall(r"\b[\w’'-]+\b", script)
    if len(words) < 4500:
        return jsonify({"error": f"The narration needs at least 4,500 words for a full-length spoken story. Current count: {len(words)}."}), 400
    videos = request.files.getlist("footage")
    if not videos:
        return jsonify({"error": "Upload at least one real, licensed video clip."}), 400
    job_id = uuid.uuid4().hex
    workdir = BASE / job_id
    workdir.mkdir(parents=True, exist_ok=False)
    try:
        clips = []
        for n, fs in enumerate(videos, 1):
            clips.append(save_upload(fs, workdir / f"source-{n:03d}{Path(fs.filename or '').suffix.lower()}", ALLOWED_VIDEO))
        music = None
        music_file = request.files.get("music")
        if music_file and music_file.filename:
            music = save_upload(music_file, workdir / ("music" + Path(music_file.filename or "").suffix.lower()), ALLOWED_AUDIO)
        with lock:
            jobs[job_id] = {"status": "queued", "message": "Queued for rendering.", "title": title, "words": len(words), "download_key": uuid.uuid4().hex}
        thread = threading.Thread(target=worker, args=(job_id, title, script, clips, music, workdir), daemon=True)
        thread.start()
        return jsonify({"job_id": job_id, "status": "queued", "words": len(words)}), 202
    except Exception as exc:
        shutil.rmtree(workdir, ignore_errors=True)
        return jsonify({"error": str(exc)}), 400

@app.get("/api/jobs/<job_id>")
def job_status(job_id):
    if not authorized():
        return jsonify({"error": "Admin video token is missing or invalid."}), 401
    with lock:
        item = jobs.get(job_id)
    if not item:
        return jsonify({"error": "Job not found on this server. Jobs are kept in memory while the service is running."}), 404
    return jsonify(item)

@app.get("/api/download/<filename>")
def download(filename):
    if not re.fullmatch(r"[a-f0-9]{32}\.mp4", filename):
        abort(404)
    job_id = filename[:-4]
    with lock:
        item = jobs.get(job_id)
    key = request.args.get("key", "")
    keyed_download = bool(item and key and key == item.get("download_key") and item.get("status") == "complete")
    if not authorized() and not keyed_download:
        abort(401)
    if not (OUTPUT / filename).is_file():
        abort(404)
    return send_from_directory(OUTPUT, filename, as_attachment=True, download_name="HABSCO-video-" + filename)

if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("Set HABSCO_VIDEO_TOKEN to a long random secret before starting.")
    app.run(host="127.0.0.1", port=int(os.environ.get("HABSCO_VIDEO_PORT", "8790")))
