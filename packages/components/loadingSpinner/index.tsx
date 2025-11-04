import React from 'react';

// The props interface defines that this component accepts an `isLoading` boolean.
interface LoadingSpinnerProps {
  isLoading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  // If not loading, the component returns nothing.
  if (!isLoading) {
    return null;
  }

  return (
    // This is the full-screen overlay.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* This is the visual spinner element. */}
      <div className="w-16 h-16 animate-spin rounded-full border-4 border-solid border-slate-200 border-t-blue-500"></div>
    </div>
  );
};

export default LoadingSpinner;