#!/usr/bin/env python3
import subprocess
import sys
import os
import time
import webbrowser
import signal
import platform
import shutil
from threading import Thread

# Store all processes for proper cleanup
processes = []

def run_cmd(cmd, cwd=None, shell=False):
    """Run a command and return the process object"""
    if platform.system() == 'Windows':
        # Use shell=True on Windows for better compatibility
        process = subprocess.Popen(
            cmd,
            cwd=cwd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE  # New console window for each process
        )
    else:
        # On Unix systems
        process = subprocess.Popen(
            cmd,
            cwd=cwd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
    
    processes.append(process)
    return process

def log_output(process, app_name):
    """Continuously read and log process output"""
    for line in process.stdout:
        print(f"[{app_name}] {line.strip()}")

def run_empathy_soul():
    """Run the Empathy Soul main website"""
    print("Starting Empathy Soul website...")
    app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'empathy-soul')
    cmd = [sys.executable, "app.py"]
    process = run_cmd(cmd, cwd=app_dir)
    Thread(target=log_output, args=(process, "Empathy Soul")).start()
    return process

def run_kdc_chatbot():
    """Run the KDC Chatbot backend and frontend"""
    print("Starting KDC Chatbot backend...")
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kdc', 'project')
    backend_cmd = [sys.executable, "app.py"]
    backend_process = run_cmd(backend_cmd, cwd=backend_dir)
    Thread(target=log_output, args=(backend_process, "KDC Chatbot Backend")).start()
    
    # Wait for backend to start
    time.sleep(2)
    
    # Start the frontend (Vite development server)
    print("Starting KDC Chatbot frontend...")
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kdc', 'project', 'frontend')
    
    # Check if npm is installed
    npm_cmd = "where npm" if platform.system() == 'Windows' else "which npm"
    try:
        result = subprocess.run(npm_cmd, shell=True, capture_output=True, text=True)
        npm_exists = result.returncode == 0
    except:
        npm_exists = False
    
    if npm_exists:
        # First make sure dependencies are installed
        install_cmd = "npm install"
        install_process = run_cmd(install_cmd, cwd=frontend_dir, shell=True)
        install_process.wait()  # Wait for install to complete
        
        # Then start the development server
        if platform.system() == 'Windows':
            frontend_cmd = "npm run dev"
        else:
            frontend_cmd = ["npm", "run", "dev"]
        
        frontend_process = run_cmd(frontend_cmd, cwd=frontend_dir, shell=(platform.system() == 'Windows'))
        Thread(target=log_output, args=(frontend_process, "KDC Chatbot Frontend")).start()
        return backend_process, frontend_process
    else:
        print("WARNING: npm not found. KDC chatbot frontend will not be started.")
        return backend_process

def run_meditation_app():
    """Run the Meditation App"""
    print("Starting Meditation App...")
    app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'meditation-app')
    
    # For the meditation app, we'll use a simple HTTP server since it's static HTML/JS
    cmd = [sys.executable, "-m", "http.server", "8080"]
    process = run_cmd(cmd, cwd=app_dir)
    Thread(target=log_output, args=(process, "Meditation App")).start()
    
    # Copy meditation app files to static folder
    try:
        empathy_static = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'empathy-soul', 'src', 'static', 'meditation')
        os.makedirs(empathy_static, exist_ok=True)
        
        # Copy key files to static folder
        for file in ['index.html', 'css', 'js', 'images', 'sounds']:
            src_path = os.path.join(app_dir, file)
            dst_path = os.path.join(empathy_static, file)
            if os.path.isdir(src_path):
                if os.path.exists(dst_path):
                    shutil.rmtree(dst_path)
                shutil.copytree(src_path, dst_path)
            elif os.path.isfile(src_path):
                shutil.copy2(src_path, dst_path)
    except Exception as e:
        print(f"Warning: Failed to copy meditation files: {e}")
    
    return process

def run_moodscape():
    """Run the Moodscape app"""
    print("Starting Moodscape application...")
    app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'moodscape')
    
    # Run backend
    backend_dir = os.path.join(app_dir, 'backend')
    backend_cmd = [sys.executable, "-m", "app.main"]
    backend_process = run_cmd(backend_cmd, cwd=backend_dir)
    Thread(target=log_output, args=(backend_process, "Moodscape Backend")).start()
    
    # Wait for backend to start
    time.sleep(2)
    
    # Run frontend
    frontend_dir = os.path.join(app_dir, 'frontend')
    frontend_cmd = [sys.executable, "server.py"]
    frontend_process = run_cmd(frontend_cmd, cwd=frontend_dir)
    Thread(target=log_output, args=(frontend_process, "Moodscape Frontend")).start()
    
    return backend_process, frontend_process

def run_qa_platform():
    """Run the Q&A Platform"""
    print("Starting Q&A Platform...")
    app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'q&a', 'q&a')
    
    # Run Q&A server
    qa_cmd = ["node", "server.js"]
    qa_process = run_cmd(qa_cmd, cwd=app_dir)
    Thread(target=log_output, args=(qa_process, "Q&A Platform")).start()
    
    return qa_process

def cleanup():
    """Clean up all processes"""
    print("\nShutting down all applications...")
    
    for process in processes:
        try:
            if platform.system() == 'Windows':
                # On Windows, we need to use taskkill to kill the process tree
                subprocess.run(f"taskkill /F /T /PID {process.pid}", shell=True)
            else:
                # On Unix, use process group to kill all child processes
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        except:
            # Process might have already ended
            pass
    
    print("All applications have been shut down.")

def open_tabs():
    """Open only the Empathy Soul website in browser"""
    time.sleep(8)  # Wait for all servers to start
    
    print("\nOpening Empathy Soul in browser...")
    webbrowser.open('http://localhost:5001')  # Only open Empathy Soul

def edit_app_redirects():
    """Fix redirects in the Empathy Soul app.py file"""
    empathy_app_py = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'empathy-soul', 'app.py')
    
    if os.path.exists(empathy_app_py):
        try:
            with open(empathy_app_py, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update redirects if needed
            content = content.replace("return redirect('http://localhost:5000')", 
                                      "return redirect('http://localhost:5173')")
            
            with open(empathy_app_py, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print("Updated redirects in Empathy Soul app.py")
        except Exception as e:
            print(f"Warning: Failed to update redirects: {e}")

def main():
    print("="*80)
    print(" EMPATHY SOUL ECOSYSTEM LAUNCHER ".center(80, '='))
    print("="*80)
    print("\nThis script will start all the applications in the Empathy Soul ecosystem:")
    print("1. Empathy Soul website (http://localhost:5001)")
    print("2. KDC AI Chatbot (http://localhost:5173)")
    print("3. Meditation App (http://localhost:8080)")
    print("4. Moodscape application (http://localhost:5003)")
    print("5. Q&A Platform (http://localhost:5004/q-a.html)")
    print("\nStarting all applications...\n")
    
    # Register signal handlers for proper cleanup
    signal.signal(signal.SIGINT, lambda sig, frame: cleanup())
    signal.signal(signal.SIGTERM, lambda sig, frame: cleanup())
    
    try:
        # Fix redirects in Empathy Soul app.py
        edit_app_redirects()
        
        # Start all applications
        run_empathy_soul()
        run_kdc_chatbot()
        run_meditation_app()
        run_moodscape()
        run_qa_platform()
        
        # Open only Empathy Soul website in browser
        browser_thread = Thread(target=open_tabs)
        browser_thread.daemon = True
        browser_thread.start()
        
        print("\nAll applications started successfully!")
        print("\nAccess the Empathy Soul platform at: http://localhost:5001")
        print("Access the AI Chatbot at: http://localhost:5173")
        print("Access the Meditation App at: http://localhost:8080")
        print("Access the Moodscape application at: http://localhost:5003")
        print("Access the Q&A Platform at: http://localhost:5004/q-a.html")
        print("\nOnly the Empathy Soul website has been opened in your browser.")
        print("\nPress Ctrl+C to stop all applications...\n")
        
        # Keep the main thread running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nReceived keyboard interrupt.")
    finally:
        cleanup()

if __name__ == "__main__":
    main()
