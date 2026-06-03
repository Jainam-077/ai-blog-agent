import { useState, useEffect, useRef } from "react";

/**
 * Reveals `text` character-by-character for a typewriter effect.
 * Returns { out: string, done: boolean }
 */
export function useTypewriter(text: string, speed = 5) {
  const [out,  setOut]  = useState("");
  const [done, setDone] = useState(false);
  const state = useRef({ idx: 0, active: false });

  useEffect(() => {
    if (!text) {
      setOut(""); setDone(false);
      state.current = { idx: 0, active: false };
      return;
    }
    setOut(""); setDone(false);
    state.current = { idx: 0, active: true };

    const go = () => {
      if (!state.current.active) return;
      state.current.idx = Math.min(state.current.idx + 2, text.length);
      setOut(text.slice(0, state.current.idx));
      if (state.current.idx < text.length) {
        setTimeout(go, speed);
      } else {
        setDone(true);
        state.current.active = false;
      }
    };

    setTimeout(go, 40);
    return () => { state.current.active = false; };
  }, [text, speed]);

  return { out, done };
}
