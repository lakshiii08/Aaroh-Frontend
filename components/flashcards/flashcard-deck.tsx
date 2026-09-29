"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Search,
  Shuffle,
  RefreshCw,
  Rotate3D,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { FlashcardItem } from "@/lib/db";

const categories = ["All", "Vocabulary", "Science", "Math", "Geography"] as const;

export function FlashcardDeck() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, "right" | "practice">>({});
  const [seenCount, setSeenCount] = useState(0);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const fetchCards = useCallback(async (cat: string, q: string, p: number, isRandom = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: "15",
        category: cat,
        search: q,
        random: isRandom ? "true" : "false",
        excludeSeen: "true",
      });
      const res = await fetch(`/api/flashcards?${params.toString()}`);
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
        setIndex(0);
        setFlipped(false);
        if (typeof data.seenCount === "number") setSeenCount(data.seenCount);
      }
    } catch (e) {
      console.error("Failed to fetch flashcards:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards(category, search, page, false);
  }, [category, page, fetchCards]);

  const recordSeen = async (cardId: string) => {
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      const data = await res.json();
      if (data.seenCount) setSeenCount(data.seenCount);
    } catch (e) {
      console.error("Failed to record seen card:", e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCards(category, search, 1, false);
  };

  const handleShuffle = () => {
    setSearch("");
    setPage(1);
    fetchCards(category, "", 1, true);
  };

  const card: FlashcardItem | undefined = cards[index];

  function nextCard() {
    if (card) {
      recordSeen(card.id);
    }
    setFlipped(false);
    if (cards.length > 0) {
      if (index + 1 >= cards.length) {
        setPage((p) => p + 1);
      } else {
        setIndex((i) => i + 1);
      }
    }
  }

  function mark(result: "right" | "practice") {
    if (!card) return;
    setResults((r) => ({ ...r, [card.id]: result }));
    recordSeen(card.id);
    setTimeout(nextCard, 220);
  }

  // Audio Playback Helpers with state tracking
  const playSantaliAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!card) return;
    setSpeakingKey("sat");
    speak(card.front.santhaliRoman, "hi-IN", () => setSpeakingKey(null));
  };

  const playHindiAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!card) return;
    setSpeakingKey("hi");
    speak(card.back.hindi, "hi-IN", () => setSpeakingKey(null));
  };

  const playEnglishAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!card) return;
    setSpeakingKey("en");
    speak(card.back.english, "en-US", () => setSpeakingKey(null));
  };

  const doneCount = Object.keys(results).filter((id) => cards.some((c) => c.id === id)).length;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Controls & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("flashcards_search_placeholder")}
              className="w-full bg-white border border-[#E0D8C8] rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald text-ink placeholder:text-gray-400 shadow-xs"
            />
          </form>

          <Button
            type="button"
            onClick={handleShuffle}
            variant="outline"
            size="sm"
            className="text-xs shrink-0 bg-white border-[#E0D8C8] text-gray-700 hover:bg-[#FAF7F0]"
          >
            <Shuffle className="w-3.5 h-3.5 text-gray-500" />
            <span>Shuffle</span>
          </Button>
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                  setSearch("");
                }}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                  category === c
                    ? "bg-emerald text-white border-emerald shadow-xs"
                    : "bg-white text-gray-600 border-[#E5E0D5] hover:bg-[#FAF7F0]"
                )}
              >
                {c === "All" ? t("flashcards_category_all") : c}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-gray-500 font-medium">
            {seenCount > 0 && <span>{seenCount} mastered · </span>}
            {cards.length > 0 && <span>Card {index + 1} of {cards.length}</span>}
          </div>
        </div>
      </div>

      {/* PHYSICAL STUDY FLASHCARD CONTAINER */}
      {loading ? (
        <div className="aspect-[1.5/1] rounded-2xl bg-[#FCFAF5] border border-[#E2DBD0] flex flex-col items-center justify-center p-8 gap-2 shadow-sm">
          <RefreshCw className="w-6 h-6 text-emerald animate-spin" />
          <p className="text-xs text-gray-500 font-medium">{t("loading")}</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="aspect-[1.5/1] rounded-2xl bg-[#FCFAF5] border-2 border-dashed border-[#DCD5C8] flex flex-col items-center justify-center p-8 text-center space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-ink">All cards in this batch reviewed</p>
          <p className="text-xs text-gray-500 max-w-xs">
            Every card in this stack has been practiced without repeats. Load the next stack from the 10 Million+ vocabulary database.
          </p>
          <Button onClick={() => setPage((p) => p + 1)} variant="primary" size="sm">
            Load Next Stack
          </Button>
        </div>
      ) : card ? (
        <div style={{ perspective: "1200px" }} className="relative group">
          {/* Subtle paper stack shadow layers behind the active card */}
          <div className="absolute inset-0 bg-[#F2EDE2] rounded-2xl transform translate-y-1.5 translate-x-0.5 border border-[#DDD5C5] -z-10" />
          <div className="absolute inset-0 bg-[#E8E2D4] rounded-2xl transform translate-y-3 translate-x-1 border border-[#D5CDC0] -z-20 opacity-80" />

          {/* Active Card Body */}
          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            aria-label="Flip flashcard"
            className="relative w-full aspect-[1.48/1] block cursor-pointer select-none focus:outline-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* ============================================================== */}
              {/* FRONT: Authentic Physical Study Card (Santali Ol Chiki + Audio) */}
              {/* ============================================================== */}
              <div
                className="absolute inset-0 rounded-2xl bg-[#FFFDF8] border-2 border-[#DFD6C6] shadow-[0_5px_16px_rgba(40,30,15,0.07),0_1px_2px_rgba(40,30,15,0.05)] flex flex-col justify-between overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Physical index card top header with ruled index line */}
                <div className="px-6 pt-4 pb-2 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FAF6EC]/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#C8BEB0]" title="Index hole punch" />
                    <span className="text-[11px] font-bold tracking-widest text-[#7A6B58] uppercase">
                      {card.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#8C7D6B] tracking-wider uppercase">
                      SANTALI · ᱥᱟᱱᱛᱟᱲᱤ
                    </span>
                    <span className="text-[10px] bg-[#EFE9DC] text-[#6E5F4E] px-2 py-0.5 rounded font-mono font-medium">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Card Center Content */}
                <div className="flex flex-col items-center justify-center text-center my-auto px-6 py-4 space-y-2">
                  <span className="text-3xl select-none" role="img" aria-hidden="true">
                    {card.imageEmoji}
                  </span>

                  {/* Primary Ol Chiki Script */}
                  <p className="olchiki text-5xl sm:text-6xl font-bold text-[#1E1B15] tracking-wide leading-tight drop-shadow-xs">
                    {card.front.santhaliOlChiki}
                  </p>

                  {/* Roman Transliteration */}
                  <p className="text-xl sm:text-2xl font-serif text-[#4D453A] font-medium tracking-normal">
                    {card.front.santhaliRoman}
                  </p>
                </div>

                {/* Card Bottom Footer: Santali Vocal + Flip Cue */}
                <div className="px-6 py-3 border-t border-[#EDE5D8] bg-[#FAF6EE]/70 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={playSantaliAudio}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                      speakingKey === "sat"
                        ? "bg-emerald text-white border-emerald ring-2 ring-emerald-200"
                        : "bg-white text-emerald-900 border-[#D8CEC0] hover:bg-[#F4EFE6] active:scale-95"
                    )}
                    title="Listen to Santali pronunciation"
                  >
                    <Volume2 className={cn("w-4 h-4", speakingKey === "sat" && "animate-bounce text-white")} />
                    <span>{speakingKey === "sat" ? "Speaking..." : "Pronounce (Santali)"}</span>
                  </button>

                  <span className="text-[11px] text-[#8C7D6B] flex items-center gap-1 font-medium">
                    <Rotate3D className="w-3.5 h-3.5 text-gray-400" />
                    <span>Click to flip card</span>
                  </span>
                </div>
              </div>

              {/* ============================================================== */}
              {/* BACK: Physical Study Card Reverse (Hindi + English with Vocals) */}
              {/* ============================================================== */}
              <div
                className="absolute inset-0 rounded-2xl bg-[#FFFDF8] border-2 border-[#DFD6C6] shadow-[0_5px_16px_rgba(40,30,15,0.07),0_1px_2px_rgba(40,30,15,0.05)] flex flex-col justify-between overflow-hidden text-ink"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {/* Header */}
                <div className="px-6 pt-4 pb-2 border-b border-[#E8DFD0] flex items-center justify-between bg-[#FAF6EC]/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#C8BEB0]" />
                    <span className="text-[11px] font-bold tracking-widest text-[#7A6B58] uppercase">
                      TRANSLATIONS &amp; VOCALS
                    </span>
                  </div>

                  <span className="text-[10px] text-[#8C7D6B] font-mono font-medium">
                    SIDE B
                  </span>
                </div>

                {/* Ruled Card Sections for Hindi & English */}
                <div className="my-auto px-6 py-2 divide-y divide-[#EAE2D5]">
                  {/* HINDI SECTION WITH DEDICATED VOCALS */}
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7965] block">
                        Hindi · हिंदी
                      </span>
                      <p className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A12] leading-tight">
                        {card.back.hindi}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={playHindiAudio}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0",
                        speakingKey === "hi"
                          ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200"
                          : "bg-white text-amber-900 border-[#D8CEC0] hover:bg-[#F9F4EB] active:scale-95"
                      )}
                      title="Listen to Hindi pronunciation"
                    >
                      <Volume2 className={cn("w-4 h-4", speakingKey === "hi" && "animate-bounce text-white")} />
                      <span>{speakingKey === "hi" ? "Speaking..." : "Listen (हिंदी)"}</span>
                    </button>
                  </div>

                  {/* ENGLISH SECTION WITH DEDICATED VOCALS */}
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7965] block">
                        English
                      </span>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#2A231A] leading-tight">
                        {card.back.english}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={playEnglishAudio}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0",
                        speakingKey === "en"
                          ? "bg-slate-700 text-white border-slate-700 ring-2 ring-slate-200"
                          : "bg-white text-slate-800 border-[#D8CEC0] hover:bg-[#F4EFF7] active:scale-95"
                      )}
                      title="Listen to English pronunciation"
                    >
                      <Volume2 className={cn("w-4 h-4", speakingKey === "en" && "animate-bounce text-white")} />
                      <span>{speakingKey === "en" ? "Speaking..." : "Listen (English)"}</span>
                    </button>
                  </div>
                </div>

                {/* Footer on Back */}
                <div className="px-6 py-2.5 border-t border-[#EDE5D8] bg-[#FAF6EE]/70 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Play both in succession
                      playHindiAudio();
                      setTimeout(() => playEnglishAudio(), 1300);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#7A6A58] hover:text-[#2A2218] font-medium underline"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Play Both (Hindi + English)</span>
                  </button>

                  <span className="text-[11px] text-[#8C7D6B] flex items-center gap-1 font-medium">
                    <Rotate3D className="w-3.5 h-3.5 text-gray-400" />
                    <span>Click to flip front</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Review Actions Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => mark("practice")}
            className="flex-1 sm:flex-none text-xs text-amber-900 border-[#D8CEC0] hover:bg-[#FAF6EE]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-amber-700" />
            <span>{t("flashcards_needs_practice")}</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => mark("right")}
            className="flex-1 sm:flex-none text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>{t("flashcards_got_it")}</span>
          </Button>

          <Button
            variant="ghost"
            onClick={nextCard}
            size="sm"
            aria-label="Skip card"
            title="Next card"
            className="text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 self-end sm:self-auto font-medium">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
          >
            Previous
          </button>
          <span>·</span>
          <span>Stack #{page}</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="hover:underline text-emerald font-semibold cursor-pointer"
          >
            Next Stack
          </button>
        </div>
      </div>
    </div>
  );
}
