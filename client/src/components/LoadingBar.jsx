/**
 * LoadingBar Component
 * Global loading indicator for test and feedback operations
 */

import { motion, AnimatePresence } from 'framer-motion';

const LoadingBar = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ width: '0%', opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 z-50 shadow-lg"
        />
      )}
    </AnimatePresence>
  );
};

export default LoadingBar;

