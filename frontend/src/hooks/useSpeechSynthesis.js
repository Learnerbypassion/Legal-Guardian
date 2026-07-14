import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Splits a long text string into smaller chunks at natural boundaries (punctuation or whitespace)
 * to avoid browser-specific length limits and synthesis errors.
 */
function splitTextIntoChunks(text, maxLength = 200) {
  if (!text) return [];
  // Split by sentence endings first, preserving the punctuation
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;

    // If fits in current chunk, append it
    if ((currentChunk + ' ' + sentence).length <= maxLength) {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If a single sentence exceeds maxLength, break it down by clauses or commas
      if (sentence.length > maxLength) {
        const clauses = sentence.split(/[,;:]/);
        let subChunk = '';
        for (let clause of clauses) {
          clause = clause.trim();
          if ((subChunk + ' ' + clause).length <= maxLength) {
            subChunk = subChunk ? subChunk + ' ' + clause : clause;
          } else {
            if (subChunk) chunks.push(subChunk);
            // If even a clause exceeds maxLength, hard slice it
            if (clause.length > maxLength) {
              let offset = 0;
              while (offset < clause.length) {
                chunks.push(clause.slice(offset, offset + maxLength).trim());
                offset += maxLength;
              }
              subChunk = '';
            } else {
              subChunk = clause;
            }
          }
        }
        currentChunk = subChunk;
      } else {
        currentChunk = sentence;
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

/**
 * Custom hook for Web Speech API text-to-speech with sequential chunking.
 *
 * States: 'unsupported' | 'ready' | 'speaking' | 'paused' | 'finished'
 *
 * @param {string} text   – The full text to speak
 * @param {string} lang   – BCP-47 language tag, e.g. 'en-IN', 'hi-IN', 'bn-IN'
 */
export function useSpeechSynthesis(text, lang = 'en-IN') {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [status, setStatus] = useState(supported ? 'ready' : 'unsupported');
  const [rate, setRate] = useState(1);
  const [langSupported, setLangSupported] = useState(true);

  // Refs for tracking current status and chunk states
  const utteranceRef = useRef(null);
  const mountedRef = useRef(true);
  const langRef = useRef(lang);
  const rateRef = useRef(rate);
  const statusRef = useRef(status);

  const chunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  // Sync refs to avoid stale closure issues
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Recalculate chunks when text changes
  useEffect(() => {
    chunksRef.current = splitTextIntoChunks(text);
    currentChunkIndexRef.current = 0;
  }, [text]);

  // ── Voice selection ──────────────────────────────────────────────
  const pickVoice = useCallback((targetLang) => {
    if (!supported) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    // Exact match first (e.g. en-IN)
    let voice = voices.find(v => v.lang === targetLang);
    if (voice) return voice;

    // Broad match (e.g. en-*)
    const prefix = targetLang.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(prefix));
    if (voice) return voice;

    // Fallback to default
    return voices.find(v => v.default) || voices[0] || null;
  }, [supported]);

  // Detect if the target language is supported by any installed voice
  useEffect(() => {
    if (!supported) return;

    const checkSupport = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) {
        // If voices aren't loaded yet, assume supported until voiceschanged fires
        setLangSupported(true);
        return;
      }

      const prefix = lang.split('-')[0];
      if (prefix === 'en') {
        setLangSupported(true);
      } else {
        const hasVoice = voices.some(v => v.lang.toLowerCase().startsWith(prefix));
        setLangSupported(hasVoice);
      }
    };

    checkSupport();

    const handler = () => {
      checkSupport();
    };
    window.speechSynthesis.addEventListener?.('voiceschanged', handler);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', handler);
    };
  }, [lang, supported]);

  // ── Cancel any in-progress speech ────────────────────────────────
  const cancelSpeech = useCallback(() => {
    if (!supported) return;
    isTransitioningRef.current = true;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    isTransitioningRef.current = false;
  }, [supported]);

  // ── Play/Speak sequentially ──────────────────────────────────────
  const speakCurrentChunk = useCallback(() => {
    if (!supported || !langSupported) return;

    const chunks = chunksRef.current;
    const idx = currentChunkIndexRef.current;

    if (idx >= chunks.length) {
      if (mountedRef.current) setStatus('finished');
      return;
    }

    const chunkText = chunks[idx];
    if (!chunkText) return;

    const utt = new SpeechSynthesisUtterance(chunkText);
    utt.lang = langRef.current;
    utt.rate = rateRef.current;

    const voice = pickVoice(langRef.current);
    if (voice) utt.voice = voice;

    utt.onstart = () => {
      if (mountedRef.current) setStatus('speaking');
    };

    utt.onend = () => {
      utteranceRef.current = null;
      if (!mountedRef.current) return;

      // Do not auto-advance if we've paused or stopped manually
      if (isTransitioningRef.current) return;
      if (statusRef.current === 'paused' || statusRef.current === 'ready') return;

      currentChunkIndexRef.current += 1;
      speakCurrentChunk();
    };

    utt.onerror = (e) => {
      // expected/handled during manual cancellation or rate change
      if (e.error === 'interrupted' || e.error === 'canceled') return;

      console.error('SpeechSynthesis error on chunk index:', idx, e);
      utteranceRef.current = null;
      if (mountedRef.current && !isTransitioningRef.current) {
        setStatus('ready');
      }
    };

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [supported, langSupported, pickVoice]);

  // ── Controls ─────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (!supported || !langSupported) return;
    currentChunkIndexRef.current = 0;
    cancelSpeech();
    setTimeout(() => {
      if (mountedRef.current) speakCurrentChunk();
    }, 50);
  }, [supported, langSupported, cancelSpeech, speakCurrentChunk]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    if (mountedRef.current) setStatus('paused');
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported || !langSupported) return;
    window.speechSynthesis.resume();
    if (mountedRef.current) setStatus('speaking');
  }, [supported, langSupported]);

  const stop = useCallback(() => {
    cancelSpeech();
    currentChunkIndexRef.current = 0;
    if (mountedRef.current) setStatus('ready');
  }, [cancelSpeech]);

  const replay = useCallback(() => {
    stop();
    setTimeout(() => {
      if (mountedRef.current) play();
    }, 50);
  }, [stop, play]);

  // ── Speed change while speaking ─────────────────────────────────
  const changeRate = useCallback((newRate) => {
    setRate(newRate);
    rateRef.current = newRate;

    // If currently speaking/paused, restart from current chunk index with new rate
    if ((status === 'speaking' || status === 'paused') && supported && langSupported) {
      cancelSpeech();
      setTimeout(() => {
        if (mountedRef.current) speakCurrentChunk();
      }, 50);
    }
  }, [status, supported, langSupported, cancelSpeech, speakCurrentChunk]);

  // ── Reset when text/lang changes ────────────────────────────────
  useEffect(() => {
    if (!supported) return;
    cancelSpeech();
    if (mountedRef.current) setStatus('ready');
  }, [text, lang, supported, cancelSpeech]);

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    if (supported) {
      window.speechSynthesis.getVoices();
      const handler = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', handler);
      return () => {
        mountedRef.current = false;
        cancelSpeech();
        window.speechSynthesis.removeEventListener?.('voiceschanged', handler);
      };
    }

    return () => { mountedRef.current = false; };
  }, [supported, cancelSpeech]);

  return {
    status: !langSupported ? 'unsupported' : status,
    rate,
    play,
    pause,
    resume,
    stop,
    replay,
    changeRate,
    supported,
    langSupported,
  };
}
