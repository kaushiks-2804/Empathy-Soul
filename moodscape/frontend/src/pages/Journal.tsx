import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import MoodScene from '../components/3d/MoodScene';
import JournalEditor from '../components/JournalEditor';
import MoodSelector from '../components/MoodSelector';

const Journal = () => {
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState({
    score: 5,
    emotion: 'neutral',
    color: '#a0aec0'
  });
  
  const handleSaveEntry = () => {
    // In a real app, this would save to the database
    console.log('Saving entry:', {
      date: new Date().toISOString(),
      journalText,
      mood: selectedMood
    });
    
    // Reset form
    setJournalText('');
    setSelectedMood({ score: 5, emotion: 'neutral', color: '#a0aec0' });
  };
  
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Journal</h1>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 flex-1">
            <h2 className="text-xl font-semibold mb-2">How are you feeling?</h2>
            <MoodSelector value={selectedMood} onChange={setSelectedMood} />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex-1">
            <JournalEditor value={journalText} onChange={setJournalText} />
            <button 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSaveEntry}
            >
              Save Entry
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden h-[500px]">
          <Canvas>
            <MoodScene mood={selectedMood} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Journal; 