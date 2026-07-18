import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApiClientTokenProvider from '../components/layout/ApiClientTokenProvider';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueLens - Setup Required",
  description: "AI Fact Checking and Analysis",
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('placeholder');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isClerkConfigured) {
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-display">
          {/* Decorative background gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
          
          <div className="max-w-xl w-full bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 space-y-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[32px]">vpn_key</span>
            </div>
            
            <div className="space-y-3">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
                Clerk Setup Required
              </h1>
              <p className="text-sm md:text-base text-text-muted max-w-md mx-auto leading-relaxed">
                To enable Secure Sign Up, Login, and Session Management, you need to configure your Clerk Publishable Key in the Next.js environment.
              </p>
            </div>
            
            <div className="text-left bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl p-5 border border-slate-800 shadow-inner relative overflow-hidden">
              <div className="absolute top-3 right-3 text-slate-600 select-none text-[10px] uppercase font-bold tracking-wider">.env.local</div>
              <p className="text-slate-500 mb-2"># Add your Clerk API keys from dashboard.clerk.com</p>
              <p className="text-primary-container">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<span className="text-success">pk_test_...</span></p>
              <p className="text-primary-container">CLERK_SECRET_KEY=<span className="text-success">sk_test_...</span></p>
            </div>

            <div className="space-y-4">
              <a 
                href="https://dashboard.clerk.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-semibold text-sm py-3 px-6 rounded-2xl hover-lift active:scale-95 duration-200 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">launch</span>
                Open Clerk Dashboard
              </a>
              <p className="text-xs text-text-muted">
                After saving your keys in <code className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">TrueLens/.env.local</code>, restart the development server.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ApiClientTokenProvider />
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
