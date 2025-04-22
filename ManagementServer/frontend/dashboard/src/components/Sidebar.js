import Link from 'next/link';
import { FaHome, FaServer, FaBell, FaList } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-800 p-4 border-r border-gray-700 fixed top-0 left-0">
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-white text-center">EndPoint Guard Inc.</h3>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link href="/dashboard" className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-700 text-gray-200">
          <FaHome />
          <span>Overview</span>
        </Link>
        <Link href="/dashboard/endpoints" className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-700 text-gray-200">
          <FaServer />
          <span>Endpoints</span>
        </Link>
        <Link href="/dashboard/events" className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-700 text-gray-200">
          <FaList />
          <span>Events</span>
        </Link>
        <Link href="/dashboard/alerts" className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-gray-700 text-gray-200">
          <FaBell />
          <span>Alerts</span>
        </Link>
      </nav>
    </aside>
  );
} 