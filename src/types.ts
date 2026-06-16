export interface AlphabetItem {
  letter: string; // "A"
  lowercase: string; // "a"
  word: string; // "Apple"
  emoji: string; // "🍎"
  phonics: string; // "ah-ah-apple"
  color: string; // Tailwind gradient starting and ending class names (e.g., "from-pink-400 to-rose-500")
  soundName: string; // phonetics audio spelling guide
  fact: string; // Fun quick text about the word
}

export interface UserStats {
  stars: number;
  unlockedLetters: string[];
  tracedLetters: string[];
  gamesPlayed: number;
  gamesWon: number;
  badges: Badge[];
}

export interface Badge {
  id: string; // "first_steps"
  title: string; // "Alphabet Explorer"
  description: string; // "Learnt your first letter!"
  icon: string; // Emoji character like "🏅" or "🚀"
  unlockedAt: string | null; // Date string or null
  reqDescription: string; // "Explore 1 letter"
}

export type ActiveTab = 'explore' | 'games' | 'rewards';
