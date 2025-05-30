// src/components/common/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  className = '',
  variant = 'glass',
  padding = 'medium',
  hover = false,
  onClick = null,
  ...props 
}) => {
  
  // Variant styles
  const variants = {
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20',
    solid: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border border-white/30',
    dark: 'bg-gray-800 border border-gray-700'
  };

  // Padding styles
  const paddings = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  // Hover effects
  const hoverClasses = hover ? 'hover:shadow-2xl hover:scale-105 transition-all transform cursor-pointer' : '';

  const baseClasses = `
    rounded-3xl shadow-xl
    ${variants[variant]}
    ${paddings[padding]}
    ${hoverClasses}
    ${className}
  `.trim();

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

// Quiz Card Component
export const QuizCard = ({ quiz, onStart, className = '' }) => {
  const difficultyColors = {
    'ง่าย': 'bg-green-100 text-green-700 border-green-200',
    'ปานกลาง': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'ยาก': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <Card 
      variant="gradient" 
      hover={true}
      onClick={() => onStart(quiz)}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* Background Emoji */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-6xl">{quiz.emoji}</div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-4xl mb-2 group-hover:animate-bounce">
            {quiz.emoji}
          </div>
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium border
            ${difficultyColors[quiz.difficulty] || difficultyColors['ง่าย']}
          `}>
            {quiz.difficulty}
          </span>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2 drop-shadow">
          {quiz.title}
        </h3>
        
        <p className="text-white/80 mb-4 flex items-center gap-2">
          <span>🎯</span>
          {quiz.questions?.length || 0} คำถาม
        </p>
        
        {/* Action Button */}
        <div className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:animate-pulse">
          <span>▶️</span>
          เริ่มทำข้อสอบ
        </div>
      </div>
    </Card>
  );
};

// Score Card Component
export const ScoreCard = ({ score, totalQuestions, totalTime, percentage }) => {
  return (
    <Card variant="glass" className="mb-8">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-white/80">คะแนนที่ได้</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{totalQuestions * 10}</div>
          <div className="text-white/80">คะแนนเต็ม</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{totalQuestions}</div>
          <div className="text-white/80">จำนวนข้อ</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">
            {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-white/80">เวลาที่ใช้</div>
        </div>
      </div>
      
      {percentage !== undefined && (
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-white">{percentage}%</div>
          <div className="text-white/80">เปอร์เซ็นต์</div>
        </div>
      )}
    </Card>
  );
};

export default Card;