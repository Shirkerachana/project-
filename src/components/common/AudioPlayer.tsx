import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward } from 'lucide-react';

interface AudioPlayerProps {
  recordingUrl?: string;
  durationSeconds?: number;
  candidateName?: string;
  callDate?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  durationSeconds = 412,
  candidateName,
  callDate
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationSeconds, playbackSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = (currentTime / durationSeconds) * 100;

  // Waveform bars simulation
  const bars = Array.from({ length: 48 }, (_, i) => {
    const height = Math.sin(i * 0.4) * 35 + Math.cos(i * 0.8) * 20 + 45;
    return Math.max(15, Math.min(85, height));
  });

  return (
    <div
      id="screening-audio-player"
      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg text-slate-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Automated Screening Recording</span>
          </div>
          {candidateName && (
            <div className="text-sm font-semibold text-white mt-0.5">
              Call with {candidateName} {callDate && <span className="font-normal text-slate-400">({callDate})</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaybackSpeed(playbackSpeed === 1.0 ? 1.5 : playbackSpeed === 1.5 ? 2.0 : 1.0)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-indigo-300 transition-colors"
            title="Toggle playback speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>

      {/* Simulated Waveform Visualizer */}
      <div className="relative h-14 bg-slate-950/80 rounded-xl p-2 flex items-center gap-1 overflow-hidden border border-slate-800/80">
        <div
          className="absolute top-0 bottom-0 left-0 bg-indigo-500/15 transition-all pointer-events-none"
          style={{ width: `${progress}%` }}
        />
        {bars.map((height, idx) => {
          const barProgress = (idx / bars.length) * 100;
          const isPassed = barProgress <= progress;
          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-colors duration-150 ${
                isPassed ? 'bg-indigo-400' : 'bg-slate-700/60'
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Controls and time slider */}
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
          aria-label={isPlaying ? 'Pause call recording' : 'Play call recording'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </button>

        <button
          type="button"
          onClick={() => setCurrentTime(0)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Restart from beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="font-mono text-xs text-slate-300 w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={durationSeconds}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="font-mono text-xs text-slate-500 w-10">{formatTime(durationSeconds)}</span>
        </div>
      </div>
    </div>
  );
};
