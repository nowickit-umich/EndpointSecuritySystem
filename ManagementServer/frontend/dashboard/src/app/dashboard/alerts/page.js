import Sidebar from '@components/Sidebar';

export default function AlertsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold mb-4">Alerts</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Alert management coming soon...</p>
        </div>
      </main>
    </div>
  );
} 