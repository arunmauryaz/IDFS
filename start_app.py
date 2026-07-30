import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def main():
    print("=" * 65)
    print(" INSTAGRAM INFLUENCER TRACKER - SAAS DESKTOP APPLICATION ")
    print("=" * 65)

    backend_dir = BASE_DIR / "backend"
    frontend_dir = BASE_DIR / "frontend"

    # Start FastAPI Backend
    print("[1/2] Starting FastAPI Backend server on http://localhost:8000...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=str(backend_dir)
    )

    time.sleep(2.5)

    # Start Frontend Dev Server
    print("[2/2] Starting React Vite Frontend server on http://localhost:5173...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--port", "5173"],
        cwd=str(frontend_dir),
        shell=(os.name == "nt")
    )

    time.sleep(2)
    print("\n[SUCCESS] Application initialized successfully!")
    print("Dashboard URL: http://localhost:5173")
    print("Backend Docs:  http://localhost:8000/docs")
    print("\nPress Ctrl+C to terminate both servers cleanly.")

    try:
        webbrowser.open("http://localhost:5173")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping processes...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
