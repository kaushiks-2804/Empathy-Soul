import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/journal', label: 'Journal' },
    { path: '/analysis', label: 'Analysis' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="w-64 bg-gray-800 text-white p-4 h-screen">
      <div className="text-2xl font-bold mb-8">MoodScape</div>
      <ul className="space-y-2">
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => 
                `block p-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar; 