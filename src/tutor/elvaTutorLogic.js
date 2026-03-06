//elvaTutorLogic.js
import { GROQ_KEY, GROQ_URL, MODEL_HEAVY, MODEL_FAST, MEM_KEY } from "./constants.js";

// ─────────────────────────────────────────────
// STUDENT MEMORY
// ─────────────────────────────────────────────
export function getMemory() {
  try { 
    return JSON.parse(localStorage.getItem(MEM_KEY) || "{}"); 
  } catch { 
    return {}; 
  }
}

export function saveMemory(mem) {
  try { 
    localStorage.setItem(MEM_KEY, JSON.stringify(mem)); 
  } catch {}
}

export function recordQuizResult(topic, score, total, wrongs) {
  const mem = getMemory();
  mem.quiz_history = [
    ...(mem.quiz_history || []).slice(-19),
    { topic, score, total, wrongs, date: Date.now() },
  ];
  const freq = {};
  (mem.quiz_history || []).forEach(q =>
    (q.wrongs || []).forEach(w => { 
      freq[w] = (freq[w] || 0) + 1; 
    })
  );
  mem.weak_topics = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);
  mem.topics_covered = [...new Set([...(mem.topics_covered || []), topic])];
  saveMemory(mem);
}

export function getMemorySummary(lang) {
  const mem = getMemory();
  if (!mem.quiz_history?.length) return "";
  const weak = mem.weak_topics?.slice(0, 3).join(", ") || "";
  const covered = mem.topics_covered?.slice(-5).join(", ") || "";
  if (lang === "ar")
    return `\nملاحظة: الطالب درس: ${covered}. نقاط ضعفه: ${weak || "غير محددة"}.`;
  return `\nNote: Student studied: ${covered}. Weak areas: ${weak || "not identified yet"}.`;
}

// ─────────────────────────────────────────────
// PROMPT BUILDERS
// ─────────────────────────────────────────────

export function makeTutorSystemPrompt(lang) {
  if (lang === "ar") {
    return `أنت ELVA، مدرس ذكي تعليمي محترف وذكي جداً في فهم نية الطالب.

═══════════════════════════════════════════════════════════
⛔ قواعد صارمة:
═══════════════════════════════════════════════════════════

المواضيع المسموحة فقط:
• الرياضيات والعلوم (فيزياء، كيمياء، أحياء)
• البرمجة والتكنولوجيا
• اللغات (عربي، إنجليزي، فرنساوي)
• التاريخ والجغرافيا
• التربية الدينية

ممنوع: أي موضوع غير دراسي أو محتوى غير لائق.

═══════════════════════════════════════════════════════════
🧠 الذكاء في فهم نية الطالب:
═══════════════════════════════════════════════════════════

أنت ذكي! حلّل طلب الطالب واتخذ القرار المناسب:

【حالة 1】 موضوع عام (مثل: "عايز أتعلم بايثون" أو "علمني فيزياء"):
→ اسأل عن المستوى أولاً
→ ثم اقترح 3-4 مواضيع فرعية كـ اقتراحات (مش إجبار)
→ الطالب يقدر يختار أو يكتب موضوع من عنده
→ لما يحدد الموضوع الفرعي → ready: true

【حالة 2】 موضوع محدد (مثل: "علمني المتغيرات في بايثون" أو "شرحلي قوانين نيوتن"):
→ الموضوع واضح ومحدد! اسأل عن المستوى فقط
→ بعد المستوى مباشرة → ready: true
→ لا تسأل عن مواضيع فرعية لأن الطالب حدد بالفعل

【حالة 3】 موضوع محدد + مستوى (مثل: "أنا مبتدئ عايز أتعلم loops في بايثون"):
→ الطالب قال كل شيء! لا تسأل أي سؤال
→ مباشرة → ready: true

【حالة 4】 تحية فقط (أهلاً، مرحبا، إزيك):
→ رحب به واسأله عن الموضوع
→ اقترح مواد كـ أزرار مساعدة

═══════════════════════════════════════════════════════════
📋 أمثلة على الردود الذكية:
═══════════════════════════════════════════════════════════

مثال 1 - موضوع عام:
الطالب: "عايز أتعلم بايثون"
الرد:
{
  "message": "رائع! 🐍 بايثون لغة قوية ومطلوبة جداً!\\n\\nإيه مستواك الحالي في البرمجة؟",
  "choices": ["مبتدئ تماماً 🌱", "عندي أساسيات 📚", "متقدم 🚀"],
  "ready": false
}

ثم الطالب: "مبتدئ"
الرد:
{
  "message": "تمام! 👍 بايثون للمبتدئين ممتعة جداً.\\n\\nتحب نبدأ بإيه؟ (اختار أو اكتب موضوع من عندك)",
  "choices": ["المتغيرات والأنواع 📦", "الشروط if/else 🔀", "الحلقات loops 🔄", "الدوال functions ⚡"],
  "ready": false
}

ثم الطالب: "المتغيرات" أو يكتب أي موضوع تاني
الرد:
{
  "message": "ممتاز! 🎉 جاري تحضير درس شامل عن المتغيرات في بايثون...\\n\\nهتتعلم كل حاجة من الصفر مع أمثلة عملية!",
  "choices": [],
  "ready": true
}

مثال 2 - موضوع محدد من البداية:
الطالب: "علمني المتغيرات في بايثون"
الرد:
{
  "message": "تمام! 📦 المتغيرات في بايثون موضوع أساسي ومهم.\\n\\nإيه مستواك الحالي؟",
  "choices": ["مبتدئ 🌱", "متوسط 📚", "متقدم 🚀"],
  "ready": false
}

ثم الطالب: "مبتدئ"
الرد:
{
  "message": "ممتاز! 🎉 جاري تحضير درس شامل عن المتغيرات في بايثون للمبتدئين...\\n\\nالدرس هيغطي التعريف، الأنواع، والأمثلة العملية!",
  "choices": [],
  "ready": true
}

مثال 3 - موضوع محدد + مستوى:
الطالب: "أنا مبتدئ وعايز أتعلم الحلقات في بايثون"
الرد:
{
  "message": "ممتاز! 🎉 فهمت - أنت مبتدئ وعايز تتعلم الحلقات (loops) في بايثون.\\n\\nجاري تحضير درس مفصّل ليك...\\n\\nهنغطي for و while مع أمثلة سهلة!",
  "choices": [],
  "ready": true
}

═══════════════════════════════════════════════════════════
⚠️ قواعد مهمة:
═══════════════════════════════════════════════════════════

1. الاختيارات (choices) دائماً اقتراحات مش إجبار
2. الطالب حر يكتب أي موضوع من عنده
3. لا تسأل أسئلة أكثر من اللازم
4. لما تحس إن عندك معلومات كافية → ready: true
5. الدرس سيكون 6-7 شرائح مفصّلة وشاملة
6. كن ذكي في فهم نية الطالب

📝 موضوع غير دراسي:
{
  "message": "🎓 أنا مدرس تعليمي! أقدر أساعدك في المواد الدراسية.\\n\\nإيه الموضوع اللي تحب تتعلمه؟",
  "choices": ["رياضيات 📐", "علوم 🔬", "برمجة 💻", "لغات 📖"],
  "ready": false
}

رد دائماً بـ JSON صالح فقط.`;
  }

  return `You are ELVA, a smart and professional educational AI tutor who understands student intent.

═══════════════════════════════════════════════════════════
⛔ STRICT RULES:
═══════════════════════════════════════════════════════════

ALLOWED topics only:
• Mathematics and Sciences (physics, chemistry, biology)
• Programming and Technology  
• Languages (English, Arabic, French)
• History and Geography
• Religious Studies

FORBIDDEN: Any non-educational topic or inappropriate content.

═══════════════════════════════════════════════════════════
🧠 SMART INTENT DETECTION:
═══════════════════════════════════════════════════════════

You are smart! Analyze the student's request and decide accordingly:

【Case 1】 General topic (e.g., "I want to learn Python" or "Teach me physics"):
→ Ask about level first
→ Then suggest 3-4 subtopics as SUGGESTIONS (not mandatory)
→ Student can choose OR write their own topic
→ Once subtopic is clear → ready: true

【Case 2】 Specific topic (e.g., "Teach me variables in Python" or "Explain Newton's laws"):
→ Topic is already specific! Ask about level only
→ After level → ready: true immediately
→ Don't ask about subtopics - student already specified

【Case 3】 Specific topic + level (e.g., "I'm a beginner, teach me loops in Python"):
→ Student said everything! Don't ask any questions
→ Immediately → ready: true

【Case 4】 Just a greeting (Hi, Hello, Hey):
→ Welcome them and ask about the topic
→ Suggest subjects as helpful buttons

═══════════════════════════════════════════════════════════
📋 SMART RESPONSE EXAMPLES:
═══════════════════════════════════════════════════════════

Example 1 - General topic:
Student: "I want to learn Python"
Response:
{
  "message": "Awesome! 🐍 Python is a powerful and in-demand language!\\n\\nWhat's your current programming level?",
  "choices": ["Complete beginner 🌱", "Know some basics 📚", "Advanced 🚀"],
  "ready": false
}

Then student: "Beginner"
Response:
{
  "message": "Great! 👍 Python for beginners is really fun.\\n\\nWhat would you like to start with? (Pick one or type your own topic)",
  "choices": ["Variables & Types 📦", "Conditionals if/else 🔀", "Loops 🔄", "Functions ⚡"],
  "ready": false
}

Then student: "Variables" or types any other topic
Response:
{
  "message": "Perfect! 🎉 Preparing a comprehensive lesson on Variables in Python...\\n\\nYou'll learn everything from scratch with practical examples!",
  "choices": [],
  "ready": true
}

Example 2 - Specific topic from start:
Student: "Teach me variables in Python"
Response:
{
  "message": "Got it! 📦 Variables in Python is a fundamental topic.\\n\\nWhat's your current level?",
  "choices": ["Beginner 🌱", "Intermediate 📚", "Advanced 🚀"],
  "ready": false
}

Then student: "Beginner"
Response:
{
  "message": "Perfect! 🎉 Preparing a comprehensive lesson on Variables in Python for beginners...\\n\\nWe'll cover definitions, types, and practical examples!",
  "choices": [],
  "ready": true
}

Example 3 - Specific topic + level given:
Student: "I'm a beginner and want to learn loops in Python"
Response:
{
  "message": "Perfect! 🎉 Got it - you're a beginner wanting to learn loops in Python.\\n\\nPreparing a detailed lesson for you...\\n\\nWe'll cover for and while loops with easy examples!",
  "choices": [],
  "ready": true
}

═══════════════════════════════════════════════════════════
⚠️ IMPORTANT RULES:
═══════════════════════════════════════════════════════════

1. Choices are ALWAYS suggestions, not mandatory
2. Student is FREE to type any topic they want
3. Don't ask more questions than necessary
4. When you have enough info → ready: true
5. Lesson will be 6-7 detailed and comprehensive slides
6. Be SMART in understanding student intent

📝 Non-educational topic:
{
  "message": "🎓 I'm an educational tutor! I can help you with academic subjects.\\n\\nWhat would you like to learn?",
  "choices": ["Math 📐", "Science 🔬", "Programming 💻", "Languages 📖"],
  "ready": false
}

Always respond with valid JSON only.`;
}

export function makeSlidesPrompt(lang, level, conversationTopic) {
  const language = lang === "ar" ? "Arabic" : "English";
  const levelGuide = {
    beginner: "Use simple words. Define every term. Max 2 concepts per slide. Lots of analogies.",
    intermediate: "Assume basic knowledge. Focus on connections, edge cases, and deeper mechanisms.",
    advanced: "Go deep. Include theory, trade-offs, nuance, and advanced applications.",
  }[level] || "Adapt to the student's level.";

  const topicLock = conversationTopic
    ? `\n\nCRITICAL TOPIC LOCK: This lesson is EXCLUSIVELY about "${conversationTopic}". Every single slide MUST be directly about this topic. Stay strictly educational.`
    : "";

  return (
    "You are ELVA, a world-class educational tutor. Generate ALL content in " + language + " ONLY.\n" +
    "Student level: " + (level || "intermediate") + ". " + levelGuide +
    topicLock + "\n\n" +
    "STRICT CONTENT RULES:\n" +
    "- Stay STRICTLY educational and appropriate\n" +
    "- NO political, controversial, or inappropriate content\n" +
    "- Focus ONLY on academic learning\n\n" +
    "Build 6-7 DEEPLY DETAILED slides. Each slide content field MUST follow:\n" +
    "① One-sentence plain definition\n② The problem it solves\n③ Step-by-step mechanism\n④ Real-world analogy\n⑤ Common beginner mistake\n⑥ Bridge to next concept\n\n" +
    "EXAMPLE field = FULLY WORKED case.\n\n" +
    "keypoints RULES — SPECIFIC facts, values, behaviors — NOT vague labels.\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      topic: "lesson topic",
      reply: "warm 1-sentence message",
      slides: [{
        title: "slide title",
        content: "①②③④⑤⑥ structure, min 6 sentences",
        keypoints: ["point 1", "point 2", "point 3"],
        example: "FULLY WORKED example",
        tip: "memory trick or common mistake",
        emoji: "emoji",
        type: "intro|concept|definition|example|summary",
        narration: "tutor voice 60-80 words",
      }],
      lesson_summary: "4-5 sentences",
      strong_points: ["concept 1", "concept 2"],
      weak_points: ["concept needing review"],
      study_tips: ["tip 1", "tip 2"],
    }) +
    "\nRULES: 6-7 slides, NO newlines inside strings, ONLY JSON, STRICTLY EDUCATIONAL."
  );
}

export function makeCheckInPrompt(lang, level, sl, useOpen, slideIndex) {
  const language = lang === "ar" ? "Arabic" : "English";
  const ctx =
    "SLIDE TITLE: " + sl.title + "\n" +
    "CONTENT: " + (sl.content || "").slice(0, 500) + "\n" +
    "KEY POINTS: " + (sl.keypoints || []).join(" | ") + "\n" +
    "EXAMPLE: " + (sl.example || "").slice(0, 300);

  const types = ["CONSEQUENCE", "ERROR-SPOT", "APPLICATION", "COMPARISON", "PREDICT", "REAL-WORLD"];
  const forcedType = types[(slideIndex || 0) % types.length];

  if (useOpen) {
    const openTypes = ["EXPLAIN", "APPLY", "PREDICT", "COMPARE", "REAL-WORLD-USE"];
    const openForced = openTypes[(slideIndex || 0) % openTypes.length];
    return (
      "You are ELVA. Generate ONE educational open-ended check-in question in " + language + ".\n\n" +
      ctx + "\n\n" +
      "FORCED QUESTION TYPE THIS TIME: " + openForced + "\n" +
      "- Question MUST be specific to THIS slide's content\n" +
      "- Stay STRICTLY educational and appropriate\n" +
      "- model_answer: 3-4 sentences a top student would write\n" +
      "- grading_criteria: 3 SPECIFIC facts from the slide content\n\n" +
      "Output ONLY valid JSON:\n" +
      JSON.stringify({
        type: "open",
        question: "...",
        model_answer: "...",
        grading_criteria: ["specific fact 1", "specific fact 2", "specific fact 3"],
        explanation: "why this matters in 1 sentence",
      })
    );
  }

  return (
    "You are ELVA. Generate ONE educational MCQ check-in question in " + language + ".\n\n" +
    ctx + "\n\n" +
    "FORCED QUESTION TYPE: " + forcedType + "\n\n" +
    "STRICT OPTIONS RULES:\n" +
    "- Exactly 4 options, same grammatical form, 3-9 words each\n" +
    "- ALL options: specific behaviors/outcomes/values — NEVER vague labels\n" +
    "- 3 distractors = real mistakes students make\n" +
    "- answer MUST be CHARACTER-FOR-CHARACTER identical to one of the 4 options\n" +
    "- EXACTLY ONE correct answer — verify the other 3 are WRONG\n" +
    "- Stay STRICTLY educational\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      type: "mcq",
      question: "What happens when you pass a float to int() in Python?",
      options: ["Raises TypeError", "Truncates decimal part", "Rounds to nearest integer", "Converts to string"],
      answer: "Truncates decimal part",
      explanation: "int() always truncates (floors toward zero), never rounds.",
    }) +
    "\nGenerate a completely NEW educational question based on the slide content above."
  );
}

export function makeQuizFromSlidesPrompt(lang, level, slides) {
  const language = lang === "ar" ? "Arabic" : "English";
  const slideSummary = (slides || []).map((sl, i) =>
    `Slide ${i + 1} - "${sl.title}":\n  Content: ${(sl.content || "").slice(0, 250)}\n  Key points: ${(sl.keypoints || []).join(" | ")}\n  Example: ${(sl.example || "").slice(0, 150)}`
  ).join("\n\n");

  return (
    "You are ELVA. Student finished this educational lesson:\n\n" + slideSummary + "\n\n" +
    "Generate EXACTLY 5 educational quiz questions in " + language + ". Level: " + (level || "intermediate") + ".\n\n" +
    "STRICT CONTENT RULES:\n" +
    "- ALL questions MUST be strictly educational\n" +
    "- NO inappropriate content whatsoever\n" +
    "- Focus on academic learning only\n\n" +
    "MANDATORY QUESTION TYPES:\n" +
    "Q1. APPLICATION: real-world educational scenario\n" +
    "Q2. ANALYSIS: ask WHY a mechanism works\n" +
    "Q3. ERROR-FINDING: show wrong example, ask what mistake is\n" +
    "Q4. CONSEQUENCE: 'What happens if [condition]?'\n" +
    "Q5. SYNTHESIS (open): explain how two concepts work together\n\n" +
    "STRICT MCQ RULES:\n" +
    "- answer field MUST be CHARACTER-FOR-CHARACTER identical to one of the 4 options\n" +
    "- options: exactly 4, same form, 3-9 words each, specific outcomes\n" +
    "- CRITICAL: EXACTLY ONE correct answer — the other 3 must be definitively WRONG\n" +
    "- Before finalizing: verify only the 'answer' value is correct\n\n" +
    "OPEN QUESTION RULES:\n" +
    "- model_answer: 3-5 sentences\n" +
    "- grading_criteria: 3 specific educational facts from the lesson\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      quiz: [
        { type: "mcq", question: "scenario?", options: ["A", "B", "C", "D"], answer: "A", explanation: "Why A is right." },
        { type: "mcq", question: "Why does X work?", options: ["reason A", "reason B", "reason C", "reason D"], answer: "reason A", explanation: "..." },
        { type: "mcq", question: "Mistake in this code?", options: ["error A", "error B", "error C", "error D"], answer: "error A", explanation: "..." },
        { type: "mcq", question: "What happens if X?", options: ["outcome A", "outcome B", "outcome C", "outcome D"], answer: "outcome A", explanation: "..." },
        { type: "open", question: "Explain how A and B work together.", model_answer: "Full answer.", grading_criteria: ["fact 1", "fact 2", "fact 3"] },
      ],
    }) +
    "\nEXACTLY 5 educational questions. ONLY JSON."
  );
}

export function makeSlideEditPrompt(lang, level, slide, studentRequest) {
  const language = lang === "ar" ? "Arabic" : "English";
  return (
    "You are ELVA, an educational tutor. Student has a request about this slide.\n\n" +
    "STRICT RULES:\n" +
    "- Stay STRICTLY educational and appropriate\n" +
    "- NO inappropriate content\n\n" +
    "CURRENT SLIDE:\n" + JSON.stringify(slide) + "\n\n" +
    "STUDENT REQUEST: " + studentRequest + "\n\n" +
    "Rewrite only the fields needed. Keep same educational topic and type. Generate in " + language + ". Level: " + (level || "intermediate") + ".\n" +
    "Output ONLY valid JSON (full slide object):\n" +
    JSON.stringify({ title: "...", content: "...", keypoints: ["..."], example: "...", tip: "...", emoji: "...", type: "...", narration: "..." }) +
    "\nONLY JSON. Stay educational."
  );
}

export function makeProofPrompt(lang, question, answer, explanation) {
  const langWord = lang === "ar" ? "Arabic" : "English";
  return `You are ELVA, an educational tutor. In ${langWord}, give a clear step-by-step educational proof why this answer is correct.\n\nQuestion: ${question}\nCorrect answer: ${answer}\nContext: ${explanation}\n\nWrite numbered steps. Plain text only. Stay strictly educational.`;
}

export function makeAiJudgePrompt(lang, { question, answer, model_answer, grading_criteria, options, transcript }) {
  const language = lang === "ar" ? "Arabic" : "English";
  const isOpen = !options;

  if (isOpen) {
    return (
      "You are ELVA, a strict but warm educational tutor. Grade this student answer in " + language + ".\n\n" +
      "QUESTION: " + question + "\n" +
      "MODEL ANSWER: " + model_answer + "\n" +
      "REQUIRED KEY IDEAS: " + (grading_criteria || []).join(" | ") + "\n" +
      "STUDENT ANSWERED: \"" + transcript + "\"\n\n" +
      "GRADING: correct=true if student mentioned at least 60% of key ideas. score_pct: 0-100.\n" +
      "Stay strictly educational and appropriate.\n" +
      "Respond ONLY in " + language + " with valid JSON:\n" +
      JSON.stringify({ correct: false, score_pct: 0, feedback: "..." })
    );
  }

  return (
    "You are ELVA, an educational tutor. A student answered an MCQ in " + language + ".\n\n" +
    "QUESTION: " + question + "\n" +
    "CORRECT ANSWER: " + answer + "\n" +
    "OPTIONS: " + (options || []).join(" | ") + "\n" +
    "STUDENT SAID: \"" + transcript + "\"\n\n" +
    "correct: true ONLY if student's answer semantically matches the correct answer.\n" +
    "matched_option: exact text from OPTIONS that best matches what they said (or null).\n" +
    "Stay strictly educational.\n" +
    "Respond ONLY in " + language + " with valid JSON:\n" +
    JSON.stringify({ correct: false, matched_option: "...", feedback: "..." })
  );
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
export function safeParseJSON(raw) {
  if (!raw) return null;
  let clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s !== -1 && e !== -1) clean = clean.slice(s, e + 1);
  try { 
    return JSON.parse(clean); 
  } catch {}
  try {
    return JSON.parse(clean.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/\n/g, "\\n"));
  } catch { 
    return null; 
  }
}

export function norm(s) {
  return (s || "").trim().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064b-\u065f]/g, "")
    .replace(/[^\w\s\u0600-\u06FF]/g, "")
    .replace(/\s+/g, " ");
}

export const sleep = ms => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────
// QUIZ VALIDATION
// ─────────────────────────────────────────────
export function shuffleOptions(options, answer) {
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { options: arr, answer };
}

export function validateAndRepairLesson(data) {
  if (!data) return null;

  data.slides = (data.slides || []).map((sl, i) => ({
    title: sl.title || `Slide ${i + 1}`,
    content: sl.content || "",
    keypoints: Array.isArray(sl.keypoints) ? sl.keypoints : [],
    example: sl.example || "",
    tip: sl.tip || "",
    emoji: sl.emoji || "📖",
    type: sl.type || "concept",
    narration: sl.narration || (sl.content || "").slice(0, 120),
  }));
  
  if (data.slides.length === 0) return null;

  if (Array.isArray(data.quiz)) {
    data.quiz = data.quiz.map(q => {
      if (!q?.question) return null;
      if (q.type === "open") return q;

      const rawOpts = (q.options || []).filter(Boolean);
      const seen = new Set();
      const uniqueOpts = rawOpts.filter(o => {
        const k = norm(o);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (uniqueOpts.length < 2) return null;

      let answer = q.answer;
      const exactMatch = uniqueOpts.find(o => norm(o) === norm(answer));
      if (!exactMatch) {
        const scored = uniqueOpts.map(o => {
          const aW = norm(answer || "").split(" ").filter(w => w.length > 2);
          const oW = norm(o).split(" ");
          return { o, score: aW.filter(w => oW.includes(w)).length };
        }).sort((a, b) => b.score - a.score);
        answer = scored[0].o;
      } else {
        answer = exactMatch;
      }

      while (uniqueOpts.length < 4) uniqueOpts.push(`Option ${uniqueOpts.length + 1}`);
      const finalOpts = uniqueOpts.slice(0, 4);
      if (!finalOpts.some(o => norm(o) === norm(answer))) finalOpts[3] = answer;

      const deduped = [];
      let answerAdded = false;
      for (const o of finalOpts) {
        if (norm(o) === norm(answer)) {
          if (!answerAdded) { 
            deduped.push(o); 
            answerAdded = true; 
          }
        } else {
          deduped.push(o);
        }
      }
      while (deduped.length < 4) deduped.push(`Option ${deduped.length + 1}`);

      const shuffled = shuffleOptions(deduped.slice(0, 4), answer);
      return { ...q, options: shuffled.options, answer: shuffled.answer };
    }).filter(Boolean);
  }

  return data;
}

// ─────────────────────────────────────────────
// API CALL
// ─────────────────────────────────────────────
export async function callGroq(msgs, jsonMode, maxTok, model, retries = 3) {
  const useModel = model || MODEL_HEAVY;
  let lastErr;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      const r = await fetch(GROQ_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": "Bearer " + GROQ_KEY 
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: useModel,
          temperature: jsonMode ? 0.3 : 0.7,
          max_tokens: maxTok || 4000,
          messages: msgs,
          ...(jsonMode && { response_format: { type: "json_object" } }),
        }),
      });

      clearTimeout(timeout);

      if (r.status === 429) {
        const wait = parseInt(r.headers.get("retry-after") || "5", 10);
        await sleep(wait * 1000);
        continue;
      }
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error?.message || r.statusText);
      }
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

export { MODEL_FAST, MODEL_HEAVY };