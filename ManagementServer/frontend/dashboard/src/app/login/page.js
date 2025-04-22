'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentialChange, setShowCredentialChange] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid username or password');
        setIsLoading(false);
        return;
      }

      // Check if the user needs to change their credentials
      if (data.requiresCredentialChange) {
        setShowCredentialChange(true);
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred during login');
      setIsLoading(false);
    }
  };

  const handleCredentialChange = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!newUsername || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/change-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newUsername, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change credentials');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred while changing credentials');
      setIsLoading(false);
    }
  };

  if (showCredentialChange) {
    return (
      <main className="auth-page flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 auth-card rounded-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Change Credentials</h1>
            <p className="text-sm opacity-75">Please set your new username and password</p>
          </div>
          <form onSubmit={handleCredentialChange} className="space-y-6">
            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium mb-2">
                New Username
              </label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="auth-input"
                placeholder="Enter new username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Changing Credentials...' : 'Change Credentials'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 auth-card rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm opacity-75">Please sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
} 
