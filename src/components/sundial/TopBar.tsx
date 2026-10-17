import React from 'react';
import { SimulationMode } from '../../types/sundial';
import { 
  Sun, 
  RotateCw, 
  Compass, 
  BookOpen, 
  Trophy, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface TopBarProps {
  mode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  activeTab: 'simulation' | 'classroom' | 'challenges' | 'theory';
  onSelectTab: (tab: 'simulation' | 'classroom' | 'challenges' | 'theory') => void;
  onOpenGuide: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  onSelectMode,
  activeTab,
  onSelectTab,
  onOpenGuide,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Simulation Modes Switcher (1. Rotación vs 2. Ángulos) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            onSelectTab('simulation');
            onSelectMode('earth_rotation');
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'simulation' && mode === 'earth_rotation'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>1. Rotación Terrestre (Horas)</span>
        </button>

        <button
          onClick={() => {
            onSelectTab('simulation');
            onSelectMode('sun_angles');
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'simulation' && mode === 'sun_angles'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>2. Ángulos Solares (H, δ)</span>
        </button>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectTab('classroom')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'classroom'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>Salón y Orientación</span>
        </button>

        <button
          onClick={() => onSelectTab('challenges')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'challenges'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <span>Desafíos Didácticos</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 font-semibold transition-all flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Guía Pedagógica</span>
        </button>
      </div>
    </div>
  );
};
