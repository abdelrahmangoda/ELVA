//constants.js
// ─────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────
export const GROQ_KEY    = "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";
export const GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
export const MODEL_HEAVY = "llama-3.3-70b-versatile";
export const MODEL_FAST  = "llama-3.1-8b-instant";
export const MEM_KEY     = "elva_student_v2";

// ─────────────────────────────────────────────
// SLIDE TYPE → CSS class prefix mapping
// ─────────────────────────────────────────────
export const COLORS = {
  intro:      { label: "INTRO",      varPrefix: "intro"      },
  concept:    { label: "CONCEPT",    varPrefix: "concept"    },
  example:    { label: "EXAMPLE",    varPrefix: "example"    },
  definition: { label: "DEFINITION", varPrefix: "definition" },
  summary:    { label: "SUMMARY",    varPrefix: "summary"    },
};

// ─────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────
export const T = {
  en: {
    subtitle: "AI Tutor — ELVA",
    welcome: "Hi! I'm ELVA, your personal AI tutor 👋\n\nWhat would you like to learn today? Tell me any subject and I'll ask you a few quick questions first so I can teach it perfectly for your level!",
    placeholder: "Tell me what you want to learn...",
    hint: "Press Enter to send · +20 XP per lesson",
    openLesson: "🚀 Start Full Lesson",
    lessonTitle: "ELVA Lesson",
    back: "← Back",
    listen: "🔊 Listen",
    stop: "⏹ Stop",
    prev: "← Prev",
    next: "Next →",
    done: "Start Quiz 🎯",
    narrationLabel: "SLIDE NARRATION",
    toggleLang: "AR",
    quizTitle: "Quiz Time 🎯",
    quizCheck: "Submit Answer",
    quizNext: "Next Question →",
    quizFinish: "See Results 🏆",
    correct: "✅ Correct!",
    wrong: "❌ Wrong! Correct answer: ",
    proofLabel: "📐 Step-by-step Explanation",
    reportTitle: "Your Performance Report",
    score: "QUIZ SCORE",
    level: "YOUR LEVEL",
    focus: "FOCUS",
    summary: "Lesson Summary",
    strengths: "Strong Points",
    improve: "Needs Improvement",
    backToChat: "← Back to Chat",
    tryAgain: "Try Again 🔄",
    checkInTitle: "Quick Check ✏️",
    checkInCorrect: "✅ Great! Keep going.",
    checkInWrong: "❌ Let's review that slide again.",
    nextStep: "What's Next?",
    slideChatPlaceholder: "Ask ELVA... e.g. 'explain more', 'another example'",
    slideChatUpdating: "Updating slide...",
    slideChatHint: "↩ Enter to ask · tap 🎤 to speak",
    quizLoading: "Building fresh quiz questions... 🎯",
    voiceTap: "🎤 Tap to speak",
    voiceListening: "🔴 Listening...",
    voiceProcessing: "Processing...",
    voiceError: "Microphone not available",
    voiceNotSupported: "Voice not supported in this browser",
    voiceAnswerHint: "🎤 Tap to speak answer",
    voiceJudging: "ELVA is judging...",
    voiceTapStop: "🔴 Tap to stop",
    loadingSteps: [
      "Building your lesson... 🧱",
      "Writing deep examples... ✏️",
      "Almost ready... ✨",
    ],
    subjects: [
      { label: "Algebra",  icon: "∑", prompt: "I want to learn algebra" },
      { label: "Physics",  icon: "⚡", prompt: "I want to learn physics" },
      { label: "Python",   icon: "🐍", prompt: "I want to learn Python" },
      { label: "History",  icon: "📜", prompt: "I want to learn history" },
      { label: "Biology",  icon: "🧬", prompt: "I want to learn biology" },
      { label: "AI",       icon: "🤖", prompt: "I want to learn AI" },
    ],
  },
  ar: {
    subtitle: "مدرس ذكي — إلفا",
    welcome: "أهلاً! أنا إلفا مدرستك الذكية 👋\n\nإيه الموضوع اللي عايز تتعلمه؟ قولي وهسألك كام سؤال بسيط الأول عشان أعرف مستواك وأشرحلك صح!",
    placeholder: "قولي إيه اللي عايز تتعلمه...",
    hint: "اضغط Enter للإرسال · +20 نقطة لكل درس",
    openLesson: "🚀 ابدأ الدرس الكامل",
    lessonTitle: "درس إلفا",
    back: "رجوع →",
    listen: "🔊 استمع",
    stop: "⏹ وقف",
    prev: "→ السابق",
    next: "→ التالي",
    done: "ابدأ الاختبار 🎯",
    narrationLabel: "شرح الشريحة",
    toggleLang: "EN",
    quizTitle: "وقت الاختبار 🎯",
    quizCheck: "تأكيد الإجابة",
    quizNext: "السؤال التالي →",
    quizFinish: "شوف النتيجة 🏆",
    correct: "✅ إجابة صحيحة!",
    wrong: "❌ إجابة خاطئة! الصح هو: ",
    proofLabel: "📐 الشرح خطوة بخطوة",
    reportTitle: "تقرير أدائك",
    score: "درجة الاختبار",
    level: "مستواك",
    focus: "التركيز",
    summary: "خلاصة الدرس",
    strengths: "نقاط القوة",
    improve: "يحتاج تحسين",
    backToChat: "ارجع للشات →",
    tryAgain: "حاول تاني 🔄",
    checkInTitle: "سؤال سريع ✏️",
    checkInCorrect: "✅ ممتاز! كمّل.",
    checkInWrong: "❌ خلينا نراجع الشريحة دي تاني.",
    nextStep: "إيه الخطوة الجاية؟",
    slideChatPlaceholder: "اسأل إلفا... مثلاً 'فهمني أكتر'، 'مثال تاني'",
    slideChatUpdating: "جاري تحديث الشريحة...",
    slideChatHint: "↩ Enter للإرسال · اضغط 🎤 للكلام",
    quizLoading: "جاري بناء أسئلة جديدة... 🎯",
    voiceTap: "🎤 اضغط للكلام",
    voiceListening: "🔴 بسمعك...",
    voiceProcessing: "جاري المعالجة...",
    voiceError: "الميكروفون مش متاح",
    voiceNotSupported: "الصوت مش مدعوم في المتصفح ده",
    voiceAnswerHint: "🎤 اضغط للإجابة",
    voiceJudging: "إلفا بتحكم...",
    voiceTapStop: "🔴 اضغط للإيقاف",
    loadingSteps: [
      "جاري بناء الدرس... 🧱",
      "بكتب الأمثلة المفصّلة... ✏️",
      "تقريباً جاهز... ✨",
    ],
    subjects: [
      { label: "الجبر",             icon: "∑",  prompt: "عايز أتعلم الجبر" },
      { label: "الفيزياء",          icon: "⚡", prompt: "عايز أتعلم الفيزياء" },
      { label: "البرمجة",           icon: "🐍", prompt: "عايز أتعلم بايثون" },
      { label: "التاريخ",           icon: "📜", prompt: "عايز أتعلم تاريخ" },
      { label: "الأحياء",           icon: "🧬", prompt: "عايز أتعلم أحياء" },
      { label: "الذكاء الاصطناعي",  icon: "🤖", prompt: "عايز أتعلم ذكاء اصطناعي" },
    ],
  },
};

// ─────────────────────────────────────────────
// LEVEL & PROGRESS HELPERS
// ─────────────────────────────────────────────
export function getLevelInfo(pct, lang) {
  if (pct >= 90) return { 
    label: lang === "ar" ? "ممتاز" : "Excellent", 
    color: "#34d399", 
    icon: "🏆", 
    focus: lang === "ar" ? "تركيز عالي جداً" : "Very High Focus", 
    focusColor: "#34d399" 
  };
  if (pct >= 75) return { 
    label: lang === "ar" ? "جيد جداً" : "Very Good", 
    color: "#60a5fa", 
    icon: "🌟", 
    focus: lang === "ar" ? "تركيز جيد" : "Good Focus", 
    focusColor: "#60a5fa" 
  };
  if (pct >= 60) return { 
    label: lang === "ar" ? "جيد" : "Good", 
    color: "#fbbf24", 
    icon: "👍", 
    focus: lang === "ar" ? "تركيز متوسط" : "Average Focus", 
    focusColor: "#fbbf24" 
  };
  if (pct >= 40) return { 
    label: lang === "ar" ? "مقبول" : "Fair", 
    color: "#f97316", 
    icon: "📚", 
    focus: lang === "ar" ? "يحتاج تركيز" : "Needs More Focus", 
    focusColor: "#f97316" 
  };
  return { 
    label: lang === "ar" ? "يحتاج مراجعة" : "Needs Review", 
    color: "#ef4444", 
    icon: "💪", 
    focus: lang === "ar" ? "تركيز ضعيف" : "Low Focus", 
    focusColor: "#ef4444" 
  };
}

export function getNextStep(pct, weakPoints, lang) {
  if (pct < 60) return { 
    msg: lang === "ar" 
      ? `نراجع "${weakPoints?.[0] || "الدرس"}" تاني؟` 
      : `Review "${weakPoints?.[0] || "the lesson"}" again?`, 
    color: "#f87171" 
  };
  if (pct < 90) return { 
    msg: lang === "ar" 
      ? "جرّب مستوى أصعب في نفس الموضوع؟" 
      : "Try a harder level on the same topic?", 
    color: "#fbbf24" 
  };
  return { 
    msg: lang === "ar" 
      ? "إنت جاهز للموضوع الجاي! 🚀" 
      : "You're ready for the next topic! 🚀", 
    color: "#34d399" 
  };
}
// ─────────────────────────────────────────────
// 🌓 THEME COLORS
// ─────────────────────────────────────────────

export const THEMES = {
  light: {
    bg: '#f8fafc',
    bgSecondary: 'rgba(255, 255, 255, 0.95)',
    bgTertiary: '#f1f5f9',
    text: '#1e293b',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    border: 'rgba(124, 58, 237, 0.15)',
    shadow: 'rgba(124, 58, 237, 0.1)',
    botBubbleBg: 'rgba(124, 58, 237, 0.08)',
    botBubbleBorder: 'rgba(124, 58, 237, 0.15)',
    inputBg: 'rgba(124, 58, 237, 0.05)',
    inputBorder: 'rgba(124, 58, 237, 0.2)',
    orb1: 'rgba(124, 58, 237, 0.08)',
    orb2: 'rgba(59, 130, 246, 0.06)',
  },
  dark: {
    bg: '#070711',
    bgSecondary: 'rgba(13, 13, 26, 0.92)',
    bgTertiary: '#1a1a2e',
    text: '#f1f5f9',
    textSecondary: '#e2e8f0',
    textTertiary: '#94a3b8',
    border: 'rgba(139, 92, 246, 0.18)',
    shadow: 'rgba(124, 58, 237, 0.07)',
    botBubbleBg: 'rgba(124, 58, 237, 0.07)',
    botBubbleBorder: 'rgba(124, 58, 237, 0.14)',
    inputBg: 'rgba(124, 58, 237, 0.06)',
    inputBorder: 'rgba(124, 58, 237, 0.22)',
    orb1: 'rgba(124, 58, 237, 0.13)',
    orb2: 'rgba(59, 130, 246, 0.09)',
  }
};