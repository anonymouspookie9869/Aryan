import React, { useState } from 'react';
import { Trophy, Sparkles, CheckCircle2, XCircle, Heart, RefreshCw, Award, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, PartnerInfo } from '../types';
import { romanticAudio } from '../utils/romanticAudio';

interface GamesViewProps {
  quiz: QuizQuestion[];
  partner: PartnerInfo;
}

// Memory Match Game Cards with Anmol & Aryan's personal milestones
const MATCH_PAIRS = [
  { id: '1', symbol: '💌', name: '4 Jan: Pehli Baat' },
  { id: '2', symbol: '🌸', name: '13 Feb: Pehli Date' },
  { id: '3', symbol: '💑', name: '16 May: Relationship' },
  { id: '4', symbol: '🏍️', name: '6 Aug: Bike Ride' },
  { id: '5', symbol: '🍔', name: 'Fast Food Cravings' },
  { id: '6', symbol: '👑', name: '19 Sep: Anmol Day' },
];

export const GamesView: React.FC<GamesViewProps> = ({ quiz, partner }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'match'>('quiz');

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Memory Match State
  const [cards, setCards] = useState(() => {
    const doubled = [...MATCH_PAIRS, ...MATCH_PAIRS].map((item, idx) => ({
      uniqueId: idx,
      ...item,
      isFlipped: false,
      isMatched: false
    }));
    return doubled.sort(() => Math.random() - 0.5);
  });
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchesFound, setMatchesFound] = useState(0);
  const [moves, setMoves] = useState(0);

  // Handle Quiz Option Click
  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const question = quiz[currentQuestionIndex];
    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      romanticAudio.playChime([523.25, 659.25, 783.99]);
      setScore(prev => prev + 1);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24']
      });
    } else {
      romanticAudio.playChime([440, 392]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quiz.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      romanticAudio.playBirthdayMelody();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#ec4899', '#ffffff']
      });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  // Handle Memory Card Click
  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    romanticAudio.playChime([523.25]);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // Match!
        romanticAudio.playChime([659.25, 880, 1046.5]);
        newCards[firstIdx].isMatched = true;
        newCards[secondIdx].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setMatchesFound(prev => {
          const updated = prev + 1;
          if (updated === MATCH_PAIRS.length) {
            // Victory
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.5 },
              colors: ['#f43f5e', '#fbbf24', '#ec4899']
            });
          }
          return updated;
        });
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(prevCards => {
            const resetCards = [...prevCards];
            resetCards[firstIdx].isFlipped = false;
            resetCards[secondIdx].isFlipped = false;
            return resetCards;
          });
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const handleRestartMatch = () => {
    const doubled = [...MATCH_PAIRS, ...MATCH_PAIRS].map((item, idx) => ({
      uniqueId: idx,
      ...item,
      isFlipped: false,
      isMatched: false
    }));
    setCards(doubled.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchesFound(0);
    setMoves(0);
  };

  const currentQ = quiz[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-pink-600" />
          <span>Romantic Games & Trivia</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          How Well Do You Know Us?
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mt-2">
          Test your couple trivia or test your memory matching our favorite sweet moments!
        </p>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs shadow-pink-500/25'
                : 'bg-pink-100/70 text-stone-700 border border-pink-200 hover:bg-pink-200 hover:text-pink-950'
            }`}
          >
            Couple's Trivia Quiz
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer transition-all ${
              activeTab === 'match'
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-xs shadow-pink-500/25'
                : 'bg-pink-100/70 text-stone-700 border border-pink-200 hover:bg-pink-200 hover:text-pink-950'
            }`}
          >
            Love Memory Match Game
          </button>
        </div>
      </div>

      {/* TAB 1: COUPLE TRIVIA QUIZ */}
      {activeTab === 'quiz' && (
        <div className="bg-[#fff0f6]/95 rounded-3xl p-6 sm:p-10 border border-pink-200/90 shadow-md shadow-pink-200/40">
          {!quizFinished ? (
            <div>
              {/* Progress & Counter */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-3 border-b border-pink-100">
                <span className="font-semibold text-pink-600">
                  Question {currentQuestionIndex + 1} of {quiz.length}
                </span>
                <span>Current Score: {score}</span>
              </div>

              {/* Question Text */}
              <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-6 leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((option, idx) => {
                  let buttonStyle = "border-pink-200 bg-pink-50/80 hover:border-pink-300 hover:bg-pink-100/70 text-stone-800";

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                    } else if (idx === selectedOption) {
                      buttonStyle = "border-pink-400 bg-pink-50 text-pink-900";
                    } else {
                      buttonStyle = "border-stone-200 opacity-50 text-stone-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between text-sm sm:text-base ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-pink-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="p-4 bg-pink-50/70 rounded-2xl border border-pink-200 mb-6 animate-fadeIn">
                  <p className="text-xs uppercase tracking-wider text-pink-700 font-bold mb-1">
                    The Sweet Truth:
                  </p>
                  <p className="font-handwriting text-xl text-stone-800">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/25 cursor-pointer transition-all active:scale-95"
                  >
                    {currentQuestionIndex + 1 === quiz.length ? "See Final Love Certificate" : "Next Question →"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Quiz Certificate Finished Screen
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-pink-100 border-4 border-pink-300 flex items-center justify-center mx-auto mb-4 text-pink-600 shadow-md">
                <Award className="w-10 h-10" />
              </div>

              <span className="text-xs uppercase tracking-widest text-pink-600 font-bold">
                Official Certification
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1 mb-2">
                100% Certified Soulmates
              </h3>

              <p className="font-handwriting text-2xl text-stone-700 max-w-lg mx-auto mb-6">
                "Whether you scored {score}/{quiz.length} or a million points, the truth is written in the stars: you and I belong together forever."
              </p>

              <div className="bg-pink-50/50 rounded-2xl p-6 border-2 border-dashed border-pink-200 max-w-md mx-auto mb-8">
                <div className="flex items-center justify-center gap-1 text-pink-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-pink-400 text-pink-400" />
                  ))}
                </div>
                <p className="font-display font-bold text-stone-900 text-lg">
                  {partner.girlfriendName} & {partner.clientName}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Awarded on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <button
                onClick={handleRestartQuiz}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold mx-auto cursor-pointer shadow-xs shadow-pink-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Play Trivia Again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOVE MEMORY MATCH GAME */}
      {activeTab === 'match' && (
        <div className="bg-[#fff0f6]/95 rounded-3xl p-6 sm:p-10 border border-pink-200/90 shadow-md shadow-pink-200/40">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-pink-100">
            <div>
              <span className="text-xs text-stone-500">Pairs Matched:</span>
              <span className="ml-2 font-display font-bold text-pink-600 text-lg">
                {matchesFound} / {MATCH_PAIRS.length}
              </span>
            </div>
            <div>
              <span className="text-xs text-stone-500">Moves:</span>
              <span className="ml-2 font-semibold text-stone-800 text-sm">{moves}</span>
            </div>
            <button
              onClick={handleRestartMatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 text-stone-600 hover:text-pink-600 hover:border-pink-300 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Game</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto mb-6">
            {cards.map((card, index) => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.uniqueId}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-2xl cursor-pointer flex flex-col items-center justify-center p-2 text-center transition-all duration-300 transform select-none ${
                    isRevealed
                      ? card.isMatched
                        ? 'bg-emerald-50 border-2 border-emerald-400 scale-95 shadow-2xs'
                        : 'bg-pink-50 border-2 border-pink-300 scale-100 shadow-sm'
                      : 'bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 text-white hover:scale-105 shadow-md shadow-pink-500/20'
                  }`}
                >
                  {isRevealed ? (
                    <div>
                      <span className="text-3xl sm:text-4xl block mb-1">{card.symbol}</span>
                      <span className="text-[10px] font-semibold text-stone-700 block leading-tight">
                        {card.name}
                      </span>
                    </div>
                  ) : (
                    <Heart className="w-6 h-6 fill-white/80 text-white/80" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Victory Banner */}
          {matchesFound === MATCH_PAIRS.length && (
            <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fadeIn">
              <h4 className="font-display font-bold text-emerald-900 text-xl mb-1">
                You Found Every Pair in {moves} moves! 🎉
              </h4>
              <p className="text-emerald-700 text-sm">
                Just like how we found each other in this big world.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
