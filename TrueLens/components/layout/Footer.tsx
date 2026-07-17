export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-border-subtle bg-surface mt-auto">
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="col-span-1 md:col-span-2">
          <div className="font-headline-md text-headline-md font-bold text-primary mb-4 flex items-center gap-2">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2PpLq_J2Wth2QV7rHMUYUgnq5oVEewmnc-njO2tQfwg89nhInyfyScVU-tB_m4kQD723-bx8Fb8H16P8GcTRPc5fgzfafZA5DKve2U_-0n-4GvpbPKAJCaYYpm5mVIFGzBaXFFMvjJ0zAOH3Rqyl2M5omsr59cpCKOZl2TnLJQsF3tNmS_iQevUvQH952GHvGG6BqxD2SNa5G6R3KnA_7lfNVvB8LtwxMgkKkfVOmtLXeYvgoQqjV" 
              alt="TrueLens Logo" 
              className="w-6 h-6 object-contain"
            />
            TrueLens AI
          </div>
          <p className="font-body-md text-body-md text-text-muted">© 2024 TrueLens AI. Truth through transparency.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <a href="#" className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors">Terms</a>
          <a href="#" className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors">Security</a>
        </div>
        
        <div className="flex flex-col gap-3">
          <a className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors" href="#">Contact</a>
          <a className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors" href="#">API</a>
          <a className="font-label-sm text-label-sm text-text-muted hover:text-primary transition-colors" href="#">Documentation</a>
        </div>
      </div>
    </footer>
  );
}
