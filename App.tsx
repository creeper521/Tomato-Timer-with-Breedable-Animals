
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ShoppingBag, Brain, Coffee, Trophy, Sparkles, GraduationCap, Moon } from 'lucide-react';
import { TimerMode, UserState, INITIAL_PETS, Pet } from './types';
import { PetPlayground } from './components/PetPlayground';
import { Store } from './components/Store';
import { DevControls } from './components/DevControls';
import { getStudyMotivation, getBreakActivity } from './services/geminiService';

// Default Configuration constants (can be overridden by DevControls)
const DEFAULT_FOCUS_TIME = 25 * 60;
const DEFAULT_SHORT_BREAK_TIME = 5 * 60;
const DEFAULT_LONG_BREAK_TIME = 15 * 60;
const COIN_REWARD = 25;

export default function App() {
  // State: Timer Configuration (Dynamic for testing)
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_TIME);
  const [shortBreakDuration, setShortBreakDuration] = useState(DEFAULT_SHORT_BREAK_TIME);
  const [longBreakDuration, setLongBreakDuration] = useState(DEFAULT_LONG_BREAK_TIME);

  // State: Timer Execution
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  
  // State: User & Gamification
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('pomoPetState');
    return saved ? JSON.parse(saved) : {
      coins: 0,
      unlockedPets: ['cat'],
      activePetId: 'cat',
      petFullness: 80,
      totalFocusMinutes: 0
    };
  });

  // State: UI
  const [showStore, setShowStore] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [suggestedActivity, setSuggestedActivity] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const activePet = INITIAL_PETS.find(p => p.id === userState.activePetId) || INITIAL_PETS[0];

  // Save state
  useEffect(() => {
    localStorage.setItem('pomoPetState', JSON.stringify(userState));
  }, [userState]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Pet Hunger Decay (Every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setUserState(prev => ({
        ...prev,
        petFullness: Math.max(0, prev.petFullness - 1)
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTimerComplete = async () => {
    setIsActive(false);
    setTimeLeft(0); // Ensure visual 0
    
    if (mode === TimerMode.FOCUS) {
      // Reward for focus
      // Calculate coins based on actual duration set (so shorter test times give smaller rewards, or flat rate)
      // For testing fun, we keep flat rate REWARD
      setUserState(prev => ({
        ...prev,
        coins: prev.coins + COIN_REWARD,
        totalFocusMinutes: prev.totalFocusMinutes + (focusDuration / 60)
      }));

      // AI Motivation
      setIsLoadingAi(true);
      try {
        const motivation = await getStudyMotivation(Math.floor(focusDuration / 60), activePet.name);
        setAiMessage(motivation);
        const activity = await getBreakActivity();
        setSuggestedActivity(activity);
      } catch (e) {
        console.error(e);
        setAiMessage("Great focus session!");
      } finally {
        setIsLoadingAi(false);
      }

      // Auto switch logic (User still needs to start it)
      setMode(TimerMode.SHORT_BREAK);
      setTimeLeft(shortBreakDuration);
    } else {
      // Break over
      setAiMessage("Break time is over! Ready to focus again?");
      setSuggestedActivity(null);
      setMode(TimerMode.FOCUS);
      setTimeLeft(focusDuration);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === TimerMode.FOCUS) setTimeLeft(focusDuration);
    else if (mode === TimerMode.SHORT_BREAK) setTimeLeft(shortBreakDuration);
    else setTimeLeft(longBreakDuration);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === TimerMode.FOCUS) setTimeLeft(focusDuration);
    else if (newMode === TimerMode.SHORT_BREAK) setTimeLeft(shortBreakDuration);
    else setTimeLeft(longBreakDuration);
  };

  const handleUpdateTimes = (focus: number, short: number, long: number) => {
    setFocusDuration(focus);
    setShortBreakDuration(short);
    setLongBreakDuration(long);
    
    // Reset current timer to new settings immediately if not active
    if (!isActive) {
      if (mode === TimerMode.FOCUS) setTimeLeft(focus);
      else if (mode === TimerMode.SHORT_BREAK) setTimeLeft(short);
      else setTimeLeft(long);
    }
  };

  const handleFeed = () => {
    if (userState.coins >= 10 && userState.petFullness < 100) {
      setUserState(prev => ({
        ...prev,
        coins: prev.coins - 10,
        petFullness: Math.min(100, prev.petFullness + 20)
      }));
    }
  };

  const handleBuyPet = (pet: Pet) => {
    if (userState.coins >= pet.price) {
      setUserState(prev => ({
        ...prev,
        coins: prev.coins - pet.price,
        unlockedPets: [...prev.unlockedPets, pet.id]
      }));
    }
  };

  const handleEquipPet = (petId: string) => {
    setUserState(prev => ({ ...prev, activePetId: petId }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60); // Ensure integer
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate max time based on current mode for progress bar
  const currentMaxTime = mode === TimerMode.FOCUS ? focusDuration : (mode === TimerMode.SHORT_BREAK ? shortBreakDuration : longBreakDuration);
  const progress = 100 - (timeLeft / currentMaxTime) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full p-4 flex justify-between items-center z-40 bg-gradient-to-b from-slate-900 to-slate-900/0 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg shadow-amber-500/20">
            P
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">PomoPet <span className="text-xs font-normal text-slate-400 bg-slate-800 px-1 rounded border border-slate-700">BETA</span></h1>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 shadow-lg">
            <span className="text-amber-400">💰</span>
            <span className="font-mono font-bold">{userState.coins}</span>
          </div>
          <button 
            onClick={() => setShowStore(true)}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors p-2 rounded-full shadow-lg shadow-indigo-900/20 relative group active:scale-95"
          >
            <ShoppingBag size={20} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 z-50">
              Pet Store
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center pb-32">
        
        {/* Module Switcher - High Z-Index to ensure clickable */}
        <div className="relative z-30 flex p-1 bg-slate-800/80 backdrop-blur rounded-2xl mb-8 border border-slate-700 shadow-xl">
          <button
            onClick={() => changeMode(TimerMode.FOCUS)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
              ${mode === TimerMode.FOCUS 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <GraduationCap size={18} /> Study
          </button>
          <div className="w-px bg-slate-700 mx-1 my-2"></div>
          <button
            onClick={() => changeMode(TimerMode.SHORT_BREAK)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
              ${mode === TimerMode.SHORT_BREAK 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Coffee size={18} /> Short Rest
          </button>
          <button
            onClick={() => changeMode(TimerMode.LONG_BREAK)}
            className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
              ${mode === TimerMode.LONG_BREAK 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Moon size={18} /> Long Rest
          </button>
        </div>

        {/* AI Message Banner */}
        {(aiMessage || suggestedActivity) && !isActive && (
          <div className="mb-6 max-w-md w-full animate-fade-in z-20">
            <div className={`p-4 rounded-2xl border border-opacity-20 relative overflow-hidden shadow-lg
              ${mode === TimerMode.FOCUS ? 'bg-indigo-900/40 border-indigo-400' : 'bg-emerald-900/40 border-emerald-400'}
            `}>
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Sparkles size={20} className={mode === TimerMode.FOCUS ? 'text-indigo-300' : 'text-emerald-300'} />
                </div>
                <div>
                  <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1 text-white">
                    {mode === TimerMode.FOCUS ? 'Pet Says:' : 'Activity Idea:'}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed font-medium">
                     {mode === TimerMode.FOCUS ? aiMessage : (suggestedActivity || aiMessage)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="relative group cursor-default select-none z-20">
          {/* Progress Ring Background */}
          <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-1000
            ${mode === TimerMode.FOCUS ? 'bg-indigo-500' : 'bg-emerald-500'}
          `} />
          
          <div className="text-8xl sm:text-9xl font-mono font-bold tracking-tighter text-white drop-shadow-2xl mb-4 relative z-10 transition-all">
            {formatTime(timeLeft)}
          </div>
          
          <div className="text-center mb-8 relative z-10">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border bg-slate-900/80 backdrop-blur shadow-lg
              ${isActive ? 'animate-pulse' : ''}
              ${mode === TimerMode.FOCUS ? 'text-indigo-300 border-indigo-500/30' : 'text-emerald-300 border-emerald-500/30'}
            `}>
              {isActive ? (mode === TimerMode.FOCUS ? 'Staying Focused...' : 'Recharging...') : 'Ready to Start'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-12 z-30">
          <button 
            onClick={resetTimer}
            className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 active:scale-95 shadow-xl"
            title="Reset Timer"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`p-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center
              ${mode === TimerMode.FOCUS 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/30'}
            `}
          >
            {isActive ? <Pause size={48} fill="currentColor" className="text-white" /> : <Play size={48} fill="currentColor" className="ml-2 text-white" />}
          </button>
        </div>

        {/* Stats / Reward Preview */}
        {mode === TimerMode.FOCUS && (
          <div className="flex items-center gap-8 opacity-80 hover:opacity-100 transition-opacity bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-400">Reward</span>
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-lg">
                <Trophy size={16} /> +{COIN_REWARD}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-400">Session</span>
              <div className="flex items-center gap-2 text-indigo-300 font-mono font-bold text-lg">
                <Brain size={16} /> {Math.floor(userState.totalFocusMinutes)}m
              </div>
            </div>
          </div>
        )}
      </main>

      <PetPlayground 
        pet={activePet} 
        fullness={userState.petFullness} 
        onFeed={handleFeed} 
        coins={userState.coins} 
      />

      <Store 
        isOpen={showStore} 
        onClose={() => setShowStore(false)} 
        userCoins={userState.coins}
        unlockedPets={userState.unlockedPets}
        activePetId={userState.activePetId}
        onBuy={handleBuyPet}
        onEquip={handleEquipPet}
      />

      {/* Developer / Test Controls */}
      <DevControls 
        focusTime={focusDuration}
        shortBreakTime={shortBreakDuration}
        longBreakTime={longBreakDuration}
        onUpdateTimes={handleUpdateTimes}
        onForceComplete={() => { setIsActive(true); setTimeLeft(0); }}
      />
    </div>
  );
}
