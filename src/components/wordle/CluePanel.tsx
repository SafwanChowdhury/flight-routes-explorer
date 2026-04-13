'use client';

import { Lock, Clock, Globe, Compass, Plane, MapPin } from 'lucide-react';
import { formatDuration, continentName, getFlightDirection } from '@/lib/wordleUtils';
import type { AnswerData } from '@/types/wordle';

interface Props {
  answer: AnswerData;
  revealedCount: number; // equals number of guesses made so far
}

export default function CluePanel({ answer, revealedCount }: Props) {
  const clues = [
    {
      // Always visible from the start
      revealAfter: 0,
      icon: <Clock className="w-4 h-4" />,
      label: 'Duration',
      value: formatDuration(answer.route.duration_min),
    },
    {
      revealAfter: 1,
      icon: <Globe className="w-4 h-4" />,
      label: 'Continents',
      value: `${continentName(answer.departure.continent)} → ${continentName(answer.arrival.continent)}`,
    },
    {
      revealAfter: 2,
      icon: <Compass className="w-4 h-4" />,
      label: 'Direction',
      value: getFlightDirection(answer.departure.longitude, answer.arrival.longitude),
    },
    {
      revealAfter: 3,
      icon: <Plane className="w-4 h-4" />,
      label: 'Airline',
      value: answer.route.airline_name,
    },
    {
      revealAfter: 4,
      icon: <MapPin className="w-4 h-4" />,
      label: 'Countries',
      value: `${answer.route.departure_country} → ${answer.route.arrival_country}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
      {clues.map((clue) => {
        const revealed = revealedCount >= clue.revealAfter;
        return (
          <div
            key={clue.label}
            className={`rounded-lg p-3 border transition-all duration-300 ${
              revealed
                ? 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {revealed ? clue.icon : <Lock className="w-3.5 h-3.5" />}
              <span>{clue.label}</span>
            </div>
            {revealed ? (
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                {clue.value}
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-300 dark:text-gray-600 select-none tracking-widest">
                ● ● ● ●
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
