// ============================================================
// data.js — datasets used across TrailBlazer
// ============================================================

// Dataset for the custom autosuggest (skills, roles, companies, tech)
const SKILLS_DATASET = [
  { name: "React", category: "Frontend" },
  { name: "JavaScript", category: "Language" },
  { name: "Node.js", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "MongoDB", category: "Database" },
  { name: "SQL", category: "Database" },
  { name: "Python", category: "Language" },
  { name: "Java", category: "Language" },
  { name: "C++", category: "Language" },
  { name: "HTML/CSS", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Machine Learning", category: "AI/ML" },
  { name: "Deep Learning", category: "AI/ML" },
  { name: "Data Analysis", category: "AI/ML" },
  { name: "TensorFlow", category: "AI/ML" },
  { name: "DSA", category: "Core" },
  { name: "System Design", category: "Core" },
  { name: "Git/GitHub", category: "Tools" },
  { name: "Docker", category: "DevOps" },
  { name: "AWS", category: "Cloud" },
  { name: "Cybersecurity", category: "Security" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Flutter", category: "Mobile" },
  { name: "Android Dev", category: "Mobile" },
  { name: "DevOps", category: "DevOps" },
  { name: "Blockchain", category: "Emerging" },
  { name: "Cloud Computing", category: "Cloud" },
  { name: "REST APIs", category: "Backend" },
  { name: "GraphQL", category: "Backend" },
  { name: "Competitive Programming", category: "Core" },
  { name: "Full Stack Development", category: "Core" },
  { name: "SDE", category: "Role" },
  { name: "Frontend Developer", category: "Role" },
  { name: "Backend Developer", category: "Role" },
  { name: "Data Scientist", category: "Role" },
  { name: "Product Manager", category: "Role" },
];

// Target roles a student can choose, with their required skill sets.
// Used to compute a specific, named skill-gap (not just a vague %).
const TARGET_ROLES = [
  {
    id: "frontend",
    label: "Frontend Developer",
    requiredSkills: ["HTML/CSS", "JavaScript", "React", "Git/GitHub", "REST APIs"],
  },
  {
    id: "backend",
    label: "Backend Developer",
    requiredSkills: ["Node.js", "Express", "MongoDB", "SQL", "REST APIs", "Git/GitHub"],
  },
  {
    id: "fullstack",
    label: "Full Stack Developer",
    requiredSkills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Git/GitHub"],
  },
  {
    id: "aiml",
    label: "AI/ML Engineer",
    requiredSkills: ["Python", "Machine Learning", "Deep Learning", "Data Analysis", "TensorFlow"],
  },
  {
    id: "data",
    label: "Data Analyst",
    requiredSkills: ["SQL", "Python", "Data Analysis", "Data Analysis", "Git/GitHub"],
  },
  {
    id: "sde",
    label: "SDE / Core Engineering",
    requiredSkills: ["DSA", "System Design", "Java", "Git/GitHub", "Competitive Programming"],
  },
  {
    id: "devops",
    label: "DevOps Engineer",
    requiredSkills: ["Docker", "AWS", "Cloud Computing", "DevOps", "Git/GitHub"],
  },
];

// Roadmap templates keyed by interest category — used by rule-based fallback
const ROADMAP_TEMPLATES = {
  "Frontend": [
    { when: "Now", title: "Strengthen the Fundamentals", desc: "Get rock-solid in HTML, CSS, and JavaScript. Build 2-3 small static projects." },
    { when: "1-2 Months", title: "Learn a Framework", desc: "Pick up React. Build a multi-page app with routing and API calls." },
    { when: "3-4 Months", title: "Build & Deploy Real Projects", desc: "Ship 2 polished projects to GitHub + Render/Vercel. Focus on UI quality." },
    { when: "Placement Ready", title: "Interview Prep", desc: "Practice DSA basics + frontend-specific rounds (CSS tricky questions, JS quirks)." },
  ],
  "Backend": [
    { when: "Now", title: "Core Backend Concepts", desc: "Learn Node.js, Express, and REST API design principles." },
    { when: "1-2 Months", title: "Databases & Auth", desc: "Get comfortable with MongoDB/SQL, and implement JWT-based authentication." },
    { when: "3-4 Months", title: "Build Production-Style APIs", desc: "Build a project with proper error handling, validation, and deployment." },
    { when: "Placement Ready", title: "System Design Basics", desc: "Learn scaling concepts, caching, and prepare for backend interview rounds." },
  ],
  "AI/ML": [
    { when: "Now", title: "Math + Python Foundations", desc: "Brush up on linear algebra, statistics, and Python (NumPy, Pandas)." },
    { when: "1-2 Months", title: "Core ML Concepts", desc: "Learn supervised/unsupervised learning, work through Andrew Ng's course basics." },
    { when: "3-4 Months", title: "Build ML Projects", desc: "Build 1-2 end-to-end projects (prediction models, simple NLP) and deploy them." },
    { when: "Placement Ready", title: "ML Interview Prep", desc: "Practice explaining models, metrics, and prepare a strong project walkthrough." },
  ],
  "Core": [
    { when: "Now", title: "DSA Fundamentals", desc: "Master arrays, strings, and basic problem-solving patterns daily." },
    { when: "1-2 Months", title: "Intermediate DSA", desc: "Move to trees, graphs, recursion, and dynamic programming." },
    { when: "3-4 Months", title: "Mock Interviews + Projects", desc: "Start mock interviews and build 1-2 solid full-stack or core projects." },
    { when: "Placement Ready", title: "Company-Specific Prep", desc: "Target specific companies' interview patterns and revise core CS subjects." },
  ],
  "Database": [
    { when: "Now", title: "SQL & NoSQL Basics", desc: "Get fluent in SQL queries and understand when to use NoSQL (MongoDB)." },
    { when: "1-2 Months", title: "Database Design", desc: "Learn normalization, indexing, and schema design for real applications." },
    { when: "3-4 Months", title: "Apply It", desc: "Use databases in 1-2 full-stack projects with real, meaningful data models." },
    { when: "Placement Ready", title: "Interview Prep", desc: "Practice SQL query questions and database design interview rounds." },
  ],
  "DEFAULT": [
    { when: "Now", title: "Explore & Choose a Direction", desc: "Try small projects across 2-3 areas to see what genuinely excites you." },
    { when: "1-2 Months", title: "Go Deep on One Path", desc: "Pick the direction that clicked, and commit to learning it properly." },
    { when: "3-4 Months", title: "Build a Portfolio Project", desc: "Build and deploy one solid project that shows real, applied skill." },
    { when: "Placement Ready", title: "Interview & Resume Prep", desc: "Polish your resume, practice DSA, and prepare your project story." },
  ],
};

// Career persona definitions
const PERSONAS = [
  { id: "builder", emoji: "🛠️", name: "The Builder", desc: "You like making things work end-to-end. Full stack development and product-building suit you well.", match: ["Frontend", "Backend", "Full Stack Development", "REST APIs"] },
  { id: "algowhisperer", emoji: "🧮", name: "The Algorithm Whisperer", desc: "You think in patterns and logic. DSA, competitive programming, and core SDE roles are your playground.", match: ["DSA", "Core", "Competitive Programming", "System Design"] },
  { id: "datamind", emoji: "🧠", name: "The Data Mind", desc: "You're drawn to patterns hidden in numbers. AI/ML and data-driven roles fit your curiosity.", match: ["AI/ML", "Machine Learning", "Data Analysis", "Deep Learning"] },
  { id: "architect", emoji: "🏗️", name: "The Cloud Architect", desc: "You think in systems and scale. Cloud, DevOps, and infrastructure roles are where you'll thrive.", match: ["Cloud", "DevOps", "AWS", "Docker"] },
  { id: "explorer", emoji: "🌐", name: "The Full Stack Explorer", desc: "You enjoy variety — frontend, backend, a bit of everything. Versatility is your superpower.", match: ["DEFAULT"] },
];

// Per-skill learning resources — used to recommend resources for
// exactly the skills a student is still missing for their target role.
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

// "Next steps" resources shown when a student has NO remaining skill
// gap for their chosen role — i.e. resources for what's beyond basics.
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

// Resource links per category — each has a real URL so it's actually clickable
const RESOURCES = {
  "Frontend": [
    { icon: "🎬", text: "freeCodeCamp — Responsive Web Design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
    { icon: "📘", text: "React official docs — Quick Start", url: "https://react.dev/learn" },
  ],
  "Backend": [
    { icon: "🎬", text: "Node.js & Express Crash Course (YouTube)", url: "https://www.youtube.com/results?search_query=node+js+express+crash+course" },
    { icon: "📘", text: "REST API Design Best Practices", url: "https://restfulapi.net/" },
  ],
  "AI/ML": [
    { icon: "🎬", text: "Andrew Ng — Machine Learning Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
    { icon: "📘", text: "Kaggle — Intro to Machine Learning", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
  ],
  "Core": [
    { icon: "🎬", text: "Striver's SDE Sheet (DSA)", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
    { icon: "📘", text: "NeetCode — Pattern-based DSA", url: "https://neetcode.io/" },
  ],
  "Database": [
    { icon: "🎬", text: "SQL for Beginners (YouTube)", url: "https://www.youtube.com/results?search_query=sql+for+beginners" },
    { icon: "📘", text: "MongoDB University — Free Courses", url: "https://learn.mongodb.com/" },
  ],
  "DEFAULT": [
    { icon: "🎬", text: "Namaste JavaScript (Akshay Saini)", url: "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP" },
    { icon: "📘", text: "roadmap.sh — Explore all paths", url: "https://roadmap.sh/" },
  ],
};
