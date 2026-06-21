// ============================================================
// roadmap.js — rule-based roadmap, persona & skill-gap generation
// This is the FALLBACK engine — works fully offline, no API needed.
// Designed so the LLM version (added later) returns the exact same shape.
// ============================================================

/**
 * Picks the dominant category from the user's selected skills/interests.
 */
function getDominantCategory(selectedSkills) {
  const counts = {};
  for (const skillName of selectedSkills) {
    const found = SKILLS_DATASET.find(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );
    const cat = found ? found.category : "DEFAULT";
    counts[cat] = (counts[cat] || 0) + 1;
  }

  let best = "DEFAULT";
  let bestCount = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > bestCount && ROADMAP_TEMPLATES[cat]) {
      best = cat;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Picks a persona based on the dominant category / selected skills.
 */
function pickPersona(selectedSkills, dominantCategory) {
  for (const persona of PERSONAS) {
    if (persona.match.includes(dominantCategory)) return persona;
    for (const skill of selectedSkills) {
      if (persona.match.includes(skill)) return persona;
    }
  }
  return PERSONAS[PERSONAS.length - 1]; // Explorer fallback
}

/**
 * Generates a skill-gap snapshot by comparing the student's selected
 * skills against the REQUIRED skills for their chosen target role.
 * Returns both a percentage (for the bars) and named skill lists
 * (for the "have" / "still need" chips).
 */
function generateSkillGap(selectedSkills, targetRoleId) {
  const role = TARGET_ROLES.find((r) => r.id === targetRoleId) || TARGET_ROLES[0];

  const selectedLower = selectedSkills.map((s) => s.toLowerCase());
  const requiredUnique = [...new Set(role.requiredSkills)];

  const have = requiredUnique.filter((skill) => selectedLower.includes(skill.toLowerCase()));
  const need = requiredUnique.filter((skill) => !selectedLower.includes(skill.toLowerCase()));

  const havePct = Math.round((have.length / requiredUnique.length) * 100);

  return {
    roleLabel: role.label,
    have: havePct,
    need: 100,
    haveSkills: have,
    needSkills: need,
  };
}

/**
 * Builds resources that actually respond to the skill gap:
 * - If skills are still missing -> recommend resources for THOSE specific skills.
 * - If no gap remains (100% covered) -> recommend "next step" resources
 *   (advanced practice, interview prep, specialization) instead of basics.
 */
function buildAdaptiveResources(skillGap, targetRoleId) {
  const needSkills = skillGap.needSkills || [];

  if (needSkills.length > 0) {
    const resources = needSkills
      .slice(0, 3) // cap at 3 so the list stays clean, not overwhelming
      .map((skill) => {
        const res = SKILL_RESOURCES[skill];
        return res ? { ...res, stage: skill } : null;
      })
      .filter(Boolean);

    if (resources.length > 0) return resources;
  }

  // No gap left (or no matching resource found) -> show next-step resources
  const nextSteps = NEXT_STEP_RESOURCES[targetRoleId] || NEXT_STEP_RESOURCES.DEFAULT;
  return nextSteps.map((r) => ({ ...r, stage: "Next Step" }));
}

/**
 * MAIN RULE-BASED GENERATOR (fallback / default engine)
 * Returns a consistent shape that both the rule-based AND LLM-based
 * generators produce, so the UI layer never needs to know which ran.
 */
function generateRoadmapRuleBased({ branch, year, selectedSkills, targetRoleId }) {
  const dominantCategory = getDominantCategory(selectedSkills);
  const stages = ROADMAP_TEMPLATES[dominantCategory] || ROADMAP_TEMPLATES.DEFAULT;
  const persona = pickPersona(selectedSkills, dominantCategory);
  const skillGap = generateSkillGap(selectedSkills, targetRoleId);
  const resources = buildAdaptiveResources(skillGap, targetRoleId);

  const motivationalLines = [
    `${branch} + Year ${year}? Perfect timing to start building real momentum.`,
    `Your interests point clearly toward ${persona.name} territory — lean into it.`,
    `Small consistent steps now turn into a strong placement story by next year.`,
  ];
  const motivationalLine = motivationalLines[Math.floor(Math.random() * motivationalLines.length)];

  return {
    source: "rule-based",
    persona: {
      emoji: persona.emoji,
      name: persona.name,
      desc: persona.desc,
    },
    roadmapStages: stages,
    skillGap,
    resources,
    motivationalLine,
  };
}
