import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="flex h-screen">
      <Navbar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 