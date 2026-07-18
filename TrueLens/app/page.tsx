'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      router.push(`/dashboard/analyze?url=${encodeURIComponent(urlInput.trim())}`);
    } else {
      router.push('/dashboard/analyze');
    }
  };

  const handleTryExample = (example: string) => {
    const mockUrls: Record<string, string> = {
      'Tech Trends 2024': 'https://globaltechnews.com/articles/unseen-costs-ai-adoption',
      'Global Markets': 'https://economicshifts.org/market-reactions-fed-rate-hike'
    };
    const url = mockUrls[example] || '';
    router.push(`/dashboard/analyze?url=${encodeURIComponent(url)}`);
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20 overflow-x-hidden">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop pt-20 pb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-primary-container font-label-sm text-label-sm border border-primary-fixed mb-4"
            >
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>AI-Powered News Transparency</span>
            </motion.div>
            
            <h1 className="font-display text-display text-on-background tracking-tight">
              See Beyond the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Headlines</span>
            </h1>
            
            <p className="font-body-lg text-body-lg text-text-muted max-w-2xl mx-auto">
              TrueLens uses advanced AI to instantly detect political bias, verify facts, and provide a neutral summary of any news article. Filter the noise. Find the truth.
            </p>
            
            {/* Analyze Input Bar */}
            <form onSubmit={handleAnalyze} className="mt-10 relative max-w-2xl mx-auto">
              <div className="flex items-center bg-surface-primary border border-border-subtle rounded-[20px] p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-container/20 focus-within:border-primary-container transition-all">
                <span className="material-symbols-outlined text-text-muted ml-3">link</span>
                <input 
                  type="text" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste article URL here..." 
                  className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-body-md px-4 outline-none text-on-background placeholder:text-text-muted h-12"
                />
                <button 
                  type="submit"
                  className="font-label-md text-label-md text-on-primary bg-primary-container rounded-[12px] px-6 py-3 hover-lift shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Analyze Article
                </button>
              </div>
            </form>

            {/* Try Examples */}
            <div className="flex items-center justify-center gap-2 mt-4 text-text-muted select-none">
              <span className="font-label-sm text-label-sm">Try examples:</span>
              <button 
                onClick={() => handleTryExample('Tech Trends 2024')}
                className="font-label-sm text-label-sm hover:text-primary transition-colors border border-border-subtle rounded-full px-3 py-1 bg-surface cursor-pointer hover:bg-surface-primary"
              >
                Tech Trends 2024
              </button>
              <button 
                onClick={() => handleTryExample('Global Markets')}
                className="font-label-sm text-label-sm hover:text-primary transition-colors border border-border-subtle rounded-full px-3 py-1 bg-surface cursor-pointer hover:bg-surface-primary"
              >
                Global Markets
              </button>
            </div>
          </motion.div>
        </section>
        
        {/* Bento Grid Features Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-20 bg-surface-secondary rounded-[32px]">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Comprehensive Analysis</h2>
            <p className="font-body-md text-body-md text-text-muted">Four powerful lenses to evaluate every story.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Political Bias (Spans 2 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-surface-primary rounded-[20px] border border-border-subtle p-8 soft-shadow hover-lift flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined">balance</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-2">Political Bias Detection</h3>
                  <p className="font-body-md text-body-md text-text-muted max-w-sm">Identifies subtle framing, loaded language, and partisan leaning in the text.</p>
                </div>
                <div className="hidden sm:block">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <path d="M 10 90 A 40 40 0 0 1 90 90" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round"></path>
                    <motion.path 
                      d="M 10 90 A 40 40 0 0 1 50 50" 
                      fill="none" 
                      stroke="#2563EB" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      strokeDasharray="80" 
                      initial={{ strokeDashoffset: 80 }}
                      whileInView={{ strokeDashoffset: 20 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    ></motion.path>
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* Fact Check (1 column) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="bg-surface-primary rounded-[20px] border border-border-subtle p-8 soft-shadow hover-lift flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined">fact_check</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-2">Fact Verification</h3>
                <p className="font-body-md text-body-md text-text-muted">Cross-references claims against trusted global databases.</p>
              </div>
            </motion.div>
            
            {/* Trust Score (1 column) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="bg-surface-primary rounded-[20px] border border-border-subtle p-8 soft-shadow hover-lift flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-success mb-4 group-hover:bg-success group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-2">Source Trust Score</h3>
                <p className="font-body-md text-body-md text-text-muted">Evaluates author history and publication reliability metrics.</p>
              </div>
            </motion.div>
            
            {/* Neutral Summary (Spans 2 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2 bg-surface-primary rounded-[20px] border border-border-subtle p-8 soft-shadow hover-lift flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant mb-4 group-hover:bg-on-surface-variant group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined">summarize</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-2">Neutral Summary</h3>
                <p className="font-body-md text-body-md text-text-muted max-w-2xl">Strips away emotive language and editorializing to present just the core facts of the story in a concise, objective format.</p>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-border-subtle z-0"></div>
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-surface-primary border border-border-subtle shadow-sm flex items-center justify-center font-headline-md text-headline-md text-primary mb-6">1</div>
              <h4 className="font-headline-md text-headline-md text-on-background mb-3">Paste URL</h4>
              <p className="font-body-md text-body-md text-text-muted">Simply paste the link to any news article or opinion piece you want to verify.</p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-surface-primary border border-border-subtle shadow-sm flex items-center justify-center font-headline-md text-headline-md text-primary mb-6">2</div>
              <h4 className="font-headline-md text-headline-md text-on-background mb-3">AI Analysis</h4>
              <p className="font-body-md text-body-md text-text-muted">Our models instantly scan the text for bias, logical fallacies, and factual accuracy.</p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-surface-primary border border-border-subtle shadow-sm flex items-center justify-center font-headline-md text-headline-md text-primary mb-6">3</div>
              <h4 className="font-headline-md text-headline-md text-on-background mb-3">Transparency Report</h4>
              <p className="font-body-md text-body-md text-text-muted">Receive a comprehensive, easy-to-read dashboard detailing the article's profile.</p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
