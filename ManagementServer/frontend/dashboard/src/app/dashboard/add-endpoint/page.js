'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Sidebar from '@components/Sidebar';

export default function AddEndpoint() {
  const [endpointName, setEndpointName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement endpoint creation and file download
      console.log('Creating endpoint:', endpointName);
    } catch (err) {
      setError('Failed to create endpoint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-3xl">
          <div className="flex items-center mb-6">
            <FaPlus className="text-blue-600 mr-2" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Add New Endpoint</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 mb-6">
              Create a configuration file for your new endpoint. This file will be used to install the endpoint on your target device.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="endpointName" className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint Name
                </label>
                <input
                  type="text"
                  id="endpointName"
                  value={endpointName}
                  onChange={(e) => setEndpointName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter endpoint name"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Choose a descriptive name for your endpoint (e.g., Office Computer or Server Room)
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !endpointName.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Endpoint'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 
