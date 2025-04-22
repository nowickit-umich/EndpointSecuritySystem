'use client';

import Link from 'next/link'; 
import { FaShieldAlt, FaBell, FaTachometerAlt, FaLaptopCode, FaSearch, FaBullhorn } from 'react-icons/fa'; // Import icons

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="hero-section flex-grow flex items-center justify-center text-center px-4 py-20 mt-16">
        <div className="max-w-3xl">
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Secure Your Network. Real-Time Endpoint Monitoring.
          </h1>
          <p className="hero-text text-lg md:text-xl mb-8">
            Get instant insights and alerts for all your connected devices.
          </p>
          <Link href="/login">
            <span className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out cursor-pointer">
              Get Started
            </span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="section py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="card p-6 rounded-lg shadow-lg">
              <FaShieldAlt className="icon text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Monitoring</h3>
              <p>View running processes across all endpoints.</p>
            </div>
            <div className="card p-6 rounded-lg shadow-lg">
              <FaBell className="icon text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Alert System</h3>
              <p>Receive instant alerts based on detected threats.</p>
            </div>
            <div className="card p-6 rounded-lg shadow-lg">
              <FaTachometerAlt className="icon text-4xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
              <p>Manage endpoints and monitor activity from a unified interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-alt py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
            <div className="step p-6 flex flex-col items-center">
              <FaLaptopCode className="icon text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">1. Install Agent</h3>
              <p>Deploy the lightweight agent on your endpoints.</p>
            </div>
            <div className="step p-6 flex flex-col items-center">
              <FaSearch className="icon text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">2. Monitor Events</h3>
              <p>Logs and events are securely sent to the central dashboard.</p>
            </div>
            <div className="step p-6 flex flex-col items-center">
              <FaBullhorn className="icon text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">3. Respond to Alerts</h3>
              <p>View alerts and manage endpoints via the dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6">
        <p>&copy; 2025 EndPoint Guard Inc. All rights reserved.</p>
      </footer>

    </main>
  );
}
