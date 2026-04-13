'use client';

import { Trophy, XCircle, Share2, RefreshCw } from 'lucide-react';
import { formatDuration, distanceToEmoji } from '@/lib/wordleUtils';
import { useToast } from '@/components/ToastProvider';
import type { AnswerData, GuessAttempt } from '@/types/wordle';

interface Props {
  won: boolean;
  answer: AnswerData;
  guesses: GuessAttempt[];
  onNewGame: () => void;
}

export default function ResultCard({ won, answer, guesses, onNewGame }: Props) {
  const { showToast } = useToast();

  const buildShareText = () => {
    const header = `Flight Route Wordle ${won ? `${guesses.length}/5` : 'X/5'}`;
    const grid = guesses
      .map((g) => {
        const dep = distanceToEmoji(g.depFeedback.distanceKm, g.depFeedback.correct);
        const arr = distanceToEmoji(g.arrFeedback.distanceKm, g.arrFeedback.correct);
        return `${dep}${arr}`;
      })
      .join('\n');
    return `${header}\n\n${grid}`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      showToast('Result copied to clipboard!');
    } catch {
      showToast('Could not copy to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
        {/* Header */}
        <div className="text-center mb-5">
          {won ? (
            <>
              <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {guesses.length === 1 ? 'Got it first try!' : `Solved in ${guesses.length} attempts!`}
              </h2>
            </>
          ) : (
            <>
              <XCircle className="w-14 h-14 text-red-500 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Better luck next time
              </h2>
            </>
          )}
        </div>

        {/* Correct route */}
        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {answer.route.departure_city}
              <span className="text-gray-400 dark:text-gray-500 mx-2">→</span>
              {answer.route.arrival_city}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              {answer.departure.iata} → {answer.arrival.iata}
            </div>
            <div className="mt-2 flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>
                <span className="font-medium">Airline:</span> {answer.route.airline_name}
              </span>
              <span>
                <span className="font-medium">Duration:</span>{' '}
                {formatDuration(answer.route.duration_min)}
              </span>
            </div>
          </div>
        </div>

        {/* Emoji grid */}
        <div className="font-mono text-2xl text-center leading-tight mb-5 tracking-widest">
          {guesses.map((g, i) => (
            <div key={i}>
              {distanceToEmoji(g.depFeedback.distanceKm, g.depFeedback.correct)}
              {distanceToEmoji(g.arrFeedback.distanceKm, g.arrFeedback.correct)}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium text-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
