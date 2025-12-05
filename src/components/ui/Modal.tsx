'use client';

import { useUIStore } from '../../store/ui.store';
import { Button } from './Button';

export function Modal() {
  const { modalOpen, modalContent, closeModal } = useUIStore();

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 min-w-[320px] shadow-lg border border-[#D9E6DF]">
        <div>{modalContent}</div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
