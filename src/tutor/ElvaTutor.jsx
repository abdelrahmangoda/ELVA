import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildMiniAvatarSVG } from "../components/AvatarCreator";
import "./elvaTutor.css";
import { T, COLORS, getLevelInfo, getNextStep } from "./constants.js";
import {
  MODEL_FAST, MODEL_HEAVY,
  getMemorySummary, recordQuizResult,
  makeTutorSystemPrompt, makeSlidesPrompt,
  makeCheckInPrompt, makeQuizFromSlidesPrompt,
  makeSlideEditPrompt, makeProofPrompt, makeAiJudgePrompt,
  safeParseJSON, norm, sleep,
  validateAndRepairLesson, shuffleOptions,
  callGroq,
} from "./elvaTutorLogic.js";

// ─────────────────────────────────────────────
// VOICE MANAGER HOOK
// ─────────────────────────────────────────────
function useVoiceManager({ lang, onResult }) {
  const [state, setState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const stop = useCallback(() => {
    if (recRef.current) { 
      try { recRef.current.stop(); } catch {} 
      recRef.current = null; 
    }
    setState("idle"); 
    setTranscript("");
  }, []);

  const start = useCallback(() => {
    if (!SR) { setError("Voice not supported"); return; }
    if (state === "listening") { stop(); return; }
    setError(""); setTranscript(""); setState("listening");
    const rec = new SR();
    rec.lang = lang === "ar" ? "ar-EG" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = isMobile ? 1 : 3;
    recRef.current = rec;
    let finalT = "", interimT = "";
    rec.onresult = (e) => {
      finalT = ""; interimT = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalT += e.results[i][0].transcript;
        else interimT += e.results[i][0].transcript;
      }
      setTranscript(finalT || interimT);
    };
    rec.onerror = (e) => {
      recRef.current = null; setState("idle");
      if (e.error === "aborted" || e.error === "no-speech") return;
      if (e.error === "not-allowed") setError("Microphone permission denied.");
      else if (e.error === "network") setError("Network error. Check connection.");
      else setError(`Voice error: ${e.error}`);
    };
    rec.onend = () => {
      recRef.current = null;
      const result = finalT || interimT;
      if (result.trim()) { 
        setState("processing"); 
        setTranscript(result); 
        onResult(result.trim()); 
      } else { 
        setState("idle"); 
        setTranscript(""); 
      }
    };
    try { rec.start(); }
    catch (err) { setState("idle"); setError("Could not start microphone: " + err.message); }
  }, [SR, lang, state, stop, onResult, isMobile]);

  const onPointerDown = useCallback((e) => {
    if (isMobile) return; e.preventDefault();
    if (state !== "listening") start();
  }, [isMobile, state, start]);

  const onPointerUp = useCallback((e) => {
    if (isMobile) return; e.preventDefault();
    if (state === "listening" && recRef.current) { 
      try { recRef.current.stop(); } catch {} 
    }
  }, [isMobile, state]);

  const onTap = useCallback((e) => {
    if (!isMobile) return; e.preventDefault(); start();
  }, [isMobile, start]);

  const setJudging = useCallback(() => setState("judging"), []);

  return { 
    state, transcript, error, supported: !!SR, isMobile, 
    start, stop, setJudging, onPointerDown, onPointerUp, onTap 
  };
}

// ─────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────
function Orbs() {
  return <><div className="elva-orb1" /><div className="elva-orb2" /></>;
}

function LoadingDots({ color = "#7c3aed" }) {
  return (
    <span className="elva-loading-dots">
      {[0, 1, 2].map(i => (
        <span key={i} className="elva-loading-dot"
          style={{ background: color, animationDelay: `${i * 0.2}s` }} />
      ))}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="elva-prog-track">
      <div className="elva-prog-fill" style={{ width: value + "%" }} />
    </div>
  );
}

function TopBar({ title, count, onBack, backLabel }) {
  return (
    <div className="elva-lesson-bar">
      <button className="elva-back-btn" onClick={onBack}>{backLabel}</button>
      <span className="elva-lesson-title">{title}</span>
      <span className="elva-slide-count">{count}</span>
    </div>
  );
}

function StatCard({ label, value, sub, subColor, bar, icon, valueColor, small }) {
  return (
    <div className="elva-stat-card">
      {icon && <div style={{ fontSize: 32 }}>{icon}</div>}
      <div className={`elva-stat-num${small ? " elva-stat-num--small" : ""}`} 
           style={{ color: valueColor || "#fff" }}>{value}</div>
      <div className="elva-stat-label">{label}</div>
      {bar !== undefined && (
        <div className="elva-stat-bar">
          <div className="elva-stat-bar-fill" style={{ width: bar + "%" }} />
        </div>
      )}
      {sub && <div style={{ color: subColor, fontSize: 13, fontWeight: 700 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, titleColor = "#a78bfa", children }) {
  return (
    <div className="elva-report-section">
      <div className="elva-section-title" style={{ color: titleColor }}>{title}</div>
      {children}
    </div>
  );
}

function Point({ text, color, small }) {
  return (
    <div className={`elva-point-item${small ? " elva-point-item--small" : ""}`}>
      <span style={{ color }}>•</span> {text}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ElvaTutor() {
  const navigate = useNavigate();
  const { user, addXP } = useAuth();
  
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("chat");
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [lesson, setLesson] = useState(null);
  const [slide, setSlide] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [xp, setXp] = useState(user?.xp || 120);
  const [streak, setStreak] = useState(user?.streak || 0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState([]);
  const [showProof, setShowProof] = useState(false);
  const [proofText, setProofText] = useState("");
  const [proofLoading, setProofLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [allVoices, setAllVoices] = useState([]);
  const [studentLevel, setStudentLevel] = useState(null);
  const [lessonTopic, setLessonTopic] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkInSelected, setCheckInSelected] = useState(null);
  const [checkInChecked, setCheckInChecked] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");
  const [openSubmitting, setOpenSubmitting] = useState(false);
  const [slideInput, setSlideInput] = useState("");
  const [slideUpdating, setSlideUpdating] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAiChecking, setQuizAiChecking] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [voiceContext, setVoiceContext] = useState("chat");

  const level = Math.floor(xp / 100) + 1;
  const xpProg = xp % 100;
  const bottomRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const speakTimerRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const t = T[lang];
  const isRTL = lang === "ar";

  // ── VOICE MANAGER ──────────────────────────
  const voice = useVoiceManager({
    lang,
    onResult: useCallback((transcript) => {
      handleVoiceResult(transcript);
    }, [voiceContext, lesson, qIdx, checkIn, lang]),
  });

  function handleVoiceResult(transcript) {
    if (voiceContext === "chat") send(transcript);
    else if (voiceContext === "slide") sendSlideChatText(transcript);
    else if (voiceContext === "quiz") judgeVoiceAnswer(transcript, "quiz");
    else if (voiceContext === "checkin") judgeVoiceAnswer(transcript, "checkin");
  }

  // ── LIFECYCLE ──────────────────────────────
  useEffect(() => {
    setMessages([{ role: "assistant", text: T[lang].welcome, type: "welcome" }]);
    setChatHistory([]);
  }, [lang]);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, loading]);

  useEffect(() => {
    const load = () => { 
      const v = window.speechSynthesis.getVoices(); 
      if (v.length) setAllVoices(v); 
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    loadingTimerRef.current = setInterval(() => {
      setLoadingStep(s => (s + 1) % t.loadingSteps.length);
    }, 3500);
    return () => clearInterval(loadingTimerRef.current);
  }, [loading, lang, t.loadingSteps.length]);

  useEffect(() => {
    return () => { 
      stopSpeech(); 
      clearTimeout(speakTimerRef.current); 
      clearInterval(loadingTimerRef.current); 
    };
  }, []);

  // ── TTS ────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
  }, []);

  const killAllAudio = useCallback(() => {
    clearTimeout(speakTimerRef.current);
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
    voice.stop();
  }, [voice]);

  const speak = useCallback((text, voiceOverride) => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
    if (!window.speechSynthesis || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const chosen = voiceOverride || selectedVoice;
    if (chosen) {
      u.voice = chosen;
    } else {
      const lv = voices.filter(v => lang === "ar" ? v.lang.startsWith("ar") : v.lang.startsWith("en"));
      const prem = lv.find(v => ["google", "natural", "online", "neural", "enhanced", "premium", "siri", "samantha", "karen"].some(k => v.name.toLowerCase().includes(k)));
      u.voice = prem || lv[0] || null;
    }
    u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = e => { if (e.error !== "interrupted") console.warn("TTS:", e.error); setSpeaking(false); };
    try { synthRef.current.speak(u); } catch { setSpeaking(false); }
  }, [lang, selectedVoice]);

  const speakSlide = useCallback(sl => {
    if (!sl) return;
    const parts = [];
    if (sl.title) parts.push(sl.title + ".");
    if (sl.content) parts.push(sl.content);
    if (sl.example) parts.push((lang === "ar" ? "مثال: " : "Example: ") + sl.example);
    speak(parts.join(" "));
  }, [lang, speak]);

  // ── VOICE BUTTON COMPONENT ─────────────────
  const VoiceButton = ({ context, style }) => {
    const isActive = voice.state === "listening" && voiceContext === context;
    const isJudge = voice.state === "judging" && voiceContext === context;
    const isProc = voice.state === "processing" && voiceContext === context;
    return (
      <button
        className={`elva-voice-mic-btn${isActive ? " elva-voice-mic-btn--active" : ""}`}
        style={style}
        onPointerDown={e => { setVoiceContext(context); voice.onPointerDown(e); }}
        onPointerUp={voice.onPointerUp}
        onPointerLeave={voice.onPointerUp}
        onClick={e => { if (voice.isMobile) { setVoiceContext(context); voice.onTap(e); } }}
        title={voice.isMobile ? "Tap to speak" : "Hold to speak"}
      >
        {isJudge ? "⏳" : isProc ? "⌛" : isActive ? "🔴" : "🎤"}
      </button>
    );
  };

  // ── SLIDE CHAT ─────────────────────────────
  async function sendSlideChatText(txt) {
    if (!txt || slideUpdating) return;
    setSlideUpdating(true); killAllAudio();
    try {
      const currentSlide = lesson.slides[slide];
      const sys = makeSlideEditPrompt(lang, studentLevel, currentSlide, txt);
      const raw = await callGroq([{ role: "system", content: sys }, { role: "user", content: txt }], true, 1200, MODEL_FAST);
      const updated = safeParseJSON(raw);
      if (!updated?.title) throw new Error("Bad slide response");
      setLesson(l => ({ ...l, slides: l.slides.map((sl, i) => i === slide ? { ...currentSlide, ...updated } : sl) }));
      speakTimerRef.current = setTimeout(() => {
        const parts = [];
        if (updated.content) parts.push(updated.content);
        if (updated.example) parts.push((lang === "ar" ? "مثال: " : "Example: ") + updated.example);
        speak(parts.join(" "));
      }, 400);
    } catch (err) { console.warn("Slide chat error:", err.message); }
    finally { setSlideUpdating(false); }
  }

  async function sendSlideChat() {
    const txt = slideInput.trim();
    if (!txt || slideUpdating) return;
    setSlideInput("");
    await sendSlideChatText(txt);
  }

  // ── BUILD LESSON ───────────────────────────
  async function buildLesson(history, topic) {
    setLoading(true);
    try {
      const sysSlides = makeSlidesPrompt(lang, studentLevel, topic) + getMemorySummary(lang);
      const slidesRaw = await callGroq([{ role: "system", content: sysSlides }, ...history], true, 3500, MODEL_HEAVY);
      const slidesData = safeParseJSON(slidesRaw);
      if (!slidesData?.slides?.length) throw new Error("No slides returned");
      const combined = validateAndRepairLesson({
        topic: slidesData.topic || topic || "Lesson",
        reply: slidesData.reply || (lang === "ar" ? "الدرس جاهز! 🎉" : "Lesson ready! 🎉"),
        slides: slidesData.slides || [],
        quiz: [],
        lesson_summary: slidesData.lesson_summary || "",
        strong_points: slidesData.strong_points || [],
        weak_points: slidesData.weak_points || [],
        study_tips: slidesData.study_tips || [],
      });
      if (!combined) throw new Error("Lesson validation failed");
      setMessages(p => [...p, { role: "assistant", text: combined.reply, type: "lesson-ready", lessonData: combined }]);
      setXp(x => x + 20);
      if (addXP) addXP(20);
    } catch {
      setMessages(p => [...p, { role: "assistant", text: lang === "ar" ? "❌ حصل خطأ. حاول تاني." : "❌ Error building lesson. Please try again.", type: "error" }]);
    } finally { setLoading(false); }
  }

  // ── BUILD QUIZ ─────────────────────────────
  async function buildQuizThenStart(currentLesson) {
    setQuizLoading(true); killAllAudio();
    try {
      const sys = makeQuizFromSlidesPrompt(lang, studentLevel, currentLesson.slides);
      const raw = await callGroq([{ role: "system", content: sys }, { role: "user", content: "Generate the quiz now." }], true, 1800, MODEL_HEAVY);
      const data = safeParseJSON(raw);
      const repaired = validateAndRepairLesson({ ...currentLesson, quiz: data?.quiz || [] });
      setLesson(repaired);
      setQIdx(0); setSelected(null); setChecked(false);
      setScore(0); setWrongs([]); setShowProof(false);
      setScreen("quiz");
    } catch { setScreen("quiz"); }
    finally { setQuizLoading(false); }
  }

  // ── CHAT SEND ──────────────────────────────
  async function send(text) {
    const txt = text || input.trim();
    if (!txt || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: txt }]);
    const newHistory = [...chatHistory, { role: "user", content: txt }];
    setChatHistory(newHistory);
    setLoading(true);
    try {
      const msgs = [{ role: "system", content: makeTutorSystemPrompt(lang) }, ...newHistory];
      const raw = await callGroq(msgs, true, 500, MODEL_FAST);
      const data = safeParseJSON(raw) || { message: raw, choices: [], ready: false };
      const levelMap = { beginner: "beginner", مبتدئ: "beginner", intermediate: "intermediate", متوسط: "intermediate", advanced: "advanced", متقدم: "advanced" };
      const detectedLevel = Object.keys(levelMap).find(k => txt.toLowerCase().includes(k) || (data.message || "").toLowerCase().includes(k));
      if (detectedLevel) setStudentLevel(levelMap[detectedLevel]);
      if (newHistory.length === 1) setLessonTopic(txt);
      const updatedHistory = [...newHistory, { role: "assistant", content: data.message }];
      setChatHistory(updatedHistory);
      setMessages(p => [...p, { role: "assistant", text: data.message, choices: data.choices || [], type: "tutor-question" }]);
      setLoading(false);
      if (data.ready) {
        const currentTopic = lessonTopic || newHistory[0]?.content || txt;
        setTimeout(() => buildLesson(updatedHistory, currentTopic), 600);
      }
    } catch {
      setMessages(p => [...p, { role: "assistant", text: lang === "ar" ? "❌ تعذّر الاتصال. حاول مجدداً." : "❌ Connection failed. Try again.", type: "error" }]);
      setLoading(false);
    }
  }

  // ── LESSON OPEN / CLOSE ────────────────────
  function openLesson(d) {
    setLesson(d); setSlide(0); setScreen("lesson");
    setQIdx(0); setSelected(null); setChecked(false);
    setScore(0); setWrongs([]); setShowProof(false);
    setCheckIn(null); setCheckInSelected(null); setCheckInChecked(false);
    killAllAudio();
    speakTimerRef.current = setTimeout(() => { if (d.slides[0]) speakSlide(d.slides[0]); }, 600);
  }
  
  function closeLesson() { 
    killAllAudio(); 
    setScreen("chat"); 
    setLesson(null); 
    setCheckIn(null); 
  }

  // ── SLIDE NAVIGATION ───────────────────────
  function goSlide(i) {
    killAllAudio();
    setSlide(i); 
    setCheckIn(null); 
    setCheckInSelected(null); 
    setCheckInChecked(false); 
    setCheckInResult(null);
    speakTimerRef.current = setTimeout(() => { if (lesson?.slides[i]) speakSlide(lesson.slides[i]); }, 300);
  }

  // ── CHECK-IN ───────────────────────────────
  async function generateCheckIn(sl) {
    setCheckInLoading(true); setCheckIn(null);
    const useOpen = slide % 4 === 2;
    try {
      const prompt = makeCheckInPrompt(lang, studentLevel, sl, useOpen, slide);
      const raw = await callGroq([{ role: "user", content: prompt }], true, 600, MODEL_FAST);
      const data = safeParseJSON(raw);
      if (!data?.question) throw new Error("bad response");
      if (data.type === "mcq") {
        const rawOpts = (data.options || []).filter(Boolean);
        const seen = new Set();
        const uniqueOpts = rawOpts.filter(o => { const k = norm(o); if (seen.has(k)) return false; seen.add(k); return true; });
        const exactMatch = uniqueOpts.find(o => norm(o) === norm(data.answer));
        const answer = exactMatch || uniqueOpts[0] || data.answer;
        while (uniqueOpts.length < 4) uniqueOpts.push(`Option ${uniqueOpts.length + 1}`);
        const finalOpts = uniqueOpts.slice(0, 4);
        if (!finalOpts.some(o => norm(o) === norm(answer))) finalOpts[3] = answer;
        const deduped = []; let answerAdded = false;
        for (const o of finalOpts) {
          if (norm(o) === norm(answer)) { if (!answerAdded) { deduped.push(o); answerAdded = true; } }
          else { deduped.push(o); }
        }
        while (deduped.length < 4) deduped.push(`Option ${deduped.length + 1}`);
        const shuffled = shuffleOptions(deduped.slice(0, 4), answer);
        setCheckIn({ ...data, options: shuffled.options, answer: shuffled.answer, slideIdx: slide });
      } else {
        setCheckIn({ ...data, slideIdx: slide });
      }
    } catch { goSlide(slide + 1); }
    finally { setCheckInLoading(false); }
  }

  async function aiJudge(params) {
    const prompt = makeAiJudgePrompt(lang, params);
    const raw = await callGroq([{ role: "user", content: prompt }], true, 400, MODEL_FAST);
    return safeParseJSON(raw);
  }

  function handleNext() {
    const isLast = slide === lesson.slides.length - 1;
    if (isLast) { buildQuizThenStart(lesson); return; }
    if ((slide + 1) % 2 === 0) { killAllAudio(); generateCheckIn(lesson.slides[slide]); return; }
    goSlide(slide + 1);
  }

  function handleCheckInSubmit() {
    if (checkIn?.type === "mcq" && checkInSelected) {
      killAllAudio();
      const isCorrect = norm(checkInSelected) === norm(checkIn.answer);
      const feedback = isCorrect
        ? "✅ " + (checkIn.explanation || "")
        : (lang === "ar" ? `❌ الإجابة الصحيحة: "${checkIn.answer}". ${checkIn.explanation || ""}` : `❌ Correct answer: "${checkIn.answer}". ${checkIn.explanation || ""}`);
      setCheckInResult({ correct: isCorrect, feedback });
      setCheckInChecked(true);
      speakTimerRef.current = setTimeout(() => speak(feedback), 400);
    }
  }

  async function submitOpenAnswer(text) {
    if (!text?.trim() || openSubmitting) return;
    setOpenSubmitting(true); setCheckInResult(null);
    try {
      const data = await aiJudge({ question: checkIn.question, model_answer: checkIn.model_answer, grading_criteria: checkIn.grading_criteria, transcript: text.trim() });
      if (!data) throw new Error("no response");
      setCheckInResult(data); setCheckInChecked(true);
      if (data?.feedback) speakTimerRef.current = setTimeout(() => speak(data.feedback), 300);
    } catch {
      const criteria = checkIn.grading_criteria || [];
      const normText = norm(text);
      const matched = criteria.filter(c => norm(c).split(" ").some(w => w.length > 3 && normText.includes(w)));
      const score_pct = Math.round((matched.length / Math.max(criteria.length, 1)) * 100);
      const isCorrect = score_pct >= 50;
      const missing = criteria.filter(c => !norm(c).split(" ").some(w => w.length > 3 && normText.includes(w)));
      const feedback = isCorrect
        ? (lang === "ar" ? "✅ ممتاز! غطيت النقاط الأساسية." : "✅ Great! You covered the key points.")
        : (lang === "ar" ? `📝 جزئي. تذكر: "${missing[0] || ""}"` : `📝 Partial. Remember: "${missing[0] || ""}"`);
      setCheckInResult({ correct: isCorrect, score_pct, feedback }); setCheckInChecked(true);
    } finally { setOpenSubmitting(false); }
  }

  function handleCheckInContinue() {
    killAllAudio();
    const correct = checkInResult?.correct ?? (norm(checkInSelected) === norm(checkIn?.answer));
    setCheckIn(null); setCheckInSelected(null); setCheckInChecked(false); setCheckInResult(null); setOpenAnswer("");
    if (correct) goSlide(slide + 1); else goSlide(slide);
  }

  // ── QUIZ ───────────────────────────────────
  function checkAnswer() {
    if (!selected || checked) return;
    killAllAudio();
    const q = lesson.quiz[qIdx];
    const isCorrect = norm(selected) === norm(q.answer);
    const feedback = isCorrect
      ? (lang === "ar" ? "✅ إجابة صحيحة! " : "✅ Correct! ") + (q.explanation || "")
      : (lang === "ar" ? `❌ الإجابة الصحيحة: "${q.answer}". ${q.explanation || ""}` : `❌ Correct answer: "${q.answer}". ${q.explanation || ""}`);
    setQuizFeedback({ correct: isCorrect, feedback, matched_option: selected });
    setChecked(true); setShowProof(false);
    if (isCorrect) setScore(s => s + 1); else setWrongs(w => [...w, q.question]);
    speakTimerRef.current = setTimeout(() => speak(feedback), 400);
  }

  async function submitQuizOpenAnswer(text) {
    if (!text?.trim() || quizAiChecking) return;
    setQuizAiChecking(true); setQuizFeedback(null);
    const q = lesson.quiz[qIdx];
    try {
      const data = await aiJudge({ question: q.question, model_answer: q.model_answer, grading_criteria: q.grading_criteria, transcript: text.trim() });
      setChecked(true); setQuizFeedback(data);
      if (data?.correct) setScore(s => s + 1); else setWrongs(w => [...w, q.question]);
      if (data?.feedback) speakTimerRef.current = setTimeout(() => speak(data.feedback), 300);
    } catch { setChecked(true); }
    finally { setQuizAiChecking(false); }
  }

  async function judgeVoiceAnswer(transcript, mode) {
    voice.setJudging();
    const isQuiz = mode === "quiz";
    const q = isQuiz ? lesson?.quiz[qIdx] : checkIn;
    if (!q) return;
    try {
      if (q.type === "open") {
        const data = await aiJudge({ question: q.question, model_answer: q.model_answer, grading_criteria: q.grading_criteria, transcript });
        if (!data) throw new Error("no response");
        if (isQuiz) { setChecked(true); setQuizFeedback(data); if (data.correct) setScore(s => s + 1); else setWrongs(w => [...w, q.question]); }
        else { setCheckInResult(data); setCheckInChecked(true); }
        if (data?.feedback) speakTimerRef.current = setTimeout(() => speak(data.feedback), 300);
      } else {
        const opts = q.options || [];
        const normT = norm(transcript);
        let matched = opts.find(o => normT.includes(norm(o)));
        if (!matched) {
          const scored = opts.map(o => {
            const oW = norm(o).split(" ").filter(w => w.length > 2);
            const tW = normT.split(" ");
            return { o, score: oW.filter(w => tW.some(tw => tw.includes(w) || w.includes(tw))).length / Math.max(oW.length, 1) };
          }).sort((a, b) => b.score - a.score);
          if (scored[0].score > 0.4) matched = scored[0].o;
        }
        if (!matched) {
          const labelMatch = normT.match(/\b([abcd1234])\b/i);
          if (labelMatch) { const idx = "abcd1234".indexOf(labelMatch[1].toLowerCase()); matched = opts[idx >= 4 ? idx - 4 : idx]; }
        }
        const isCorrect = matched ? norm(matched) === norm(q.answer) : false;
        const feedback = isCorrect
          ? (lang === "ar" ? "✅ إجابة صحيحة! " : "✅ Correct! ") + (q.explanation || "")
          : (lang === "ar" ? `❌ الإجابة الصحيحة: "${q.answer}". ${q.explanation || ""}` : `❌ Correct answer: "${q.answer}". ${q.explanation || ""}`);
        const data = { correct: isCorrect, feedback, matched_option: matched };
        if (isQuiz) { setSelected(matched || transcript); setChecked(true); setShowProof(false); setQuizFeedback(data); if (isCorrect) setScore(s => s + 1); else setWrongs(w => [...w, q.question]); }
        else { setCheckInResult(data); setCheckInChecked(true); setCheckInSelected(matched || transcript); }
        speakTimerRef.current = setTimeout(() => speak(feedback), 300);
      }
    } catch (err) { console.warn("judgeVoiceAnswer:", err); }
  }

  function nextQuestion() {
    killAllAudio();
    if (qIdx < lesson.quiz.length - 1) {
      setQIdx(q => q + 1); setSelected(null); setChecked(false);
      setShowProof(false); setProofText(""); setQuizFeedback(null); setOpenAnswer("");
    } else {
      recordQuizResult(lesson.topic, score, lesson.quiz.length, wrongs);
      setStreak(s => s + 1); 
      const earnedXP = 20 + score * 10;
      setXp(x => x + earnedXP);
      if (addXP) addXP(earnedXP);
      setScreen("report");
    }
  }

  async function fetchProof(question, answer, explanation) {
    setShowProof(true); setProofText(""); setProofLoading(true);
    try {
      const res = await callGroq([{ role: "user", content: makeProofPrompt(lang, question, answer, explanation) }], false, 600, MODEL_FAST);
      setProofText(res);
    } catch (err) { setProofText("Error: " + err.message); }
    finally { setProofLoading(false); }
  }

  function md(s) {
    return (s || "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
  }

  // ════════════════════════════════════════════
  // REPORT SCREEN
  // ════════════════════════════════════════════
  if (screen === "report" && lesson) {
    const total = lesson.quiz?.length || 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const lvlInfo = getLevelInfo(pct, lang);
    const nextStep = getNextStep(pct, lesson.weak_points, lang);
    return (
      <div className="elva-root elva-root--report" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <Orbs />
        <div className="elva-report-wrap">
          <div className="elva-report-header">
            <div style={{ fontSize: 44 }}>{lvlInfo.icon}</div>
            <div>
              <h2 className="elva-report-title">{t.reportTitle}</h2>
              <p className="elva-report-topic">{lesson.topic}</p>
            </div>
          </div>
          <div className="elva-stats-row">
            <StatCard label={t.score} value={`${score}/${total}`} sub={`${pct}%`} subColor={lvlInfo.color} bar={pct} />
            <StatCard label={t.level} value={lvlInfo.label} icon={lvlInfo.icon} valueColor={lvlInfo.color} />
            <StatCard label={t.focus} value={lvlInfo.focus} icon="🎯" valueColor={lvlInfo.focusColor} small />
          </div>
          <Section title={`📖 ${t.summary}`}>
            <p className="elva-summary-text">{lesson.lesson_summary}</p>
          </Section>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Section title={`✅ ${t.strengths}`} titleColor="#34d399">
              {(lesson.strong_points || []).map((p, i) => <Point key={i} text={p} color="#34d399" />)}
            </Section>
            <Section title={`📌 ${t.improve}`} titleColor="#f87171">
              {(lesson.weak_points || []).map((p, i) => <Point key={i} text={p} color="#f87171" />)}
              {wrongs.map((q, i) => <Point key={"w" + i} text={q} color="#f87171" small />)}
            </Section>
          </div>
          {lesson.study_tips?.length > 0 && (
            <Section title={`💡 ${lang === "ar" ? "نصايح للتطوير" : "Study Tips"}`} titleColor="#fbbf24">
              {lesson.study_tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#fbbf24", fontSize: 13 }}>→</span>
                  <p style={{ fontSize: 13, color: "rgba(226,232,240,0.8)", lineHeight: 1.7 }}>{tip}</p>
                </div>
              ))}
            </Section>
          )}
          <div className="elva-next-step-box" style={{ borderColor: nextStep.color + "55", background: nextStep.color + "11" }}>
            <div className="elva-next-step-label" style={{ color: nextStep.color }}>🗺️ {t.nextStep}</div>
            <p style={{ fontSize: 14, color: "rgba(226,232,240,0.9)" }}>{nextStep.msg}</p>
          </div>
          <div className="elva-xp-gained">
            <span style={{ fontSize: 22 }}>⭐</span>
            <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 17 }}>+{20 + score * 10} XP {lang === "ar" ? "اكتسبت" : "Earned"}</span>
            <span style={{ color: "rgba(251,191,36,.5)", fontSize: 13 }}>🔥 Streak: {streak}</span>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="elva-report-btn" onClick={closeLesson}>{t.backToChat}</button>
            <button className="elva-report-btn elva-report-btn--secondary" onClick={() => openLesson(lesson)}>{t.tryAgain}</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // QUIZ SCREEN
  // ════════════════════════════════════════════
  if (screen === "quiz" && lesson?.quiz) {
    const q = lesson.quiz[qIdx];
    if (!q) return <div className="elva-root" style={{ color: "#fff" }}>Loading quiz...</div>;
    const isCorrect = checked && (quizFeedback?.correct ?? false);
    const progress = ((qIdx + 1) / lesson.quiz.length) * 100;

    const optClass = (opt) => {
      if (!checked) return norm(opt) === norm(selected) ? "elva-opt-btn elva-opt-btn--selected" : "elva-opt-btn elva-opt-btn--default";
      const studentChose = norm(opt) === norm(selected);
      const isCorrectOpt = norm(opt) === norm(q.answer);
      const studentWasRight = quizFeedback?.correct ?? false;
      if (studentChose && studentWasRight) return "elva-opt-btn elva-opt-btn--correct";
      if (studentChose && !studentWasRight) return "elva-opt-btn elva-opt-btn--wrong";
      if (isCorrectOpt && !studentWasRight) return "elva-opt-btn elva-opt-btn--reveal";
      return "elva-opt-btn elva-opt-btn--default";
    };

    return (
      <div className="elva-root elva-root--quiz" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <Orbs />
        <div className="elva-lesson-wrap">
          <TopBar title={t.quizTitle} count={`${qIdx + 1} / ${lesson.quiz.length}`} onBack={closeLesson} backLabel={t.back} />
          <ProgressBar value={progress} />
          {q.type && <div style={{ display: "flex" }}><span className="elva-quiz-type-badge">{q.type?.toUpperCase()}</span></div>}
          <div className="elva-quiz-card">
            <p className="elva-quiz-q">{q.question}</p>
            {q.type === "open" && <span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800, letterSpacing: 1 }}>OPEN-ENDED ✍️</span>}

            {voice.state !== "idle" && voiceContext === "quiz" && (
              <div className="elva-voice-answer-feedback">
                <span className={`elva-voice-dot elva-voice-dot--${voice.state === "judging" ? "judging" : "listening"}`}>●</span>
                <span style={{ color: voice.state === "judging" ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 700 }}>
                  {voice.state === "judging" ? t.voiceJudging : voice.state === "listening" ? t.voiceListening : t.voiceProcessing}
                </span>
                {voice.transcript && <span style={{ color: "rgba(226,232,240,0.6)", fontSize: 12, flex: 1, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{voice.transcript}"</span>}
                {voice.state === "listening" && <button onClick={() => voice.stop()} className="elva-voice-stop-btn">✕</button>}
              </div>
            )}
            {voice.error && voiceContext === "quiz" && <p style={{ fontSize: 11, color: "#f87171" }}>{voice.error}</p>}

            {q.type !== "open" && (
              <>
                <div className="elva-options-wrap">
                  {(q.options || []).map((opt, i) => (
                    <button key={i} className={optClass(opt)}
                      onClick={() => { if (!checked && !quizAiChecking) setSelected(opt); }}>{opt}</button>
                  ))}
                </div>
                {!checked && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <VoiceButton context="quiz" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>{t.voiceAnswerHint}</span>
                  </div>
                )}
              </>
            )}

            {q.type === "open" && !checked && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea className="elva-open-textarea" value={openAnswer} rows={3}
                  onChange={e => setOpenAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitQuizOpenAnswer(openAnswer); } }}
                  placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Write your answer here..."}
                  disabled={quizAiChecking}
                  style={{ textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={`elva-nav-btn elva-nav-btn--primary${!openAnswer.trim() || quizAiChecking ? " elva-nav-btn--disabled" : ""}`}
                    style={{ flex: 1 }} onClick={() => submitQuizOpenAnswer(openAnswer)} disabled={!openAnswer.trim() || quizAiChecking}>
                    {quizAiChecking ? <LoadingDots /> : t.quizCheck}
                  </button>
                  <VoiceButton context="quiz" style={{ width: 46, height: 46, flexShrink: 0 }} />
                </div>
              </div>
            )}

            {checked && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className={`elva-feedback-box${q.type === "open" ? " elva-feedback-box--open" : (isCorrect ? " elva-feedback-box--correct" : " elva-feedback-box--wrong")}`}>
                  <p style={{ color: isCorrect ? "#34d399" : q.type === "open" ? "#fbbf24" : "#f87171", fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
                    {q.type === "open"
                      ? (quizFeedback?.correct ? (lang === "ar" ? "✅ إجابة ممتازة!" : "✅ Excellent answer!") : (lang === "ar" ? "📝 إجابة جزئية" : "📝 Partial answer"))
                      : (isCorrect ? t.correct : t.wrong + q.answer)}
                    {quizFeedback?.score_pct !== undefined && q.type === "open" && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>({quizFeedback.score_pct}%)</span>}
                  </p>
                  {(quizFeedback?.feedback || q.explanation) && <p style={{ color: "rgba(226,232,240,0.85)", fontSize: 13, lineHeight: 1.7 }}>{quizFeedback?.feedback || q.explanation}</p>}
                </div>
                {q.type !== "open" && !showProof && (
                  <button className="elva-proof-btn" onClick={() => fetchProof(q.question, q.answer, q.explanation)}>
                    <span>📐</span><span>{t.proofLabel}</span>
                  </button>
                )}
                {showProof && (
                  <div className="elva-proof-box">
                    <div className="elva-proof-header"><span>📐</span><span style={{ color: "#fbbf24" }}>{t.proofLabel}</span></div>
                    {proofLoading ? <LoadingDots color="#fbbf24" />
                      : <p style={{ fontSize: 13.5, color: "rgba(226,232,240,0.88)", lineHeight: 2, whiteSpace: "pre-line", textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }}>{proofText}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="elva-controls">
            {!checked
              ? (q.type !== "open" &&
                <button className={`elva-nav-btn elva-nav-btn--primary${!selected || quizAiChecking ? " elva-nav-btn--disabled" : ""}`}
                  style={{ minWidth: 140 }} onClick={checkAnswer} disabled={!selected || quizAiChecking}>
                  {quizAiChecking ? <LoadingDots /> : t.quizCheck}
                </button>)
              : <button className="elva-nav-btn elva-nav-btn--primary" style={{ minWidth: 140 }} onClick={nextQuestion}>
                {qIdx < lesson.quiz.length - 1 ? t.quizNext : t.quizFinish}
              </button>
            }
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // LESSON SCREEN
  // ════════════════════════════════════════════
  if (screen === "lesson" && lesson) {
    const sl = lesson.slides[slide];
    const col = COLORS[sl?.type] || COLORS.concept;
    const pct = ((slide + 1) / lesson.slides.length) * 100;
    const isLast = slide === lesson.slides.length - 1;

    return (
      <div className="elva-root elva-root--lesson" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <Orbs />
        <div className="elva-lesson-wrap">
          <TopBar title={lesson.topic || t.lessonTitle} count={`${slide + 1} / ${lesson.slides.length}`} onBack={closeLesson} backLabel={t.back} />
          <ProgressBar value={pct} />

          {checkInLoading ? (
            <div className="elva-checkin-card" style={{ alignItems: "center", justifyContent: "center", minHeight: 120 }}>
              <LoadingDots color="#fbbf24" />
              <span style={{ color: "rgba(251,191,36,0.8)", fontSize: 13, fontWeight: 700 }}>
                {lang === "ar" ? "جاري تحضير سؤال..." : "Preparing question..."}
              </span>
            </div>
          ) : checkIn ? (
            <div className="elva-checkin-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="elva-checkin-title">{t.checkInTitle}</div>
                {checkIn.type === "open" && <span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 800 }}>OPEN ✍️</span>}
              </div>
              <p className="elva-quiz-q">{checkIn.question}</p>

              {checkIn.type === "mcq" && (
                <>
                  <div className="elva-options-wrap">
                    {(checkIn.options || []).map((opt, i) => {
                      let cls = "elva-opt-btn elva-opt-btn--default";
                      if (checkInChecked) {
                        const studentChose = norm(opt) === norm(checkInSelected);
                        const isCorrectOpt = norm(opt) === norm(checkIn.answer);
                        const studentWasRight = checkInResult?.correct ?? false;
                        if (studentChose && studentWasRight) cls = "elva-opt-btn elva-opt-btn--correct";
                        else if (studentChose) cls = "elva-opt-btn elva-opt-btn--wrong";
                        else if (isCorrectOpt) cls = "elva-opt-btn elva-opt-btn--reveal";
                      } else if (norm(opt) === norm(checkInSelected)) cls = "elva-opt-btn elva-opt-btn--selected";
                      return <button key={i} className={cls} onClick={() => { if (!checkInChecked) setCheckInSelected(opt); }}>{opt}</button>;
                    })}
                  </div>
                  {!checkInChecked ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                      <button className={`elva-nav-btn elva-nav-btn--primary${!checkInSelected ? " elva-nav-btn--disabled" : ""}`}
                        onClick={handleCheckInSubmit} disabled={!checkInSelected}>{t.quizCheck}</button>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <VoiceButton context="checkin" style={{ width: 40, height: 40, fontSize: 16 }} />
                        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>{t.voiceAnswerHint}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className={`elva-feedback-box${checkInResult?.correct ? " elva-feedback-box--checkin-correct" : " elva-feedback-box--checkin-wrong"}`}>
                        <p style={{ color: checkInResult?.correct ? "#34d399" : "#f87171", fontWeight: 800 }}>
                          {checkInResult?.correct ? t.checkInCorrect : t.checkInWrong}
                        </p>
                        {checkInResult?.feedback && <p style={{ fontSize: 13, color: "rgba(226,232,240,0.8)", lineHeight: 1.7, marginTop: 6 }}>{checkInResult.feedback}</p>}
                      </div>
                      <button className="elva-nav-btn elva-nav-btn--primary" onClick={handleCheckInContinue}>
                        {checkInResult?.correct ? t.next : (lang === "ar" ? "أعد الشريحة" : "Replay Slide")}
                      </button>
                    </div>
                  )}
                </>
              )}

              {checkIn.type === "open" && (
                !checkInChecked ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 12, color: "rgba(167,139,250,0.6)", lineHeight: 1.6 }}>
                      {lang === "ar" ? "💡 تلميح:" : "💡 Hint — mention:"}<br />
                      {(checkIn.grading_criteria || []).map((c, i) => (
                        <span key={i} className="elva-criteria-tag">{c}</span>
                      ))}
                    </p>
                    <textarea className="elva-open-textarea" value={openAnswer} rows={3}
                      onChange={e => setOpenAnswer(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitOpenAnswer(openAnswer); } }}
                      placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Write your answer here..."}
                      disabled={openSubmitting}
                      style={{ textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className={`elva-nav-btn elva-nav-btn--primary${!openAnswer.trim() || openSubmitting ? " elva-nav-btn--disabled" : ""}`}
                        style={{ flex: 1 }} onClick={() => submitOpenAnswer(openAnswer)} disabled={!openAnswer.trim() || openSubmitting}>
                        {openSubmitting ? <LoadingDots /> : t.quizCheck}
                      </button>
                      <VoiceButton context="checkin" style={{ width: 46, height: 46, flexShrink: 0 }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    <div className={`elva-feedback-box${checkInResult?.correct ? " elva-feedback-box--checkin-correct" : " elva-feedback-box--open-partial"}`}>
                      <p style={{ color: checkInResult?.correct ? "#34d399" : "#fbbf24", fontWeight: 800, marginBottom: 6 }}>
                        {checkInResult?.correct ? (lang === "ar" ? "✅ إجابة ممتازة!" : "✅ Great answer!") : (lang === "ar" ? "📝 تقريباً صح" : "📝 Almost — see model answer")}
                        {checkInResult?.score_pct !== undefined && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>({checkInResult.score_pct}%)</span>}
                      </p>
                      {checkInResult?.feedback && <p style={{ fontSize: 13, color: "rgba(226,232,240,0.85)", lineHeight: 1.8, marginBottom: 8 }}>{checkInResult.feedback}</p>}
                      <div className="elva-model-answer-box">
                        <div className="elva-model-answer-label">{lang === "ar" ? "📖 الإجابة النموذجية" : "📖 MODEL ANSWER"}</div>
                        <p style={{ fontSize: 13, color: "rgba(226,232,240,0.8)", lineHeight: 1.7 }}>{checkIn.model_answer}</p>
                      </div>
                    </div>
                    <button className="elva-nav-btn elva-nav-btn--primary" onClick={handleCheckInContinue}>
                      {checkInResult?.correct ? t.next : (lang === "ar" ? "أعد الشريحة" : "Replay Slide")}
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <>
              <div className={`elva-slide-card slide-card--${col.varPrefix}`}>
                <div className="elva-slide-header">
                  <span className="elva-slide-emoji">{sl?.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={`elva-slide-type-label slide-label--${col.varPrefix}`}>{col.label}</div>
                    <h2 className="elva-slide-h">{sl?.title}</h2>
                  </div>
                </div>
                <p className="elva-slide-p" style={{ textAlign: isRTL ? "right" : "left" }}>{sl?.content}</p>
                {sl?.keypoints?.length > 0 && (
                  <div className="elva-keypoints-box">
                    {sl.keypoints.map((kp, i) => (
                      <div key={i} className="elva-keypoint">
                        <span className={`slide-keypoint-arrow--${col.varPrefix}`}
                          style={{ marginLeft: isRTL ? 8 : 0, marginRight: isRTL ? 0 : 8 }}>▸</span>{kp}
                      </div>
                    ))}
                  </div>
                )}
                {sl?.example && (
                  <div className={`elva-example-box slide-example-border--${col.varPrefix}`}>
                    <div className={`elva-example-label slide-label--${col.varPrefix}`}>
                      {lang === "ar" ? "✏️ مثال محلول" : "✏️ WORKED EXAMPLE"}
                    </div>
                    <p className="elva-example-text" style={{ textAlign: isRTL ? "right" : "left" }}>{sl.example}</p>
                  </div>
                )}
                {sl?.tip && (
                  <div className="elva-tip-box">
                    <span style={{ fontSize: 16 }}>💡</span>
                    <p className="elva-tip-text" style={{ textAlign: isRTL ? "right" : "left" }}>{sl.tip}</p>
                  </div>
                )}
              </div>

              <div className="elva-narration-box">
                <div className="elva-nar-label">{t.narrationLabel}</div>
                <p className="elva-nar-text" style={{ textAlign: isRTL ? "right" : "left" }}>{sl?.narration}</p>
              </div>

              <div className="elva-dots">
                {lesson.slides.map((_, i) => (
                  <div key={i} onClick={() => goSlide(i)}
                    className={`elva-dot${i === slide ? " elva-dot--active" : " elva-dot--inactive"}`} />
                ))}
              </div>

              <div className="elva-controls">
                <button className={`elva-nav-btn${slide === 0 ? " elva-nav-btn--disabled" : ""}`}
                  onClick={() => { if (slide > 0) goSlide(slide - 1); }}>{t.prev}</button>
                <button className={`elva-tts-btn${speaking ? " elva-tts-btn--playing" : " elva-tts-btn--idle"}`}
                  onClick={() => { speaking ? stopSpeech() : speakSlide(sl); }}>
                  {speaking ? t.stop : t.listen}
                </button>
                <button className={`elva-nav-btn${isLast ? " elva-nav-btn--finish" : ""}${quizLoading ? " elva-nav-btn--disabled" : ""}`}
                  onClick={handleNext} disabled={quizLoading}>
                  {quizLoading ? <LoadingDots color="#34d399" /> : (isLast ? t.done : t.next)}
                </button>
              </div>

              <div className="elva-slide-chat-wrap">
                {voice.state !== "idle" && voiceContext === "slide" && (
                  <div className="elva-voice-feedback">
                    <span className="elva-voice-dot elva-voice-dot--listening">●</span>
                    <span style={{ color: "#f87171", fontSize: 12, fontWeight: 700 }}>
                      {voice.state === "listening" ? t.voiceListening : t.voiceProcessing}
                    </span>
                    {voice.transcript && <span style={{ color: "rgba(226,232,240,0.6)", fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{voice.transcript}"</span>}
                    {voice.state === "listening" && <button onClick={() => voice.stop()} className="elva-voice-stop-btn" style={{ fontSize: 10, padding: "2px 7px" }}>✕</button>}
                  </div>
                )}
                {voice.error && voiceContext === "slide" && <p style={{ fontSize: 11, color: "#f87171", marginBottom: 4 }}>{voice.error}</p>}
                <div className="elva-slide-chat-inner">
                  {isRTL && (
                    <>
                      <button className="elva-slide-send-btn" style={{ opacity: slideInput.trim() && !slideUpdating ? 1 : 0.3 }}
                        onClick={sendSlideChat} disabled={!slideInput.trim() || slideUpdating}>
                        {slideUpdating ? "⏳" : "✨"}
                      </button>
                      <VoiceButton context="slide" style={{ width: 38, height: 38, fontSize: 16 }} />
                    </>
                  )}
                  <textarea
                    className={`elva-slide-chat-input${voice.state === "listening" && voiceContext === "slide" ? " elva-slide-chat-input--voice" : ""}`}
                    value={voice.state === "listening" && voiceContext === "slide" ? (voice.transcript || "") : slideInput}
                    onChange={e => { if (voiceContext !== "slide" || voice.state !== "listening") setSlideInput(e.target.value); }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSlideChat(); } }}
                    placeholder={slideUpdating ? t.slideChatUpdating : voice.state === "listening" && voiceContext === "slide" ? t.voiceListening : t.slideChatPlaceholder}
                    disabled={slideUpdating} rows={1}
                    style={{ textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }} />
                  {!isRTL && (
                    <>
                      <VoiceButton context="slide" style={{ width: 38, height: 38, fontSize: 16 }} />
                      <button className="elva-slide-send-btn" style={{ opacity: slideInput.trim() && !slideUpdating ? 1 : 0.3 }}
                        onClick={sendSlideChat} disabled={!slideInput.trim() || slideUpdating}>
                        {slideUpdating ? "⏳" : "✨"}
                      </button>
                    </>
                  )}
                </div>
                <p className="elva-slide-chat-hint">{t.slideChatHint}</p>
              </div>
            </>
          )}

          {quizLoading && (
            <div className="elva-quiz-loading-overlay">
              <LoadingDots color="#34d399" />
              <span style={{ color: "#34d399", fontSize: 13, fontWeight: 700 }}>{t.quizLoading}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // CHAT SCREEN
  // ════════════════════════════════════════════
  if (!messages) return null;
  return (
    <div className="elva-root" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <Orbs />
      <div className="elva-container">

        {/* HEADER */}
        <header className="elva-header">
          <div className="elva-logo">
            <div className="elva-logo-icon">E</div>
            <div>
              <div className="elva-logo-name">ELVA</div>
              <div className="elva-logo-sub">{t.subtitle}</div>
            </div>
          </div>
          <div className="elva-header-right">
            {user?.avatar && (
              <button 
                className="elva-user-avatar-btn"
                onClick={() => navigate('/profile')}
                title="View Profile"
              >
                <div dangerouslySetInnerHTML={{ __html: buildMiniAvatarSVG(user.avatar, 36) }} />
              </button>
            )}
            <div className="elva-pill">🔥 {streak}</div>
            <div className="elva-pill">⭐ {xp}</div>
            <div className="elva-lvl">LV{level}</div>
            <button className="elva-lang-btn" onClick={() => { 
              killAllAudio(); 
              setScreen("chat"); 
              setLesson(null); 
              setChatHistory([]); 
              setStudentLevel(null); 
              setLessonTopic(null); 
              setLang(l => l === "ar" ? "en" : "ar"); 
            }}>{t.toggleLang}</button>
            <button className={`elva-voice-picker-btn${showVoicePicker ? " elva-voice-picker-btn--active" : ""}`}
              onClick={() => setShowVoicePicker(p => !p)}>🎙️</button>
          </div>
        </header>

        <div className="elva-xp-track"><div className="elva-xp-fill" style={{ width: xpProg + "%" }} /></div>

        {/* VOICE PICKER */}
        {showVoicePicker && (
          <div className="elva-voice-panel">
            <div className="elva-voice-panel-title">🎙️ {lang === "ar" ? "اختار صوت إلفا" : "CHOOSE ELVA VOICE"}</div>
            <div className="elva-voice-list">
              {allVoices.filter(v => lang === "ar" ? v.lang.startsWith("ar") : v.lang.startsWith("en")).map((v, i) => {
                const isSel = selectedVoice?.name === v.name;
                const isPrem = ["google", "natural", "online", "neural", "enhanced", "premium", "siri", "samantha", "karen"].some(k => v.name.toLowerCase().includes(k));
                return (
                  <button key={i} className="elva-voice-btn"
                    style={{ background: isSel ? "rgba(124,58,237,.35)" : "rgba(124,58,237,.07)", borderColor: isSel ? "#a78bfa" : "rgba(124,58,237,.2)", color: isSel ? "#fff" : "#c4b5fd" }}
                    onClick={() => { 
                      setSelectedVoice(v); 
                      stopSpeech(); 
                      const u = new SpeechSynthesisUtterance(lang === "ar" ? "مرحباً! أنا إلفاَ، مدرستك الذكية." : "Hello! I'm Elva, your personal AI tutor."); 
                      u.voice = v; 
                      u.rate = 0.9; 
                      window.speechSynthesis.speak(u); 
                    }}>
                    {isPrem ? "⭐" : "🔈"} {v.name.replace("Microsoft ", "").replace("Google ", "").split(" ").slice(0, 3).join(" ")}
                  </button>
                );
              })}
            </div>
            {selectedVoice && <div style={{ fontSize: 11, color: "rgba(52,211,153,.8)", fontWeight: 600 }}>✅ {selectedVoice.name}</div>}
          </div>
        )}

        {/* SUBJECT CHIPS */}
        <div className="elva-chips">
          {t.subjects.map(s => (
            <button key={s.label} className="elva-chip" onClick={() => send(s.prompt)}>{s.icon} {s.label}</button>
          ))}
        </div>

        {/* MESSAGES */}
        <div className="elva-chat">
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            return (
              <div key={i} className="elva-msg-wrap">
                <div className={msg.role === "user" ? "elva-user-row" : "elva-bot-row"}>
                  {msg.role === "assistant" && <div className="elva-avatar elva-avatar--bot">E</div>}
                  <div className={msg.role === "user" ? "elva-bubble elva-bubble--user" : "elva-bubble elva-bubble--bot"}>
                    <span dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
                    {msg.type === "lesson-ready" && msg.lessonData && (
                      <button className="elva-open-btn" onClick={() => openLesson(msg.lessonData)}>{t.openLesson}</button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    user?.avatar ? (
                      <div className="elva-user-avatar-mini" dangerouslySetInnerHTML={{ __html: buildMiniAvatarSVG(user.avatar, 32) }} />
                    ) : (
                      <div className="elva-avatar elva-avatar--user">👤</div>
                    )
                  )}
                </div>
                {msg.choices?.length > 0 && isLast && !loading && (
                  <div className="elva-choices-wrap" style={{ paddingRight: isRTL ? 0 : 48, paddingLeft: isRTL ? 48 : 0 }}>
                    {msg.choices.map((choice, ci) => (
                      <button key={ci} className="elva-choice-btn" onClick={() => send(choice)}>{choice}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="elva-bot-row">
              <div className="elva-avatar elva-avatar--bot">E</div>
              <div className="elva-bubble elva-bubble--bot" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LoadingDots />
                <span style={{ fontSize: 12, color: "rgba(167,139,250,.7)" }}>{t.loadingSteps[loadingStep]}</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="elva-input-area">
          {voice.state !== "idle" && voiceContext === "chat" && (
            <div className="elva-voice-feedback">
              <span className="elva-voice-dot elva-voice-dot--listening">●</span>
              <span style={{ color: voice.state === "listening" ? "#f87171" : "#fbbf24", fontSize: 13, fontWeight: 700 }}>
                {voice.state === "listening" ? t.voiceListening : t.voiceProcessing}
              </span>
              {voice.transcript && <span style={{ color: "rgba(226,232,240,0.7)", fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{voice.transcript}"</span>}
              <button onClick={() => voice.stop()} className="elva-voice-stop-btn">✕</button>
            </div>
          )}
          {voice.error && voiceContext === "chat" && <p style={{ fontSize: 11, color: "#f87171", marginBottom: 6, textAlign: "center" }}>{voice.error}</p>}
          <div className="elva-input-wrap">
            {isRTL && (
              <>
                <button className="elva-send-btn" style={{ opacity: loading || !input.trim() ? 0.35 : 1 }}
                  onClick={() => send()} disabled={loading || !input.trim()}>🚀</button>
                <VoiceButton context="chat" style={{ width: 46, height: 46 }} />
              </>
            )}
            <textarea
              className={`elva-textarea${voice.state === "listening" && voiceContext === "chat" ? " elva-textarea--voice" : ""}`}
              value={voice.state === "listening" && voiceContext === "chat" ? (voice.transcript || "") : input}
              onChange={e => { if (voiceContext !== "chat" || voice.state !== "listening") setInput(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={voice.state === "listening" && voiceContext === "chat" ? t.voiceListening : t.placeholder}
              style={{ textAlign: isRTL ? "right" : "left", direction: isRTL ? "rtl" : "ltr" }}
              rows={1} />
            {!isRTL && (
              <>
                <VoiceButton context="chat" style={{ width: 46, height: 46 }} />
                <button className="elva-send-btn" style={{ opacity: loading || !input.trim() ? 0.35 : 1 }}
                  onClick={() => send()} disabled={loading || !input.trim()}>🚀</button>
              </>
            )}
          </div>
          <p className="elva-hint">{voice.isMobile ? t.hint.replace("Press Enter", "Tap 🚀") : t.hint}</p>
        </div>
      </div>
    </div>
  );
}