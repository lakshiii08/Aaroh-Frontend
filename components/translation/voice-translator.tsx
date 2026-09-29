"use client";

import { useRef, useState } from "react";
import { Mic, Volume2, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { speak, cn } from "@/lib/utils";

type Direction = "hi-to-sat" | "sat-to-hi";

const phrasePairs: { hindi: string; santhaliRoman: string; santhaliOlChiki: string }[] = [
  { hindi: "आज मौसम अच्छा है", santhaliRoman: "Tehen'ge mausam bugi'kana", santhaliOlChiki: "ᱛᱮᱦᱮᱸᱜᱮ ᱢᱚᱥᱟᱢ ᱵᱩᱜᱤᱠᱟᱱᱟ" },
  { hindi: "मुझे स्कूल जाना है", santhaliRoman: "Am skul senoge lagit", santhaliOlChiki: "ᱟᱢ ᱥᱠᱩᱞ ᱥᱮᱱᱚᱜᱮ ᱞᱟᱹᱜᱤᱛ" },
  { hindi: "पानी पी लो", santhaliRoman: "Daᶜ nu me", santhaliOlChiki: "ᱫᱟᱜ ᱱᱩ ᱢᱮ" },
  { hindi: "यह पेड़ बहुत बड़ा है", santhaliRoman: "Nowa dare do maranaɡ tahen kana", santhaliOlChiki: "ᱱᱚᱶᱟ ᱫᱟᱨᱮ ᱫᱚ ᱢᱟᱨᱟᱶ ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ" },
];

export function VoiceTranslator() {
  const [direction, setDirection] = useState<Direction>("hi-to-sat");
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<typeof phrasePairs[number] | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startHold() {
    setListening(true);
    setResult(null);
    timeoutRef.current = setTimeout(() => {
      const pick = phrasePairs[Math.floor(Math.random() * phrasePairs.length)];
      setResult(pick);
      setListening(false);
    }, 1200);
  }

  function endHold() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setListening(false);
  }

  const sourceLabel = direction === "hi-to-sat" ? "Hindi / English" : "Santali";
  const targetLabel = direction === "hi-to-sat" ? "Santali" : "Hindi / English";

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Direction toggle */}
      <div className="flex items-center justify-center gap-3">
        <Badge tone="slate">{sourceLabel}</Badge>
        <button
          onClick={() => {
            setDirection((d) => (d === "hi-to-sat" ? "sat-to-hi" : "hi-to-sat"));
            setResult(null);
          }}
          aria-label="Swap direction"
          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <Badge tone="emerald">{targetLabel}</Badge>
      </div>

      {/* Mic Trigger */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-8 flex flex-col items-center gap-4 text-center">
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all select-none shadow-xs cursor-pointer",
            listening
              ? "bg-amber-500 ring-4 ring-amber-100 scale-105"
              : "bg-emerald hover:bg-emerald-dark"
          )}
        >
          <Mic className="w-8 h-8 text-white" />
        </button>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">
            {listening ? "Listening to audio…" : "Hold to speak"}
          </p>
          <p className="text-xs text-gray-400">
            Press and hold the button, then release to translate
          </p>
        </div>
      </div>

      {/* Results Panel */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-1.5 min-h-[110px]">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            {sourceLabel} (Input)
          </span>
          <p className="text-sm font-medium text-ink">
            {result ? (direction === "hi-to-sat" ? result.hindi : result.santhaliRoman) : "—"}
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2 min-h-[110px] flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
              {targetLabel} (Translation)
            </span>
            {result ? (
              direction === "hi-to-sat" ? (
                <div>
                  <p className="olchiki text-xl font-bold text-emerald-950">{result.santhaliOlChiki}</p>
                  <p className="text-xs font-semibold text-emerald-800">{result.santhaliRoman}</p>
                </div>
              ) : (
                <p className="text-sm font-bold text-emerald-950">{result.hindi}</p>
              )
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {result && (
            <button
              onClick={() => speak(result.santhaliRoman, "hi-IN")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald hover:text-emerald-dark self-start"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen in Santali</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
