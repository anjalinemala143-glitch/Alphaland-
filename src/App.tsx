import { useState, useEffect } from 'react';
import { ActiveTab, UserStats, AlphabetItem, Badge } from './types';
import { alphabetData } from './data/alphabetData';
import { getStats, updateStatsAndCheckBadges, saveStats, INITIAL_STATS } from './utils/rewardsHelper';
import { audio } from './components/AudioEngine';

import AlphabetGrid from './components/AlphabetGrid';
import LetterDetail from './components/LetterDetail';
import GamesSection from './components/GamesSection';
import Badges from './components/Badges';
import Confetti from './components/Confetti';

import { Star, Award, BookOpen, Gamepad2, Volume2, Sparkles, Smile } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetItem | null>(null);
  
  // Confetti trigger
  const [confettiActive, setConfettiActive] = useState(false);
  // Badge Reward overlay trigger
  const [unlockedBadgeToShow, setUnlockedBadgeToShow] = useState<Badge | null>(null);

  // Load stats from LocalStorage on mount
  useEffect(() => {
    const loadedStats = getStats();
    setStats(loadedStats);
    
    // Friendly introductory voice greeting
    const greetTimer = setTimeout(() => {
      audio.speak("Welcome to the Alphabet Learning Game! Let's explore, paint letters, and win stars together!");
    }, 1000);

    return () => clearTimeout(greetTimer);
  }, []);

  // Update stats helper with unlock notifications
  const handleUpdate = (updater: (prev: UserStats) => Partial<UserStats>) => {
    const nextStats = updateStatsAndCheckBadges(updater, (unlockedBadge) => {
      // Trigger confetti & display overlay for unlocked badge achievement!
      setUnlockedBadgeToShow(unlockedBadge);
      setConfettiActive(true);
      audio.playFanfare();
      setTimeout(() => {
        audio.speak(`Congratulations! You unlocked the ${unlockedBadge.title} badge!`);
      }, 500);
    });
    setStats(nextStats);
  };

  // Tracing drawing finished successfully
  const handleTraceCompleted = (letter: string) => {
    setConfettiActive(true);
    handleUpdate((prev) => {
      const alreadyTraced = prev.tracedLetters.includes(letter);
      const nextTraced = alreadyTraced ? prev.tracedLetters : [...prev.tracedLetters, letter];
      // Earn 25 stars for tracing letter lines correctly!
      const starsGain = alreadyTraced ? 5 : 25; 
      return {
        tracedLetters: nextTraced,
        stars: prev.stars + starsGain
      };
    });
  };

  // Letter explorer opened
  const handleSelectLetter = (item: AlphabetItem) => {
    setSelectedLetter(item);
    
    // Log explored letter
    handleUpdate((prev) => {
      const alreadyUnlocked = prev.unlockedLetters.includes(item.letter);
      return {
        unlockedLetters: alreadyUnlocked ? prev.unlockedLetters : [...prev.unlockedLetters, item.letter]
      };
    });
  };

  const handleNextLetter = () => {
    if (!selectedLetter) return;
    const currentIdx = alphabetData.findIndex(x => x.letter === selectedLetter.letter);
    const nextIdx = (currentIdx + 1) % alphabetData.length;
    handleSelectLetter(alphabetData[nextIdx]);
  };

  const handlePrevLetter = () => {
    if (!selectedLetter) return;
    const currentIdx = alphabetData.findIndex(x => x.letter === selectedLetter.letter);
    const prevIdx = (currentIdx - 1 + alphabetData.length) % alphabetData.length;
    handleSelectLetter(alphabetData[prevIdx]);
  };

  const resetStats = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alphabet_learning_stats_v1');
    }
    setStats(INITIAL_STATS);
    setActiveTab('explore');
    setSelectedLetter(null);
    audio.playSuccess();
    audio.speak("Your scores and achievements have been reset. Let's start fresh!");
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] flex flex-col font-sans text-slate-900 pb-12 antialiased">
      
      {/* Interactive Confetti Particle System canvas */}
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Floating Header Toolbar */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-slate-900 py-4 px-4 shadow-[0_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div
            onClick={() => {
              audio.playPop();
              setSelectedLetter(null);
              setActiveTab('explore');
            }}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <div className="w-14 h-14 bg-red-500 border-4 border-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] group-hover:rotate-6 transition-transform">
              ABC
            </div>
            <div className="text-left select-none">
              <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight">
                AlphaLand
              </h1>
              <p className="text-xs font-black text-slate-500 font-mono tracking-wider uppercase">
                Interactive BENTO GRID Playground
              </p>
            </div>
          </div>

          {/* Quick Stats bar: Stars & Badge Counters */}
          <div className="flex items-center gap-4">
            
            {/* Crown of stars indicator */}
            <div className="flex items-center gap-2 bg-white border-4 border-slate-900 rounded-full px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-2xl animate-spin inline-block">⭐</span>
              <span className="text-xl font-black text-slate-900" id="header-stars-count">
                {stats.stars}
              </span>
            </div>

            {/* Speaking announcer option */}
            <button
              id="header-megaphone-advisor"
              onClick={() => {
                audio.playPop();
                audio.speak(`Welcome to AlphaLand! You currently have ${stats.stars} golden stars and unlocked ${stats.badges.filter(b => b.unlockedAt).length} reward medals! Keep it up!`);
              }}
              className="w-12 h-12 bg-sky-400 border-4 border-slate-900 rounded-full flex items-center justify-center text-slate-900 font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:scale-105 active:scale-95 transition-all text-xl"
              title="Hear stats read aloud"
            >
              🔊
            </button>

          </div>
        </div>
      </header>

      {/* Main Grid, Sand Box, or Tab Display Stage section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-8 space-y-6">

        {/* Unlocked Badge Overlay Banner Popup */}
        {unlockedBadgeToShow && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-center">
            <div className="bg-white border-8 border-slate-900 rounded-[40px] p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative animate-scale-up space-y-6 flex flex-col items-center">
              
              <div className="absolute -top-14 bg-yellow-400 border-4 border-slate-900 w-28 h-28 flex items-center justify-center rounded-full text-6xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-bounce">
                {unlockedBadgeToShow.icon}
              </div>

              <div className="pt-12 space-y-2">
                <span className="text-xs font-black uppercase text-white bg-indigo-600 border-2 border-slate-900 px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  LEVEL COMPLETED
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mt-4">
                  {unlockedBadgeToShow.title}
                </h2>
                <p className="text-slate-600 font-bold text-sm">
                  {unlockedBadgeToShow.description}
                </p>
              </div>

              <div className="bg-amber-100 border-4 border-slate-900 rounded-2xl p-4 w-full text-amber-950">
                <p className="text-xs font-black">
                  Target criteria: "{unlockedBadgeToShow.reqDescription}" satisfied!
                </p>
                <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-orange-600 font-black tracking-wider uppercase animate-pulse">
                  ✨ +50 Bonus Stars Awarded ✨
                </div>
              </div>

              <button
                id="badge-claim-ok-btn"
                onClick={() => {
                  audio.playPop();
                  setUnlockedBadgeToShow(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-400 hover:scale-102 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900 font-black rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all text-base"
              >
                <Smile className="w-6 h-6 shrink-0" />
                Awesome! Let's Go! 🎉
              </button>

            </div>
          </div>
        )}

        {/* Tab controls (Hidden if inside detailed view to emphasize student focus) */}
        {!selectedLetter && (
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto bg-white p-2 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            
            {/* Tab 1: Explore letters */}
            <button
              id="navigation-tab-explore"
              onClick={() => {
                audio.playPop();
                setActiveTab('explore');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm tracking-wide transition-all border-4 ${
                activeTab === 'explore'
                  ? 'bg-rose-400 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Alphabet A-Z</span>
            </button>

            {/* Tab 2: Mini-Games */}
            <button
              id="navigation-tab-games"
              onClick={() => {
                audio.playPop();
                setActiveTab('games');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm tracking-wide transition-all border-4 ${
                activeTab === 'games'
                  ? 'bg-purple-500 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
              }`}
            >
              <Gamepad2 className="w-5 h-5 shrink-0 animate-pulse" />
              <span>Mini Games</span>
            </button>

            {/* Tab 3: Rewards/Badges progress */}
            <button
              id="navigation-tab-rewards"
              onClick={() => {
                audio.playPop();
                setActiveTab('rewards');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm tracking-wide transition-all border-4 ${
                activeTab === 'rewards'
                  ? 'bg-yellow-400 text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
              }`}
            >
              <Award className="w-5 h-5 shrink-0" />
              <span>Progress Shelf</span>
            </button>

          </div>
        )}

        {/* Dynamic Display Segment Stage */}
        <div className="bg-white rounded-[40px] border-4 border-slate-900 p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          
          {selectedLetter ? (
            /* Inside single Letter Explorer screen */
            <LetterDetail
              item={selectedLetter}
              onBack={() => {
                audio.playPop();
                setSelectedLetter(null);
              }}
              onNext={handleNextLetter}
              onPrev={handlePrevLetter}
              onTraceCompleted={handleTraceCompleted}
              hasTracedBefore={stats.tracedLetters.includes(selectedLetter.letter)}
            />
          ) : (
            /* Dashboard View Tabs switcher */
            <div>
              {activeTab === 'explore' && (
                <AlphabetGrid
                  stats={stats}
                  onSelectLetter={handleSelectLetter}
                />
              )}

              {activeTab === 'games' && (
                <GamesSection
                  stats={stats}
                  onUpdateStats={handleUpdate}
                />
              )}

              {activeTab === 'rewards' && (
                <Badges
                  stats={stats}
                  onResetProgress={resetStats}
                />
              )}
            </div>
          )}

        </div>

      </main>

      {/* Playful Footer credits (Anti-AI slop clean design - no system metadata lines) */}
      <footer className="mt-auto pt-8 text-center text-sm text-slate-500 font-extrabold select-none">
        <p className="flex items-center justify-center gap-1">
          Made with 💖 for curious little minds to learn and play in AlphaLand!
        </p>
      </footer>

    </div>
  );
}
