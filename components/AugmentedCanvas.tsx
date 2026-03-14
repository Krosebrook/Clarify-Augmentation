
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage, AnalysisResult } from '../types';
import { WidgetEngine } from './widgets/WidgetEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';

interface Props {
  image: GeneratedImage;
  analysis?: AnalysisResult | null;
  isScanning?: boolean;
}

export const AugmentedCanvas: React.FC<Props> = ({ image, analysis, isScanning = false }) => {
  const [hoveredSegmentId, setHoveredSegmentId] = useState<number | null>(null);
  const [clickedSegmentId, setClickedSegmentId] = useState<number | null>(null);
  
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredSegmentId(index);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSegmentId(null);
    }, 100);
  };

  const handleClick = (index: number) => {
    setClickedSegmentId(index);
  };

  const closeModal = () => {
    setClickedSegmentId(null);
  };

  const activeSegment = clickedSegmentId !== null && analysis?.segments ? analysis.segments[clickedSegmentId] : null;
  const isAnyActive = hoveredSegmentId !== null || clickedSegmentId !== null;

  return (
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4 relative">
      
      {/* Container Wrapper */}
      <div 
        ref={containerRef}
        className={`relative w-full max-w-full max-h-[80vh] md:max-h-full shadow-2xl rounded-xl border border-white/10 bg-gray-900 group ${isScanning ? 'overflow-hidden' : ''}`}
        style={{ aspectRatio: '16 / 9' }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-50 flex gap-2 bg-black/50 backdrop-blur-md p-2 rounded-lg border border-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => zoomIn()} className="p-2 md:p-1.5 hover:bg-white/20 rounded-md text-white transition-colors" title="Zoom In"><ZoomIn size={20} className="md:w-[18px] md:h-[18px]" /></button>
                <button onClick={() => zoomOut()} className="p-2 md:p-1.5 hover:bg-white/20 rounded-md text-white transition-colors" title="Zoom Out"><ZoomOut size={20} className="md:w-[18px] md:h-[18px]" /></button>
                <button onClick={() => resetTransform()} className="p-2 md:p-1.5 hover:bg-white/20 rounded-md text-white transition-colors" title="Reset Zoom"><Maximize size={20} className="md:w-[18px] md:h-[18px]" /></button>
              </div>

              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                {/* The Image */}
                <img 
                  src={`data:${image.mimeType};base64,${image.base64}`} 
                  alt="Generated Infographic"
                  className={`w-full h-full object-contain rounded-xl transition-all duration-700 ease-in-out ${isAnyActive ? 'blur-[3px] opacity-50 scale-[1.01]' : 'opacity-100 scale-100'}`}
                />

                {/* Focus Darkening Overlay */}
                <div className={`absolute inset-0 bg-black/60 rounded-xl transition-opacity duration-300 pointer-events-none ${isAnyActive ? 'opacity-100' : 'opacity-0'}`} />

                {/* Interactive Hitboxes Layer */}
                {!isScanning && analysis?.segments && analysis.segments.map((segment, index) => {
                  const isHovered = hoveredSegmentId === index;
                  const isClicked = clickedSegmentId === index;
                  const isActive = isHovered || isClicked;
                  const isScalable = segment.format === 'compact' || segment.format === 'stats';
                  
                  return (
                    <div
                      key={index}
                      style={{
                        left: `${segment.bounds.x}%`,
                        top: `${segment.bounds.y}%`,
                        width: `${segment.bounds.width}%`,
                        height: `${segment.bounds.height}%`,
                      }}
                      className={`absolute ${isActive ? 'z-40' : 'z-30'}`}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(index)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.6,
                          scale: isActive ? 1.05 : 1,
                          borderColor: isActive ? 'rgba(34, 211, 238, 1)' : 'rgba(255, 255, 255, 0.2)',
                          backgroundColor: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                          boxShadow: isActive ? '0 0 30px rgba(34, 211, 238, 0.5)' : 'none'
                        }}
                        whileHover={{ 
                            opacity: 1,
                            scale: 1.05, 
                            borderColor: 'rgba(34, 211, 238, 1)', 
                            backgroundColor: 'rgba(34, 211, 238, 0.15)',
                            boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' 
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full border-2 rounded-lg cursor-pointer relative"
                      >
                          {!isActive && !isAnyActive && (
                              <>
                                <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
                                <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                              </>
                          )}
                      </motion.div>
                    </div>
                  );
                })}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        {/* SCANNING MODE OVERLAY */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 overflow-hidden bg-zinc-900/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 rounded-full bg-white/10 blur-3xl"
                  />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CENTERED MODAL OVERLAY */}
      <AnimatePresence>
        {activeSegment && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              key="modal-container"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative pointer-events-auto w-full max-w-lg z-10 max-h-[85vh] flex flex-col"
            >
              <button 
                onClick={closeModal}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
              >
                <X size={20} />
              </button>
              <div className="flex-1 w-full">
                <WidgetEngine segment={activeSegment} imageBase64={image.base64} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
