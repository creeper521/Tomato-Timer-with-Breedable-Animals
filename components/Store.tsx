import React from 'react';
import { Pet, INITIAL_PETS } from '../types';
import { X, Lock, Check } from 'lucide-react';

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  unlockedPets: string[];
  activePetId: string;
  onBuy: (pet: Pet) => void;
  onEquip: (petId: string) => void;
}

export const Store: React.FC<StoreProps> = ({ 
  isOpen, onClose, userCoins, unlockedPets, activePetId, onBuy, onEquip 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Pet Shop</h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1 bg-amber-500/20 text-amber-400 rounded-full font-mono font-bold border border-amber-500/30">
              💰 {userCoins}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INITIAL_PETS.map((pet) => {
            const isUnlocked = unlockedPets.includes(pet.id);
            const isActive = activePetId === pet.id;
            const canAfford = userCoins >= pet.price;

            return (
              <div 
                key={pet.id} 
                className={`relative p-4 rounded-xl border-2 transition-all
                  ${isActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/50'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-5xl w-20 h-20 flex items-center justify-center rounded-lg ${pet.color} bg-opacity-20`}>
                    {pet.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{pet.name}</h3>
                    <p className="text-xs text-slate-400 mb-2">{pet.description}</p>
                    
                    {isActive ? (
                      <div className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                        <Check size={16} /> Active
                      </div>
                    ) : isUnlocked ? (
                      <button 
                        onClick={() => onEquip(pet.id)}
                        className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors w-full"
                      >
                        Equip
                      </button>
                    ) : (
                      <button 
                        onClick={() => onBuy(pet)}
                        disabled={!canAfford}
                        className={`text-sm px-3 py-1.5 rounded-lg w-full flex items-center justify-center gap-2 font-bold transition-colors
                          ${canAfford 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                        `}
                      >
                        {canAfford ? 'Buy' : 'Locked'} 
                        <span className="bg-black/20 px-1.5 rounded ml-1">{pet.price}💰</span>
                      </button>
                    )}
                  </div>
                </div>
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-slate-600">
                    <Lock size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
