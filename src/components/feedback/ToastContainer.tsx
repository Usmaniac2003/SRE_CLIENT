'use client';

import { useToastStore } from '../../store/toast.store';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  const colors = {
    success: 'bg-[#E7F5EF] text-[#1B9C6F] border-[#1B9C6F]',
    error: 'bg-[#FDECEC] text-[#E74C3C] border-[#E74C3C]',
    info: 'bg-[#F0F5F2] text-[#4A5A52] border-[#AAC8BA]',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-xs">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`border-l-4 p-3 rounded-md shadow-md cursor-pointer ${colors[toast.type]}`}
            onClick={() => remove(toast.id)}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
