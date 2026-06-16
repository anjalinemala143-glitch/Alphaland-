import { useState } from 'react';
import { AlphabetItem, UserStats } from '../types';
import { alphabetData } from '../data/alphabetData';
import { audio } from './AudioEngine';
import { Search, Sparkles, Filter, CheckCircle } from 'lucide-react';

interface AlphabetGridProps {
  stats: UserStats;
  onSelectLetter: (item: AlphabetItem) => void;
}

type FilterType = 'all' | 'vowels' | 'consonants' | 'traced';

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export default function AlphabetGrid({ stats, onSelectLetter }: AlphabetGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = alphabetData.filter((item) => {
    // 1. Filter by keyword lookup
    const matchesSearch =
      item.letter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.word.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter by vowel/consonant/traced category
    switch (activeFilter) {
      case 'vowels':
        return VOWELS.includes(item.letter);
      case 'consonants':
        return !VOWELS.includes(item.letter);
      case 'traced':
        return stats.tracedLetters.includes(item.letter);
      default:
        return true;
    }
  });

  const handleItemClick = (item: AlphabetItem) => {
    // Play synthetic pop
    audio.playPop();
    onSelectLetter(item);
  };

  return (
    <div id="alphabet-grid-dashboard" className="space-y-8">
      
      {/* Search and Filters Hub */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#FEF3C7] border-4 border-slate-900 p-5 rounded-[32px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        
        {/* Playful search bar */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          <input
            type="text"
            id="search-letters-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type 'Apple' or 'A' to search..."
            className="w-full pl-12 pr-4 py-3 bg-white border-4 border-slate-900 focus:outline-hidden rounded-2xl text-sm font-black text-slate-800 placeholder-slate-500 shadow-inner"
          />
        </div>

        {/* Filter Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border-4 border-slate-900 rounded-2xl">
          {(['all', 'vowels', 'consonants', 'traced'] as FilterType[]).map((tab) => {
            const labels: Record<FilterType, string> = {
              all: 'All Letters A-Z 📚',
              vowels: 'Vowels 🍒',
              consonants: 'Consonants 🦁',
              traced: 'Traced Lines ✏️'
            };

            const isSelected = activeFilter === tab;

            return (
              <button
                key={tab}
                id={`filter-button-${tab}`}
                onClick={() => {
                  audio.playPop();
                  setActiveFilter(tab);
                }}
                className={`px-3 py-2 rounded-xl font-bold text-xs tracking-wide border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-900'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

      </div>

      {/* Grid container of alphabet boxes */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredItems.map((item) => {
            const isTraced = stats.tracedLetters.includes(item.letter);
            const isLearnt = stats.unlockedLetters.includes(item.letter);

            return (
              <button
                key={item.letter}
                id={`grid-letter-box-${item.letter}`}
                onClick={() => handleItemClick(item)}
                className={`relative flex flex-col items-center justify-between p-5 rounded-[32px] bg-gradient-to-br ${item.color} border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all h-[180px] text-white select-none group cursor-pointer`}
              >
                {/* Floating Traced Checkmark banner */}
                {isTraced && (
                  <div className="absolute -top-2.5 -right-2.5 p-1.5 bg-emerald-400 rounded-full border-4 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] animate-bounce" title="Successfully Traced!">
                    <CheckCircle className="w-4 h-4 text-white fill-emerald-500" />
                  </div>
                )} {isLearnt && !isTraced && (
                  <div className="absolute top-3 right-3 w-4 h-4 bg-yellow-300 rounded-full border-2 border-slate-900" title="Explored letter" />
                )}

                {/* Main letter representation */}
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-5xl font-black tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] select-none">
                    {item.letter}
                  </span>
                  <span className="text-3xl font-black opacity-90 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.15)] select-none">
                    {item.lowercase}
                  </span>
                </div>

                {/* Cute visual mascot representing word */}
                <span className="text-5xl drop-shadow-[3px_3px_0px_rgba(0,0,0,0.2)] group-hover:scale-115 transition-transform duration-300 select-none">
                  {item.emoji}
                </span>

                {/* Subtitle text */}
                <span className="text-xs font-black uppercase tracking-wider bg-slate-950/25 border-2 border-slate-900/10 px-3 py-1 rounded-full mt-2 w-full text-center truncate select-none">
                  {item.word}
                </span>
                
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white border-4 border-slate-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-center space-y-4">
          <span className="text-6xl">🔭</span>
          <h3 className="text-2xl font-black text-slate-800">No letters match</h3>
          <p className="text-sm font-semibold text-slate-500 max-w-sm">
            We couldn't find any letters starting with "{searchQuery}". Try searching for other letters!
          </p>
          <button
            id="clear-search-btn"
            onClick={() => {
              audio.playPop();
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Sparkly quick tip card */}
      <div className="flex items-start gap-4 p-5 bg-sky-200 border-4 border-slate-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <div className="text-3xl">💡</div>
        <div>
          <p className="text-sm font-black text-slate-900 text-left uppercase tracking-wide">
            Tip for little scholars:
          </p>
          <p className="text-xs font-bold text-slate-700 text-left leading-relaxed mt-1">
            Tap on any colorful letter card block above to hear how it's spoken, practice tracing it with your drawing pen, and unlock cool fun baby facts!
          </p>
        </div>
      </div>

    </div>
  );
}
