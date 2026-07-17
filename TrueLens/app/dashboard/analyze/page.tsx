'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
  const [fileSize, setFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(0);
    setStepStatuses({ 1: 'active', 2: 'pending', 3: 'pending' });

    try {
      const handleProgress = (status: any) => {
        setProgress(status.progress);
        
        // Update steps dynamically based on progress
        if (status.progress > 0 && status.progress < 30) {
          setStepStatuses({ 1: 'active', 2: 'pending', 3: 'pending' });
        } else if (status.progress >= 30 && status.progress < 80) {
          setStepStatuses({ 1: 'completed', 2: 'active', 3: 'pending' });
        } else if (status.progress >= 80 && status.progress < 100) {
          setStepStatuses({ 1: 'completed', 2: 'completed', 3: 'active' });
        } else if (status.progress === 100) {
          setStepStatuses({ 1: 'completed', 2: 'completed', 3: 'completed' });
        }
      };

      let res;
      if (url) {
        res = await api.analyzeUrl(url, handleProgress);
      } else if (file) {
        res = await api.analyzeFile(file, handleProgress);
      } else {
        throw new Error("No URL or file provided.");
      }

      toast.success("Analysis completed successfully!");
      
      // Small delay for UI smoothness before redirect
      setTimeout(() => {
        router.push(`/dashboard/analyze/result?id=${res.id}`);
      }, 500);
      
    } catch (err: any) {
      toast.error(err.message || "An error occurred during analysis");
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAnalyzing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isAnalyzing) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setFileHelper(file);
      } else {
        setError("Only PDF files are currently supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileHelper(file);
    }
  };

  const setFileHelper = (file: File) => {
    // 10MB limit (10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB.");
      return;
    }
    
    setSelectedFile(file);
    setFileName(file.name);
    
    // Format file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB < 1) {
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    } else {
      setFileSize(`${sizeInMB.toFixed(2)} MB`);
    }
    
    setHasFile(true);
    setError(null);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setFileName('');
    setFileSize('');
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
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('pdf-input')?.click()}
                    className={`border-2 border-dashed rounded-[20px] bg-surface-secondary flex flex-col items-center justify-center py-16 px-4 text-center cursor-pointer transition-all duration-200 group ${
                      isDragging 
                        ? 'border-primary bg-primary/5 scale-[0.99]' 
                        : 'border-border-subtle hover:border-primary/50'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="pdf-input" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
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
                    className="border border-border-subtle rounded-[20px] bg-surface-secondary p-6 flex flex-col md:flex-row gap-4 items-center justify-between"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-12 h-16 bg-error-container rounded flex items-center justify-center text-on-error-container select-none shrink-0">
                        <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[250px] md:max-w-[320px]">{fileName}</p>
                        <p className="font-label-sm text-label-sm text-text-muted">{fileSize}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      <button 
                        type="button"
                        onClick={resetUpload}
                        className="font-label-sm text-label-sm text-text-muted hover:text-danger px-3 py-2 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('pdf-input')?.click()}
                        className="font-label-sm text-label-sm text-text-muted hover:text-primary px-3 py-2 transition-colors cursor-pointer"
                      >
                        Replace
                      </button>
                      <button 
                        type="button"
                        onClick={() => triggerAnalysisFlow(null, selectedFile)}
                        className="bg-primary-container text-on-primary-container font-label-md text-label-md rounded-lg px-6 py-2 hover:bg-primary-container/95 transition-colors cursor-pointer"
                      >
                        Analyze
                      </button>
                    </div>
                    {/* Hidden input to support replacing */}
                    <input 
                      type="file" 
                      id="pdf-input" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* Loading Timeline View with Progress Bar */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col gap-6"
          >
            <h3 className="font-headline-md text-headline-md font-bold text-center text-primary animate-pulse">
              Analyzing Document...
            </h3>
            
            {/* Real Progress Bar */}
            <div className="w-full max-w-md mx-auto flex flex-col gap-2 mb-4">
              <div className="w-full bg-surface-secondary h-2.5 rounded-full overflow-hidden border border-border-subtle">
                <motion.div 
                  className="bg-primary h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between font-label-sm text-label-sm text-text-muted px-1">
                <span>Ingesting Content</span>
                <span>{progress}%</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 ml-8 max-w-md mx-auto">
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
