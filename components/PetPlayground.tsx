
import React, { useEffect, useState } from 'react';
import { Pet } from '../types';

interface PetPlaygroundProps {
  pet: Pet;
  fullness: number;
  onFeed: () => void;
  coins: number;
}

export const PetPlayground: React.FC<PetPlaygroundProps> = ({ pet, fullness, onFeed, coins }) => {
  const [position, setPosition] = useState(50); // Percentage from left
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Random movement logic
  useEffect(() => {
    const movePet = () => {
      if (isEating) return;

      const shouldMove = Math.random() > 0.4;
      if (shouldMove) {
        const newPos = Math.random() * 80 + 10; // Keep within 10-90%
        setDirection(newPos > position ? 'right' : 'left');
        setPosition(newPos);
        setIsMoving(true);
        
        // Stop moving after transition
        setTimeout(() => setIsMoving(false), 2000);
      }
    };

    const interval = setInterval(movePet, 3500);
    return () => clearInterval(interval);
  }, [position, isEating]);

  const handleFeed = () => {
    if (coins < 10) {
      setFeedback("Need 10💰!");
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    if (fullness >= 100) {
      setFeedback("I'm full!");
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    
    onFeed();
    setIsEating(true);
    setFeedback("Yummy! ❤️");
    setTimeout(() => {
      setIsEating(false);
      setFeedback(null);
    }, 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-48 pointer-events-none z-10">
      {/* Ground gradient */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-emerald-900/90 to-transparent" />
      
      {/* Pet Container */}
      <div 
        className="absolute bottom-8 transition-all duration-[2000ms] ease-in-out pointer-events-auto flex flex-col items-center group"
        style={{ 
          left: `${position}%`, 
          transform: `translateX(-50%)`
        }}
      >
        {/* Speech Bubble / Feedback */}
        <div className={`mb-2 px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-full shadow-lg whitespace-nowrap transition-opacity duration-300 ${feedback ? 'opacity-100 animate-bounce' : 'opacity-0'}`}>
          {feedback || "..."}
        </div>

        {/* Hunger Bar */}
        <div className="w-16 h-2 bg-gray-800 rounded-full mb-2 overflow-hidden border border-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <div 
            className={`h-full ${fullness < 30 ? 'bg-red-500' : fullness < 70 ? 'bg-yellow-400' : 'bg-green-500'}`} 
            style={{ width: `${fullness}%`, transition: 'width 0.5s' }}
          />
        </div>

        {/* The Pet */}
        <div 
          className={`relative text-8xl cursor-pointer select-none filter drop-shadow-2xl transition-transform hover:scale-110 active:scale-95
            ${isMoving && !isEating ? 'animate-walk' : ''}
            ${isEating ? 'animate-bounce' : ''}
          `}
          style={{
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          }}
          onClick={handleFeed}
        >
          {pet.emoji}
        </div>

        {/* Interaction Hint */}
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleFeed}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-amber-400 flex items-center gap-1"
          >
             Feed -10💰
          </button>
        </div>
      </div>
    </div>
  );
};
