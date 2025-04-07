import requests
import time
import os

BASE_URL = "http://localhost:5000"

def test_chat_endpoint():
    print("\n1. Testing Chat Endpoint...")
    
    # Test with valid input
    response = requests.post(f"{BASE_URL}/chat", json={"message": "i am feeling very motivated to work on my project"})
    if response.status_code == 200:
        data = response.json()
        print("✓ Chat response received successfully")
        print(f"Bot's response: {data['text']}")
        print(f"Audio URL: {data['audio_url']}")
        return data['audio_url']
    else:
        print("✗ Chat endpoint failed")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_audio_endpoint(audio_url):
    print("\n2. Testing Audio Endpoint...")
    
    if not audio_url:
        print("✗ Skipping audio test as no audio URL available")
        return
    
    # Extract filename from audio_url
    filename = audio_url.split('/')[-1]
    response = requests.get(f"{BASE_URL}/audio/{filename}")
    
    if response.status_code == 200:
        print("✓ Audio file retrieved successfully")
        # Save audio file for verification
        with open("test_audio.mp3", "wb") as f:
            f.write(response.content)
        print("✓ Audio file saved as 'test_audio.mp3'")
    else:
        print("✗ Audio endpoint failed")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")

def test_cleanup_endpoint():
    print("\n3. Testing Cleanup Endpoint...")
    
    response = requests.post(f"{BASE_URL}/cleanup")
    if response.status_code == 200:
        print("✓ Cleanup successful")
    else:
        print("✗ Cleanup endpoint failed")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")

def test_error_cases():
    print("\n4. Testing Error Cases...")
    
    # Test empty message
    print("\nTesting empty message:")
    response = requests.post(f"{BASE_URL}/chat", json={"message": ""})
    if response.status_code == 400:
        print("✓ Empty message handled correctly")
    else:
        print("✗ Empty message test failed")
    
    # Test invalid audio filename
    print("\nTesting invalid audio file:")
    response = requests.get(f"{BASE_URL}/audio/nonexistent.mp3")
    if response.status_code == 404:
        print("✓ Invalid audio file handled correctly")
    else:
        print("✗ Invalid audio file test failed")

def run_all_tests():
    print("Starting Backend Tests...")
    print("========================")
    
    try:
        # Run main functionality tests
        audio_url = test_chat_endpoint()
        test_audio_endpoint(audio_url)
        time.sleep(1)  # Wait a bit before cleanup
        test_cleanup_endpoint()
        
        # Run error case tests
        test_error_cases()
        
        print("\n========================")
        print("Tests completed!")
        
        # Cleanup test audio file
        if os.path.exists("test_audio.mp3"):
            os.remove("test_audio.mp3")
            print("Test audio file cleaned up")
            
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Could not connect to the server!")
        print("Make sure the Flask server is running on http://localhost:5000")

if __name__ == "__main__":
    run_all_tests() 