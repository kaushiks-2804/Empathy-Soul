import { FC } from 'react';

interface Mood {
  score: number;
  emotion: string;
  color: string;
}

interface MoodSelectorProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

const MoodSelector: FC<MoodSelectorProps> = ({ value, onChange }) => {
  const moods = [
    { score: 1, emotion: 'terrible', color: '#6b4f4f' },
    { score: 2, emotion: 'angry', color: '#e25858' },
    { score: 3, emotion: 'sad', color: '#7b69b8' },
    { score: 4, emotion: 'worried', color: '#7b8ab8' },
    { score: 5, emotion: 'neutral', color: '#a0aec0' },
    { score: 6, emotion: 'calm', color: '#4f8fba' },
    { score: 7, emotion: 'happy', color: '#e2c458' },
    { score: 8, emotion: 'excited', color: '#e27e58' },
    { score: 9, emotion: 'amazing', color: '#58e27e' },
  ];

  return (
    <div>
      <div className="mb-4">
        <div className="text-lg mb-2">
          {value.emotion.charAt(0).toUpperCase() + value.emotion.slice(1)} ({value.score}/9)
        </div>
        <input 
          type="range" 
          min="1" 
          max="9" 
          value={value.score} 
          onChange={(e) => {
            const score = parseInt(e.target.value);
            const selectedMood = moods.find(m => m.score === score) || moods[4];
            onChange(selectedMood);
          }}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={{ 
            background: `linear-gradient(to right, #6b4f4f, #e25858, #7b69b8, #7b8ab8, #a0aec0, #4f8fba, #e2c458, #e27e58, #58e27e)`,
            accentColor: value.color
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.emotion}
            onClick={() => onChange(mood)}
            className={`p-2 rounded-md ${mood.score === value.score ? 'ring-2 ring-white' : ''}`}
            style={{ backgroundColor: mood.color }}
          >
            {mood.emotion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector; 