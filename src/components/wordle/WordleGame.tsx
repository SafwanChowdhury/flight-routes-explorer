'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type {
  Airport,
  AnswerData,
  GuessAttempt,
  GameStatus,
  PersistedState,
  RouteAnswer,
} from '@/types/wordle';
import { computeFeedback } from '@/lib/wordleUtils';
import CluePanel from './CluePanel';
import GuessRow from './GuessRow';
import ResultCard from './ResultCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const STORAGE_KEY = 'flight_wordle_state';
const MAX_ATTEMPTS = 5;

// ─── helpers ────────────────────────────────────────────────────────────────

async function fetchWithRetry<T>(url: string, maxRetries = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw lastErr;
}

async function pickRoute(
  total: number,
  cache: Map<string, Airport>,
  attempts = 0,
): Promise<AnswerData> {
  if (attempts > 20) throw new Error('Could not find a valid route after 20 attempts');

  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const offset = arr[0] % total;

  const data = await fetch(`${API_BASE}/routes?limit=1&offset=${offset}`).then((r) => r.json());
  const route: RouteAnswer = data.routes?.[0];

  if (!route?.duration_min) return pickRoute(total, cache, attempts + 1);

  const dep = cache.get(route.departure_iata);
  const arrival = cache.get(route.arrival_iata);

  if (
    !dep?.latitude ||
    !dep?.longitude ||
    !arrival?.latitude ||
    !arrival?.longitude
  ) {
    return pickRoute(total, cache, attempts + 1);
  }

  return { route, departure: dep, arrival };
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function persistState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function clearPersistedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── component ──────────────────────────────────────────────────────────────

export default function WordleGame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [airportCache, setAirportCache] = useState<Map<string, Airport>>(new Map());
  const [answer, setAnswer] = useState<AnswerData | null>(null);
  const [guesses, setGuesses] = useState<GuessAttempt[]>([]);
  const [lockedDep, setLockedDep] = useState<string | null>(null);
  const [lockedArr, setLockedArr] = useState<string | null>(null);
  const [currentDep, setCurrentDep] = useState<string | null>(null);
  const [currentArr, setCurrentArr] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [unit, setUnit] = useState<'km' | 'mi'>('km');

  const initGame = useCallback(async (forceNew = false) => {
    setGameStatus('loading');
    setErrorMsg('');
    setValidationError('');

    // ── 1. Load airports ──
    let airports: Airport[];
    try {
      const data = await fetchWithRetry<{ airports: Airport[] }>(
        `${API_BASE}/airports`,
        3,
      );
      airports = data.airports;
    } catch {
      setErrorMsg('Failed to load airport data. Check the API is running and retry.');
      setGameStatus('error');
      return;
    }

    const cache = new Map<string, Airport>();
    airports.forEach((a) => cache.set(a.iata, a));
    setAirportCache(cache);

    // ── 2. Try to restore saved session ──
    if (!forceNew) {
      const saved = loadPersistedState();
      if (saved && saved.status !== 'loading') {
        const dep = cache.get(saved.depIata);
        const arr = cache.get(saved.arrIata);
        if (dep && arr) {
          setAnswer({ route: saved.route, departure: dep, arrival: arr });
          setGuesses(saved.guesses);
          setLockedDep(saved.lockedDep);
          setLockedArr(saved.lockedArr);
          setCurrentDep(null);
          setCurrentArr(null);
          setGameStatus(saved.status);
          return;
        }
      }
    }

    // ── 3. Fetch total route count ──
    let total: number;
    try {
      const countData = await fetch(`${API_BASE}/routes?limit=1`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
      total = countData.pagination?.total;
      if (!total) throw new Error('Missing pagination.total');
    } catch {
      setErrorMsg('Failed to connect to the Flight Routes API.');
      setGameStatus('error');
      return;
    }

    // ── 4. Pick a valid random route ──
    let answerData: AnswerData;
    try {
      answerData = await pickRoute(total, cache);
    } catch {
      setErrorMsg('Could not select a valid route. Please retry.');
      setGameStatus('error');
      return;
    }

    setAnswer(answerData);
    setGuesses([]);
    setLockedDep(null);
    setLockedArr(null);
    setCurrentDep(null);
    setCurrentArr(null);
    setGameStatus('playing');

    persistState({
      guesses: [],
      status: 'playing',
      lockedDep: null,
      lockedArr: null,
      route: answerData.route,
      depIata: answerData.departure.iata,
      arrIata: answerData.arrival.iata,
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleSubmit = useCallback(() => {
    if (!answer) return;

    const depIata = lockedDep ?? currentDep;
    const arrIata = lockedArr ?? currentArr;

    if (!depIata || !arrIata) {
      setValidationError('Please select both airports before guessing.');
      return;
    }
    if (depIata === arrIata) {
      setValidationError('Departure and arrival airports must be different.');
      return;
    }

    setValidationError('');

    const depAirport = airportCache.get(depIata);
    const arrAirport = airportCache.get(arrIata);
    if (!depAirport || !arrAirport) return;

    const depFeedback = computeFeedback(depAirport, answer.departure);
    const arrFeedback = computeFeedback(arrAirport, answer.arrival);

    const newGuess: GuessAttempt = {
      departureIata: depIata,
      arrivalIata: arrIata,
      depFeedback,
      arrFeedback,
    };

    const newGuesses = [...guesses, newGuess];
    const newLockedDep = depFeedback.correct ? depIata : lockedDep;
    const newLockedArr = arrFeedback.correct ? arrIata : lockedArr;

    const won = depFeedback.correct && arrFeedback.correct;
    const lost = !won && newGuesses.length >= MAX_ATTEMPTS;
    const newStatus: GameStatus = won ? 'won' : lost ? 'lost' : 'playing';

    setGuesses(newGuesses);
    setLockedDep(newLockedDep);
    setLockedArr(newLockedArr);
    setCurrentDep(null);
    setCurrentArr(null);
    setGameStatus(newStatus);

    persistState({
      guesses: newGuesses,
      status: newStatus,
      lockedDep: newLockedDep,
      lockedArr: newLockedArr,
      route: answer.route,
      depIata: answer.departure.iata,
      arrIata: answer.arrival.iata,
    });
  }, [answer, guesses, lockedDep, lockedArr, currentDep, currentArr, airportCache]);

  const handleNewGame = useCallback(() => {
    clearPersistedState();
    initGame(true);
  }, [initGame]);

  // ── Loading ──
  if (gameStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading game data…</p>
      </div>
    );
  }

  // ── Error ──
  if (gameStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Failed to load
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">{errorMsg}</p>
        <button
          onClick={() => initGame()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const currentAttemptIndex = guesses.length;

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Flight Route Wordle
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Guess both airports in a real-world route — {MAX_ATTEMPTS} attempts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {/* km / mi toggle */}
          <button
            onClick={() => setUnit((u) => (u === 'km' ? 'mi' : 'km'))}
            className="flex items-center text-xs font-medium border dark:border-gray-600 rounded-lg overflow-hidden"
            title="Toggle distance unit"
          >
            <span
              className={`px-2.5 py-1.5 transition ${
                unit === 'km'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              km
            </span>
            <span
              className={`px-2.5 py-1.5 transition ${
                unit === 'mi'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              mi
            </span>
          </button>
          <button
            onClick={handleNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            title="Start a new game"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Game
          </button>
        </div>
      </div>

      {/* Clue panel */}
      {answer && <CluePanel answer={answer} revealedCount={guesses.length} />}

      {/* Guess grid */}
      <div className="space-y-2.5">
        {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
          <GuessRow
            key={i}
            rowIndex={i}
            isActive={i === currentAttemptIndex && gameStatus === 'playing'}
            guess={guesses[i] ?? null}
            lockedDep={lockedDep}
            lockedArr={lockedArr}
            airportCache={airportCache}
            depValue={currentDep}
            arrValue={currentArr}
            onDepChange={setCurrentDep}
            onArrChange={setCurrentArr}
            onSubmit={handleSubmit}
            validationError={i === currentAttemptIndex ? validationError : undefined}
            unit={unit}
          />
        ))}
      </div>

      {/* Attempt counter */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-4">
        Attempt {Math.min(currentAttemptIndex + 1, MAX_ATTEMPTS)} of {MAX_ATTEMPTS}
      </p>

      {/* Result overlay */}
      {(gameStatus === 'won' || gameStatus === 'lost') && answer && (
        <ResultCard
          won={gameStatus === 'won'}
          answer={answer}
          guesses={guesses}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
