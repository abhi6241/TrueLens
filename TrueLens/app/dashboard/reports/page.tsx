'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api, DashboardStats, AnalysisResponse } from '../../../lib/api';

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, listData] = await Promise.all([
          api.getDashboardStats(),
          api.listAnalyses({ limit: 100 })
        ]);
        setStats(statsData);
        setAnalyses(listData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Bias Distribution
  const biasCounts = analyses.reduce((acc, curr) => {
    let b = curr.bias_rating;
    if (b.includes("Left")) b = "Left-Leaning";
    else if (b.includes("Right")) b = "Right-Leaning";
    else b = "Center";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = analyses.length || 1;

  if (isLoading) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full min-h-screen overflow-x-hidden">
      <div className="mb-stack-lg">
        <h1 className="font-display text-display text-on-surface font-bold mb-2">Analysis Reports</h1>
        <p className="font-body-lg text-body-lg text-text-muted">Aggregate metrics and insights across your reading history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Bias Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card premium-shadow p-8 flex flex-col justify-between"
        >
          <div className="mb-6">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">Bias Distribution</h3>
            <p className="font-body-md text-text-muted">Breakdown of political leanings in your analyzed articles.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {['Left-Leaning', 'Center', 'Right-Leaning'].map((label) => {
              const count = biasCounts[label] || 0;
              const percentage = Math.round((count / total) * 100);
              const color = label === 'Center' ? 'bg-primary' : label === 'Left-Leaning' ? 'bg-secondary' : 'bg-danger';
              
              return (
                <div key={label}>
                  <div className="flex justify-between font-label-sm text-text-muted mb-2">
                    <span>{label}</span>
                    <span>{percentage}% ({count})</span>
                  </div>
                  <div className="w-full bg-surface-secondary h-3 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Fact Verification Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card premium-shadow p-8 flex flex-col items-center text-center justify-center"
        >
          <span className="material-symbols-outlined text-[48px] text-success mb-4">verified_user</span>
          <h2 className="font-display text-display text-on-surface font-bold mb-2">
            {stats?.verified_facts.toLocaleString() || 0}
          </h2>
          <p className="font-headline-sm text-text-muted mb-4">Total Verified Facts Extracted</p>
          <p className="font-body-md text-on-surface-variant max-w-sm">
            Across {stats?.total_analyzed || 0} documents, TrueLens AI has cross-referenced thousands of claims against verified databases.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
