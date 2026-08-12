'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CinematicPreloader from './CinematicPreloader';

export default function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  React.useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenPreloader');
    if (hasSeen) {
      setIntroComplete(true);
    }
    setHasChecked(true);
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem('hasSeenPreloader', 'true');
    setIntroComplete(true);
  };

  return (
    <>
      <AnimatePresence>
        {hasChecked && !introComplete && (
          <CinematicPreloader onComplete={handleComplete} />
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: (hasChecked && introComplete) ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={!introComplete ? "h-screen overflow-hidden pointer-events-none fixed w-full" : ""}
      >
        {children}
      </motion.div>
    </>
  );
}
