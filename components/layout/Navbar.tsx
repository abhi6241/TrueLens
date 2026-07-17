'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return (
    <nav className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-border-subtle shadow-sm transition-colors duration-200">
      <div className="flex justify-between items-center px-margin-desktop h-20 w-full max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2PpLq_J2Wth2QV7rHMUYUgnq5oVEewmnc-njO2tQfwg89nhInyfyScVU-tB_m4kQD723-bx8Fb8H16P8GcTRPc5fgzfafZA5DKve2U_-0n-4GvpbPKAJCaYYpm5mVIFGzBaXFFMvjJ0zAOH3Rqyl2M5omsr59cpCKOZl2TnLJQsF3tNmS_iQevUvQH952GHvGG6BqxD2SNa5G6R3KnA_7lfNVvB8LtwxMgkKkfVOmtLXeYvgoQqjV" 
            alt="TrueLens Logo" 
            className="w-10 h-10 object-contain rounded-lg"
          />
          <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight hidden sm:block">TrueLens</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-label-md text-label-md">
          <Link href="/" className="text-text-muted hover:text-primary transition-colors">Platform</Link>
          <Link href="/sources" className="text-text-muted hover:text-primary transition-colors">Solutions</Link>
          <Link href="/sources" className="text-text-muted hover:text-primary transition-colors">Resources</Link>
        </div>
        
        <div className="flex items-center gap-4">
          {!isSignedIn && (
            <>
              <button 
                onClick={() => router.push('/sign-in')}
                className="font-label-md text-label-md text-text-muted hover:text-primary transition-colors px-4 py-2 cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/sign-up')}
                className="font-label-md text-label-md text-on-primary bg-primary-container rounded-xl px-5 py-2 hover-lift active:scale-95 duration-200 transition-transform cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}
          
          {isSignedIn && (
            <>
              <button 
                onClick={() => router.push('/dashboard')}
                className="hidden sm:block font-label-md text-label-md text-on-surface bg-surface-primary border border-border-subtle rounded-xl px-4 py-2 hover-lift cursor-pointer"
              >
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/dashboard/analyze')}
                className="font-label-md text-label-md text-on-primary bg-primary-container rounded-xl px-5 py-2 hover-lift active:scale-95 duration-200 transition-transform cursor-pointer"
              >
                Analyze Article
              </button>
              <div className="flex items-center justify-center pl-2 border-l border-border-subtle h-8">
                <UserButton />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
