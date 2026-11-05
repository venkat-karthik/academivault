import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  CloudRain,
  Coffee,
  Flame,
  Clock
} from 'lucide-react';

type AmbientSound = 'rain' | 'cafe' | 'fireplace' | 'none';

export const StudyAmbientBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sound, setSound] = useState<AmbientSound>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);

  // Focus Timer (25 min default)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Web Audio Context & Synthesizer Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // Initialize Web Audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Generate synthetic white/pink noise buffer
  const getNoiseBuffer = (ctx: AudioContext) => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    noiseBufferRef.current = buffer;
    return buffer;
  };

  const stopSound = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as AudioBufferSourceNode).stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }
  };

  const startSound = (type: AmbientSound) => {
    stopSound();
    if (type === 'none') return;

    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const noiseBuffer = getNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter depending on chosen mood
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 900;
    } else if (type === 'cafe') {
      filter.type = 'bandpass';
      filter.frequency.value = 650;
      filter.Q.value = 1.2;
    } else if (type === 'fireplace') {
      filter.type = 'lowpass';
      filter.frequency.value = 450;
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNodeRef.current = gainNode;

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
    sourceNodeRef.current = noiseSource;
  };

  useEffect(() => {
    if (isPlaying && sound !== 'none') {
      startSound(sound);
    } else {
      stopSound();
    }
    return () => stopSound();
  }, [isPlaying, sound]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSoundSelect = (type: AmbientSound) => {
    if (sound === type && isPlaying) {
      setIsPlaying(false);
    } else {
      setSound(type);
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {isOpen ? (
        <div className="bg-[#fffdf6] border border-[#ffe9a9] rounded-3xl shadow-2xl p-4 w-76 animate-fade-slide-up backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#ffe9a9] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#ffe9a9] text-[#ea6510] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#1e1915]">Study Ambience & Focus</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#645548] hover:text-[#1e1915] hover:bg-[#ffe9a9]/60 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Sound Choices */}
          <div className="space-y-2 mb-4">
            <span className="text-[11px] font-bold text-[#645548] uppercase tracking-wider block">
              Cozy Background Sound
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSoundSelect('rain')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all active:scale-95 ${
                  sound === 'rain' && isPlaying
                    ? 'bg-[#ffe9a9] text-[#ea6510] border-[#ffcb56] shadow-2xs font-bold'
                    : 'bg-white text-[#1e1915] border-[#ffe9a9] hover:bg-[#ffe9a9]/30'
                }`}
              >
                <CloudRain className="w-4 h-4 mb-1" />
                <span>Soft Rain</span>
              </button>

              <button
                onClick={() => handleSoundSelect('cafe')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all active:scale-95 ${
                  sound === 'cafe' && isPlaying
                    ? 'bg-[#ffe9a9] text-[#ea6510] border-[#ffcb56] shadow-2xs font-bold'
                    : 'bg-white text-[#1e1915] border-[#ffe9a9] hover:bg-[#ffe9a9]/30'
                }`}
              >
                <Coffee className="w-4 h-4 mb-1" />
                <span>Cafe Murmur</span>
              </button>

              <button
                onClick={() => handleSoundSelect('fireplace')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all active:scale-95 ${
                  sound === 'fireplace' && isPlaying
                    ? 'bg-[#ffe9a9] text-[#ea6510] border-[#ffcb56] shadow-2xs font-bold'
                    : 'bg-white text-[#1e1915] border-[#ffe9a9] hover:bg-[#ffe9a9]/30'
                }`}
              >
                <Flame className="w-4 h-4 mb-1" />
                <span>Warm Hearth</span>
              </button>
            </div>

            {/* Volume Slider */}
            {isPlaying && (
              <div className="flex items-center gap-2 pt-1 px-1">
                <Volume2 className="w-3.5 h-3.5 text-[#ea6510]" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-[#ea6510] h-1.5 bg-[#ffe9a9] rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Pomodoro Focus Timer */}
          <div className="pt-3 border-t border-[#ffe9a9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ea6510]" />
              <div>
                <span className="text-[10px] text-[#645548] block font-semibold">Focus Session</span>
                <span className="text-sm font-mono font-bold text-[#1e1915] tabular-nums">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimerRunning((r) => !r)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-2xs ${
                  timerRunning
                    ? 'bg-[#ffe9a9] text-[#ea6510] hover:bg-[#ffcb56]'
                    : 'bg-[#ea6510] text-white hover:bg-[#d45707]'
                }`}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="p-1 text-[#645548] hover:text-[#1e1915] hover:bg-[#ffe9a9]/60 rounded-lg transition-colors"
                title="Reset 25m"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#fffdf6] hover:bg-white text-[#1e1915] border border-[#ffe9a9] hover:border-[#ff933e] shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
        >
          <div
            className={`w-6 h-6 rounded-xl flex items-center justify-center transition-colors ${
              isPlaying
                ? 'bg-[#ea6510] text-white animate-pulse'
                : 'bg-[#ffe9a9] text-[#ea6510]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block group-hover:text-[#ea6510] transition-colors leading-tight">
              Study Vibe
            </span>
            <span className="text-[10px] text-[#645548] font-mono leading-none">
              {isPlaying ? `${sound} playing` : `${formatTimer(timerSeconds)} focus`}
            </span>
          </div>
          <ChevronUp className="w-3.5 h-3.5 text-[#645548] group-hover:text-[#1e1915] ml-0.5" />
        </button>
      )}
    </div>
  );
};
