'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CinematicPreloader from './CinematicPreloader';

export default function PreloaderWrapper({ children }: { children: React.ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!introComplete && (
          <CinematicPreloader onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={!introComplete ? "h-screen overflow-hidden pointer-events-none fixed" : ""}
      >
        {children}
      </motion.div>
    </>
  );
}
