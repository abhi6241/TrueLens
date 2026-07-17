'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isDashboardActive = pathname === '/dashboard';
  const isAnalyzeActive = pathname.startsWith('/dashboard/analyze');
  const isProfileActive = pathname === '/dashboard/profile';
  const isSettingsActive = pathname === '/dashboard/settings';


  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-secondary border-r border-border-subtle flex flex-col gap-stack-md py-6 px-4 z-50 select-none">
      {/* Header */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <Link href="/" className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
        </Link>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary leading-tight">TrueLens AI</h1>
          <p className="font-label-sm text-label-sm text-text-muted">Bias &amp; Transparency</p>
        </div>
      </div>
      
      {/* CTA */}
      <button 
        onClick={() => router.push('/dashboard/analyze')}
        className="w-full bg-primary text-on-primary hover:bg-primary/95 font-label-md text-label-md py-2.5 rounded-[12px] mb-6 hover:scale-95 duration-200 transition-transform cursor-pointer shadow-sm"
      >
        New Analysis
      </button>
      
      {/* Navigation Links */}
      <div className="flex flex-col gap-2 font-label-md text-label-md">
        {/* Dashboard */}
        <Link 
          href="/dashboard" 
          className={`${
            isDashboardActive 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: isDashboardActive ? "'FILL' 1" : undefined 
            }}
          >
            dashboard
          </span>
          Dashboard
        </Link>
        
        {/* Analyze */}
        <Link 
          href="/dashboard/analyze" 
          className={`${
            isAnalyzeActive 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: isAnalyzeActive ? "'FILL' 1" : undefined 
            }}
          >
            analytics
          </span>
          Analyze
        </Link>
        
        {/* History */}
        <Link 
          href="/dashboard/history" 
          className={`${
            pathname === '/dashboard/history' 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: pathname === '/dashboard/history' ? "'FILL' 1" : undefined 
            }}
          >
            history
          </span>
          History
        </Link>
        
        {/* Bookmarks */}
        <Link 
          href="/dashboard/bookmarks" 
          className={`${
            pathname === '/dashboard/bookmarks' 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: pathname === '/dashboard/bookmarks' ? "'FILL' 1" : undefined 
            }}
          >
            bookmark
          </span>
          Bookmarks
        </Link>
        
        {/* Reports */}
        <Link 
          href="/dashboard/reports" 
          className={`${
            pathname === '/dashboard/reports' 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: pathname === '/dashboard/reports' ? "'FILL' 1" : undefined 
            }}
          >
            assessment
          </span>
          Reports
        </Link>
      </div>
      
      {/* Bottom Links */}
      <div className="mt-auto flex flex-col gap-2 font-label-md text-label-md">
        {/* Settings */}
        <Link 
          href="/dashboard/settings" 
          className={`${
            isSettingsActive 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: isSettingsActive ? "'FILL' 1" : undefined 
            }}
          >
            settings
          </span>
          Settings
        </Link>
        
        {/* Profile */}
        <Link 
          href="/dashboard/profile" 
          className={`${
            isProfileActive 
              ? 'bg-primary-container/10 text-primary font-bold border-primary' 
              : 'text-text-muted border-transparent hover:bg-surface-container-high'
          } flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 duration-200 ease-in-out transition-all`}
        >
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontVariationSettings: isProfileActive ? "'FILL' 1" : undefined 
            }}
          >
            person
          </span>
          Profile
        </Link>
      </div>

    </nav>
  );
}
