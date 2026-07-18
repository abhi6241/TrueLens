'use client';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { motion } from 'framer-motion';

const sourcesData = [
  {
    name: 'Google News',
    type: 'Global Aggregation',
    description: 'Comprehensive coverage across thousands of global publications. Ideal for macro-trend analysis and broad sentiment tracking.',
    status: 'Live',
    updated: 'Just now',
    icon: 'language',
    iconColor: 'text-primary',
    gradient: 'from-blue-50/50 to-transparent',
    colSpan: 'md:col-span-2',
    action: 'Open Source',
    hasArrow: true
  },
  {
    name: 'NewsAPI',
    type: 'Structured Feeds',
    description: 'Structured JSON feeds for programmatic analysis and deep-dive reporting.',
    status: 'Live',
    updated: '2 mins ago',
    icon: 'api',
    iconColor: 'text-secondary',
    gradient: 'from-purple-50/50 to-transparent',
    colSpan: 'col-span-1',
    action: 'Explore'
  },
  {
    name: 'GDELT',
    type: 'Geopolitical Events',
    description: 'Global Database of Events, Language, and Tone for geopolitical monitoring.',
    status: 'Live',
    updated: '15 mins ago',
    icon: 'public',
    iconColor: 'text-tertiary',
    gradient: 'from-green-50/50 to-transparent',
    colSpan: 'col-span-1',
    action: 'Explore'
  },
  {
    name: 'MediaStack',
    type: 'Scalable News',
    description: 'Real-time scalable news API for high-frequency tracking.',
    status: 'Syncing',
    updated: '1 hour ago',
    icon: 'feed',
    iconColor: 'text-primary',
    gradient: 'from-indigo-50/50 to-transparent',
    colSpan: 'col-span-1',
    action: 'Explore'
  },
  {
    name: 'Custom RSS Feeds',
    type: 'Niche Streams',
    description: 'Curated, niche industry sources tailored to specific analytical requirements.',
    status: 'Live',
    updated: 'Updated rolling',
    icon: 'rss_feed',
    iconColor: 'text-on-tertiary-fixed-variant',
    gradient: 'from-orange-50/50 to-transparent',
    colSpan: 'col-span-1',
    action: 'Manage Feeds'
  }
];

export default function Sources() {
  return (
    <>
      <Navbar />
      
      <main className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-x-hidden">
        <motion.header 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-stack-lg text-center md:text-left"
        >
          <h1 className="font-headline-lg text-headline-lg md:font-display md:text-display text-on-surface mb-stack-sm">
            Trusted Global Sources
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted max-w-2xl">
            Accessing verified data streams from the world's most reliable news and intelligence APIs.
          </p>
        </motion.header>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sourcesData.map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`bento-card bg-surface-primary border border-border-subtle rounded-[20px] p-6 ${source.colSpan} flex flex-col justify-between relative overflow-hidden group hover-lift`}
            >
              {/* Gradient hover background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${source.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <div className="flex justify-between items-start mb-6 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-border-subtle">
                    <span className={`material-symbols-outlined ${source.iconColor} text-[24px]`}>
                      {source.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{source.name}</h3>
                    <p className="font-label-sm text-label-sm text-text-muted">{source.type}</p>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                    source.status === 'Live'
                      ? 'bg-success/10 border-success/20 text-success'
                      : 'bg-warning/10 border-warning/20 text-warning'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${source.status === 'Live' ? 'bg-success animate-pulse' : 'bg-warning'}`}></span>
                  <span className="font-label-sm text-label-sm">{source.status}</span>
                </div>
              </div>
              
              <div className="z-10 mb-6 flex-grow">
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                  {source.description}
                </p>
              </div>
              
              <div className="flex justify-between items-center z-10 pt-4 border-t border-border-subtle">
                <span className="font-label-sm text-label-sm text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span> 
                  Updated: {source.updated}
                </span>
                <button className="font-label-md text-label-md text-primary flex items-center gap-2 hover:bg-surface-container px-4 py-2 rounded-lg transition-colors cursor-pointer">
                  {source.action} 
                  {source.hasArrow && <span className="material-symbols-outlined text-[18px]">open_in_new</span>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
