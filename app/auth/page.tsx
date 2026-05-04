'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, signup } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    
    try {
      if (isLoginMode) {
        await login(phone, password);
      } else {
        await signup(name, phone, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-2">{isLoginMode ? 'Login' : 'Signup'}</h1>
      <p className="text-sm text-gray-600 mb-6">
        {isLoginMode ? 'Sign in to place and track your orders.' : 'Create an account to manage orders easily.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginMode && (
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            className="input-field"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            minLength={6}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Please wait...' : isLoginMode ? 'Login' : 'Signup'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setIsLoginMode((prev) => !prev)}
        className="mt-4 text-sm text-primary-600 hover:text-primary-700"
      >
        {isLoginMode ? "Don't have an account? Signup" : 'Already have an account? Login'}
      </button>
    </div>
  );
}
