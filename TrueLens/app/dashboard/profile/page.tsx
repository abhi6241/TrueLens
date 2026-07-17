'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface BackendUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  role: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBackendProfile() {
      if (!isClerkLoaded || !user) return;
      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await axios.get<BackendUser>('http://localhost:8000/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBackendUser(response.data);
      } catch (err: any) {
        console.error("Failed to load user profile from backend:", err);
        setError("Could not resolve profile from PostgreSQL database. Ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBackendProfile();
  }, [user, isClerkLoaded, getToken]);

  if (!isClerkLoaded || isLoading) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted font-body-md">Loading your profile information...</p>
      </div>
    );
  }

  const creationDate = backendUser 
    ? new Date(backendUser.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <div className="p-margin-desktop bg-surface max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-headline-lg font-bold text-on-surface">My Profile</h2>
          <p className="font-body-md text-text-muted">Manage your identity and authentication status.</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card premium-shadow p-8 flex flex-col md:flex-row gap-8 items-center md:items-start bg-white">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/20 bg-slate-100 flex items-center justify-center select-none shadow-sm">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-text-muted text-5xl">person</span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-lg p-1.5 shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
          </div>

          {/* Details Area */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div className="text-center md:text-left">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {user?.fullName || `${backendUser?.first_name || ''} ${backendUser?.last_name || ''}`.trim() || 'TrueLens User'}
                </h3>
                <p className="font-body-md text-text-muted">{user?.primaryEmailAddress?.emailAddress || backendUser?.email}</p>
              </div>

              {/* Role badge */}
              <div className="flex justify-center md:justify-end">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm border ${
                  backendUser?.role === 'admin' 
                    ? 'bg-secondary/10 text-secondary border-secondary/20' 
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {backendUser?.role === 'admin' ? 'admin_panel_settings' : 'person'}
                  </span>
                  {backendUser?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="font-label-sm text-label-sm text-text-muted mb-1 uppercase tracking-wider">Account ID</p>
                <p className="font-body-md text-body-md text-on-surface font-mono break-all">{user?.id}</p>
              </div>
              
              <div>
                <p className="font-label-sm text-label-sm text-text-muted mb-1 uppercase tracking-wider">Member Since</p>
                <p className="font-body-md text-body-md text-on-surface">
                  {creationDate || new Date(user?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="font-label-sm text-label-sm text-text-muted mb-1 uppercase tracking-wider">Auth Provider</p>
                <div className="flex items-center gap-2 mt-1">
                  {user?.externalAccounts.map(account => (
                    <span key={account.id} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-label-sm text-label-sm text-on-surface-variant capitalize">
                      {account.provider === 'google' ? 'Google' : account.provider === 'github' ? 'GitHub' : account.provider}
                    </span>
                  ))}
                  {user?.externalAccounts.length === 0 && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
                      Email Password
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="font-label-sm text-label-sm text-text-muted mb-1 uppercase tracking-wider">Database Sync Status</p>
                {error ? (
                  <p className="font-body-md text-body-md text-danger flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    Error: Synced failed
                  </p>
                ) : (
                  <p className="font-body-md text-body-md text-success flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Verified (PostgreSQL)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 border-danger/30 bg-danger/5 text-danger flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">warning</span>
            <p className="font-body-md text-sm">{error}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
