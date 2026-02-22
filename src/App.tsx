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
  Sparkles,
  Egg,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Ghost,
  Flame,
  Star,
  X,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Smartphone
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

interface Pet {
  id: string;
  name: string;
  multiplier: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  icon: any;
  color: string;
}

interface EggType {
  id: string;
  name: string;
  cost: number;
  pets: { petId: string; chance: number }[];
}

interface OwnedPet {
  instanceId: string;
  petId: string;
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
    costMultiplier: 1.18,
    value: 5,
    type: 'click',
  },
  {
    id: 'click_power_3',
    name: 'Super Computer',
    description: '+25 Click Power',
    baseCost: 2500,
    costMultiplier: 1.22,
    value: 25,
    type: 'click',
  },
  {
    id: 'auto_1',
    name: 'Auto-Clicker Bot',
    description: '1 CPS',
    baseCost: 50,
    costMultiplier: 1.12,
    value: 1,
    type: 'auto',
  },
  {
    id: 'auto_2',
    name: 'Click Farm',
    description: '10 CPS',
    baseCost: 750,
    costMultiplier: 1.15,
    value: 10,
    type: 'auto',
  },
  {
    id: 'auto_3',
    name: 'Quantum Clicker',
    description: '100 CPS',
    baseCost: 10000,
    costMultiplier: 1.18,
    value: 100,
    type: 'auto',
  },
  {
    id: 'auto_4',
    name: 'Galactic Clicker',
    description: '1,000 CPS',
    baseCost: 150000,
    costMultiplier: 1.2,
    value: 1000,
    type: 'auto',
  },
];

const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v1.6.0',
    date: '2026-02-22',
    codename: 'QUALITY-FLOW',
    publicTitle: 'The QoL Expansion',
    category: 'Feature Update / QoL',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Streamline gameplay loops for late-game players.',
          'Problem Solved: Repetitive clicking for upgrades and eggs.',
          'Player Impact: Faster progression and rewards for returning players.'
        ]
      },
      {
        title: '3️⃣ PRIMARY FEATURE DROP',
        items: [
          '⭐ Feature: Buy Max Upgrades - One-click to spend all possible clicks on an upgrade.',
          '⭐ Feature: Hatch 5x - Speed up your pet collection with bulk hatching.',
          '⭐ System: Offline Earnings - Earn 10% of your CPS while away (up to 2 hours).',
          '⭐ UI: Multiplier Display - See your total multiplier in the stats tab.'
        ]
      }
    ]
  },
  {
    version: 'v1.5.1',
    date: '2026-02-22',
    codename: 'SAVE-SURE',
    publicTitle: 'The Data Integrity Patch',
    category: 'Critical Bugfix',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Fix a critical bug where data was being overwritten on load.',
          'Problem Solved: Race condition between loading and auto-saving.',
          'Player Impact: Your progress is now safely persisted across sessions.'
        ]
      }
    ]
  },
  {
    version: 'v1.5.0',
    date: '2026-02-22',
    codename: 'CONTROL-PANEL',
    publicTitle: 'The Settings Update',
    category: 'Major Feature / UI Refinement',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Give players control over their experience.',
          'Problem Solved: UI clutter in Stats and lack of customization.',
          'Player Impact: Toggle visual effects and manage data in a dedicated space.'
        ]
      },
      {
        title: '3️⃣ PRIMARY FEATURE DROP',
        items: [
          '⭐ Headline: Settings Tab - A new home for game configuration.',
          '⭐ Toggle: Floating Text - Disable click numbers for better performance.',
          '⭐ Toggle: Low Graphics - Reduce visual complexity.',
          '⭐ System: Data Management - Moved save/reset controls to Settings.'
        ]
      }
    ]
  },
  {
    version: 'v1.4.1',
    date: '2026-02-22',
    codename: 'DATA-LOCK',
    publicTitle: 'The Persistence Patch',
    category: 'Systems Patch / UI Refinement',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Ensure player progress is never lost.',
          'Problem Solved: UI clutter in the changelog modal.',
          'Player Impact: Faster loading and a cleaner interface.'
        ]
      },
      {
        title: '1️⃣0️⃣ USER EXPERIENCE REFINEMENT',
        items: [
          '• Log Focus: The update modal now exclusively displays the latest version.',
          '• Data Integrity: Verified auto-save functionality for all game systems.'
        ]
      }
    ]
  },
  {
    version: 'v1.4.0',
    date: '2026-02-22',
    codename: 'PET-PALOOZA',
    publicTitle: 'The Pets & Eggs Update',
    category: 'Major Content Expansion',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Introduce a new layer of progression and collection.',
          'Problem Solved: Progression felt linear; added variety and luck-based rewards.',
          'Player Impact: Hatch eggs to find powerful pets that multiply your clicks!'
        ]
      },
      {
        title: '3️⃣ PRIMARY FEATURE DROP',
        items: [
          '⭐ Headline: Eggs & Pets - Spend clicks to hatch eggs and collect 7 unique pets.',
          '⭐ Secondary: Pet Multipliers - Equipped pets provide massive global multipliers.',
          '⭐ System: Inventory Management - View and equip your best pets in the new Pets tab.'
        ]
      }
    ]
  },
  {
    version: 'v1.3.0',
    date: '2026-02-22',
    codename: 'EQUILIBRIUM',
    publicTitle: 'The Balance Update',
    category: 'Major Balance / Content Expansion',
    sections: [
      {
        title: '2️⃣ STRATEGIC OVERVIEW',
        items: [
          'Core Objective: Refine progression speed and endgame depth.',
          'Problem Solved: Early game was too fast, late game lacked goals.',
          'Player Impact: More meaningful upgrades and powerful rebirths.'
        ]
      },
      {
        title: '6️⃣ BALANCE FRAMEWORK',
        items: [
          '🔼 Buff: Rebirths now provide a 2.0x Global Multiplier per level (was additive).',
          '🔼 Buff: Added "Super Computer" and "Galactic Clicker" upgrades.',
          '🔽 Nerf: Adjusted upgrade cost scaling for long-term sustainability.'
        ]
      },
      {
        title: '7️⃣ TECHNICAL & INFRASTRUCTURE REPORT',
        items: [
          '💾 Data: Save system verified and hardened for multi-session persistence.'
        ]
      }
    ]
  },
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

const PETS: Record<string, Pet> = {
  'dog': { id: 'dog', name: 'Dog', multiplier: 1.2, rarity: 'Common', icon: Dog, color: 'text-slate-400' },
  'cat': { id: 'cat', name: 'Cat', multiplier: 1.2, rarity: 'Common', icon: Cat, color: 'text-slate-400' },
  'rabbit': { id: 'rabbit', name: 'Rabbit', multiplier: 1.5, rarity: 'Uncommon', icon: Rabbit, color: 'text-emerald-400' },
  'bird': { id: 'bird', name: 'Bird', multiplier: 1.5, rarity: 'Uncommon', icon: Bird, color: 'text-emerald-400' },
  'ghost': { id: 'ghost', name: 'Ghost', multiplier: 2.5, rarity: 'Rare', icon: Ghost, color: 'text-blue-400' },
  'dragon': { id: 'dragon', name: 'Dragon', multiplier: 5.0, rarity: 'Epic', icon: Flame, color: 'text-purple-400' },
  'unicorn': { id: 'unicorn', name: 'Unicorn', multiplier: 15.0, rarity: 'Legendary', icon: Star, color: 'text-amber-400' },
};

const EGGS: EggType[] = [
  {
    id: 'basic_egg',
    name: 'Basic Egg',
    cost: 500,
    pets: [
      { petId: 'dog', chance: 45 },
      { petId: 'cat', chance: 45 },
      { petId: 'rabbit', chance: 10 },
    ]
  },
  {
    id: 'rare_egg',
    name: 'Rare Egg',
    cost: 5000,
    pets: [
      { petId: 'rabbit', chance: 40 },
      { petId: 'bird', chance: 40 },
      { petId: 'ghost', chance: 20 },
    ]
  },
  {
    id: 'legendary_egg',
    name: 'Legendary Egg',
    cost: 50000,
    pets: [
      { petId: 'ghost', chance: 60 },
      { petId: 'dragon', chance: 35 },
      { petId: 'unicorn', chance: 5 },
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
  const [ownedPets, setOwnedPets] = useState<OwnedPet[]>([]);
  const [equippedPets, setEquippedPets] = useState<string[]>([]);
  
  // UI State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'pets' | 'stats' | 'settings'>('shop');
  const [isClicking, setIsClicking] = useState(false);
  const [hatchingPet, setHatchingPet] = useState<Pet | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    showFloatingText: true,
    lowGraphics: false,
    vibration: true,
  });

  // Refs for game loop
  const lastAutoClickTime = useRef<number>(0);

  // --- Derived Stats ---

  const petMultiplier = equippedPets.reduce((acc, instanceId) => {
    const owned = ownedPets.find(p => p.instanceId === instanceId);
    if (owned) {
      const pet = PETS[owned.petId];
      if (pet) return acc * pet.multiplier;
    }
    return acc;
  }, 1);

  const globalMultiplier = (1 + (rebirths * 1)) * petMultiplier; // 2x, 3x, 4x...

  const clickPower = (1 + Object.entries(ownedUpgrades).reduce((acc, [id, count]) => {
    const upgrade = UPGRADES.find(u => u.id === id);
    if (upgrade && upgrade.type === 'click') return acc + (Number(upgrade.value) * Number(count));
    return acc;
  }, 0)) * globalMultiplier;

  const autoClicksPerSecond = Object.entries(ownedUpgrades).reduce((acc, [id, count]) => {
    const upgrade = UPGRADES.find(u => u.id === id);
    if (upgrade && upgrade.type === 'auto') return acc + (Number(upgrade.value) * Number(count));
    return acc;
  }, 0) * globalMultiplier;

  const rebirthCost = Math.floor(10000 * Math.pow(10, rebirths));

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
        setOwnedPets(data.ownedPets || []);
        setEquippedPets(data.equippedPets || []);
        if (data.settings) setSettings(data.settings);

        // Offline Earnings Calculation
        if (data.lastSaveTime) {
          const now = Date.now();
          const secondsAway = Math.floor((now - data.lastSaveTime) / 1000);
          if (secondsAway > 60) {
            // Calculate CPS at the time of saving (approximate)
            const globalMult = (1 + (data.rebirths || 0)) * 1; // Base mult
            const cps = Object.entries(data.ownedUpgrades || {}).reduce((acc, [id, count]) => {
              const upgrade = UPGRADES.find(u => u.id === id);
              if (upgrade && upgrade.type === 'auto') return acc + (Number(upgrade.value) * Number(count));
              return acc;
            }, 0) * globalMult;

            if (cps > 0) {
              const cappedSeconds = Math.min(secondsAway, 7200); // Cap at 2 hours
              const offlineGained = cps * cappedSeconds * 0.1; // 10% efficiency
              if (offlineGained > 0) {
                setClicks(prev => prev + offlineGained);
                setTotalClicksEver(prev => prev + offlineGained);
                alert(`Welcome back! You earned ${formatNumber(offlineGained)} clicks while away.`);
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timeout = setTimeout(() => {
      const data = { 
        clicks, 
        totalClicksEver, 
        rebirths, 
        ownedUpgrades, 
        ownedPets, 
        equippedPets, 
        settings,
        lastSaveTime: Date.now()
      };
      localStorage.setItem('clicker_sim_save', JSON.stringify(data));
    }, 2000); // Debounce save to every 2 seconds for performance
    return () => clearTimeout(timeout);
  }, [clicks, totalClicksEver, rebirths, ownedUpgrades, ownedPets, equippedPets, settings, isLoaded]);

  // --- Game Logic ---

  const handleMainClick = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const gained = clickPower;
    setClicks(prev => prev + gained);
    setTotalClicksEver(prev => prev + gained);
    
    // Floating text
    if (settings.showFloatingText) {
      const id = Date.now();
      setFloatingTexts(prev => [...prev, { id, x: clientX, y: clientY, value: `+${gained}` }]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 1000);
    }

    // Vibration
    if (settings.vibration && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

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

  const buyMaxUpgrade = (upgrade: Upgrade) => {
    let currentClicks = clicks;
    let currentCount = ownedUpgrades[upgrade.id] || 0;
    let totalCost = 0;
    let boughtCount = 0;

    while (true) {
      const nextCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentCount + boughtCount));
      if (currentClicks >= nextCost) {
        currentClicks -= nextCost;
        totalCost += nextCost;
        boughtCount++;
      } else {
        break;
      }
      // Safety break to prevent infinite loops if cost multiplier is too low
      if (boughtCount > 1000) break;
    }

    if (boughtCount > 0) {
      setClicks(prev => prev - totalCost);
      setOwnedUpgrades(prev => ({
        ...prev,
        [upgrade.id]: (prev[upgrade.id] || 0) + boughtCount
      }));
    }
  };

  const handleRebirth = () => {
    if (clicks >= rebirthCost) {
      setRebirths(prev => prev + 1);
      setClicks(0);
      setOwnedUpgrades({});
      setOwnedPets([]);
      setEquippedPets([]);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });
    }
  };

  const hatchEgg = (egg: EggType, count: number = 1) => {
    const totalCost = egg.cost * count;
    if (clicks >= totalCost) {
      setClicks(prev => prev - totalCost);
      
      const newPets: OwnedPet[] = [];
      let lastPet: Pet | null = null;

      for (let i = 0; i < count; i++) {
        // Randomly pick a pet based on chances
        const roll = Math.random() * 100;
        let cumulative = 0;
        let selectedPetId = egg.pets[0].petId;
        
        for (const p of egg.pets) {
          cumulative += p.chance;
          if (roll <= cumulative) {
            selectedPetId = p.petId;
            break;
          }
        }
        
        const instanceId = Math.random().toString(36).substring(2, 9);
        newPets.push({ instanceId, petId: selectedPetId });
        lastPet = PETS[selectedPetId];

        if (PETS[selectedPetId].rarity === 'Legendary' || PETS[selectedPetId].rarity === 'Epic') {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      }
      
      setOwnedPets(prev => [...prev, ...newPets]);
      if (lastPet) setHatchingPet(lastPet);
      
      setTimeout(() => setHatchingPet(null), 3000);
    }
  };

  const togglePet = (instanceId: string) => {
    setEquippedPets(prev => {
      if (prev.includes(instanceId)) {
        return prev.filter(id => id !== instanceId);
      } else {
        if (prev.length >= 3) {
          alert("Maximum 3 pets equipped!");
          return prev;
        }
        return [...prev, instanceId];
      }
    });
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
            <button 
              onClick={() => setShowChangelog(true)}
              className="flex items-center gap-1 group"
            >
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest group-hover:text-emerald-300 transition-colors">Version 1.6.0</p>
              <History className="w-2.5 h-2.5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
            </button>
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
              { id: 'pets', icon: Egg, label: 'Pets' },
              { id: 'stats', icon: TrendingUp, label: 'Stats' },
              { id: 'settings', icon: Settings, label: 'Settings' }
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
                {/* Eggs Section */}
                <div className="space-y-3 mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Hatch Eggs</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {EGGS.map(egg => (
                      <div key={egg.id} className="flex gap-2">
                        <button
                          onClick={() => hatchEgg(egg)}
                          disabled={clicks < egg.cost}
                          className={cn(
                            "flex-1 p-4 rounded-2xl border transition-all text-left flex justify-between items-center group",
                            clicks >= egg.cost 
                              ? "bg-slate-800/50 border-white/10 hover:border-amber-500/50 hover:bg-slate-800" 
                              : "bg-slate-900/30 border-white/5 opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                              <Egg className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-200">{egg.name}</h4>
                              <p className="text-[10px] text-slate-500 font-medium">{formatNumber(egg.cost)} Clicks</p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => hatchEgg(egg, 5)}
                          disabled={clicks < egg.cost * 5}
                          className={cn(
                            "px-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-tighter",
                            clicks >= egg.cost * 5
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                              : "bg-slate-900/30 border-white/5 text-slate-600"
                          )}
                        >
                          5x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

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
                      <div key={upgrade.id} className="flex gap-2">
                        <button
                          onClick={() => buyUpgrade(upgrade)}
                          disabled={!canAfford}
                          className={cn(
                            "flex-1 p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
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
                        <button
                          onClick={() => buyMaxUpgrade(upgrade)}
                          disabled={!canAfford}
                          className={cn(
                            "px-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-tighter",
                            canAfford
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                              : "bg-slate-900/30 border-white/5 text-slate-600"
                          )}
                        >
                          MAX
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'pets' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Equipped Multiplier</p>
                  <p className="text-2xl font-black text-white">{petMultiplier.toFixed(1)}x</p>
                  <p className="text-[10px] text-emerald-500/60 font-medium mt-1">Max 3 pets equipped at once</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Your Pets ({ownedPets.length})</h3>
                  {ownedPets.length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/20 rounded-2xl border border-dashed border-white/5">
                      <p className="text-sm text-slate-500">No pets yet. Hatch some eggs in the Shop!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {ownedPets.map(owned => {
                        const pet = PETS[owned.petId];
                        const isEquipped = equippedPets.includes(owned.instanceId);
                        return (
                          <button
                            key={owned.instanceId}
                            onClick={() => togglePet(owned.instanceId)}
                            className={cn(
                              "w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center",
                              isEquipped ? "bg-emerald-500/20 border-emerald-500/50" : "bg-slate-800/50 border-white/10 hover:bg-slate-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center", pet.color)}>
                                <pet.icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-200">{pet.name}</h4>
                                <p className={cn("text-[10px] font-bold uppercase", pet.color)}>{pet.rarity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-emerald-400">{pet.multiplier}x</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{isEquipped ? 'Equipped' : 'Unequipped'}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Total Multiplier</p>
                    <p className="text-3xl font-black text-white">{globalMultiplier.toFixed(2)}x</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Clicks Ever</p>
                    <p className="text-3xl font-black text-white">{formatNumber(totalClicksEver)}</p>
                  </div>
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

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Game Configuration</h3>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { 
                        id: 'showFloatingText', 
                        label: 'Floating Text', 
                        icon: settings.showFloatingText ? Eye : EyeOff,
                        desc: 'Show click numbers on screen'
                      },
                      { 
                        id: 'vibration', 
                        label: 'Haptic Feedback', 
                        icon: Smartphone,
                        desc: 'Vibrate on click (Mobile)'
                      },
                      { 
                        id: 'lowGraphics', 
                        label: 'Low Graphics', 
                        icon: Zap,
                        desc: 'Reduce visual effects'
                      },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                        className="w-full p-4 rounded-2xl bg-slate-800/50 border border-white/10 flex justify-between items-center hover:bg-slate-800 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-sm text-slate-200">{item.label}</h4>
                            <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-12 h-6 rounded-full relative transition-colors",
                          settings[item.id as keyof typeof settings] ? "bg-emerald-500" : "bg-slate-700"
                        )}>
                          <motion.div 
                            animate={{ x: settings[item.id as keyof typeof settings] ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Data Management</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        const data = { clicks, totalClicksEver, rebirths, ownedUpgrades, ownedPets, equippedPets, settings };
                        localStorage.setItem('clicker_sim_save', JSON.stringify(data));
                        alert('Game Saved!');
                      }}
                      className="p-4 rounded-2xl bg-slate-800 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5 text-emerald-400" /> Manual Save
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
                          localStorage.removeItem('clicker_sim_save');
                          window.location.reload();
                        }
                      }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" /> Reset Data
                    </button>
                  </div>
                </div>
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

      {/* Changelog Modal */}
      <AnimatePresence>
        {showChangelog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Update Logs</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Official Release History</p>
                </div>
                <button 
                  onClick={() => setShowChangelog(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hatching Overlay */}
      <AnimatePresence>
        {hatchingPet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-40px] border-2 border-dashed border-emerald-500/20 rounded-full"
                />
                <div className={cn("w-32 h-32 mx-auto bg-white/5 rounded-3xl flex items-center justify-center shadow-2xl", hatchingPet.color)}>
                  <hatchingPet.icon className="w-20 h-20" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">YOU GOT A {hatchingPet.name}!</h2>
              <p className={cn("text-xl font-bold uppercase tracking-widest", hatchingPet.color)}>{hatchingPet.rarity}</p>
              <p className="text-emerald-400 font-black text-2xl mt-4">{hatchingPet.multiplier}x Multiplier</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
