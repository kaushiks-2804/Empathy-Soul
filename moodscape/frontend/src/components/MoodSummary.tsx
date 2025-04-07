import { FC, useMemo } from 'react';

interface MoodData {
  date: string;
  score: number;
  emotion: string;
}

interface MoodSummaryProps {
  moodData: MoodData[];
}

const MoodSummary: FC<MoodSummaryProps> = ({ moodData }) => {
  const summary = useMemo(() => {
    if (!moodData.length) {
      return { average: 0, dominant: 'neutral', improving: false };
    }

    // Calculate average score
    const average = moodData.reduce((acc, mood) => acc + mood.score, 0) / moodData.length;
    
    // Find dominant emotion
    const emotions = moodData.reduce((acc, mood) => {
      acc[mood.emotion] = (acc[mood.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominant = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0][0];
    
    // Check if mood is improving
    const sortedByDate = [...moodData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
    const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((acc, mood) => acc + mood.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((acc, mood) => acc + mood.score, 0) / secondHalf.length;
    
    const improving = secondHalfAvg > firstHalfAvg;
    
    return { average, dominant, improving };
  }, [moodData]);

  // Get color based on emotion
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'angry': return 'bg-angry';
      case 'sad': return 'bg-sad';
      case 'neutral': return 'bg-neutral';
      case 'calm': return 'bg-calm';
      case 'happy': return 'bg-happy';
      case 'excited': return 'bg-excited';
      default: return 'bg-neutral';
    }
  };

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Mood Summary</h2>
      
      {moodData.length === 0 ? (
        <p className="text-gray-400">No mood data available yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Mood:</span>
            <span className="text-xl font-bold">{summary.average.toFixed(1)}/9</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Dominant Emotion:</span>
            <span className={`px-3 py-1 rounded-full ${getEmotionColor(summary.dominant)}`}>
              {summary.dominant}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Trend:</span>
            <span className={`px-3 py-1 rounded-full ${summary.improving ? 'bg-green-600' : 'bg-red-600'}`}>
              {summary.improving ? 'Improving' : 'Declining'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSummary; 