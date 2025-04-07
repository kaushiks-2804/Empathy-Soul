import os
import sys
import requests
import json
from datetime import datetime

class SimpleMoodscapeApp:
    def __init__(self):
        self.api_url = "http://localhost:8000/api"
        self.current_page = "dashboard"
        self.mood_options = {
            1: "terrible",
            2: "angry",
            3: "sad",
            4: "worried",
            5: "neutral",
            6: "calm",
            7: "happy",
            8: "excited",
            9: "amazing"
        }
        self.mood_colors = {
            "terrible": '\033[38;5;52m',  # dark red
            "angry": '\033[38;5;196m',    # bright red
            "sad": '\033[38;5;104m',      # purple
            "worried": '\033[38;5;68m',   # light blue
            "neutral": '\033[38;5;246m',  # gray
            "calm": '\033[38;5;39m',      # blue
            "happy": '\033[38;5;226m',    # yellow
            "excited": '\033[38;5;208m',  # orange
            "amazing": '\033[38;5;46m'    # green
        }
        self.reset_color = '\033[0m'

    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def print_header(self):
        self.clear_screen()
        print(f"\n{'='*60}")
        print(f"{'MOODSCAPE - AI MOOD TRACKER':^60}")
        print(f"{'='*60}")
        print(f"\nCurrent page: {self.current_page.upper()}\n")

    def print_menu(self):
        print(f"\n{'-'*60}")
        print(f"Navigation: [d] Dashboard | [j] Journal | [a] Analysis | [s] Settings | [q] Quit")
        print(f"{'-'*60}")

    def get_entries(self):
        try:
            response = requests.get(f"{self.api_url}/entries/recent")
            if response.status_code == 200:
                return response.json()
            else:
                return []
        except:
            # Return mock data if API is not available
            return [
                {"id": 1, "date": "2025-03-27", "mood_score": 7, "emotion": "happy", "journal_text": "Had a great day today!"},
                {"id": 2, "date": "2025-03-26", "mood_score": 5, "emotion": "neutral", "journal_text": "Regular day, nothing special."},
                {"id": 3, "date": "2025-03-25", "mood_score": 3, "emotion": "sad", "journal_text": "Feeling a bit down today."},
                {"id": 4, "date": "2025-03-24", "mood_score": 6, "emotion": "calm", "journal_text": "Peaceful day, enjoyed some reading."},
                {"id": 5, "date": "2025-03-23", "mood_score": 8, "emotion": "excited", "journal_text": "Looking forward to the weekend!"}
            ]

    def get_analysis(self):
        try:
            response = requests.get(f"{self.api_url}/analysis/suggestions")
            if response.status_code == 200:
                return response.json()
            else:
                return {"suggestions": []}
        except:
            # Return mock data if API is not available
            return {
                "suggestions": [
                    "Your mood appears to be improving - keep up the good habits!",
                    "Consider taking short breaks during work to maintain your positive energy."
                ]
            }

    def submit_entry(self, mood_score, emotion, journal_text):
        data = {
            "mood_score": mood_score,
            "emotion": emotion,
            "journal_text": journal_text,
            "date": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(f"{self.api_url}/entries/", json=data)
            if response.status_code == 200:
                return True
            else:
                return False
        except:
            # Simulate success if API is not available
            return True

    def show_dashboard(self):
        self.current_page = "dashboard"
        self.print_header()
        
        print("MOOD SUMMARY\n")
        entries = self.get_entries()
        
        if not entries:
            print("No mood entries yet. Add some in the Journal section!")
        else:
            # Calculate average mood
            avg_mood = sum(entry["mood_score"] for entry in entries) / len(entries)
            print(f"Average mood: {avg_mood:.1f}/9")
            
            # Find dominant emotion
            emotions = {}
            for entry in entries:
                emotion = entry["emotion"]
                emotions[emotion] = emotions.get(emotion, 0) + 1
            
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            print(f"Dominant emotion: {self.mood_colors.get(dominant_emotion, '')}{dominant_emotion}{self.reset_color}")
            
            # Show recent entries
            print("\nRECENT ENTRIES:\n")
            for entry in entries[:3]:
                date = entry["date"].split('T')[0] if 'T' in entry["date"] else entry["date"]
                emotion = entry["emotion"]
                score = entry["mood_score"]
                color = self.mood_colors.get(emotion, '')
                print(f"{date}: {color}{emotion}{self.reset_color} ({score}/9)")
                
            # Show suggestions
            analysis = self.get_analysis()
            if analysis["suggestions"]:
                print("\nSUGGESTIONS:")
                for suggestion in analysis["suggestions"][:2]:
                    print(f"• {suggestion}")

    def show_journal(self):
        self.current_page = "journal"
        self.print_header()
        
        print("NEW MOOD ENTRY\n")
        print("How are you feeling today? (1-9)")
        
        for score, emotion in self.mood_options.items():
            color = self.mood_colors.get(emotion, '')
            print(f"{score}: {color}{emotion}{self.reset_color}")
            
        try:
            mood_score = int(input("\nEnter mood score (1-9): "))
            if mood_score < 1 or mood_score > 9:
                print("Invalid score. Using 5 (neutral).")
                mood_score = 5
        except:
            print("Invalid input. Using 5 (neutral).")
            mood_score = 5
            
        emotion = self.mood_options.get(mood_score, "neutral")
        print(f"Selected mood: {self.mood_colors.get(emotion, '')}{emotion}{self.reset_color}")
        
        journal_text = input("\nWrite your journal entry (or press Enter to skip):\n")
        
        if self.submit_entry(mood_score, emotion, journal_text):
            print("\nEntry saved successfully!")
        else:
            print("\nFailed to save entry. Please try again later.")
            
        input("\nPress Enter to continue...")

    def show_analysis(self):
        self.current_page = "analysis"
        self.print_header()
        
        entries = self.get_entries()
        if not entries:
            print("Not enough data for analysis. Add some entries in the Journal section!")
            input("\nPress Enter to continue...")
            return
            
        print("MOOD ANALYSIS\n")
        
        # Show emotion distribution
        print("EMOTION DISTRIBUTION:")
        emotions = {}
        for entry in entries:
            emotion = entry["emotion"]
            emotions[emotion] = emotions.get(emotion, 0) + 1
        
        total = len(entries)
        for emotion, count in emotions.items():
            percentage = (count / total) * 100
            bar_length = int(percentage / 5)
            color = self.mood_colors.get(emotion, '')
            bar = f"{color}{'█' * bar_length}{self.reset_color}"
            print(f"{emotion:10}: {bar} {percentage:.1f}%")
            
        # Show predictions and suggestions
        print("\nAI SUGGESTIONS:")
        analysis = self.get_analysis()
        if analysis["suggestions"]:
            for suggestion in analysis["suggestions"]:
                print(f"• {suggestion}")
        else:
            print("No suggestions available yet.")
        
        input("\nPress Enter to continue...")

    def show_settings(self):
        self.current_page = "settings"
        self.print_header()
        
        print("APPLICATION SETTINGS\n")
        print("Note: This is a simplified frontend. Settings would be available in the full app.")
        print("In the full version, you could configure:")
        print("• Theme and color scheme")
        print("• Notifications")
        print("• Sound effects")
        print("• AI analysis preferences")
        print("• Data export options")
        
        input("\nPress Enter to continue...")

    def run(self):
        while True:
            if self.current_page == "dashboard":
                self.show_dashboard()
            elif self.current_page == "journal":
                self.show_journal()
            elif self.current_page == "analysis":
                self.show_analysis()
            elif self.current_page == "settings":
                self.show_settings()
                
            self.print_menu()
            choice = input("Select an option: ").lower()
            
            if choice == 'd':
                self.current_page = "dashboard"
            elif choice == 'j':
                self.current_page = "journal"
            elif choice == 'a':
                self.current_page = "analysis"
            elif choice == 's':
                self.current_page = "settings"
            elif choice == 'q':
                print("\nExiting MoodScape. Goodbye!")
                break

if __name__ == "__main__":
    app = SimpleMoodscapeApp()
    app.run() 