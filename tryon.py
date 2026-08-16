#!/usr/bin/env python3
"""
tryon.py — one command to put the Schuggies-Ceilidhs preview online.

Run from this folder:   python3 tryon.py

It handles all three things that must stay ON:
  1) the web server   (serves ./website on port 8177)
  2) the Cloudflare tunnel  (cloudflared tunnel run jw  ->  schuggies.caitryapps.com)
  3) the Mac staying awake   (caffeinate, so sleep can't kill the link)

Auto-restarts the tunnel if it drops. Ctrl+C stops everything cleanly.
Stdlib only — no pip installs. Needs `cloudflared` installed (it already is).
"""

import functools
import http.server
import os
import shutil
import signal
import socket
import socketserver
import subprocess
import sys
import threading
import time

# ---- Config -------------------------------------------------------------
PORT        = 8177
TUNNEL_NAME = "jw"
PUBLIC_URL  = "https://schuggies.caitryapps.com"
HERE        = os.path.dirname(os.path.abspath(__file__))


def _find_site_dir():
    """Locate the folder that holds index.html, wherever tryon.py is run from."""
    candidates = [
        os.path.join(HERE, "website"),   # tryon.py in parent, site in ./website
        HERE,                            # tryon.py inside the site folder itself
    ]
    for c in candidates:
        if os.path.isfile(os.path.join(c, "index.html")):
            return c
    # last resort: scan one level down for any folder with index.html
    for name in sorted(os.listdir(HERE)):
        sub = os.path.join(HERE, name)
        if os.path.isdir(sub) and os.path.isfile(os.path.join(sub, "index.html")):
            return sub
    return os.path.join(HERE, "website")


SITE_DIR = _find_site_dir()
# -------------------------------------------------------------------------

children = []          # subprocesses we own (cloudflared, caffeinate)
httpd    = None
_stop    = threading.Event()


def log(msg):
    print(f"  {msg}", flush=True)


def port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def kill_stale():
    """Free port 8177 and stop any tunnel we started before, so this is the single owner."""
    me = os.getpid()

    # 1) kill whatever is actually LISTENING on the port (any server, incl. another tryon.py)
    try:
        out = subprocess.run(["lsof", "-ti", f"tcp:{PORT}"],
                             capture_output=True, text=True).stdout
        for pid in out.split():
            if pid and int(pid) != me:
                subprocess.run(["kill", "-9", pid],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    # 2) stop any tunnel / manual CLI server we may have started before
    for pattern in (f"http.server {PORT}", f"cloudflared tunnel run {TUNNEL_NAME}"):
        subprocess.run(["pkill", "-f", pattern],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # wait until the port is genuinely free (up to ~5s)
    for _ in range(10):
        if not port_in_use(PORT):
            break
        time.sleep(0.5)


def start_web_server():
    global httpd
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=SITE_DIR)

    class Quiet(handler.func):           # silence logging + stop CDN/browser caching
        def log_message(self, *a):
            pass

        def end_headers(self):
            # no-store tells Cloudflare (Standard cache) and the browser not to
            # cache, so every edit is live immediately during the preview.
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            super().end_headers()

    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(("0.0.0.0", PORT),
                                            functools.partial(Quiet, directory=SITE_DIR))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    log(f"web server  ->  serving {SITE_DIR}  on  http://localhost:{PORT}")


def start_caffeinate():
    if sys.platform != "darwin" or not shutil.which("caffeinate"):
        log("caffeinate  ->  skipped (not macOS)")
        return
    p = subprocess.Popen(["caffeinate", "-dimsu"],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    children.append(p)
    log("caffeinate  ->  Mac will stay awake while this runs")


def run_tunnel_forever():
    """Run cloudflared; if it exits while we're still up, restart it with backoff."""
    backoff = 2
    while not _stop.is_set():
        log(f"tunnel      ->  starting 'cloudflared tunnel run {TUNNEL_NAME}'")
        p = subprocess.Popen(["cloudflared", "tunnel", "run", TUNNEL_NAME],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        children.append(p)
        p.wait()
        if _stop.is_set():
            break
        log(f"tunnel      ->  dropped (exit {p.returncode}). Restarting in {backoff}s…")
        _stop.wait(backoff)
        backoff = min(backoff * 2, 30)     # back off up to 30s, then keep trying


def health_loop():
    while not _stop.wait(60):
        ok = port_in_use(PORT)
        stamp = time.strftime("%H:%M:%S")
        log(f"[{stamp}] health  ->  web {'UP' if ok else 'DOWN'} · {PUBLIC_URL}")


def shutdown(*_):
    if _stop.is_set():
        return
    print("\n  Shutting down…", flush=True)
    _stop.set()
    if httpd:
        httpd.shutdown()
    for p in children:
        try:
            p.terminate()
        except Exception:
            pass
    log("stopped. The public link is now offline.")
    os._exit(0)


def main():
    if not os.path.isdir(SITE_DIR):
        sys.exit(f"ERROR: can't find the site folder at {SITE_DIR}")
    if not shutil.which("cloudflared"):
        sys.exit("ERROR: cloudflared is not installed. Run: brew install cloudflared")

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    print("=" * 60)
    print("  Schuggies-Ceilidhs — preview launcher")
    print("=" * 60)

    if port_in_use(PORT):
        log(f"port {PORT} busy — clearing old server/tunnel first…")
    kill_stale()

    start_web_server()
    start_caffeinate()
    threading.Thread(target=run_tunnel_forever, daemon=True).start()
    threading.Thread(target=health_loop, daemon=True).start()

    time.sleep(4)
    print("-" * 60)
    print(f"  LIVE:  {PUBLIC_URL}")
    print("  Send that link to the client. Leave this window open.")
    print("  Press Ctrl+C here to take it offline.")
    print("-" * 60)

    while True:
        time.sleep(3600)


if __name__ == "__main__":
    main()
