'use client';

import { ArrowRight, ArrowUp, CheckCircle } from 'lucide-react';
import AirportAutocomplete from './AirportAutocomplete';
import { formatDistance } from '@/lib/wordleUtils';
import type { Airport, GuessAttempt, GuessFeedback } from '@/types/wordle';

interface Props {
  rowIndex: number;
  isActive: boolean;
  guess: GuessAttempt | null;
  lockedDep: string | null;
  lockedArr: string | null;
  airportCache: Map<string, Airport>;
  depValue: string | null;
  arrValue: string | null;
  onDepChange: (iata: string | null) => void;
  onArrChange: (iata: string | null) => void;
  onSubmit: () => void;
  validationError?: string;
  unit: 'km' | 'mi';
}

function SubmittedCell({
  feedback,
  airportCache,
  unit,
}: {
  feedback: GuessFeedback;
  airportCache: Map<string, Airport>;
  unit: 'km' | 'mi';
}) {
  const airport = airportCache.get(feedback.iata);
  if (feedback.correct) {
    return (
      <div className="flex-1 rounded-lg p-3 bg-green-500 dark:bg-green-600 text-white text-center min-w-0">
        <div className="flex items-center justify-center gap-1">
          <span className="font-bold text-base">{feedback.iata}</span>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
        </div>
        {airport && (
          <div className="text-xs opacity-80 truncate">{airport.city_name}</div>
        )}
      </div>
    );
  }
  return (
    <div className="flex-1 rounded-lg p-3 bg-white dark:bg-gray-800 border dark:border-gray-600 text-center min-w-0">
      <div className="font-bold text-base text-gray-900 dark:text-gray-100">{feedback.iata}</div>
      {airport && (
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{airport.city_name}</div>
      )}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <ArrowUp
          className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0"
          style={{ transform: `rotate(${feedback.bearing}deg)` }}
        />
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          {formatDistance(feedback.distanceKm, unit)}
        </span>
      </div>
    </div>
  );
}

function LockedCell({
  iata,
  airportCache,
}: {
  iata: string;
  airportCache: Map<string, Airport>;
}) {
  const airport = airportCache.get(iata);
  return (
    <div className="flex-1 rounded-lg p-2 bg-green-500 dark:bg-green-600 text-white text-center min-w-0">
      <div className="flex items-center justify-center gap-1">
        <span className="font-bold text-sm">{iata}</span>
        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
      </div>
      {airport && (
        <div className="text-xs opacity-80 truncate">{airport.city_name}</div>
      )}
    </div>
  );
}

export default function GuessRow({
  isActive,
  guess,
  lockedDep,
  lockedArr,
  airportCache,
  depValue,
  arrValue,
  onDepChange,
  onArrChange,
  onSubmit,
  validationError,
  unit,
}: Props) {
  // Submitted past row
  if (guess) {
    return (
      <div className="flex items-stretch gap-2">
        <SubmittedCell feedback={guess.depFeedback} airportCache={airportCache} unit={unit} />
        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 self-center" />
        <SubmittedCell feedback={guess.arrFeedback} airportCache={airportCache} unit={unit} />
      </div>
    );
  }

  // Active input row
  if (isActive) {
    const canSubmit =
      (!!lockedDep || !!depValue) && (!!lockedArr || !!arrValue);

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          {lockedDep ? (
            <LockedCell iata={lockedDep} airportCache={airportCache} />
          ) : (
            <AirportAutocomplete
              airportCache={airportCache}
              value={depValue}
              onChange={onDepChange}
              placeholder="Departure airport…"
              excludeIata={lockedArr ?? arrValue}
            />
          )}
          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {lockedArr ? (
            <LockedCell iata={lockedArr} airportCache={airportCache} />
          ) : (
            <AirportAutocomplete
              airportCache={airportCache}
              value={arrValue}
              onChange={onArrChange}
              placeholder="Arrival airport…"
              excludeIata={lockedDep ?? depValue}
            />
          )}
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex-shrink-0"
          >
            Guess
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-red-600 dark:text-red-400 pl-1">{validationError}</p>
        )}
      </div>
    );
  }

  // Inactive future row
  return (
    <div className="flex items-center gap-2 opacity-25 pointer-events-none select-none">
      <div className="flex-1 rounded-lg p-2.5 border dark:border-gray-700 text-center text-sm text-gray-400 dark:text-gray-600">
        Departure
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <div className="flex-1 rounded-lg p-2.5 border dark:border-gray-700 text-center text-sm text-gray-400 dark:text-gray-600">
        Arrival
      </div>
      <div className="w-[68px] flex-shrink-0" />
    </div>
  );
}
