import React, { useEffect, useState } from 'react';
import { Volume2, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle, Gamepad, Sparkles } from 'lucide-react';
import { AlphabetItem } from '../types';
import { audio } from './AudioEngine';
import TracingCanvas from './TracingCanvas';

interface LetterDetailProps {
  item: AlphabetItem;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  onTraceCompleted: (letter: string) => void;
  hasTracedBefore: boolean;
}

export default function LetterDetail({
  item,
  onBack,
  onNext,
  onPrev,
  onTraceCompleted,
  hasTracedBefore
}: LetterDetailProps) {
  const [activeLearnTab, setActiveLearnTab] = useState<'phonics' | 'draw' | 'fun_fact'>('phonics');

  useEffect(() => {
    // Speak automatically on letter load for immersive teaching
    const timer = setTimeout(() => {
      audio.speakLetter(item);
    }, 400);
    return () => clearTimeout(timer);
  }, [item]);

  const speakPhonics = () => {
    audio.playPop();
    audio.speakLetter(item);
  };

  const speakFact = () => {
    audio.playPop();
    audio.speak(`${item.word} fact! ${item.fact}`);
  };

  return (
    <div id={`letter-detail-card-${item.letter}`} className="flex flex-col space-y-8">
      
      {/* Return & Quick navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-sm border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          More Letters
        </button>

        {/* Dynamic stars icon with bouncy color gradient badge */}
        <div className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-100 border-4 border-slate-900 rounded-full text-xs font-black text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300 animate-spin" />
          <span>Active Letter Card: {item.letter}</span>
        </div>
      </div>

      {/* Hero Letter Greeting Display layout */}
      <div className={`p-8 rounded-[40px] bg-gradient-to-br ${item.color} text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-center flex flex-col md:flex-row items-center md:justify-around gap-6 select-none relative overflow-hidden group`}>
        {/* Playful background blobs */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl scale-125" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl scale-125" />

        {/* Huge letter typography */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-8xl sm:text-9xl font-black tracking-tighter drop-shadow-[4px_4px_0px_rgba(15,23,42,0.35)] select-none animate-bounce duration-1000">
              {item.letter}
            </span>
            <span className="text-5xl sm:text-6xl font-black opacity-90 drop-shadow-[2px_2px_0px_rgba(15,23,42,0.35)] select-none">
              {item.lowercase}
            </span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest bg-slate-950/25 border-2 border-white/20 px-4 py-1.5 rounded-full mt-3">
            Alphabet {item.letter}
          </span>
        </div>

        {/* Emoji Icon depiction */}
        <div className="flex flex-col items-center relative z-10">
          <span className="text-8xl sm:text-9xl drop-shadow-[4px_4px_0px_rgba(15,23,42,0.2)] animate-pulse hover:scale-110 duration-300 transition-all cursor-pointer" onClick={speakPhonics}>
            {item.emoji}
          </span>
        </div>

        {/* Spelling explanation word label */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none drop-shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
            {item.word}
          </h1>
          <p className="text-sm font-black text-white/95 font-mono">
            Phonics: <span className="bg-slate-950/30 border-2 border-slate-900/10 px-3 py-1.5 rounded-xl text-white font-black">{item.phonics}</span>
          </p>
          <button
            id="speak-alphabet-main"
            onClick={speakPhonics}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl text-xs font-black tracking-wide shrink-0 self-center md:self-start border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            🔊 SPEAK OUT ALOUD
          </button>
        </div>
      </div>

      {/* Sandbox Sub Activity Tabs selector */}
      <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100 rounded-3xl border-4 border-slate-900 gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <button
          id="learn-tab-phonics"
          onClick={() => {
            audio.playPop();
            setActiveLearnTab('phonics');
          }}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm transition-all text-center cursor-pointer border-2 ${
            activeLearnTab === 'phonics'
              ? 'bg-rose-400 text-slate-900 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
              : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200'
          }`}
        >
          🔊 Phonics Sound
        </button>
        <button
          id="learn-tab-draw"
          onClick={() => {
            audio.playPop();
            setActiveLearnTab('draw');
          }}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2 border-2 ${
            activeLearnTab === 'draw'
              ? 'bg-emerald-400 text-slate-900 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
              : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200'
          }`}
        >
          ✏️ Write Tracing
          {hasTracedBefore && <ShieldCheck className="w-5 h-5 text-emerald-900 fill-emerald-400 shrink-0" />}
        </button>
        <button
          id="learn-tab-fact"
          onClick={() => {
            audio.playPop();
            setActiveLearnTab('fun_fact');
          }}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm transition-all text-center cursor-pointer border-2 ${
            activeLearnTab === 'fun_fact'
              ? 'bg-amber-400 text-slate-900 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
              : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-200'
          }`}
        >
          💡 Fun Fact
        </button>
      </div>

      {/* Tab Content Cards container */}
      <div className="bg-slate-50 rounded-[32px] p-6 sm:p-8 border-4 border-slate-900 min-h-[320px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        
        {/* Phonics audio helper panel */}
        {activeLearnTab === 'phonics' && (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-100 border-4 border-slate-900 flex items-center justify-center rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-4xl animate-pulse">🔊</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Learn the letter sound!</h3>
            <p className="text-sm font-bold text-slate-600 max-w-sm">
              Tap the speaker button below to hear standard spelling pronunciation prompts for <span className="font-black text-slate-900 font-mono">"{item.phonics}"</span>!
            </p>
            <button
              id="sound-detail-megaphone"
              onClick={speakPhonics}
              className="px-8 py-4 bg-rose-400 hover:bg-rose-500 text-slate-900 font-black text-base rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              🔈 Pronounce Pronunciation
            </button>
          </div>
        )}

        {/* Tracing Canvas sandbox container */}
        {activeLearnTab === 'draw' && (
          <TracingCanvas
            letter={item.letter}
            lowercase={item.lowercase}
            colorClass={item.color}
            onTraceComplete={() => onTraceCompleted(item.letter)}
          />
        )}

        {/* Fun Facts card panel */}
        {activeLearnTab === 'fun_fact' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6 max-w-xl mx-auto h-full">
            <div className="w-20 h-20 bg-amber-100 border-4 border-slate-900 flex items-center justify-center rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-4xl">💡</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">Did you know?</h3>
            <p className="text-lg font-bold text-slate-700 leading-relaxed italic">
              "{item.fact}"
            </p>
            <button
              id="fact-detail-announcer"
              onClick={speakFact}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-base rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              🗣️ Read Fact Aloud
            </button>
          </div>
        )}

      </div>

      {/* Bottom pagination control sliders */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t-4 border-dashed border-slate-200">
        <button
          id="detail-prev-letter-btn"
          onClick={onPrev}
          className="flex items-center justify-center gap-2 px-6 py-4.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-sm border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          Previous Letter
        </button>

        <button
          id="detail-next-letter-btn"
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-6 py-4.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-sm border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          Next Letter
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      </div>

    </div>
  );
}
