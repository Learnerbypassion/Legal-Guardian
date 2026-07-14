import React, { useMemo } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { buildSpeechText } from '../utils/speechTextBuilder';
import {
  Volume2,
  Play,
  Pause,
  Square,
  RotateCcw,
  VolumeX,
  Gauge,
} from 'lucide-react';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

const STATUS_CONFIG = {
  unsupported: { label: 'Speech not supported', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  ready:       { label: 'Ready',                color: 'bg-gray-100 text-gray-600',  dot: 'bg-gray-400' },
  speaking:    { label: 'Speaking',              color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  paused:      { label: 'Paused',               color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  finished:    { label: 'Finished',              color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
};

/**
 * Speak Out Loud — TTS controls for document analysis.
 *
 * @param {{ result: object, language?: string }} props
 */
export default function SpeakOutLoud({ result, language }) {
  // Build the speech text once per result/language reference
  const { text: speechText, lang } = useMemo(() => buildSpeechText(result, language), [result, language]);

  const {
    status,
    rate,
    play,
    pause,
    resume,
    stop,
    replay,
    changeRate,
    supported,
    langSupported,
  } = useSpeechSynthesis(speechText, lang);

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ready;

  // ── Unsupported fallback ───────────────────────────────────────
  if (!supported || !langSupported) {
    const isWindows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent);

    return (
      <div
        className="bg-white rounded-xl shadow-md p-6 mb-8 border border-[#CBD2DC]"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 rounded-lg">
            <VolumeX className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#1B2F4E]">Listen to Analysis</h3>
            <p className="text-xs text-red-600 mt-0.5">
              {!supported ? (
                'Speech synthesis is not supported in your browser. Please try Chrome, Edge, or Safari.'
              ) : (
                `A ${language || 'selected'} text-to-speech voice is not installed on this device.`
              )}
            </p>
            {supported && !langSupported && (
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-xs text-gray-500">
                  To hear the analysis in this language, please add the language voice to your device:
                </span>
                {isWindows ? (
                  <a
                    href="ms-settings:speech"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2F4E] hover:bg-[#8A6C2A] text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    Open Windows Speech Settings
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-[#1B2F4E]">
                    Go to System Settings &gt; Language &gt; Speech &gt; Add Voice
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Button helpers ─────────────────────────────────────────────
  const ActionButton = ({ onClick, disabled, ariaLabel, Icon, variant = 'default', children }) => {
    const base =
      'inline-flex items-center justify-center gap-1.5 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1B2F4E] disabled:opacity-30 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'px-5 py-2.5 bg-[#1B2F4E] text-white hover:bg-[#8A6C2A] shadow-md hover:shadow-lg active:scale-[0.97]',
      default:
        'px-4 py-2.5 bg-[#F4F5F7] text-[#3D4F66] border border-[#CBD2DC] hover:bg-[#FAF3E4] hover:text-[#1B2F4E] hover:border-[#8A6C2A]/40 active:scale-[0.97]',
      danger:
        'px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-[0.97]',
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${base} ${variants[variant]}`}
      >
        <Icon className="w-4 h-4" />
        {children && <span>{children}</span>}
      </button>
    );
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 mb-8 border border-[#CBD2DC]"
      aria-label="Listen to Analysis controls"
      role="region"
    >
      {/* ── Header row ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF3E4] rounded-lg border border-[#E9DCC0]">
            <Volume2 className="w-5 h-5 text-[#8A6C2A]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1B2F4E]">Listen to Analysis</h3>
            <p className="text-xs text-[#3D4F66] mt-0.5">
              Hear a narrated summary of your document analysis
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${cfg.color}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${cfg.dot} ${
              status === 'speaking' ? 'animate-pulse' : ''
            }`}
          />
          {cfg.label}
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Play — visible when ready or finished */}
        {(status === 'ready' || status === 'finished') && (
          <ActionButton
            onClick={play}
            ariaLabel="Play analysis narration"
            Icon={Play}
            variant="primary"
          >
            Play
          </ActionButton>
        )}

        {/* Pause — visible when speaking */}
        {status === 'speaking' && (
          <ActionButton
            onClick={pause}
            ariaLabel="Pause narration"
            Icon={Pause}
            variant="default"
          >
            Pause
          </ActionButton>
        )}

        {/* Resume — visible when paused */}
        {status === 'paused' && (
          <ActionButton
            onClick={resume}
            ariaLabel="Resume narration"
            Icon={Play}
            variant="primary"
          >
            Resume
          </ActionButton>
        )}

        {/* Stop — visible when speaking or paused */}
        {(status === 'speaking' || status === 'paused') && (
          <ActionButton
            onClick={stop}
            ariaLabel="Stop narration"
            Icon={Square}
            variant="danger"
          >
            Stop
          </ActionButton>
        )}

        {/* Replay — visible when finished */}
        {status === 'finished' && (
          <ActionButton
            onClick={replay}
            ariaLabel="Replay analysis narration from the beginning"
            Icon={RotateCcw}
            variant="default"
          >
            Replay
          </ActionButton>
        )}

        {/* ── Speed selector ── */}
        <div className="flex items-center gap-1 ml-auto" role="group" aria-label="Speech speed">
          <Gauge className="w-4 h-4 text-[#3D4F66] mr-1" />
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => changeRate(s)}
              aria-label={`Set speed to ${s} times`}
              aria-pressed={rate === s}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#1B2F4E] ${
                rate === s
                  ? 'bg-[#1B2F4E] text-white shadow-sm'
                  : 'bg-[#F4F5F7] text-[#3D4F66] border border-[#CBD2DC] hover:bg-[#FAF3E4] hover:text-[#1B2F4E]'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* ── Inline style for the pulse on the status dot ─────── */}
      <style>{`
        @keyframes speak-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
