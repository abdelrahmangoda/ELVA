import { GROQ_KEY, GROQ_URL, MODEL_HEAVY, MODEL_FAST, MEM_KEY } from "./constants.js";

// ─────────────────────────────────────────────
// STUDENT MEMORY
// ─────────────────────────────────────────────
export function getMemory() {
  try { return JSON.parse(localStorage.getItem(MEM_KEY) || "{}"); }
  catch { return {}; }
}

export function saveMemory(mem) {
  try { localStorage.setItem(MEM_KEY, JSON.stringify(mem)); } catch {}
}

export function recordQuizResult(topic, score, total, wrongs) {
  const mem = getMemory();
  mem.quiz_history = [
    ...(mem.quiz_history || []).slice(-19),
    { topic, score, total, wrongs, date: Date.now() },
  ];
  const freq = {};
  (mem.quiz_history || []).forEach(q =>
    (q.wrongs || []).forEach(w => { freq[w] = (freq[w] || 0) + 1; })
  );
  mem.weak_topics    = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5).map(e => e[0]);
  mem.topics_covered = [...new Set([...(mem.topics_covered || []), topic])];
  saveMemory(mem);
}

export function getMemorySummary(lang) {
  const mem = getMemory();
  if (!mem.quiz_history?.length) return "";
  const weak    = mem.weak_topics?.slice(0,3).join(", ") || "";
  const covered = mem.topics_covered?.slice(-5).join(", ") || "";
  if (lang === "ar")
    return `\nملاحظة: الطالب درس: ${covered}. نقاط ضعفه: ${weak || "غير محددة"}.`;
  return `\nNote: Student studied: ${covered}. Weak areas: ${weak || "not identified yet"}.`;
}

// ─────────────────────────────────────────────
// PROMPT BUILDERS
// ─────────────────────────────────────────────
export function makeTutorSystemPrompt(lang) {
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
    "- CRITICAL: subtopics MUST be directly related to the student's chosen subject."
  );
}

export function makeSlidesPrompt(lang, level, conversationTopic) {
  const language = lang === "ar" ? "Arabic" : "English";
  const levelGuide = {
    beginner:     "Use simple words. Define every term. Max 2 concepts per slide. Lots of analogies.",
    intermediate: "Assume basic knowledge. Focus on connections, edge cases, and deeper mechanisms.",
    advanced:     "Go deep. Include theory, trade-offs, nuance, and advanced applications.",
  }[level] || "Adapt to the student's level.";

  const topicLock = conversationTopic
    ? `\n\nCRITICAL TOPIC LOCK: This lesson is EXCLUSIVELY about "${conversationTopic}". Every single slide MUST be directly about this topic.`
    : "";

  return (
    "You are ELVA, a world-class tutor. Generate ALL content in " + language + " ONLY.\n" +
    "Student level: " + (level||"intermediate") + ". " + levelGuide +
    topicLock + "\n\n" +
    "Build 6-7 DEEPLY DETAILED slides. Each slide content field MUST follow:\n" +
    "① One-sentence plain definition\n② The problem it solves\n③ Step-by-step mechanism\n④ Real-world analogy\n⑤ Common beginner mistake\n⑥ Bridge to next concept\n\n" +
    "EXAMPLE field = FULLY WORKED case.\n\n" +
    "keypoints RULES — SPECIFIC facts, values, behaviors — NOT vague labels.\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      topic: "lesson topic",
      reply: "warm 1-sentence message",
      slides: [{
        title:     "slide title",
        content:   "①②③④⑤⑥ structure, min 6 sentences",
        keypoints: ["point 1","point 2","point 3"],
        example:   "FULLY WORKED example",
        tip:       "memory trick or common mistake",
        emoji:     "emoji",
        type:      "intro|concept|definition|example|summary",
        narration: "tutor voice 60-80 words",
      }],
      lesson_summary: "4-5 sentences",
      strong_points:  ["concept 1","concept 2"],
      weak_points:    ["concept needing review"],
      study_tips:     ["tip 1","tip 2"],
    }) +
    "\nRULES: 6-7 slides, NO newlines inside strings, ONLY JSON."
  );
}

export function makeCheckInPrompt(lang, level, sl, useOpen, slideIndex) {
  const language = lang === "ar" ? "Arabic" : "English";
  const ctx =
    "SLIDE TITLE: " + sl.title + "\n" +
    "CONTENT: "     + (sl.content||"").slice(0,500) + "\n" +
    "KEY POINTS: "  + (sl.keypoints||[]).join(" | ") + "\n" +
    "EXAMPLE: "     + (sl.example||"").slice(0,300);

  const types      = ["CONSEQUENCE","ERROR-SPOT","APPLICATION","COMPARISON","PREDICT","REAL-WORLD"];
  const forcedType = types[(slideIndex||0) % types.length];

  if (useOpen) {
    const openTypes   = ["EXPLAIN","APPLY","PREDICT","COMPARE","REAL-WORLD-USE"];
    const openForced  = openTypes[(slideIndex||0) % openTypes.length];
    return (
      "You are ELVA. Generate ONE open-ended check-in question in " + language + ".\n\n" +
      ctx + "\n\n" +
      "FORCED QUESTION TYPE THIS TIME: " + openForced + "\n" +
      "- Question MUST be specific to THIS slide's content\n" +
      "- model_answer: 3-4 sentences a top student would write\n" +
      "- grading_criteria: 3 SPECIFIC facts from the slide content\n\n" +
      "Output ONLY valid JSON:\n" +
      JSON.stringify({
        type:             "open",
        question:         "...",
        model_answer:     "...",
        grading_criteria: ["specific fact 1","specific fact 2","specific fact 3"],
        explanation:      "why this matters in 1 sentence",
      })
    );
  }

  return (
    "You are ELVA. Generate ONE MCQ check-in question in " + language + ".\n\n" +
    ctx + "\n\n" +
    "FORCED QUESTION TYPE: " + forcedType + "\n\n" +
    "STRICT OPTIONS RULES:\n" +
    "- Exactly 4 options, same grammatical form, 3-9 words each\n" +
    "- ALL options: specific behaviors/outcomes/values — NEVER vague labels\n" +
    "- 3 distractors = real mistakes students make\n" +
    "- answer MUST be CHARACTER-FOR-CHARACTER identical to one of the 4 options\n" +
    "- EXACTLY ONE correct answer — verify the other 3 are WRONG\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      type:        "mcq",
      question:    "What happens when you pass a float to int() in Python?",
      options:     ["Raises TypeError","Truncates decimal part","Rounds to nearest integer","Converts to string"],
      answer:      "Truncates decimal part",
      explanation: "int() always truncates (floors toward zero), never rounds.",
    }) +
    "\nGenerate a completely NEW question based on the slide content above."
  );
}

export function makeQuizFromSlidesPrompt(lang, level, slides) {
  const language     = lang === "ar" ? "Arabic" : "English";
  const slideSummary = (slides||[]).map((sl,i) =>
    `Slide ${i+1} - "${sl.title}":\n  Content: ${(sl.content||"").slice(0,250)}\n  Key points: ${(sl.keypoints||[]).join(" | ")}\n  Example: ${(sl.example||"").slice(0,150)}`
  ).join("\n\n");

  return (
    "You are ELVA. Student finished this lesson:\n\n" + slideSummary + "\n\n" +
    "Generate EXACTLY 5 quiz questions in " + language + ". Level: " + (level||"intermediate") + ".\n\n" +
    "MANDATORY QUESTION TYPES:\n" +
    "Q1. APPLICATION: real-world scenario\n" +
    "Q2. ANALYSIS: ask WHY a mechanism works\n" +
    "Q3. ERROR-FINDING: show wrong example, ask what mistake is\n" +
    "Q4. CONSEQUENCE: 'What happens if [condition]?'\n" +
    "Q5. SYNTHESIS (open): explain how two concepts work together\n\n" +
    "STRICT MCQ RULES:\n" +
    "- answer field MUST be CHARACTER-FOR-CHARACTER identical to one of the 4 options\n" +
    "- options: exactly 4, same form, 3-9 words each, specific outcomes\n" +
    "- CRITICAL: EXACTLY ONE correct answer — the other 3 must be definitively WRONG\n" +
    "- Before finalizing: verify only the 'answer' value is correct\n" +
    "- NEVER: 'All of the above', 'None of the above'\n\n" +
    "OPEN QUESTION RULES:\n" +
    "- model_answer: 3-5 sentences\n" +
    "- grading_criteria: 3 specific facts from the lesson\n\n" +
    "Output ONLY valid JSON:\n" +
    JSON.stringify({
      quiz: [
        { type:"mcq",  question:"scenario?",                         options:["A","B","C","D"],                               answer:"A",        explanation:"Why A is right." },
        { type:"mcq",  question:"Why does X work?",                  options:["reason A","reason B","reason C","reason D"],   answer:"reason A", explanation:"..." },
        { type:"mcq",  question:"Mistake in this code?",             options:["error A","error B","error C","error D"],       answer:"error A",  explanation:"..." },
        { type:"mcq",  question:"What happens if X?",                options:["outcome A","outcome B","outcome C","outcome D"],answer:"outcome A",explanation:"..." },
        { type:"open", question:"Explain how A and B work together.", model_answer:"Full answer.", grading_criteria:["fact 1","fact 2","fact 3"] },
      ],
    }) +
    "\nEXACTLY 5 questions. ONLY JSON."
  );
}

export function makeSlideEditPrompt(lang, level, slide, studentRequest) {
  const language = lang === "ar" ? "Arabic" : "English";
  return (
    "You are ELVA. Student has a request about this slide.\n\n" +
    "CURRENT SLIDE:\n" + JSON.stringify(slide) + "\n\n" +
    "STUDENT REQUEST: " + studentRequest + "\n\n" +
    "Rewrite only the fields needed. Keep same topic and type. Generate in " + language + ". Level: " + (level||"intermediate") + ".\n" +
    "Output ONLY valid JSON (full slide object):\n" +
    JSON.stringify({ title:"...", content:"...", keypoints:["..."], example:"...", tip:"...", emoji:"...", type:"...", narration:"..." }) +
    "\nONLY JSON."
  );
}

export function makeProofPrompt(lang, question, answer, explanation) {
  const langWord = lang === "ar" ? "Arabic" : "English";
  return `In ${langWord}, give a clear step-by-step proof why this answer is correct.\nQuestion: ${question}\nCorrect answer: ${answer}\nContext: ${explanation}\nWrite numbered steps. Plain text only.`;
}

export function makeAiJudgePrompt(lang, { question, answer, model_answer, grading_criteria, options, transcript }) {
  const language = lang === "ar" ? "Arabic" : "English";
  const isOpen   = !options;

  if (isOpen) {
    return (
      "You are ELVA, a strict but warm tutor. Grade this student answer in " + language + ".\n\n" +
      "QUESTION: "        + question + "\n" +
      "MODEL ANSWER: "    + model_answer + "\n" +
      "REQUIRED KEY IDEAS: " + (grading_criteria||[]).join(" | ") + "\n" +
      "STUDENT ANSWERED: \"" + transcript + "\"\n\n" +
      "GRADING: correct=true if student mentioned at least 60% of key ideas. score_pct: 0-100.\n" +
      "Respond ONLY in " + language + " with valid JSON:\n" +
      JSON.stringify({ correct:false, score_pct:0, feedback:"..." })
    );
  }

  return (
    "You are ELVA. A student answered an MCQ in " + language + ".\n\n" +
    "QUESTION: "       + question + "\n" +
    "CORRECT ANSWER: " + answer   + "\n" +
    "OPTIONS: "        + (options||[]).join(" | ") + "\n" +
    "STUDENT SAID: \"" + transcript + "\"\n\n" +
    "correct: true ONLY if student's answer semantically matches the correct answer.\n" +
    "matched_option: exact text from OPTIONS that best matches what they said (or null).\n" +
    "Respond ONLY in " + language + " with valid JSON:\n" +
    JSON.stringify({ correct:false, matched_option:"...", feedback:"..." })
  );
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
export function safeParseJSON(raw) {
  if (!raw) return null;
  let clean = raw.replace(/```json/g,"").replace(/```/g,"").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s !== -1 && e !== -1) clean = clean.slice(s, e+1);
  try { return JSON.parse(clean); } catch {}
  try {
    return JSON.parse(clean.replace(/,\s*}/g,"}").replace(/,\s*]/g,"]").replace(/\n/g,"\\n"));
  } catch { return null; }
}

export function norm(s) {
  return (s||"").trim().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[\u064b-\u065f]/g,"")
    .replace(/[^\w\s\u0600-\u06FF]/g,"")
    .replace(/\s+/g," ");
}

export const sleep = ms => new Promise(res => setTimeout(res, ms));

// ─────────────────────────────────────────────
// QUIZ VALIDATION — guarantees exactly one correct answer
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

      // Step 1: De-duplicate options
      const rawOpts    = (q.options||[]).filter(Boolean);
      const seen       = new Set();
      const uniqueOpts = rawOpts.filter(o => {
        const k = norm(o);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (uniqueOpts.length < 2) return null;

      // Step 2: Find declared answer — exact then fuzzy
      let answer      = q.answer;
      const exactMatch = uniqueOpts.find(o => norm(o) === norm(answer));
      if (!exactMatch) {
        const scored = uniqueOpts.map(o => {
          const aW = norm(answer||"").split(" ").filter(w => w.length > 2);
          const oW = norm(o).split(" ");
          return { o, score: aW.filter(w => oW.includes(w)).length };
        }).sort((a,b) => b.score - a.score);
        answer = scored[0].o;
      } else {
        answer = exactMatch;
      }

      // Step 3: Pad to 4 options
      while (uniqueOpts.length < 4) uniqueOpts.push(`Option ${uniqueOpts.length+1}`);
      const finalOpts = uniqueOpts.slice(0,4);
      if (!finalOpts.some(o => norm(o) === norm(answer))) finalOpts[3] = answer;

      // Step 4: Keep exactly ONE correct answer
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

      // Step 5: Shuffle
      const shuffled = shuffleOptions(deduped.slice(0,4), answer);
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
        const wait = parseInt(r.headers.get("retry-after")||"5", 10);
        await sleep(wait * 1000);
        continue;
      }
      if (!r.ok) {
        const e = await r.json().catch(()=>({}));
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