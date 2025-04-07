import { FC, ChangeEvent } from 'react';

interface JournalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const JournalEditor: FC<JournalEditorProps> = ({ value, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Journal Entry</h2>
      <textarea
        className="w-full h-40 p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="How are you feeling today? What's on your mind?"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default JournalEditor; 