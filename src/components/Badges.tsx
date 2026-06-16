import React, { useState } from 'react';
import { Badge, UserStats } from '../types';
import { Award, Star, Flame, MapPinned, Play, Volume2 } from 'lucide-react';
import { audio } from './AudioEngine';

interface BadgesProps {
  stats: UserStats;
  onResetProgress: () => void;
}

export default function Badges({ stats, onResetProgress }: BadgesProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const announceBadge = (badge: Badge) => {
    audio.playPop();
    if (badge.unlockedAt) {
      audio.speak(`Hooray! You unlocked the ${badge.title} Badge! ${badge.description}`);
    } else {
      audio.speak(`Locked Badge: ${badge.title}. To earn this, you need to ${badge.reqDescription}. Keep playing!`);
    }
  };

  const unlockedCount = stats.badges.filter(b => b.unlockedAt !== null).length;
  const progressPercent = Math.min(100, Math.round((unlockedCount / stats.badges.length) * 100));

  return (
    <div id="badges-container-view" className="space-y-8">
      {/* Playful Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Stars */}
        <div className="bg-yellow-400 border-4 border-slate-900 rounded-[32px] p-5 text-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-2 right-2 opacity-10 text-6xl select-none">⭐</div>
          <Star className="w-10 h-10 text-slate-950 fill-white animate-pulse" />
          <span className="text-4xl font-black mt-2 leading-none select-none">{stats.stars}</span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 mt-1.5">Stars Earned</span>
        </div>

        {/* Letters Explored */}
        <div className="bg-sky-400 border-4 border-slate-900 rounded-[32px] p-5 text-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-2 right-2 opacity-10 text-6xl select-none">📖</div>
          <MapPinned className="w-10 h-10 text-slate-950" />
          <span className="text-4xl font-black mt-2 leading-none select-none">{stats.unlockedLetters.length} <span className="text-sm font-bold opacity-75">/26</span></span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 mt-1.5">Letters Learned</span>
        </div>

        {/* Letters Traced */}
        <div className="bg-emerald-400 border-4 border-slate-900 rounded-[32px] p-5 text-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-2 right-2 opacity-10 text-6xl select-none">✏️</div>
          <Award className="w-10 h-10 text-slate-950" />
          <span className="text-4xl font-black mt-2 leading-none select-none">{stats.tracedLetters.length} <span className="text-sm font-bold opacity-75">/26</span></span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 mt-1.5">Letters Traced</span>
        </div>

        {/* Games Played */}
        <div className="bg-purple-400 border-4 border-slate-900 rounded-[32px] p-5 text-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
          <div className="absolute top-2 right-2 opacity-10 text-6xl select-none">🎮</div>
          <Flame className="w-10 h-10 text-slate-950" />
          <span className="text-4xl font-black mt-2 leading-none select-none">{stats.gamesWon}</span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 mt-1.5">Games Won</span>
        </div>
      </div>

      {/* Progress Milestone meter */}
      <div className="bg-white border-4 border-slate-900 rounded-[32px] p-6 text-center space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <h3 className="text-md font-black text-slate-900 uppercase tracking-widest font-mono">
            YOUR BADGE PROGRESS ({unlockedCount} / {stats.badges.length} EARNED)
          </h3>
          <span className="text-xs font-black text-indigo-900 bg-indigo-100 border-2 border-indigo-300 px-3 py-1 rounded-full shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
            {progressPercent}% Scholar Level!
          </span>
        </div>
        <div className="relative w-full h-8 bg-slate-100 rounded-full overflow-hidden border-4 border-slate-900 shadow-inner">
          <div
            id="badge-percentage-bar"
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-emerald-400 transition-all duration-500 ease-out border-r-4 border-slate-900"
          />
        </div>
      </div>

      {/* Badges List Shelf */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight text-left">🏆 Your Shiny Badge Shelf</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.badges.map((badge) => {
            const isUnlocked = badge.unlockedAt !== null;

            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                onClick={() => announceBadge(badge)}
                className={`relative flex items-center gap-4 p-5 rounded-3xl border-4 cursor-pointer transition-all active:scale-98 select-none group ${
                  isUnlocked
                    ? 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]'
                    : 'bg-slate-100 border-slate-300 opacity-70'
                }`}
              >
                {/* Visual badge token bubble */}
                <div
                  className={`w-16 h-16 shrink-0 flex items-center justify-center text-4xl rounded-full border-4 ${
                    isUnlocked
                      ? 'bg-yellow-300 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-slate-200 border-slate-400 text-slate-400 select-none grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Info and helper details */}
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`font-black text-sm leading-tight truncate ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                      {badge.title}
                    </h4>
                    <span className="text-xs shrink-0 select-none opacity-0 group-hover:opacity-100 transition-opacity">🔊</span>
                  </div>
                  <p className="text-xs text-slate-600 font-bold line-clamp-2 mt-1" title={isUnlocked ? badge.description : badge.reqDescription}>
                    {isUnlocked ? badge.description : `🔒 Locked: ${badge.reqDescription}`}
                  </p>
                  {isUnlocked && (
                    <span className="inline-block mt-2 text-[10px] font-black uppercase bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-md">
                      Earned {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Progress Section (Hidden, but keeps control healthy or cleans testing) */}
      <div className="pt-8 border-t-4 border-dashed border-slate-200 flex justify-end">
        {!showConfirmReset ? (
          <button
            key="reset-trigger-btn"
            id="reset-stats-btn"
            onClick={() => {
              audio.playPop();
              setShowConfirmReset(true);
            }}
            className="text-xs font-black text-slate-400 hover:text-rose-600 hover:underline transition-all cursor-pointer"
          >
            Reset My Game Stats
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-rose-50 p-5 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-[#881337]">
            <span className="text-sm font-black">Are you sure you want to clear your badges and stars?</span>
            <div className="flex items-center gap-2">
              <button
                id="confirm-reset-yes"
                onClick={() => {
                  setShowConfirmReset(false);
                  onResetProgress();
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 cursor-pointer"
              >
                Yes, Restart!
              </button>
              <button
                id="confirm-reset-cancel"
                onClick={() => {
                  audio.playPop();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
