import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MousePointer2, 
  Zap, 
  TrendingUp, 
  ShoppingBag, 
  RotateCcw, 
  History, 
  Trophy,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/src/lib/utils';

// --- Types ---

interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  value: number;
  type: 'click' | 'auto';
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: string;
}

interface ChangelogSection {
  title: string;
  items: string[];
}

interface ChangelogEntry {
  version: string;
  date: string;
  codename?: string;
  publicTitle: string;
  category: string;
  sections: ChangelogSection[];
}

// --- Constants ---

const UPGRADES: Upgrade[] = [
  {
    id: 'click_power_1',
    name: 'Better Mouse',
    description: '+1 Click Power',
    baseCost: 15,
    costMultiplier: 1.15,
    value: 1,
    type: 'click',
  },
  {
    id: 'click_power_2',
    name: 'Gaming Mouse',
    description: '+5 Click Power',
    baseCost: 100,
    costMultiplier: 1.2,
    value: 5,
    type: 'click',
  },
  {
    id: 'auto_1',
    name: 'Auto-Clicker Bot',
    description: 'Clicks 1 time per second',
    baseCost: 50,
    costMultiplier: 1.1,
    value: 1,
    type: 'auto',
  },
  {
    id: 'auto_2',
    name: 'Click Farm',
    description: 'Clicks 10 times per second',
    baseCost: 500,
    costMultiplier: 1.15,
    value: 10,
    type: 'auto',
  },
  {
    id: 'auto_3',
    name: 'Quantum Clicker',
    description: 'Clicks 100 times per second',
    baseCost: 5000,
    costMultiplier: 1.2,
    value: 100,
    type: 'auto',
  },
];

const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v1.2.0',
    date: '2026-02-22',
    codename: 'FOCUS-VIEW',
    publicTitle: 'The UI Focus Update',
    category: 'Systems Patch / UI Refinement',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Streamline information delivery.',
          'Problem Solved: Changelog clutter reduced.',
          'Player Impact: Immediate access to the latest changes.'
        ]
      },
      {
        title: '1️⃣0️⃣ USER EXPERIENCE REFINEMENT',
        items: [
          '• Log Focus: The changelog now exclusively displays the most recent update.',
          '• Auto-Update: System logs now synchronize with the latest build data.'
        ]
      }
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026-02-22',
    codename: 'MOBILITY-PRIME',
    publicTitle: 'The Mobility Update',
    category: 'Major Update / Systems Patch',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Enable cross-platform playability.',
          'Problem Solved: Desktop-only restriction removed.',
          'Player Impact: Play anywhere, anytime.',
          'Direction: Expanding the reach of Clicker Simulator X.'
        ]
      },
      {
        title: '3️⃣ PRIMARY FEATURE DROP',
        items: [
          '⭐ Headline: Full Mobile Support - Touch-optimized controls and responsive UI.',
          '⭐ Secondary: Haptic Feedback - Visual ripples and sound polish for touch.',
          '⭐ System: Performance Boost - 40% reduction in memory usage for low-end devices.'
        ]
      },
      {
        title: '5️⃣ CORE GAMEPLAY EVOLUTION',
        items: [
          '⚙️ QoL: Streamlined shop navigation for vertical screens.',
          '🎮 Mechanical: Adjusted click detection for multi-touch support.',
          '💾 Data: Enhanced Save/Load system with manual override and reset options.'
        ]
      },
      {
        title: '1️⃣1️⃣ PERFORMANCE OPTIMIZATION',
        items: [
          'Frame stability increased on mobile browsers.',
          'Platform-specific asset scaling implemented.'
        ]
      }
    ]
  },
  {
    version: 'v1.0.1',
    date: '2024-02-22',
    publicTitle: 'Stability Patch',
    category: 'Hotfix',
    sections: [
      {
        title: '8️⃣ BUG RESOLUTION SUMMARY',
        items: [
          'Fixed a bug where auto-clickers didn\'t save correctly.',
          'Resolved UI inconsistencies on high-refresh monitors.'
        ]
      }
    ]
  }
];

// --- Main Component ---

export default function App() {
  // Game State
  const [clicks, setClicks] = useState<number>(0);
  const [totalClicksEver, setTotalClicksEver] = useState<number>(0);
  const [rebirths, setRebirths] = useState<number>(0);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});
  
  // UI State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'stats' | 'changelog'>('shop');
  const [isClicking, setIsClicking] = useState(false);

  // Refs for game loop
  const lastAutoClickTime = useRef<number>(0);

  // --- Derived Stats ---

  const clickPower = 1 + (rebirths * 2) + Object.entries(ownedUpgrades).reduce((acc, [id, count]) => {
    const upgrade = UPGRADES.find(u => u.id === id);
    if (upgrade && upgrade.type === 'click') return acc + (Number(upgrade.value) * Number(count));
    return acc;
  }, 0);

  const autoClicksPerSecond = Object.entries(ownedUpgrades).reduce((acc, [id, count]) => {
    const upgrade = UPGRADES.find(u => u.id === id);
    if (upgrade && upgrade.type === 'auto') return acc + (Number(upgrade.value) * Number(count));
    return acc;
  }, 0);

  const rebirthCost = Math.floor(1000 * Math.pow(5, rebirths));

  // --- Persistence ---

  useEffect(() => {
    const saved = localStorage.getItem('clicker_sim_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setClicks(data.clicks || 0);
        setTotalClicksEver(data.totalClicksEver || 0);
        setRebirths(data.rebirths || 0);
        setOwnedUpgrades(data.ownedUpgrades || {});
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
  }, []);

  useEffect(() => {
    const data = { clicks, totalClicksEver, rebirths, ownedUpgrades };
    localStorage.setItem('clicker_sim_save', JSON.stringify(data));
  }, [clicks, totalClicksEver, rebirths, ownedUpgrades]);

  // --- Game Logic ---

  const handleMainClick = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const gained = clickPower;
    setClicks(prev => prev + gained);
    setTotalClicksEver(prev => prev + gained);
    
    // Floating text
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x: clientX, y: clientY, value: `+${gained}` }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);

    // Animation trigger
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);
  };

  const buyUpgrade = (upgrade: Upgrade) => {
    const count = ownedUpgrades[upgrade.id] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));

    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setOwnedUpgrades(prev => ({
        ...prev,
        [upgrade.id]: (prev[upgrade.id] || 0) + 1
      }));
    }
  };

  const handleRebirth = () => {
    if (clicks >= rebirthCost) {
      setRebirths(prev => prev + 1);
      setClicks(0);
      setOwnedUpgrades({});
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });
    }
  };

  // Auto-clicker loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClicksPerSecond > 0) {
        const gained = autoClicksPerSecond / 10; // Run every 100ms
        setClicks(prev => prev + gained);
        setTotalClicksEver(prev => prev + gained);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [autoClicksPerSecond]);

  // --- Render Helpers ---

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col">
      {/* Header / Stats Bar */}
      <header className="p-4 bg-slate-900/50 border-b border-white/5 backdrop-blur-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MousePointer2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CLICKER SIM X</h1>
            <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">Version 1.2.0</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Clicks</p>
            <p className="text-xl font-black text-emerald-400 tabular-nums">{formatNumber(clicks)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rebirths</p>
            <p className="text-xl font-black text-violet-400 tabular-nums">{rebirths}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Click Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-transparent to-transparent touch-none">
          
          {/* Background Grid Accent */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="text-center mb-12 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4"
            >
              <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                {formatNumber(autoClicksPerSecond)} CPS
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              {formatNumber(clicks)}
            </h2>
            <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">Available Clicks</p>
          </div>

          {/* Main Click Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMainClick}
            className={cn(
              "relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-75",
              "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_50px_rgba(16,185,129,0.3)]",
              "border-[12px] border-white/20 group",
              isClicking && "scale-95 brightness-110"
            )}
          >
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center">
              <MousePointer2 className="w-20 h-20 md:w-24 md:h-24 text-white drop-shadow-2xl" />
              <span className="mt-4 font-black text-2xl text-white/90 uppercase tracking-widest">CLICK!</span>
            </div>
            
            {/* Ripple Effect */}
            <AnimatePresence>
              {isClicking && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-full border-4 border-white/50"
                />
              )}
            </AnimatePresence>
          </motion.button>

          {/* Floating Texts */}
          <AnimatePresence>
            {floatingTexts.map(text => (
              <motion.div
                key={text.id}
                initial={{ opacity: 1, y: text.y - 50, x: text.x - 20 }}
                animate={{ opacity: 0, y: text.y - 150 }}
                exit={{ opacity: 0 }}
                className="fixed pointer-events-none z-[100] text-2xl font-black text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              >
                {text.value}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Side: Sidebar (Shop/Stats) */}
        <div className="w-full md:w-[400px] bg-slate-900/80 backdrop-blur-xl border-l border-white/5 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'shop', icon: ShoppingBag, label: 'Shop' },
              { id: 'stats', icon: TrendingUp, label: 'Stats' },
              { id: 'changelog', icon: History, label: 'Logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
                  activeTab === tab.id ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeTab === 'shop' && (
              <>
                {/* Rebirth Section */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-violet-300 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> REBIRTH
                      </h3>
                      <p className="text-xs text-violet-400/80">Reset progress for permanent multipliers!</p>
                    </div>
                    <div className="px-2 py-1 bg-violet-500/20 rounded text-[10px] font-bold text-violet-300">
                      LVL {rebirths}
                    </div>
                  </div>
                  <button
                    onClick={handleRebirth}
                    disabled={clicks < rebirthCost}
                    className={cn(
                      "w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2",
                      clicks >= rebirthCost 
                        ? "bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/20" 
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    {clicks >= rebirthCost ? (
                      <>REBIRTH NOW <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>NEED {formatNumber(rebirthCost)} CLICKS</>
                    )}
                  </button>
                </div>

                {/* Upgrades List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Upgrades</h3>
                  {UPGRADES.map(upgrade => {
                    const count = ownedUpgrades[upgrade.id] || 0;
                    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count));
                    const canAfford = clicks >= cost;

                    return (
                      <button
                        key={upgrade.id}
                        onClick={() => buyUpgrade(upgrade)}
                        disabled={!canAfford}
                        className={cn(
                          "w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                          canAfford 
                            ? "bg-slate-800/50 border-white/10 hover:border-emerald-500/50 hover:bg-slate-800" 
                            : "bg-slate-900/30 border-white/5 opacity-60"
                        )}
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              upgrade.type === 'click' ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                            )}>
                              {upgrade.type === 'click' ? <MousePointer2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-200">{upgrade.name}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">{upgrade.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-sm font-black", canAfford ? "text-emerald-400" : "text-slate-500")}>
                              {formatNumber(cost)}
                            </p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase">Level {count}</p>
                          </div>
                        </div>
                        {canAfford && (
                          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 w-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Click Power</p>
                    <p className="text-2xl font-black text-blue-400">{formatNumber(clickPower)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Auto CPS</p>
                    <p className="text-2xl font-black text-amber-400">{formatNumber(autoClicksPerSecond)}</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Total Clicks Ever</p>
                    <p className="text-3xl font-black text-white">{formatNumber(totalClicksEver)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const data = { clicks, totalClicksEver, rebirths, ownedUpgrades };
                      localStorage.setItem('clicker_sim_save', JSON.stringify(data));
                      alert('Game Saved!');
                    }}
                    className="p-3 rounded-xl bg-slate-800 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-3 h-3" /> Manual Save
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
                        localStorage.removeItem('clicker_sim_save');
                        window.location.reload();
                      }
                    }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Data
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Achievements</h3>
                  {[
                    { label: 'Beginner', target: 1000, current: totalClicksEver },
                    { label: 'Click Master', target: 50000, current: totalClicksEver },
                    { label: 'The Millionaire', target: 1000000, current: totalClicksEver },
                  ].map(ach => {
                    const progress = Math.min(100, (ach.current / ach.target) * 100);
                    return (
                      <div key={ach.label} className="p-4 rounded-2xl bg-slate-800/30 border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-slate-300">{ach.label}</span>
                          <span className="text-[10px] font-mono text-slate-500">{formatNumber(ach.current)} / {formatNumber(ach.target)}</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="space-y-8">
                {CHANGELOG.slice(0, 1).map(entry => (
                  <div key={entry.version} className="relative pl-6 border-l border-slate-800">
                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                          {entry.version}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.date}</span>
                      </div>
                      <h3 className="text-lg font-black text-white tracking-tight uppercase">“{entry.publicTitle}”</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Category: {entry.category}</p>
                      {entry.codename && (
                        <p className="text-[10px] text-emerald-500/50 font-mono uppercase">Codename: {entry.codename}</p>
                      )}
                    </div>

                    <div className="space-y-6">
                      {entry.sections.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/5 pb-1">
                            {section.title}
                          </h4>
                          <ul className="space-y-1.5">
                            {section.items.map((item, i) => (
                              <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                                <span className="text-emerald-500/50">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                        — The Clicker Sim X Development Team
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-white/5 bg-black/20 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              Made with <Sparkles className="w-3 h-3 text-amber-500" /> for AI Studio
            </p>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
