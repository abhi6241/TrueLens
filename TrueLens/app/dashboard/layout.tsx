'use client';

import Sidebar from '../../components/layout/Sidebar';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dynamically set header title based on route
  const getHeaderTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/dashboard/analyze') return 'Analyze Article';
    if (pathname === '/dashboard/analyze/result') return 'Analysis Result';
    if (pathname === '/dashboard/profile') return 'My Profile';
    if (pathname === '/dashboard/settings') return 'Settings';
    return 'Dashboard';
  };


  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-40 bg-surface border-b border-border-subtle shadow-sm flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-4">
            <button className="text-text-muted hover:bg-surface-container rounded-full p-2 transition-transform active:scale-90 md:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              {getHeaderTitle()}
            </h2>
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative w-full h-10 bg-surface-container-lowest border border-border-subtle rounded-[20px] flex items-center px-4">
              <span className="material-symbols-outlined text-text-muted mr-2" style={{ fontSize: '18px' }}>search</span>
              <input 
                type="text" 
                placeholder="Search analysis history..." 
                className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-text-muted h-full outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="text-text-muted hover:bg-surface-container rounded-full p-2 transition-transform active:scale-90 cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {/* Contrast */}
            <button className="text-text-muted hover:bg-surface-container rounded-full p-2 transition-transform active:scale-90 cursor-pointer">
              <span className="material-symbols-outlined">contrast</span>
            </button>
            
            {/* Profile Avatar */}
            <div className="ml-4 flex items-center justify-center">
              <UserButton />
            </div>

          </div>
        </header>

        {/* Dynamic content canvas */}
        <main className="flex-grow bg-surface">
          {children}
        </main>
      </div>
    </div>
  );
}
