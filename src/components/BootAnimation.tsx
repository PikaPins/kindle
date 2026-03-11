'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BootAnimation({ onComplete }: { onComplete: () => void }) {
  const [showLogo, setShowLogo] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowBackground(true), 100);
    const timer2 = setTimeout(() => setShowLogo(true), 200);
    const timer3 = setTimeout(() => {
      setShowLogo(false);
    }, 2800);
    const timer4 = setTimeout(() => {
      setIsComplete(true);
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsComplete(true);
    onComplete();
  };

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ backgroundColor: '#000000' }}
          animate={{ backgroundColor: showBackground ? '#F4F4F4' : '#000000' }}
          transition={{ duration: 0.2 }}
          onClick={handleSkip}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
          style={{ background: showBackground ? '#F4F4F4' : '#000000' }}
        >
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <svg width="120" height="160" viewBox="0 0 120 160" className="mb-4">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    d="M10 20 L10 140 Q10 150 20 150 L100 150 Q110 150 110 140 L110 20 Q110 10 100 10 L20 10 Q10 10 10 20 Z"
                    fill="none"
                    stroke="#2C2C2C"
                    strokeWidth="3"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    d="M30 40 L30 120 M30 60 L90 60 M30 80 L90 80 M30 100 L70 100"
                    fill="none"
                    stroke="#2C2C2C"
                    strokeWidth="2"
                  />
                </svg>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-2xl font-serif text-gray-700 tracking-widest"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  kindle
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 0.3, delay: 1 }}
                  className="absolute bottom-8 text-xs text-gray-400"
                >
                  Tap to skip
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
