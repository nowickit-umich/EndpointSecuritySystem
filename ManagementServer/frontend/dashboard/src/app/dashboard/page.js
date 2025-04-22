'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@components/Sidebar';
import { FaServer, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

export default function DashboardPage() {
  const [endpointsCount, setEndpointsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEndpointsCount = async () => {
      try {
        const response = await fetch('/api/get-endpoints-count');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch endpoints count');
        }

        setEndpointsCount(data.count);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEndpointsCount();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Endpoints Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Endpoints</h2>
              <FaServer className="text-blue-600" size={24} />
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p className="text-3xl font-bold text-gray-900">{endpointsCount}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Total endpoints registered</p>
          </div>

          {/* Placeholder for other cards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Events</h2>
              <FaChartLine className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-2">Total events processed</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
              <FaExclamationTriangle className="text-red-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-2">Active alerts</p>
          </div>
        </div>
      </main>
    </div>
  );
}
