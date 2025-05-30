// src/components/common/Button.jsx
import React from 'react';
import audioService from '../../services/audioService';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  type = 'button',
  ...props 
}) => {
  
  // Variant styles
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white',
    secondary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    ghost: 'bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur',
    outline: 'border-2 border-white/50 hover:border-white text-white hover:bg-white/10'
  };

  // Size styles
  const sizes = {
    small: 'px-4 py-2 text-sm rounded-lg',
    medium: 'px-6 py-3 text-base rounded-xl',
    large: 'px-8 py-4 text-lg rounded-2xl'
  };

  const handleClick = async (e) => {
    if (disabled || loading) return;
    
    try {
      await audioService.buttonClick();
    } catch (error) {
      console.warn('Audio failed:', error);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const baseClasses = `
    font-bold transition-all transform hover:scale-105 
    flex items-center justify-center gap-2 
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95
  `;

  const finalClassName = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={finalClassName}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
          <span>กำลังโหลด...</span>
        </>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;