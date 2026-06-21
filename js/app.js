// ============================================================
// app.js — main application logic
// ============================================================

const state = {
  branch: "",
  year: "",
  targetRole: "",
  selectedSkills: [],
  engine: "custom",
};

let lastResult = null;

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

branchSelect.addEventListener("change", (e) => { state.branch = e.target.value; validateForm(); });
yearSelect.addEventListener("change", (e) => { state.year = e.target.value; validateForm(); });
targetRoleSelect.addEventListener("change", (e) => { state.targetRole = e.target.value; validateForm(); });

function validateForm() {
  const valid = state.branch && state.year && state.targetRole && state.selectedSkills.length > 0;
  submitBtn.disabled = !valid;
}

let debounceTimer = null;
skillsInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = skillsInput.value;
  if (query.trim().length === 0) {
    suggestionsList.classList.remove("show");
    suggestionsList.innerHTML = "";
    return;
  }
  const customResults = customAutosuggest(query);
  renderSuggestions(customResults);
  debounceTimer = setTimeout(async () => {
    const bootcampResults = await bootcampAutosuggest(query);
    console.log(`[Autosuggest comparison] "${query}" → custom: ${customResults.length}, bootcamp: ${bootcampResults.length}`, { custom: customResults, bootcamp: bootcampResults });
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

document.addEventListener("click", (e) => {
  if (!e.target.closest(".autosuggest-wrap")) {
    suggestionsList.classList.remove("show");
  }
});

skillsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const first = suggestionsList.querySelector("li:not(.empty)");
    if (first) first.click();
  }
});

function showScreen(screenEl) {
  [screenForm, screenScanning, screenResults].forEach((s) => s.classList.remove("active"));
  screenEl.classList.add("active");
}

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

const SLOT_SYMBOLS = ["🎲", "🛠️", "🧠", "⚡", "🌐", "🎯", "🚀", "💡", "🔥", "⭐"];

function runSlotMachine(finalEmoji) {
  const reels = [
    document.getElementById("reel-0"),
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
  ];
  const slotMachine = document.getElementById("slot-machine");
  const personaCard = document.getElementById("persona-card");

  const spinIntervals = reels.map((reel) => {
    reel.classList.add("spinning");
    reel.classList.remove("locked");
    return setInterval(() => {
      const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      reel.querySelector(".slot-symbol").textContent = symbol;
    }, 80);
  });

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

  setTimeout(() => {
    slotMachine.classList.add("hide");
    personaCard.style.visibility = "visible";
    personaCard.style.opacity = "1";
  }, lockTimes[lockTimes.length - 1] + 500);
}

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
    if (!data.persona || !Array.isArray(data.roadmapStages)) throw new Error("Malformed roadmap response");
    return data;
  } catch (err) {
    console.warn("Backend unavailable, using local fallback:", err.message);
    return generateRoadmapRuleBased({
      branch: state.branch,
      year: state.year,
      selectedSkills: state.selectedSkills,
      targetRoleId: state.targetRole,
    });
  }
}

function renderResults(result) {
  lastResult = result;

  document.getElementById("persona-card").style.visibility = "hidden";
  document.getElementById("persona-card").style.opacity = "0";
  const slotMachine = document.getElementById("slot-machine");
  slotMachine.classList.remove("hide");

  document.getElementById("persona-emoji").textContent = result.persona.emoji;
  document.getElementById("persona-name").textContent = result.persona.name;
  document.getElementById("persona-desc").textContent = result.persona.desc;

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

  // Skill gap bars
  const gapEl = document.getElementById("skillgap-bars");
  const isFullyCovered = result.skillGap.have >= 100;
  gapEl.innerHTML = `
    <div class="skillgap-row">
      <div class="skillgap-label"><span class="skill-name">What You Have</span><span class="skill-pct">${result.skillGap.have}%</span></div>
      <div class="skillgap-track"><div class="skillgap-fill have" style="width:0%" data-target="${result.skillGap.have}"></div></div>
    </div>
    ${isFullyCovered ? "" : `
    <div class="skillgap-row">
      <div class="skillgap-label"><span class="skill-name">Target for ${result.skillGap.roleLabel}</span><span class="skill-pct">${result.skillGap.need}%</span></div>
      <div class="skillgap-track"><div class="skillgap-fill need" style="width:0%" data-target="${result.skillGap.need}"></div></div>
    </div>`}
  `;
  setTimeout(() => {
    gapEl.querySelectorAll(".skillgap-fill").forEach((bar) => {
      bar.style.width = bar.dataset.target + "%";
    });
  }, 100);

  // Named skill chips
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
          <div class="skill-chips-mini">${haveSkills.map((s) => `<span class="skill-chip-mini have">${s}</span>`).join("")}</div>
        </div>` : ""}
      ${needSkills.length > 0 ? `
        <div class="skillgap-detail-row">
          <div class="skillgap-detail-label">🎯 Still need</div>
          <div class="skill-chips-mini">${needSkills.map((s) => `<span class="skill-chip-mini need">${s}</span>`).join("")}</div>
        </div>` : ""}
    `;
  }

  // Resources title
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

  // Project ideas
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

  // Study plan section — render the hours picker, plan generates on click
  renderStudyPlanPicker(result);
}

// ---------- STUDY PLAN ----------
const HOUR_LINES = {
  1: "1 hour a day. Slow and steady wins the race. Probably. 🐢",
  2: "2 hours? Now we're talking. Netflix can wait. 😤",
  3: "3 hours a day?! Bro are you okay? Drink water. 💀",
};

const BREAK_LABELS = [
  { icon: "🍕", label: "BREAK WEEK", desc: "Touch grass. Eat biryani. Sleep 9 hours. You earned it." },
  { icon: "🧃", label: "CHILL WEEK", desc: "Review what you built. Fix small bugs. No new stuff." },
  { icon: "🍔", label: "SNACK BREAK", desc: "Watch a tech talk. Scroll GitHub. Eat something nice." },
  { icon: "😴", label: "REST WEEK", desc: "Your brain is a muscle. Even muscles need rest, bro." },
];

function buildStudyPlan(result, hoursPerDay) {
  const stages = result.roadmapStages;
  const needSkills = result.skillGap.needSkills || [];

  // Weeks per stage based on hours/day
  // 1hr = 3 weeks/stage, 2hr = 2 weeks/stage, 3hr = 1.5 weeks/stage
  const weeksPerStage = hoursPerDay === 1 ? 3 : hoursPerDay === 2 ? 2 : 1;
  const breakEvery = hoursPerDay === 3 ? 2 : 3; // more breaks for 3hr grinders

  const rows = [];
  let weekNum = 1;
  let breakIndex = 0;

  stages.forEach((stage, i) => {
    const endWeek = weekNum + weeksPerStage - 1;
    const skill = needSkills[i] || stage.title;
    rows.push({
      type: "study",
      week: weeksPerStage === 1 ? `Week ${weekNum}` : `Week ${weekNum}-${endWeek}`,
      focus: stage.title,
      task: `${hoursPerDay} hr${hoursPerDay > 1 ? "s" : ""}/day — ${stage.desc}`,
      vibe: ["🔥 Let's gooo", "💪 First blood", "😤 Backend era", "🚀 Almost there"][i] || "✅ Keep going",
    });
    weekNum = endWeek + 1;

    // Insert a break after every N stages (not after the last one)
    if ((i + 1) % breakEvery === 0 && i < stages.length - 1) {
      const brk = BREAK_LABELS[breakIndex % BREAK_LABELS.length];
      rows.push({
        type: "break",
        week: `Week ${weekNum}`,
        focus: `${brk.icon} ${brk.label}`,
        task: brk.desc,
        vibe: "😌 Breathe",
      });
      weekNum++;
      breakIndex++;
    }
  });

  // Final ship-it week
  rows.push({
    type: "ship",
    week: `Week ${weekNum}`,
    focus: "🏆 SHIP IT WEEK",
    task: "Deploy your project. Write README. Update LinkedIn. Tell your mom. 🎉",
    vibe: "🎊 You did it!!",
  });

  return rows;
}

function renderStudyPlanPicker(result) {
  const container = document.getElementById("study-plan-section");
  if (!container) return;

  container.innerHTML = `
    <div class="study-plan-card">
      <h3 class="study-plan-title">📅 Build My Study Plan</h3>
      <p class="study-plan-subtitle">How many hours can you study per day?</p>
      <div class="hours-picker">
        <button class="hours-btn" data-hours="1">1 hr</button>
        <button class="hours-btn" data-hours="2">2 hrs</button>
        <button class="hours-btn" data-hours="3">3 hrs</button>
      </div>
      <div id="study-plan-output"></div>
    </div>
  `;

  container.querySelectorAll(".hours-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".hours-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const hours = parseInt(btn.dataset.hours);
      renderStudyPlanTable(result, hours);
    });
  });
}

function renderStudyPlanTable(result, hours) {
  const output = document.getElementById("study-plan-output");
  const rows = buildStudyPlan(result, hours);
  const totalWeeks = rows[rows.length - 1].week.replace("Week ", "").split("-")[0];

  output.innerHTML = `
    <p class="hours-quip">${HOUR_LINES[hours]}</p>
    <div class="study-table-wrap">
      <table class="study-table">
        <thead>
          <tr>
            <th>📆 Week</th>
            <th>🎯 Focus</th>
            <th>📝 Daily Task</th>
            <th>✨ Vibe</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r) => `
            <tr class="study-row ${r.type === "break" ? "break-row" : r.type === "ship" ? "ship-row" : ""}">
              <td class="week-cell">${r.week}</td>
              <td class="focus-cell">${r.focus}</td>
              <td class="task-cell">${r.task}</td>
              <td class="vibe-cell">${r.vibe}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <p class="plan-footer">~${totalWeeks} weeks total. Some biryani. One deployed project. That's the deal. 🤝</p>
  `;
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
