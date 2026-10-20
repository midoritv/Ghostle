import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AudioPlayer({ previewUrl, duration = 1, onEnd, disabled = false }) {
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const statusRef = useRef('idle');
  const [status, setStatus] = useState('idle');

  function updateStatus(s) {
    statusRef.current = s;
    setStatus(s);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      if (statusRef.current !== 'loading') return;
      updateStatus('playing');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        audio.pause();
        updateStatus('stopped');
        onEnd?.();
      }, duration * 1000);
    };
    const onError = () => updateStatus('error');

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
    };
  }, [duration, onEnd]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    updateStatus('idle');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [previewUrl]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = () => {
    if (disabled) return;
    if (statusRef.current === 'playing' || statusRef.current === 'loading') return;
    if (!audioRef.current || !previewUrl) return;

    updateStatus('loading');
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => updateStatus('error'));
  };

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const buttonLabel = isLoading ? 'Ładowanie…' : isPlaying ? '♪  Odtwarzanie…' : '▶  Odtwórz';

  return (
    <div className="flex flex-col items-center gap-4">
      <audio
        ref={audioRef}
        src={previewUrl ?? undefined}
        preload={previewUrl ? 'auto' : 'none'}
        style={{ display: 'none' }}
      />

      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPlaying || isLoading}
        className={[
          'relative px-10 py-4 rounded-full font-semibold text-lg tracking-widest uppercase',
          'border-2 outline-none transition-all duration-200 select-none',
          disabled
            ? 'bg-neutral-800 text-neutral-600 border-neutral-700 cursor-not-allowed'
            : isPlaying
            ? 'bg-neutral-900 text-[#7b6ee0] border-[#7b6ee0] cursor-default'
            : isLoading
            ? 'bg-neutral-900 text-[#7b6ee0] border-[#7b6ee0] opacity-60 cursor-wait'
            : 'bg-neutral-900 hover:bg-neutral-800 text-[#7b6ee0] border-[#7b6ee0] cursor-pointer hover:shadow-[0_0_20px_rgba(123,110,224,0.35)]',
        ].join(' ')}
        animate={
          isPlaying
            ? { boxShadow: ['0 0 0px rgba(123,110,224,0)', '0 0 28px rgba(123,110,224,0.6)', '0 0 0px rgba(123,110,224,0)'] }
            : { boxShadow: '0 0 0px rgba(123,110,224,0)' }
        }
        transition={isPlaying ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        aria-label="Odtwórz fragment piosenki"
      >
        {buttonLabel}
      </motion.button>

      {status === 'error' && (
        <p className="text-red-400 text-sm text-center max-w-xs">
          Nie można załadować audio. Sprawdź połączenie.
        </p>
      )}
    </div>
  );
}
