'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, AnalysisResponse } from '../../../../lib/api';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [report, setReport] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!id) {
        setError("No analysis ID specified in the URL.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await api.getAnalysis(id);
        setReport(data);
      } catch (err: any) {
        console.error("Failed to load analysis report:", err);
        setError(err.response?.data?.detail || "Could not retrieve report from server. Make sure the API is running.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const getBiasPosition = (bias: string) => {
    switch (bias) {
      case 'Left': return '20%';
      case 'Lean Left': return '35%';
      case 'Center': return '50%';
      case 'Lean Right': return '65%';
      case 'Right': return '80%';
      default: return '50%';
    }
  };

  const getSourceLetter = (source: string) => {
    if (!source) return 'A';
    return source.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-stack-lg items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted font-body-md">Retrieving transparency report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full">
        <div className="glass-card p-8 border-danger/30 bg-danger/5 text-center">
          <span className="material-symbols-outlined text-danger text-4xl mb-4">error</span>
          <h3 className="font-headline-md text-headline-md font-bold text-danger mb-2">Report Error</h3>
          <p className="font-body-md text-text-muted mb-6">{error || "Transparency report could not be loaded."}</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-surface-primary border border-border-subtle text-on-surface font-label-md py-2 px-6 rounded-lg hover:bg-surface-secondary cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary font-label-md py-2 px-6 rounded-lg hover:scale-95 duration-200 transition-transform cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto w-full px-margin-desktop py-stack-lg flex flex-col gap-stack-lg overflow-x-hidden select-none">
      {/* Article Header */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-gutter items-start"
      >
        <div className="flex-1 flex flex-col gap-stack-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-surface border border-border-subtle flex items-center justify-center font-bold text-primary">
              {getSourceLetter(report.publication)}
            </div>
            <span className="font-label-md text-label-md text-text-muted uppercase tracking-wider">{report.publication}</span>
            <span className="text-text-muted">•</span>
            <span className="font-label-md text-label-md text-text-muted">{report.published_date}</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface leading-tight">
            {report.title}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <img 
              className="w-10 h-10 rounded-full border border-border-subtle object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAceWWSnCCrOnz21q4UAlWpADUINQL9paL9rss4J73Dzqd42bwK-nWZ78XumfQ4jEUbSg8Ukw8xWOZy89eiGn6NN9snLonK3cUMzlmXFGzVeBREcoyp_XOB5m5DcYv3nkXo0f9WLS04xhXyKgYwL5A0dV74v4ypPtj9_OJb8euckCw2PxWjZIu7A91skJS_cvu2X53-0Nq9jAScqBIP5sxyFnSJFz_iyMNK9ZBHCBeaNXh7RZU-OBjH"
              alt={report.author}
            />
            <div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">{report.author}</div>
              <div className="font-label-sm text-label-sm text-text-muted">Correspondent Profile</div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden border border-border-subtle premium-shadow">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtKUXV1472YWNM2yQPKCKTEYamyC3uFS9HI8shY7EwWLrxGMvSY60-l2v0KuEOP1c1qmPDCnErTp3fhISLGCoTYAhx_A2giorjafAyhwTzdMRIZiTpx3UAZVa3hbXJtO6DUsw2Kas_oFfPzslDDdCPvkwEVbKYpJySMY18leWI4yOsC8otXBJdHARc1BVY_rSbafqMkAB-ImuRkLOMKE15haAx2sORhHoU3jg3Hi64enLT6fe7Z2gu"
            alt="AI illustration"
          />
        </div>
      </motion.section>

      {/* Main Metrics Grid (Bento) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Trust Score */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-1 md:col-span-4 bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex flex-col items-center justify-center"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-6 self-start w-full">Trust Score</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="#E2E8F0" strokeWidth="8"></circle>
              <motion.circle 
                cx="50" 
                cy="50" 
                fill="none" 
                r="45" 
                stroke="#004ac6" 
                strokeWidth="8"
                strokeLinecap="round" 
                strokeDasharray="283" 
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * report.trust_score) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              ></motion.circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-display text-primary font-bold text-4xl">{report.trust_score}</span>
              <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
          <p className="font-label-md text-label-md text-text-muted text-center mt-6">
            {report.trust_score >= 85 
              ? "Highly credible source, well cited and peer-verified."
              : "Generally reliable, with minor sourcing ambiguities."}
          </p>
        </motion.div>

        {/* Bias Meter */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1 md:col-span-4 bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex flex-col"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-6">Political Bias</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative h-2 w-full bg-surface-container rounded-full mb-8">
              {/* Center mark */}
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-4 bg-text-muted rounded-full"></div>
              {/* Indicator */}
              <motion.div 
                initial={{ left: "50%" }}
                animate={{ left: getBiasPosition(report.bias_rating) }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-md border-2 border-surface"
              ></motion.div>
            </div>
            <div className="flex justify-between font-label-md text-label-md text-text-muted">
              <span>Left</span>
              <span>Center</span>
              <span>Right</span>
            </div>
            <div className="mt-8 p-4 bg-surface-secondary rounded-lg border border-border-subtle">
              <div className="font-label-sm text-label-sm text-primary font-bold mb-1 uppercase tracking-wider">Analysis</div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Evaluated as **{report.bias_rating}**. 
                {report.bias_rating.includes('Left') && " Emphasizes labor impact over corporate efficiency metrics."}
                {report.bias_rating.includes('Right') && " Places emphasis on corporate liberty and rate market metrics."}
                {report.bias_rating === 'Center' && " Presents balanced view points from multiple perspectives."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sentiment & Flags */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-1 md:col-span-4 flex flex-col gap-gutter"
        >
          {/* Sentiment */}
          <div className="bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex-1 flex flex-col justify-center">
            <h3 className="font-label-md text-label-md text-text-muted uppercase tracking-wider mb-2">Sentiment Tone</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface text-2xl">{report.sentiment_tone}</span>
              <span className={`font-body-md text-body-md mb-1 flex items-center gap-1 ${
                report.sentiment_score >= 0 ? 'text-success' : 'text-warning'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {report.sentiment_score >= 0 ? 'trending_up' : 'trending_down'}
                </span> 
                {report.sentiment_score}
              </span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.abs(report.sentiment_score) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${report.sentiment_score >= 0 ? 'bg-success' : 'bg-warning'}`}
              ></motion.div>
            </div>
          </div>
          
          {/* Flags */}
          <div className="bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex-1 flex flex-col justify-center gap-3">
            <h3 className="font-label-md text-label-md text-text-muted uppercase tracking-wider mb-1">Detection Flags</h3>
            <div className="flex flex-wrap gap-2">
              <div className={`px-3 py-1.5 rounded-full border font-label-sm text-label-sm flex items-center gap-1.5 ${
                !report.is_clickbait 
                  ? 'bg-success/10 text-success border-success/20' 
                  : 'bg-danger/10 text-danger border-danger/20'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {!report.is_clickbait ? 'check_circle' : 'warning'}
                </span>
                {!report.is_clickbait ? 'No Clickbait' : 'Clickbait Detected'}
              </div>
              
              <div className={`px-3 py-1.5 rounded-full border font-label-sm text-label-sm flex items-center gap-1.5 ${
                !report.is_sensational 
                  ? 'bg-success/10 text-success border-success/20' 
                  : 'bg-danger/10 text-danger border-danger/20'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {!report.is_sensational ? 'check_circle' : 'warning'}
                </span>
                {!report.is_sensational ? 'No Sensationalism' : 'Minor Sensationalism'}
              </div>
              
              <div className={`px-3 py-1.5 rounded-full border font-label-sm text-label-sm flex items-center gap-1.5 ${
                report.is_verified_author 
                  ? 'bg-success/10 text-success border-success/20' 
                  : 'bg-warning/10 text-warning border-warning/20'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {report.is_verified_author ? 'verified_user' : 'info'}
                </span>
                {report.is_verified_author ? 'Verified Author' : 'Unknown Credentials'}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Advanced AI Insights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Emotion Detection */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-1 md:col-span-4 bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex flex-col items-center justify-center"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-6 self-start w-full">Dominant Emotion</h3>
          <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl">
              {report.emotion.toLowerCase().includes('fear') ? '😨' : 
               report.emotion.toLowerCase().includes('anger') ? '😡' : 
               report.emotion.toLowerCase().includes('hope') ? '🌟' : 
               report.emotion.toLowerCase().includes('joy') ? '😊' : 
               report.emotion.toLowerCase().includes('sad') ? '😢' : '😐'}
            </span>
          </div>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">{report.emotion}</p>
        </motion.div>

        {/* Propaganda Detection */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-1 md:col-span-4 bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex flex-col"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-4">Propaganda Score</h3>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface text-2xl">{report.propaganda_score}</span>
            <span className="font-label-sm text-label-sm text-text-muted mb-1">/ 100</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${report.propaganda_score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${report.propaganda_score > 70 ? 'bg-danger' : report.propaganda_score > 30 ? 'bg-warning' : 'bg-success'}`}
            ></motion.div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-2">Detected Techniques</h4>
            {report.propaganda_techniques && report.propaganda_techniques.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.propaganda_techniques.map((tech, i) => (
                  <span key={i} className="px-2.5 py-1 bg-surface-secondary border border-border-subtle rounded text-xs font-medium text-on-surface-variant">
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">No specific techniques detected.</p>
            )}
          </div>
        </motion.div>

        {/* Missing Perspectives */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="col-span-1 md:col-span-4 bg-surface rounded-xl border border-border-subtle premium-shadow p-6 flex flex-col"
        >
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-4">Missing Perspectives</h3>
          <div className="flex-1 bg-surface-secondary rounded-lg p-4 border border-border-subtle overflow-y-auto max-h-[200px]">
            {report.missing_perspectives && report.missing_perspectives.length > 0 ? (
              <ul className="list-disc pl-4 space-y-2">
                {report.missing_perspectives.map((perspective, i) => (
                  <li key={i} className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {perspective}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted italic">This article appears highly comprehensive with no major viewpoints omitted.</p>
            )}
          </div>
        </motion.div>
      </section>

      {/* AI Summary */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-surface rounded-xl border border-border-subtle premium-shadow p-8 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Neutral AI Summary</h3>
        </div>
        <div className="w-12 h-1 bg-primary rounded-full mb-2"></div>
        <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-4xl">
          {report.summary}
        </p>
      </motion.section>

      {/* Clean Extracted Article */}
      {report.content && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-surface rounded-xl border border-border-subtle premium-shadow p-8 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">article</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Clean Extracted Article</h3>
          </div>
          <div className="w-12 h-1 bg-primary rounded-full mb-2"></div>
          <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-4xl whitespace-pre-wrap select-text">
            {report.content}
          </div>
        </motion.section>
      )}

      {/* Fact Checking Table */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4"
      >
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Fact Verification</h3>
        <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden premium-shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-secondary border-b border-border-subtle font-label-md text-label-md text-text-muted uppercase tracking-wider">
                <th className="p-4 w-1/2">Claim in Article</th>
                <th className="p-4 w-1/2">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-md text-body-md text-on-surface">
              {report.claims.map((claim, idx) => {
                let statusColor = 'bg-surface-secondary';
                let textColor = 'text-text-muted';
                let iconName = 'help';
                
                if (claim.status === 'Verified') {
                  statusColor = 'bg-success';
                  textColor = 'text-success';
                  iconName = 'check_circle';
                } else if (claim.status === 'False') {
                  statusColor = 'bg-danger';
                  textColor = 'text-danger';
                  iconName = 'cancel';
                } else if (claim.status === 'Unverified') {
                  statusColor = 'bg-warning';
                  textColor = 'text-warning';
                  iconName = 'error';
                }

                return (
                  <tr key={idx} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-4 pl-6 relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor}`}></div>
                      "{claim.claim}"
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined mt-0.5 ${textColor}`}>
                          {iconName}
                        </span>
                        <div>
                          <span className={`font-semibold block mb-1 ${textColor}`}>{claim.status}</span>
                          <span className="text-text-muted font-body-md text-body-md">
                            {claim.details}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Similar Articles */}
      {report.similar_articles && report.similar_articles.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">library_books</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Related Coverages</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.similar_articles.map((article, idx) => (
              <a 
                key={idx} 
                href={article.url || "#"} 
                target={article.url ? "_blank" : "_self"} 
                rel="noopener noreferrer"
                className="bg-surface rounded-xl border border-border-subtle p-5 flex flex-col gap-3 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">{article.publication}</span>
                  {article.distance !== undefined && (
                    <span className="text-xs bg-surface-secondary px-2 py-0.5 rounded text-text-muted">
                      {Math.round((1 - article.distance) * 100)}% Match
                    </span>
                  )}
                </div>
                <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface line-clamp-2">{article.title}</h4>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">{article.author}</span>
                </div>
              </a>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex flex-col gap-stack-lg items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted font-body-md">Loading transparency report...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
