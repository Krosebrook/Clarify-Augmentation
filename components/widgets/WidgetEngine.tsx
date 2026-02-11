
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Segment } from '../../types';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SegmentChat } from './SegmentChat';

interface WidgetProps {
  segment: Segment;
  imageBase64?: string; // Added to support chat context
}

// ----------------------------------------------------------------------
// Shared Styles
// ----------------------------------------------------------------------
// Max height set to 80vh to ensure it fits on screen when centered
const GLASS_PANEL = "backdrop-blur-xl border shadow-[0_0_40px_rgba(0,0,0,0.6)] w-full max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent transition-all duration-300";

const getPanelStyles = (isHighlight: boolean) => {
    return `${GLASS_PANEL} ${isHighlight 
        ? "bg-cyan-950/90 border-cyan-400 border-[3px] shadow-[0_0_60px_rgba(6,182,212,0.3)]" 
        : "bg-black/90 border-white/10"}`;
}

// ----------------------------------------------------------------------
// Sub-components for different formats
// ----------------------------------------------------------------------

const MiniWidget: React.FC<WidgetProps> = ({ segment }) => {
  const isHighlight = segment.category === 'highlight';
  return (
    <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`backdrop-blur-md px-6 py-2.5 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] mx-auto w-fit transition-colors duration-300 ${
            isHighlight 
            ? "bg-cyan-950/90 border-[3px] border-cyan-400 hover:border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.3)]" 
            : "bg-black/80 border-2 border-white/10 hover:border-cyan-400/80"
        }`}
    >
        <span className="text-xl shrink-0 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{segment.icon || '✨'}</span>
        <span className={`text-sm font-bold tracking-widest uppercase ${isHighlight ? "text-cyan-100" : "text-white"}`}>
            {segment.label}
        </span>
    </motion.div>
  );
};

const CompactWidget: React.FC<WidgetProps> = ({ segment, imageBase64 }) => {
  const isHighlight = segment.category === 'highlight';
  
  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`${getPanelStyles(isHighlight)} p-6 rounded-2xl relative group hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]`}
    >
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity ${isHighlight ? 'h-[3px] opacity-100' : ''}`} />
        
        <div className="flex items-start gap-5 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-inner shrink-0 transition-colors ${
            isHighlight 
            ? "bg-cyan-500/20 border-cyan-400" 
            : "bg-white/5 border border-white/10 group-hover:border-cyan-500/40 group-hover:bg-cyan-900/10"
        }`}>
            {segment.icon || '🔍'}
        </div>
        <div className="min-w-0 flex-1 pt-1">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1 truncate">{segment.category || 'Concept'}</div>
            <h3 className={`font-bold text-2xl leading-tight break-words transition-colors ${isHighlight ? "text-cyan-50" : "text-white group-hover:text-cyan-50"}`}>
                {segment.label}
            </h3>
        </div>
        </div>
        
        <p className={`text-base leading-relaxed font-light transition-colors ${isHighlight ? "text-cyan-100/90" : "text-gray-300 group-hover:text-gray-200"}`}>
        {segment.description}
        </p>
        
        {/* Enable chat in compact mode if it's a highlight, space permitting */}
        {isHighlight && <SegmentChat segment={segment} imageBase64={imageBase64} />}
    </motion.div>
  );
};

const StatsWidget: React.FC<WidgetProps> = ({ segment, imageBase64 }) => {
  const isHighlight = segment.category === 'highlight';

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`${getPanelStyles(isHighlight)} p-6 rounded-2xl relative group hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]`}
    >
        <div className={`flex justify-between items-center mb-5 pb-5 border-b sticky top-0 backdrop-blur-xl z-10 -mx-6 px-6 -mt-6 pt-6 rounded-t-2xl transition-colors ${
            isHighlight 
            ? "bg-cyan-950/90 border-cyan-500/30" 
            : "bg-black/90 border-white/5 group-hover:border-cyan-500/20"
        }`}>
        <h3 className={`font-bold text-xl flex items-center gap-3 truncate pr-2 transition-colors ${isHighlight ? "text-cyan-100" : "text-white group-hover:text-cyan-50"}`}>
            <span className="text-2xl">{segment.icon || '📊'}</span>
            <span className="truncate">{segment.label}</span>
        </h3>
        <div className="px-3 py-1 rounded text-[10px] font-bold bg-cyan-900/30 text-cyan-200 uppercase tracking-wider border border-cyan-500/30 shrink-0">Data</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
        {segment.stats?.map((stat, idx) => (
            <div key={idx} className={`rounded-xl p-4 border transition-all duration-300 group/stat ${
                isHighlight 
                ? "bg-cyan-900/20 border-cyan-500/40" 
                : "bg-white/5 border-white/5 hover:border-cyan-500/40 hover:bg-cyan-900/10"
            }`}>
                <div className="text-cyan-400 group-hover/stat:text-cyan-300 font-mono font-bold text-xl truncate transition-colors">{stat.value}</div>
                <div className="text-xs text-gray-500 group-hover/stat:text-gray-400 uppercase tracking-wide mt-1 truncate transition-colors">{stat.label}</div>
            </div>
        ))}
        {(!segment.stats || segment.stats.length === 0) && (
            <div className="col-span-2 text-sm text-gray-500 italic p-4 text-center">
                Detailed metrics unavailable.
            </div>
        )}
        </div>
        <p className="mt-5 text-sm text-gray-400 border-t border-white/5 pt-4 leading-relaxed group-hover:text-gray-300 transition-colors">{segment.description}</p>
        
        {isHighlight && <SegmentChat segment={segment} imageBase64={imageBase64} />}
    </motion.div>
  );
};

const DetailedWidget: React.FC<WidgetProps> = ({ segment, imageBase64 }) => {
  const isHighlight = segment.category === 'highlight';

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`backdrop-blur-xl w-full max-h-[80vh] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
           isHighlight 
             ? "bg-cyan-950/90 border-cyan-400 border-[3px] shadow-[0_0_60px_rgba(6,182,212,0.3)]" 
             : "bg-black/90 border-white/10 border shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        }`}
    >
        {/* Header - Fixed, does not scroll */}
        <div className="flex-none bg-gradient-to-br from-indigo-900 via-purple-900 to-black border-b border-white/10 p-8 relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px]" />
            <div className="absolute bottom-[-50px] left-[-20px] w-40 h-40 bg-purple-500/20 rounded-full blur-[60px]" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/10 text-cyan-200 border border-cyan-500/20 uppercase tracking-widest backdrop-blur-md">
                        {segment.category || 'Deep Dive'}
                    </span>
                </div>
                
                <div className="flex gap-6 items-start">
                    <div className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-white/5 p-3 rounded-2xl border border-white/10">
                        {segment.icon || '🚀'}
                    </div>
                    <div>
                        <h3 className="font-bold text-3xl md:text-4xl text-white mb-2 leading-none tracking-tight">{segment.label}</h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mt-2" />
                    </div>
                </div>
            </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 bg-black/40 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <p className="text-lg text-gray-200 leading-relaxed mb-8 font-light border-l-2 border-cyan-500/30 pl-4">
                {segment.description}
            </p>

            {segment.stats && segment.stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {segment.stats.map((stat, i) => (
                    <div key={i} className="bg-zinc-900/50 rounded-lg px-4 py-3 border border-white/5 hover:border-white/20 transition-colors">
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider truncate mb-1">{stat.label}</div>
                        <div className="text-cyan-100 font-mono font-medium text-lg truncate">{stat.value}</div>
                    </div>
                ))}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Learn More Button */}
                {segment.sourceUrl && (
                    <a 
                        href={segment.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold rounded-lg transition-all duration-300 group w-fit shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5"
                    >
                        Learn More <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                )}
            </div>

            {/* Chat Interface */}
            <SegmentChat segment={segment} imageBase64={imageBase64} />
        </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Main Factory
// ----------------------------------------------------------------------

export const WidgetEngine: React.FC<WidgetProps> = ({ segment, imageBase64 }) => {
  switch (segment.format) {
    case 'mini': return <MiniWidget segment={segment} imageBase64={imageBase64} />;
    case 'stats': return <StatsWidget segment={segment} imageBase64={imageBase64} />;
    case 'detailed': return <DetailedWidget segment={segment} imageBase64={imageBase64} />;
    case 'compact': 
    default: return <CompactWidget segment={segment} imageBase64={imageBase64} />;
  }
};
