// ============================================================
// server.js — Express backend for TrailBlazer
// Serves the frontend + provides /api/generate-roadmap
// which calls Groq LLM, falling back to rule-based logic on failure.
// ============================================================

require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 6700;

app.use(express.json());
app.use(express.static(path.join(__dirname, ".."))); // serves index.html, css/, js/ from project root

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // adjust if you used a different model before

// Mirrors js/data.js TARGET_ROLES — kept here too so the server's
// fallback logic works fully standalone, without needing frontend files.
const TARGET_ROLES = [
  { id: "frontend", label: "Frontend Developer", requiredSkills: ["HTML/CSS", "JavaScript", "React", "Git/GitHub", "REST APIs"] },
  { id: "backend", label: "Backend Developer", requiredSkills: ["Node.js", "Express", "MongoDB", "SQL", "REST APIs", "Git/GitHub"] },
  { id: "fullstack", label: "Full Stack Developer", requiredSkills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Git/GitHub"] },
  { id: "aiml", label: "AI/ML Engineer", requiredSkills: ["Python", "Machine Learning", "Deep Learning", "Data Analysis", "TensorFlow"] },
  { id: "data", label: "Data Analyst", requiredSkills: ["SQL", "Python", "Data Analysis", "Git/GitHub"] },
  { id: "sde", label: "SDE / Core Engineering", requiredSkills: ["DSA", "System Design", "Java", "Git/GitHub", "Competitive Programming"] },
  { id: "devops", label: "DevOps Engineer", requiredSkills: ["Docker", "AWS", "Cloud Computing", "DevOps", "Git/GitHub"] },
];

function computeSkillGap(selectedSkills, targetRoleId) {
  const role = TARGET_ROLES.find((r) => r.id === targetRoleId) || TARGET_ROLES[0];
  const selectedLower = (selectedSkills || []).map((s) => s.toLowerCase());
  const required = [...new Set(role.requiredSkills)];

  const have = required.filter((s) => selectedLower.includes(s.toLowerCase()));
  const need = required.filter((s) => !selectedLower.includes(s.toLowerCase()));
  const havePct = Math.round((have.length / required.length) * 100);

  return { roleLabel: role.label, have: havePct, need: 100, haveSkills: have, needSkills: need };
}

// Mirrors js/data.js SKILL_RESOURCES — per-skill learning links.
const SKILL_RESOURCES = {
  "HTML/CSS": { icon: "🎬", text: "freeCodeCamp — Responsive Web Design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
  "JavaScript": { icon: "📘", text: "Namaste JavaScript (Akshay Saini)", url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP" },
  "React": { icon: "📘", text: "React official docs — Quick Start", url: "https://react.dev/learn" },
  "Node.js": { icon: "🎬", text: "Node.js Crash Course (YouTube)", url: "https://www.youtube.com/results?search_query=node+js+crash+course" },
  "Express": { icon: "📘", text: "Express.js official guide", url: "https://expressjs.com/en/starter/installing.html" },
  "MongoDB": { icon: "📘", text: "MongoDB University — Free Courses", url: "https://learn.mongodb.com/" },
  "SQL": { icon: "🎬", text: "SQL for Beginners (YouTube)", url: "https://www.youtube.com/results?search_query=sql+for+beginners" },
  "REST APIs": { icon: "📘", text: "REST API Design Best Practices", url: "https://restfulapi.net/" },
  "Git/GitHub": { icon: "📘", text: "Git & GitHub for Beginners", url: "https://www.freecodecamp.org/news/git-and-github-for-beginners/" },
  "Python": { icon: "🎬", text: "Python for Beginners (YouTube)", url: "https://www.youtube.com/results?search_query=python+for+beginners" },
  "Machine Learning": { icon: "🎬", text: "Andrew Ng — Machine Learning Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
  "Deep Learning": { icon: "📘", text: "DeepLearning.AI — Free Courses", url: "https://www.deeplearning.ai/" },
  "Data Analysis": { icon: "📘", text: "Kaggle — Intro to Machine Learning", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
  "TensorFlow": { icon: "📘", text: "TensorFlow official tutorials", url: "https://www.tensorflow.org/tutorials" },
  "DSA": { icon: "🎬", text: "Striver's SDE Sheet (DSA)", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
  "System Design": { icon: "📘", text: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
  "Java": { icon: "🎬", text: "Java Programming (YouTube)", url: "https://www.youtube.com/results?search_query=java+programming+full+course" },
  "Competitive Programming": { icon: "📘", text: "Codeforces — Practice Problems", url: "https://codeforces.com/" },
  "Docker": { icon: "📘", text: "Docker official Get Started guide", url: "https://docs.docker.com/get-started/" },
  "AWS": { icon: "📘", text: "AWS Free Tier + Cloud Practitioner Essentials", url: "https://aws.amazon.com/free/" },
  "Cloud Computing": { icon: "📘", text: "AWS Free Tier + Cloud Practitioner Essentials", url: "https://aws.amazon.com/free/" },
  "DevOps": { icon: "🎬", text: "DevOps Roadmap & Crash Course", url: "https://roadmap.sh/devops" },
};

// Mirrors js/data.js NEXT_STEP_RESOURCES — shown when no gap remains.
const NEXT_STEP_RESOURCES = {
  "frontend": [
    { icon: "🎯", text: "Frontend System Design Interview Questions", url: "https://www.greatfrontend.com/" },
    { icon: "🏆", text: "Build & deploy 2 advanced React projects for your portfolio", url: "https://github.com/topics/react-projects" },
  ],
  "backend": [
    { icon: "🎯", text: "System Design Primer — scaling, caching, databases", url: "https://github.com/donnemartin/system-design-primer" },
    { icon: "🏆", text: "Practice backend-focused mock interviews", url: "https://www.pramp.com/" },
  ],
  "fullstack": [
    { icon: "🎯", text: "Build a production-style full stack project end-to-end", url: "https://roadmap.sh/full-stack" },
    { icon: "🏆", text: "Practice full stack mock interviews", url: "https://www.pramp.com/" },
  ],
  "aiml": [
    { icon: "🎯", text: "Kaggle Competitions — apply your skills on real datasets", url: "https://www.kaggle.com/competitions" },
    { icon: "🏆", text: "Read & reproduce a research paper relevant to your interest", url: "https://paperswithcode.com/" },
  ],
  "data": [
    { icon: "🎯", text: "SQL + Python case studies on real datasets", url: "https://www.kaggle.com/datasets" },
    { icon: "🏆", text: "Build a data dashboard project (Power BI / Tableau)", url: "https://www.kaggle.com/learn/data-visualization" },
  ],
  "sde": [
    { icon: "🎯", text: "Striver's SDE Sheet — advanced/company-tagged problems", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
    { icon: "🏆", text: "Practice timed mock interviews", url: "https://www.pramp.com/" },
  ],
  "devops": [
    { icon: "🎯", text: "Kubernetes basics — the natural next step after Docker", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
    { icon: "🏆", text: "Set up a CI/CD pipeline for one of your existing projects", url: "https://docs.github.com/en/actions" },
  ],
  "DEFAULT": [
    { icon: "🎯", text: "roadmap.sh — Explore advanced specializations", url: "https://roadmap.sh/" },
    { icon: "🏆", text: "Start contributing to open source projects", url: "https://github.com/topics/good-first-issue" },
  ],
};

// Mirrors js/data.js PROJECT_IDEAS — concrete, buildable, resume-worthy project ideas per role.
const PROJECT_IDEAS = {
  "frontend": [
    { icon: "🛒", title: "E-commerce Product Page Clone", desc: "Build a responsive product listing + cart UI with React." },
    { icon: "📊", title: "Personal Finance Dashboard", desc: "A dashboard with charts showing mock spending data." },
    { icon: "🎨", title: "Component Library", desc: "Build 5-6 reusable UI components with documentation." },
  ],
  "backend": [
    { icon: "🔐", title: "Auth API with JWT", desc: "Build a REST API with signup/login/JWT auth and role-based access." },
    { icon: "📦", title: "Inventory Management API", desc: "CRUD API with MongoDB for tracking stock, with validation." },
    { icon: "💬", title: "Real-time Chat Backend", desc: "Use Socket.io to build a chat server with real-time data." },
  ],
  "fullstack": [
    { icon: "📝", title: "Task Manager with Auth", desc: "Full CRUD app with user accounts, built end-to-end." },
    { icon: "🛍️", title: "Mini E-commerce App", desc: "Product listing, cart, and checkout flow." },
    { icon: "📅", title: "Booking/Scheduling App", desc: "Let users book slots/appointments — frontend + backend." },
  ],
  "aiml": [
    { icon: "🌾", title: "Prediction Model with Real Data", desc: "Pick a public dataset and build an end-to-end prediction pipeline." },
    { icon: "📝", title: "Text Classifier / Sentiment Analyzer", desc: "Build an NLP model wrapped in a small API." },
    { icon: "🖼️", title: "Image Classifier with TensorFlow", desc: "Train a basic image classifier — shows ML fundamentals." },
  ],
  "data": [
    { icon: "📊", title: "Sales/Trends Dashboard", desc: "Build a clean dashboard showing key insights from a dataset." },
    { icon: "🔍", title: "Exploratory Data Analysis Report", desc: "Pick a dataset and write a thorough EDA notebook." },
    { icon: "📈", title: "A/B Test Simulation", desc: "Simulate and analyze an A/B test using Python/SQL." },
  ],
  "sde": [
    { icon: "🧩", title: "Custom Data Structure Library", desc: "Implement and document your own common data structures." },
    { icon: "🎮", title: "Algorithm Visualizer", desc: "Build a web app that visually animates sorting/searching." },
    { icon: "🤖", title: "Competitive Programming Tracker", desc: "Track your DSA practice progress across platforms." },
  ],
  "devops": [
    { icon: "🐳", title: "Dockerize an Existing Project", desc: "Take a past project and containerize it with Docker." },
    { icon: "⚙️", title: "CI/CD Pipeline Setup", desc: "Set up GitHub Actions to auto-test and deploy a project." },
    { icon: "📡", title: "Simple Monitoring Dashboard", desc: "Build a basic uptime/health-check dashboard for a deployed app." },
  ],
  "DEFAULT": [
    { icon: "🚀", title: "Full Stack Portfolio Project", desc: "Pick any idea you care about and build it end-to-end." },
    { icon: "🧪", title: "Contribute to Open Source", desc: "Find a 'good first issue' on GitHub and make a real contribution." },
  ],
};

/**
 * Builds resources that respond to the actual skill gap:
 * missing skills -> resources for those specific skills.
 * no gap left -> "next step" resources (advanced / interview prep).
 */
function buildAdaptiveResources(skillGap, targetRoleId) {
  const needSkills = skillGap.needSkills || [];

  if (needSkills.length > 0) {
    const resources = needSkills
      .slice(0, 3)
      .map((skill) => {
        const res = SKILL_RESOURCES[skill];
        return res ? { ...res, stage: skill } : null;
      })
      .filter(Boolean);

    if (resources.length > 0) return resources;
  }

  const nextSteps = NEXT_STEP_RESOURCES[targetRoleId] || NEXT_STEP_RESOURCES.DEFAULT;
  return nextSteps.map((r) => ({ ...r, stage: "Next Step" }));
}

// ---------- Rule-based fallback (mirrors js/roadmap.js logic, server-side) ----------
// Kept intentionally simple and self-contained so the server never needs
// the browser-side files to produce a safe fallback response.
function buildFallbackRoadmap({ branch, year, selectedSkills, targetRole }) {
  const categories = {
    Frontend: ["react", "html/css", "javascript", "typescript"],
    Backend: ["node.js", "express", "rest apis", "graphql"],
    "AI/ML": ["machine learning", "deep learning", "data analysis", "tensorflow"],
    Core: ["dsa", "system design", "competitive programming", "full stack development"],
    Database: ["mongodb", "sql"],
  };

  const lowerSkills = (selectedSkills || []).map((s) => s.toLowerCase());
  let dominant = "DEFAULT";
  let bestCount = 0;
  for (const [cat, keywords] of Object.entries(categories)) {
    const count = lowerSkills.filter((s) => keywords.includes(s)).length;
    if (count > bestCount) {
      bestCount = count;
      dominant = cat;
    }
  }

  const templates = {
    Frontend: {
      persona: { emoji: "🛠️", name: "The Builder", desc: "You like making things work end-to-end. Frontend and product-building suit you well." },
      stages: [
        { when: "Now", title: "Strengthen the Fundamentals", desc: "Get rock-solid in HTML, CSS, and JavaScript." },
        { when: "1-2 Months", title: "Learn a Framework", desc: "Pick up React, build a multi-page app with routing." },
        { when: "3-4 Months", title: "Build & Deploy Real Projects", desc: "Ship 2 polished projects to GitHub + Render." },
        { when: "Placement Ready", title: "Interview Prep", desc: "Practice DSA basics and frontend-specific rounds." },
      ],
    },
    Backend: {
      persona: { emoji: "⚙️", name: "The Systems Thinker", desc: "You enjoy how things connect under the hood. Backend and APIs are your strength." },
      stages: [
        { when: "Now", title: "Core Backend Concepts", desc: "Learn Node.js, Express, and REST API design." },
        { when: "1-2 Months", title: "Databases & Auth", desc: "Get comfortable with MongoDB/SQL and JWT auth." },
        { when: "3-4 Months", title: "Build Production-Style APIs", desc: "Add error handling, validation, deployment." },
        { when: "Placement Ready", title: "System Design Basics", desc: "Learn scaling and caching concepts." },
      ],
    },
    "AI/ML": {
      persona: { emoji: "🧠", name: "The Data Mind", desc: "You're drawn to patterns hidden in numbers. AI/ML fits your curiosity." },
      stages: [
        { when: "Now", title: "Math + Python Foundations", desc: "Brush up on linear algebra, statistics, NumPy/Pandas." },
        { when: "1-2 Months", title: "Core ML Concepts", desc: "Learn supervised/unsupervised learning basics." },
        { when: "3-4 Months", title: "Build ML Projects", desc: "Build 1-2 end-to-end projects and deploy them." },
        { when: "Placement Ready", title: "ML Interview Prep", desc: "Practice explaining models and metrics." },
      ],
    },
    Core: {
      persona: { emoji: "🧮", name: "The Algorithm Whisperer", desc: "You think in patterns and logic. DSA and SDE roles are your playground." },
      stages: [
        { when: "Now", title: "DSA Fundamentals", desc: "Master arrays, strings, and basic patterns daily." },
        { when: "1-2 Months", title: "Intermediate DSA", desc: "Move to trees, graphs, recursion, DP." },
        { when: "3-4 Months", title: "Mock Interviews + Projects", desc: "Start mocks and build 1-2 solid projects." },
        { when: "Placement Ready", title: "Company-Specific Prep", desc: "Target specific companies' interview patterns." },
      ],
    },
    Database: {
      persona: { emoji: "🗄️", name: "The Data Architect", desc: "You like structure and order. Databases and backend systems suit you." },
      stages: [
        { when: "Now", title: "SQL & NoSQL Basics", desc: "Get fluent in SQL and know when to use MongoDB." },
        { when: "1-2 Months", title: "Database Design", desc: "Learn normalization, indexing, schema design." },
        { when: "3-4 Months", title: "Apply It", desc: "Use databases in 1-2 full-stack projects." },
        { when: "Placement Ready", title: "Interview Prep", desc: "Practice SQL and database design questions." },
      ],
    },
    DEFAULT: {
      persona: { emoji: "🌐", name: "The Full Stack Explorer", desc: "You enjoy variety. Versatility is your superpower." },
      stages: [
        { when: "Now", title: "Explore & Choose a Direction", desc: "Try small projects across 2-3 areas." },
        { when: "1-2 Months", title: "Go Deep on One Path", desc: "Pick the direction that clicked, commit to it." },
        { when: "3-4 Months", title: "Build a Portfolio Project", desc: "Build and deploy one solid project." },
        { when: "Placement Ready", title: "Interview & Resume Prep", desc: "Polish resume, practice DSA, prepare your story." },
      ],
    },
  };

  const t = templates[dominant] || templates.DEFAULT;
  const skillGap = computeSkillGap(selectedSkills, targetRole);
  const resources = buildAdaptiveResources(skillGap, targetRole);
  const projectIdeas = PROJECT_IDEAS[targetRole] || PROJECT_IDEAS.DEFAULT;

  return {
    source: "rule-based-fallback",
    persona: t.persona,
    roadmapStages: t.stages,
    skillGap,
    resources,
    projectIdeas,
    motivationalLine: `${branch || "Your branch"}, Year ${year || "?"} — solid time to start building momentum.`,
  };
}

// ---------- LLM call ----------
async function generateRoadmapWithLLM({ branch, year, selectedSkills, targetRole }) {
  const roleObj = TARGET_ROLES.find((r) => r.id === targetRole) || TARGET_ROLES[0];
  const skillGap = computeSkillGap(selectedSkills, targetRole);

  const prompt = `You are a career guidance assistant for engineering students in India.

Student profile:
- Branch: ${branch}
- Year of study: ${year}
- Target role: ${roleObj.label}
- Skills/Interests: ${selectedSkills.join(", ")}

Required skills for ${roleObj.label}: ${roleObj.requiredSkills.join(", ")}
Skills the student already has from that list: ${skillGap.haveSkills.join(", ") || "none yet"}
Skills the student still needs from that list: ${skillGap.needSkills.join(", ") || "none — fully covered"}

Return ONLY a valid JSON object (no markdown, no preamble, no code fences) with this EXACT shape:
{
  "persona": { "emoji": "<single emoji>", "name": "<2-3 word fun persona name>", "desc": "<1 sentence, encouraging, specific to their inputs and target role>" },
  "roadmapStages": [
    { "when": "Now", "title": "<short title>", "desc": "<1 sentence action, reference one of the 'still needs' skills if relevant>" },
    { "when": "1-2 Months", "title": "<short title>", "desc": "<1 sentence action>" },
    { "when": "3-4 Months", "title": "<short title>", "desc": "<1 sentence action>" },
    { "when": "Placement Ready", "title": "<short title>", "desc": "<1 sentence action>" }
  ],
  "motivationalLine": "<1 short encouraging sentence referencing their branch/year/target role>"
}

Do NOT invent your own skill gap numbers — that part is already computed separately. Keep all text concise and specific to this student's actual inputs and target role. Respond with ONLY the JSON object.`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content?.trim();

  if (!rawText) throw new Error("Empty response from Groq");

  // Strip accidental code fences just in case the model adds them
  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

  const parsed = JSON.parse(cleaned); // let JSON.parse errors bubble up to trigger fallback

  // Attach the REAL computed skill gap (don't trust the LLM with these numbers)
  parsed.skillGap = skillGap;
  parsed.resources = buildAdaptiveResources(skillGap, targetRole);
  parsed.projectIdeas = PROJECT_IDEAS[targetRole] || PROJECT_IDEAS.DEFAULT;
  parsed.source = "llm";
  return parsed;
}

// ---------- Route ----------
app.post("/api/generate-roadmap", async (req, res) => {
  const { branch, year, selectedSkills, targetRole } = req.body;

  if (!branch || !year || !targetRole || !Array.isArray(selectedSkills) || selectedSkills.length === 0) {
    return res.status(400).json({ error: "Missing required fields: branch, year, targetRole, selectedSkills" });
  }

  // No API key configured at all -> go straight to fallback, no point trying
  if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not set — using fallback.");
    return res.json(buildFallbackRoadmap({ branch, year, selectedSkills, targetRole }));
  }

  try {
    const result = await generateRoadmapWithLLM({ branch, year, selectedSkills, targetRole });
    return res.json(result);
  } catch (err) {
    console.warn("LLM generation failed, using fallback:", err.message);
    return res.json(buildFallbackRoadmap({ branch, year, selectedSkills, targetRole }));
  }
});

app.listen(port, () => {
  console.log(`TrailBlazer server running on http://localhost:${port}`);
  console.log(GROQ_API_KEY ? "Groq API key detected." : "WARNING: No Groq API key found — fallback mode only.");
});
