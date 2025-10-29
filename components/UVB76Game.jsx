import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

const UVB76Game = () => {
  const [phrases, setPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/game/new');
      const data = await response.json();
      setPhrases(data.phrases);
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      setStreak(0);
      setGameOver(false);
    } catch (error) {
      console.error('Ошибка загрузки игры:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback(async (isReal) => {
    if (currentIndex >= phrases.length) return;
    
    const currentPhrase = phrases[currentIndex];
    
    try {
      const response = await fetch('/api/game/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phraseId: currentPhrase.id,
          guess: isReal
        })
      });
      
      const result = await response.json();
      
      setScore(prev => ({
        correct: prev.correct + (result.correct ? 1 : 0),
        total: prev.total + 1
      }));
      
      if (result.correct) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
      
      setShowResult(result.correct ? 'correct' : 'wrong');
      
      setTimeout(() => {
        setShowResult(null);
        if (currentIndex + 1 >= phrases.length) {
          setGameOver(true);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 600);
    } catch (error) {
      console.error('Ошибка проверки ответа:', error);
    }
  }, [currentIndex, phrases]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResult || gameOver || loading) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult, gameOver, loading, handleAnswer]);

  const handleMouseDown = (e) => {
    setDragStart(e.clientX);
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || dragStart === null) return;
    setDragOffset(e.clientX - dragStart);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || dragStart === null) return;
    setDragOffset(e.touches[0].clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragOffset) > 120) {
      handleAnswer(dragOffset > 0);
    }
    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Загрузка...</div>
      </div>
    );
  }

  const currentPhrase = phrases[currentIndex];
  const rotation = dragOffset * 0.08;
  const opacity = Math.max(0.3, 1 - Math.abs(dragOffset) / 300);
  const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Игра завершена</h2>
          
          <div className="space-y-4 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                <span className="text-green-400">{score.correct}</span>
                <span className="text-gray-600 mx-2">/</span>
                <span className="text-white">{score.total}</span>
              </div>
              <p className="text-gray-400">правильных ответов</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Точность</span>
                <span className="text-2xl font-bold text-white">{percentage}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={initGame}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Играть снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col select-none touch-pan-y overscroll-none">
      {/* header */}
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">УВБ-76</h1>
            <p className="text-xs sm:text-sm text-gray-400">Реальная фраза или нейросеть?</p>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white">{percentage}%</div>
              <div className="text-xs text-gray-500">точность</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">{streak}</div>
              <div className="text-xs text-gray-500">серия</div>
            </div>
          </div>
        </div>
      </div>

      {/* playground */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-2xl">
          <div className="relative h-96 perspective-1000">
            {currentPhrase && (
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${rotation}deg) scale(${1 - Math.abs(dragOffset) / 1000})`,
                  opacity: opacity,
                  transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  willChange: 'transform'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
              >
                <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl flex items-center justify-center p-6 sm:p-12 border border-gray-700 relative overflow-hidden">
                  {/* swipe-highlight */}
                  {dragOffset > 0 && (
                    <div 
                      className="absolute inset-0 bg-green-500 opacity-0 transition-opacity"
                      style={{ opacity: Math.min(Math.abs(dragOffset) / 300, 0.2) }}
                    ></div>
                  )}
                  {dragOffset < 0 && (
                    <div 
                      className="absolute inset-0 bg-red-500 opacity-0 transition-opacity"
                      style={{ opacity: Math.min(Math.abs(dragOffset) / 300, 0.2) }}
                    ></div>
                  )}

                  <div className="text-2xl sm:text-3xl font-mono text-white text-center leading-relaxed relative z-10">
                    {currentPhrase.text}
                  </div>

                  {/* indicators */}
                  {dragOffset > 80 && (
                    <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg font-bold text-sm sm:text-base">
                      УВБ-76
                    </div>
                  )}
                  {dragOffset < -80 && (
                    <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg font-bold text-sm sm:text-base">
                      НЕЙРОСЕТЬ
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* next-card */}
            {phrases[currentIndex + 1] && (
              <div className="absolute inset-0 -z-10 scale-95 opacity-50">
                <div className="h-full bg-gray-800 rounded-3xl shadow-xl border border-gray-700"></div>
              </div>
            )}

            {/* result */}
            {showResult && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className={`text-8xl font-bold ${showResult === 'correct' ? 'text-green-400' : 'text-red-400'} animate-ping`}>
                  {showResult === 'correct' ? '✓' : '✗'}
                </div>
              </div>
            )}
          </div>

          {/* tip */}
          <div className="text-center mt-8 text-gray-500 text-xs sm:text-sm">
            <p className="mb-2">{currentIndex + 1} / {phrases.length}</p>
            <p className="hidden sm:block">← Свайп влево: Нейросеть | Свайп вправо: УВБ-76 →</p>
            <p className="hidden sm:block mt-1">Или используйте стрелки на клавиатуре</p>
            <p className="sm:hidden">← Свайп влево: Нейросеть | Вправо: УВБ-76 →</p>
          </div>
        </div>
      </div>

      {/* about-UVB-block */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto p-6">
          <h3 className="text-lg font-bold text-white mb-3">Об УВБ-76</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>
              <strong className="text-gray-300">УВБ-76</strong> (также известная как "The Buzzer") — загадочная радиостанция, 
              вещающая на частоте 4625 кГц с 1970-х годов.
            </p>
            <p>
              Большую часть времени станция передаёт монотонный жужжащий звук, но иногда транслирует 
              закодированные голосовые сообщения на русском языке с позывными, числами и кодовыми словами.
            </p>
            <p>
              Назначение станции остаётся неизвестным. Предположительно, это военная система связи 
              или система передачи команд. Станция стала объектом внимания радиолюбителей и исследователей по всему миру.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UVB76Game;