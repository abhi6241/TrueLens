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

export default function SettingsPage() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
        setFirstName(response.data.first_name || '');
        setLastName(response.data.last_name || '');
      } catch (err: any) {
        console.error("Failed to load user settings from backend:", err);
        setError("Could not retrieve profile settings from database.");
        // Fallback using Clerk data
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBackendProfile();
  }, [user, isClerkLoaded, getToken]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);
      
      // 1. Sync to Clerk Frontend
      await user.update({
        firstName,
        lastName
      });
      
      // 2. Sync to PostgreSQL backend
      const token = await getToken();
      const response = await axios.put<BackendUser>(
        'http://localhost:8000/api/v1/users/me/settings',
        {
          first_name: firstName,
          last_name: lastName,
          profile_image_url: user.imageUrl
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setBackendUser(response.data);
      setSuccessMsg("Settings updated successfully in both Clerk & PostgreSQL database!");
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClerkLoaded || isLoading) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted font-body-md">Loading settings configurations...</p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop bg-surface max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-headline-lg font-bold text-on-surface">Settings</h2>
          <p className="font-body-md text-text-muted">Manage your profile metadata, roles, and database parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings Left Column - Form */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="glass-card premium-shadow p-6 bg-white space-y-6">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface border-b border-border-subtle pb-3">
                General Profile Settings
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="font-label-sm text-label-sm text-on-surface font-semibold">First Name</label>
                  <input 
                    type="text" 
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-normal text-sm py-2.5 px-3.5 outline-none transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="font-label-sm text-label-sm text-on-surface font-semibold">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-normal text-sm py-2.5 px-3.5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl text-text-muted font-normal text-sm py-2.5 px-3.5 outline-none cursor-not-allowed"
                />
                <span className="font-label-sm text-label-sm text-text-muted/70 mt-1">Primary authentication emails must be managed via provider keys.</span>
              </div>

              {/* Status and feedback alerts */}
              {successMsg && (
                <div className="glass-card p-4 border-success/30 bg-success/5 text-success flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <p className="font-body-md text-sm font-medium">{successMsg}</p>
                </div>
              )}

              {error && (
                <div className="glass-card p-4 border-danger/30 bg-danger/5 text-danger flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <p className="font-body-md text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="font-label-md text-label-md text-on-primary bg-primary hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl px-6 py-2.5 hover-lift active:scale-95 duration-200 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Settings Right Column - Metadata Cards */}
          <div className="space-y-6">
            {/* Database details */}
            <div className="glass-card premium-shadow p-6 bg-white space-y-4">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Authentication Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">User ID</span>
                  <span className="font-mono text-xs font-semibold max-w-[120px] truncate" title={user?.id}>{user?.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Database Role</span>
                  <span className="font-semibold text-primary capitalize">{backendUser?.role || 'User'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Postgres State</span>
                  <span className="text-success flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-success"></span> Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Social logins */}
            <div className="glass-card premium-shadow p-6 bg-white space-y-4">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Social Connections</h3>
              <p className="font-body-md text-xs text-text-muted">Connected authentication mechanisms associated with this session.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5" />
                    <span className="font-label-md text-sm font-semibold text-on-surface">Google Login</span>
                  </div>
                  <span className={`font-label-sm text-xs px-2 py-0.5 rounded-full border ${
                    user?.externalAccounts.some(acc => acc.provider === 'google')
                      ? 'bg-success/10 text-success border-success/20 font-semibold'
                      : 'bg-slate-100 text-text-muted border-slate-200'
                  }`}>
                    {user?.externalAccounts.some(acc => acc.provider === 'google') ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <img src="https://authjs.dev/img/providers/github.svg" alt="GitHub" className="w-5 h-5" />
                    <span className="font-label-md text-sm font-semibold text-on-surface">GitHub Login</span>
                  </div>
                  <span className={`font-label-sm text-xs px-2 py-0.5 rounded-full border ${
                    user?.externalAccounts.some(acc => acc.provider === 'github')
                      ? 'bg-success/10 text-success border-success/20 font-semibold'
                      : 'bg-slate-100 text-text-muted border-slate-200'
                  }`}>
                    {user?.externalAccounts.some(acc => acc.provider === 'github') ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
