import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTIONS_BY_SUBJECT, PRIZE_LEVELS, SAFE_MILESTONES, formatPrize, SUBJECT_META, type Question, type SubjectKey } from "../data/questions";

type Screen = "reg" | "subject" | "start" | "quiz" | "break" | "result";
type Opt = "a" | "b" | "c" | "d";
type AnswerState = "idle" | "correct" | "wrong";

const LABELS: Record<Opt, string> = { a: "A", b: "B", c: "C", d: "D" };

interface CheatLog { time: string; reason: string; photo: string | null; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Stars ── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  s: Math.random() * 3 + 1,
  dur: (Math.random() * 3 + 1.5).toFixed(1),
  del: (Math.random() * 4).toFixed(1),
}));
function Stars() {
  return (<>
    {STARS.map(s => (
      <div key={s.id} className="star" style={{
        left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s,
        ["--dur" as string]: `${s.dur}s`, ["--delay" as string]: `${s.del}s`,
      }} />
    ))}
  </>);
}

/* ── Timer Ring ── */
function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r = 45, circ = 2 * Math.PI * r;
  const offset = circ * (1 - timeLeft / total);
  const frac = timeLeft / total;
  const color = frac > 0.5 ? "#ffd700" : frac > 0.25 ? "#f97316" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke .5s" }} />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "Cinzel,serif", lineHeight: 1 }}>{timeLeft}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,.5)", letterSpacing: 1 }}>SEC</span>
      </div>
    </div>
  );
}

/* ── Prize Ladder ── */
function PrizeLadder({ prizeIndex }: { prizeIndex: number }) {
  return (
    <div className="prize-ladder" style={{ minWidth: 155 }}>
      <div style={{ textAlign: "center", marginBottom: 10, fontSize: 11, fontFamily: "Cinzel,serif", letterSpacing: 1, background: "linear-gradient(90deg,#ffd700,#ffe566)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        पुरस्कार सीढ़ी
      </div>
      {[...PRIZE_LEVELS].map((_, idx) => {
        const actualIdx = PRIZE_LEVELS.length - 1 - idx;
        const p = PRIZE_LEVELS[actualIdx];
        const isCur  = actualIdx === prizeIndex + 1;
        const isWon  = actualIdx <= prizeIndex;
        const isSafe = SAFE_MILESTONES.includes(actualIdx);
        const cls = isCur ? "prize-row cur" : isWon ? "prize-row won" : isSafe ? "prize-row safe" : "prize-row norm";
        return (
          <div key={actualIdx} className={cls}>
            <span style={{ opacity: .6, fontSize: 9 }}>{actualIdx + 1}</span>
            <span>{formatPrize(p)}</span>
            {isCur && <span style={{ fontSize: 10 }}>◀</span>}
            {isWon && <span style={{ fontSize: 10 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Instagram Badge ── */
function InstaBadge({ style }: { style?: React.CSSProperties }) {
  return (
    <a href="https://instagram.com/subham_chauhan_002" target="_blank" rel="noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 14px", borderRadius: 30,
        background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)",
        color: "white", fontWeight: 700, fontSize: 12, textDecoration: "none",
        letterSpacing: .5, boxShadow: "0 4px 18px rgba(131,58,180,.45)",
        ...style,
      }}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
      @subham_chauhan_002
    </a>
  );
}

/* ── Speak (KBC voice via Web Speech API) ── */
function speak(text: string, lang = "hi-IN") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.88; u.pitch = 0.95; u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const hindi = voices.find(v => v.lang.startsWith("hi"));
  if (hindi) u.voice = hindi;
  window.speechSynthesis.speak(u);
}

/* ════════════════════════════════════════════ MAIN ══════════════════════════════════════ */
export default function KBCQuiz() {
  const [screen, setScreen]           = useState<Screen>("reg");
  const [playerName, setPlayerName]   = useState("");
  const [nameInput, setNameInput]     = useState("");
  const [subject, setSubject]         = useState<SubjectKey>("all");
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [qIdx, setQIdx]               = useState(0);
  const [score, setScore]             = useState(0);
  const [attempted, setAttempted]     = useState(0);
  const [prizeIdx, setPrizeIdx]       = useState(-1);
  const [skips, setSkips]             = useState(2);
  const [lifelines, setLifelines]     = useState({ fifty: true, audience: true, phone: true, flip: true });
  const [timeLeft, setTimeLeft]       = useState(30);
  const [selected, setSelected]       = useState<Opt | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [eliminated, setEliminated]   = useState<Opt[]>([]);
  const [pollData, setPollData]       = useState<Record<Opt, number> | null>(null);
  const [phoneHint, setPhoneHint]     = useState<string | null>(null);
  const [flipMsg, setFlipMsg]         = useState<string | null>(null);
  const [cheatLog, setCheatLog]       = useState<CheatLog[]>([]);
  const [cheatAlert, setCheatAlert]   = useState<string | null>(null);
  const [cameraErr, setCameraErr]     = useState<string | null>(null);

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef     = useRef<HTMLVideoElement | null>(null);
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const speechRef    = useRef<SpeechRecognition | null>(null);
  const cheatAlertTO = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Camera activation on mount ── */
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        setCameraErr("Camera permission denied");
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  /* ── Capture photo from webcam ── */
  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return null;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  /* ── Download photo + log ── */
  const handleCheat = useCallback((reason: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN");
    const photo = capturePhoto();

    // Auto-download captured photo
    if (photo) {
      const fileName = `KBC_CAUGHT_${reason.replace(/\s+/g, "_").toUpperCase()}_${now.toISOString().replace(/[:.]/g, "-")}.jpg`;
      const a = document.createElement("a");
      a.href = photo;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Download text log
    const logText = `KBC Anti-Cheat Log\n==================\nPlayer: ${playerName || "Unknown"}\nTime: ${timeStr}\nCaught For: ${reason}\nQuestion: ${qIdx + 1}\nSubject: ${subject}\n`;
    const logBlob = new Blob([logText], { type: "text/plain" });
    const logUrl = URL.createObjectURL(logBlob);
    const la = document.createElement("a");
    la.href = logUrl;
    la.download = `KBC_LOG_${reason.replace(/\s+/g, "_")}_${now.getTime()}.txt`;
    document.body.appendChild(la);
    la.click();
    document.body.removeChild(la);
    URL.revokeObjectURL(logUrl);

    setCheatLog(prev => [...prev, { time: timeStr, reason, photo }]);
    setCheatAlert(`⚠️ पकड़े गए! ${reason}`);
    if (cheatAlertTO.current) clearTimeout(cheatAlertTO.current);
    cheatAlertTO.current = setTimeout(() => setCheatAlert(null), 6000);

    speak(`सावधान! आप ${reason} करते हुए पकड़े गए। यह अनुशासन के विरुद्ध है।`);
  }, [capturePhoto, playerName, qIdx, subject]);

  /* ── Tab / window visibility detection ── */
  useEffect(() => {
    const onVisible = () => {
      if (document.hidden && (screen === "quiz" || screen === "break")) {
        handleCheat("Tab Switch / Window Hidden");
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    const onBlur = () => {
      if (screen === "quiz" || screen === "break") {
        handleCheat("Window Focus Lost");
      }
    };
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("blur", onBlur);
    };
  }, [screen, handleCheat]);

  /* ── Speech recognition for phone / Google keywords ── */
  useEffect(() => {
    const SpeechRec = (window as unknown as Record<string, unknown>).SpeechRecognition as typeof SpeechRecognition | undefined
                   || (window as unknown as Record<string, unknown>).webkitSpeechRecognition as typeof SpeechRecognition | undefined;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.lang = "hi-IN";
    rec.continuous = true;
    rec.interimResults = false;
    speechRef.current = rec;

    const CHEAT_WORDS = ["google", "गूगल", "गुगल", "bing", "yahoo", "search", "सर्च", "phone", "फोन", "mobile", "मोबाइल", "देखो", "copy", "कॉपी"];

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript.toLowerCase())
        .join(" ");

      if (screen === "quiz" || screen === "break") {
        const matched = CHEAT_WORDS.find(w => transcript.includes(w));
        if (matched) {
          const reason = matched.toLowerCase().includes("google") || matched.toLowerCase().includes("गूगल")
            ? "Google Search की कोशिश"
            : matched.toLowerCase().includes("phone") || matched.toLowerCase().includes("फोन") || matched.toLowerCase().includes("mobile")
            ? "Phone Use की कोशिश"
            : `Suspicious Voice: "${matched}"`;
          handleCheat(reason);
        }
      }
    };

    rec.onerror = () => {};

    try { rec.start(); } catch {}

    return () => { try { rec.stop(); } catch {} };
  }, [screen, handleCheat]);

  /* ── Load questions when subject chosen ── */
  function loadQuestions(sub: SubjectKey) {
    const pool = QUESTIONS_BY_SUBJECT[sub];
    setQuestions(shuffle(pool).slice(0, Math.min(18, pool.length)));
  }

  /* ── Timer ── */
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const goToResult = useCallback(() => {
    stopTimer();
    speak("खेल समाप्त हो गया। आपका स्कोर देखें।");
    setScreen("result");
  }, [stopTimer]);

  const startTimer = useCallback(() => {
    stopTimer(); setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { stopTimer(); setAnswerState("wrong"); setTimeout(goToResult, 2200); return 0; }
        if (prev === 10) speak("केवल दस सेकंड बचे हैं!");
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer, goToResult]);

  const advanceQ = useCallback((nextIdx: number) => {
    setQIdx(nextIdx); setSelected(null); setAnswerState("idle");
    setEliminated([]); setPollData(null); setPhoneHint(null); setFlipMsg(null);
    setScreen("quiz"); startTimer();
    speak(`प्रश्न नम्बर ${nextIdx + 1}`);
  }, [startTimer]);

  /* ── Registration ── */
  function registerPlayer() {
    if (!nameInput.trim()) return;
    setPlayerName(nameInput.trim());
    setScreen("subject");
    speak("आपका स्वागत है कौन बनेगा करोड़पति में। कृपया अपना विषय चुनें।");
  }

  /* ── Subject selection ── */
  function chooseSubject(sub: SubjectKey) {
    setSubject(sub);
    loadQuestions(sub);
    setScreen("start");
    speak(`आपने ${SUBJECT_META[sub].label} चुना। तैयार हो जाइए!`);
  }

  /* ── Begin game ── */
  function beginGame() {
    setScreen("quiz");
    startTimer();
    speak("खेल शुरू होता है। कौन बनेगा करोड़पति!");
  }

  /* ── Answer ── */
  function handleAnswer(opt: Opt) {
    if (selected !== null || answerState !== "idle") return;
    stopTimer(); setSelected(opt);
    const q = questions[qIdx];
    const ok = opt === q.answer;
    setAnswerState(ok ? "correct" : "wrong");
    if (ok) { setPrizeIdx(p => p + 1); setScore(s => s + 1); }
    setAttempted(a => a + 1);
    speak(ok ? "बिल्कुल सही! शाबाश!" : `क्षमा करें, यह गलत है। सही जवाब था ${LABELS[q.answer]}।`);
    setTimeout(() => {
      if (!ok) { goToResult(); return; }
      const next = qIdx + 1;
      if (next >= questions.length) { goToResult(); return; }
      if (next === 5 || next === 10) { stopTimer(); setScreen("break"); speak("ब्रेक का समय! आराम करें।"); return; }
      advanceQ(next);
    }, 2500);
  }

  function endBreak() { advanceQ(qIdx + 1); }

  function skipQ() {
    if (skips <= 0 || selected) return;
    stopTimer(); setSkips(s => s - 1);
    const next = qIdx + 1;
    if (next >= questions.length) { goToResult(); return; }
    advanceQ(next);
  }

  /* ── Lifelines ── */
  function doFiftyFifty() {
    if (!lifelines.fifty || selected) return;
    setLifelines(l => ({ ...l, fifty: false }));
    const q = questions[qIdx];
    const wrong = (["a","b","c","d"] as Opt[]).filter(o => o !== q.answer);
    setEliminated(shuffle(wrong).slice(0, 2));
    speak("पचास पचास जीवनरेखा का उपयोग किया गया।");
  }
  function doAudience() {
    if (!lifelines.audience || selected) return;
    setLifelines(l => ({ ...l, audience: false }));
    const q = questions[qIdx]; const c = q.answer;
    const opts: Opt[] = ["a","b","c","d"];
    let rem = 100;
    const d: Record<Opt, number> = { a: 0, b: 0, c: 0, d: 0 };
    d[c] = 50 + Math.floor(Math.random() * 25); rem -= d[c];
    const rest = opts.filter(o => o !== c);
    rest.forEach((o, i) => {
      if (i === rest.length - 1) d[o] = rem;
      else { const v = Math.floor(Math.random() * (rem / (rest.length - i))); d[o] = v; rem -= v; }
    });
    setPollData(d);
    speak("जनता की राय आ गई है।");
  }
  function doPhone() {
    if (!lifelines.phone || selected) return;
    setLifelines(l => ({ ...l, phone: false }));
    const q = questions[qIdx];
    setPhoneHint(`दोस्त: "मुझे लगता है जवाब ${LABELS[q.answer]}) ${q[q.answer]} है — मुझे 80% यकीन है!"`);
    speak("फोन ए फ्रेंड जीवनरेखा का उपयोग किया गया।");
  }
  function doFlip() {
    if (!lifelines.flip || selected) return;
    setLifelines(l => ({ ...l, flip: false }));
    const next = qIdx + 1;
    if (next >= questions.length) { setFlipMsg("कोई और प्रश्न नहीं!"); return; }
    setFlipMsg("प्रश्न बदल रहा है...");
    speak("प्रश्न बदला जा रहा है।");
    setTimeout(() => advanceQ(next), 1400);
  }

  function restart() {
    setScreen("reg"); setNameInput(""); setPlayerName(""); setSubject("all");
    setQIdx(0); setScore(0); setAttempted(0); setPrizeIdx(-1); setSkips(2);
    setLifelines({ fifty: true, audience: true, phone: true, flip: true });
    setSelected(null); setAnswerState("idle"); setEliminated([]);
    setPollData(null); setPhoneHint(null); setFlipMsg(null); setCheatLog([]);
    window.speechSynthesis?.cancel();
  }

  function optClass(opt: Opt): string {
    let c = "opt-btn";
    if (eliminated.includes(opt)) return c + " elim";
    if (selected === opt) {
      if (answerState === "correct") return c + " correct";
      if (answerState === "wrong")   return c + " wrong";
    }
    if (selected && answerState === "wrong" && opt === questions[qIdx]?.answer) return c + " correct";
    return c;
  }

  const q = questions[qIdx];
  const curPrize  = prizeIdx >= 0 ? PRIZE_LEVELS[prizeIdx] : 0;
  const nextPrize = PRIZE_LEVELS[prizeIdx + 1];
  const subMeta   = SUBJECT_META[subject];

  const SUBJECTS_GRID: SubjectKey[] = ["all","physics","hindi","math","science","history","geography","gk","computer"];

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: "'Poppins',sans-serif" }}>
      {/* Hidden camera elements */}
      <video ref={videoRef} playsInline muted autoPlay
        style={{ position: "absolute", top: -9999, left: -9999, width: 1, height: 1 }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* BG */}
      <div className="kbc-bg"><div className="kbc-bg-scan" /></div>
      <Stars />

      {/* Side panels */}
      <div className="side-panel side-panel-l">
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="panel-dot" style={{
            top: `${14 + i * 14}%`,
            background: ["#ffd700","#a78bfa","#60a5fa","#ffd700","#a78bfa","#60a5fa"][i],
            ["--dur" as string]: `${1.5 + i * .3}s`, ["--delay" as string]: `${i * .25}s`,
          }} />
        ))}
      </div>
      <div className="side-panel side-panel-r">
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="panel-dot" style={{
            top: `${14 + i * 14}%`,
            background: ["#60a5fa","#a78bfa","#ffd700","#60a5fa","#a78bfa","#ffd700"][i],
            ["--dur" as string]: `${1.8 + i * .3}s`, ["--delay" as string]: `${i * .2}s`,
          }} />
        ))}
      </div>

      {/* Warning ticker */}
      <div className="warn-banner">
        <div className="animate-marquee whitespace-nowrap" style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,200,200,.9)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{ marginRight: 80 }}>
              ⚠️ Google का उपयोग न करें! Camera monitoring active! &nbsp;|&nbsp; @subham_chauhan_002 &nbsp;|&nbsp; Do NOT use mobile! &nbsp;|&nbsp; Stay honest!
            </span>
          ))}
        </div>
      </div>

      {/* Camera corner feed */}
      <div style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 100,
        width: 110, height: 80, borderRadius: 10, overflow: "hidden",
        border: `2px solid ${cameraErr ? "rgba(239,68,68,.5)" : "rgba(255,215,0,.4)"}`,
        boxShadow: "0 4px 20px rgba(0,0,0,.5)", background: "#0a051e",
      }}>
        <video ref={el => {
          if (el && streamRef.current && el.srcObject !== streamRef.current) {
            el.srcObject = streamRef.current;
            el.play().catch(() => {});
          }
        }} playsInline muted autoPlay style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
        <div style={{
          position: "absolute", top: 4, left: 4, display: "flex", alignItems: "center", gap: 4,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: cameraErr ? "#ef4444" : "#22c55e", boxShadow: cameraErr ? "0 0 6px #ef4444" : "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 8, color: "white", fontWeight: 700, letterSpacing: 1 }}>
            {cameraErr ? "OFF" : "LIVE"}
          </span>
        </div>
        <div style={{ position: "absolute", bottom: 3, right: 5, fontSize: 8, color: "rgba(255,255,255,.5)" }}>📹 Anti-Cheat</div>
      </div>

      {/* Cheat alert */}
      {cheatAlert && (
        <div style={{
          position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
          zIndex: 200, padding: "12px 24px", borderRadius: 14,
          background: "rgba(127,29,29,.95)", border: "1.5px solid #ef4444",
          boxShadow: "0 0 30px rgba(239,68,68,.5)",
          fontSize: 14, fontWeight: 700, color: "#fca5a5",
          display: "flex", alignItems: "center", gap: 10,
          animation: "fadeInDown .3s ease",
          maxWidth: "90vw", textAlign: "center",
        }}>
          📸 {cheatAlert} — Photo Downloaded!
        </div>
      )}

      {/* ══════ REGISTRATION ══════ */}
      {screen === "reg" && (
        <div className="animate-fade-up" style={{
          position: "relative", zIndex: 10, minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px 40px",
        }}>
          <div className="animate-float" style={{ marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 72, lineHeight: 1, filter: "drop-shadow(0 0 30px #ffd700aa)" }}>💰</div>
            <div style={{ fontSize: 48, marginTop: -8 }}>👑</div>
          </div>
          <h1 style={{
            fontFamily: "Cinzel Decorative, serif", fontWeight: 900,
            fontSize: "clamp(28px, 6vw, 56px)", textAlign: "center",
            marginBottom: 8, letterSpacing: "1px", lineHeight: 1.2,
          }} className="gold-text animate-glow-text">
            कौन बनेगा करोड़पति
          </h1>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 4, fontFamily: "Cinzel,serif", letterSpacing: 2 }}>
            KAUN BANEGA CROREPATI
          </p>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginBottom: 24 }}>
            अपना ज्ञान दिखाएं और करोड़पति बनें!
          </p>
          <div style={{ marginBottom: 32 }}>
            <InstaBadge />
          </div>

          <div className="kbc-card" style={{ width: "100%", maxWidth: 440, padding: 40 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
              padding: "10px 16px", borderRadius: 12,
              background: "rgba(108,46,185,.25)", border: "1px solid rgba(108,46,185,.4)",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg,#6c2eb9,#a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 13, color: "white", fontFamily: "Cinzel,serif",
              }}>SC</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#c4b5fd" }}>Subham Chauhan</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>@subham_chauhan_002 · Official Quiz</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,215,0,.7)", marginBottom: 8, letterSpacing: 1, fontFamily: "Cinzel,serif" }}>
                आपका नाम
              </label>
              <input className="kbc-input" type="text" value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && nameInput.trim() && registerPlayer()}
                placeholder="यहाँ अपना नाम लिखें..." autoFocus />
            </div>
            <button className="kbc-btn-primary" onClick={registerPlayer}>
              ✨ आगे बढ़ें →
            </button>
            <div style={{
              marginTop: 24, display: "flex", justifyContent: "center", gap: 24,
              padding: "14px", borderRadius: 12,
              background: "rgba(255,215,0,.05)", border: "1px solid rgba(255,215,0,.12)",
            }}>
              {[["🏆","₹7 करोड़","ग्रैंड प्राइज़"],["⏱️","30 सेकंड","प्रति प्रश्न"],["🛟","4","जीवनरेखाएं"],["📹","Auto","Camera ON"]].map(([ico,val,lbl]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{ico}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ffd700", fontFamily: "Cinzel,serif" }}>{val}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ SUBJECT SELECTION ══════ */}
      {screen === "subject" && (
        <div className="animate-fade-up" style={{
          position: "relative", zIndex: 10, minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px 40px",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12, filter: "drop-shadow(0 0 20px #ffd700aa)" }}>📚</div>
          <h2 style={{ fontFamily: "Cinzel Decorative,serif", fontWeight: 900, fontSize: "clamp(22px,4vw,40px)", textAlign: "center", marginBottom: 6 }} className="gold-text">
            विषय चुनें
          </h2>
          <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 36, fontFamily: "Cinzel,serif", letterSpacing: 2 }}>
            नमस्ते, <span style={{ color: "#ffd700" }}>{playerName}</span>! अपना विषय चुनिए
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14, width: "100%", maxWidth: 700,
          }}>
            {SUBJECTS_GRID.map(sub => {
              const m = SUBJECT_META[sub];
              return (
                <button key={sub} onClick={() => chooseSubject(sub)} style={{
                  padding: "20px 16px", borderRadius: 18, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  background: m.bg, border: `1.5px solid ${m.color}55`,
                  color: "white", transition: "all .25s",
                  boxShadow: `0 4px 20px ${m.color}22`,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px) scale(1.04)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 36px ${m.color}44`; (e.currentTarget as HTMLButtonElement).style.borderColor = m.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${m.color}22`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${m.color}55`; }}>
                  <div style={{ fontSize: 36 }}>{m.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: "Cinzel,serif", textAlign: "center", lineHeight: 1.3 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)" }}>
                    {QUESTIONS_BY_SUBJECT[sub].length} प्रश्न
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <InstaBadge />
          </div>
        </div>
      )}

      {/* ══════ START ══════ */}
      {screen === "start" && (
        <div className="animate-fade-up" style={{
          position: "relative", zIndex: 10, minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px 40px",
        }}>
          <div className="animate-float" style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 64, filter: "drop-shadow(0 0 25px #ffd700bb)" }}>💰👑</div>
          </div>
          <h1 style={{ fontFamily: "Cinzel Decorative,serif", fontWeight: 900, fontSize: "clamp(24px,5vw,48px)", textAlign: "center", marginBottom: 4 }} className="gold-text">
            कौन बनेगा करोड़पति
          </h1>
          <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 36, fontFamily: "Cinzel,serif", letterSpacing: 2 }}>KAUN BANEGA CROREPATI</p>

          <div className="kbc-card" style={{ width: "100%", maxWidth: 440, padding: 36 }}>
            {/* Player + subject */}
            <div style={{
              display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
              padding: "16px 20px", borderRadius: 16,
              background: "linear-gradient(135deg,rgba(255,215,0,.08),rgba(108,46,185,.2))",
              border: "1.5px solid rgba(255,215,0,.25)",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#ffd700,#c8980a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 800, color: "#0c0618", fontFamily: "Cinzel,serif",
                boxShadow: "0 0 20px rgba(255,215,0,.5)",
              }}>
                {playerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontFamily: "Cinzel,serif", letterSpacing: 1 }}>खिलाड़ी</div>
                <div style={{ fontSize: 22, fontWeight: 700 }} className="gold-text">{playerName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 16 }}>{subMeta.icon}</span>
                  <span style={{ fontSize: 12, color: subMeta.color }}>{subMeta.label}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {[
                ["📋", `${questions.length}`, "कुल प्रश्न"],
                ["⏱️", "30s", "प्रति प्रश्न"],
                ["💰", "₹7 Cr", "टॉप पुरस्कार"],
                ["📹", "LIVE", "Camera ON"],
              ].map(([ico,val,lbl]) => (
                <div key={lbl} style={{ padding: "12px", borderRadius: 12, textAlign: "center", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize: 20 }}>{ico}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd700", fontFamily: "Cinzel,serif" }}>{val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{lbl}</div>
                </div>
              ))}
            </div>

            <button className="kbc-btn-primary" onClick={beginGame}>
              🎯 खेल शुरू करें!
            </button>

            <button onClick={() => setScreen("subject")} style={{
              width: "100%", marginTop: 12, padding: "12px", borderRadius: 14,
              background: "transparent", border: "1px solid rgba(255,255,255,.15)",
              color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13,
            }}>← विषय बदलें</button>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
              <InstaBadge />
            </div>
          </div>
        </div>
      )}

      {/* ══════ QUIZ ══════ */}
      {screen === "quiz" && q && (
        <div style={{
          position: "relative", zIndex: 10, minHeight: "100vh",
          padding: "60px 28px 40px", display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-start",
        }}>
          {/* Prize ladder */}
          <div className="hidden lg:block" style={{ paddingTop: 20, position: "sticky", top: 80, flexShrink: 0 }}>
            <PrizeLadder prizeIndex={prizeIdx} />
          </div>

          {/* Main quiz panel */}
          <div className="kbc-card animate-fade-up" style={{ flex: 1, maxWidth: 680, padding: "32px" }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "Cinzel,serif", letterSpacing: 1 }}>खिलाड़ी</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", fontFamily: "Cinzel,serif" }}>{playerName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>{subMeta.icon}</span>
                  <span style={{ fontSize: 11, color: subMeta.color }}>{subMeta.label}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>Q{qIdx + 1}/{questions.length}</span>
                </div>
              </div>
              <TimerRing timeLeft={timeLeft} total={30} />
            </div>

            {/* Progress */}
            <div className="prog-track" style={{ marginBottom: 20 }}>
              <div className="prog-fill" style={{ width: `${((qIdx) / questions.length) * 100}%` }} />
            </div>

            {/* Prize banner */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 16px", borderRadius: 12, marginBottom: 20,
              background: "linear-gradient(90deg,rgba(255,215,0,.08),rgba(108,46,185,.15))",
              border: "1px solid rgba(255,215,0,.2)",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>वर्तमान</div>
              <div style={{ fontFamily: "Cinzel,serif", fontWeight: 700, fontSize: 20 }} className="gold-text">{formatPrize(curPrize)}</div>
              {nextPrize && <div style={{ fontSize: 11, color: "#a78bfa" }}>→ {formatPrize(nextPrize)}</div>}
            </div>

            {/* Lifelines */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
              {[
                { key: "fifty",    icon: "½",  label: "50:50", action: doFiftyFifty, active: lifelines.fifty },
                { key: "audience", icon: "📊", label: "जनता",  action: doAudience,   active: lifelines.audience },
                { key: "phone",    icon: "📞", label: "फोन",   action: doPhone,      active: lifelines.phone },
                { key: "flip",     icon: "🔄", label: "बदलें", action: doFlip,       active: lifelines.flip },
              ].map(l => (
                <button key={l.key} className="life-btn" onClick={l.action} disabled={!l.active || selected !== null}>
                  <span className="life-icon">{l.icon}</span>
                  <span className="life-label">{l.label}</span>
                </button>
              ))}
              <button onClick={skipQ} disabled={skips <= 0 || selected !== null} style={{
                padding: "10px 14px", borderRadius: 14, minWidth: 72, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                border: "1.5px solid rgba(251,146,60,.35)",
                background: "linear-gradient(145deg,rgba(20,10,50,.9),rgba(10,5,30,.95))",
                color: "#fb923c", fontFamily: "sans-serif", transition: "all .25s",
                opacity: skips <= 0 ? .25 : 1, boxShadow: "0 4px 16px rgba(0,0,0,.5)",
              }}>
                <span style={{ fontSize: 22 }}>⏭️</span>
                <span style={{ fontSize: 9, fontFamily: "Cinzel,serif", letterSpacing: .5 }}>छोड़ें ({skips})</span>
              </button>
            </div>

            {/* Anti-cheat + camera status */}
            <div style={{
              padding: "8px 14px", borderRadius: 10, marginBottom: 18,
              background: "rgba(127,29,29,.6)", border: "1px solid rgba(248,113,113,.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: cameraErr ? "#ef4444" : "#22c55e", boxShadow: cameraErr ? "0 0 6px #ef4444" : "0 0 6px #22c55e" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,160,160,.9)" }}>
                {cameraErr ? "Camera OFF — " : "📹 Camera LIVE — "}
                Google/Phone detection active · {cheatLog.length > 0 ? `${cheatLog.length} बार पकड़े गए!` : "सब सही है"}
              </span>
            </div>

            {/* Audience poll */}
            {pollData && (
              <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,215,0,.15)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ffd700", marginBottom: 10, fontFamily: "Cinzel,serif" }}>📊 जनता की राय</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["a","b","c","d"] as Opt[]).map(o => (
                    <div key={o} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#ffd700", width: 14 }}>{LABELS[o]}</span>
                      <div style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                        <div className="poll-bar" style={{ width: `${pollData[o]}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)", width: 28, textAlign: "right" }}>{pollData[o]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phone hint */}
            {phoneHint && (
              <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.25)", fontSize: 13, color: "#86efac" }}>
                📞 {phoneHint}
              </div>
            )}

            {/* Flip msg */}
            {flipMsg && (
              <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.3)", fontSize: 13, color: "#a5b4fc" }}>
                🔄 {flipMsg}
              </div>
            )}

            {/* Question */}
            <div style={{
              padding: "20px 24px", borderRadius: 16, marginBottom: 20,
              background: "linear-gradient(135deg,rgba(255,215,0,.05),rgba(108,46,185,.1))",
              border: "1px solid rgba(255,215,0,.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#ffd700", fontFamily: "Cinzel,serif", opacity: .7 }}>प्रश्न {qIdx + 1}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: subMeta.bg, color: subMeta.color, fontWeight: 600 }}>
                  {subMeta.icon} {subMeta.label}
                </span>
              </div>
              <p style={{ fontSize: "clamp(15px,2.5vw,18px)", fontWeight: 600, lineHeight: 1.65, color: "white", wordBreak: "break-word" }}>
                {q.question}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {(["a","b","c","d"] as Opt[]).map(opt => (
                <button key={opt} className={optClass(opt)}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null || eliminated.includes(opt)}>
                  <div className="opt-badge">{LABELS[opt]}</div>
                  <span style={{ lineHeight: 1.4 }}>{q[opt]}</span>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {answerState !== "idle" && (
              <div style={{
                marginTop: 20, textAlign: "center", padding: "14px 20px", borderRadius: 14,
                background: answerState === "correct" ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)",
                border: `1px solid ${answerState === "correct" ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}`,
                fontSize: 16, fontWeight: 700,
                color: answerState === "correct" ? "#4ade80" : "#f87171",
                fontFamily: "Cinzel,serif",
              }}>
                {answerState === "correct" ? "🎉 शाबाश! बिल्कुल सही!" : `❌ गलत! सही जवाब: ${LABELS[q.answer]}) ${q[q.answer]}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ BREAK ══════ */}
      {screen === "break" && (
        <div className="break-screen">
          <div className="break-red" /><div className="break-blue" />
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px" }}>
            <div className="animate-float" style={{ fontSize: 80, marginBottom: 16 }}>☕</div>
            <h1 style={{ fontFamily: "Cinzel Decorative,serif", fontWeight: 900, fontSize: 80, letterSpacing: 8, marginBottom: 8, animation: "glow-text 2s ease-in-out infinite" }} className="gold-text">
              BREAK
            </h1>
            <p style={{ fontSize: 24, color: "#c4b5fd", marginBottom: 28, fontFamily: "Cinzel,serif" }}>ब्रेक समय!</p>
            <div style={{ padding: "20px 32px", borderRadius: 20, marginBottom: 20, background: "rgba(255,255,255,.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,.12)" }}>
              <p style={{ fontSize: 18, color: "white", marginBottom: 6 }}>🎵 KBC संगीत चल रहा है...</p>
              <p style={{ color: "rgba(255,255,255,.5)" }}>आराम करें और तैयार हो जाएं!</p>
            </div>
            <div style={{ padding: "14px 24px", borderRadius: 14, marginBottom: 20, background: "rgba(127,29,29,.5)", border: "1px solid rgba(248,113,113,.3)" }}>
              <p style={{ fontWeight: 700, color: "#fca5a5", fontSize: 18 }}>🚫 Google का उपयोग न करें!</p>
              <p style={{ color: "rgba(255,150,150,.6)", fontSize: 13, marginTop: 4 }}>Camera is monitoring your activity</p>
            </div>
            <div style={{ marginBottom: 24 }}><InstaBadge /></div>
            <button className="kbc-btn-primary" style={{ width: "auto", padding: "18px 56px" }} onClick={endBreak}>
              ▶️ जारी रखें
            </button>
          </div>
        </div>
      )}

      {/* ══════ RESULT ══════ */}
      {screen === "result" && (
        <div className="animate-fade-up" style={{
          position: "relative", zIndex: 10, minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px 60px",
        }}>
          <div className="animate-float" style={{ fontSize: 72, marginBottom: 16, filter: "drop-shadow(0 0 30px #ffd700aa)" }}>🏆</div>
          <h1 style={{ fontFamily: "Cinzel Decorative,serif", fontWeight: 900, fontSize: "clamp(28px,5vw,48px)", textAlign: "center", marginBottom: 6 }} className="gold-text">
            बधाई हो, {playerName}!
          </h1>
          <p style={{ color: "#c4b5fd", marginBottom: 32, fontFamily: "Cinzel,serif", letterSpacing: 2, fontSize: 12 }}>CONGRATULATIONS</p>

          <div className="kbc-card" style={{ width: "100%", maxWidth: 500, padding: 36 }}>
            {/* Prize */}
            <div style={{ textAlign: "center", padding: "24px", borderRadius: 16, marginBottom: 24, background: "linear-gradient(135deg,rgba(255,215,0,.1),rgba(108,46,185,.15))", border: "1.5px solid rgba(255,215,0,.3)", boxShadow: "0 0 40px rgba(255,215,0,.15)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6, fontFamily: "Cinzel,serif", letterSpacing: 1 }}>जीती हुई राशि</div>
              <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "Cinzel,serif", marginBottom: 4 }} className="gold-text animate-glow-text">
                {formatPrize(curPrize)}
              </div>
              <div style={{ fontSize: 12, color: subMeta.color }}>{subMeta.icon} {subMeta.label}</div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { ico: "✅", val: score,           lbl: "सही",    color: "#4ade80" },
                { ico: "❌", val: attempted-score, lbl: "गलत",    color: "#f87171" },
                { ico: "📊", val: `${attempted > 0 ? Math.round(score/attempted*100) : 0}%`, lbl: "सटीकता", color: "#60a5fa" },
              ].map(s => (
                <div key={s.lbl} style={{ textAlign: "center", padding: "14px 8px", borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize: 20 }}>{s.ico}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "Cinzel,serif" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Cheat log */}
            {cheatLog.length > 0 && (
              <div style={{ marginBottom: 20, padding: "16px", borderRadius: 14, background: "rgba(127,29,29,.4)", border: "1px solid rgba(248,113,113,.3)" }}>
                <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 13, marginBottom: 12, fontFamily: "Cinzel,serif" }}>
                  🚨 Anti-Cheat Report — {cheatLog.length} बार पकड़े गए
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cheatLog.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(239,68,68,.1)" }}>
                      {c.photo && (
                        <img src={c.photo} alt="caught" style={{ width: 48, height: 36, borderRadius: 6, objectFit: "cover", border: "1px solid #ef4444" }} />
                      )}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#fca5a5" }}>{c.reason}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{c.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="kbc-btn-restart" onClick={restart}>🔄 फिर से खेलें</button>

            <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
              <InstaBadge />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
