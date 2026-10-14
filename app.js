/**
 * AutoHelp AI — Main Application Controller
 * Coordinates UI, Speech, AI Engine, Mechanics Locator, Costs, and History
 */

// Popular automotive brands
const BRANDS_CARS = [
  "Maruti Suzuki", "Hyundai", "Tata Motors", "Mahindra", "Toyota",
  "Honda", "Kia", "Volkswagen", "Skoda", "MG", "Renault", "Other Car"
];

const BRANDS_BIKES = [
  "Royal Enfield", "Hero MotoCorp", "Honda 2-Wheelers", "Bajaj Auto",
  "TVS Motor", "Yamaha", "KTM", "Suzuki 2-Wheelers", "Ather / Ola (EV)", "Other Bike"
];

// Preconfigured Hackathon Demo Scenarios
const DEMO_SCENARIOS = [
  {
    titleEn: "Tata Nexon EV — Engine / Drive Overheating Warning",
    titleHi: "टाटा नेक्सन — इंजन व ड्राइव मोटर ओवरहीटिंग",
    titleTe: "టాటా నెక్సాన్ — ఇంజిన్ విపరీతంగా వేడెక్కడం",
    vehicleType: "car",
    brand: "Tata Motors",
    model: "Nexon EV Max (2024)",
    fuelType: "ev",
    symptomEn: "High temperature warning light illuminated on dashboard, motor power restricted, and cooling fan running at maximum speed with sweet smell.",
    symptomHi: "डैशबोर्ड पर हाई टेम्परेचर लाइट जल गई है, मोटर की ताकत कम हो गई है और कूलिंग फैन बहुत तेज आवाज में चल रहा है।",
    symptomTe: "డ్యాష్‌బోర్డ్‌లో హై టెంపరేచర్ వార్నింగ్ లైట్ వెలుగుతోంది, ఇంజిన్ వేడెక్కింది, పవర్ తగ్గిపోయింది మరియు కూలింగ్ ఫ్యాన్ విపరీతమైన శబ్దంతో తిరుగుతోంది.",
    lang: "te"
  },
  {
    titleEn: "Royal Enfield Classic 350 — Rapid Clicking & Won't Start",
    titleHi: "रॉयल एनफील्ड — टिक-टिक आवाज और स्टार्ट न होना",
    titleTe: "రాయల్ ఎన్‌ఫీల్డ్ 350 — బ్యాటరీ డెడ్ / టిక్ టిక్ శబ్దం",
    vehicleType: "bike",
    brand: "Royal Enfield",
    model: "Classic 350 (2023)",
    fuelType: "petrol",
    symptomEn: "Self-starter button only produces a rapid clicking noise. Headlight turns very dim when pressed, engine will not turn over.",
    symptomHi: "सेल्फ स्टार्ट बटन दबाने पर केवल तेज टिक-टिक की आवाज आ रही है और हेडलाइट बहुत मद्धिम पड़ जाती है। गाड़ी स्टार्ट नहीं हो रही।",
    symptomTe: "సెల్ఫ్ స్టార్ట్ బటన్ నొక్కినప్పుడు టిక్ టిక్ శబ్దం వస్తోంది, హెడ్‌లైట్ మసకబారుతోంది. బైక్ స్టార్ట్ కావడం లేదు.",
    lang: "hi"
  },
  {
    titleEn: "Hyundai Creta — Metallic Grinding Brakes & Spongy Pedal",
    titleHi: "हुंडई क्रेटा — ब्रेक से घिसने की आवाज व ढीला पेडल",
    titleTe: "హ్యుందాయ్ క్రెటా — బ్రేకులు సౌండ్ రావడం & పెడల్ లూజ్",
    vehicleType: "car",
    brand: "Hyundai",
    model: "Creta SX (2022)",
    fuelType: "diesel",
    symptomEn: "Loud metal-on-metal grinding noise when braking at speed, and brake pedal sinks nearly to the floor before engaging.",
    symptomHi: "ब्रेक लगाने पर लोहे के रगड़ने जैसी भयानक आवाज आ रही है और ब्रेक पेडल बिल्कुल फर्श तक धंस रहा है।",
    symptomTe: "బ్రేక్ వేసినప్పుడు లోహాలు రాసుకుంటున్న పెద్ద శబ్దం వస్తోంది మరియు బ్రేక్ పెడల్ కిందకు సులువుగా దిగిపోతోంది.",
    lang: "en"
  },
  {
    titleEn: "Maruti Swift — Dense White Smoke from Exhaust",
    titleHi: "मारुति स्विफ्ट — साइलेंसर से भारी सफेद धुआं",
    titleTe: "మారుతి స్విఫ్ట్ — సైలెన్సర్ నుండి దట్టమైన తెల్లటి పొగ",
    vehicleType: "car",
    brand: "Maruti Suzuki",
    model: "Swift ZXi (2021)",
    fuelType: "petrol",
    symptomEn: "Dense white smoke billowing out of the exhaust pipe, sweet coolant smell in cabin, and coolant level dropping rapidly.",
    symptomHi: "साइलेंसर से बहुत भारी सफेद धुआं निकल रहा है, जलने जैसी गंध आ रही है और कूलेंट का स्तर तेजी से कम हो गया है।",
    symptomTe: "సైలెన్సర్ నుండి దట్టమైన తెల్లటి పొగ వస్తోంది, ఇంజిన్ హీట్ అవుతోంది మరియు కూలెంట్ వేగంగా ఖాళీ అయిపోతోంది.",
    lang: "te"
  },
  {
    titleEn: "Honda Activa 6G — Front Tyre Flat on Highway",
    titleHi: "होंडा एक्टिवा — हाईवे पर अगला टायर पंक्चर",
    titleTe: "హోండా యాక్టివా — హైవే మీద టైర్ పంక్చర్",
    vehicleType: "bike",
    brand: "Honda 2-Wheelers",
    model: "Activa 6G",
    fuelType: "petrol",
    symptomEn: "Front tyre suddenly lost pressure on highway, handle wobbling heavily, completely flat tyre resting on the rim.",
    symptomHi: "चलते-चलते अगला टायर अचानक पूरी तरह बैठ गया, हैंडल कांप रहा है और टायर पंक्चर हो गया है।",
    symptomTe: "ముందు టైర్‌లో గాలి పూర్తిగా పోయింది, హ్యాండిల్ కంట్రోల్ తప్పుతోంది, టైర్ పంక్చర్ అయ్యి రిమ్ మీదకు వచ్చింది.",
    lang: "hi"
  }
];

class AppState {
  constructor() {
    this.selectedVehicleType = 'car';
    this.selectedBrand = '';
    this.selectedModel = '';
    this.selectedFuel = 'petrol';
    this.currentDiagnosis = null;
    this.history = [];
    this.loadHistory();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('autohelp_history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (e) {
      this.history = [];
    }
  }

  saveToHistory(diag) {
    if (!diag) return;
    this.history.unshift(diag);
    if (this.history.length > 20) this.history.pop();
    try {
      localStorage.setItem('autohelp_history', JSON.stringify(this.history));
    } catch (e) {}
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('autohelp_history');
    if (typeof showToast === 'function') {
      showToast("History cleared", "info");
    }
  }
}

const appState = new AppState();

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  setupLanguage();
  setupVehicleSelectors();
  setupSymptomInput();
  setupDiagnosisActions();
  setupDemoModal();
  setupHistoryModal();
  setupSafetyTools();
  setupNavigation();

  // Initialize Map & Cost Estimator
  if (window.mechanicsService) window.mechanicsService.initMap();
  if (window.costEstimator) window.costEstimator.updateCostUI();
});

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 1. Language Setup
function setupLanguage() {
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setAppLanguage(e.target.value);
    });
  }
  // Initial language render
  setAppLanguage('en');
}

// 2. Vehicle Selector Setup
function setupVehicleSelectors() {
  const tabCar = document.getElementById('tabCar');
  const tabBike = document.getElementById('tabBike');
  const brandSelect = document.getElementById('brandSelect');

  const updateBrandOptions = (type) => {
    if (!brandSelect) return;
    brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
    const list = type === 'car' ? BRANDS_CARS : BRANDS_BIKES;
    list.forEach(brand => {
      const opt = document.createElement('option');
      opt.value = brand;
      opt.textContent = brand;
      brandSelect.appendChild(opt);
    });
  };

  if (tabCar && tabBike) {
    tabCar.addEventListener('click', () => {
      tabCar.classList.add('active');
      tabBike.classList.remove('active');
      appState.selectedVehicleType = 'car';
      updateBrandOptions('car');
    });

    tabBike.addEventListener('click', () => {
      tabBike.classList.add('active');
      tabCar.classList.remove('active');
      appState.selectedVehicleType = 'bike';
      updateBrandOptions('bike');
    });
  }

  updateBrandOptions('car');

  // Fuel Type Pills
  document.querySelectorAll('.fuel-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.fuel-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.selectedFuel = pill.getAttribute('data-fuel');
    });
  });
}

// 3. Symptoms Input & Quick Chips Setup
function setupSymptomInput() {
  const symptomInput = document.getElementById('symptomInput');
  const charCounter = document.getElementById('charCounter');
  const micBtn = document.getElementById('micBtn');

  if (symptomInput && charCounter) {
    symptomInput.addEventListener('input', () => {
      charCounter.textContent = `${symptomInput.value.length} / 500`;
    });
  }

  // Quick Chips in Hero & Diagnosis
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const symptomText = chip.getAttribute('data-symptom') || chip.textContent.trim();
      if (symptomInput) {
        symptomInput.value = symptomText;
        symptomInput.dispatchEvent(new Event('input'));
        // Scroll to diagnosis section
        const diagSec = document.getElementById('diagnose');
        if (diagSec) diagSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Mic Button Click
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (window.speechService) {
        window.speechService.toggleListening(currentLang);
      }
    });
  }
}

// 4. Diagnosis Submission & Result Rendering
function setupDiagnosisActions() {
  const btnDiagnose = document.getElementById('btnDiagnose');
  if (!btnDiagnose) return;

  btnDiagnose.addEventListener('click', async () => {
    const symptomInput = document.getElementById('symptomInput');
    const brandSelect = document.getElementById('brandSelect');
    const modelInput = document.getElementById('modelInput');

    const symptoms = symptomInput ? symptomInput.value.trim() : '';
    if (!symptoms) {
      showToast("Please describe your vehicle problem or speak into the microphone.", "warning");
      if (symptomInput) symptomInput.focus();
      return;
    }

    const brand = brandSelect ? brandSelect.value : '';
    const model = modelInput ? modelInput.value.trim() : '';

    // Show loading UI
    btnDiagnose.disabled = true;
    btnDiagnose.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
      </svg>
      <span>${t('btn_analyzing')}</span>
    `;

    try {
      const result = await window.aiEngine.diagnose({
        vehicleType: appState.selectedVehicleType,
        brand: brand || (appState.selectedVehicleType === 'car' ? 'Car' : 'Motorcycle'),
        model: model,
        fuelType: appState.selectedFuel,
        symptoms: symptoms,
        language: currentLang
      });

      appState.currentDiagnosis = result;
      appState.saveToHistory(result);

      renderDiagnosisCard(result);

      // Automatically speak solution in target language
      if (window.speechService && result.speechScript) {
        window.speechService.speakText(result.speechScript, result.language || currentLang);
      }

      showToast("Diagnosis complete!", "success");
    } catch (err) {
      console.error("Diagnosis error:", err);
      showToast("Failed to analyze breakdown. Please try again.", "warning");
    } finally {
      btnDiagnose.disabled = false;
      btnDiagnose.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${t('btn_run_diag')}</span>
      `;
    }
  });

  // Audio Player Bar Controls
  const playPauseBtn = document.getElementById('audioPlayPauseBtn');
  const stopAudioBtn = document.getElementById('audioStopBtn');
  const speedSelect = document.getElementById('audioSpeedSelect');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (!window.speechService) return;
      if (window.speechService.isPlayingAudio) {
        window.speechService.pauseSpeaking();
      } else if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechService.resumeSpeaking();
      } else if (appState.currentDiagnosis && appState.currentDiagnosis.speechScript) {
        window.speechService.speakText(
          appState.currentDiagnosis.speechScript,
          appState.currentDiagnosis.language || currentLang
        );
      }
    });
  }

  if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', () => {
      if (window.speechService) window.speechService.stopSpeaking();
    });
  }

  if (speedSelect) {
    speedSelect.addEventListener('change', (e) => {
      if (window.speechService) window.speechService.setRate(e.target.value);
    });
  }
}

// Render active diagnosis card
function renderDiagnosisCard(diag) {
  const resultPanel = document.getElementById('diagnosisResultPanel');
  if (!resultPanel) return;

  const isCritical = diag.severity === 'critical';
  const severityClass = diag.severity || 'medium';

  let causesHtml = '';
  if (diag.possibleCauses && diag.possibleCauses.length > 0) {
    causesHtml = diag.possibleCauses.map(c => `
      <li class="cause-item">
        <span>${c.cause}</span>
        <span class="cause-probability">${c.probability} match</span>
      </li>
    `).join('');
  }

  let stepsHtml = '';
  if (diag.troubleshootingSteps && diag.troubleshootingSteps.length > 0) {
    stepsHtml = diag.troubleshootingSteps.map(s => `
      <li class="step-item">
        <div class="step-num">${s.step}</div>
        <div class="step-text">
          <strong>${s.title}:</strong> ${s.instruction}
        </div>
      </li>
    `).join('');
  }

  let followupsHtml = '';
  if (diag.followUpQuestions && diag.followUpQuestions.length > 0) {
    followupsHtml = diag.followUpQuestions.map((q, qIdx) => `
      <div class="followup-box">
        <div class="followup-q">❓ ${q.question}</div>
        <div class="followup-options">
          ${q.options.map(opt => `
            <button type="button" class="btn-followup" onclick="handleFollowUpAnswer('${opt.replace(/'/g, "\\'")}')">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  resultPanel.innerHTML = `
    <div class="diagnosis-card">
      <div class="diagnosis-header">
        <div class="header-left">
          <div class="vehicle-icon-badge">
            ${diag.vehicleType === 'bike' ? '🏍️' : '🚗'}
          </div>
          <div>
            <div class="diagnosis-v-title">${diag.title}</div>
            <div class="diagnosis-v-subtitle">${diag.vehicle} &bull; ${diag.fuelType ? diag.fuelType.toUpperCase() : ''}</div>
          </div>
        </div>
        <div class="urgency-badge ${severityClass}">
          ${diag.urgencyBadge || 'MEDIUM'}
        </div>
      </div>

      <!-- Audio Reader Bar -->
      <div class="audio-player-bar">
        <div class="audio-controls">
          <button type="button" id="audioPlayPauseBtn" class="btn-audio-circle" title="Read Aloud">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <button type="button" id="audioStopBtn" class="btn-audio-circle" title="Stop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14"></rect>
            </svg>
          </button>
          <div class="audio-title-info">
            <span class="audio-label" id="audioPlayerLabel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              ${t('read_aloud')}
            </span>
            <span class="audio-sub">${diag.language === 'te' ? 'తెలుగు వాయిస్' : diag.language === 'hi' ? 'हिन्दी वॉइस' : 'English Voice'}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label style="font-size: 0.75rem; color: #94a3b8;">Speed:</label>
          <select id="audioSpeedSelect" class="audio-speed-select">
            <option value="0.85">0.85x</option>
            <option value="1.0" selected>1.0x</option>
            <option value="1.2">1.2x</option>
          </select>
        </div>
      </div>

      <!-- Body Content -->
      <div class="diagnosis-body">
        <div class="issue-summary-box">
          <div class="summary-headline">Summary of Problem:</div>
          <div class="summary-desc">${diag.summary}</div>
        </div>

        <div class="diag-subheading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          ${t('causes_title')}
        </div>
        <ul class="causes-list">${causesHtml}</ul>

        <div class="diag-subheading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          ${t('steps_title')}
        </div>
        <ul class="steps-list">${stepsHtml}</ul>

        ${followupsHtml ? `
          <div class="diag-subheading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            ${t('followup_title')}
          </div>
          ${followupsHtml}
        ` : ''}

        <!-- Mechanic Recommendation Box -->
        <div class="mechanic-advice-box ${isCritical ? 'critical' : 'safe'}">
          <div class="advice-text">
            <strong>${isCritical ? '🚨 ' : '🛠️ '} Recommendation:</strong>
            ${diag.mechanicRecommendation}
          </div>
          <button type="button" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="scrollToMechanics()">
            ${t('btn_find_nearby_now')}
          </button>
        </div>

        <div style="margin-bottom: 1rem; font-size: 0.9rem; color: #475569;">
          <strong>Estimated Repair Cost Range:</strong> <span style="color: #2563eb; font-weight: bold;">${diag.estimatedCost}</span>
        </div>

        <div class="diag-disclaimer">
          <span>⚠️</span>
          <span>${diag.disclaimer || t('disclaimer_text')}</span>
        </div>
      </div>
    </div>
  `;

  // Re-attach audio events inside newly rendered card
  const newPlayBtn = document.getElementById('audioPlayPauseBtn');
  const newStopBtn = document.getElementById('audioStopBtn');
  const newSpeed = document.getElementById('audioSpeedSelect');

  if (newPlayBtn) {
    newPlayBtn.addEventListener('click', () => {
      if (!window.speechService) return;
      if (window.speechService.isPlayingAudio) {
        window.speechService.pauseSpeaking();
      } else if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechService.resumeSpeaking();
      } else if (diag.speechScript) {
        window.speechService.speakText(diag.speechScript, diag.language || currentLang);
      }
    });
  }

  if (newStopBtn) {
    newStopBtn.addEventListener('click', () => {
      if (window.speechService) window.speechService.stopSpeaking();
    });
  }

  if (newSpeed) {
    newSpeed.addEventListener('change', (e) => {
      if (window.speechService) window.speechService.setRate(e.target.value);
    });
  }
}

// User clicked follow-up question answer option
window.handleFollowUpAnswer = function(answerText) {
  showToast(`Noted: "${answerText}". Refining diagnosis context.`, 'info');
  const symptomInput = document.getElementById('symptomInput');
  if (symptomInput) {
    symptomInput.value += ` (Clarification: ${answerText})`;
    symptomInput.dispatchEvent(new Event('input'));
  }
};

window.scrollToMechanics = function() {
  const mechSection = document.getElementById('mechanics');
  if (mechSection) mechSection.scrollIntoView({ behavior: 'smooth' });
};

// 5. Demo Scenarios Modal
function setupDemoModal() {
  const modal = document.getElementById('demoModal');
  const openBtn = document.getElementById('btnOpenDemoModal');
  const closeBtn = document.getElementById('btnCloseDemoModal');
  const listContainer = document.getElementById('demoScenariosList');

  if (!modal || !listContainer) return;

  // Render demo scenario cards
  listContainer.innerHTML = '';
  DEMO_SCENARIOS.forEach((sc, idx) => {
    const item = document.createElement('div');
    item.className = 'demo-scenario-item';

    const langBadge = sc.lang === 'te' ? 'తెలుగు' : sc.lang === 'hi' ? 'हिन्दी' : 'English';
    const title = sc.lang === 'te' ? sc.titleTe : sc.lang === 'hi' ? sc.titleHi : sc.titleEn;
    const symptom = sc.lang === 'te' ? sc.symptomTe : sc.lang === 'hi' ? sc.symptomHi : sc.symptomEn;

    item.innerHTML = `
      <div class="demo-sc-title">
        <span>${title}</span>
        <span style="font-size: 0.72rem; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 99px;">${langBadge}</span>
      </div>
      <div class="demo-sc-vehicle">${sc.brand} — ${sc.model} (${sc.fuelType.toUpperCase()})</div>
      <div class="demo-sc-quote">"${symptom}"</div>
    `;

    item.addEventListener('click', () => {
      loadDemoScenario(sc);
      modal.classList.remove('active');
    });

    listContainer.appendChild(item);
  });

  if (openBtn) openBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

function loadDemoScenario(sc) {
  // Set language
  setAppLanguage(sc.lang);

  // Set vehicle type
  const tabCar = document.getElementById('tabCar');
  const tabBike = document.getElementById('tabBike');
  if (sc.vehicleType === 'bike') {
    if (tabBike) tabBike.click();
  } else {
    if (tabCar) tabCar.click();
  }

  // Set brand & model
  setTimeout(() => {
    const brandSelect = document.getElementById('brandSelect');
    const modelInput = document.getElementById('modelInput');
    const symptomInput = document.getElementById('symptomInput');

    if (brandSelect) brandSelect.value = sc.brand;
    if (modelInput) modelInput.value = sc.model;

    // Set fuel pill
    document.querySelectorAll('.fuel-pill').forEach(pill => {
      if (pill.getAttribute('data-fuel') === sc.fuelType) {
        pill.click();
      }
    });

    // Set symptom text
    const symptomText = sc.lang === 'te' ? sc.symptomTe : sc.lang === 'hi' ? sc.symptomHi : sc.symptomEn;
    if (symptomInput) {
      symptomInput.value = symptomText;
      symptomInput.dispatchEvent(new Event('input'));
    }

    // Scroll to diagnosis section
    const diagSec = document.getElementById('diagnose');
    if (diagSec) diagSec.scrollIntoView({ behavior: 'smooth' });

    showToast(`Loaded scenario: ${sc.brand} (${sc.lang.toUpperCase()})`, 'info');
  }, 100);
}

// 6. History Modal
function setupHistoryModal() {
  const modal = document.getElementById('historyModal');
  const openBtn = document.getElementById('btnNavHistory');
  const closeBtn = document.getElementById('btnCloseHistoryModal');
  const clearBtn = document.getElementById('btnClearHistory');
  const listContainer = document.getElementById('historyListContainer');

  const renderHistory = () => {
    if (!listContainer) return;
    if (appState.history.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: #94a3b8;">${t('history_empty')}</div>`;
      return;
    }

    listContainer.innerHTML = '';
    appState.history.forEach((h, index) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      const timeStr = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="history-info">
          <span class="history-date">${timeStr} &bull; ${h.vehicle}</span>
          <span class="history-title">${h.title}</span>
          <span class="history-symptom">${h.summary.substring(0, 80)}...</span>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="viewHistoryItem(${index})">
            View
          </button>
        </div>
      `;
      listContainer.appendChild(item);
    });
  };

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderHistory();
      if (modal) modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      appState.clearHistory();
      renderHistory();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  window.viewHistoryItem = function(index) {
    const item = appState.history[index];
    if (item) {
      appState.currentDiagnosis = item;
      renderDiagnosisCard(item);
      if (modal) modal.classList.remove('active');
      const diagSec = document.getElementById('diagnose');
      if (diagSec) diagSec.scrollIntoView({ behavior: 'smooth' });
    }
  };
}

// 7. Safety Tools & Night SOS Strobe
function setupSafetyTools() {
  const btnStrobe = document.getElementById('btnStrobe');
  const strobeOverlay = document.getElementById('strobeOverlay');
  const btnShareLoc = document.getElementById('btnShareLocation');

  // Night Strobe Light
  if (btnStrobe && strobeOverlay) {
    btnStrobe.addEventListener('click', () => {
      strobeOverlay.classList.add('active');
    });

    strobeOverlay.addEventListener('click', () => {
      strobeOverlay.classList.remove('active');
    });
  }

  // WhatsApp Location Share
  if (btnShareLoc) {
    btnShareLoc.addEventListener('click', (e) => {
      e.preventDefault();
      const coords = (window.mechanicsService && window.mechanicsService.userCoords) || [17.4435, 78.3772];
      const mapsUrl = `https://maps.google.com/?q=${coords[0]},${coords[1]}`;
      const msg = encodeURIComponent(
        `EMERGENCY BREAKDOWN ALERT!\nMy vehicle has broken down.\nLocation: ${mapsUrl}\nCoordinates: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}\nPlease send roadside assistance urgently.`
      );
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    });
  }

  // Cost calculator event listeners
  const costInputs = ['costVehicleSelect', 'costComponentSelect', 'costSeveritySelect'];
  costInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => window.costEstimator && window.costEstimator.updateCostUI());
  });

  // Mechanic filters
  document.querySelectorAll('.m-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (window.mechanicsService) window.mechanicsService.setFilter(filter);
    });
  });

  // Recenter button
  const btnRecenter = document.getElementById('btnRecenter');
  if (btnRecenter) {
    btnRecenter.addEventListener('click', () => {
      if (window.mechanicsService) window.mechanicsService.recenterMap();
    });
  }
}

// 8. Navigation & Mobile Menu
function setupNavigation() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
}
