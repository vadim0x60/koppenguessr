// Köppen Climate Data Definitions
const KOPPEN_GROUPS = {
  'A': {
    name: 'A - Tropical',
    desc: 'Average temp >= 18°C in all months. No winter freeze. Megathermal flora.',
    color: '#10b981'
  },
  'B': {
    name: 'B - Arid & Semi-Arid',
    desc: 'Potential evapotranspiration exceeds rainfall. Xerophytic scrub, steppes, or dunes.',
    color: '#f59e0b'
  },
  'C': {
    name: 'C - Temperate / Mesothermal',
    desc: 'Coldest month between -3°C and 18°C. Warm summers, mixed or broadleaf woodland.',
    color: '#3b82f6'
  },
  'D': {
    name: 'D - Continental / Microthermal',
    desc: 'Coldest month < -3°C, warmest month > 10°C. Marked freeze-thaw seasonality, taiga/mixed.',
    color: '#8b5cf6'
  },
  'E': {
    name: 'E - Polar & Alpine',
    desc: 'Warmest month < 10°C. Treeless tundra, dwarf krummholz, or perpetual frost.',
    color: '#06b6d4'
  }
};

const KOPPEN_CLASSES = [
  // Group A
  { code: 'Af', group: 'A', name: 'Tropical Rainforest', summary: 'Constant high temps, precipitation >60mm each month, multi-tiered evergreen canopy.' },
  { code: 'Am', group: 'A', name: 'Tropical Monsoon', summary: 'Intense rainy season with a short dry interval, high annual totals.' },
  { code: 'Aw/As', group: 'A', name: 'Tropical Savanna (Wet/Dry)', summary: 'Tropical climate with a pronounced wet season and dry season, supporting drought-adapted trees and grassland.' },

  // Group B
  { code: 'BWh', group: 'B', name: 'Hot Desert', summary: 'Extremely arid, mean annual temp >= 18°C, sparse succulents/gravel plains.' },
  { code: 'BWk', group: 'B', name: 'Cold Desert', summary: 'Arid, mean annual temp < 18°C, freezing continental winters or cool fog upwelling.' },
  { code: 'BSh', group: 'B', name: 'Hot Semi-Arid (Steppe)', summary: 'Transitional dry scrub/grassland, mean annual temp >= 18°C.' },
  { code: 'BSk', group: 'B', name: 'Cold Semi-Arid (Steppe)', summary: 'Steppe with cold snowy winters and dry, warm to hot summers.' },

  // Group C
  { code: 'Csa', group: 'C', name: 'Hot-summer Mediterranean', summary: 'Hot, dry summers and mild, wet winters; sclerophyllous maquis/olive trees.' },
  { code: 'Csb', group: 'C', name: 'Warm-summer Mediterranean', summary: 'Dry summers tempered by cool coastal marine fog/currents.' },
  { code: 'Csc', group: 'C', name: 'Cold-summer Mediterranean', summary: 'Highland dry summer climate with short, cool summers.' },
  { code: 'Cfa', group: 'C', name: 'Humid Subtropical', summary: 'Hot humid summers with frequent storms, mild winters without a dry season.' },
  { code: 'Cfb', group: 'C', name: 'Temperate Oceanic', summary: 'Mild winters and cool-to-warm summers, frequent cloud/drizzle year-round.' },
  { code: 'Cfc', group: 'C', name: 'Subpolar Oceanic', summary: 'Maritime subpolar with cool short summers (1-3 months >10°C) and mild wet winters.' },
  { code: 'Cwa', group: 'C', name: 'Monsoon Humid Subtropical', summary: 'Hot wet summers driven by monsoon winds, paired with mild dry winters.' },
  { code: 'Cwb', group: 'C', name: 'Subtropical Highland (Dry Winter)', summary: 'Highland temperate climate with wet summers and cool, dry sunny winters.' },
  { code: 'Cwc', group: 'C', name: 'Cold Subtropical Highland', summary: 'High elevation tropical highlands with short, cool summers.' },

  // Group D
  { code: 'Dfa', group: 'D', name: 'Hot-summer Humid Continental', summary: 'Snowy cold winters, hot humid summers (>22°C warmest month).' },
  { code: 'Dfb', group: 'D', name: 'Warm-summer Humid Continental', summary: 'Snowy cold winters, warm mild summers (warmest month <22°C).' },
  { code: 'Dfc', group: 'D', name: 'Subarctic (Taiga)', summary: 'Very long cold winters, 1-3 short cool summer months; boreal spruce/pine.' },
  { code: 'Dfd', group: 'D', name: 'Extremely Cold Subarctic', summary: 'Extreme subarctic climate with coldest month below -38°C.' },
  { code: 'Dwa', group: 'D', name: 'Monsoon Hot Continental', summary: 'Monsoon rainy summers and dry, intensely cold Siberian-influenced winters.' },
  { code: 'Dwb', group: 'D', name: 'Monsoon Warm Continental', summary: 'Warm rainy summer monsoon and dry, freezing continental winters.' },
  { code: 'Dwc', group: 'D', name: 'Monsoon Subarctic', summary: 'Subarctic taiga with dry freezing winters and short monsoonal summers.' },
  { code: 'Dwd', group: 'D', name: 'Extremely Cold Monsoon Subarctic', summary: 'Extreme Siberian winter cold (coldest month <-38°C) and dry winters.' },
  { code: 'Dsa', group: 'D', name: 'Hot-summer Mediterranean Continental', summary: 'Continental freezing winters paired with hot dry Mediterranean summers.' },
  { code: 'Dsb', group: 'D', name: 'Warm-summer Mediterranean Continental', summary: 'Freezing continental winters paired with dry Mediterranean summers in rain shadow.' },
  { code: 'Dsc', group: 'D', name: 'Dry-summer Subarctic', summary: 'High-latitude or alpine subarctic with brief dry summer.' },
  { code: 'Dsd', group: 'D', name: 'Extremely Cold Dry-summer Subarctic', summary: 'Extreme winter cold paired with dry summer drought.' },

  // Group E
  { code: 'ET', group: 'E', name: 'Tundra (Polar/Alpine)', summary: 'Treeless moss/lichen/scree terrain; warmest month between 0°C and 10°C.' },
  { code: 'EF', group: 'E', name: 'Ice Cap', summary: 'Perpetual frost; all 12 months average below 0°C with perpetual ice/snow.' }
];

// State
let locations = [];
let currentIndex = 0;
let score = 0;
let totalRounds = 0;
let streak = 0;
let bestStreak = 0;
let roundAnswered = false;
let availableLocations = [];
let selectedSubtypeCode = null;

// DOM Elements
const streetViewFrame = document.getElementById('streetview-frame');
const directEmbedNotice = document.getElementById('direct-embed-notice');
const openMapBtn = document.getElementById('open-map-btn');
const locNameEl = document.getElementById('location-name');
const locCountryEl = document.getElementById('location-country');
const locCoordsEl = document.getElementById('location-coords');
const optionsGrid = document.getElementById('options-grid');
const resultFeedback = document.getElementById('result-feedback');
const nextBtn = document.getElementById('next-btn');
const scoreDisplay = document.getElementById('score-display');
const streakDisplay = document.getElementById('streak-display');
const accuracyDisplay = document.getElementById('accuracy-display');
const roundDisplay = document.getElementById('round-display');
const explanationCard = document.getElementById('explanation-card');
const explanationTitle = document.getElementById('explanation-title');
const explanationBody = document.getElementById('explanation-body');
const koppenRefBtn = document.getElementById('koppen-ref-btn');
const refModal = document.getElementById('ref-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

// Initialize
async function init() {
  try {
    const res = await fetch('locations.json?t=' + Date.now());
    const source = await res.text();
    locations = JSON.parse(source);
    // Keep the full source pool intact; the reproducible land-use pilot selects
    // a rural-biased deck. If data changes, never apply a stale selection.
    try {
      const selectionRes = await fetch('game-selection.json?t=' + Date.now());
      if (!selectionRes.ok) throw new Error('Land-use selection unavailable');
      const selection = await selectionRes.json();
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
      const hash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== selection.source_sha256) throw new Error('Stale land-use selection');
      const ids = new Set(selection.selected_ids);
      const selected = locations.filter(location => ids.has(location.id));
      if (!selected.length || selected.length !== ids.size) throw new Error('Invalid land-use selection');
      locations = selected;
    } catch (err) {
      console.warn('Using full location pool:', err);
    }
    locations.forEach(location => {
      if (location.koppen_code === 'Aw' || location.koppen_code === 'As') {
        location.koppen_code = 'Aw/As';
        location.koppen_name = 'Tropical Savanna (Wet/Dry)';
      }
    });
    shuffleArray(locations);
    availableLocations = [...locations];
    renderReferenceGuide();
    setupEventListeners();
    startNewRound();
  } catch (err) {
    console.error('Error loading locations:', err);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function setupEventListeners() {
  nextBtn.addEventListener('click', () => {
    startNewRound();
  });

  koppenRefBtn.addEventListener('click', () => {
    refModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    refModal.classList.add('hidden');
  });

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === refModal) refModal.classList.add('hidden');
  });
}

function startNewRound() {
  if (availableLocations.length === 0) {
    availableLocations = [...locations];
    shuffleArray(availableLocations);
  }

  const loc = availableLocations.pop();
  currentIndex = locations.indexOf(loc);
  roundAnswered = false;

  // Reset UI
  resultFeedback.classList.add('hidden');
  resultFeedback.innerHTML = '';
  explanationCard.classList.add('hidden');
  nextBtn.disabled = true;
  nextBtn.classList.add('opacity-50', 'cursor-not-allowed');

  selectedSubtypeCode = null;

  // Blind location details during the question to prevent spoiling
  locNameEl.textContent = '??? Mystery Rural Location ???';
  locCountryEl.textContent = 'Look closely at the vegetation, canopy density, soil color, and topography';
  locCoordsEl.textContent = 'Lat/Lng hidden until answered';

  // Lock "Open in Maps" button during guessing to prevent external spoiler
  openMapBtn.classList.add('opacity-40', 'cursor-not-allowed');
  openMapBtn.href = 'javascript:void(0)';
  openMapBtn.title = 'Available after you choose an answer';

  // Load interactive Street View iframe (no API key required, zero referer errors)
  const embedUrl = loc.pano_id 
    ? `https://maps.google.com/maps?layer=c&panoid=${loc.pano_id}&cbp=11,0,0,0,0&output=svembed`
    : `https://maps.google.com/maps?q=${loc.lat},${loc.lng}&layer=c&cbll=${loc.lat},${loc.lng}&cbp=11,0,0,0,0&output=svembed`;
  streetViewFrame.src = embedUrl;

  // Render question buttons
  renderOptions();

  // Update round counter
  roundDisplay.textContent = totalRounds + 1;
}

function renderOptions() {
  optionsGrid.innerHTML = '';
  KOPPEN_CLASSES
    .forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'option-btn subtype-btn min-h-12 p-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 hover:border-slate-500 transition duration-150 flex items-center justify-center text-center shadow-sm';
      btn.dataset.code = choice.code;
      btn.title = `${choice.name}: ${choice.summary}`;
      btn.setAttribute('aria-label', `${choice.code}: ${choice.name}`);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <span class="font-mono text-base text-emerald-400 font-extrabold">${choice.code}</span>
      `;
      btn.addEventListener('click', () => selectAnswer(choice.code, btn));
      optionsGrid.appendChild(btn);
    });
}

function selectAnswer(code, button) {
  if (roundAnswered) return;

  selectedSubtypeCode = code;
  button.classList.add('border-sky-400', 'bg-sky-950/80', 'ring-2', 'ring-sky-500/40');
  button.setAttribute('aria-pressed', 'true');
  handleGuess();
}

function calculateRoundScore(selectedCode, correctCode) {
  const selectedVariants = selectedCode.split('/');
  const correctVariants = correctCode.split('/');

  return Math.max(...selectedVariants.flatMap(selected => correctVariants.map(correct => {
    let matchingLetters = 0;
    for (let i = 0; i < Math.min(selected.length, correct.length); i++) {
      if (selected[i] === correct[i]) matchingLetters++;
    }
    return matchingLetters / Math.max(selected.length, correct.length);
  })));
}

function formatPoints(points) {
  return Number(points.toFixed(2)).toString();
}

function handleGuess() {
  if (roundAnswered || selectedSubtypeCode === null) return;
  roundAnswered = true;

  const loc = locations[currentIndex];
  totalRounds++;

  const roundScore = calculateRoundScore(selectedSubtypeCode, loc.koppen_code);
  const isExact = selectedSubtypeCode === loc.koppen_code;
  const earnsPartialScore = roundScore > 0 && !isExact;

  const optionButtons = optionsGrid.querySelectorAll('.option-btn');
  optionButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('hover:bg-slate-700/80', 'hover:border-slate-500');
    
    const val = btn.dataset.code;
    const correctVal = loc.koppen_code;

    if (val === correctVal) {
      btn.classList.add('border-emerald-500', 'bg-emerald-950/70', 'ring-2', 'ring-emerald-500/50');
    } else if (val === selectedSubtypeCode && earnsPartialScore) {
      btn.classList.add('border-sky-500', 'bg-sky-950/70', 'ring-2', 'ring-sky-500/50');
    } else if (val === selectedSubtypeCode) {
      btn.classList.add('border-rose-500', 'bg-rose-950/70', 'ring-2', 'ring-rose-500/50');
    } else {
      btn.classList.add('opacity-40');
    }
  });

  // Reveal location details now that answer is placed
  locNameEl.innerHTML = `<span class="text-emerald-400 font-semibold">${loc.name}</span>, ${loc.country}`;
  locCountryEl.textContent = `Coordinates: ${loc.lat.toFixed(4)}°, ${loc.lng.toFixed(4)}°`;
  locCoordsEl.innerHTML = `Climate: <strong class="text-emerald-300 font-mono">${loc.koppen_code}</strong> (${loc.koppen_name})`;

  // Unlock "Open in Maps" button now
  const gmapsUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${loc.lat},${loc.lng}`;
  openMapBtn.href = gmapsUrl;
  openMapBtn.classList.remove('opacity-40', 'cursor-not-allowed');
  openMapBtn.title = 'View in Google Maps';

  // Update Score & Streak
  score += roundScore;
  if (isExact) {
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    resultFeedback.className = 'p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 flex items-center justify-between animate-fadeIn';
    resultFeedback.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-2xl">🎉</span>
        <div>
          <span class="font-bold text-white text-base">Spot on! Excellent deduction!</span>
          <p class="text-xs text-emerald-300">That is correct: <strong>${loc.koppen_code}</strong> (${loc.koppen_name}).</p>
        </div>
      </div>
      <span class="text-xs font-mono font-bold bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded-full">+1 pt</span>
    `;
  } else if (earnsPartialScore) {
    streak = 0;
    resultFeedback.className = 'p-3 rounded-xl bg-sky-950/80 border border-sky-700/60 text-sky-200 flex items-center justify-between animate-fadeIn';
    resultFeedback.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-2xl">🎯</span>
        <div>
          <span class="font-bold text-white text-base">Close!</span>
          <p class="text-xs text-sky-300">Your <strong>${selectedSubtypeCode}</strong> guess partially matches <strong>${loc.koppen_code}</strong> (${loc.koppen_name}).</p>
        </div>
      </div>
      <span class="text-xs font-mono font-bold bg-sky-800 text-sky-100 px-2.5 py-1 rounded-full">+${formatPoints(roundScore)} pts</span>
    `;
  } else {
    streak = 0;
    const actualAnswer = `${loc.koppen_code} (${loc.koppen_name})`;
    resultFeedback.className = 'p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 flex items-center justify-between animate-fadeIn';
    resultFeedback.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-2xl">❌</span>
        <div>
          <span class="font-bold text-white text-base">Not quite!</span>
          <p class="text-xs text-rose-300">Correct climate: <strong class="text-white">${actualAnswer}</strong>.</p>
        </div>
      </div>
      <span class="text-xs font-mono bg-rose-900 text-rose-200 px-2.5 py-1 rounded-full">Streak Reset</span>
    `;
  }

  resultFeedback.classList.remove('hidden');

  // Reveal Explanation
  explanationTitle.innerHTML = `Analysis: <span class="text-emerald-400">${loc.name}</span> (<span class="font-mono text-amber-300">${loc.koppen_code}</span>)`;
  explanationBody.textContent = loc.explanation;
  explanationCard.classList.remove('hidden');

  // Update Scoreboard
  scoreDisplay.textContent = formatPoints(score);
  streakDisplay.textContent = streak;
  const pct = Math.round((score / totalRounds) * 100);
  accuracyDisplay.textContent = `${pct}%`;

  // Enable Next button
  nextBtn.disabled = false;
  nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  nextBtn.focus();
}

function renderReferenceGuide() {
  const guideContainer = document.getElementById('reference-guide-content');
  guideContainer.innerHTML = '';

  const groups = ['A', 'B', 'C', 'D', 'E'];
  groups.forEach(gKey => {
    const gInfo = KOPPEN_GROUPS[gKey];
    const matchingClasses = KOPPEN_CLASSES.filter(c => c.group === gKey);

    const section = document.createElement('div');
    section.className = 'mb-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700';
    section.innerHTML = `
      <div class="flex items-center gap-2.5 mb-2 pb-2 border-b border-slate-700">
        <span class="w-4 h-4 rounded-full" style="background-color: ${gInfo.color}"></span>
        <h4 class="font-bold text-lg text-white">${gInfo.name}</h4>
      </div>
      <p class="text-xs text-slate-400 mb-3">${gInfo.desc}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        ${matchingClasses.map(c => `
          <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
            <div class="font-bold text-white flex items-center gap-1.5 mb-0.5">
              <span class="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">${c.code}</span>
              <span>${c.name}</span>
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed">${c.summary}</p>
          </div>
        `).join('')}
      </div>
    `;
    guideContainer.appendChild(section);
  });
}

// Kickoff
window.addEventListener('DOMContentLoaded', init);
