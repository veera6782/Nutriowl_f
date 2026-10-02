import React from 'react';
import { FiCamera } from 'react-icons/fi';

export default function ScanButton({ onClick }) {
  return (
    <button aria-label="Scan" onClick={onClick} className="w-20 h-20 rounded-full bg-green-500 shadow-lg border-8 border-white flex items-center justify-center focus:outline-none">
      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
        <FiCamera size={21} strokeWidth={2} aria-hidden="true" />
      </div>
    </button>
  );
}
