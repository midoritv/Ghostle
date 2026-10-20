import { useRef, useState, useCallback, useEffect } from 'react';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

const S = {
  IDLE: 'idle',
  WAITING_READY: 'waiting_ready',
  LOADING: 'loading',
  PLAYING: 'playing',
  STOPPED: 'stopped',
  ERROR: 'error',
};

/**
 * Hidden YouTube player with automatic fallback ID cycling.
 *
 * Props:
 *  videoId      - primary YouTube video ID
 *  fallbackIds  - array of fallback IDs to try if primary is blocked (optional)
 *  startAt      - seconds offset to start playback
 *  duration     - seconds to play before stopping
 *  onEnd        - called when snippet finishes naturally
 *  disabled     - prevent playing
 */
export default function YoutubePlayer({
  videoId,
  fallbackIds = [],
  startAt = 30,
  duration = 1,
  onEnd,
  disabled = false,
}) {
  const allIds = [videoId, ...fallbackIds].filter(Boolean);

  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const stateRef = useRef(S.IDLE);
  const idIndexRef = useRef(0);

  const [playerState, _setPlayerState] = useState(S.IDLE);
  const [activeIdIndex, setActiveIdIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const activeId = allIds[activeIdIndex] ?? null;

  const setPlayerState = useCallback((s) => {
    stateRef.current = s;
    _setPlayerState(s);
  }, []);

  // Reset everything when the song (videoId) changes
  useEffect(() => {
    clearTimeout(timerRef.current);
    idIndexRef.current = 0;
    setActiveIdIndex(0);
    setAllFailed(false);
    setPlayerState(S.IDLE);
    if (playerRef.current) {
      try { playerRef.current.stopVideo(); } catch { /* ignore */ }
      playerRef.current = null;
    }
  }, [videoId, setPlayerState]);

  const stopPlayback = useCallback(() => {
    clearTimeout(timerRef.current);
    if (playerRef.current) {
      try { playerRef.current.pauseVideo(); } catch { /* ignore */ }
    }
    setPlayerState(S.STOPPED);
    if (onEnd) onEnd();
  }, [onEnd, setPlayerState]);

  const startVideo = useCallback((player) => {
    setPlayerState(S.LOADING);
    try {
      player.seekTo(startAt, true);
      player.playVideo();
    } catch {
      setPlayerState(S.ERROR);
    }
  }, [startAt, setPlayerState]);

  const handleReady = useCallback((event) => {
    playerRef.current = event.target;
    try { event.target.mute(); } catch { /* ignore */ }

    if (stateRef.current === S.WAITING_READY) {
      startVideo(event.target);
    }
  }, [startVideo]);

  const handlePlay = () => {
    if (disabled) return;
    const cur = stateRef.current;
    if (cur === S.PLAYING || cur === S.LOADING || cur === S.WAITING_READY) return;
    if (allFailed) return;

    if (!playerRef.current) {
      setPlayerState(S.WAITING_READY);
      return;
    }
    startVideo(playerRef.current);
  };

  const handleStateChange = useCallback((event) => {
    const YT_ENDED = 0;
    const YT_PLAYING = 1;
    const YT_PAUSED = 2;
    const cur = stateRef.current;

    if (event.data === YT_PLAYING && (cur === S.LOADING || cur === S.WAITING_READY)) {
      try { playerRef.current?.unMute(); } catch { /* ignore */ }
      setPlayerState(S.PLAYING);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(stopPlayback, duration * 1000);
    }

    if ((event.data === YT_PAUSED || event.data === YT_ENDED) && cur === S.PLAYING) {
      clearTimeout(timerRef.current);
      setPlayerState(S.STOPPED);
    }
  }, [duration, stopPlayback, setPlayerState]);

  const handleError = useCallback((e) => {
    const BLOCKED_CODES = [101, 150]; // embedding disabled by owner
    const MISSING_CODES = [100];       // video unavailable

    console.warn(`YouTube error ${e.data} for id="${allIds[idIndexRef.current]}"`);

    if (BLOCKED_CODES.includes(e.data) || MISSING_CODES.includes(e.data)) {
      // Try next fallback ID
      const nextIndex = idIndexRef.current + 1;
      if (nextIndex < allIds.length) {
        idIndexRef.current = nextIndex;
        playerRef.current = null;
        setActiveIdIndex(nextIndex);
        // If user had already clicked play, restart after new player loads
        if (stateRef.current === S.LOADING || stateRef.current === S.WAITING_READY) {
          setPlayerState(S.WAITING_READY);
        } else {
          setPlayerState(S.IDLE);
        }
      } else {
        setAllFailed(true);
        setPlayerState(S.ERROR);
      }
    } else {
      setPlayerState(S.ERROR);
    }
  }, [allIds, setPlayerState]);

  const isPlaying = playerState === S.PLAYING;
  const isLoading = playerState === S.LOADING || playerState === S.WAITING_READY;

  let buttonLabel = '▶  Odtwórz';
  if (isLoading) buttonLabel = 'Ładowanie…';
  if (isPlaying) buttonLabel = '♪  Odtwarzanie…';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden YouTube iframe — re-mounts when activeId changes */}
      {activeId && (
        <div
          key={activeId}
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
          aria-hidden="true"
        >
          <YouTube
            videoId={activeId}
            opts={{
              height: '1',
              width: '1',
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
              },
            }}
            onReady={handleReady}
            onStateChange={handleStateChange}
            onError={handleError}
          />
        </div>
      )}

      {/* Play button */}
      <motion.button
        onClick={handlePlay}
        disabled={disabled || isPlaying || isLoading || allFailed}
        className={[
          'relative px-10 py-4 rounded-full font-semibold text-lg tracking-widest uppercase',
          'transition-all duration-200 select-none border-2',
          disabled || allFailed
            ? 'bg-neutral-800 text-neutral-600 border-neutral-700 cursor-not-allowed'
            : isPlaying
            ? 'bg-red-950 text-gold border-gold cursor-default'
            : isLoading
            ? 'bg-red-950 text-gold border-gold opacity-70 cursor-wait'
            : 'bg-red-950 hover:bg-red-900 text-gold border-gold cursor-pointer hover:shadow-[0_0_20px_rgba(123,110,224,0.35)]',
        ].join(' ')}
        animate={
          isPlaying
            ? { boxShadow: ['0 0 0px rgba(123,110,224,0)', '0 0 28px rgba(123,110,224,0.55)', '0 0 0px rgba(123,110,224,0)'] }
            : {}
        }
        transition={isPlaying ? { duration: 1.3, repeat: Infinity } : {}}
        aria-label="Odtwórz fragment piosenki"
      >
        {isPlaying && (
          <span className="absolute inset-0 rounded-full animate-ping bg-gold opacity-10 pointer-events-none" />
        )}
        {buttonLabel}
      </motion.button>

      {allFailed && (
        <div className="text-center max-w-xs space-y-1">
          <p className="text-amber-500 text-sm">
            ⚠ Wideo zablokowane przez Universal Music — nie można osadzić w przeglądarce.
          </p>
          <p className="text-neutral-600 text-xs">
            Dodaj <code className="text-neutral-500">fallbackIds</code> w songs.json dla tej piosenki.
          </p>
        </div>
      )}
    </div>
  );
}
