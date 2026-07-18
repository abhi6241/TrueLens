'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api, AnalysisResponse } from '../../lib/api';

interface AnalysesTableProps {
  title: string;
  subtitle: string;
  isBookmarkedOnly?: boolean;
}

export default function AnalysesTable({ title, subtitle, isBookmarkedOnly = false }: AnalysesTableProps) {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and Sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      const data = await api.listAnalyses({
        search,
        sort_by: sortBy,
        order,
        is_bookmarked: isBookmarkedOnly ? true : undefined,
        limit: 100
      });
      setAnalyses(data);
    } catch (err: any) {
      console.error("Failed to load analyses:", err);
      setError("Could not retrieve data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [search, sortBy, order, isBookmarkedOnly]);

  const handleToggleBookmark = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
    try {
      const result = await api.toggleBookmark(id);
      setAnalyses(prev => {
        if (isBookmarkedOnly && !result.is_bookmarked) {
          // If on bookmarks page and we unbookmark, remove from list
          return prev.filter(a => a.id !== id);
        }
        // Otherwise, update the state
        return prev.map(a => a.id === id ? { ...a, is_bookmarked: result.is_bookmarked } : a);
      });
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this analysis?")) return;
    
    try {
      await api.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete analysis", err);
    }
  };

  const getBiasStyle = (bias: string) => {
    if (bias === 'Center') return 'bg-surface-container text-primary';
    if (bias.includes('Left')) return 'bg-primary/10 text-primary';
    return 'bg-danger/10 text-danger';
  };

  const getSourceLetter = (source: string) => {
    if (!source) return 'A';
    return source.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full min-h-screen overflow-x-hidden">
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-shadow p-8 mb-stack-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="font-display text-display text-on-surface font-bold mb-2">{title}</h1>
            <p className="font-body-lg text-body-lg text-text-muted">{subtitle}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-lg">search</span>
              <input 
                type="text" 
                placeholder="Search title, publication..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-secondary border border-border-subtle rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-primary/50 text-sm font-body-md text-on-surface placeholder:text-text-muted"
              />
            </div>
            
            {/* Sort By */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm text-on-surface font-body-md focus:outline-none cursor-pointer"
            >
              <option value="created_at">Date</option>
              <option value="trust_score">Trust Score</option>
            </select>
            
            {/* Order */}
            <button 
              onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
              className="bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 flex items-center justify-center hover:bg-surface-primary transition-colors cursor-pointer text-text-muted"
              title={`Sort ${order === 'desc' ? 'Descending' : 'Ascending'}`}
            >
              <span className="material-symbols-outlined text-lg">
                {order === 'desc' ? 'arrow_downward' : 'arrow_upward'}
              </span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-danger/10 text-danger rounded-lg text-center font-label-md">{error}</div>
        ) : isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-text-muted text-sm font-body-md">Loading records...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4">inbox</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">No records found</h3>
            <p className="text-text-muted font-body-md">Adjust your search filters or start a new analysis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="pb-3 font-semibold w-5/12">Article Title</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Bias Rating</th>
                  <th className="pb-3 font-semibold text-center">Trust Score</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-border-subtle">
                <AnimatePresence>
                  {analyses.map((analysis) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={analysis.id}
                      onClick={() => router.push(`/dashboard/analyze/result?id=${analysis.id}`)}
                      className="hover:bg-surface-secondary transition-colors group cursor-pointer"
                    >
                      <td className="py-4 pr-4">
                        <div className="font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {analysis.title}
                        </div>
                        <div className="text-text-muted font-label-sm text-label-sm mt-1">
                          {new Date(analysis.created_at).toLocaleDateString()} at {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2 items-center">
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
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1 font-medium text-success">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          {analysis.trust_score}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => handleToggleBookmark(e, analysis.id)}
                            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-text-muted hover:text-primary cursor-pointer"
                            title={analysis.is_bookmarked ? "Remove Bookmark" : "Add Bookmark"}
                          >
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: analysis.is_bookmarked ? "'FILL' 1" : undefined }}>
                              bookmark
                            </span>
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, analysis.id)}
                            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-text-muted hover:text-danger cursor-pointer"
                            title="Delete Analysis"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </div>
  );
}
