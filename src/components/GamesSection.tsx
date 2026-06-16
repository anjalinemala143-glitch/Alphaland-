import { useState, useEffect } from 'react';
import { Gamepad2, Award, ArrowRight, Star, RefreshCw, Volume2 } from 'lucide-react';
import { UserStats, AlphabetItem } from '../types';
import { alphabetData } from '../data/alphabetData';
import { audio } from './AudioEngine';

interface GamesSectionProps {
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => Partial<UserStats>) => void;
}

type Mode = 'mascot' | 'phonics';

export default function GamesSection({ stats, onUpdateStats }: GamesSectionProps) {
  const [activeMode, setActiveMode] = useState<Mode>('mascot');
  const [currentQuestion, setCurrentQuestion] = useState<AlphabetItem | null>(null);
  const [options, setOptions] = useState<AlphabetItem[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [starsAwarded, setStarsAwarded] = useState(0);

  // Initialize a new question
  const generateNewQuestion = () => {
    setSelectedAnswer(null);
    setAnswerIsCorrect(null);
    setStarsAwarded(0);

    // Pick a random letter as the answer
    const randomIdx = Math.floor(Math.random() * alphabetData.length);
    const answerItem = alphabetData[randomIdx];
    setCurrentQuestion(answerItem);

    // Pick 3 random wrong options
    const wrongList = alphabetData.filter(item => item.letter !== answerItem.letter);
    const shuffledWrong = [...wrongList].sort(() => 0.5 - Math.random());
    const pickedOptions = [answerItem, shuffledWrong[0], shuffledWrong[1], shuffledWrong[2]];

    // Shuffle the final list of 4 options
    setOptions(pickedOptions.sort(() => 0.5 - Math.random()));

    // Introduce question vocally
    if (activeMode === 'mascot') {
      audio.speak(`Find the word that starts with ${answerItem.letter}!`);
    } else {
      audio.speak(`What letter does ${answerItem.word} start with?`);
    }
  };

  useEffect(() => {
    generateNewQuestion();
  }, [activeMode]);

  const handleOptionClick = (item: AlphabetItem) => {
    if (selectedAnswer !== null) return; // Answered already

    setSelectedAnswer(item.letter);
    const isCorrect = item.letter === currentQuestion?.letter;
    setAnswerIsCorrect(isCorrect);

    onUpdateStats((prev) => {
      const nextGamesPlayed = prev.gamesPlayed + 1;
      const nextGamesWon = isCorrect ? prev.gamesWon + 1 : prev.gamesWon;
      const starsToGain = isCorrect ? 15 : 0; // Earn 15 stars per win!
      if (isCorrect) {
        setStarsAwarded(15);
      }
      return {
        gamesPlayed: nextGamesPlayed,
        gamesWon: nextGamesWon,
        stars: prev.stars + starsToGain,
      };
    });

    if (isCorrect) {
      audio.playSuccess();
      setStreak(prev => prev + 1);
      // Praise vocally with double trigger for auditory reinforcement
      setTimeout(() => {
        audio.speakEncouragement();
      }, 500);
    } else {
      audio.playError();
      setStreak(0);
      setTimeout(() => {
        audio.speakTryAgain();
      }, 500);
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQuestion) return;
    if (activeMode === 'mascot') {
      audio.speak(`Find the picture that starts with letter ${currentQuestion.letter}!`);
    } else {
      audio.speak(`Which letter does ${currentQuestion.emoji} ${currentQuestion.word} start with?`);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div id="games-section-outer" className="space-y-6">
      {/* Mode Switches & Achievement Quick Stats */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-sky-200 border-4 border-slate-900 p-5 rounded-[32px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center gap-2 text-slate-900">
          <Gamepad2 className="w-6 h-6 shrink-0" />
          <h2 className="text-xl font-black tracking-tight">Mini Game Room!</h2>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 p-1.5 bg-white border-4 border-slate-900 rounded-2xl w-full lg:w-auto">
          <button
            key="mascot-tab-btn"
            id="tab-mode-mascot"
            onClick={() => {
              audio.playPop();
              setActiveMode('mascot');
            }}
            className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all border-2 cursor-pointer ${
              activeMode === 'mascot'
                ? 'bg-indigo-500 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
            }`}
          >
            Mascot Matcher 🍎
          </button>
          <button
            key="phonics-tab-btn"
            id="tab-mode-phonics"
            onClick={() => {
              audio.playPop();
              setActiveMode('phonics');
            }}
            className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all border-2 cursor-pointer ${
              activeMode === 'phonics'
                ? 'bg-purple-500 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                : 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
            }`}
          >
            Phonics Picnic 🦁
          </button>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center justify-center gap-2 bg-amber-100 border-4 border-slate-900 rounded-2xl px-5 py-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] w-full lg:w-auto">
          <Award className="w-5 h-5 text-amber-500 animate-bounce shrink-0" />
          <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
            Streak: {streak} 🔥
          </span>
        </div>
      </div>

      {/* Primary Game Frame card */}
      <div className="relative bg-white border-4 border-slate-900 rounded-[40px] p-6 text-center space-y-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        {/* Confetti Star Awarded Floating Banner */}
        {answerIsCorrect && starsAwarded > 0 && (
          <div className="absolute inset-0 bg-yellow-500/10 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none animate-fade-in z-10 p-4">
            <div className="bg-yellow-105 border-4 border-slate-900 p-6 rounded-[32px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center animate-bounce">
              <Star className="w-12 h-12 text-yellow-500 fill-yellow-400 animate-spin" />
              <p className="text-2xl font-black text-slate-900 mt-2">Correct Answer!</p>
              <span className="text-sm font-black text-slate-600 mt-1">+{starsAwarded} Golden Stars!</span>
            </div>
          </div>
        )}

        {/* Game Mode 1: Mascot Matcher */}
        {activeMode === 'mascot' && (
          <div className="space-y-6">
            <div className="p-2 inline-block bg-indigo-100 border-4 border-slate-900 rounded-xl mb-1">
              <p className="text-xs font-black text-indigo-900 tracking-wider font-mono uppercase">MATCHING QUEST</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                Which letter matches: <span className="text-indigo-600 font-mono font-black text-4xl underline decoration-indigo-300 ml-1">{currentQuestion.letter}</span> ?
              </h3>
              <button
                id="speak-question-mascot"
                onClick={handleSpeakQuestion}
                className="p-3 bg-indigo-150 hover:bg-indigo-200 border-2 border-slate-900 text-slate-900 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                title="Hear question"
              >
                🔊
              </button>
            </div>
            <p className="text-sm font-bold text-slate-500">
              Pick the target mascot word starting with the letter "{currentQuestion.letter}"
            </p>

            {/* Answer Grid (2x2 or row) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              {options.map((item) => {
                const isSelected = selectedAnswer === item.letter;
                const isRight = item.letter === currentQuestion.letter;

                let borderStyle = 'border-slate-900 hover:scale-102 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]';
                let bgStyle = 'bg-slate-50';

                if (selectedAnswer) {
                  if (isSelected) {
                    borderStyle = isRight ? 'border-indigo-600 ring-4 ring-emerald-400 scale-102 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'border-rose-600 ring-4 ring-rose-400 opacity-75';
                    bgStyle = isRight ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950';
                  } else {
                    borderStyle = 'opacity-50 border-slate-250 scale-98 pointer-events-none';
                  }
                }

                return (
                  <button
                    key={item.letter}
                    id={`mascot-opt-${item.letter}`}
                    onClick={() => handleOptionClick(item)}
                    className={`flex flex-col items-center p-5 rounded-3xl border-4 transition-all cursor-pointer ${borderStyle} ${bgStyle}`}
                  >
                    <span className="text-5xl sm:text-6xl mb-3 drop-shadow-[2px_2px_0px_rgba(15,23,42,0.15)] select-none">{item.emoji}</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">{item.word}</span>
                    {selectedAnswer && isRight && (
                      <span className="mt-2 text-xs font-black text-emerald-900 uppercase tracking-wider bg-emerald-300 border-2 border-slate-900 px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        Bingo! ⭐
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Mode 2: Phonics Picnic */}
        {activeMode === 'phonics' && (
          <div className="space-y-6">
            <div className="p-2 inline-block bg-purple-100 border-4 border-slate-900 rounded-xl mb-1">
              <p className="text-xs font-black text-purple-900 tracking-wider font-mono">PHONICS QUEST</p>
            </div>
            
            {/* Visual Subject Card */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#FEF3C7] rounded-[32px] border-4 border-slate-900 max-w-sm mx-auto shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-7xl mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)] select-none">{currentQuestion.emoji}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-wide font-mono uppercase bg-white border-2 border-slate-900 px-4 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  {currentQuestion.word}
                </span>
                <button
                  id="speak-question-phonics"
                  onClick={handleSpeakQuestion}
                  className="p-2.5 bg-purple-150 hover:bg-purple-200 border-2 border-slate-900 text-slate-900 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer"
                  title="Hear item speech"
                >
                  🔊
                </button>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight pt-2">
              What does "{currentQuestion.word}" start with?
            </h3>

            {/* Alphabet letter bubbles */}
            <div className="flex flex-wrap items-center justify-center gap-5 pt-3">
              {options.map((item) => {
                const isSelected = selectedAnswer === item.letter;
                const isRight = item.letter === currentQuestion.letter;

                let borderStyle = 'border-slate-900 hover:scale-110 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]';
                let bgStyle = 'bg-white';

                if (selectedAnswer) {
                  if (isSelected) {
                    borderStyle = isRight ? 'ring-4 ring-emerald-400 scale-110 opacity-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 'ring-4 ring-rose-400 opacity-70 scale-95';
                    bgStyle = isRight ? 'bg-emerald-305 text-emerald-950' : 'bg-rose-305 text-rose-950';
                  } else {
                    borderStyle = 'opacity-40 scale-90 pointer-events-none border-slate-400';
                  }
                }

                return (
                  <button
                    key={item.letter}
                    id={`phonics-opt-${item.letter}`}
                    onClick={() => handleOptionClick(item)}
                    className={`w-20 h-20 text-3xl font-black flex items-center justify-center rounded-full border-4 active:translate-y-1 active:shadow-none transition-all cursor-pointer ${borderStyle} ${bgStyle}`}
                  >
                    {item.letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Bar & Next Button */}
        {selectedAnswer !== null && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-4 border-dashed border-slate-200 animate-slide-up">
            <div className="flex items-center gap-3">
              <span className={`text-4xl ${answerIsCorrect ? 'animate-bounce' : 'animate-pulse'}`}>
                {answerIsCorrect ? '🎉' : '🥺'}
              </span>
              <div className="text-left">
                <p className={`font-black text-lg leading-none ${answerIsCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {answerIsCorrect ? 'Awesome Job! You got it!' : 'Almost right! Try again!'}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {answerIsCorrect
                    ? `"${currentQuestion.word}" begins with the sound: ${currentQuestion.phonics}`
                    : `No worries, let's learn and test another letter!`}
                </p>
              </div>
            </div>

            <button
              id="next-question-game"
              onClick={() => {
                audio.playPop();
                generateNewQuestion();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Play Next Letter
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Mini Game Instructions Guide */}
      <div className="flex items-start gap-4 p-5 bg-amber-100 border-4 border-slate-900 rounded-[32px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-inner shrink-0 text-xl font-bold">
          ⭐
        </div>
        <div className="text-left">
          <h4 className="text-sm font-black text-amber-950 tracking-tight uppercase">Game Reward Rules:</h4>
          <p className="text-xs text-amber-900 mt-1 leading-relaxed font-bold">
            Every correct answer awards **15 Stars**! Earn continuous correct matching answers to scale your **streak count** and unlock the **Crown of Stars** legendary achievement badge. Have fun matching!
          </p>
        </div>
      </div>
    </div>
  );
}
