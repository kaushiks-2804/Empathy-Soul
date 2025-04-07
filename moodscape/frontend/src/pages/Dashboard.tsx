import { useEffect, useState } from 'react';
import MoodTimeline from '../components/MoodTimeline';
import MoodSummary from '../components/MoodSummary';
import RecentEntries from '../components/RecentEntries';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [moodData, setMoodData] = useState([]);

  useEffect(() => {
    // In a real app, this would fetch data from the API
    // For now, we'll just simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Placeholder data
      setMoodData([
        { date: '2025-03-20', score: 7, emotion: 'happy' },
        { date: '2025-03-21', score: 5, emotion: 'neutral' },
        { date: '2025-03-22', score: 8, emotion: 'excited' },
        { date: '2025-03-23', score: 4, emotion: 'sad' },
        { date: '2025-03-24', score: 6, emotion: 'calm' },
        { date: '2025-03-25', score: 3, emotion: 'angry' },
        { date: '2025-03-26', score: 7, emotion: 'happy' },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xl">Loading your mood data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodSummary moodData={moodData} />
        <MoodTimeline moodData={moodData} />
      </div>
      
      <RecentEntries entries={moodData} />
    </div>
  );
};

export default Dashboard; 