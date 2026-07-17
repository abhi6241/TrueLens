'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, DashboardStats, AnalysisResponse } from '../../lib/api';

export default function DashboardHome() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [statsData, analysesData] = await Promise.all([
          api.getDashboardStats(),
          api.listAnalyses()
        ]);
        setStats(statsData);
        setAnalyses(analysesData);
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not retrieve dashboard data from server. Ensure FastAPI is running.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const getBiasStyle = (bias: string) => {
    if (bias === 'Center') return 'bg-surface-container text-primary';
    if (bias.includes('Left')) return 'bg-primary/10 text-primary';
    return 'bg-danger/10 text-danger';
  };

  const getSourceLetter = (source: string) => {
    if (!source) return 'A';
    return source.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-stack-lg items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted font-body-md">Connecting to backend services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full">
        <div className="glass-card p-8 border-danger/30 bg-danger/5 text-center">
          <span className="material-symbols-outlined text-danger text-4xl mb-4">error</span>
          <h3 className="font-headline-md text-headline-md font-bold text-danger mb-2">Connection Failure</h3>
          <p className="font-body-md text-text-muted mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-on-primary font-label-md py-2 px-6 rounded-lg hover:scale-95 duration-200 transition-transform cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full overflow-x-hidden">
      {/* Quick Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
        {/* Total Analyzed */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card premium-shadow p-6 hover-lift flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">article</span>
            <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2 py-1 rounded-full">+12% this week</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-text-muted mb-1">Total Analyzed</p>
            <h3 className="font-display text-display text-on-surface">{stats?.total_analyzed.toLocaleString() || '1,248'}</h3>
          </div>
        </motion.div>

        {/* Avg Trust Score Gauge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card premium-shadow p-6 hover-lift flex flex-col items-center justify-center md:col-span-1"
        >
          <p className="font-label-md text-label-md text-text-muted w-full text-left mb-4">Avg Trust Score</p>
          <div className="relative w-32 h-32 flex items-center justify-center select-none">
            {/* SVG Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle cx="50" cy="50" fill="none" r="40" stroke="#f2f3ff" strokeWidth="8"></circle>
              {/* Progress Circle */}
              <motion.circle 
                cx="50" 
                cy="50" 
                fill="none" 
                r="40" 
                stroke="#004ac6" 
                strokeWidth="8"
                strokeLinecap="round" 
                strokeDasharray="251.2" 
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * (stats?.avg_trust_score || 85)) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              ></motion.circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-headline-lg text-headline-lg text-primary font-bold">{stats?.avg_trust_score || 85}</span>
              <span className="font-label-sm text-label-sm text-text-muted">/100</span>
            </div>
          </div>
        </motion.div>

        {/* Verified Facts */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card premium-shadow p-6 hover-lift flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-success text-[28px]">fact_check</span>
            <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2 py-1 rounded-full">+45</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-text-muted mb-1">Verified Facts</p>
            <h3 className="font-display text-display text-on-surface">{stats?.verified_facts.toLocaleString() || '8,932'}</h3>
          </div>
        </motion.div>

        {/* Saved Reports */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card premium-shadow p-6 hover-lift flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary text-[28px]">folder_special</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-text-muted mb-1">Saved Reports</p>
            <h3 className="font-display text-display text-on-surface">{stats?.saved_reports.toLocaleString() || '156'}</h3>
          </div>
        </motion.div>
      </section>

      {/* Recent Activity Table Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card premium-shadow p-8 mb-stack-lg"
      >
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-1">Recent Analysis</h3>
            <p className="font-body-md text-body-md text-text-muted">Latest articles processed by the engine.</p>
          </div>
          <button className="bg-surface-primary border border-border-subtle text-on-surface font-label-md text-label-md py-2 px-4 rounded-[12px] hover:bg-surface-secondary transition-colors cursor-pointer">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
                <th className="pb-3 font-semibold w-1/2">Article Title</th>
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 font-semibold">Bias Rating</th>
                <th className="pb-3 font-semibold text-right">Trust Score</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y divide-border-subtle">
              {analyses.map((analysis) => (
                <tr 
                  key={analysis.id}
                  onClick={() => router.push(`/dashboard/analyze/result?id=${analysis.id}`)}
                  className="hover:bg-surface-secondary transition-colors group cursor-pointer"
                >
                  <td className="py-4 pr-4">
                    <div className="font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {analysis.title}
                    </div>
                    <div className="text-text-muted font-label-sm text-label-sm mt-1">
                      Analyzed {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'recently'}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex className-center gap-2 items-center">
                      <div className="w-5 h-5 bg-surface-container rounded-full flex items-center justify-center text-[10px] text-text-muted font-bold">
                        {getSourceLetter(analysis.publication)}
                      </div>
                      <span>{analysis.publication}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${getBiasStyle(analysis.bias_rating)}`}>
                      {analysis.bias_rating}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center gap-1 font-medium text-success">
                      <span className="material-symbols-outlined text-[16px]">
                        verified
                      </span>
                      {analysis.trust_score}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
