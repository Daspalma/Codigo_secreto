/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  ChevronRight, 
  Delete, 
  CheckCircle2, 
  XCircle,
  Hash,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';

// Types
type GameStatus = 'setup' | 'playing' | 'won' | 'lost';
type TileColor = 'gray' | 'yellow' | 'green' | 'empty';

interface Guess {
  value: string;
  feedback: TileColor[];
}

const MAX_ATTEMPTS = 10;
const CODE_LENGTH = 5;

export default function App() {
  const [status, setStatus] = useState<GameStatus>('setup');
  const [secret, setSecret] = useState<string>('');
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle keyboard inputs
  const handleInput = useCallback((num: string) => {
    if (status === 'setup') {
      if (secret.length < CODE_LENGTH) {
        setSecret(prev => prev + num);
      }
    } else if (status === 'playing') {
      if (currentGuess.length < CODE_LENGTH) {
        setCurrentGuess(prev => prev + num);
      }
    }
  }, [status, secret.length, currentGuess.length]);

  const handleDelete = useCallback(() => {
    if (status === 'setup') {
      setSecret(prev => prev.slice(0, -1));
    } else if (status === 'playing') {
      setCurrentGuess(prev => prev.slice(0, -1));
    }
  }, [status]);

  const handleSubmit = useCallback(() => {
    if (status === 'setup') {
      if (secret.length === CODE_LENGTH) {
        setStatus('playing');
        setShowSecret(false);
      } else {
        showError(`Digite ${CODE_LENGTH} números`);
      }
    } else if (status === 'playing') {
      if (currentGuess.length === CODE_LENGTH) {
        processGuess();
      } else {
        showError(`Digite ${CODE_LENGTH} números`);
      }
    }
  }, [status, secret, currentGuess]);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 2000);
  };

  const processGuess = () => {
    const feedback: TileColor[] = new Array(CODE_LENGTH).fill('gray');
    const secretArr = secret.split('');
    const guessArr = currentGuess.split('');
    const secretUsed = new Array(CODE_LENGTH).fill(false);
    const guessUsed = new Array(CODE_LENGTH).fill(false);

    // First pass: Find greens
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessArr[i] === secretArr[i]) {
        feedback[i] = 'green';
        secretUsed[i] = true;
        guessUsed[i] = true;
      }
    }

    // Second pass: Find yellows
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessUsed[i]) continue;
      for (let j = 0; j < CODE_LENGTH; j++) {
        if (!secretUsed[j] && guessArr[i] === secretArr[j]) {
          feedback[i] = 'yellow';
          secretUsed[j] = true;
          break;
        }
      }
    }

    const newGuess: Guess = { value: currentGuess, feedback };
    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);
    setCurrentGuess('');

    if (currentGuess === secret) {
      setStatus('won');
    } else if (updatedGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');
    }
  };

  const restart = () => {
    setStatus('setup');
    setSecret('');
    setCurrentGuess('');
    setGuesses([]);
    setShowSecret(false);
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Enter') handleSubmit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleDelete, handleSubmit]);

  return (
    <div className="min-h-screen bg-natural-bg text-natural-ink font-sans selection:bg-natural-beige p-0 flex flex-col items-center">
      {/* Header */}
      <header className="w-full border-b border-natural-border px-6 py-4 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-natural-sage rounded-xl flex items-center justify-center text-white shadow-sm">
            <Hash size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-natural-ink leading-tight">CÓDIGO SECRETO</h1>
            <p className="text-[10px] uppercase tracking-widest text-natural-muted font-bold -mt-1">O Desafio Natural</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex px-4 py-2 bg-natural-beige rounded-full text-[10px] font-bold uppercase tracking-wider text-natural-muted">
            Tentativas: <span className="text-natural-sage ml-1">{guesses.length}/{MAX_ATTEMPTS}</span>
          </div>
          <button 
            onClick={restart}
            className="p-2 hover:bg-natural-beige rounded-full transition-colors text-natural-muted"
            title="Reiniciar"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col md:flex-row items-center md:items-start justify-center gap-8 p-6 md:p-12">
        <AnimatePresence mode="wait">
          {status === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-sm border border-natural-border flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-natural-beige rounded-3xl flex items-center justify-center text-natural-sage mb-6">
                <UserPlus size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Defina o Código</h2>
              <p className="text-natural-muted text-center mb-8 text-sm">
                Escolha uma sequência de {CODE_LENGTH} números para o seu oponente adivinhar.
              </p>

              <div className="flex gap-2 mb-8">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-12 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all shadow-inner ${
                      secret[i] ? 'border-natural-sage bg-natural-beige text-natural-sage' : 'border-natural-border'
                    }`}
                  >
                    {secret[i] ? (showSecret ? secret[i] : '•') : ''}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="flex-1 py-3 px-4 bg-natural-beige text-natural-ink rounded-xl border border-natural-border flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-semibold"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showSecret ? 'Esconder' : 'Mostrar'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={secret.length !== CODE_LENGTH}
                  className="flex-[2] py-3 px-4 bg-natural-sage text-white rounded-xl flex items-center justify-center gap-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-md shadow-natural-sage/20"
                >
                  Confirmar <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Game Board */}
              <motion.div 
                key="game-board"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 bg-[#F7F4EF] p-6 rounded-[2.5rem] border border-natural-border shadow-sm"
              >
                <div className="grid gap-2">
                  {/* Previous Guesses */}
                  {guesses.map((guess, idx) => (
                    <div key={idx} className="flex gap-2">
                      {guess.value.split('').map((char, charIdx) => (
                        <motion.div
                          initial={{ rotateX: -90, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          transition={{ delay: charIdx * 0.1, duration: 0.4 }}
                          key={charIdx}
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-inner
                            ${guess.feedback[charIdx] === 'green' ? 'bg-natural-sage' : 
                              guess.feedback[charIdx] === 'yellow' ? 'bg-natural-gold' : 'bg-natural-neutral'}`}
                        >
                          {char}
                        </motion.div>
                      ))}
                    </div>
                  ))}

                  {/* Current Guess Input */}
                  {status === 'playing' && (
                    <div className="flex gap-2">
                      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                        <div 
                          key={i}
                          className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                            currentGuess[i] ? 'border-natural-sage bg-white scale-105' : 'border-natural-border bg-white/50'
                          }`}
                        >
                          {currentGuess[i] || ''}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty Rows Skeleton Pattern */}
                  <div className="space-y-2 mt-2 opacity-20 pointer-events-none hidden sm:block">
                    {Array.from({ length: Math.max(0, MAX_ATTEMPTS - guesses.length - (status === 'playing' ? 1 : 0)) }).map((_, i) => (
                      <div key={i} className="flex gap-2">
                        {Array.from({ length: CODE_LENGTH }).map((_, j) => (
                          <div key={j} className="w-12 h-1 sm:w-14 border-b border-natural-muted"></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Sidebar with Rules and Controls */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-6 w-full max-w-sm"
              >
                <div className="bg-white p-6 rounded-2xl border border-natural-border shadow-sm">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-natural-muted">Legenda</h3>
                  <ul className="text-xs space-y-3 font-medium text-natural-ink">
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-natural-sage rounded flex-shrink-0 animate-pulse-slow"></span> 
                      <span>Posição correta</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-natural-gold rounded flex-shrink-0"></span> 
                      <span>Existe em outra posição</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-natural-neutral rounded flex-shrink-0"></span> 
                      <span>Não faz parte da senha</span>
                    </li>
                  </ul>
                </div>

                {/* Mobile/Compact Keyboard */}
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-5 gap-2">
                    {['1', '2', '3', '4', '5'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleInput(num)}
                        className="h-14 bg-white border border-natural-border rounded-xl font-bold text-lg hover:bg-natural-beige active:scale-95 transition-all shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-natural-ink">
                    {['6', '7', '8', '9', '0'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleInput(num)}
                        className="h-14 bg-white border border-natural-border rounded-xl font-bold text-lg hover:bg-natural-beige active:scale-95 transition-all shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDelete}
                      className="h-14 bg-natural-beige text-natural-ink rounded-xl border border-natural-border flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all font-bold text-xs uppercase tracking-wider"
                    >
                      <Delete size={18} /> APAGAR
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="h-14 bg-natural-sage text-white rounded-xl flex items-center justify-center gap-2 hover:brightness-95 active:scale-95 transition-all font-bold text-xs uppercase tracking-wider shadow-md shadow-natural-sage/20"
                    >
                      <CheckCircle2 size={18} /> ENTER
                    </button>
                  </div>
                </div>

                <div className="mt-auto px-4 text-center">
                  <p className="text-[10px] text-natural-muted italic uppercase tracking-wider leading-relaxed">
                    Personalize o código e desafie seus amigos neste clássico moderno de lógica.
                  </p>
                </div>
              </motion.div>

              {/* Status Overlay */}
              {(status === 'won' || status === 'lost') && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-natural-ink/80 backdrop-blur-sm"
                >
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-natural-border">
                    {status === 'won' ? (
                      <>
                        <div className="w-20 h-20 bg-natural-sage/10 rounded-full flex items-center justify-center mx-auto mb-6 text-natural-sage">
                          <Trophy size={48} />
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-2 text-natural-ink italic">Vitória!</h2>
                        <p className="text-natural-muted mb-8 font-medium">Você decifrou o código em <span className="text-natural-sage font-bold">{guesses.length}</span> tentativas.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                          <XCircle size={48} />
                        </div>
                        <h2 className="text-4xl font-serif font-bold mb-2 text-natural-ink italic">Derrota</h2>
                        <p className="text-natural-muted mb-2 font-medium">A sorte não estava ao seu lado hoje.</p>
                        <div className="p-3 bg-natural-beige rounded-xl mb-8 flex items-center justify-center gap-3">
                          <span className="text-xs uppercase tracking-widest text-natural-muted font-bold">O código era:</span>
                          <span className="text-xl font-bold tracking-widest text-natural-ink">{secret}</span>
                        </div>
                      </>
                    )}
                    <button 
                      onClick={restart}
                      className="w-full py-4 bg-natural-sage text-white rounded-2xl font-bold hover:brightness-95 transition-all shadow-lg shadow-natural-sage/20 uppercase tracking-widest text-xs"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Global Keyboard for Mobile (Visible in Setup and Playing) */}
        <div className="md:hidden w-full max-w-sm mt-8 space-y-2">
          <div className="grid grid-cols-5 gap-2 px-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
              <button
                key={num}
                onClick={() => handleInput(num)}
                className="h-12 bg-white border border-natural-border rounded-xl font-bold text-lg hover:bg-natural-beige active:scale-95 transition-all shadow-sm text-natural-ink"
              >
                {num}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 px-2">
            <button
              onClick={handleDelete}
              className="h-12 bg-natural-beige text-natural-ink border border-natural-border rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 transition-all font-bold text-xs uppercase"
            >
              <Delete size={18} /> APAGAR
            </button>
            <button
              onClick={handleSubmit}
              className="h-12 bg-natural-sage text-white rounded-xl flex items-center justify-center gap-2 hover:brightness-95 active:scale-95 transition-all font-bold text-xs uppercase shadow-md shadow-natural-sage/20"
            >
              <CheckCircle2 size={18} /> ENTER
            </button>
          </div>
        </div>

        {/* Floating Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-natural-gold text-white px-6 py-3 rounded-full shadow-lg font-bold text-xs flex items-center gap-2 z-[60] uppercase tracking-widest"
            >
              <XCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full p-6 text-center text-[10px] text-natural-muted border-t border-natural-border bg-white mt-auto uppercase tracking-[0.2em] font-bold">
        Inspirado no Termo • Desenvolvido para Desafios Lógicos
      </footer>
    </div>
  );
}
