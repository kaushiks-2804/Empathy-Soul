import { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    dataExport: 'json',
    aiAnalysis: true,
    soundEffects: true,
    voiceJournal: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to localStorage or a database
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    // In a real app, this would export the data
    console.log('Exporting data in format:', settings.dataExport);
    alert(`Data would be exported in ${settings.dataExport} format`);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-gray-300">Theme</label>
            <select 
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className="bg-gray-700 p-2 rounded-md"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="notifications"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="notifications" className="text-gray-300">
              Enable notifications
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="aiAnalysis"
              name="aiAnalysis"
              checked={settings.aiAnalysis}
              onChange={handleChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="aiAnalysis" className="text-gray-300">
              Enable AI mood analysis
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="soundEffects"
              name="soundEffects"
              checked={settings.soundEffects}
              onChange={handleChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="soundEffects" className="text-gray-300">
              Enable sound effects
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="voiceJournal"
              name="voiceJournal"
              checked={settings.voiceJournal}
              onChange={handleChange}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="voiceJournal" className="text-gray-300">
              Enable voice journal (experimental)
            </label>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Settings
        </button>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-gray-300">Export Format</label>
            <select 
              name="dataExport"
              value={settings.dataExport}
              onChange={handleChange}
              className="bg-gray-700 p-2 rounded-md"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <button 
            onClick={handleExportData}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Export Data
          </button>
          
          <div className="border-t border-gray-700 pt-4 mt-4">
            <button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
                  console.log('Deleting all data');
                  alert('All data has been deleted');
                }
              }}
            >
              Delete All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 