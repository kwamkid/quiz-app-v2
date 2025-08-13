// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "กำลังโหลด...", size = "large" }) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12", 
    large: "h-16 w-16"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/30">
        <div className="relative mb-6">
          <div className={`animate-spin rounded-full ${sizeClasses[size]} border-4 border-white/30 border-t-white mx-auto`}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
            ⭐
          </div>
        </div>
        
        <p className="text-white font-medium text-lg mb-4">{message}</p>
        
        <div className="flex justify-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;