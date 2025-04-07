import subprocess
import sys
import os
import time
import webbrowser
from threading import Thread

def run_backend():
    """Run the FastAPI backend server"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    subprocess.run([sys.executable, '-m', 'app.main'], cwd=backend_dir)

def run_frontend():
    """Run the frontend server"""
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    subprocess.run([sys.executable, 'server.py'], cwd=frontend_dir)

def main():
    print("Starting MoodScape application...")
    
    # Start backend server in a separate thread
    backend_thread = Thread(target=run_backend)
    backend_thread.daemon = True
    backend_thread.start()
    
    # Wait for backend to start
    time.sleep(2)
    
    # Start frontend server in a separate thread
    frontend_thread = Thread(target=run_frontend)
    frontend_thread.daemon = True
    frontend_thread.start()
    
    # Wait for frontend to start
    time.sleep(2)
    
    # Open the application in the default browser
    webbrowser.open('http://localhost:5003')
    
    print("\nMoodScape is running!")
    print("Backend API: http://localhost:5002")
    print("Frontend: http://localhost:5003")
    print("\nPress Ctrl+C to stop the application...")
    
    try:
        # Keep the main thread running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down MoodScape...")
        sys.exit(0)

if __name__ == "__main__":
    main() 