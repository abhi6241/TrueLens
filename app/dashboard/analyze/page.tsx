'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';

type Tab = 'url' | 'pdf';
type StepStatus = 'pending' | 'active' | 'completed';

interface Step {
  id: number;
  label: string;
  activeLabel: string;
  icon: string;
}

const timelineSteps: Step[] = [
  { id: 1, label: 'Connecting to Article Source', activeLabel: 'Fetching Source HTML', icon: 'sync' },
  { id: 2, label: 'Extracting Content & Metadata', activeLabel: 'Parsing Text Body', icon: 'subject' },
  { id: 3, label: 'Running AI Multi-Lens Models', activeLabel: 'Evaluating Bias & Claims', icon: 'psychology' },
];

function AnalyzeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<Tab>('url');
  const [urlInput, setUrlInput] = useState('');
  
  // PDF state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Timeline step statuses
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepStatus>>({
    1: 'pending',
    2: 'pending',
    3: 'pending',
  });

  // Check query parameter 'url' on mount
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrlInput(urlParam);
      // Auto-trigger analysis if URL is provided
      triggerAnalysisFlow(urlParam, null);
    }
  }, [searchParams]);

  const triggerAnalysisFlow = async (url: string | null, file: File | null) => {
    setIsAnalyzing(true);
    setError(null);
    setStepStatuses({ 1: 'active', 2: 'pending', 3: 'pending' });

    let apiResultId = '';
    let apiCompleted = false;

    // Start API request in parallel
    const apiPromise = (async () => {
      try {
        let res;
        if (url) {
          res = await api.analyzeUrl(url);
        } else if (file) {
          res = await api.analyzeFile(file);
        } else {
          throw new Error("No URL or file provided for analysis.");
        }
        apiResultId = res.id;
        apiCompleted = true;
      } catch (err: any) {
        console.error("Analysis API failed:", err);
        throw new Error(err.response?.data?.detail || "Could not analyze the document. Check backend connection.");
      }
    })();

    try {
      // Simulate step 1
      await new Promise(resolve => setTimeout(resolve, 1200));
      setStepStatuses(prev => ({ ...prev, 1: 'completed', 2: 'active' }));

      // Simulate step 2
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStepStatuses(prev => ({ ...prev, 2: 'completed', 3: 'active' }));

      // Wait for both step 2 simulation and API to finish
      await apiPromise;

      // Simulate step 3 completion
      setStepStatuses(prev => ({ ...prev, 3: 'completed' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to result page
      router.push(`/dashboard/analyze/result?id=${apiResultId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'url' && urlInput.trim()) {
      triggerAnalysisFlow(urlInput.trim(), null);
    } else if (activeTab === 'pdf' && hasFile && selectedFile) {
      triggerAnalysisFlow(null, selectedFile);
    }
  };

  const handleTryExample = (example: string) => {
    const mockUrls: Record<string, string> = {
      'Tech Trends 2024': 'https://globaltechnews.com/articles/unseen-costs-ai-adoption',
      'Global Markets': 'https://economicshifts.org/market-reactions-fed-rate-hike'
    };
    setUrlInput(mockUrls[example] || '');
  };

  const simulateUpload = () => {
    // Generate a mock file object
    const file = new File(["mock content"], "global-tech-trends.pdf", { type: "application/pdf" });
    setSelectedFile(file);
    setFileName(file.name);
    setHasFile(true);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setFileName('');
    setHasFile(false);
  };

  return (
    <div className="w-full max-w-3xl glass-card p-8 md:p-12 transition-all duration-300">
      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span className="font-label-sm text-label-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-stack-lg">
        <div className="bg-surface-secondary rounded-lg p-1 flex w-64 border border-border-subtle relative h-11">
          {/* Active Indicator Slide */}
          <motion.div 
            className="absolute left-1 top-1 bottom-1 bg-surface-primary rounded shadow-sm border border-border-subtle"
            initial={false}
            animate={{ 
              x: activeTab === 'url' ? 0 : '100%',
              width: 'calc(50% - 4px)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button 
            type="button"
            onClick={() => !isAnalyzing && setActiveTab('url')}
            className={`flex-grow relative z-10 py-1.5 font-label-md text-label-md text-center transition-colors duration-200 cursor-pointer ${
              activeTab === 'url' ? 'text-primary font-semibold' : 'text-text-muted'
            }`}
          >
            News URL
          </button>
          <button 
            type="button"
            onClick={() => !isAnalyzing && setActiveTab('pdf')}
            className={`flex-grow relative z-10 py-1.5 font-label-md text-label-md text-center transition-colors duration-200 cursor-pointer ${
              activeTab === 'pdf' ? 'text-primary font-semibold' : 'text-text-muted'
            }`}
          >
            PDF Upload
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isAnalyzing ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'url' ? (
              /* URL Input View */
              <form onSubmit={handleAnalyze} className="w-full">
                <div className="relative flex items-center mb-stack-md">
                  <span className="material-symbols-outlined absolute left-4 text-text-muted">link</span>
                  <input 
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste article URL here..." 
                    className="w-full bg-surface-secondary border border-border-subtle rounded-[20px] py-4 pl-12 pr-36 focus:outline-none focus:ring-2 focus:ring-primary/20 font-body-md text-body-md text-on-surface placeholder:text-text-muted h-14"
                    required
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-primary-container text-on-primary-container rounded-xl px-6 font-label-md text-label-md hover:bg-primary-container/95 transition-colors active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    Analyze <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-text-muted">
                  <span className="font-label-sm text-label-sm">Try examples:</span>
                  <button 
                    type="button"
                    onClick={() => handleTryExample('Tech Trends 2024')}
                    className="font-label-sm text-label-sm hover:text-primary transition-colors border border-border-subtle rounded-full px-3 py-1 bg-surface cursor-pointer hover:bg-surface-primary"
                  >
                    Tech Trends 2024
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleTryExample('Global Markets')}
                    className="font-label-sm text-label-sm hover:text-primary transition-colors border border-border-subtle rounded-full px-3 py-1 bg-surface cursor-pointer hover:bg-surface-primary"
                  >
                    Global Markets
                  </button>
                </div>
              </form>
            ) : (
              /* PDF Upload View */
              <div className="w-full">
                {!hasFile ? (
                  <div 
                    onClick={simulateUpload}
                    className="border-2 border-dashed border-border-subtle rounded-[20px] bg-surface-secondary flex flex-col items-center justify-center py-16 px-4 text-center cursor-pointer hover:border-primary/50 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-4xl text-text-muted mb-4 group-hover:text-primary transition-colors">upload_file</span>
                    <p className="font-headline-md text-headline-md text-on-surface mb-2">Drag &amp; Drop your News PDF here</p>
                    <p className="font-body-md text-body-md text-text-muted mb-6">or click to browse from your computer</p>
                    <button 
                      type="button"
                      className="bg-surface-primary border border-border-subtle text-on-surface font-label-md text-label-md rounded-lg px-6 py-2 shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      Select File
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="border border-border-subtle rounded-[20px] bg-surface-secondary p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-error-container rounded flex items-center justify-center text-on-error-container select-none">
                        <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold truncate w-48">{fileName}</p>
                        <p className="font-label-sm text-label-sm text-text-muted">2.4 MB • 12 pages</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={resetUpload}
                        className="font-label-sm text-label-sm text-text-muted hover:text-danger px-3 py-2 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerAnalysisFlow(null, selectedFile)}
                        className="bg-primary-container text-on-primary-container font-label-md text-label-md rounded-lg px-6 py-2 hover:bg-primary-container/95 transition-colors cursor-pointer"
                      >
                        Analyze
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* Loading Timeline View */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col gap-8"
          >
            <h3 className="font-headline-md text-headline-md font-bold mb-4 text-center text-primary animate-pulse">
              Analyzing Document...
            </h3>
            
            <div className="flex flex-col gap-6 ml-8">
              {timelineSteps.map((step) => {
                const status = stepStatuses[step.id];
                const isActive = status === 'active';
                const isCompleted = status === 'completed';
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-4 transition-opacity duration-300 ${
                      status === 'pending' ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    {/* Circle indicator */}
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-surface relative ${
                        isCompleted
                          ? 'border-success'
                          : isActive
                            ? 'border-primary'
                            : 'border-border-subtle'
                      }`}
                    >
                      <span 
                        className={`material-symbols-outlined text-sm ${
                          isCompleted
                            ? 'text-success'
                            : isActive
                              ? 'text-primary animate-spin'
                              : 'text-text-muted'
                        }`}
                      >
                        {isCompleted ? 'check' : step.icon}
                      </span>
                    </div>
                    
                    {/* Step Text Label */}
                    <span 
                      className={`font-label-md text-label-md ${
                        isCompleted
                          ? 'text-success font-semibold'
                          : isActive
                            ? 'text-primary font-bold'
                            : 'text-text-muted'
                      }`}
                    >
                      {isActive ? step.activeLabel : step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <div className="pt-16 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col items-center select-none">
      <div className="text-center mb-stack-lg w-full max-w-2xl">
        <h1 className="font-display text-display text-on-surface mb-stack-sm font-bold">Analyze Article</h1>
        <p className="font-body-lg text-body-lg text-text-muted">Uncover bias, verify facts, and reveal the truth behind the news.</p>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-3xl glass-card p-12 text-center text-text-muted font-body-md">
          Loading analyzer...
        </div>
      }>
        <AnalyzeForm />
      </Suspense>
    </div>
  );
}
