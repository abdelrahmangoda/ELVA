import React, { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const GROQ_KEY    = "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";
const GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_HEAVY = "llama-3.3-70b-versatile";
const MODEL_FAST  = "llama-3.1-8b-instant";

// ── STUDENT MEMORY ────────────────────────────
const MEM_KEY = "elva_student_v2";
function getMemory() {
  try { return JSON.parse(localStorage.getItem(MEM_KEY) || "{}"); }
  catch { return {}; }
}
function saveMemory(mem) {
  try { localStorage.setItem(MEM_KEY, JSON.stringify(mem)); } catch {}
}
function recordQuizResult(topic, score, total, wrongs) {
  const mem = getMemory();
  mem.quiz_history = [...(mem.quiz_history || []).slice(-19),
    { topic, score, total, wrongs, date: Date.now() }];
  const freq = {};
  (mem.quiz_history || []).forEach(q =>
    (q.wrongs || []).forEach(w => { freq[w] = (freq[w] || 0) + 1; })
  );
  mem.weak_topics = Object.entries(freq)
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  mem.topics_covered = [...new Set([...(mem.topics_covered || []), topic])];
  saveMemory(mem);
}
function getMemorySummary(lang) {
  const mem = getMemory();
  if (!mem.quiz_history?.length) return "";
  const weak    = mem.weak_topics?.slice(0, 3).join(", ") || "";
  const covered = mem.topics_covered?.slice(-5).join(", ") || "";
  if (lang === "ar")
    return `\nملاحظة: الطالب درس: ${covered}. نقاط ضعفه: ${weak || "غير محددة"}.`;
  return `\nNote: Student studied: ${covered}. Weak areas: ${weak || "not identified yet"}.`;
}

// ── TRANSLATIONS ──────────────────────────────
const T = {
  en: {
    subtitle: "AI Tutor — EDTECH",
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
    slideChatPlaceholder: "Ask ELVA... e.g. 'explain more', 'another example', 'make it simpler'",
    slideChatUpdating: "Updating slide...",
    slideChatHint: "↩ Enter to ask · 🎤 hold to speak",
    quizLoading: "Building fresh quiz questions... 🎯",
    voiceHold: "🎤 Hold to speak",
    voiceListening: "🔴 Listening...",
    voiceProcessing: "Processing...",
    voiceError: "Microphone not available",
    voiceNotSupported: "Voice not supported in this browser",
    voiceAnswerHint: "🎤 Speak your answer",
    voiceJudging: "ELVA is judging...",
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
    subtitle: "مدرس ذكي — إيدتيك",
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
    slideChatPlaceholder: "اسأل إلفا... مثلاً 'فهمني أكتر'، 'مثال تاني'، 'أبسط'",
    slideChatUpdating: "جاري تحديث الشريحة...",
    slideChatHint: "↩ Enter للإرسال · 🎤 اضغط للكلام",
    quizLoading: "جاري بناء أسئلة جديدة... 🎯",
    voiceHold: "🎤 اضغط للكلام",
    voiceListening: "🔴 بسمعك...",
    voiceProcessing: "جاري المعالجة...",
    voiceError: "الميكروفون مش متاح",
    voiceNotSupported: "الصوت مش مدعوم في المتصفح ده",
    voiceAnswerHint: "🎤 قول إجابتك",
    voiceJudging: "إلفا بتحكم...",
    loadingSteps: [
      "جاري بناء الدرس... 🧱",
      "بكتب الأمثلة المفصّلة... ✏️",
      "تقريباً جاهز... ✨",
    ],
    subjects: [
      { label: "الجبر",    icon: "∑", prompt: "عايز أتعلم الجبر" },
      { label: "الفيزياء", icon: "⚡", prompt: "عايز أتعلم الفيزياء" },
      { label: "البرمجة",  icon: "🐍", prompt: "عايز أتعلم بايثون" },
      { label: "التاريخ",  icon: "📜", prompt: "عايز أتعلم تاريخ" },
      { label: "الأحياء",  icon: "🧬", prompt: "عايز أتعلم أحياء" },
      { label: "الذكاء الاصطناعي", icon: "🤖", prompt: "عايز أتعلم ذكاء اصطناعي" },
    ],
  },
};

const COLORS = {
  intro:      { bg:"rgba(124,58,237,0.12)", border:"rgba(124,58,237,0.45)", accent:"#a78bfa", label:"INTRO" },
  concept:    { bg:"rgba(59,130,246,0.10)", border:"rgba(59,130,246,0.45)", accent:"#60a5fa", label:"CONCEPT" },
  example:    { bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.45)", accent:"#34d399", label:"EXAMPLE" },
  definition: { bg:"rgba(236,72,153,0.10)", border:"rgba(236,72,153,0.45)", accent:"#f472b6", label:"DEFINITION" },
  summary:    { bg:"rgba(245,158,11,0.10)", border:"rgba(245,158,11,0.45)", accent:"#fbbf24", label:"SUMMARY" },
};

function getLevelInfo(pct, lang) {
  if (pct >= 90) return { label:lang==="ar"?"ممتاز":"Excellent",     color:"#34d399", icon:"🏆", focus:lang==="ar"?"تركيز عالي جداً":"Very High Focus", focusColor:"#34d399" };
  if (pct >= 75) return { label:lang==="ar"?"جيد جداً":"Very Good",  color:"#60a5fa", icon:"🌟", focus:lang==="ar"?"تركيز جيد":"Good Focus",           focusColor:"#60a5fa" };
  if (pct >= 60) return { label:lang==="ar"?"جيد":"Good",             color:"#fbbf24", icon:"👍", focus:lang==="ar"?"تركيز متوسط":"Average Focus",      focusColor:"#fbbf24" };
  if (pct >= 40) return { label:lang==="ar"?"مقبول":"Fair",           color:"#f97316", icon:"📚", focus:lang==="ar"?"يحتاج تركيز":"Needs More Focus",   focusColor:"#f97316" };
  return          { label:lang==="ar"?"يحتاج مراجعة":"Needs Review", color:"#ef4444", icon:"💪", focus:lang==="ar"?"تركيز ضعيف":"Low Focus",           focusColor:"#ef4444" };
}

function getNextStep(pct, weakPoints, lang) {
  if (pct < 60) return { msg:lang==="ar"?`نراجع "${weakPoints?.[0]||"الدرس"}" تاني؟`:`Review "${weakPoints?.[0]||"the lesson"}" again?`, color:"#f87171" };
  if (pct < 90) return { msg:lang==="ar"?"جرّب مستوى أصعب في نفس الموضوع؟":"Try a harder level on the same topic?", color:"#fbbf24" };
  return        { msg:lang==="ar"?"إنت جاهز للموضوع الجاي! 🚀":"You're ready for the next topic! 🚀", color:"#34d399" };
}

// ─────────────────────────────────────────────
// PROMPT BUILDERS
// ─────────────────────────────────────────────
function makeTutorSystemPrompt(lang) {
  const language = lang === "ar" ? "Arabic" : "English";
  return (
    "You are ELVA, a warm expert tutor. Respond ONLY in " + language + ". Always output ONLY valid JSON, no markdown.\n" +
    "Guide the student with friendly questions BEFORE teaching.\n" +
    "Return EXACTLY: " + JSON.stringify({ message:"string", choices:["2-4 short options"], ready:false }) + "\n" +
    "RULES:\n" +
    "- Turn 1: ask level (Beginner/Intermediate/Advanced)\n" +
    "- Turn 2: offer 2-4 specific subtopics relevant ONLY to what the student asked about\n" +
    "- Turn 3: set ready=true, choices=[], message says you will build the lesson now\n" +
    "- Keep messages warm and short\n" +
    "- CRITICAL: subtopics MUST be directly related to the student's chosen subject. If student says 'algebra', only offer algebra subtopics. If student says 'Python', only offer Python subtopics."
  );
}

// FIX #4: Stronger topic-locking in slides prompt
function makeSlidesPrompt(lang, level, conversationTopic) {
  const language = lang === "ar" ? "Arabic" : "English";
  const levelGuide = {
    beginner:     "Use simple words. Define every term. Max 2 concepts per slide. Lots of analogies.",
    intermediate: "Assume basic knowledge. Focus on connections, edge cases, and deeper mechanisms.",
    advanced:     "Go deep. Include theory, trade-offs, nuance, and advanced applications.",
  }[level] || "Adapt to the student's level.";

  const topicLock = conversationTopic
    ? `\n\nCRITICAL TOPIC LOCK: This lesson is EXCLUSIVELY about "${conversationTopic}". Every single slide MUST be directly about this topic. Do NOT drift to related subjects, prerequisites, or tangential concepts unless they directly explain "${conversationTopic}". If slide 1 is about "${conversationTopic}", slide 6 must STILL be about "${conversationTopic}".`
    : "";

  return (
    "You are ELVA, a world-class tutor. Generate ALL content in " + language + " ONLY.\n" +
    "Student level: " + (level||"intermediate") + ". " + levelGuide +
    topicLock + "\n\n" +
    "Build 6-7 DEEPLY DETAILED slides. Each slide content field MUST follow:\n" +
    "① One-sentence plain definition\n② The problem it solves\n③ Step-by-step mechanism\n④ Real-world analogy\n⑤ Common beginner mistake\n⑥ Bridge to next concept\n\n" +
    "EXAMPLE field = FULLY WORKED case:\n" +
    "MATH: full problem solved step-by-step. PROGRAMMING: 4-8 lines working code explained line-by-line.\n" +
    "PHYSICS: formula + real numbers + units. HISTORY: year+person+place+cause+consequence.\n\n" +
    "keypoints RULES — these are used to generate quiz questions, so they MUST be:\n" +
    "- SPECIFIC facts, values, behaviors, or syntax — NOT vague labels\n" +
    "- GOOD: 'Mode w overwrites existing file content' / 'Mitosis produces 2 identical cells' / 'HTTP 404 means resource not found'\n" +
    "- BAD: 'File modes are important' / 'Cell division exists' / 'HTTP has status codes'\n" +
    "- Each keypoint = a standalone testable fact a student can be examined on\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      topic:"lesson topic",
      reply:"warm 1-sentence message",
      slides:[{
        title:"slide title",
        content:"①②③④⑤⑥ structure, min 6 sentences",
        keypoints:["point 1","point 2","point 3"],
        example:"FULLY WORKED example",
        tip:"memory trick or common mistake",
        emoji:"emoji",
        type:"intro|concept|definition|example|summary",
        narration:"tutor voice 60-80 words",
      }],
      lesson_summary:"4-5 sentences",
      strong_points:["concept 1","concept 2"],
      weak_points:["concept needing review"],
      study_tips:["tip 1","tip 2"],
    }) +
    "\nRULES: 6-7 slides, NO newlines inside strings, ONLY JSON."
  );
}

// FIX #3: Strict single-correct-answer check-in prompt with variety
function makeCheckInPrompt(lang, level, sl, useOpen, slideIndex) {
  const language = lang === "ar" ? "Arabic" : "English";
  const ctx =
    "SLIDE TITLE: " + sl.title + "\n" +
    "CONTENT: " + (sl.content||"").slice(0, 500) + "\n" +
    "KEY POINTS: " + (sl.keypoints||[]).join(" | ") + "\n" +
    "EXAMPLE: " + (sl.example||"").slice(0, 300);

  const types = ["CONSEQUENCE","ERROR-SPOT","APPLICATION","COMPARISON","PREDICT","REAL-WORLD"];
  const forcedType = types[(slideIndex||0) % types.length];

  if (useOpen) {
    const openTypes = ["EXPLAIN","APPLY","PREDICT","COMPARE","REAL-WORLD-USE"];
    const openForced = openTypes[(slideIndex||0) % openTypes.length];
    return (
      "You are ELVA. Generate ONE open-ended check-in question in " + language + ".\n\n" +
      ctx + "\n\n" +
      "FORCED QUESTION TYPE THIS TIME: " + openForced + "\n" +
      "EXPLAIN → 'Explain why [specific mechanism from slide] works the way it does'\n" +
      "APPLY → 'A student wants to [real scenario]. How would they use [concept]?'\n" +
      "PREDICT → 'What would happen if [specific condition changed]?'\n" +
      "COMPARE → 'What is the key difference between [X] and [Y] from this slide?'\n" +
      "REAL-WORLD-USE → 'Give a real-world example of [concept] being used and explain it'\n\n" +
      "CRITICAL RULES:\n" +
      "- Question MUST be specific to THIS slide's content — not a generic question\n" +
      "- NEVER start with 'What is', 'Define', or 'What does X mean'\n" +
      "- model_answer: 3-4 sentences a top student would write\n" +
      "- grading_criteria: 3 SPECIFIC facts from the slide content — not vague\n\n" +
      "Output ONLY valid JSON:\n" +
      JSON.stringify({
        type:"open",
        question:"...",
        model_answer:"...",
        grading_criteria:["specific fact 1","specific fact 2","specific fact 3"],
        explanation:"why this matters in 1 sentence"
      })
    );
  }

  return (
    "You are ELVA. Generate ONE MCQ check-in question in " + language + ".\n\n" +
    ctx + "\n\n" +
    "FORCED QUESTION TYPE THIS TIME: " + forcedType + "\n" +
    "CONSEQUENCE → 'What happens when [specific action from slide content]?' — options = specific outcomes\n" +
    "ERROR-SPOT  → 'A student wrote [specific wrong code/statement]. What is the mistake?' — options = specific errors\n" +
    "APPLICATION → 'You need to [real task]. Which approach is correct?' — options = concrete methods\n" +
    "COMPARISON  → 'What is the key difference between [X] and [Y]?' — options = specific distinctions\n" +
    "PREDICT     → 'If [condition from slide] changes to [X], what happens?' — options = specific results\n" +
    "REAL-WORLD  → 'A [job/person] needs to [task]. Which solution applies [concept]?' — options = specific solutions\n\n" +
    "STRICT OPTIONS RULES:\n" +
    "- Exactly 4 options\n" +
    "- ALL options: same grammatical form, 3-9 words each\n" +
    "- Options = specific behaviors/outcomes/values/snippets — NEVER: topic labels, slide title, vague descriptions\n" +
    "- 3 distractors = real mistakes students commonly make — not obviously wrong\n" +
    "- NEVER: 'Not sure', 'All of above', 'None of above', slide title, heading words\n" +
    "- answer MUST be an EXACT copy of one of the 4 options (character-for-character)\n" +
    "- CRITICAL: There must be EXACTLY ONE correct answer. The other 3 options must be WRONG.\n" +
    "- VALIDATION: Before outputting, verify that ONLY the 'answer' field value is correct. All other options must be incorrect.\n\n" +
    "explanation: 2 sentences — exactly WHY the correct answer is right, and WHY the most tempting wrong answer is wrong\n\n" +
    "Output ONLY valid JSON (no markdown, no extra text):\n" +
    JSON.stringify({
      type:"mcq",
      question:"What happens when you pass a float to int() in Python?",
      options:["Raises TypeError","Truncates decimal part","Rounds to nearest integer","Converts to string"],
      answer:"Truncates decimal part",
      explanation:"int() always truncates (floors toward zero), never rounds. So int(3.9) gives 3, not 4."
    }) +
    "\nThe JSON above is the FORMAT ONLY. Generate a completely NEW question based on the slide content above."
  );
}

// FIX #3: Strict single-correct-answer quiz prompt with variety
function makeQuizFromSlidesPrompt(lang, level, slides) {
  const language = lang === "ar" ? "Arabic" : "English";
  const slideSummary = (slides||[]).map((sl,i) =>
    `Slide ${i+1} - "${sl.title}":\n  Content: ${(sl.content||"").slice(0,250)}\n  Key points: ${(sl.keypoints||[]).join(" | ")}\n  Example: ${(sl.example||"").slice(0,150)}`
  ).join("\n\n");
  return (
    "You are ELVA. Student finished this lesson:\n\n" + slideSummary + "\n\n" +
    "Generate EXACTLY 5 quiz questions in " + language + ". Level: " + (level||"intermediate") + ".\n\n" +
    "MANDATORY QUESTION TYPES — one of each, in this order:\n" +
    "Q1. APPLICATION: Give a new real-world scenario, ask which approach/code/formula applies\n" +
    "Q2. ANALYSIS: Ask WHY a specific mechanism works — options explain the reason, not restate the fact\n" +
    "Q3. ERROR-FINDING: Show a specific wrong example (code/formula/statement), ask what the mistake is\n" +
    "Q4. CONSEQUENCE: 'What happens if [specific condition]?' — options are concrete outcomes\n" +
    "Q5. SYNTHESIS (open): 'Explain how [concept A] and [concept B] from the lesson work together. Give an example.'\n\n" +
    "STRICT MCQ RULES — VIOLATIONS WILL BREAK THE APP:\n" +
    "- answer field MUST be CHARACTER-FOR-CHARACTER identical to one of the 4 options — no paraphrasing\n" +
    "- options: exactly 4, same grammatical form, 3-9 words each\n" +
    "- options: specific outcomes/behaviors/values/snippets — NEVER vague labels or topic names\n" +
    "- 3 distractors: plausible mistakes a real student would make — not obviously wrong\n" +
    "- NEVER use: 'Not sure', 'All of the above', 'None of the above', slide title, generic descriptions\n" +
    "- Each question MUST reference a specific detail from the slides above — no generic questions\n" +
    "- NEVER repeat the same question format twice\n" +
    "- CRITICAL SINGLE-ANSWER RULE: Each MCQ must have EXACTLY ONE correct answer among the 4 options.\n" +
    "  Before finalizing each question, verify: only the 'answer' value is correct, the other 3 options are definitively wrong.\n" +
    "  DO NOT create questions where 2 or more options could both be considered correct.\n\n" +
    "OPEN QUESTION RULES:\n" +
    "- model_answer: 3-5 sentences showing a complete, correct student response\n" +
    "- grading_criteria: exactly 3 specific facts/concepts from the lesson content\n\n" +
    "Output ONLY valid JSON — no markdown, no backticks, no extra text:\n" +
    JSON.stringify({
      quiz:[
        { type:"mcq", question:"[specific application scenario]?", options:["concrete A","concrete B","concrete C","concrete D"], answer:"concrete A", explanation:"Why A is right and why B is the tempting wrong answer." },
        { type:"mcq", question:"Why does [specific mechanism] work this way?", options:["specific reason A","specific reason B","specific reason C","specific reason D"], answer:"specific reason A", explanation:"..." },
        { type:"mcq", question:"A student wrote [specific wrong example]. What is the mistake?", options:["specific error A","specific error B","specific error C","specific error D"], answer:"specific error A", explanation:"..." },
        { type:"mcq", question:"What happens when [specific condition from lesson]?", options:["specific outcome A","specific outcome B","specific outcome C","specific outcome D"], answer:"specific outcome A", explanation:"..." },
        { type:"open", question:"Explain how [concept A] and [concept B] work together. Give a real example.", model_answer:"A full 3-5 sentence answer a top student would write.", grading_criteria:["specific fact 1","specific fact 2","specific fact 3"] },
      ]
    }) +
    "\nEXACTLY 5 questions. ONLY JSON."
  );
}

function makeSlideEditPrompt(lang, level, slide, studentRequest) {
  const language = lang === "ar" ? "Arabic" : "English";
  return (
    "You are ELVA. Student has a request about this slide.\n\n" +
    "CURRENT SLIDE:\n" + JSON.stringify(slide) + "\n\n" +
    "STUDENT REQUEST: " + studentRequest + "\n\n" +
    "Rewrite only the fields needed. Keep same topic and type. Generate in " + language + ". Level: " + (level||"intermediate") + ".\n" +
    "- 'explain more' / 'فهمني أكتر': expand content, add keypoints\n" +
    "- 'another example' / 'مثال تاني': replace example with completely different worked one\n" +
    "- 'simpler' / 'أبسط': rewrite with simpler words and basic analogy\n" +
    "- 'connect to X' / 'اربطها بـ X': add real-world connection to X\n\n" +
    "Output ONLY valid JSON (full slide object):\n" +
    JSON.stringify({ title:"...", content:"...", keypoints:["..."], example:"...", tip:"...", emoji:"...", type:"...", narration:"..." }) +
    "\nONLY JSON."
  );
}

function makeProofPrompt(lang, question, answer, explanation) {
  const langWord = lang === "ar" ? "Arabic" : "English";
  return `In ${langWord}, give a clear step-by-step proof why this answer is correct.\nQuestion: ${question}\nCorrect answer: ${answer}\nContext: ${explanation}\nWrite numbered steps. Plain text only.`;
}

function makeAiJudgePrompt(lang, { question, answer, model_answer, grading_criteria, options, transcript }) {
  const language = lang === "ar" ? "Arabic" : "English";
  const isOpen = !options;
  if (isOpen) {
    return (
      "You are ELVA, a strict but warm tutor. Grade this student answer in " + language + ".\n\n" +
      "QUESTION: " + question + "\n" +
      "MODEL ANSWER: " + model_answer + "\n" +
      "REQUIRED KEY IDEAS (student must mention most of these): " + (grading_criteria||[]).join(" | ") + "\n" +
      "STUDENT ANSWERED: \"" + transcript + "\"\n\n" +
      "GRADING RULES — READ CAREFULLY:\n" +
      "- correct: true ONLY if student mentioned at least 60% of the key ideas\n" +
      "- correct: false if answer is vague, off-topic, too short, or missing key ideas\n" +
      "- NEVER say 'good job' or positive feedback if correct=false\n" +
      "- If wrong: tell them EXACTLY what they missed and why it matters\n" +
      "- If correct: praise specifically what they got right, add one insight\n" +
      "- score_pct: 0-100 based on how many key ideas they hit\n" +
      "- feedback: 2-3 sentences, conversational like a real tutor\n\n" +
      "Respond ONLY in " + language + " with valid JSON (no markdown):\n" +
      JSON.stringify({ correct: false, score_pct: 0, feedback: "..." })
    );
  }
  return (
    "You are ELVA. A student answered an MCQ in " + language + ".\n\n" +
    "QUESTION: " + question + "\n" +
    "CORRECT ANSWER: " + answer + "\n" +
    "OPTIONS: " + (options||[]).join(" | ") + "\n" +
    "STUDENT SAID: \"" + transcript + "\"\n\n" +
    "RULES:\n" +
    "- correct: true ONLY if student's answer semantically matches the correct answer\n" +
    "- correct: false if they picked or said a wrong option\n" +
    "- NEVER mark as correct if they said a wrong option — even if they sound confident\n" +
    "- matched_option: the exact text from OPTIONS that best matches what they said (or null)\n" +
    "- feedback: 1-2 sentences — if wrong explain WHY the correct answer is right\n\n" +
    "Respond ONLY in " + language + " with valid JSON (no markdown):\n" +
    JSON.stringify({ correct: false, matched_option: "...", feedback: "..." })
  );
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function safeParseJSON(raw) {
  if (!raw) return null;
  let clean = raw.replace(/```json/g,"").replace(/```/g,"").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s !== -1 && e !== -1) clean = clean.slice(s, e+1);
  try { return JSON.parse(clean); } catch {}
  try {
    return JSON.parse(clean.replace(/,\s*}/g,"}").replace(/,\s*]/g,"]").replace(/\n/g,"\\n"));
  } catch { return null; }
}

function norm(s) {
  return (s||"").trim().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[\u064b-\u065f]/g,"")
    .replace(/[^\w\s\u0600-\u06FF]/g,"")
    .replace(/\s+/g," ");
}

// FIX #3: Validate that EXACTLY ONE option matches the answer
function validateAndRepairLesson(data) {
  if (!data) return null;

  data.slides = (data.slides||[]).map((sl,i) => ({
    title:     sl.title     || `Slide ${i+1}`,
    content:   sl.content   || "",
    keypoints: Array.isArray(sl.keypoints) ? sl.keypoints : [],
    example:   sl.example   || "",
    tip:       sl.tip       || "",
    emoji:     sl.emoji     || "📖",
    type:      sl.type      || "concept",
    narration: sl.narration || (sl.content||"").slice(0,120),
  }));
  if (data.slides.length === 0) return null;

  if (Array.isArray(data.quiz)) {
    data.quiz = data.quiz.map(q => {
      if (!q?.question) return null;
      if (q.type === "open") return q;

      const rawOpts = (q.options||[]).filter(Boolean);
      const seen = new Set();
      const uniqueOpts = rawOpts.filter(o => {
        const k = norm(o); if (seen.has(k)) return false; seen.add(k); return true;
      });
      if (uniqueOpts.length < 2) return null;

      // Find declared answer in options
      let answer = q.answer;
      const exactMatch = uniqueOpts.find(o => norm(o) === norm(answer));
      if (!exactMatch) {
        const scored = uniqueOpts.map(o => {
          const aW = norm(answer||"").split(" ").filter(w=>w.length>2);
          const oW = norm(o).split(" ");
          return { o, score: aW.filter(w => oW.includes(w)).length };
        }).sort((a,b) => b.score - a.score);
        answer = scored[0].o;
      } else {
        answer = exactMatch;
      }

      while (uniqueOpts.length < 4) uniqueOpts.push(`Option ${uniqueOpts.length+1}`);
      const finalOpts = uniqueOpts.slice(0,4);

      if (!finalOpts.some(o => norm(o) === norm(answer))) {
        finalOpts[3] = answer;
      }

      // Guarantee EXACTLY 1 correct option
      const deduped = [];
      let answerAdded = false;
      for (const o of finalOpts) {
        if (norm(o) === norm(answer)) {
          if (!answerAdded) { deduped.push(o); answerAdded = true; }
        } else {
          deduped.push(o);
        }
      }
      while (deduped.length < 4) deduped.push(`Option ${deduped.length+1}`);

      return { ...q, options: deduped.slice(0,4), answer };
    }).filter(Boolean);
  }
  return data;
}

async function callGroq(msgs, jsonMode, maxTok, model, retries = 3) {
  const useModel = model || MODEL_HEAVY;
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 30_000);
      const r = await fetch(GROQ_URL, {
        method:  "POST",
        headers: { "Content-Type":"application/json", "Authorization":"Bearer "+GROQ_KEY },
        signal:  controller.signal,
        body: JSON.stringify({
          model:       useModel,
          temperature: jsonMode ? 0.3 : 0.7,
          max_tokens:  maxTok || 4000,
          messages:    msgs,
          ...(jsonMode && { response_format:{ type:"json_object" } }),
        }),
      });
      clearTimeout(timeout);
      if (r.status === 429) {
        const wait = parseInt(r.headers.get("retry-after")||"5",10);
        await sleep(wait * 1000);
        continue;
      }
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error?.message||r.statusText); }
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      return d.choices[0].message.content || "";
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(1000 * 2 ** (attempt - 1));
    }
  }
  throw lastErr;
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ElvaTutor() {
  const [lang, setLang]               = useState("ar");
  const [screen, setScreen]           = useState("chat");
  const [messages, setMessages]       = useState(null);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [lesson, setLesson]           = useState(null);
  const [slide, setSlide]             = useState(0);
  const [speaking, setSpeaking]       = useState(false);
  const [xp, setXp]                   = useState(120);
  const [streak, setStreak]           = useState(3);
  const [qIdx, setQIdx]               = useState(0);
  const [selected, setSelected]       = useState(null);
  const [checked, setChecked]         = useState(false);
  const [score, setScore]             = useState(0);
  const [wrongs, setWrongs]           = useState([]);
  const [showProof, setShowProof]     = useState(false);
  const [proofText, setProofText]     = useState("");
  const [proofLoading, setProofLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [selectedVoice, setSelectedVoice]     = useState(null);
  const [allVoices, setAllVoices]             = useState([]);
  const [studentLevel, setStudentLevel]       = useState(null);
  // FIX #4: Track the actual lesson topic from conversation
  const [lessonTopic, setLessonTopic]         = useState(null);
  // Check-in state
  const [checkIn, setCheckIn]               = useState(null);
  const [checkInSelected, setCheckInSelected] = useState(null);
  const [checkInChecked, setCheckInChecked]   = useState(false);
  const [checkInResult, setCheckInResult]     = useState(null);
  const [checkInLoading, setCheckInLoading]   = useState(false);
  const [openAnswer, setOpenAnswer]           = useState("");
  const [openSubmitting, setOpenSubmitting]   = useState(false);
  // Slide chat
  const [slideInput, setSlideInput]     = useState("");
  const [slideUpdating, setSlideUpdating] = useState(false);
  // Quiz
  const [quizLoading, setQuizLoading]   = useState(false);
  const [quizAiChecking, setQuizAiChecking] = useState(false);
  const [quizFeedback, setQuizFeedback]     = useState(null);
  // Voice
  const [voiceMode, setVoiceMode]           = useState(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError]         = useState("");
  const recognitionRef = useRef(null);

  const level     = Math.floor(xp / 100) + 1;
  const xpProg    = xp % 100;
  const bottomRef = useRef(null);
  const synthRef  = useRef(window.speechSynthesis);
  const speakTimerRef   = useRef(null);
  const loadingTimerRef = useRef(null);
  const t      = T[lang];
  const isRTL  = lang === "ar";

  useEffect(() => {
    setMessages([{ role:"assistant", text:T[lang].welcome, type:"welcome" }]);
    setChatHistory([]);
  }, [lang]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  useEffect(() => {
    const load = () => { const v = window.speechSynthesis.getVoices(); if (v.length) setAllVoices(v); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    loadingTimerRef.current = setInterval(() => {
      setLoadingStep(s => (s+1) % t.loadingSteps.length);
    }, 3500);
    return () => clearInterval(loadingTimerRef.current);
  }, [loading, lang]);

  useEffect(() => {
    return () => { stopSpeech(); clearTimeout(speakTimerRef.current); clearInterval(loadingTimerRef.current); };
  }, []);

  // ── TTS ─────────────────────────────────────
  // FIX #1: Centralized stopSpeech that always kills audio immediately
  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeaking(false);
  }, []);

  // FIX #1: Helper to kill all audio (TTS + timers)
  const killAllAudio = useCallback(() => {
    clearTimeout(speakTimerRef.current);
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text, voiceOverride) => {
    // Always stop any current speech first
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
    if (!window.speechSynthesis || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const chosen = voiceOverride || selectedVoice;
    if (chosen) {
      u.voice = chosen;
    } else {
      const lv = voices.filter(v => lang==="ar" ? v.lang.startsWith("ar") : v.lang.startsWith("en"));
      const prem = lv.find(v => ["google","natural","online","neural","enhanced","premium","siri","samantha","karen"].some(k => v.name.toLowerCase().includes(k)));
      u.voice = prem || lv[0] || null;
    }
    u.rate=0.9; u.pitch=1.0; u.volume=1.0;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    u.onerror = e => { if (e.error !== "interrupted") console.warn("TTS:", e.error); setSpeaking(false); };
    try { synthRef.current.speak(u); } catch { setSpeaking(false); }
  }, [lang, selectedVoice]);

  const speakSlide = useCallback(sl => {
    if (!sl) return;
    const parts = [];
    if (sl.title) parts.push(sl.title + ".");
    if (sl.content) parts.push(sl.content);
    if (sl.example) parts.push((lang==="ar"?"مثال: ":"Example: ") + sl.example);
    speak(parts.join(" "));
  }, [lang, speak]);

  // ── VOICE RECORDING ─────────────────────────
  function startVoice(mode) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError(t.voiceNotSupported); return; }
    killAllAudio();
    setVoiceError(""); setVoiceTranscript("");
    setVoiceMode(mode); setVoiceListening(true);
    const rec = new SR();
    rec.lang = lang==="ar" ? "ar-EG" : "en-US";
    rec.interimResults = true; rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onresult = e => setVoiceTranscript(Array.from(e.results).map(r=>r[0].transcript).join(""));
    rec.onerror  = e => { setVoiceListening(false); setVoiceMode(null); if (e.error!=="aborted") setVoiceError(t.voiceError+": "+e.error); };
    rec.onend    = () => {
      setVoiceListening(false);
      setVoiceTranscript(prev => {
        if (prev.trim()) {
          if (mode === "chat") send(prev.trim());
          else if (mode === "slide") setTimeout(() => { setSlideInput(""); sendSlideChatText(prev.trim()); }, 400);
        }
        return "";
      });
      setVoiceMode(null);
    };
    rec.start();
  }
  function stopVoice() { recognitionRef.current?.stop(); setVoiceListening(false); setVoiceMode(null); }

  // ── SLIDE CHAT ───────────────────────────────
  async function sendSlideChatText(txt) {
    if (!txt || slideUpdating) return;
    setSlideUpdating(true); killAllAudio();
    try {
      const currentSlide = lesson.slides[slide];
      const sys = makeSlideEditPrompt(lang, studentLevel, currentSlide, txt);
      const raw = await callGroq([{ role:"system", content:sys },{ role:"user", content:txt }], true, 1200, MODEL_FAST);
      const updated = safeParseJSON(raw);
      if (!updated?.title) throw new Error("Bad slide response");
      const newSlides = lesson.slides.map((sl,i) => i===slide ? {...currentSlide,...updated} : sl);
      setLesson(l => ({ ...l, slides:newSlides }));
      speakTimerRef.current = setTimeout(() => {
        const parts = [];
        if (updated.content) parts.push(updated.content);
        if (updated.example) parts.push((lang==="ar"?"مثال: ":"Example: ")+updated.example);
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

  // ── BUILD LESSON ─────────────────────────────
  async function buildLesson(history, topic) {
    setLoading(true);
    try {
      const memNote  = getMemorySummary(lang);
      // FIX #4: Pass the extracted topic to lock the lesson content
      const sysSlides = makeSlidesPrompt(lang, studentLevel, topic) + memNote;
      const slideMsgs = [{ role:"system", content:sysSlides }, ...history];
      const slidesRaw  = await callGroq(slideMsgs, true, 3500, MODEL_HEAVY);
      const slidesData = safeParseJSON(slidesRaw);
      if (!slidesData?.slides?.length) throw new Error("No slides returned");
      const combined = validateAndRepairLesson({
        topic:          slidesData.topic          || topic || "Lesson",
        reply:          slidesData.reply          || (lang==="ar"?"الدرس جاهز! 🎉":"Lesson ready! 🎉"),
        slides:         slidesData.slides         || [],
        quiz:           [],
        lesson_summary: slidesData.lesson_summary || "",
        strong_points:  slidesData.strong_points  || [],
        weak_points:    slidesData.weak_points    || [],
        study_tips:     slidesData.study_tips     || [],
      });
      if (!combined) throw new Error("Lesson validation failed");
      setMessages(p => [...p, { role:"assistant", text:combined.reply, type:"lesson-ready", lessonData:combined }]);
      setXp(x => x+20);
    } catch {
      setMessages(p => [...p, { role:"assistant", text:lang==="ar"?"❌ حصل خطأ. حاول تاني.":"❌ Error building lesson. Please try again.", type:"error" }]);
    } finally { setLoading(false); }
  }

  // ── BUILD QUIZ ON DEMAND ─────────────────────
  async function buildQuizThenStart(currentLesson) {
    setQuizLoading(true); killAllAudio();
    try {
      const sys = makeQuizFromSlidesPrompt(lang, studentLevel, currentLesson.slides);
      const raw = await callGroq([{ role:"system", content:sys },{ role:"user", content:"Generate the quiz now." }], true, 1800, MODEL_HEAVY);
      const data = safeParseJSON(raw);
      const repaired = validateAndRepairLesson({ ...currentLesson, quiz:data?.quiz||[] });
      setLesson(repaired);
      setQIdx(0); setSelected(null); setChecked(false);
      setScore(0); setWrongs([]); setShowProof(false);
      setScreen("quiz");
    } catch { setScreen("quiz"); }
    finally { setQuizLoading(false); }
  }

  // ── CHAT SEND ────────────────────────────────
  async function send(text) {
    const txt = text || input.trim();
    if (!txt || loading) return;
    setInput("");
    setMessages(p => [...p, { role:"user", text:txt }]);
    const newHistory = [...chatHistory, { role:"user", content:txt }];
    setChatHistory(newHistory);
    setLoading(true);
    try {
      const msgs = [{ role:"system", content:makeTutorSystemPrompt(lang) }, ...newHistory];
      const raw  = await callGroq(msgs, true, 500, MODEL_FAST);
      const data = safeParseJSON(raw) || { message:raw, choices:[], ready:false };
      const levelMap = { beginner:"beginner",مبتدئ:"beginner",intermediate:"intermediate",متوسط:"intermediate",advanced:"advanced",متقدم:"advanced" };
      const detectedLevel = Object.keys(levelMap).find(k => txt.toLowerCase().includes(k)||(data.message||"").toLowerCase().includes(k));
      if (detectedLevel) setStudentLevel(levelMap[detectedLevel]);

      // FIX #4: Extract topic from FIRST user message
      if (newHistory.length === 1) {
        setLessonTopic(txt);
      }

      const updatedHistory = [...newHistory, { role:"assistant", content:data.message }];
      setChatHistory(updatedHistory);
      setMessages(p => [...p, { role:"assistant", text:data.message, choices:data.choices||[], type:"tutor-question" }]);
      setLoading(false);
      if (data.ready) {
        // FIX #4: Pass the tracked topic
        const currentTopic = lessonTopic || newHistory[0]?.content || txt;
        setTimeout(() => buildLesson(updatedHistory, currentTopic), 600);
      }
    } catch {
      setMessages(p => [...p, { role:"assistant", text:lang==="ar"?"❌ تعذّر الاتصال. حاول مجدداً.":"❌ Connection failed. Try again.", type:"error" }]);
      setLoading(false);
    }
  }

  // ── LESSON OPEN / CLOSE ──────────────────────
  function openLesson(d) {
    setLesson(d); setSlide(0); setScreen("lesson");
    setQIdx(0); setSelected(null); setChecked(false);
    setScore(0); setWrongs([]); setShowProof(false);
    setCheckIn(null); setCheckInSelected(null); setCheckInChecked(false);
    killAllAudio();
    speakTimerRef.current = setTimeout(() => { if (d.slides[0]) speakSlide(d.slides[0]); }, 600);
  }
  function closeLesson() { killAllAudio(); setScreen("chat"); setLesson(null); setCheckIn(null); }

  // ── SLIDE NAVIGATION ─────────────────────────
  function goSlide(i) {
    killAllAudio();
    setSlide(i); setCheckIn(null); setCheckInSelected(null); setCheckInChecked(false); setCheckInResult(null);
    speakTimerRef.current = setTimeout(() => { if (lesson?.slides[i]) speakSlide(lesson.slides[i]); }, 300);
  }

  // ── GENERATE CHECK-IN ─────────────────────────
  async function generateCheckIn(sl) {
    setCheckInLoading(true); setCheckIn(null);
    const useOpen = slide % 4 === 2;
    try {
      const prompt = makeCheckInPrompt(lang, studentLevel, sl, useOpen, slide);
      const raw  = await callGroq([{ role:"user", content:prompt }], true, 600, MODEL_FAST);
      const data = safeParseJSON(raw);
      if (!data?.question) throw new Error("bad response");
      if (data.type === "mcq") {
        const rawOpts = (data.options||[]).filter(Boolean);
        const seen = new Set();
        const uniqueOpts = rawOpts.filter(o => { const k=norm(o); if(seen.has(k)) return false; seen.add(k); return true; });
        const exactMatch = uniqueOpts.find(o => norm(o) === norm(data.answer));
        const answer = exactMatch || uniqueOpts[0] || data.answer;
        while (uniqueOpts.length < 4) uniqueOpts.push(`Option ${uniqueOpts.length+1}`);
        const finalOpts = uniqueOpts.slice(0,4);
        if (!finalOpts.some(o => norm(o)===norm(answer))) finalOpts[3] = answer;
        // FIX #3: Ensure exactly ONE correct answer
        const deduped = [];
        let answerAdded = false;
        for (const o of finalOpts) {
          if (norm(o) === norm(answer)) {
            if (!answerAdded) { deduped.push(o); answerAdded = true; }
          } else { deduped.push(o); }
        }
        while (deduped.length < 4) deduped.push(`Option ${deduped.length+1}`);
        setCheckIn({ ...data, options: deduped.slice(0,4), answer, slideIdx: slide });
      } else {
        setCheckIn({ ...data, slideIdx:slide });
      }
    } catch {
      setCheckInLoading(false);
      goSlide(slide + 1);
      return;
    }
    setCheckInLoading(false);
  }

  // ── AI JUDGE ─────────────────────────────────
  async function aiJudge(params) {
    const prompt = makeAiJudgePrompt(lang, params);
    const raw = await callGroq([{ role:"user", content:prompt }], true, 400, MODEL_FAST);
    return safeParseJSON(raw);
  }

  // ── NAVIGATION LOGIC ─────────────────────────
  function handleNext() {
    const isLast = slide === lesson.slides.length - 1;
    if (isLast) { buildQuizThenStart(lesson); return; }
    if ((slide + 1) % 2 === 0) {
      killAllAudio();
      generateCheckIn(lesson.slides[slide]);
      return;
    }
    goSlide(slide + 1);
  }

  // FIX #2: Check-in submit — compute result SYNCHRONOUSLY, set all state in one batch, NO intermediate flash
  function handleCheckInSubmit() {
    if (checkIn?.type === "mcq" && checkInSelected) {
      killAllAudio();

      // Compute correct synchronously BEFORE any setState
      const isCorrect = norm(checkInSelected) === norm(checkIn.answer);
      const feedback = isCorrect
        ? (lang==="ar" ? "✅ " + (checkIn.explanation||"") : "✅ " + (checkIn.explanation||""))
        : (lang==="ar"
            ? `❌ الإجابة الصحيحة: "${checkIn.answer}". ${checkIn.explanation||""}`
            : `❌ Correct answer: "${checkIn.answer}". ${checkIn.explanation||""}`);

      // Set BOTH result and checked in a single React.startTransition batch
      // to prevent any intermediate render showing wrong state
      const result = { correct: isCorrect, feedback };

      // Use functional updater pattern + set both atomically
      setCheckInResult(result);
      setCheckInChecked(true);

      speakTimerRef.current = setTimeout(() => speak(feedback), 400);
    }
  }

  async function submitOpenAnswer(text) {
    if (!text?.trim() || openSubmitting) return;
    setOpenSubmitting(true); setCheckInResult(null);
    try {
      const data = await aiJudge({
        question:         checkIn.question,
        model_answer:     checkIn.model_answer,
        grading_criteria: checkIn.grading_criteria,
        transcript:       text.trim(),
      });
      if (!data) throw new Error("no response");
      setCheckInResult(data);
      setCheckInChecked(true);
      if (data?.feedback) speakTimerRef.current = setTimeout(() => speak(data.feedback), 300);
    } catch {
      const criteria = checkIn.grading_criteria || [];
      const normText = norm(text);
      const matched  = criteria.filter(c => norm(c).split(" ").some(w => w.length > 3 && normText.includes(w)));
      const score_pct = Math.round((matched.length / Math.max(criteria.length, 1)) * 100);
      const isCorrect   = score_pct >= 50;
      const missing   = criteria.filter(c => !norm(c).split(" ").some(w => w.length > 3 && normText.includes(w)));
      const feedback  = isCorrect
        ? (lang==="ar" ? `✅ ممتاز! غطيت النقاط الأساسية.` : `✅ Great! You covered the key points.`)
        : (lang==="ar" ? `📝 جزئي. تذكر: "${missing[0]||""}"` : `📝 Partial. Remember to mention: "${missing[0]||""}"`);
      setCheckInResult({ correct: isCorrect, score_pct, feedback });
      setCheckInChecked(true);
    }
    finally { setOpenSubmitting(false); }
  }

  function handleCheckInContinue() {
    // FIX #1: Kill ALL audio before doing anything
    killAllAudio();

    const correct = checkInResult?.correct ?? (norm(checkInSelected)===norm(checkIn?.answer));
    setCheckIn(null); setCheckInSelected(null); setCheckInChecked(false); setCheckInResult(null); setOpenAnswer("");
    if (correct) goSlide(slide + 1); else goSlide(slide);
  }

  // ── QUIZ ─────────────────────────────────────
  // FIX #1 + FIX #2: Kill audio on every quiz transition, compute synchronously
  function checkAnswer() {
    if (!selected || checked) return;

    // FIX #1: Kill ALL audio immediately before processing
    killAllAudio();

    const q = lesson.quiz[qIdx];
    // FIX #2: Compute correct SYNCHRONOUSLY before any setState
    const isCorrect = norm(selected) === norm(q.answer);
    const feedback = isCorrect
      ? (lang==="ar" ? "✅ إجابة صحيحة! " + (q.explanation||"") : "✅ Correct! " + (q.explanation||""))
      : (lang==="ar"
          ? `❌ الإجابة الصحيحة: "${q.answer}". ${q.explanation||""}`
          : `❌ Correct answer: "${q.answer}". ${q.explanation||""}`);

    // Set all state atomically — React 18 batches these in event handlers
    const resultData = { correct: isCorrect, feedback, matched_option: selected };
    setQuizFeedback(resultData);
    setChecked(true);
    setShowProof(false);
    if (isCorrect) setScore(s => s + 1);
    else setWrongs(w => [...w, q.question]);

    speakTimerRef.current = setTimeout(() => speak(feedback), 400);
  }

  async function submitQuizOpenAnswer(text) {
    if (!text?.trim() || quizAiChecking) return;
    setQuizAiChecking(true); setQuizFeedback(null);
    const q = lesson.quiz[qIdx];
    try {
      const data = await aiJudge({ question:q.question, model_answer:q.model_answer, grading_criteria:q.grading_criteria, transcript:text.trim() });
      setChecked(true); setQuizFeedback(data);
      if (data?.correct) setScore(s=>s+1); else setWrongs(w=>[...w,q.question]);
      if (data?.feedback) speakTimerRef.current = setTimeout(() => speak(data.feedback), 300);
    } catch { setChecked(true); }
    finally { setQuizAiChecking(false); }
  }

  async function voiceAnswer(mode) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError(t.voiceNotSupported); return; }
    killAllAudio();
    setVoiceError(""); setVoiceTranscript("");
    setVoiceMode("answer_"+mode); setVoiceListening(true);
    const rec = new SR();
    rec.lang = lang==="ar" ? "ar-EG" : "en-US";
    rec.interimResults = true; rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onresult = e => setVoiceTranscript(Array.from(e.results).map(r=>r[0].transcript).join(""));
    rec.onerror  = e => { setVoiceListening(false); setVoiceMode(null); if (e.error!=="aborted") setVoiceError(t.voiceError); };
    rec.onend    = () => { setVoiceListening(false); setVoiceTranscript(prev => { if (prev.trim()) judgeVoiceAnswer(prev.trim(),mode); else setVoiceMode(null); return ""; }); };
    rec.start();
  }

  async function judgeVoiceAnswer(transcript, mode) {
    setVoiceMode("judging");
    const isQuiz = mode === "quiz";
    const q = isQuiz ? lesson.quiz[qIdx] : checkIn;
    if (!q) { setVoiceMode(null); return; }
    const isOpen = q.type === "open";

    try {
      if (isOpen) {
        const data = await aiJudge({
          question:         q.question,
          model_answer:     q.model_answer,
          grading_criteria: q.grading_criteria,
          transcript,
        });
        if (!data) throw new Error("no response");
        if (isQuiz) { setChecked(true); setQuizFeedback(data); if (data.correct) setScore(s=>s+1); else setWrongs(w=>[...w,q.question]); }
        else        { setCheckInResult(data); setCheckInChecked(true); }
        if (data?.feedback) speakTimerRef.current = setTimeout(() => speak(data.feedback), 300);
      } else {
        const opts = q.options || [];
        const normT = norm(transcript);
        const matched2 = opts.find(o => normT.includes(norm(o))) ||
                         opts.find(o => norm(o).split(" ").some(w => w.length>3 && normT.includes(w))) ||
                         null;
        // FIX #2: Compute correct synchronously
        const isCorrect = matched2 ? norm(matched2) === norm(q.answer) : false;
        const feedback = isCorrect
          ? (lang==="ar" ? "✅ إجابة صحيحة! " + (q.explanation||"") : "✅ Correct! " + (q.explanation||""))
          : (lang==="ar"
              ? `❌ الإجابة الصحيحة: "${q.answer}". ${q.explanation||""}`
              : `❌ Correct answer: "${q.answer}". ${q.explanation||""}`);
        const data = { correct: isCorrect, feedback, matched_option: matched2 };
        if (isQuiz) {
          setSelected(matched2||transcript); setChecked(true); setShowProof(false); setQuizFeedback(data);
          if (isCorrect) setScore(s=>s+1); else setWrongs(w=>[...w,q.question]);
        } else {
          setCheckInResult(data); setCheckInChecked(true);
          setCheckInSelected(matched2||transcript);
        }
        speakTimerRef.current = setTimeout(() => speak(feedback), 300);
      }
    } catch { /* silent */ } finally { setVoiceMode(null); }
  }

  // FIX #1: nextQuestion kills ALL audio before transitioning
  function nextQuestion() {
    // Kill ALL audio — TTS + pending timers
    killAllAudio();

    if (qIdx < lesson.quiz.length - 1) {
      setQIdx(q => q + 1);
      setSelected(null); setChecked(false);
      setShowProof(false); setProofText(""); setQuizFeedback(null); setOpenAnswer("");
    } else {
      recordQuizResult(lesson.topic, score, lesson.quiz.length, wrongs);
      setStreak(s => s + 1);
      setXp(x => x + 20 + score * 10);
      setScreen("report");
    }
  }

  async function fetchProof(question, answer, explanation) {
    setShowProof(true); setProofText(""); setProofLoading(true);
    try {
      const res = await callGroq([{ role:"user", content:makeProofPrompt(lang,question,answer,explanation) }], false, 600, MODEL_FAST);
      setProofText(res);
    } catch (err) { setProofText("Error: "+err.message); }
    finally { setProofLoading(false); }
  }

  function md(s) {
    return (s||"").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");
  }

  // ════════════════════════════════════════════
  // REPORT SCREEN
  // ════════════════════════════════════════════
  if (screen === "report" && lesson) {
    const total    = lesson.quiz?.length || 0;
    const pct      = total > 0 ? Math.round((score / total) * 100) : 0;
    const lvlInfo  = getLevelInfo(pct, lang);
    const nextStep = getNextStep(pct, lesson.weak_points, lang);
    return (
      <div style={{ ...S.root, direction:isRTL?"rtl":"ltr", alignItems:"flex-start", padding:20, overflowY:"auto" }}>
        <Orbs />
        <div style={S.reportWrap}>
          <div style={S.reportHeader}>
            <div style={{ fontSize:52 }}>{lvlInfo.icon}</div>
            <div>
              <h2 style={S.reportTitle}>{t.reportTitle}</h2>
              <p style={{ color:"rgba(167,139,250,.5)", fontSize:13 }}>{lesson.topic}</p>
            </div>
          </div>
          <div style={S.statsRow}>
            <StatCard label={t.score} value={`${score}/${total}`} sub={`${pct}%`} subColor={lvlInfo.color} bar={pct} />
            <StatCard label={t.level} value={lvlInfo.label} icon={lvlInfo.icon} valueColor={lvlInfo.color} />
            <StatCard label={t.focus} value={lvlInfo.focus} icon="🎯" valueColor={lvlInfo.focusColor} small />
          </div>
          <Section title={`📖 ${t.summary}`}>
            <p style={S.summaryText}>{lesson.lesson_summary}</p>
          </Section>
          <div style={S.twoCol}>
            <Section title={`✅ ${t.strengths}`} titleColor="#34d399">
              {(lesson.strong_points||[]).map((p,i) => <Point key={i} text={p} color="#34d399" />)}
            </Section>
            <Section title={`📌 ${t.improve}`} titleColor="#f87171">
              {(lesson.weak_points||[]).map((p,i) => <Point key={i} text={p} color="#f87171" />)}
              {wrongs.map((q,i) => <Point key={"w"+i} text={q} color="#f87171" small />)}
            </Section>
          </div>
          {lesson.study_tips?.length > 0 && (
            <Section title={`💡 ${lang==="ar"?"نصايح للتطوير":"Study Tips"}`} titleColor="#fbbf24">
              {lesson.study_tips.map((tip,i) => (
                <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ color:"#fbbf24", fontSize:13 }}>→</span>
                  <p style={{ fontSize:13, color:"rgba(226,232,240,0.8)", lineHeight:1.7 }}>{tip}</p>
                </div>
              ))}
            </Section>
          )}
          <div style={{ ...S.nextStepBox, borderColor:nextStep.color+"55", background:nextStep.color+"11" }}>
            <div style={{ fontSize:12, fontWeight:800, color:nextStep.color, letterSpacing:1, marginBottom:8 }}>
              🗺️ {t.nextStep}
            </div>
            <p style={{ fontSize:14, color:"rgba(226,232,240,0.9)" }}>{nextStep.msg}</p>
          </div>
          <div style={S.xpGained}>
            <span style={{ fontSize:22 }}>⭐</span>
            <span style={{ color:"#fbbf24", fontWeight:800, fontSize:17 }}>+{20+score*10} XP {lang==="ar"?"اكتسبت":"Earned"}</span>
            <span style={{ color:"rgba(251,191,36,.5)", fontSize:13 }}>🔥 Streak: {streak}</span>
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button style={S.reportBtn} onClick={closeLesson}>{t.backToChat}</button>
            <button style={{ ...S.reportBtn, background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.4)" }}
              onClick={() => openLesson(lesson)}>{t.tryAgain}</button>
          </div>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ════════════════════════════════════════════
  // QUIZ SCREEN
  // ════════════════════════════════════════════
  if (screen === "quiz" && lesson?.quiz) {
    const q = lesson.quiz[qIdx];
    if (!q) return <div style={{ ...S.root, color:"#fff" }}>Loading quiz...</div>;
    // FIX #2: Use quizFeedback.correct as source of truth — computed synchronously in checkAnswer
    const isCorrect = checked && (quizFeedback?.correct ?? false);
    const progress  = ((qIdx+1) / lesson.quiz.length) * 100;
    return (
      <div style={{ ...S.root, direction:isRTL?"rtl":"ltr" }}>
        <Orbs />
        <div style={S.lessonWrap}>
          <TopBar title={t.quizTitle} count={`${qIdx+1} / ${lesson.quiz.length}`} onBack={closeLesson} backLabel={t.back} />
          <ProgressBar value={progress} />
          {q.type && <div style={{ display:"flex" }}><span style={S.quizTypeBadge}>{q.type?.toUpperCase()}</span></div>}
          <div style={S.quizCard}>
            <p style={S.quizQ}>{q.question}</p>
            {q.type === "open" && <span style={{ fontSize:10, color:"#fbbf24", fontWeight:800, letterSpacing:1 }}>OPEN-ENDED ✍️</span>}
            {(voiceMode==="answer_quiz"||voiceMode==="judging") && (
              <div style={S.voiceAnswerFeedback}>
                <span style={{ animation:"pulse 1s ease-in-out infinite", display:"inline-block", color:voiceMode==="judging"?"#fbbf24":"#f87171", fontSize:14 }}>●</span>
                <span style={{ color:voiceMode==="judging"?"#fbbf24":"#f87171", fontSize:13, fontWeight:700 }}>
                  {voiceMode==="judging"?t.voiceJudging:(voiceListening?t.voiceListening:t.voiceProcessing)}
                </span>
                {voiceTranscript && <span style={{ color:"rgba(226,232,240,0.6)", fontSize:12, flex:1, fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{voiceTranscript}"</span>}
                {voiceMode !== "judging" && <button onClick={stopVoice} style={S.voiceStopBtn}>✕</button>}
              </div>
            )}
            {q.type !== "open" && (
              <>
                <div style={S.optionsWrap}>
                  {(q.options||[]).map((opt,i) => {
                    let bg="rgba(124,58,237,0.07)",border="1px solid rgba(124,58,237,0.2)",color="#e2e8f0";
                    if (checked) {
                      const studentChose   = norm(opt)===norm(selected);
                      const isCorrectOpt   = norm(opt)===norm(q.answer);
                      const studentWasRight = quizFeedback?.correct ?? false;
                      if (studentChose && studentWasRight)       { bg="rgba(16,185,129,0.2)";    border="1px solid #10b981"; color="#34d399"; }
                      else if (studentChose && !studentWasRight) { bg="rgba(239,68,68,0.2)";     border="1px solid #ef4444"; color="#f87171"; }
                      else if (isCorrectOpt && !studentWasRight) { bg="rgba(16,185,129,0.08)";   border="1px dashed #10b981"; color="#6ee7b7"; }
                    } else if (norm(opt)===norm(selected))        { bg="rgba(124,58,237,0.25)";  border="1px solid #a78bfa"; }
                    return (
                      <button key={i} style={{ ...S.optBtn, background:bg, border, color }}
                        onClick={() => { if (!checked && !quizAiChecking) setSelected(opt); }}>{opt}</button>
                    );
                  })}
                </div>
                {!checked && (
                  <button onMouseDown={()=>voiceAnswer("quiz")} onMouseUp={()=>recognitionRef.current?.stop()}
                    onTouchStart={e=>{e.preventDefault();voiceAnswer("quiz");}} onTouchEnd={()=>recognitionRef.current?.stop()}
                    disabled={!!voiceMode}
                    style={{ ...S.voiceAnswerBtn, opacity:voiceMode?0.4:1, background:voiceMode==="answer_quiz"?"rgba(239,68,68,0.2)":"rgba(124,58,237,0.08)", borderColor:voiceMode==="answer_quiz"?"#ef4444":"rgba(124,58,237,0.25)" }}>
                    <span>🎤</span><span>{voiceMode==="answer_quiz"?t.voiceListening:voiceMode==="judging"?t.voiceJudging:t.voiceAnswerHint}</span>
                  </button>
                )}
              </>
            )}
            {q.type === "open" && !checked && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <textarea value={openAnswer} onChange={e=>setOpenAnswer(e.target.value)}
                  onKeyDown={e=>{ if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); submitQuizOpenAnswer(openAnswer); } }}
                  placeholder={lang==="ar"?"اكتب إجابتك هنا...":"Write your answer here..."}
                  disabled={quizAiChecking} rows={3}
                  style={{ ...S.slideChatInput, textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr", opacity:quizAiChecking?0.5:1, fontSize:14, padding:"12px 16px" }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ ...S.navBtn, flex:1, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff", opacity:openAnswer.trim()&&!quizAiChecking?1:0.4 }}
                    onClick={()=>submitQuizOpenAnswer(openAnswer)} disabled={!openAnswer.trim()||quizAiChecking}>
                    {quizAiChecking?<LoadingDots />:t.quizCheck}
                  </button>
                  <button onMouseDown={()=>voiceAnswer("quiz")} onMouseUp={()=>recognitionRef.current?.stop()}
                    onTouchStart={e=>{e.preventDefault();voiceAnswer("quiz");}} onTouchEnd={()=>recognitionRef.current?.stop()}
                    disabled={!!voiceMode||quizAiChecking}
                    style={{ ...S.voiceMicBtn, width:46, height:46, background:voiceMode==="answer_quiz"?"rgba(239,68,68,0.3)":"rgba(124,58,237,0.12)", borderColor:voiceMode==="answer_quiz"?"#ef4444":"rgba(124,58,237,0.3)" }}>
                    🎤
                  </button>
                </div>
              </div>
            )}
            {checked && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ ...S.feedbackBox, background:isCorrect?"rgba(16,185,129,0.15)":q.type==="open"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.15)", borderColor:isCorrect?"#10b981":q.type==="open"?"#fbbf24":"#ef4444" }}>
                  <p style={{ color:isCorrect?"#34d399":q.type==="open"?"#fbbf24":"#f87171", fontWeight:800, fontSize:16, marginBottom:6 }}>
                    {q.type==="open"
                      ? (quizFeedback?.correct?(lang==="ar"?"✅ إجابة ممتازة!":"✅ Excellent answer!"):(lang==="ar"?"📝 إجابة جزئية":"📝 Partial answer"))
                      : (isCorrect?t.correct:t.wrong+q.answer)}
                    {quizFeedback?.score_pct!==undefined&&q.type==="open"&&<span style={{ fontSize:12, opacity:0.7, marginLeft:8 }}>({quizFeedback.score_pct}%)</span>}
                  </p>
                  {(quizFeedback?.feedback||q.explanation) && <p style={{ color:"rgba(226,232,240,0.85)", fontSize:13, lineHeight:1.7 }}>{quizFeedback?.feedback||q.explanation}</p>}
                </div>
                {q.type !== "open" && !showProof && (
                  <button onClick={()=>fetchProof(q.question,q.answer,q.explanation)} style={S.proofBtn}>
                    <span>📐</span><span>{t.proofLabel}</span>
                  </button>
                )}
                {showProof && (
                  <div style={S.proofBox}>
                    <div style={S.proofHeader}><span>📐</span><span style={{ color:"#fbbf24" }}>{t.proofLabel}</span></div>
                    {proofLoading?<LoadingDots color="#fbbf24"/>
                      :<p style={{ fontSize:13.5, color:"rgba(226,232,240,0.88)", lineHeight:2, whiteSpace:"pre-line", textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr" }}>{proofText}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={S.controls}>
            {!checked
              ? (q.type!=="open" &&
                  <button style={{ ...S.navBtn, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff", opacity:selected&&!quizAiChecking?1:0.4 }}
                    onClick={checkAnswer} disabled={!selected||quizAiChecking}>
                    {quizAiChecking?<LoadingDots />:t.quizCheck}
                  </button>)
              : <button style={{ ...S.navBtn, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff" }} onClick={nextQuestion}>
                  {qIdx<lesson.quiz.length-1?t.quizNext:t.quizFinish}
                </button>
            }
          </div>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ════════════════════════════════════════════
  // LESSON SCREEN
  // ════════════════════════════════════════════
  if (screen === "lesson" && lesson) {
    const sl    = lesson.slides[slide];
    const col   = COLORS[sl?.type] || COLORS.concept;
    const pct   = ((slide+1) / lesson.slides.length) * 100;
    const isLast = slide === lesson.slides.length - 1;
    return (
      <div style={{ ...S.root, direction:isRTL?"rtl":"ltr" }}>
        <Orbs />
        <div style={S.lessonWrap}>
          <TopBar title={lesson.topic||t.lessonTitle} count={`${slide+1} / ${lesson.slides.length}`} onBack={closeLesson} backLabel={t.back} />
          <ProgressBar value={pct} />
          {checkInLoading ? (
            <div style={{ ...S.checkInCard, alignItems:"center", justifyContent:"center", gap:14, minHeight:120 }}>
              <LoadingDots color="#fbbf24" />
              <span style={{ color:"rgba(251,191,36,0.8)", fontSize:13, fontWeight:700 }}>
                {lang==="ar"?"جاري تحضير سؤال...":"Preparing question..."}
              </span>
            </div>
          ) : checkIn ? (
            <div style={S.checkInCard}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={S.checkInTitle}>{t.checkInTitle}</div>
                {checkIn.type==="open" && <span style={{ fontSize:10, color:"#fbbf24", fontWeight:800, letterSpacing:1 }}>OPEN ✍️</span>}
              </div>
              <p style={S.quizQ}>{checkIn.question}</p>
              {checkIn.type === "mcq" && (
                <>
                  <div style={S.optionsWrap}>
                    {(checkIn.options||[]).map((opt,i) => {
                      let bg="rgba(124,58,237,0.07)",border="1px solid rgba(124,58,237,0.2)",color="#e2e8f0";
                      if (checkInChecked) {
                        const studentChose    = norm(opt)===norm(checkInSelected);
                        const isCorrectOpt    = norm(opt)===norm(checkIn.answer);
                        // FIX #2: Use checkInResult.correct as source of truth — no re-computation
                        const studentWasRight = checkInResult?.correct ?? false;
                        if (studentChose && studentWasRight)       { bg="rgba(16,185,129,0.2)";  border="1px solid #10b981"; color="#34d399"; }
                        else if (studentChose && !studentWasRight) { bg="rgba(239,68,68,0.2)";   border="1px solid #ef4444"; color="#f87171"; }
                        else if (isCorrectOpt && !studentWasRight) { bg="rgba(16,185,129,0.08)"; border="1px dashed #10b981"; color="#6ee7b7"; }
                      } else if (norm(opt)===norm(checkInSelected)) { bg="rgba(124,58,237,0.25)"; border="1px solid #a78bfa"; }
                      return <button key={i} style={{ ...S.optBtn, background:bg, border, color }}
                        onClick={()=>{ if (!checkInChecked) setCheckInSelected(opt); }}>{opt}</button>;
                    })}
                  </div>
                  {!checkInChecked ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                      <button style={{ ...S.navBtn, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff", opacity:checkInSelected?1:0.4 }}
                        onClick={handleCheckInSubmit} disabled={!checkInSelected}>{t.quizCheck}</button>
                      <button onMouseDown={()=>voiceAnswer("checkin")} onMouseUp={()=>recognitionRef.current?.stop()}
                        onTouchStart={e=>{e.preventDefault();voiceAnswer("checkin");}} onTouchEnd={()=>recognitionRef.current?.stop()}
                        disabled={!!voiceMode}
                        style={{ ...S.voiceAnswerBtn, opacity:voiceMode?0.4:1 }}>
                        <span>🎤</span><span>{t.voiceAnswerHint}</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ ...S.feedbackBox, background:checkInResult?.correct?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)", borderColor:checkInResult?.correct?"#10b981":"#ef4444" }}>
                        <p style={{ color:checkInResult?.correct?"#34d399":"#f87171", fontWeight:800 }}>
                          {checkInResult?.correct ? t.checkInCorrect : t.checkInWrong}
                        </p>
                        {checkInResult?.feedback && <p style={{ fontSize:13, color:"rgba(226,232,240,0.8)", lineHeight:1.7, marginTop:6 }}>{checkInResult.feedback}</p>}
                      </div>
                      <button style={{ ...S.navBtn, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff" }} onClick={handleCheckInContinue}>
                        {checkInResult?.correct ? t.next : (lang==="ar"?"أعد الشريحة":"Replay Slide")}
                      </button>
                    </div>
                  )}
                </>
              )}
              {checkIn.type === "open" && (
                !checkInChecked ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <p style={{ fontSize:12, color:"rgba(167,139,250,0.6)", lineHeight:1.6 }}>
                      {lang==="ar"?"💡 تلميح — الإجابة الجيدة يجب تذكر:":"💡 Hint — a good answer should mention:"}
                      <br/>
                      {(checkIn.grading_criteria||[]).map((c,i) => (
                        <span key={i} style={{ display:"inline-block", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:8, padding:"2px 8px", margin:"2px 3px", fontSize:11, color:"#c4b5fd" }}>{c}</span>
                      ))}
                    </p>
                    <textarea value={openAnswer} onChange={e=>setOpenAnswer(e.target.value)}
                      onKeyDown={e=>{ if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); submitOpenAnswer(openAnswer); } }}
                      placeholder={lang==="ar"?"اكتب إجابتك هنا...":"Write your answer here..."}
                      disabled={openSubmitting} rows={3}
                      style={{ ...S.slideChatInput, textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr", opacity:openSubmitting?0.5:1, fontSize:14, padding:"12px 16px" }} />
                    <div style={{ display:"flex", gap:8 }}>
                      <button style={{ ...S.navBtn, flex:1, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff", opacity:openAnswer.trim()&&!openSubmitting?1:0.4 }}
                        onClick={()=>submitOpenAnswer(openAnswer)} disabled={!openAnswer.trim()||openSubmitting}>
                        {openSubmitting?<LoadingDots />:t.quizCheck}
                      </button>
                      <button onMouseDown={()=>voiceAnswer("checkin_open")} onMouseUp={()=>recognitionRef.current?.stop()}
                        onTouchStart={e=>{e.preventDefault();voiceAnswer("checkin_open");}} onTouchEnd={()=>recognitionRef.current?.stop()}
                        disabled={!!voiceMode||openSubmitting}
                        style={{ ...S.voiceMicBtn, width:46, height:46, background:voiceMode?.includes("checkin_open")?"rgba(239,68,68,0.3)":"rgba(124,58,237,0.12)", borderColor:voiceMode?.includes("checkin_open")?"#ef4444":"rgba(124,58,237,0.3)" }}>
                        🎤
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
                    <div style={{ ...S.feedbackBox, background:checkInResult?.correct?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.1)", borderColor:checkInResult?.correct?"#10b981":"#fbbf24" }}>
                      <p style={{ color:checkInResult?.correct?"#34d399":"#fbbf24", fontWeight:800, marginBottom:6 }}>
                        {checkInResult?.correct
                          ? (lang==="ar"?"✅ إجابة ممتازة!":"✅ Great answer!")
                          : (lang==="ar"?"📝 تقريباً صح — اقرأ الإجابة النموذجية":"📝 Almost — see the model answer")}
                        {checkInResult?.score_pct !== undefined && (
                          <span style={{ fontSize:12, opacity:0.7, marginLeft:8 }}>({checkInResult.score_pct}%)</span>
                        )}
                      </p>
                      {checkInResult?.feedback && (
                        <p style={{ fontSize:13, color:"rgba(226,232,240,0.85)", lineHeight:1.8, marginBottom:8 }}>{checkInResult.feedback}</p>
                      )}
                      <div style={{ background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:10, padding:"10px 14px" }}>
                        <div style={{ fontSize:10, fontWeight:800, letterSpacing:1, color:"#a78bfa", marginBottom:4 }}>
                          {lang==="ar"?"📖 الإجابة النموذجية":"📖 MODEL ANSWER"}
                        </div>
                        <p style={{ fontSize:13, color:"rgba(226,232,240,0.8)", lineHeight:1.7 }}>{checkIn.model_answer}</p>
                      </div>
                    </div>
                    <button style={{ ...S.navBtn, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", color:"#fff" }} onClick={handleCheckInContinue}>
                      {checkInResult?.correct ? t.next : (lang==="ar"?"أعد الشريحة":"Replay Slide")}
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <>
              <div style={{ ...S.slideCard, background:col.bg, borderColor:col.border }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                  <span style={{ fontSize:48 }}>{sl?.emoji}</span>
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:3, color:col.accent, fontFamily:"Syne,sans-serif" }}>{col.label}</div>
                    <h2 style={S.slideH}>{sl?.title}</h2>
                  </div>
                </div>
                <p style={{ ...S.slideP, textAlign:isRTL?"right":"left" }}>{sl?.content}</p>
                {sl?.keypoints?.length > 0 && (
                  <div style={S.keypointsBox}>
                    {sl.keypoints.map((kp,i) => (
                      <div key={i} style={S.keypoint}>
                        <span style={{ color:col.accent, marginLeft:isRTL?8:0, marginRight:isRTL?0:8 }}>▸</span>{kp}
                      </div>
                    ))}
                  </div>
                )}
                {sl?.example && (
                  <div style={{ ...S.exampleBox, borderLeftColor:col.accent }}>
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:col.accent, marginBottom:6, fontFamily:"Syne,sans-serif" }}>
                      {lang==="ar"?"✏️ مثال محلول":"✏️ WORKED EXAMPLE"}
                    </div>
                    <p style={{ fontSize:13, color:"rgba(226,232,240,0.9)", lineHeight:1.9, fontFamily:"monospace", whiteSpace:"pre-wrap", textAlign:isRTL?"right":"left" }}>{sl.example}</p>
                  </div>
                )}
                {sl?.tip && (
                  <div style={S.tipBox}>
                    <span style={{ fontSize:16 }}>💡</span>
                    <p style={{ fontSize:12, color:"rgba(251,191,36,0.9)", lineHeight:1.7, textAlign:isRTL?"right":"left" }}>{sl.tip}</p>
                  </div>
                )}
              </div>
              <div style={S.narrationBox}>
                <div style={S.narLabel}>{t.narrationLabel}</div>
                <p style={{ ...S.narText, textAlign:isRTL?"right":"left" }}>{sl?.narration}</p>
              </div>
              <div style={S.dots}>
                {lesson.slides.map((_,i) => (
                  <div key={i} onClick={()=>goSlide(i)}
                    style={{ ...S.dotEl, background:i===slide?"#a78bfa":"rgba(167,139,250,0.2)", transform:i===slide?"scale(1.4)":"scale(1)" }} />
                ))}
              </div>
              <div style={S.controls}>
                <button style={{ ...S.navBtn, opacity:slide===0?0.3:1 }} onClick={()=>{ if (slide>0) goSlide(slide-1); }}>{t.prev}</button>
                <button style={{ ...S.voiceBtn, background:speaking?"rgba(239,68,68,.2)":"rgba(124,58,237,.2)", borderColor:speaking?"#ef4444":"#7c3aed" }}
                  onClick={()=>{ speaking?stopSpeech():speakSlide(sl); }}>
                  {speaking?t.stop:t.listen}
                </button>
                <button style={{ ...S.navBtn, ...(isLast?{ background:"rgba(16,185,129,.2)", borderColor:"#10b981", color:"#34d399" }:{}), opacity:quizLoading?0.6:1 }}
                  onClick={handleNext} disabled={quizLoading}>
                  {quizLoading?<LoadingDots color="#34d399"/>:(isLast?t.done:t.next)}
                </button>
              </div>
              {/* SLIDE CHAT */}
              <div style={S.slideChatWrap}>
                {voiceMode === "slide" && (
                  <div style={{ ...S.voiceFeedback, marginBottom:8 }}>
                    <span style={{ animation:"pulse 1s ease-in-out infinite", display:"inline-block", color:"#f87171", fontSize:14 }}>●</span>
                    <span style={{ color:"#f87171", fontSize:12, fontWeight:700 }}>{voiceListening?t.voiceListening:t.voiceProcessing}</span>
                    {voiceTranscript && <span style={{ color:"rgba(226,232,240,0.6)", fontSize:11, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{voiceTranscript}"</span>}
                    <button onClick={stopVoice} style={{ ...S.voiceStopBtn, fontSize:10, padding:"2px 7px" }}>✕</button>
                  </div>
                )}
                <div style={S.slideChatInner}>
                  {isRTL && (
                    <>
                      <button style={{ ...S.slideSendBtn, opacity:slideInput.trim()&&!slideUpdating?1:0.3 }}
                        onClick={sendSlideChat} disabled={!slideInput.trim()||slideUpdating}>
                        {slideUpdating?"⏳":"✨"}
                      </button>
                      <button onMouseDown={()=>startVoice("slide")} onMouseUp={stopVoice}
                        onTouchStart={e=>{e.preventDefault();startVoice("slide");}} onTouchEnd={stopVoice}
                        style={{ ...S.voiceMicBtn, width:38, height:38, background:voiceMode==="slide"?"rgba(239,68,68,0.3)":"rgba(124,58,237,0.12)", borderColor:voiceMode==="slide"?"#ef4444":"rgba(124,58,237,0.2)", fontSize:16 }}>
                        🎤
                      </button>
                    </>
                  )}
                  <textarea value={voiceMode==="slide"?(voiceTranscript||""):slideInput}
                    onChange={e=>{ if (!voiceMode) setSlideInput(e.target.value); }}
                    onKeyDown={e=>{ if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendSlideChat(); } }}
                    placeholder={slideUpdating?t.slideChatUpdating:voiceMode==="slide"?t.voiceListening:t.slideChatPlaceholder}
                    disabled={slideUpdating} rows={1}
                    style={{ ...S.slideChatInput, textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr", opacity:slideUpdating?0.5:1, borderColor:voiceMode==="slide"?"rgba(239,68,68,0.4)":"rgba(124,58,237,0.2)" }} />
                  {!isRTL && (
                    <>
                      <button onMouseDown={()=>startVoice("slide")} onMouseUp={stopVoice}
                        onTouchStart={e=>{e.preventDefault();startVoice("slide");}} onTouchEnd={stopVoice}
                        style={{ ...S.voiceMicBtn, width:38, height:38, background:voiceMode==="slide"?"rgba(239,68,68,0.3)":"rgba(124,58,237,0.12)", borderColor:voiceMode==="slide"?"#ef4444":"rgba(124,58,237,0.2)", fontSize:16 }}>
                        🎤
                      </button>
                      <button style={{ ...S.slideSendBtn, opacity:slideInput.trim()&&!slideUpdating?1:0.3 }}
                        onClick={sendSlideChat} disabled={!slideInput.trim()||slideUpdating}>
                        {slideUpdating?"⏳":"✨"}
                      </button>
                    </>
                  )}
                </div>
                <p style={S.slideChatHint}>{voiceMode==="slide"?t.voiceHold:t.slideChatHint}</p>
              </div>
            </>
          )}
          {quizLoading && (
            <div style={S.quizLoadingOverlay}>
              <LoadingDots color="#34d399" />
              <span style={{ color:"#34d399", fontSize:13, fontWeight:700 }}>{t.quizLoading}</span>
            </div>
          )}
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ════════════════════════════════════════════
  // CHAT SCREEN
  // ════════════════════════════════════════════
  if (!messages) return null;
  return (
    <div style={{ ...S.root, direction:isRTL?"rtl":"ltr" }}>
      <Orbs />
      <div style={S.container}>
        <header style={S.header}>
          <div style={S.logo}>
            <div style={S.logoIcon}>E</div>
            <div>
              <div style={S.logoName}>ELVA</div>
              <div style={S.logoSub}>{t.subtitle}</div>
            </div>
          </div>
          <div style={S.headerRight}>
            <div style={S.pill}>🔥 {streak}</div>
            <div style={S.pill}>⭐ {xp}</div>
            <div style={S.lvl}>LV{level}</div>
            <button style={S.langBtn} onClick={()=>{ killAllAudio(); setScreen("chat"); setLesson(null); setChatHistory([]); setStudentLevel(null); setLessonTopic(null); setLang(l=>l==="ar"?"en":"ar"); }}>{t.toggleLang}</button>
            <button onClick={()=>setShowVoicePicker(p=>!p)} style={{ ...S.langBtn, background:showVoicePicker?"rgba(251,191,36,.25)":"rgba(251,191,36,.1)", borderColor:"rgba(251,191,36,.35)", color:"#fbbf24" }}>🎙️</button>
          </div>
        </header>
        <div style={S.xpTrack}><div style={{ ...S.xpFill, width:xpProg+"%" }} /></div>
        {showVoicePicker && (
          <div style={S.voicePanel}>
            <div style={S.voicePanelTitle}>🎙️ {lang==="ar"?"اختار صوت إلفا":"CHOOSE ELVA VOICE"}</div>
            <div style={S.voiceList}>
              {allVoices.filter(v=>lang==="ar"?v.lang.startsWith("ar"):v.lang.startsWith("en")).map((v,i) => {
                const isSel = selectedVoice?.name === v.name;
                const isPrem = ["google","natural","online","neural","enhanced","premium","siri","samantha","karen"].some(k=>v.name.toLowerCase().includes(k));
                return (
                  <button key={i} onClick={()=>{ setSelectedVoice(v); killAllAudio(); const u=new SpeechSynthesisUtterance(lang==="ar"?"مرحباً! أنا إلفا.":"Hello! I am ELVA."); u.voice=v; u.rate=0.9; window.speechSynthesis.speak(u); }}
                    style={{ ...S.voiceBtn2, background:isSel?"rgba(124,58,237,.35)":"rgba(124,58,237,.07)", borderColor:isSel?"#a78bfa":"rgba(124,58,237,.2)", color:isSel?"#fff":"#c4b5fd" }}>
                    {isPrem?"⭐":"🔈"} {v.name.replace("Microsoft ","").replace("Google ","").split(" ").slice(0,3).join(" ")}
                  </button>
                );
              })}
            </div>
            {selectedVoice && <div style={{ fontSize:11, color:"rgba(52,211,153,.8)", fontWeight:600 }}>✅ {selectedVoice.name}</div>}
          </div>
        )}
        <div style={S.chips}>
          {t.subjects.map(s => (
            <button key={s.label} style={S.chip} onClick={()=>send(s.prompt)}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <div style={S.chat}>
          {messages.map((msg,i) => {
            const isLast = i === messages.length - 1;
            return (
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:8, animation:"in .3s ease" }}>
                <div style={msg.role==="user"?S.userRow:S.botRow}>
                  {msg.role==="assistant" && <div style={S.elvaAv}>E</div>}
                  <div style={msg.role==="user"?S.userBubble:S.botBubble}>
                    <span dangerouslySetInnerHTML={{ __html:md(msg.text) }} />
                    {msg.type==="lesson-ready" && msg.lessonData && (
                      <button style={S.openBtn} onClick={()=>openLesson(msg.lessonData)}>{t.openLesson}</button>
                    )}
                  </div>
                  {msg.role==="user" && <div style={S.userAv}>👤</div>}
                </div>
                {msg.choices?.length>0 && isLast && !loading && (
                  <div style={{ paddingRight:isRTL?0:48, paddingLeft:isRTL?48:0, display:"flex", flexWrap:"wrap", gap:8 }}>
                    {msg.choices.map((choice,ci) => (
                      <button key={ci} onClick={()=>send(choice)} style={S.choiceBtn}
                        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(124,58,237,0.28)"; e.currentTarget.style.color="#fff"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background="rgba(124,58,237,0.12)"; e.currentTarget.style.color="#c4b5fd"; }}>
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div style={S.botRow}>
              <div style={S.elvaAv}>E</div>
              <div style={{ ...S.botBubble, display:"flex", alignItems:"center", gap:8 }}>
                <LoadingDots />
                <span style={{ fontSize:12, color:"rgba(167,139,250,.7)" }}>{t.loadingSteps[loadingStep]}</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={S.inputArea}>
          {voiceMode==="chat" && (
            <div style={S.voiceFeedback}>
              <span style={{ animation:"pulse 1s ease-in-out infinite", display:"inline-block", color:"#f87171", fontSize:16 }}>●</span>
              <span style={{ color:voiceListening?"#f87171":"#fbbf24", fontSize:13, fontWeight:700 }}>{voiceListening?t.voiceListening:t.voiceProcessing}</span>
              {voiceTranscript && <span style={{ color:"rgba(226,232,240,0.7)", fontSize:12, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{voiceTranscript}"</span>}
              <button onClick={stopVoice} style={S.voiceStopBtn}>✕</button>
            </div>
          )}
          {voiceError && <p style={{ fontSize:11, color:"#f87171", marginBottom:6, textAlign:"center" }}>{voiceError}</p>}
          <div style={S.inputWrap}>
            {isRTL && (
              <>
                <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ ...S.sendBtn, opacity:loading||!input.trim()?0.35:1 }}>🚀</button>
                <button onMouseDown={()=>startVoice("chat")} onMouseUp={stopVoice}
                  onTouchStart={e=>{e.preventDefault();startVoice("chat");}} onTouchEnd={stopVoice}
                  style={{ ...S.voiceMicBtn, background:voiceMode==="chat"?"rgba(239,68,68,0.3)":"rgba(124,58,237,0.15)", borderColor:voiceMode==="chat"?"#ef4444":"rgba(124,58,237,0.3)" }}>🎤</button>
              </>
            )}
            <textarea value={voiceMode==="chat"?(voiceTranscript||""):input}
              onChange={e=>{ if (!voiceMode) setInput(e.target.value); }}
              onKeyDown={e=>{ if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}
              placeholder={voiceMode==="chat"?t.voiceListening:t.placeholder}
              style={{ ...S.textarea, textAlign:isRTL?"right":"left", direction:isRTL?"rtl":"ltr", borderColor:voiceMode==="chat"?"rgba(239,68,68,0.4)":"rgba(124,58,237,.22)" }}
              rows={1} />
            {!isRTL && (
              <>
                <button onMouseDown={()=>startVoice("chat")} onMouseUp={stopVoice}
                  onTouchStart={e=>{e.preventDefault();startVoice("chat");}} onTouchEnd={stopVoice}
                  style={{ ...S.voiceMicBtn, background:voiceMode==="chat"?"rgba(239,68,68,0.3)":"rgba(124,58,237,0.15)", borderColor:voiceMode==="chat"?"#ef4444":"rgba(124,58,237,0.3)" }}>🎤</button>
                <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ ...S.sendBtn, opacity:loading||!input.trim()?0.35:1 }}>🚀</button>
              </>
            )}
          </div>
          <p style={S.hint}>{voiceMode==="chat"?t.voiceHold:t.hint}</p>
        </div>
      </div>
      <GlobalCSS />
    </div>
  );
}

// ── SMALL COMPONENTS ──────────────────────────
function Orbs() {
  return <><div style={S.orb1} /><div style={S.orb2} /></>;
}
function TopBar({ title, count, onBack, backLabel }) {
  return (
    <div style={S.lessonBar}>
      <button style={S.backBtn} onClick={onBack}>{backLabel}</button>
      <span style={S.lessonTitle}>{title}</span>
      <span style={S.slideCount}>{count}</span>
    </div>
  );
}
function ProgressBar({ value }) {
  return <div style={S.progTrack}><div style={{ ...S.progFill, width:value+"%" }} /></div>;
}
function LoadingDots({ color="#7c3aed" }) {
  return (
    <span style={{ display:"flex", gap:4, alignItems:"center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:color, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
      ))}
    </span>
  );
}
function Section({ title, titleColor="#a78bfa", children }) {
  return <div style={S.reportSection}><div style={{ ...S.sectionTitle, color:titleColor }}>{title}</div>{children}</div>;
}
function Point({ text, color, small }) {
  return <div style={{ ...S.pointItem, fontSize:small?12:13, opacity:small?0.7:1 }}><span style={{ color }}>•</span> {text}</div>;
}
function StatCard({ label, value, sub, subColor, bar, icon, valueColor, small }) {
  return (
    <div style={S.statCard}>
      {icon && <div style={{ fontSize:36 }}>{icon}</div>}
      <div style={{ ...S.statNum, color:valueColor||"#fff", fontSize:small?16:undefined }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
      {bar!==undefined && <div style={S.statBar}><div style={{ height:"100%", width:bar+"%", background:"linear-gradient(90deg,#7c3aed,#3b82f6)", borderRadius:4, transition:"width 1s ease" }} /></div>}
      {sub && <div style={{ color:subColor, fontSize:13, fontWeight:700 }}>{sub}</div>}
    </div>
  );
}

// ── GLOBAL CSS ────────────────────────────────
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
    button { cursor:pointer; }
  `);
}

// ── STYLES ────────────────────────────────────
const S = {
  root: { fontFamily:"Nunito,sans-serif", background:"#070711", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:16 },
  orb1: { position:"fixed", top:"-10%", left:"-5%", width:500, height:500, background:"radial-gradient(circle,rgba(124,58,237,.13) 0%,transparent 70%)", borderRadius:"50%", animation:"f1 8s ease-in-out infinite", pointerEvents:"none" },
  orb2: { position:"fixed", bottom:"-10%", right:"-5%", width:600, height:600, background:"radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 70%)", borderRadius:"50%", animation:"f2 10s ease-in-out infinite", pointerEvents:"none" },
  container: { width:"100%", maxWidth:780, display:"flex", flexDirection:"column", height:"92vh", background:"rgba(13,13,26,.92)", backdropFilter:"blur(24px)", border:"1px solid rgba(139,92,246,.18)", borderRadius:24, overflow:"hidden", boxShadow:"0 0 100px rgba(124,58,237,.07)", zIndex:1 },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 22px", borderBottom:"1px solid rgba(139,92,246,.12)", background:"rgba(8,8,20,.7)" },
  logo: { display:"flex", alignItems:"center", gap:10 },
  logoIcon: { width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"#fff", animation:"glow 3s ease-in-out infinite", flexShrink:0 },
  logoName: { fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:"#fff", letterSpacing:1 },
  logoSub: { fontSize:10, color:"rgba(167,139,250,.6)" },
  headerRight: { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" },
  pill: { background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", color:"#c4b5fd", fontSize:12, padding:"4px 10px", borderRadius:20 },
  lvl: { background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:12, padding:"4px 12px", borderRadius:20 },
  langBtn: { background:"rgba(16,185,129,.12)", border:"1px solid rgba(16,185,129,.3)", color:"#34d399", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, cursor:"pointer", fontFamily:"Nunito,sans-serif" },
  xpTrack: { height:3, background:"rgba(139,92,246,.08)", flexShrink:0 },
  xpFill: { height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7,#3b82f6)", transition:"width .6s ease", boxShadow:"0 0 8px rgba(124,58,237,.6)" },
  voicePanel: { padding:"12px 18px", borderBottom:"1px solid rgba(139,92,246,.12)", background:"rgba(8,8,20,.85)", display:"flex", flexDirection:"column", gap:10, flexShrink:0 },
  voicePanelTitle: { fontSize:11, fontWeight:800, letterSpacing:2, color:"#fbbf24", fontFamily:"Syne,sans-serif" },
  voiceList: { display:"flex", flexWrap:"wrap", gap:8, maxHeight:120, overflowY:"auto" },
  voiceBtn2: { border:"1px solid", borderRadius:10, fontSize:11, fontWeight:600, padding:"5px 10px", cursor:"pointer", fontFamily:"Nunito,sans-serif" },
  chips: { display:"flex", gap:8, padding:"10px 18px", overflowX:"auto", flexShrink:0, borderBottom:"1px solid rgba(255,255,255,.03)" },
  chip: { display:"flex", alignItems:"center", gap:5, background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.18)", color:"#a78bfa", fontSize:12, fontWeight:600, padding:"5px 13px", borderRadius:20, cursor:"pointer", whiteSpace:"nowrap", transition:"transform .2s", fontFamily:"Nunito,sans-serif" },
  chat: { flex:1, overflowY:"auto", padding:"18px", display:"flex", flexDirection:"column", gap:14 },
  userRow: { display:"flex", justifyContent:"flex-end", alignItems:"flex-end", gap:8 },
  botRow: { display:"flex", justifyContent:"flex-start", alignItems:"flex-start", gap:8 },
  elvaAv: { width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15, color:"#fff", flexShrink:0 },
  userAv: { width:34, height:34, borderRadius:10, background:"rgba(59,130,246,.15)", border:"1px solid rgba(59,130,246,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 },
  botBubble: { maxWidth:"80%", background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.14)", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", color:"#e2e8f0", fontSize:14, lineHeight:1.75 },
  userBubble: { maxWidth:"75%", background:"linear-gradient(135deg,rgba(124,58,237,.28),rgba(59,130,246,.18))", border:"1px solid rgba(124,58,237,.28)", borderRadius:"16px 4px 16px 16px", padding:"11px 15px", color:"#f1f5f9", fontSize:14, lineHeight:1.65 },
  openBtn: { display:"block", marginTop:12, width:"100%", background:"linear-gradient(135deg,#7c3aed,#3b82f6)", border:"none", borderRadius:12, color:"#fff", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:14, padding:"10px", cursor:"pointer" },
  choiceBtn: { background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:20, color:"#c4b5fd", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:13, padding:"8px 18px", cursor:"pointer", transition:"all .2s" },
  inputArea: { padding:"14px 18px", borderTop:"1px solid rgba(139,92,246,.1)", background:"rgba(8,8,20,.6)", flexShrink:0 },
  inputWrap: { display:"flex", gap:8, alignItems:"flex-end" },
  textarea: { flex:1, background:"rgba(124,58,237,.06)", border:"1px solid rgba(124,58,237,.22)", borderRadius:14, padding:"11px 16px", color:"#f1f5f9", fontSize:14, lineHeight:1.5, resize:"none", fontFamily:"Nunito,sans-serif" },
  sendBtn: { width:46, height:46, borderRadius:13, flexShrink:0, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", border:"none", cursor:"pointer", fontSize:20 },
  hint: { marginTop:7, color:"rgba(148,163,184,.3)", fontSize:11, textAlign:"center" },
  lessonWrap: { width:"100%", maxWidth:720, display:"flex", flexDirection:"column", gap:14, zIndex:1, maxHeight:"95vh", overflowY:"auto", padding:"0 8px" },
  lessonBar: { display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(13,13,26,.9)", backdropFilter:"blur(20px)", border:"1px solid rgba(139,92,246,.18)", borderRadius:16, padding:"12px 20px" },
  backBtn: { background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", color:"#a78bfa", padding:"6px 14px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"Nunito,sans-serif", fontWeight:600 },
  lessonTitle: { fontFamily:"Syne,sans-serif", fontWeight:800, color:"#fff", fontSize:15 },
  slideCount: { color:"rgba(167,139,250,.6)", fontSize:13 },
  progTrack: { height:4, background:"rgba(139,92,246,.1)", borderRadius:4, overflow:"hidden" },
  progFill: { height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7)", transition:"width .5s ease", boxShadow:"0 0 10px rgba(124,58,237,.6)", borderRadius:4 },
  slideCard: { border:"1px solid", borderRadius:24, padding:"24px 28px", display:"flex", flexDirection:"column", gap:12, animation:"in .4s ease", backdropFilter:"blur(12px)" },
  slideH: { fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:20, color:"#f1f5f9", lineHeight:1.3 },
  slideP: { fontSize:14, color:"rgba(226,232,240,.88)", lineHeight:2 },
  keypointsBox: { marginTop:8, display:"flex", flexDirection:"column", gap:6, borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:12 },
  keypoint: { fontSize:13, color:"rgba(226,232,240,.75)", display:"flex", alignItems:"flex-start", gap:6, lineHeight:1.6 },
  exampleBox: { marginTop:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 16px", borderLeft:"3px solid" },
  tipBox: { marginTop:8, background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)", borderRadius:12, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start" },
  narrationBox: { background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,.15)", borderRadius:14, padding:"12px 18px" },
  narLabel: { fontSize:10, color:"rgba(167,139,250,.5)", fontWeight:700, letterSpacing:1, marginBottom:6 },
  narText: { fontSize:13, color:"rgba(226,232,240,.7)", lineHeight:1.8 },
  dots: { display:"flex", gap:8, justifyContent:"center" },
  dotEl: { width:8, height:8, borderRadius:"50%", cursor:"pointer", transition:"all .3s" },
  voiceAnswerBtn: { display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", border:"1px solid rgba(124,58,237,0.25)", background:"rgba(124,58,237,0.08)", borderRadius:12, color:"#c4b5fd", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:13, padding:"10px", cursor:"pointer", transition:"all .15s", userSelect:"none" },
  voiceAnswerFeedback: { display:"flex", alignItems:"center", gap:8, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"7px 12px", animation:"in .2s ease" },
  voiceFeedback: { display:"flex", alignItems:"center", gap:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:10, padding:"7px 12px", marginBottom:8, animation:"in .2s ease" },
  voiceStopBtn: { background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:6, color:"#f87171", fontSize:11, fontWeight:700, padding:"3px 8px", cursor:"pointer", flexShrink:0 },
  voiceMicBtn: { width:46, height:46, borderRadius:13, border:"1px solid", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s", userSelect:"none" },
  slideChatWrap: { display:"flex", flexDirection:"column", gap:6 },
  slideChatInner: { display:"flex", gap:8, alignItems:"flex-end" },
  slideChatInput: { flex:1, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:12, padding:"9px 14px", color:"#f1f5f9", fontSize:13, lineHeight:1.5, resize:"none", fontFamily:"Nunito,sans-serif" },
  slideSendBtn: { width:38, height:38, borderRadius:10, flexShrink:0, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", cursor:"pointer", fontSize:18, transition:"opacity .2s" },
  slideChatHint: { marginTop:5, color:"rgba(148,163,184,.25)", fontSize:10, textAlign:"center" },
  quizLoadingOverlay: { display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:14, padding:"14px", animation:"in .3s ease" },
  controls: { display:"flex", gap:12, justifyContent:"center", alignItems:"center", paddingBottom:8 },
  navBtn: { background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", color:"#a78bfa", padding:"10px 24px", borderRadius:12, cursor:"pointer", fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:700 },
  voiceBtn: { border:"1px solid", color:"#fff", padding:"10px 24px", borderRadius:12, cursor:"pointer", fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:700, transition:"all .3s" },
  checkInCard: { background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:20, padding:"24px", display:"flex", flexDirection:"column", gap:14, animation:"in .3s ease" },
  checkInTitle: { fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:"#fbbf24", letterSpacing:1 },
  quizTypeBadge: { fontSize:9, fontWeight:800, letterSpacing:2, color:"#a78bfa", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:20, padding:"3px 10px" },
  quizCard: { background:"rgba(13,13,26,.8)", border:"1px solid rgba(139,92,246,.2)", borderRadius:20, padding:"28px 24px", display:"flex", flexDirection:"column", gap:16 },
  quizQ: { fontSize:16, color:"#f1f5f9", fontWeight:700, lineHeight:1.6, fontFamily:"Syne,sans-serif" },
  optionsWrap: { display:"flex", flexDirection:"column", gap:10 },
  optBtn: { padding:"12px 18px", borderRadius:12, cursor:"pointer", fontSize:14, fontFamily:"Nunito,sans-serif", fontWeight:600, textAlign:"left", transition:"all .2s" },
  feedbackBox: { border:"1px solid", borderRadius:14, padding:"14px 18px" },
  proofBtn: { background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:12, color:"#fbbf24", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:13, padding:"9px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, width:"100%", justifyContent:"center" },
  proofBox: { background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:14, padding:"16px 20px", animation:"in .3s ease" },
  proofHeader: { display:"flex", alignItems:"center", gap:8, marginBottom:12, paddingBottom:10, borderBottom:"1px solid rgba(245,158,11,0.15)" },
  reportWrap: { width:"100%", maxWidth:720, display:"flex", flexDirection:"column", gap:18, zIndex:1 },
  reportHeader: { display:"flex", alignItems:"center", gap:16, background:"rgba(13,13,26,.9)", border:"1px solid rgba(139,92,246,.18)", borderRadius:20, padding:"20px 24px" },
  reportTitle: { fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:"#fff" },
  statsRow: { display:"flex", gap:14 },
  statCard: { flex:1, background:"rgba(13,13,26,.8)", border:"1px solid rgba(139,92,246,.15)", borderRadius:16, padding:"18px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 },
  statNum: { fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:26, color:"#fff" },
  statLabel: { fontSize:11, color:"rgba(167,139,250,.6)", fontWeight:600, letterSpacing:1 },
  statBar: { width:"100%", height:6, background:"rgba(139,92,246,.15)", borderRadius:4, overflow:"hidden" },
  reportSection: { background:"rgba(13,13,26,.8)", border:"1px solid rgba(139,92,246,.12)", borderRadius:16, padding:"18px 20px", display:"flex", flexDirection:"column", gap:10 },
  sectionTitle: { fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, letterSpacing:.5 },
  summaryText: { fontSize:14, color:"rgba(226,232,240,.8)", lineHeight:1.9 },
  twoCol: { display:"flex", gap:14 },
  pointItem: { color:"rgba(226,232,240,.75)", lineHeight:1.7, display:"flex", gap:6 },
  nextStepBox: { border:"1px solid", borderRadius:16, padding:"16px 20px" },
  xpGained: { display:"flex", alignItems:"center", justifyContent:"center", gap:12, background:"rgba(251,191,36,.08)", border:"1px solid rgba(251,191,36,.25)", borderRadius:14, padding:"14px" },
  reportBtn: { background:"linear-gradient(135deg,#7c3aed,#3b82f6)", border:"none", borderRadius:14, color:"#fff", fontFamily:"Nunito,sans-serif", fontWeight:700, fontSize:15, padding:"12px 32px", cursor:"pointer" },
};
