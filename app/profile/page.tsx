'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProfileData {
  name: string;
  phone: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    phone: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedProfile = localStorage.getItem('delivery_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile({
          name: parsed.name || user?.name || '',
          phone: parsed.phone || user?.phone || '',
        });
        return;
      } catch {
        localStorage.removeItem('delivery_profile');
      }
    }

    setProfile({
      name: user?.name || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('delivery_profile', JSON.stringify(profile));
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  if (!user) {
    return (
      <div className="py-8">
        <div className="card space-y-4 text-center">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Profile</h1>
          <p className="text-[var(--text-muted)]">Login to save your customer details.</p>
          <Link href="/auth" className="btn-primary inline-flex w-full justify-center md:w-auto">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <div className="card shadow-sm">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Customer Profile</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Save your name and phone number so checkout is quicker.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card space-y-5 shadow-sm">
          <div className="relative z-10">
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input-field bg-gradient-to-r from-white to-[var(--primary-bg)]/30"
              value={profile.name}
              onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              className="input-field bg-gradient-to-r from-white to-[var(--primary-bg)]/30"
              value={profile.phone}
              onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 md:flex-row">
            <button type="button" onClick={handleSave} className="btn-primary w-full shadow-md hover:shadow-lg md:w-auto">
              Save Profile
            </button>
            <Link href="/cart" className="btn-outline inline-flex w-full justify-center transition-all md:w-auto">
              Go to Cart
            </Link>
          </div>

          {saved && (
            <div className="rounded-[12px] border border-[var(--primary)] bg-[var(--primary-bg)] px-4 py-3 text-sm font-semibold text-[var(--primary-dark)] shadow-sm">
              Profile saved successfully.
            </div>
          )}
        </div>

        <div className="card space-y-4 bg-gradient-to-br from-white to-[var(--primary-bg)]/20 shadow-md">
          <div className="flex items-center gap-3 border-b border-[var(--primary)]/20 pb-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] font-extrabold text-white shadow-md">
              {profile.name ? profile.name.slice(0, 1).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="break-words text-lg font-bold text-[var(--text-primary)]">{profile.name || user.name}</p>
              <p className="break-words text-sm text-[var(--text-muted)]">{profile.phone || user.phone}</p>
            </div>
          </div>

          <Link href="/cart" className="btn-outline inline-flex w-full justify-center transition-all">
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
