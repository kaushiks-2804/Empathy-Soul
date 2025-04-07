import { FC, useState, useEffect } from 'react';
import * as d3 from 'd3';

interface MoodData {
  date: string;
  score: number;
  emotion: string;
}

const Analysis: FC = () => {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setMoodData([
        { date: '2025-03-10', score: 4, emotion: 'sad' },
        { date: '2025-03-11', score: 3, emotion: 'angry' },
        { date: '2025-03-12', score: 5, emotion: 'neutral' },
        { date: '2025-03-13', score: 6, emotion: 'calm' },
        { date: '2025-03-14', score: 7, emotion: 'happy' },
        { date: '2025-03-15', score: 6, emotion: 'calm' },
        { date: '2025-03-16', score: 5, emotion: 'neutral' },
        { date: '2025-03-17', score: 8, emotion: 'excited' },
        { date: '2025-03-18', score: 7, emotion: 'happy' },
        { date: '2025-03-19', score: 6, emotion: 'calm' },
        { date: '2025-03-20', score: 7, emotion: 'happy' },
        { date: '2025-03-21', score: 5, emotion: 'neutral' },
        { date: '2025-03-22', score: 8, emotion: 'excited' },
        { date: '2025-03-23', score: 4, emotion: 'sad' },
        { date: '2025-03-24', score: 6, emotion: 'calm' },
        { date: '2025-03-25', score: 3, emotion: 'angry' },
        { date: '2025-03-26', score: 7, emotion: 'happy' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate emotion percentages
  const emotionStats = moodData.reduce((acc, { emotion }) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emotionPercentages = Object.entries(emotionStats).map(([emotion, count]) => ({
    emotion,
    percentage: Math.round((count / moodData.length) * 100),
  }));

  // Calculate mood predictions (simplified)
  const predictions = {
    nextWeek: 6.7, // Simplified prediction
    trend: 'improving',
    suggestion: 'Your mood has been generally improving. Keep engaging in activities that make you happy, like your recent walks in nature and social gatherings.'
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xl">Analyzing your mood data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Mood Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Emotion Distribution</h2>
          <div className="space-y-3">
            {emotionPercentages.map(({ emotion, percentage }) => (
              <div key={emotion} className="flex items-center">
                <div className="w-24 text-gray-400">{emotion}</div>
                <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getEmotionColor(emotion)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right">{percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Mood Predictions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Next week average:</span>
              <span className="text-xl font-bold">{predictions.nextWeek.toFixed(1)}/9</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Trend:</span>
              <span className="px-3 py-1 rounded-full bg-green-600">
                {predictions.trend}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Suggestions */}
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">AI Suggestions</h2>
        <div className="p-4 bg-blue-900 bg-opacity-30 rounded-lg">
          <p>{predictions.suggestion}</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get emotion color class
function getEmotionColor(emotion: string): string {
  switch (emotion) {
    case 'angry': return 'bg-angry';
    case 'sad': return 'bg-sad';
    case 'neutral': return 'bg-neutral';
    case 'calm': return 'bg-calm';
    case 'happy': return 'bg-happy';
    case 'excited': return 'bg-excited';
    default: return 'bg-neutral';
  }
}

export default Analysis; 