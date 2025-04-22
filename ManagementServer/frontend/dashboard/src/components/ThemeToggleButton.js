'use client';

import { FaSun, FaMoon } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme on client-side
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleClick = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:focus:ring-white cursor-pointer transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <FaSun className="h-6 w-6" /> : <FaMoon className="h-6 w-6" />}
    </button>
  );
}