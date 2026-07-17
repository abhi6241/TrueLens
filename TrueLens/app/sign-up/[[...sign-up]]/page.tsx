import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Logo / Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[24px]">visibility</span>
            </div>
            <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">TrueLens AI</span>
          </Link>
          <p className="font-body-md text-body-md text-text-muted">
            Create an account to start analyzing news transparency.
          </p>
        </div>

        {/* Glassmorphic Clerk Container */}
        <div className="w-full bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden p-1 flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "shadow-none bg-transparent w-full",
                card: "bg-transparent shadow-none p-6 w-full",
                headerTitle: "text-on-surface font-bold text-xl",
                headerSubtitle: "text-text-muted text-sm",
                socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50/80 text-on-surface font-semibold text-sm transition-all duration-200 py-2.5 rounded-xl",
                formButtonPrimary: "bg-primary hover:bg-primary-container text-white font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-[1px] active:translate-y-[1px] shadow-sm",
                footerActionLink: "text-primary hover:text-primary-container font-semibold transition-all duration-200",
                formFieldLabel: "text-on-surface font-medium text-xs mb-1.5",
                formFieldInput: "bg-white/80 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-normal text-sm py-2.5 px-3.5 transition-all outline-none",
                dividerLine: "bg-slate-200",
                dividerText: "text-text-muted text-xs uppercase"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
