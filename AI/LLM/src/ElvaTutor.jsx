import React, { useState, useRef, useEffect } from "react";

const GROQ_KEY = "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";

const T = {
  en: {
    subtitle: "AI Tutor - EDTECH",
    welcome: "Hi! I'm ELVA, your personal AI tutor 👋\n\nWhat would you like to learn today? Tell me any subject and I'll ask you a few quick questions first so I can teach it perfectly for your level!",
    placeholder: "Tell me what you want to learn...",
    hint: "Press Enter to send - +20 XP per lesson",
    openLesson: "Start Full Lesson",
    lessonTitle: "ELVA Lesson",
    back: "Back",
    listen: "Listen",
    stop: "Stop",
    prev: "Prev",
    next: "Next",
    done: "Start Quiz",
    narrationLabel: "Slide Narration",
    loading: "ELVA is thinking...",
    toggleLang: "AR",
    quizTitle: "Quiz Time",
    quizCheck: "Submit Answer",
    quizNext: "Next Question",
    quizFinish: "See Results",
    correct: "✅ Correct!",
    wrong: "❌ Wrong! Correct answer: ",
    proofLabel: "📐 Proof & Explanation",
    reportTitle: "Your Performance Report",
    score: "Quiz Score",
    level: "Your Level",
    focus: "Focus Level",
    summary: "Lesson Summary",
    strengths: "Strong Points",
    improve: "Needs Improvement",
    backToChat: "Back to Chat",
    tryAgain: "Try Again",
    subjects: [
      { label: "Algebra",  icon: "M", prompt: "I want to learn algebra" },
      { label: "Physics",  icon: "P", prompt: "I want to learn physics" },
      { label: "Python",   icon: "C", prompt: "I want to learn Python" },
      { label: "History",  icon: "H", prompt: "I want to learn history" },
      { label: "Biology",  icon: "B", prompt: "I want to learn biology" },
      { label: "AI",       icon: "A", prompt: "I want to learn AI" },
    ],
  },
  ar: {
    subtitle: "مدرس ذكي - إيدتيك",
    welcome: "أهلاً! أنا إلفا مدرستك الذكية 👋\n\nإيه الموضوع اللي عايز تتعلمه؟ قولي وهسألك كام سؤال بسيط الأول عشان أعرف مستواك وأشرحلك صح!",
    placeholder: "قولي إيه اللي عايز تتعلمه...",
    hint: "اضغط Enter للإرسال - +20 نقطة لكل درس",
    openLesson: "ابدأ الدرس الكامل",
    lessonTitle: "درس إلفا",
    back: "رجوع",
    listen: "استمع",
    stop: "وقف",
    prev: "السابق",
    next: "التالي",
    done: "ابدأ الاختبار",
    narrationLabel: "شرح الشريحة",
    loading: "إلفا بتفكر...",
    toggleLang: "EN",
    quizTitle: "وقت الاختبار",
    quizCheck: "تأكيد الإجابة",
    quizNext: "السؤال التالي",
    quizFinish: "شوف النتيجة",
    correct: "✅ إجابة صحيحة!",
    wrong: "❌ إجابة خاطئة! الصح هو: ",
    proofLabel: "📐 الإثبات والشرح",
    reportTitle: "تقرير أدائك",
    score: "درجة الاختبار",
    level: "مستواك",
    focus: "مستوى التركيز",
    summary: "خلاصة الدرس",
    strengths: "نقاط القوة",
    improve: "يحتاج تحسين",
    backToChat: "ارجع للشات",
    tryAgain: "حاول تاني",
    subjects: [
      { label: "الجبر",    icon: "M", prompt: "عايز أتعلم الجبر" },
      { label: "الفيزياء", icon: "P", prompt: "عايز أتعلم الفيزياء" },
      { label: "البرمجة",  icon: "C", prompt: "عايز أتعلم بايثون" },
      { label: "التاريخ",  icon: "H", prompt: "عايز أتعلم تاريخ" },
      { label: "الأحياء",  icon: "B", prompt: "عايز أتعلم أحياء" },
      { label: "الذكاء الاصطناعي", icon: "A", prompt: "عايز أتعلم ذكاء اصطناعي" },
    ],
  },
};

const COLORS = {
  intro:      { bg:"rgba(124,58,237,0.15)", border:"rgba(124,58,237,0.5)", accent:"#a78bfa", label:"INTRO" },
  concept:    { bg:"rgba(59,130,246,0.12)", border:"rgba(59,130,246,0.5)", accent:"#60a5fa", label:"CONCEPT" },
  example:    { bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.5)", accent:"#34d399", label:"EXAMPLE" },
  definition: { bg:"rgba(236,72,153,0.12)", border:"rgba(236,72,153,0.5)", accent:"#f472b6", label:"DEFINITION" },
  summary:    { bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.5)", accent:"#fbbf24", label:"SUMMARY" },
};

function getLevelInfo(pct, lang) {
  if (pct >= 90) return { label:lang==="ar"?"ممتاز":"Excellent",      color:"#34d399", icon:"🏆", focus:lang==="ar"?"تركيز عالي جداً":"Very High Focus", focusColor:"#34d399" };
  if (pct >= 75) return { label:lang==="ar"?"جيد جداً":"Very Good",   color:"#60a5fa", icon:"🌟", focus:lang==="ar"?"تركيز جيد":"Good Focus",           focusColor:"#60a5fa" };
  if (pct >= 60) return { label:lang==="ar"?"جيد":"Good",              color:"#fbbf24", icon:"👍", focus:lang==="ar"?"تركيز متوسط":"Average Focus",      focusColor:"#fbbf24" };
  if (pct >= 40) return { label:lang==="ar"?"مقبول":"Fair",            color:"#f97316", icon:"📚", focus:lang==="ar"?"يحتاج تركيز":"Needs More Focus",   focusColor:"#f97316" };
  return           { label:lang==="ar"?"يحتاج مراجعة":"Needs Review",  color:"#ef4444", icon:"💪", focus:lang==="ar"?"تركيز ضعيف":"Low Focus",           focusColor:"#ef4444" };
}

function makeTutorSystemPrompt(lang) {
  var language = lang === "ar" ? "Arabic" : "English";
  return (
    "You are ELVA, a warm expert tutor. Respond ONLY in " + language + ". Always output ONLY valid JSON, no markdown, no extra text.\n" +
    "Guide the student with friendly questions and choices BEFORE teaching.\n" +
    "\nRESPONSE FORMAT - always return this exact JSON:\n" +
    JSON.stringify({ message: "your friendly message (1-3 sentences)", choices: ["choice 1", "choice 2", "choice 3"], ready: false }) + "\n" +
    "RULES:\n" +
    "- choices: 2-4 short clickable options (2-5 words each). Can be levels, topics, or subtopics.\n" +
    "- ready: true only when you have level + chosen subtopic. Message should say you will build the lesson now.\n" +
    "- Turn 1: ask level (Beginner/Intermediate/Advanced)\n" +
    "- Turn 2: offer specific subtopics as choices\n" +
    "- Turn 3: set ready=true\n" +
    "- choices=[] only when ready=true\n" +
    "- Keep messages warm and short like a real tutor"
  );
}

function makeLessonPrompt(lang) {
  var language = lang === "ar" ? "Arabic" : "English";
  var schema = JSON.stringify({
    reply: "warm 1-sentence message",
    topic: "lesson topic",
    slides: [{
      title: "slide title",
      content: "Deep explanation: definition + WHY it works + step-by-step breakdown + real-world connection. Min 6 sentences.",
      keypoints: ["specific point 1", "specific point 2", "specific point 3"],
      example: "FULLY WORKED example - a real solved problem not a description",
      tip: "one memory trick or common mistake for THIS concept only",
      emoji: "emoji",
      type: "intro|concept|definition|example|summary",
      narration: "friendly tutor voice 70-90 words"
    }],
    quiz: [{
      question: "tests real understanding not memorization",
      options: ["A", "B", "C", "D"],
      answer: "exact text of correct option copied character for character",
      explanation: "3-4 sentences: why correct + why others wrong"
    }],
    lesson_summary: "4-5 sentence summary",
    strong_points: ["concept 1", "concept 2", "concept 3"],
    weak_points: ["concept 1", "concept 2"],
    study_tips: ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
  });
  return (
    "You are ELVA, a world-class passionate tutor. Generate ALL content in " + language + " ONLY.\n" +
    "Build a DEEPLY DETAILED lesson based on the conversation (student level and chosen topic).\n\n" +
    "SLIDE RULES:\n" +
    "Slide 1 (intro): big-picture overview + 2-3 real examples showing WHERE this topic appears in real life.\n" +
    "All slides: content = definition + mechanism + breakdown + real connection. Min 6 sentences. NEVER vague.\n\n" +
    "EXAMPLE FIELD = a FULLY WORKED case, not a description:\n" +
    "QURAN/TAJWEED: state rule name, write exact Arabic words where rule applies, explain WHY step by step, 2 practice words.\n" +
    "MATH: write the full problem (e.g. solve 3x-5=10), solve step by step labeling each step.\n" +
    "PROGRAMMING: write 4-8 lines of actual working code then explain each line.\n" +
    "BIOLOGY: name exact molecule/organ/organism, exact process with real numbers and units.\n" +
    "PHYSICS: state the law, write formula, plug in real numbers and solve showing units.\n" +
    "HISTORY: exact year, person, place, what happened, immediate cause, long-term consequence.\n" +
    "CHEMISTRY: balanced equation, explain each reactant/product, give real application.\n\n" +
    "QUIZ: answer field must be copied EXACTLY from one of the 4 options - same spaces same punctuation.\n\n" +
    "Output ONLY valid JSON:\n" +
    schema + "\n" +
    "JSON RULES: 7-8 slides, exactly 5 quiz questions, NO newlines/tabs/unescaped-quotes in strings, ONLY JSON."
  );
}

export default function ElvaTutor() {
  var langArr = useState("ar");       var lang = langArr[0];           var setLang = langArr[1];
  var screenArr = useState("chat");   var screen = screenArr[0];       var setScreen = screenArr[1];
  var msgsArr = useState(null);       var messages = msgsArr[0];       var setMessages = msgsArr[1];
  var inputArr = useState("");        var input = inputArr[0];         var setInput = inputArr[1];
  var loadArr = useState(false);      var loading = loadArr[0];        var setLoading = loadArr[1];
  var lessonArr = useState(null);     var lesson = lessonArr[0];       var setLesson = lessonArr[1];
  var slideArr = useState(0);         var slide = slideArr[0];         var setSlide = slideArr[1];
  var speakArr = useState(false);     var speaking = speakArr[0];      var setSpeaking = speakArr[1];
  var xpArr = useState(120);          var xp = xpArr[0];               var setXp = xpArr[1];
  var qIdxArr = useState(0);          var qIdx = qIdxArr[0];           var setQIdx = qIdxArr[1];
  var selArr = useState(null);        var selected = selArr[0];        var setSelected = selArr[1];
  var chkArr = useState(false);       var checked = chkArr[0];         var setChecked = chkArr[1];
  var scoreArr = useState(0);         var score = scoreArr[0];         var setScore = scoreArr[1];
  var wrongsArr = useState([]);       var wrongs = wrongsArr[0];       var setWrongs = wrongsArr[1];
  var showProofArr = useState(false); var showProof = showProofArr[0]; var setShowProof = showProofArr[1];
  var proofTextArr = useState("");    var proofText = proofTextArr[0]; var setProofText = proofTextArr[1];
  var proofLoadArr = useState(false); var proofLoading = proofLoadArr[0]; var setProofLoading = proofLoadArr[1];
  var chatHistArr = useState([]);     var chatHistory = chatHistArr[0]; var setChatHistory = chatHistArr[1];
  var vpArr = useState(false);        var showVoicePicker = vpArr[0];  var setShowVoicePicker = vpArr[1];
  var svArr = useState(null);         var selectedVoice = svArr[0];    var setSelectedVoice = svArr[1];
  var avArr = useState([]);           var allVoices = avArr[0];        var setAllVoices = avArr[1];

  var streak = 3;
  var bottomRef = useRef(null);
  var synthRef = useRef(window.speechSynthesis);
  var t = T[lang];
  var isRTL = lang === "ar";

  useEffect(function() {
    setMessages([{ role:"assistant", text:T[lang].welcome, type:"welcome" }]);
  }, [lang]);

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  useEffect(function() {
    function loadVoices() {
      var v = window.speechSynthesis.getVoices();
      if (v.length > 0) setAllVoices(v);
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  function stopSpeech() { synthRef.current.cancel(); setSpeaking(false); }

  function speak(text, voiceOverride) {
    stopSpeech();
    var u = new SpeechSynthesisUtterance(text);
    var voices = synthRef.current.getVoices();
    var chosenVoice = voiceOverride || selectedVoice;
    if (chosenVoice) {
      u.voice = chosenVoice;
    } else {
      var langVoices = voices.filter(function(v) {
        return lang === "ar" ? v.lang.startsWith("ar") : v.lang.startsWith("en");
      });
      var premium = langVoices.find(function(v) {
        var n = v.name.toLowerCase();
        return n.includes("google") || n.includes("natural") || n.includes("online") ||
               n.includes("neural") || n.includes("enhanced") || n.includes("premium") ||
               n.includes("siri") || n.includes("samantha") || n.includes("karen");
      });
      u.voice = premium || langVoices[0] || null;
    }
    u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0;
    u.onstart = function() { setSpeaking(true); };
    u.onend   = function() { setSpeaking(false); };
    u.onerror = function() { setSpeaking(false); };
    synthRef.current.speak(u);
  }

  function speakSlide(sl) {
    if (!sl) return;
    var parts = [];
    if (sl.title) parts.push(sl.title + ".");
    if (sl.content) parts.push(sl.content);
    if (sl.example) parts.push((lang === "ar" ? "مثال: " : "Example: ") + sl.example);
    speak(parts.join(" "));
  }

  function previewVoice(voice) {
    stopSpeech();
    var u = new SpeechSynthesisUtterance(
      lang === "ar" ? "مرحباً! أنا إلفا مدرستك الذكية." : "Hello! I am ELVA your smart AI tutor."
    );
    u.voice = voice; u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }

  function switchLang() {
    stopSpeech(); setScreen("chat"); setLesson(null); setChatHistory([]);
    setLang(function(l) { return l === "ar" ? "en" : "ar"; });
  }

  async function callGroq(msgs, jsonMode, maxTok) {
    var body = {
      model: "llama-3.3-70b-versatile",
      temperature: jsonMode ? 0.3 : 0.7,
      max_tokens: maxTok || 4000,
      messages: msgs
    };
    if (jsonMode) body.response_format = { type: "json_object" };
    var r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
      body: JSON.stringify(body)
    });
    var d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.choices[0].message.content || "";
  }

  async function buildLesson(history) {
    setLoading(true);
    try {
      var msgs = [{ role:"system", content:makeLessonPrompt(lang) }].concat(history);
      var raw = await callGroq(msgs, true, 4000);
      var clean = raw.replace(/```json/g,"").replace(/```/g,"").trim();
      var s = clean.indexOf("{"); var e = clean.lastIndexOf("}");
      if (s !== -1 && e !== -1) clean = clean.slice(s, e+1);
      var parsed;
      try { parsed = JSON.parse(clean); } catch(err) { throw new Error("JSON parse failed: " + err.message); }
      if (!parsed.slides) throw new Error("No slides");
      setMessages(function(p) {
        return [...p, { role:"assistant", text:parsed.reply||(lang==="ar"?"الدرس جاهز! 🎉":"Lesson ready! 🎉"), type:"lesson-ready", lessonData:parsed }];
      });
      setXp(function(x) { return x+20; });
    } catch(err) {
      setMessages(function(p) { return [...p, { role:"assistant", text:"Error: "+err.message, type:"error" }]; });
    } finally { setLoading(false); }
  }

  async function send(text) {
    var txt = text || input.trim();
    if (!txt || loading) return;
    setInput("");
    setMessages(function(p) { return [...p, { role:"user", text:txt }]; });
    var newHistory = chatHistory.concat([{ role:"user", content:txt }]);
    setChatHistory(newHistory);
    setLoading(true);
    try {
      var msgs = [{ role:"system", content:makeTutorSystemPrompt(lang) }].concat(newHistory);
      var raw = await callGroq(msgs, true, 500);
      var tutorData = { message:raw, choices:[], ready:false };
      try {
        var c = raw.replace(/```json/g,"").replace(/```/g,"").trim();
        var si = c.indexOf("{"); var ei = c.lastIndexOf("}");
        if (si !== -1 && ei !== -1) tutorData = JSON.parse(c.slice(si, ei+1));
      } catch(_) {}
      var updatedHistory = newHistory.concat([{ role:"assistant", content:tutorData.message }]);
      setChatHistory(updatedHistory);
      setMessages(function(p) {
        return [...p, { role:"assistant", text:tutorData.message, choices:tutorData.choices||[], type:"tutor-question" }];
      });
      setLoading(false);
      if (tutorData.ready) setTimeout(function() { buildLesson(updatedHistory); }, 600);
    } catch(err) {
      setMessages(function(p) { return [...p, { role:"assistant", text:"Error: "+err.message, type:"error" }]; });
      setLoading(false);
    }
  }

  function openLesson(d) {
    setLesson(d); setSlide(0); setScreen("lesson");
    setQIdx(0); setSelected(null); setChecked(false); setScore(0); setWrongs([]); setShowProof(false);
    setTimeout(function() { if (d.slides[0]) speakSlide(d.slides[0]); }, 600);
  }

  function goSlide(i) {
    stopSpeech(); setSlide(i);
    if (lesson.slides[i]) setTimeout(function() { speakSlide(lesson.slides[i]); }, 300);
  }

  function closeLesson() { stopSpeech(); setScreen("chat"); setLesson(null); }

  async function fetchProof(question, answer, explanation) {
    setShowProof(true); setProofText(""); setProofLoading(true);
    var langWord = lang === "ar" ? "Arabic" : "English";
    var prompt = "In " + langWord + ", give a step-by-step proof for why this answer is correct.\nQuestion: " + question + "\nCorrect answer: " + answer + "\nContext: " + explanation + "\nWrite numbered steps. Plain text only.";
    try {
      var res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+GROQ_KEY },
        body: JSON.stringify({ model:"llama-3.3-70b-versatile", temperature:0.5, max_tokens:600, messages:[{ role:"user", content:prompt }] })
      });
      var data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setProofText(data.choices[0].message.content || "");
    } catch(err) { setProofText("Error: "+err.message); }
    finally { setProofLoading(false); }
  }

  function norm(s) { return (s||"").trim().toLowerCase().replace(/\s+/g," "); }

  function checkAnswer() {
    if (!selected) return;
    setChecked(true); setShowProof(false); setProofText(""); setProofLoading(false);
    var q = lesson.quiz[qIdx];
    if (norm(selected) === norm(q.answer)) {
      setScore(function(s) { return s+1; });
    } else {
      setWrongs(function(w) { return [...w, q.question]; });
    }
  }

  function nextQuestion() {
    if (qIdx < lesson.quiz.length-1) {
      setQIdx(function(q) { return q+1; }); setSelected(null); setChecked(false);
      setShowProof(false); setProofText(""); setProofLoading(false);
    } else { setScreen("report"); }
  }

  var level = Math.floor(xp/100)+1;
  var xpProg = xp%100;
  function md(s) { return s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>"); }

  // ── REPORT SCREEN ────────────────────────────────────────────
  if (screen === "report" && lesson) {
    var total = lesson.quiz ? lesson.quiz.length : 0;
    var pct = total > 0 ? Math.round((score/total)*100) : 0;
    var lvlInfo = getLevelInfo(pct, lang);
    return (
      <div style={Object.assign({}, S.root, { direction:isRTL?"rtl":"ltr", alignItems:"flex-start", padding:20, overflowY:"auto" })}>
        <div style={S.orb1}></div><div style={S.orb2}></div>
        <div style={S.reportWrap}>
          <div style={S.reportHeader}>
            <div style={{ fontSize:48 }}>{lvlInfo.icon}</div>
            <div>
              <h2 style={S.reportTitle}>{t.reportTitle}</h2>
              <p style={{ color:"rgba(167,139,250,.6)", fontSize:13 }}>{lesson.topic||"Lesson"}</p>
            </div>
          </div>
          <div style={S.statsRow}>
            <div style={S.statCard}>
              <div style={S.statNum}>{score}/{total}</div>
              <div style={S.statLabel}>{t.score}</div>
              <div style={S.statBar}>
                <div style={{ height:"100%", width:pct+"%", background:"linear-gradient(90deg,#7c3aed,#3b82f6)", borderRadius:4, transition:"width 1s ease" }}></div>
              </div>
              <div style={{ color:lvlInfo.color, fontSize:13, fontWeight:700 }}>{pct}%</div>
            </div>
            <div style={S.statCard}>
              <div style={{ fontSize:36 }}>{lvlInfo.icon}</div>
              <div style={Object.assign({}, S.statNum, { color:lvlInfo.color, fontSize:18 })}>{lvlInfo.label}</div>
              <div style={S.statLabel}>{t.level}</div>
            </div>
            <div style={S.statCard}>
              <div style={{ fontSize:36 }}>🎯</div>
              <div style={Object.assign({}, S.statNum, { color:lvlInfo.focusColor, fontSize:16 })}>{lvlInfo.focus}</div>
              <div style={S.statLabel}>{t.focus}</div>
            </div>
          </div>
          <div style={S.reportSection}>
            <div style={S.sectionTitle}>📖 {t.summary}</div>
            <p style={S.summaryText}>{lesson.lesson_summary||""}</p>
          </div>
          <div style={S.twoCol}>
            <div style={Object.assign({}, S.reportSection, { flex:1 })}>
              <div style={Object.assign({}, S.sectionTitle, { color:"#34d399" })}>✅ {t.strengths}</div>
              {(lesson.strong_points||[]).map(function(p,i){ return <div key={i} style={S.pointItem}><span style={{ color:"#34d399" }}>•</span> {p}</div>; })}
            </div>
            <div style={Object.assign({}, S.reportSection, { flex:1 })}>
              <div style={Object.assign({}, S.sectionTitle, { color:"#f87171" })}>📌 {t.improve}</div>
              {(lesson.weak_points||[]).map(function(p,i){ return <div key={i} style={S.pointItem}><span style={{ color:"#f87171" }}>•</span> {p}</div>; })}
              {wrongs.length > 0 && wrongs.map(function(q,i){ return <div key={"w"+i} style={Object.assign({}, S.pointItem, { fontSize:12, opacity:.7 })}><span style={{ color:"#f87171" }}>•</span> {q}</div>; })}
            </div>
          </div>
          {lesson.study_tips && lesson.study_tips.length > 0 && (
            <div style={S.reportSection}>
              <div style={Object.assign({}, S.sectionTitle, { color:"#fbbf24" })}>💡 {lang==="ar"?"نصايح للتطوير":"Study Tips"}</div>
              {lesson.study_tips.map(function(tip,i){
                return (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ color:"#fbbf24", fontSize:13, marginTop:2 }}>→</span>
                    <p style={{ fontSize:13, color:"rgba(226,232,240,0.8)", lineHeight:1.7 }}>{tip}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div style={S.xpGained}>
            <span style={{ fontSize:20 }}>⭐</span>
            <span style={{ color:"#fbbf24", fontWeight:700, fontSize:16 }}>+{20+score*10} XP {lang==="ar"?"اكتسبت":"Earned"}</span>
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button style={S.reportBtn} onClick={closeLesson}>{t.backToChat}</button>
            <button style={Object.assign({}, S.reportBtn, { background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.4)" })}
              onClick={function() { openLesson(lesson); }}>{t.tryAgain}</button>
          </div>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ── QUIZ SCREEN ─────────────────────────────────────────────
  if (screen === "quiz" && lesson && lesson.quiz) {
    var q = lesson.quiz[qIdx];
    var isCorrect = checked && norm(selected) === norm(q.answer);
    return (
      <div style={Object.assign({}, S.root, { direction:isRTL?"rtl":"ltr" })}>
        <div style={S.orb1}></div><div style={S.orb2}></div>
        <div style={S.lessonWrap}>
          <div style={S.lessonBar}>
            <button style={S.backBtn} onClick={closeLesson}>{t.back}</button>
            <span style={S.lessonTitle}>{t.quizTitle}</span>
            <span style={S.slideCount}>{qIdx+1} / {lesson.quiz.length}</span>
          </div>
          <div style={S.progTrack}>
            <div style={Object.assign({}, S.progFill, { width:((qIdx+1)/lesson.quiz.length*100)+"%" })}></div>
          </div>
          <div style={S.quizCard}>
            <p style={S.quizQ}>{q.question}</p>
            <div style={S.optionsWrap}>
              {q.options.map(function(opt,i) {
                var bg="rgba(124,58,237,0.07)", border="1px solid rgba(124,58,237,0.2)", color="#e2e8f0";
                if (checked) {
                  if (norm(opt)===norm(q.answer)) { bg="rgba(16,185,129,0.2)"; border="1px solid #10b981"; color="#34d399"; }
                  else if (norm(opt)===norm(selected)) { bg="rgba(239,68,68,0.2)"; border="1px solid #ef4444"; color="#f87171"; }
                } else if (norm(opt)===norm(selected)) { bg="rgba(124,58,237,0.25)"; border="1px solid #a78bfa"; }
                return (
                  <button key={i} style={Object.assign({}, S.optBtn, { background:bg, border:border, color:color })}
                    onClick={function() { if (!checked) setSelected(opt); }}>{opt}</button>
                );
              })}
            </div>
            {checked && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={Object.assign({}, S.feedbackBox, {
                  background:isCorrect?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",
                  borderColor:isCorrect?"#10b981":"#ef4444"
                })}>
                  <p style={{ color:isCorrect?"#34d399":"#f87171", fontWeight:800, fontSize:16, marginBottom:6 }}>
                    {isCorrect ? t.correct : t.wrong + q.answer}
                  </p>
                  <p style={{ color:"rgba(226,232,240,0.85)", fontSize:13, lineHeight:1.7 }}>{q.explanation}</p>
                </div>
                {!showProof && (
                  <button onClick={function() { fetchProof(q.question, q.answer, q.explanation); }}
                    style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:12, color:"#fbbf24", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:13, padding:"9px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, width:"100%", justifyContent:"center" }}>
                    <span>📐</span><span>{t.proofLabel}</span>
                  </button>
                )}
                {showProof && (
                  <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:14, padding:"16px 20px", animation:"in .3s ease" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, paddingBottom:10, borderBottom:"1px solid rgba(245,158,11,0.15)" }}>
                      <span style={{ fontSize:20 }}>📐</span>
                      <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:13, color:"#fbbf24", letterSpacing:1 }}>{t.proofLabel}</span>
                    </div>
                    {proofLoading ? (
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block", animation:"pulse 1.2s ease-in-out infinite" }}></span>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block", animation:"pulse 1.2s ease-in-out .2s infinite" }}></span>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block", animation:"pulse 1.2s ease-in-out .4s infinite" }}></span>
                        <span style={{ fontSize:12, color:"rgba(251,191,36,.6)", marginLeft:4 }}>{lang==="ar"?"جارٍ توليد الإثبات...":"Generating proof..."}</span>
                      </div>
                    ) : (
                      <p style={{ fontSize:13.5, color:"rgba(226,232,240,0.88)", lineHeight:2, whiteSpace:"pre-line", textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr" }}>{proofText}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={S.controls}>
            {!checked
              ? <button style={Object.assign({}, S.navBtn, { background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff", opacity:selected?1:0.4 })} onClick={checkAnswer}>{t.quizCheck}</button>
              : <button style={Object.assign({}, S.navBtn, { background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff" })} onClick={nextQuestion}>
                  {qIdx < lesson.quiz.length-1 ? t.quizNext : t.quizFinish}
                </button>
            }
          </div>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ── LESSON SCREEN ────────────────────────────────────────────
  if (screen === "lesson" && lesson) {
    var sl = lesson.slides[slide];
    var col = COLORS[sl && sl.type] || COLORS.concept;
    var pct = ((slide+1)/lesson.slides.length)*100;
    var isLast = slide === lesson.slides.length-1;
    return (
      <div style={Object.assign({}, S.root, { direction:isRTL?"rtl":"ltr" })}>
        <div style={S.orb1}></div><div style={S.orb2}></div>
        <div style={S.lessonWrap}>
          <div style={S.lessonBar}>
            <button style={S.backBtn} onClick={closeLesson}>{t.back}</button>
            <span style={S.lessonTitle}>{lesson.topic||t.lessonTitle}</span>
            <span style={S.slideCount}>{slide+1} / {lesson.slides.length}</span>
          </div>
          <div style={S.progTrack}><div style={Object.assign({}, S.progFill, { width:pct+"%" })}></div></div>
          <div style={Object.assign({}, S.slideCard, { background:col.bg, borderColor:col.border })}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <span style={{ fontSize:48 }}>{sl&&sl.emoji}</span>
              <div>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:3, color:col.accent, fontFamily:"Syne,sans-serif" }}>{col.label}</div>
                <h2 style={S.slideH}>{sl&&sl.title}</h2>
              </div>
            </div>
            <p style={Object.assign({}, S.slideP, { textAlign:isRTL?"right":"left" })}>{sl&&sl.content}</p>
            {sl&&sl.keypoints&&sl.keypoints.length>0&&(
              <div style={S.keypointsBox}>
                {sl.keypoints.map(function(kp,i){
                  return (
                    <div key={i} style={S.keypoint}>
                      <span style={{ color:col.accent, marginLeft:isRTL?8:0, marginRight:isRTL?0:8 }}>▸</span>
                      {kp}
                    </div>
                  );
                })}
              </div>
            )}
            {sl&&sl.example&&(
              <div style={{ marginTop:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 16px", borderLeft:"3px solid "+col.accent }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:col.accent, marginBottom:6, fontFamily:"Syne,sans-serif" }}>
                  {lang==="ar"?"✏️ مثال محلول":"✏️ WORKED EXAMPLE"}
                </div>
                <p style={{ fontSize:13, color:"rgba(226,232,240,0.9)", lineHeight:1.9, fontFamily:"monospace", whiteSpace:"pre-wrap", textAlign:isRTL?"right":"left" }}>{sl.example}</p>
              </div>
            )}
            {sl&&sl.tip&&(
              <div style={{ marginTop:8, background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:16 }}>💡</span>
                <p style={{ fontSize:12, color:"rgba(251,191,36,0.9)", lineHeight:1.7, textAlign:isRTL?"right":"left" }}>{sl.tip}</p>
              </div>
            )}
          </div>
          <div style={S.narrationBox}>
            <div style={S.narLabel}>{t.narrationLabel}</div>
            <p style={Object.assign({}, S.narText, { textAlign:isRTL?"right":"left" })}>{sl&&sl.narration}</p>
          </div>
          <div style={S.dots}>
            {lesson.slides.map(function(_,i){
              return (
                <div key={i} onClick={function(){ goSlide(i); }}
                  style={Object.assign({}, S.dotEl, { background:i===slide?"#a78bfa":"rgba(167,139,250,0.2)", transform:i===slide?"scale(1.4)":"scale(1)" })}></div>
              );
            })}
          </div>
          <div style={S.controls}>
            <button style={Object.assign({}, S.navBtn, { opacity:slide===0?0.3:1 })}
              onClick={function(){ if(slide>0) goSlide(slide-1); }}>{t.prev}</button>
            <button style={Object.assign({}, S.voiceBtn, {
              background:speaking?"rgba(239,68,68,.2)":"rgba(124,58,237,.2)",
              borderColor:speaking?"#ef4444":"#7c3aed"
            })} onClick={function(){ if(speaking){ stopSpeech(); } else { speakSlide(sl); } }}>
              {speaking?t.stop:t.listen}
            </button>
            <button style={Object.assign({}, S.navBtn, isLast?{ background:"rgba(16,185,129,.2)", borderColor:"#10b981", color:"#34d399" }:{})}
              onClick={function(){ if(isLast){ stopSpeech(); setScreen("quiz"); } else { goSlide(slide+1); } }}>
              {isLast?t.done:t.next}
            </button>
          </div>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ── CHAT SCREEN ──────────────────────────────────────────────
  if (!messages) return null;
  return (
    <div style={Object.assign({}, S.root, { direction:isRTL?"rtl":"ltr" })}>
      <div style={S.orb1}></div><div style={S.orb2}></div>
      <div style={S.container}>
        <header style={S.header}>
          <div style={S.logo}>
            <div style={S.logoIcon}>E</div>
            <div><div style={S.logoName}>ELVA</div><div style={S.logoSub}>{t.subtitle}</div></div>
          </div>
          <div style={S.headerRight}>
            <div style={S.pill}>🔥 {streak}</div>
            <div style={S.pill}>⭐ {xp}</div>
            <div style={S.lvl}>LV{level}</div>
            <button style={S.langBtn} onClick={switchLang}>{t.toggleLang}</button>
            <button onClick={function(){ setShowVoicePicker(function(p){ return !p; }); }} style={{
              background:showVoicePicker?"rgba(251,191,36,.25)":"rgba(251,191,36,.1)",
              border:"1px solid rgba(251,191,36,.35)", color:"#fbbf24",
              fontSize:13, fontWeight:700, padding:"4px 12px", borderRadius:20, cursor:"pointer", fontFamily:"Nunito,sans-serif"
            }}>🎙️</button>
          </div>
        </header>
        <div style={S.xpTrack}><div style={Object.assign({}, S.xpFill, { width:xpProg+"%" })}></div></div>
        {showVoicePicker && (
          <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(139,92,246,.12)", background:"rgba(8,8,20,.85)", display:"flex", flexDirection:"column", gap:10, flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:"#fbbf24", fontFamily:"Syne,sans-serif" }}>
              🎙️ {lang==="ar"?"اختار صوت إلفا":"CHOOSE ELVA VOICE"}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, maxHeight:120, overflowY:"auto" }}>
              {allVoices.filter(function(v){ return lang==="ar"?v.lang.startsWith("ar"):v.lang.startsWith("en"); })
                .map(function(v,i){
                  var isSel = selectedVoice && selectedVoice.name===v.name;
                  var isPrem = ["google","natural","online","neural","enhanced","premium","siri","samantha","karen"].some(function(k){ return v.name.toLowerCase().includes(k); });
                  return (
                    <button key={i} onClick={function(){ setSelectedVoice(v); previewVoice(v); }}
                      style={{ background:isSel?"rgba(124,58,237,.35)":"rgba(124,58,237,.07)", border:isSel?"1px solid #a78bfa":"1px solid rgba(124,58,237,.2)", borderRadius:10, color:isSel?"#fff":"#c4b5fd", fontSize:11, fontWeight:600, padding:"5px 10px", cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>
                      {isPrem?"⭐":"🔈"} {v.name.replace("Microsoft ","").replace("Google ","").split(" ").slice(0,3).join(" ")}
                    </button>
                  );
                })}
              {allVoices.filter(function(v){ return lang==="ar"?v.lang.startsWith("ar"):v.lang.startsWith("en"); }).length===0 && (
                <p style={{ fontSize:12, color:"rgba(167,139,250,.5)" }}>{lang==="ar"?"لا توجد أصوات":"No voices yet - click 🎙️ again"}</p>
              )}
            </div>
            {selectedVoice && <div style={{ fontSize:11, color:"rgba(52,211,153,.8)", fontWeight:600 }}>✅ {selectedVoice.name}</div>}
          </div>
        )}
        <div style={S.chips}>
          {t.subjects.map(function(s){
            return (
              <button key={s.label} style={S.chip}
                onClick={function(){ send(s.prompt); }}
                onMouseEnter={function(e){ e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={function(e){ e.currentTarget.style.transform="translateY(0)"; }}>
                {s.icon} {s.label}
              </button>
            );
          })}
        </div>
        <div style={S.chat}>
          {messages.map(function(msg,i){
            var isLast = i===messages.length-1;
            return (
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:8, animation:"in .3s ease" }}>
                <div style={msg.role==="user"?S.userRow:S.botRow}>
                  {msg.role==="assistant"&&<div style={S.elvaAv}>E</div>}
                  <div style={msg.role==="user"?S.userBubble:S.botBubble}>
                    <span dangerouslySetInnerHTML={{ __html:md(msg.text) }} />
                    {msg.type==="lesson-ready"&&msg.lessonData&&(
                      <button style={S.openBtn} onClick={function(){ openLesson(msg.lessonData); }}>{t.openLesson}</button>
                    )}
                  </div>
                  {msg.role==="user"&&<div style={S.userAv}>👤</div>}
                </div>
                {msg.choices&&msg.choices.length>0&&isLast&&!loading&&(
                  <div style={{ paddingRight:isRTL?0:48, paddingLeft:isRTL?48:0, display:"flex", flexWrap:"wrap", gap:8 }}>
                    {msg.choices.map(function(choice,ci){
                      return (
                        <button key={ci} onClick={function(){ send(choice); }}
                          style={{ background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:20, color:"#c4b5fd", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:13, padding:"8px 18px", cursor:"pointer", transition:"all .2s" }}
                          onMouseEnter={function(e){ e.currentTarget.style.background="rgba(124,58,237,0.28)"; e.currentTarget.style.color="#fff"; }}
                          onMouseLeave={function(e){ e.currentTarget.style.background="rgba(124,58,237,0.12)"; e.currentTarget.style.color="#c4b5fd"; }}>
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {loading&&(
            <div style={S.botRow}>
              <div style={S.elvaAv}>E</div>
              <div style={Object.assign({}, S.botBubble, { display:"flex", alignItems:"center", gap:6 })}>
                <span style={S.d1}></span><span style={S.d2}></span><span style={S.d3}></span>
                <span style={{ fontSize:12, color:"rgba(167,139,250,.5)" }}>{t.loading}</span>
              </div>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>
        <div style={S.inputArea}>
          <div style={S.inputWrap}>
            {isRTL&&(
              <button onClick={function(){ send(); }} disabled={loading||!input.trim()}
                style={Object.assign({}, S.sendBtn, { opacity:loading||!input.trim()?0.35:1 })}>🚀</button>
            )}
            <textarea value={input}
              onChange={function(e){ setInput(e.target.value); }}
              onKeyDown={function(e){ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}
              placeholder={t.placeholder}
              style={Object.assign({}, S.textarea, { textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr" })}
              rows={1} />
            {!isRTL&&(
              <button onClick={function(){ send(); }} disabled={loading||!input.trim()}
                style={Object.assign({}, S.sendBtn, { opacity:loading||!input.trim()?0.35:1 })}>🚀</button>
            )}
          </div>
          <p style={S.hint}>{t.hint}</p>
        </div>
      </div>
      <GlobalCSS />
    </div>
  );
}

function GlobalCSS() {
  return React.createElement("style", null, `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    @keyframes f1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
    @keyframes f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
    @keyframes pulse { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
    @keyframes glow { 0%,100%{box-shadow:0 0 8px #7c3aed} 50%{box-shadow:0 0 24px #a855f7} }
    @keyframes in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    textarea:focus { outline:none; }
    textarea::placeholder { color:rgba(148,163,184,.4); }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:rgba(139,92,246,.3); border-radius:2px; }
  `);
}

var S = {
  root:{ fontFamily:"Nunito,sans-serif", background:"#070711", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:16 },
  orb1:{ position:"fixed", top:"-10%", left:"-5%", width:500, height:500, background:"radial-gradient(circle,rgba(124,58,237,.13) 0%,transparent 70%)", borderRadius:"50%", animation:"f1 8s ease-in-out infinite", pointerEvents:"none" },
  orb2:{ position:"fixed", bottom:"-10%", right:"-5%", width:600, height:600, background:"radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 70%)", borderRadius:"50%", animation:"f2 10s ease-in-out infinite", pointerEvents:"none" },
  container:{ width:"100%", maxWidth:780, display:"flex", flexDirection:"column", height:"92vh", background:"rgba(13,13,26,.9)", backdropFilter:"blur(24px)", border:"1px solid rgba(139,92,246,.18)", borderRadius:24, overflow:"hidden", boxShadow:"0 0 100px rgba(124,58,237,.07)", zIndex:1 },
  header:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 22px", borderBottom:"1px solid rgba(139,92,246,.12)", background:"rgba(8,8,20,.7)" },
  logo:{ display:"flex", alignItems:"center", gap:10 },
  logoIcon:{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"#fff", animation:"glow 3s ease-in-out infinite", flexShrink:0 },
  logoName:{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"#fff", letterSpacing:1 },
  logoSub:{ fontSize:10, color:"rgba(167,139,250,.6)" },
  headerRight:{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" },
  pill:{ background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", color:"#c4b5fd", fontSize:12, padding:"4px 10px", borderRadius:20 },
  lvl:{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:12, padding:"4px 12px", borderRadius:20 },
  langBtn:{ background:"rgba(16,185,129,.12)", border:"1px solid rgba(16,185,129,.3)", color:"#34d399", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, cursor:"pointer", fontFamily:"Nunito,sans-serif" },
  xpTrack:{ height:3, background:"rgba(139,92,246,.08)", flexShrink:0 },
  xpFill:{ height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7,#3b82f6)", transition:"width .6s ease", boxShadow:"0 0 8px rgba(124,58,237,.6)" },
  chips:{ display:"flex", gap:8, padding:"10px 18px", overflowX:"auto", flexShrink:0, borderBottom:"1px solid rgba(255,255,255,.03)" },
  chip:{ display:"flex", alignItems:"center", gap:5, background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.18)", color:"#a78bfa", fontSize:12, fontWeight:600, padding:"5px 13px", borderRadius:20, cursor:"pointer", whiteSpace:"nowrap", transition:"transform .2s", fontFamily:"Nunito,sans-serif" },
  chat:{ flex:1, overflowY:"auto", padding:"18px", display:"flex", flexDirection:"column", gap:14 },
  userRow:{ display:"flex", justifyContent:"flex-end", alignItems:"flex-end", gap:8 },
  botRow:{ display:"flex", justifyContent:"flex-start", alignItems:"flex-start", gap:8 },
  elvaAv:{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15, color:"#fff", flexShrink:0 },
  userAv:{ width:34, height:34, borderRadius:10, background:"rgba(59,130,246,.15)", border:"1px solid rgba(59,130,246,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 },
  botBubble:{ maxWidth:"80%", background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.14)", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", color:"#e2e8f0", fontSize:14, lineHeight:1.75 },
  userBubble:{ maxWidth:"75%", background:"linear-gradient(135deg,rgba(124,58,237,.28),rgba(59,130,246,.18))", border:"1px solid rgba(124,58,237,.28)", borderRadius:"16px 4px 16px 16px", padding:"11px 15px", color:"#f1f5f9", fontSize:14, lineHeight:1.65 },
  openBtn:{ display:"block", marginTop:12, width:"100%", background:"linear-gradient(135deg,#7c3aed,#3b82f6)", border:"none", borderRadius:12, color:"#fff", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:14, padding:"10px", cursor:"pointer" },
  d1:{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#7c3aed", animation:"pulse 1.2s ease-in-out infinite" },
  d2:{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#7c3aed", animation:"pulse 1.2s ease-in-out .2s infinite" },
  d3:{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#7c3aed", animation:"pulse 1.2s ease-in-out .4s infinite" },
  inputArea:{ padding:"14px 18px", borderTop:"1px solid rgba(139,92,246,.1)", background:"rgba(8,8,20,.6)", flexShrink:0 },
  inputWrap:{ display:"flex", gap:8, alignItems:"flex-end" },
  textarea:{ flex:1, background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.22)", borderRadius:14, padding:"11px 16px", color:"#f1f5f9", fontSize:14, lineHeight:1.5, resize:"none", fontFamily:"Nunito,sans-serif" },
  sendBtn:{ width:46, height:46, borderRadius:13, flexShrink:0, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", border:"none", cursor:"pointer", fontSize:20 },
  hint:{ marginTop:7, color:"rgba(148,163,184,.3)", fontSize:11, textAlign:"center" },
  lessonWrap:{ width:"100%", maxWidth:720, display:"flex", flexDirection:"column", gap:14, zIndex:1, maxHeight:"95vh", overflowY:"auto", padding:"0 8px" },
  lessonBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(13,13,26,.9)", backdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,.18)", borderRadius:16, padding:"12px 20px" },
  backBtn:{ background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", color:"#a78bfa", padding:"6px 14px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"Nunito,sans-serif", fontWeight:600 },
  lessonTitle:{ fontFamily:"Syne,sans-serif", fontWeight:800, color:"#fff", fontSize:15 },
  slideCount:{ color:"rgba(167,139,250,.6)", fontSize:13 },
  progTrack:{ height:4, background:"rgba(139,92,246,.1)", borderRadius:4, overflow:"hidden" },
  progFill:{ height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7)", transition:"width .5s ease", boxShadow:"0 0 10px rgba(124,58,237,.6)", borderRadius:4 },
  slideCard:{ border:"1px solid", borderRadius:24, padding:"28px 32px", display:"flex", flexDirection:"column", gap:12, animation:"in .4s ease", backdropFilter:"blur(12px)" },
  slideH:{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:21, color:"#f1f5f9", lineHeight:1.3 },
  slideP:{ fontSize:14, color:"rgba(226,232,240,.88)", lineHeight:2 },
  keypointsBox:{ marginTop:8, display:"flex", flexDirection:"column", gap:6, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:12 },
  keypoint:{ fontSize:13, color:"rgba(226,232,240,.75)", display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.6 },
  narrationBox:{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,.15)", borderRadius:14, padding:"12px 18px" },
  narLabel:{ fontSize:10, color:"rgba(167,139,250,.5)", fontWeight:700, letterSpacing:1, marginBottom:6 },
  narText:{ fontSize:13, color:"rgba(226,232,240,.7)", lineHeight:1.8 },
  dots:{ display:"flex", gap:8, justifyContent:"center" },
  dotEl:{ width:8, height:8, borderRadius:"50%", cursor:"pointer", transition:"all .3s" },
  controls:{ display:"flex", gap:12, justifyContent:"center", alignItems:"center", paddingBottom:8 },
  navBtn:{ background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", color:"#a78bfa", padding:"10px 24px", borderRadius:12, cursor:"pointer", fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:700 },
  voiceBtn:{ border:"1px solid", color:"#fff", padding:"10px 24px", borderRadius:12, cursor:"pointer", fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:700, transition:"all .3s" },
  quizCard:{ background:"rgba(13,13,26,.8)", border:"1px solid rgba(139,92,246,.2)", borderRadius:20, padding:"28px 24px", display:"flex", flexDirection:"column", gap:16 },
  quizQ:{ fontSize:16, color:"#f1f5f9", fontWeight:700, lineHeight:1.6, fontFamily:"Syne,sans-serif" },
  optionsWrap:{ display:"flex", flexDirection:"column", gap:10 },
  optBtn:{ padding:"12px 18px", borderRadius:12, cursor:"pointer", fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:600, textAlign:"left", transition:"all .2s" },
  feedbackBox:{ border:"1px solid", borderRadius:14, padding:"14px 18px" },
  reportWrap:{ width:"100%", maxWidth:720, display:"flex", flexDirection:"column", gap:18, zIndex:1 },
  reportHeader:{ display:"flex", alignItems:"center", gap:16, background:"rgba(13,13,26,.9)", border:"1px solid rgba(139,92,246,.18)", borderRadius:20, padding:"20px 24px" },
  reportTitle:{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:"#fff" },
  statsRow:{ display:"flex", gap:14 },
  statCard:{ flex:1, background:"rgba(13,13,26,.8)", border:"1px solid rgba(139,92,246,.15)", borderRadius:16, padding:"18px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 },
  statNum:{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:26, color:"#fff" },
  statLabel:{ fontSize:11, color:"rgba(167,139,250,.6)", fontWeight:600, letterSpacing:1 },
  statBar:{ width:"100%", height:6, background:"rgba(139,92,246,.15)", borderRadius:4, overflow:"hidden" },
  reportSection:{ background:"rgba(13,13,26,.8)", border:"1px solid rgba(139,92,246,.12)", borderRadius:16, padding:"18px 20px", display:"flex", flexDirection:"column", gap:10 },
  sectionTitle:{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#a78bfa", letterSpacing:.5 },
  summaryText:{ fontSize:14, color:"rgba(226,232,240,.8)", lineHeight:1.9 },
  twoCol:{ display:"flex", gap:14 },
  pointItem:{ fontSize:13, color:"rgba(226,232,240,.75)", lineHeight:1.7, display:"flex", gap:6 },
  xpGained:{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"rgba(251,191,36,.08)", border:"1px solid rgba(251,191,36,.25)", borderRadius:14, padding:"14px" },
  reportBtn:{ background:"linear-gradient(135deg,#7c3aed,#3b82f6)", border:"none", borderRadius:14, color:"#fff", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:15, padding:"12px 32px", cursor:"pointer" },
};