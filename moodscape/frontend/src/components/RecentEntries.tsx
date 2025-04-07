import { FC } from 'react';

interface MoodEntry {
  date: string;
  score: number;
  emotion: string;
}

interface RecentEntriesProps {
  entries: MoodEntry[];
}

const RecentEntries: FC<RecentEntriesProps> = ({ entries }) => {
  // Format date as "Mon, Jan 1, 2025"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get emotion color
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

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
      
      {entries.length === 0 ? (
        <p className="text-gray-400">No entries available yet.</p>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry, index) => (
            <div 
              key={entry.date}
              className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getEmotionColor(entry.emotion)}`}></div>
                <div>
                  <div className="font-medium">{formatDate(entry.date)}</div>
                  <div className="text-sm text-gray-400">Feeling: {entry.emotion}</div>
                </div>
              </div>
              <div className="text-xl font-bold">{entry.score}/9</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentEntries; 