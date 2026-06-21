// ============================================================
// app.js — main application logic: form, autosuggest UI,
// screen transitions, scanning animation, and results rendering
// ============================================================

// ---------- STATE ----------
const state = {
  branch: "",
  year: "",
  targetRole: "",
  selectedSkills: [],
  engine: "custom", // "custom" | "bootcamp"
};

let lastResult = null; // holds the most recently rendered roadmap result

// ---------- DOM REFS ----------
const branchSelect = document.getElementById("branch");
const yearSelect = document.getElementById("year");
const targetRoleSelect = document.getElementById("target-role");
const skillsInput = document.getElementById("skills-input");
const suggestionsList = document.getElementById("suggestions-list");
const chipsRow = document.getElementById("selected-chips");
const chipCount = document.getElementById("chip-count");
const careerForm = document.getElementById("career-form");
const submitBtn = document.getElementById("submit-btn");

const screenForm = document.getElementById("screen-form");
const screenScanning = document.getElementById("screen-scanning");
const screenResults = document.getElementById("screen-results");
const scanText = document.getElementById("scan-text");
const scanProgressFill = document.getElementById("scan-progress-fill");

const restartBtn = document.getElementById("restart-btn");

// ---------- FORM STATE SYNC ----------
branchSelect.addEventListener("change", (e) => {
  state.branch = e.target.value;
  validateForm();
});
yearSelect.addEventListener("change", (e) => {
  state.year = e.target.value;
  validateForm();
});
targetRoleSelect.addEventListener("change", (e) => {
  state.targetRole = e.target.value;
  validateForm();
});

function validateForm() {
  const valid = state.branch && state.year && state.targetRole && state.selectedSkills.length > 0;
  submitBtn.disabled = !valid;
}

// ---------- AUTOSUGGEST ----------
// Runs silently: the custom engine answers instantly for the UI,
// while the bootcamp API is also called in the background for
// comparison/logging — both engines genuinely run, just without
// a visible toggle cluttering the form.
let debounceTimer = null;

skillsInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = skillsInput.value;

  if (query.trim().length === 0) {
    suggestionsList.classList.remove("show");
    suggestionsList.innerHTML = "";
    return;
  }

  // Custom engine drives the UI instantly (no network wait).
  const customResults = customAutosuggest(query);
  renderSuggestions(customResults);

  // Bootcamp API runs in the background for comparison — logged to
  // console, not shown in UI, so both engines genuinely get used.
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const bootcampResults = await bootcampAutosuggest(query);
    console.log(
      `[Autosuggest comparison] "${query}" → custom: ${customResults.length} results, bootcamp API: ${bootcampResults.length} results`,
      { custom: customResults, bootcamp: bootcampResults }
    );
  }, 150);
});

function renderSuggestions(results) {
  suggestionsList.innerHTML = "";

  if (results.length === 0) {
    suggestionsList.innerHTML = `<li class="empty">No matches found</li>`;
    suggestionsList.classList.add("show");
    return;
  }

  for (const item of results) {
    // Skip ones already selected
    if (state.selectedSkills.includes(item.name)) continue;

    const li = document.createElement("li");
    li.innerHTML = `<span>${item.name}</span><span class="tag">${item.category}</span>`;
    li.addEventListener("click", () => selectSkill(item.name));
    suggestionsList.appendChild(li);
  }

  suggestionsList.classList.add("show");
}

function selectSkill(name) {
  if (state.selectedSkills.length >= 8) return;
  if (state.selectedSkills.includes(name)) return;

  state.selectedSkills.push(name);
  renderChips();
  skillsInput.value = "";
  suggestionsList.classList.remove("show");
  suggestionsList.innerHTML = "";
  validateForm();
}

function removeSkill(name) {
  state.selectedSkills = state.selectedSkills.filter((s) => s !== name);
  renderChips();
  validateForm();
}

function renderChips() {
  chipsRow.innerHTML = "";
  for (const skill of state.selectedSkills) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<span>${skill}</span><button type="button" aria-label="Remove">✕</button>`;
    chip.querySelector("button").addEventListener("click", () => removeSkill(skill));
    chipsRow.appendChild(chip);
  }
  chipCount.textContent = state.selectedSkills.length;
}

// Close suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".autosuggest-wrap")) {
    suggestionsList.classList.remove("show");
  }
});

// Allow Enter key to pick the first suggestion
skillsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const first = suggestionsList.querySelector("li:not(.empty)");
    if (first) first.click();
  }
});

// ---------- SCREEN TRANSITIONS ----------
function showScreen(screenEl) {
  [screenForm, screenScanning, screenResults].forEach((s) => s.classList.remove("active"));
  screenEl.classList.add("active");
}

// ---------- SCANNING ANIMATION ----------
const scanMessages = [
  "Analyzing your profile...",
  "Matching career paths...",
  "Mapping your roadmap...",
  "Almost there...",
];

function runScanningAnimation(onComplete) {
  showScreen(screenScanning);
  scanProgressFill.style.width = "0%";

  let step = 0;
  const totalSteps = scanMessages.length;

  const interval = setInterval(() => {
    scanText.textContent = scanMessages[step];
    scanProgressFill.style.width = `${((step + 1) / totalSteps) * 100}%`;
    step++;

    if (step >= totalSteps) {
      clearInterval(interval);
      setTimeout(onComplete, 400);
    }
  }, 550);
}

// ---------- SLOT MACHINE REVEAL ----------
const SLOT_SYMBOLS = ["🎲", "🛠️", "🧠", "⚡", "🌐", "🎯", "🚀", "💡", "🔥", "⭐"];

function runSlotMachine(finalEmoji) {
  const reels = [
    document.getElementById("reel-0"),
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
  ];
  const slotMachine = document.getElementById("slot-machine");
  const personaCard = document.getElementById("persona-card");

  // Start all reels spinning with rapidly changing random symbols
  const spinIntervals = reels.map((reel) => {
    reel.classList.add("spinning");
    reel.classList.remove("locked");
    return setInterval(() => {
      const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      reel.querySelector(".slot-symbol").textContent = symbol;
    }, 80);
  });

  // Lock reels one by one, left to right. Last reel locks on the real persona emoji.
  const lockTimes = [900, 1400, 1900];
  reels.forEach((reel, i) => {
    setTimeout(() => {
      clearInterval(spinIntervals[i]);
      reel.classList.remove("spinning");
      reel.classList.add("locked");
      reel.querySelector(".slot-symbol").textContent =
        i === reels.length - 1 ? finalEmoji : SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    }, lockTimes[i]);
  });

  // After the last reel locks, fade out the slot machine and reveal the persona card
  setTimeout(() => {
    slotMachine.classList.add("hide");
    personaCard.style.visibility = "visible";
    personaCard.style.opacity = "1";
  }, lockTimes[lockTimes.length - 1] + 500);
}

// ---------- FORM SUBMIT ----------
careerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  runScanningAnimation(async () => {
    const result = await generateRoadmap();
    renderResults(result);
    showScreen(screenResults);
    runSlotMachine(result.persona.emoji);
  });
});

restartBtn.addEventListener("click", () => {
  showScreen(screenForm);
});

// ---------- ROADMAP GENERATION (entry point) ----------
// Tries the backend (LLM-powered, with its own server-side fallback).
// If the backend itself is unreachable (server down, network issue),
// falls back to the local rule-based generator so the UI never breaks.
async function generateRoadmap() {
  try {
    const res = await fetch("/api/generate-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch: state.branch,
        year: state.year,
        targetRole: state.targetRole,
        selectedSkills: state.selectedSkills,
      }),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);

    const data = await res.json();
    // Basic shape validation — if the response is malformed for any reason,
    // treat it as a failure and fall back locally rather than rendering broken UI.
    if (!data.persona || !Array.isArray(data.roadmapStages)) {
      throw new Error("Malformed roadmap response");
    }
    return data;
  } catch (err) {
    console.warn("Backend roadmap generation unavailable, using local fallback:", err.message);
    return generateRoadmapRuleBased({
      branch: state.branch,
      year: state.year,
      selectedSkills: state.selectedSkills,
      targetRoleId: state.targetRole,
    });
  }
}

// ---------- RESULTS RENDERING ----------
function renderResults(result) {
  lastResult = result; // stored so the Copy My Result button can build its text

  // Hide persona card until the slot machine finishes; show the slot machine.
  document.getElementById("persona-card").style.visibility = "hidden";
  document.getElementById("persona-card").style.opacity = "0";
  const slotMachine = document.getElementById("slot-machine");
  slotMachine.classList.remove("hide");

  // Persona (filled in now, revealed visually once slot machine locks in)
  document.getElementById("persona-emoji").textContent = result.persona.emoji;
  document.getElementById("persona-name").textContent = result.persona.name;
  document.getElementById("persona-desc").textContent = result.persona.desc;

  // Fun tagline — picked based on target role + how much of the skill gap is covered
  const taglineEl = document.getElementById("fun-tagline");
  taglineEl.textContent = pickFunTagline(state.targetRole, result.skillGap.have);

  // Roadmap track
  const track = document.getElementById("roadmap-track");
  track.innerHTML = "";
  result.roadmapStages.forEach((stage, i) => {
    const el = document.createElement("div");
    el.className = "roadmap-stage";
    el.style.animationDelay = `${i * 0.12}s`;
    el.innerHTML = `
      <div class="stage-marker">
        <div class="stage-dot">${["🚀", "📈", "🛠️", "🎯"][i] || "✅"}</div>
        <div class="stage-line"></div>
      </div>
      <div class="stage-content">
        <div class="stage-when">${stage.when}</div>
        <div class="stage-title">${stage.title}</div>
        <div class="stage-desc">${stage.desc}</div>
      </div>
    `;
    track.appendChild(el);
  });

  // Skill gap
  const gapEl = document.getElementById("skillgap-bars");
  gapEl.innerHTML = `
    <div class="skillgap-row">
      <div class="skillgap-label"><span class="skill-name">What You Have</span><span class="skill-pct">${result.skillGap.have}%</span></div>
      <div class="skillgap-track"><div class="skillgap-fill have" style="width:0%" data-target="${result.skillGap.have}"></div></div>
    </div>
    <div class="skillgap-row">
      <div class="skillgap-label"><span class="skill-name">Needed for ${result.skillGap.roleLabel}</span><span class="skill-pct">${result.skillGap.need}%</span></div>
      <div class="skillgap-track"><div class="skillgap-fill need" style="width:0%" data-target="${result.skillGap.need}"></div></div>
    </div>
  `;
  // Animate bars after a tick
  setTimeout(() => {
    gapEl.querySelectorAll(".skillgap-fill").forEach((bar) => {
      bar.style.width = bar.dataset.target + "%";
    });
  }, 100);

  // Named skill chips (have vs still-need) — only render if data provides them
  const detailEl = document.getElementById("skillgap-detail");
  const haveSkills = result.skillGap.haveSkills || [];
  const needSkills = result.skillGap.needSkills || [];

  if (haveSkills.length === 0 && needSkills.length === 0) {
    detailEl.innerHTML = "";
  } else {
    detailEl.innerHTML = `
      ${haveSkills.length > 0 ? `
        <div class="skillgap-detail-row">
          <div class="skillgap-detail-label">✅ You already have</div>
          <div class="skill-chips-mini">
            ${haveSkills.map((s) => `<span class="skill-chip-mini have">${s}</span>`).join("")}
          </div>
        </div>` : ""}
      ${needSkills.length > 0 ? `
        <div class="skillgap-detail-row">
          <div class="skillgap-detail-label">🎯 Still need</div>
          <div class="skill-chips-mini">
            ${needSkills.map((s) => `<span class="skill-chip-mini need">${s}</span>`).join("")}
          </div>
        </div>` : ""}
    `;
  }

  // Resources — title adapts based on whether there's still a gap to close
  const resourcesTitle = document.getElementById("resources-title");
  const hasGapRemaining = (result.skillGap.needSkills || []).length > 0;
  resourcesTitle.textContent = hasGapRemaining
    ? "📚 Resources To Close Your Gap"
    : "🚀 You're Covered — Here's What's Next";

  const resEl = document.getElementById("resources-list");
  resEl.innerHTML = "";
  result.resources.forEach((r) => {
    const a = document.createElement("a");
    a.className = "resource-item";
    a.href = r.url || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = `
      <span class="resource-icon">${r.icon}</span>
      <span class="resource-text">${r.text}<span class="resource-stage">${r.stage}</span></span>
      <span class="resource-arrow">↗</span>
    `;
    resEl.appendChild(a);
  });

  // Project Ideas
  const projectsEl = document.getElementById("projects-list");
  projectsEl.innerHTML = "";
  (result.projectIdeas || []).forEach((p) => {
    const item = document.createElement("div");
    item.className = "project-item";
    item.innerHTML = `
      <div class="project-icon">${p.icon}</div>
      <div class="project-content">
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.desc}</div>
      </div>
    `;
    projectsEl.appendChild(item);
  });
}

// ---------- COPY MY RESULT ----------
function buildShareText(result) {
  const lines = [];
  lines.push(`🧭 My TrailBlazer Career Roadmap`);
  lines.push(``);
  lines.push(`${result.persona.emoji} ${result.persona.name}`);
  lines.push(result.persona.desc);
  lines.push(``);
  lines.push(`📍 Roadmap:`);
  result.roadmapStages.forEach((s) => {
    lines.push(`  • [${s.when}] ${s.title} — ${s.desc}`);
  });
  lines.push(``);
  lines.push(`📊 Skill Gap for ${result.skillGap.roleLabel}: ${result.skillGap.have}% ready`);
  if (result.skillGap.haveSkills?.length) lines.push(`  ✅ Have: ${result.skillGap.haveSkills.join(", ")}`);
  if (result.skillGap.needSkills?.length) lines.push(`  🎯 Still need: ${result.skillGap.needSkills.join(", ")}`);
  if (result.projectIdeas?.length) {
    lines.push(``);
    lines.push(`🛠️ Project Ideas:`);
    result.projectIdeas.forEach((p) => lines.push(`  • ${p.title} — ${p.desc}`));
  }
  lines.push(``);
  lines.push(`Generated with TrailBlazer 🚀`);
  return lines.join("\n");
}

const copyResultsBtn = document.getElementById("copy-results-btn");
copyResultsBtn.addEventListener("click", async () => {
  if (!lastResult) return;

  const text = buildShareText(lastResult);

  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for browsers/contexts where clipboard API is blocked
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  copyResultsBtn.textContent = "✅ Copied!";
  copyResultsBtn.classList.add("copied");
  setTimeout(() => {
    copyResultsBtn.textContent = "📋 Copy My Result";
    copyResultsBtn.classList.remove("copied");
  }, 2000);
});
