import React from 'react';
import { motion } from 'framer-motion';

const PagePreloader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <motion.div
        className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default PagePreloader;
