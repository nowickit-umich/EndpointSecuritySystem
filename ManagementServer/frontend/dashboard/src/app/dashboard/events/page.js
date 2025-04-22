import EventDashboard from '@components/EventDash';
import Sidebar from '@components/Sidebar';

export default function EventsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold mb-4">Events</h1>
        <EventDashboard />
      </main>
    </div>
  );
} 