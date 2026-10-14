/**
 * AutoHelp AI — AI Diagnosis Engine
 * Supports Live Gemini Backend Proxy & Multilingual Offline Knowledge Base
 * Languages: English (en), Hindi (hi), Telugu (te)
 */

class AIEngine {
  constructor() {
    this.apiEndpoint = '/api/diagnose';
    this.statusEndpoint = '/api/status';
    this.isBackendAvailable = false;
    this.checkBackend();
  }

  async checkBackend() {
    try {
      const res = await fetch(this.statusEndpoint, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        this.isBackendAvailable = data.online === true && data.hasApiKey === true;
        console.log("AutoHelp Backend Status:", data);
      }
    } catch (e) {
      this.isBackendAvailable = false;
      console.log("Running in client-side / offline mode.");
    }
  }

  // Detect script language from user input
  detectLanguage(text) {
    if (!text) return currentLang || 'en';
    
    // Telugu Unicode block: 0C00–0C7F
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te';
    }
    // Devanagari (Hindi) Unicode block: 0900–097F
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }
    // Default to selected language or English
    return currentLang || 'en';
  }

  // Main diagnosis entry point
  async diagnose(params) {
    const { vehicleType, brand, model, fuelType, symptoms, language } = params;
    const detectedLang = language || this.detectLanguage(symptoms);

    // If backend with Gemini is available and demo mode is not forced
    if (this.isBackendAvailable && !params.forceDemo) {
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleType,
            brand,
            model,
            fuelType,
            symptoms,
            language: detectedLang
          })
        });

        if (response.ok) {
          const aiResult = await response.json();
          if (aiResult && aiResult.summary) {
            aiResult.source = 'Live Gemini AI';
            return aiResult;
          }
        }
      } catch (err) {
        console.warn("Backend API request failed, falling back to local expert engine:", err);
      }
    }

    // Local Knowledge-Base Diagnosis
    return this.diagnoseLocally({
      vehicleType,
      brand,
      model,
      fuelType,
      symptoms,
      language: detectedLang
    });
  }

  // Robust Multilingual Automotive Diagnostic Knowledge Base
  diagnoseLocally({ vehicleType, brand, model, fuelType, symptoms, language }) {
    const lowerText = (symptoms || '').toLowerCase();
    const isBike = vehicleType === 'bike';
    const isEV = fuelType === 'ev';

    let matchedCategory = 'general';

    // Symptom matching patterns
    if (
      lowerText.includes('overheat') || lowerText.includes('heat') || lowerText.includes('steam') ||
      lowerText.includes('గరం') || lowerText.includes('వేడెక్కి') || lowerText.includes('ఆవిరి') ||
      lowerText.includes('गर्म') || lowerText.includes('तापमान') || lowerText.includes('भाप')
    ) {
      matchedCategory = 'overheating';
    } else if (
      lowerText.includes('battery') || lowerText.includes('start') || lowerText.includes('click') ||
      lowerText.includes('బ్యాటరీ') || lowerText.includes('స్టార్ట్') || lowerText.includes('టిక్') ||
      lowerText.includes('बैटरी') || lowerText.includes('स्टार्ट') || lowerText.includes('टिक')
    ) {
      matchedCategory = 'battery_starter';
    } else if (
      lowerText.includes('brake') || lowerText.includes('squeak') || lowerText.includes('grind') ||
      lowerText.includes('బ్రేక్') || lowerText.includes('సౌండ్') || lowerText.includes('ఆగడం లేదు') ||
      lowerText.includes('ब्रेक') || lowerText.includes('आवाज')
    ) {
      matchedCategory = 'brakes';
    } else if (
      lowerText.includes('tyre') || lowerText.includes('tire') || lowerText.includes('puncture') || lowerText.includes('flat') ||
      lowerText.includes('టైర్') || lowerText.includes('పంక్చర్') || lowerText.includes('గాలి') ||
      lowerText.includes('टायर') || lowerText.includes('पंक्चर') || lowerText.includes('हवा')
    ) {
      matchedCategory = 'tyre';
    } else if (
      lowerText.includes('smoke') || lowerText.includes('white smoke') || lowerText.includes('black smoke') ||
      lowerText.includes('పొగ') || lowerText.includes('తెల్లటి పొగ') ||
      lowerText.includes('धुआं') || lowerText.includes('सफेद धुआं')
    ) {
      matchedCategory = 'smoke';
    } else if (
      lowerText.includes('clutch') || lowerText.includes('gear') || lowerText.includes('slip') ||
      lowerText.includes('గేర్') || lowerText.includes('క్లచ్') ||
      lowerText.includes('गियर') || lowerText.includes('क्लच')
    ) {
      matchedCategory = 'transmission';
    } else if (isEV && (lowerText.includes('charge') || lowerText.includes('motor') || lowerText.includes('range') || lowerText.includes('warning'))) {
      matchedCategory = 'ev_system';
    }

    // Build the diagnostic result in the selected/detected language
    return this.buildResult(matchedCategory, { vehicleType, brand, model, fuelType, language });
  }

  buildResult(category, { vehicleType, brand, model, fuelType, language }) {
    const vName = `${brand || ''} ${model || (vehicleType === 'bike' ? 'Motorcycle' : 'Car')}`.trim();
    const lang = ['en', 'hi', 'te'].includes(language) ? language : 'en';

    const DB = {
      // 1. ENGINE OVERHEATING
      overheating: {
        en: {
          title: `Engine Overheating Alert — ${vName}`,
          summary: `High coolant temperature detected. Operating in this state risks warped cylinder heads or severe engine seizure.`,
          severity: "critical",
          urgencyBadge: "CRITICAL — DO NOT DRIVE",
          possibleCauses: [
            { cause: "Coolant level low or leaking hose/radiator", probability: "65%" },
            { cause: "Radiator cooling fan failure or blown relay", probability: "20%" },
            { cause: "Stuck closed thermostat valve or water pump failure", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "Turn Off A/C and Pull Over Safely", instruction: "Activate hazard lights immediately and coast safely to the left road shoulder. Turn off engine to prevent seizure." },
            { step: 2, title: "SAFETY WARNING: Do NOT Open Radiator Cap", instruction: "Pressurized scalding steam can cause severe 3rd-degree burns! Wait at least 25 to 30 minutes until engine block cools completely." },
            { step: 3, title: "Check Expansion Tank & Ground Leaks", instruction: "Inspect the translucent coolant reservoir tank. Check underneath the engine for colored fluid puddles (green/pink/blue)." },
            { step: 4, title: "Emergency Water Top-Up", instruction: "Only once cold, if reservoir is dry and no garage is nearby, slowly add clean distilled or drinking water to the reservoir to reach nearest garage." }
          ],
          followUpQuestions: [
            { question: "Is steam visibly rising from under the bonnet/hood?", options: ["Yes, active steam", "No steam, just high gauge reading", "Smelled sweet chemical odor"] },
            { question: "Did the radiator cooling fan spin when the engine was running?", options: ["Yes, fan was spinning fast", "No, fan was stationary", "Not sure"] }
          ],
          mechanicRecommendation: "Towing or mobile roadside coolant inspection recommended. Driving more than 2 km under redline temperature will destroy the engine gasket.",
          estimatedCost: "₹1,200 – ₹4,500 (Coolant flush/hose) / ₹8,000+ (Water pump/Thermostat)",
          speechScript: `Attention: Engine overheating detected for your ${vName}. Do not drive further. Safely pull over, turn on hazard lights, and turn off the engine. Do not open the radiator cap while hot, as pressurized boiling coolant causes severe burns. Towing or roadside coolant refill is recommended.`
        },
        hi: {
          title: `इंजन अत्यधिक गर्म होने की चेतावनी — ${vName}`,
          summary: `इंजन का तापमान खतरनाक स्तर पर पहुँच चुका है। इस स्थिति में गाड़ी चलाने से इंजन सीज हो सकता है।`,
          severity: "critical",
          urgencyBadge: "गंभीर — गाड़ी आगे न चलाएं",
          possibleCauses: [
            { cause: "कूलेंट का स्तर कम होना या पाइप/रेडिएटर से रिसाव", probability: "65%" },
            { cause: "रेडिएटर कूलिंग फैन या रिले खराब होना", probability: "20%" },
            { cause: "थर्मोस्टेट वॉल्व या वॉटर पंप की खराबी", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "तुरंत एसी बंद करें और गाड़ी किनारे लगाएं", instruction: "हेज़ार्ड लाइट चालू करें और गाड़ी को सुरक्षित बाईं तरफ रोककर तुरंत इंजन बंद करें।" },
            { step: 2, title: "सुरक्षा चेतावनी: गर्म रेडिएटर ढक्कन कभी न खोलें", instruction: "उबलता हुआ कूलेंट फटने से गंभीर जलन हो सकती है। इंजन को कम से कम 25-30 मिनट तक ठंडा होने दें।" },
            { step: 3, title: "कूलेंट टैंक और जमीन पर रिसाव जांचें", instruction: "प्लास्टिक कूलेंट टैंक का लेवल देखें। गाड़ी के नीचे कोई रंगीन पानी (हरा/गुलाबी) तो नहीं टपक रहा।" },
            { step: 4, title: "अस्थायी पानी की व्यवस्था", instruction: "इंजन ठंडा होने पर यदि कूलेंट खाली है तो आपातकाल में साफ पीने का पानी डालकर नजदीकी गैराज तक जाएं।" }
          ],
          followUpQuestions: [
            { question: "क्या बोनट से भाप निकलती दिखाई दे रही है?", options: ["हाँ, भाप निकल रही है", "नहीं, केवल मीटर में लाल लाइट है", "जलने जैसी गंध आ रही है"] },
            { question: "क्या गाड़ी का पंखा (Fan) चल रहा था?", options: ["हाँ, पंखा चल रहा था", "नहीं, पंखा बंद था", "पता नहीं"] }
          ],
          mechanicRecommendation: "टोइंग या सड़क किनारे मैकेनिक की सहायता लें। लाल निशान पर गाड़ी चलाना इंजन को पूरी तरह नष्ट कर सकता है।",
          estimatedCost: "₹1,200 – ₹4,500 (कूलेंट/पाइप) / ₹8,000+ (वॉटर पंप)",
          speechScript: `सावधान: आपके वाहन का इंजन अत्यधिक गर्म हो गया है। कृपया गाड़ी तुरंत किनारे रोकें और इंजन बंद करें। गर्म रेडिएटर का ढक्कन कभी न खोलें। टोइंग या मैकेनिक की मदद लें।`
        },
        te: {
          title: `ఇంజిన్ వేడెక్కడం హెచ్చరిక — ${vName}`,
          summary: `ఇంజిన్ ఉష్ణోగ్రత ప్రమాదకర స్థాయికి చేరింది. ఇలాగే డ్రైవ్ చేస్తే ఇంజిన్ సీజ్ అయ్యే ప్రమాదం ఉంది.`,
          severity: "critical",
          urgencyBadge: "ప్రమాదం — వాహనం నడపవద్దు",
          possibleCauses: [
            { cause: "కూలెంట్ స్థాయి తగ్గడం లేదా పైపుల నుండి లీకేజ్", probability: "65%" },
            { cause: "రేడియేటర్ కూలింగ్ ఫ్యాన్ పనిచేయకపోవడం", probability: "20%" },
            { cause: "థర్మోస్టాట్ వాల్వ్ లేదా వాటర్ పంప్ సమస్య", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "వెంటనే AC ఆపి, రోడ్డు పక్కన ఆపండి", instruction: "హజార్డ్ లైట్లు వేసి వాహనాన్ని రోడ్డు ఎడమవైపుకి చేర్చండి. ఇంజిన్ వెంటనే ఆఫ్ చేయండి." },
            { step: 2, title: "ముఖ్య హెచ్చరిక: వేడిగా ఉన్నప్పుడు రేడియేటర్ క్యాప్ తెరవవద్దు", instruction: "మరిగే కూలెంట్ ఒంటిపై పడి తీవ్ర గాయాలవుతాయి. కనీసం 25-30 నిమిషాలు ఇంజిన్ చల్లబడేవరకు వేచి ఉండండి." },
            { step: 3, title: "కూలెంట్ బాటిల్ & లీకేజీ తనిఖీ", instruction: "కూలెంట్ రిజర్వాయర్ బాటిల్‌లో లెవెల్ చూడండి. కారు కింద రంగు నీరు కారుతోందా గమనించండి." },
            { step: 4, title: "తాత్కాలిక నీటి నింపుదల", instruction: "పూర్తిగా చల్లబడిన తర్వాత మాత్రమే, సమీప గ్యారేజీకి వెళ్ళడానికి తాత్కాలికంగా స్వచ్ఛమైన నీటిని నింపవచ్చు." }
          ],
          followUpQuestions: [
            { question: "బోనెట్ నుండి ఆవిరి లేదా పొగ వస్తోందా?", options: ["అవును, ఆవిరి వస్తోంది", "లేదు, మీటర్‌లో రెడ్ లైట్ మాత్రమే ఉంది", "స్వీట్ కెమికల్ వాసన వస్తోంది"] },
            { question: "రేడియేటర్ ఫ్యాన్ తిరుగుతోందా?", options: ["అవును, తిరుగుతోంది", "లేదు, ఆగింది", "తెలియదు"] }
          ],
          mechanicRecommendation: "టోయింగ్ లేదా మొబైల్ మెకానిక్ సేవను పొందడం అత్యవసరం. ఇంజిన్ హీట్ మీద డ్రైవ్ చేయకండి.",
          estimatedCost: "₹1,200 – ₹4,500 (కూలెంట్/హోస్ పైపు) / ₹8,000+ (వాటర్ పంప్)",
          speechScript: `గమనిక: మీ ${vName} ఇంజిన్ విపరీతంగా వేడెక్కింది. వెంటనే వాహనాన్ని రోడ్డు పక్కన ఆపి ఇంజిన్ ఆఫ్ చేయండి. వేడిగా ఉన్నప్పుడు రేడియేటర్ మూత తెరవవద్దు. టోయింగ్ లేదా మెకానిక్ సహాయం తీసుకోండి.`
        }
      },

      // 2. DEAD BATTERY / STARTER
      battery_starter: {
        en: {
          title: `Starting & Battery Fault — ${vName}`,
          summary: `Starter motor or battery voltage is insufficient to crank the engine. Rapid clicking or dim dashboard lights indicate battery drain.`,
          severity: "medium",
          urgencyBadge: "MEDIUM — ROADSIDE ASSISTANCE NEEDED",
          possibleCauses: [
            { cause: "Discharged battery (lights left on or parasitic drain)", probability: "60%" },
            { cause: "Loose or corroded battery terminal cables", probability: "25%" },
            { cause: "Faulty alternator (not charging battery while running)", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "Check Instrument Cluster Lights", instruction: "Turn ignition to ON. If cluster lights are dim or flicker when turning key, battery voltage is below 11.8V." },
            { step: 2, title: "Inspect Battery Terminals", instruction: "Pop hood and ensure negative (-) and positive (+) cable clamps are tight with no white/blue powdery corrosion." },
            { step: 3, title: "Jump-Start / Push-Start", instruction: "For manual cars/bikes, push-starting in 2nd gear works. For automatics, connect jumper cables (Red to Positive, Black to Ground Chassis)." },
            { step: 4, title: "Idle for 20+ Minutes After Jump", instruction: "Do not switch off engine immediately after jump-start. Keep running for at least 20-30 mins to allow alternator charging." }
          ],
          followUpQuestions: [
            { question: "What sound occurs when you try to crank the ignition?", options: ["Rapid clicking sound", "Completely silent, no noise", "Slow cranking but won't catch"] },
            { question: "How old is your vehicle's current battery?", options: ["Less than 2 years", "More than 3 years old", "Unsure"] }
          ],
          mechanicRecommendation: "Mobile jump-start technician or battery replacement required if jump-start fails to hold charge.",
          estimatedCost: "₹300 – ₹500 (Roadside Jump-start) / ₹3,500 – ₹6,500 (New Exide/Amaron Battery)",
          speechScript: `Your ${vName} is unable to crank due to battery or starter failure. Rapid clicking indicates low charge. Check battery terminal connections or request a roadside jump start.`
        },
        hi: {
          title: `बैटरी व स्टार्टिंग समस्या — ${vName}`,
          summary: `बैटरी में पर्याप्त वोल्टेज नहीं है या स्टार्टर मोटर काम नहीं कर रही है। टिक-टिक की आवाज बैटरी डिस्चार्ज का संकेत है।`,
          severity: "medium",
          urgencyBadge: "मध्यम — जंप स्टार्ट की आवश्यकता",
          possibleCauses: [
            { cause: "बैटरी डिस्चार्ज (लाइट जलती रह जाना या पुरानी बैटरी)", probability: "60%" },
            { cause: "बैटरी के तार (टर्मिनल) ढीले या कार्बन जमना", probability: "25%" },
            { cause: "अल्टरनेटर का काम न करना", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "डैशबोर्ड लाइट की जांच करें", instruction: "चाबी घुमाएं। यदि लाइटें मंद हैं या टिक-टिक की आवाज आ रही है तो बैटरी कमजोर है।" },
            { step: 2, title: "बैटरी के तार चेक करें", instruction: "बोनट खोलकर देखें कि बैटरी के दोनों तार मजबूती से कसे हैं या नहीं। यदि सफेद पाउडर है तो साफ करें।" },
            { step: 3, title: "जंप स्टार्ट या धक्का लगाएं", instruction: "मैनुअल गाड़ी को दूसरे गियर में क्लच दबाकर धक्का लगाकर स्टार्ट किया जा सकता है।" },
            { step: 4, title: "20 मिनट तक गाड़ी बंद न करें", instruction: "स्टार्ट होने के बाद कम से कम 20-30 मिनट तक गाड़ी चालू रखें ताकि बैटरी चार्ज हो सके।" }
          ],
          followUpQuestions: [
            { question: "चाबी घुमाने पर कैसी आवाज आ रही है?", options: ["तेज टिक-टिक आवाज", "बिल्कुल शांत, कोई आवाज नहीं", "धीमी घरघराहट"] },
            { question: "बैटरी कितनी पुरानी है?", options: ["2 साल से कम", "3 साल से ज्यादा पुरानी", "मालूम नहीं"] }
          ],
          mechanicRecommendation: "रोडसाइड जंप स्टार्ट सेवा लें। यदि बैटरी 3 वर्ष से पुरानी है तो नई बैटरी लगवानी होगी।",
          estimatedCost: "₹300 – ₹500 (जंप स्टार्ट) / ₹3,500 – ₹6,000 (नई बैटरी)",
          speechScript: `आपके वाहन की बैटरी डिस्चार्ज हो गई है। टिक-टिक की आवाज बैटरी कमजोर होने का संकेत है। बैटरी के तार जांचें या जंप स्टार्ट सेवा लें।`
        },
        te: {
          title: `బ్యాటరీ & స్టార్టింగ్ సమస్య — ${vName}`,
          summary: `బ్యాటరీలో తగినంత ఛార్జ్ లేకపోవడం లేదా స్టార్టర్ మోటార్ వైఫల్యం వల్ల ఇంజిన్ స్టార్ట్ కావడం లేదు. టిక్-టిక్ శబ్దం బ్యాటరీ డెడ్ అయినట్లు సూచిస్తుంది.`,
          severity: "medium",
          urgencyBadge: "మధ్యస్థం — జంప్ స్టార్ట్ అవసరం",
          possibleCauses: [
            { cause: "బ్యాటరీ ఛార్జ్ అయిపోవడం (లైట్లు ఆన్ ఉండిపోవడం)", probability: "60%" },
            { cause: "బ్యాటరీ టెర్మినల్ వైర్లు లూజ్ కావడం లేదా తుప్పు పట్టడం", probability: "25%" },
            { cause: "ఆల్టర్నేటర్ బ్యాటరీని రీఛార్జ్ చేయకపోవడం", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "డ్యాష్‌బోర్డ్ లైట్లు తనిఖీ చేయండి", instruction: "కీ ఆన్ చేయండి. లైట్లు మసకబారినా లేదా సెల్ఫ్ కొట్టినప్పుడు టిక్-టిక్ మన్నా బ్యాటరీ డౌన్ అయినట్లే." },
            { step: 2, title: "బ్యాటరీ వైర్లు పరిశీలించండి", instruction: "బోనెట్ తెరిచి బ్యాటరీ (+) మరియు (-) టెర్మినల్ వైర్లు బిగుతుగా ఉన్నాయో లేదో చూడండి. తెల్లటి పౌడర్ ఉంటే శుభ్రం చేయండి." },
            { step: 3, title: "జంప్ స్టార్ట్ లేదా పుష్ స్టార్ట్", instruction: "మాన్యువల్ వాహనం అయితే 2వ గేర్‌లో క్లచ్ పట్టి తోసి స్టార్ట్ చేయవచ్చు." },
            { step: 4, title: "20 నిమిషాలు ఇంజిన్ ఆఫ్ చేయవద్దు", instruction: "ఒక్కసారి స్టార్ట్ అయిన తర్వాత ఆల్టర్నేటర్ చార్జ్ అయ్యేలా కనీసం 20-30 నిమిషాలు రన్నింగ్‌లో ఉంచండి." }
          ],
          followUpQuestions: [
            { question: "కీ తిప్పినప్పుడు ఎలాంటి శబ్దం వస్తోంది?", options: ["వేగంగా టిక్-టిక్ శబ్దం", "ఏ శబ్దమూ రావడం లేదు", "నెమ్మదిగా తిరుగుతోంది"] },
            { question: "బ్యాటరీ ఎంత పాతది?", options: ["2 సంవత్సరాల కంటే తక్కువ", "3 సంవత్సరాల కంటే ఎక్కువ", "తెలియదు"] }
          ],
          mechanicRecommendation: "రోడ్‌సైడ్ జంప్-స్టార్ట్ అసిస్టెన్స్ తీసుకోవడం సురక్షితం. బ్యాటరీ పాతదైతే కొత్తది మార్చాలి.",
          estimatedCost: "₹300 – ₹500 (జంప్ స్టార్ట్ ఛార్జ్) / ₹3,500 – ₹6,500 (కొత్త బ్యాటరీ)",
          speechScript: `మీ వాహనం బ్యాటరీ డిశ్చార్జ్ అయ్యింది. టిక్ టిక్ శబ్దం వస్తుంటే జంప్ స్టార్ట్ సహాయం అవసరం. బ్యాటరీ వైర్లు చెక్ చేయండి లేదా సమీప మెకానిక్‌ను పిలవండి.`
        }
      },

      // 3. BRAKE FAILURE / SQUEALING
      brakes: {
        en: {
          title: `Brake System Safety Warning — ${vName}`,
          summary: `High risk braking abnormality. Squealing indicates severely worn friction pads; spongy pedal indicates dangerous brake fluid leak or air in lines.`,
          severity: "critical",
          urgencyBadge: "CRITICAL — DO NOT DRIVE IF PEDAL IS SPONGY",
          possibleCauses: [
            { cause: "Brake pads worn down to metal wear indicator", probability: "55%" },
            { cause: "Low brake fluid due to caliper/line hydraulic leakage", probability: "30%" },
            { cause: "Warped brake rotor disc or debris trapped in caliper", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "Test Pedal Resistance Safely", instruction: "With vehicle parked, press brake pedal firmly. If it sinks smoothly to the floor with zero resistance, DO NOT DRIVE." },
            { step: 2, title: "Inspect Brake Fluid Reservoir", instruction: "Check transparent fluid reservoir under hood. If fluid is below MIN line, there is an active dangerous hydraulic leak." },
            { step: 3, title: "Emergency Engine Braking (If in Motion)", instruction: "Downshift gear progressively to lower gears (3rd -> 2nd -> 1st) to bleed off speed; gently apply handbrake with release button held." },
            { step: 4, title: "Do Not Continue Journey", instruction: "Metal-on-metal braking ruins rotors and leads to sudden total braking loss at high speeds." }
          ],
          followUpQuestions: [
            { question: "How does the brake pedal/lever feel when pressed?", options: ["Hard with metallic grinding noise", "Soft/spongy sinking to floor", "Vibrating violently"] },
            { question: "Is the red Brake warning lamp lit on dash?", options: ["Yes, red brake light is ON", "No warning light", "ABS light is on"] }
          ],
          mechanicRecommendation: "Immediate professional brake pad/fluid service. Towing recommended if brake pedal sinks to floor.",
          estimatedCost: "₹1,500 – ₹3,800 (Front Brake Pads) / ₹800 (Brake Fluid Flush)",
          speechScript: `Warning: Brake failure or severe pad wear detected on your ${vName}. If the brake pedal sinks to the floor, do not attempt to drive. Immediate inspection is required.`
        },
        hi: {
          title: `ब्रेक सुरक्षा चेतावनी — ${vName}`,
          summary: `ब्रेक में गंभीर खराबी की संभावना। चीखने या रगड़ने की आवाज ब्रेक पैड घिसने का संकेत है। पेडल का ढीला होना ब्रेक फेल होने का संकेत है।`,
          severity: "critical",
          urgencyBadge: "अत्यधिक गंभीर — यदि ब्रेक ढीला है तो न चलाएं",
          possibleCauses: [
            { cause: "ब्रेक पैड पूरी तरह घिस जाना", probability: "55%" },
            { cause: "ब्रेक ऑयल (फ्लूइड) का रिसाव या कम होना", probability: "30%" },
            { cause: "डिस्क रोटर का मुड़ना या खराबी", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "पैडल का दबाव जांचें", instruction: "गाड़ी रोककर ब्रेक दबाएं। यदि पैडल बिना रुकावट फर्श तक धंस रहा है तो गाड़ी बिल्कुल न चलाएं।" },
            { step: 2, title: "ब्रेक ऑयल टैंक चेक करें", instruction: "बोनट में ब्रेक ऑयल का स्तर देखें। यदि तेल न्यूनतम (MIN) से नीचे है तो पाइप लीक हो सकता है।" },
            { step: 3, title: "इंजन ब्रेकिंग का इस्तेमाल करें", instruction: "चलती गाड़ी में गति कम करने के लिए निचले गियर में लाएं और हैंडब्रेक का सावधानी से उपयोग करें।" },
            { step: 4, title: "गाड़ी आगे न बढ़ाएं", instruction: "लोहे से लोहा रगड़ने से डिस्क टूट सकती है और ब्रेक पूरी तरह फेल हो सकते हैं।" }
          ],
          followUpQuestions: [
            { question: "ब्रेक दबाने पर कैसा महसूस हो रहा है?", options: ["कड़ा और घिसने की तेज आवाज", "बहुत ढीला/फर्श तक जा रहा है", "कंपन हो रहा है"] },
            { question: "क्या मीटर में ब्रेक की लाल लाइट जल रही है?", options: ["हाँ, लाल ब्रेक लाइट जल रही है", "नहीं जल रही", "ABS लाइट जल रही है"] }
          ],
          mechanicRecommendation: "टोइंग सर्विस या निकटतम मैकेनिक से तुरंत नए ब्रेक पैड व ऑयल डलवाएं।",
          estimatedCost: "₹1,500 – ₹3,800 (ब्रेक पैड) / ₹800 (ब्रेक ऑयल)",
          speechScript: `सावधान: ब्रेक में खराबी पाई गई है। यदि ब्रेक पेडल फर्श तक धंस रहा है तो गाड़ी बिल्कुल न चलाएं। नजदीकी मैकेनिक से तुरंत पैड और ब्रेक ऑयल चेक करवाएं।`
        },
        te: {
          title: `బ్రేక్ సిస్టమ్ భద్రతా హెచ్చరిక — ${vName}`,
          summary: `బ్రేకులలో తీవ్రమైన సమస్య గుర్తించబడింది. శబ్దం రావడం బ్రేక్ ప్యాడ్లు అరిగిపోయినట్లు, పెడల్ లూజ్ కావడం ఆయిల్ లీకేజీని సూచిస్తుంది.`,
          severity: "critical",
          urgencyBadge: "తీవ్ర ప్రమాదం — పెడల్ లూజ్ అయితే డ్రైవ్ చేయకండి",
          possibleCauses: [
            { cause: "బ్రేక్ ప్యాడ్‌లు పూర్తిగా అరిగిపోవడం", probability: "55%" },
            { cause: "బ్రేక్ ఆయిల్ పైప్ లీకేజీ లేదా ఆయిల్ లెవెల్ పడిపోవడం", probability: "30%" },
            { cause: "డిస్క్ ప్లేట్ దెబ్బతినడం", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "బ్రేక్ పెడల్ ప్రెజర్ పరీక్షించండి", instruction: "కారు ఆపి బ్రేక్ తొక్కండి. పెడల్ కిందకు సులువుగా దిగిపోతే బ్రేక్ ఫెయిల్ అయినట్లే, డ్రైవ్ చేయవద్దు." },
            { step: 2, title: "బ్రేక్ ఆయిల్ బాటిల్ చెక్ చేయండి", instruction: "బోనెట్ తెరిచి బ్రేక్ ఫ్లూయిడ్ లెవెల్ చూడండి. MIN మార్క్ కంటే తక్కువ ఉంటే ఆయిల్ లీక్ అవుతోంది." },
            { step: 3, title: "రన్నింగ్‌లో గేర్లను తగ్గించండి (Engine Braking)", instruction: "స్పీడ్ తగ్గించడానికి ఒక్కొక్క గేర్ తగ్గిస్తూ హ్యాండ్‌బ్రేక్ సున్నితంగా లాగండి." },
            { step: 4, title: "రిస్క్ తీసుకోవద్దు", instruction: "అరిగిపోయిన ప్యాడ్లతో హైవేపై వెళితే బ్రేకులు పూర్తిగా పట్టవు." }
          ],
          followUpQuestions: [
            { question: "బ్రేక్ వేసినప్పుడు ఎలా అనిపిస్తోంది?", options: ["లోహాలు రాసుకుంటున్న పెద్ద శబ్దం", "మెత్తగా కిందకి దిగిపోతోంది", "విపరీతంగా వైబ్రేట్ అవుతోంది"] },
            { question: "డ్యాష్‌బోర్డ్‌లో ఎరుపు రంగు బ్రేక్ లైట్ వెలుగుతోందా?", options: ["అవును, వెలుగుతోంది", "వెలిగట్లేదు", "ABS లైట్ ఉంది"] }
          ],
          mechanicRecommendation: "వెంటనే బ్రేక్ ప్యాడ్లు మార్చడం మరియు ఆయిల్ లీకేజ్ సరిచేయడం అవసరం. టోయింగ్ మంచిది.",
          estimatedCost: "₹1,500 – ₹3,800 (బ్రేక్ ప్యాడ్లు) / ₹800 (బ్రేక్ ఆయిల్)",
          speechScript: `హెచ్చరిక: మీ ${vName} బ్రేకులలో తీవ్ర లోపం ఉంది. పెడల్ లూజ్ అయితే వాహనం నడపకండి. వెంటనే బ్రేక్ ప్యాడ్లు మరియు ఆయిల్ తనిఖీ చేయించండి.`
        }
      },

      // 4. FLAT TYRE / PUNCTURE
      tyre: {
        en: {
          title: `Flat Tyre & Wheel Advisory — ${vName}`,
          summary: `Loss of tire pressure detected. Continuing on a flat tire destroys the wheel rim, tears sidewalls, and causes sudden loss of steering control.`,
          severity: "high",
          urgencyBadge: "HIGH — STOP AND CHANGE WHEEL",
          possibleCauses: [
            { cause: "Nail or sharp debris puncture in tread", probability: "70%" },
            { cause: "Damaged or leaking tire valve stem", probability: "20%" },
            { cause: "Rim bend from pothole impact breaking bead seal", probability: "10%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "Find Flat, Solid Ground", instruction: "Do NOT jack up vehicle on soft soil or incline! Pull onto firm, level pavement away from high-speed traffic." },
            { step: 2, title: "Engage Handbrake and In-Gear / P", instruction: "Engage handbrake tightly. Put manual car in 1st/Reverse gear, or automatic in Park (P). Chock the opposite wheel." },
            { step: 3, title: "Loosen Wheel Lug Nuts BEFORE Jacking", instruction: "Break wheel nut torque slightly using lug wrench while tire is still resting on the ground." },
            { step: 4, title: "Raise Vehicle at Designated Jack Point", instruction: "Place jack strictly at reinforced chassis seam (notch) under door sill. Swap spare tire, tighten star-pattern, lower and torque." }
          ],
          followUpQuestions: [
            { question: "Do you have a working spare wheel and jack in vehicle?", options: ["Yes, spare tire and jack available", "Spare tire is also flat", "No tools or spare tire available"] },
            { question: "Is the vehicle currently on a flat highway surface?", options: ["Yes, firm shoulder", "On soft mud/slope", "Bridge/flyover without shoulder"] }
          ],
          mechanicRecommendation: "Use spare tire or call roadside mobile puncture puncture repair technician if spare is absent.",
          estimatedCost: "₹150 – ₹300 (Tubeless Puncture Strip) / ₹2,800 – ₹6,500 (New Tyre)",
          speechScript: `Flat tire detected for your ${vName}. Do not drive on a flat tyre to protect the alloy rim. Pull over on level ground, apply handbrake, and replace with your spare wheel or call mobile puncture assistance.`
        },
        hi: {
          title: `टायर पंक्चर व हवा की समस्या — ${vName}`,
          summary: `टायर में हवा पूरी तरह निकल चुकी है। पंक्चर टायर पर गाड़ी चलाने से रिम मुड़ जाएगा और टायर फट सकता है।`,
          severity: "high",
          urgencyBadge: "सावधान — गाड़ी रोककर स्टेपनी बदलें",
          possibleCauses: [
            { cause: "कील या नुकीली वस्तु चुभने से पंक्चर", probability: "70%" },
            { cause: "टायर वाल्व (नोजल) से हवा का रिसाव", probability: "20%" },
            { cause: "गड्ढे में लगने से रिम का मुड़ना", probability: "10%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "समतल और पक्की जगह पर गाड़ी लगाएं", instruction: "कच्ची मिट्टी या ढलान पर जैक न लगाएं। गाड़ी को समतल किनारे पर रोकें।" },
            { step: 2, title: "हैंडब्रेक लगाएं और गियर में रखें", instruction: "हैंडब्रेक मजबूती से लगाएं। मैन्युअल को 1st गियर में रखें।" },
            { step: 3, title: "जैक उठाने से पहले नट थोड़े ढीले करें", instruction: "पहिया जमीन पर रहते हुए पाना (Wrench) लगाकर नट हल्के ढीले करें।" },
            { step: 4, title: "कंपनी द्वारा तय जैक पॉइंट पर जैक लगाएं", instruction: "जैक सही खांचे में लगाकर पहिया उठाएं और स्टेपनी लगाएं। क्रॉस तरीके से नट कसें।" }
          ],
          followUpQuestions: [
            { question: "क्या आपके पास सही स्टेपनी और जैक मौजूद है?", options: ["हाँ, स्टेपनी और औजार हैं", "स्टेपनी में भी हवा नहीं है", "औजार नहीं हैं"] },
            { question: "गाड़ी किस जगह खड़ी है?", options: ["सड़क किनारे समतल जगह", "कच्ची मिट्टी या ढलान पर", "फ्लाईओवर पर"] }
          ],
          mechanicRecommendation: "स्टेपनी बदलें या मोबाइल पंक्चर वाले को बुलाएं। रिम पर गाड़ी न चलाएं।",
          estimatedCost: "₹150 – ₹300 (पंक्चर लगाना) / ₹3,000 – ₹6,000 (नया टायर)",
          speechScript: `आपके वाहन का टायर पंक्चर हो गया है। रिम खराब होने से बचाने के लिए समतल जगह पर गाड़ी रोकें, हैंडब्रेक लगाएं और स्टेपनी बदलें या पंक्चर मैकेनिक की मदद लें।`
        },
        te: {
          title: `టైర్ పంక్చర్ & వీల్ సమస్య — ${vName}`,
          summary: `టైర్‌లో గాలి పూర్తిగా పోయింది. పంక్చర్ అయిన టైర్‌పై డ్రైవ్ చేస్తే రిమ్ వంగిపోతుంది మరియు టైర్ పూర్తిగా పాడవుతుంది.`,
          severity: "high",
          urgencyBadge: "ముఖ్య హెచ్చరిక — ఆపి స్పేర్ టైర్ మార్చండి",
          possibleCauses: [
            { cause: "మేకు లేదా పదునైన వస్తువు గుచ్చుకోవడం", probability: "70%" },
            { cause: "టైర్ వాల్వ్ పిన్ నుండి లీకేజ్", probability: "20%" },
            { cause: "గుంతలో పడి రిమ్ కొద్దిగా వంగడం", probability: "10%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "గట్టి నేల మరియు సమాంతర రోడ్డు ఎంచుకోండి", instruction: "వాలుగా ఉన్న చోట లేదా మట్టిలో జాకీ వేయవద్దు. సురక్షితమైన ప్రదేశంలో ఆపండి." },
            { step: 2, title: "హ్యాండ్‌బ్రేక్ వేసి గేర్‌లో ఉంచండి", instruction: "హ్యాండ్‌బ్రేక్ గట్టిగా లాగండి, మాన్యువల్ అయితే 1వ గేర్‌లో ఉంచండి." },
            { step: 3, title: "జాకీ ఎత్తకముందే నట్లను కొద్దిగా లూజ్ చేయండి", instruction: "టైర్ నేలపై ఉండగానే వీల్ స్పానర్‌తో నట్లను కొద్దిగా వదులు చేయండి." },
            { step: 4, title: "కరెక్ట్ జాక్ పాయింట్‌పై జాకీ ఎత్తండి", instruction: "కారు కింద ఇచ్చిన మార్కింగ్ వద్ద జాకీ పెట్టి ఎత్తి, స్పేర్ టైర్ బిగించండి." }
          ],
          followUpQuestions: [
            { question: "మీ వద్ద స్పేర్ టైర్ మరియు జాకీ టూల్స్ ఉన్నాయా?", options: ["అవును, అన్నీ ఉన్నాయి", "స్పేర్ టైర్‌లో కూడా గాలి లేదు", "టూల్స్ లేవు"] },
            { question: "వాహనం ఎక్కడ ఆపారు?", options: ["రోడ్డు పక్కన గట్టి నేలపై", "మట్టి లేదా వాలుపై", "ఫ్లైఓవర్ మీద"] }
          ],
          mechanicRecommendation: "స్పేర్ వీల్ బిగించండి లేదా రోడ్‌సైడ్ మొబైల్ పంక్చర్ సర్వీస్‌ను సంప్రదించండి.",
          estimatedCost: "₹150 – ₹300 (పంక్చర్ వేయడం) / ₹3,000 – ₹6,000 (కొత్త టైర్)",
          speechScript: `మీ వాహనం టైర్ పంక్చర్ అయింది. రిమ్ దెబ్బతినకుండా ఉండేందుకు వాహనాన్ని పక్కన ఆపి స్పేర్ వీల్ మార్చండి లేదా మొబైల్ పంక్చర్ సర్వీస్‌ను పిలవండి.`
        }
      },

      // 5. WHITE/BLACK SMOKE
      smoke: {
        en: {
          title: `Exhaust Smoke Abnormality — ${vName}`,
          summary: `Thick exhaust smoke indicates serious internal engine fluid combustion. White sweet smoke = coolant burning (blown head gasket); Black smoke = unburnt excess fuel.`,
          severity: "critical",
          urgencyBadge: "CRITICAL — HEAD GASKET RISK",
          possibleCauses: [
            { cause: "Blown cylinder head gasket leaking coolant into cylinders", probability: "60%" },
            { cause: "Turbocharger seal rupture or oil ring wear (Blue/White)", probability: "25%" },
            { cause: "Choked air filter or faulty fuel injectors (Dense Black)", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "Inspect Engine Oil Dipstick", instruction: "Pull oil dipstick. If oil looks creamy milky brown (like chocolate milkshake), coolant is mixing with oil. STOP ENGINE IMMEDIATELY." },
            { step: 2, title: "Check Coolant Level", instruction: "If coolant level is mysteriously dropping with white smoke, the gasket is breached." },
            { step: 3, title: "Do NOT High-Rev Engine", instruction: "Excessive revving causes catastrophic hydrostatic lock inside cylinders." },
            { step: 4, title: "Arrange Towing", instruction: "Do not attempt to drive. Continuing operation can crack the entire engine cylinder block." }
          ],
          followUpQuestions: [
            { question: "What is the exact color and smell of the smoke?", options: ["Thick white with sweet smell", "Dark black with fuel smell", "Bluish-grey with burning oil smell"] },
            { question: "Is the engine temperature rising simultaneously?", options: ["Yes, engine is overheating", "Temperature looks normal", "Engine is shuddering violently"] }
          ],
          mechanicRecommendation: "Immediate flatbed towing to engine specialist. Blown head gasket replacement required.",
          estimatedCost: "₹8,000 – ₹25,000 (Head Gasket & Machining / Turbo overhaul)",
          speechScript: `Severe alert: Dense smoke from your ${vName} exhaust indicates coolant or oil entering engine combustion chambers. Stop driving immediately to prevent total engine block destruction. Towing is required.`
        },
        hi: {
          title: `साइलेंसर से धुआं निकलने की समस्या — ${vName}`,
          summary: `साइलेंसर से भारी धुआं इंजन में खराबी का संकेत है। सफेद धुआं हेड गैस्केट फटने व कूलेंट जलने का संकेत है। काला धुआं अधिक पेट्रोल/डीजल जलने से निकलता है।`,
          severity: "critical",
          urgencyBadge: "गंभीर — हेड गैस्केट खतरा",
          possibleCauses: [
            { cause: "सिलेंडर हेड गैस्केट फटने से इंजन में कूलेंट जाना", probability: "60%" },
            { cause: "टर्बोचार्जर या पिस्टन रिंग से मोबिल ऑयल का जलना", probability: "25%" },
            { cause: "एयर फिल्टर चोक होना या फ्यूल इंजेक्टर खराबी (काला धुआं)", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "इंजन ऑयल डिपस्टिक निकालें", instruction: "तेल की जांच करें। यदि तेल कॉफी या मिल्कशेक जैसा मटमैला दिख रहा है तो तुरंत गाड़ी बंद करें।" },
            { step: 2, title: "कूलेंट का स्तर देखें", instruction: "यदि कूलेंट बिना लीकेज के तेजी से खत्म हो रहा है तो गैस्केट फट चुका है।" },
            { step: 3, title: "तेज रेस न दें", instruction: "इंजन को तेज न दौड़ाएं, इससे पिस्टन टूट सकता है।" },
            { step: 4, title: "टोइंग की व्यवस्था करें", instruction: "गाड़ी आगे न चलाएं। टो करके वर्कशॉप ले जाएं।" }
          ],
          followUpQuestions: [
            { question: "धुआं किस रंग का है?", options: ["गाढ़ा सफेद धुआं", "काला धुआं", "हल्का नीला धुआं"] },
            { question: "क्या इंजन का तापमान भी बढ़ रहा है?", options: ["हाँ, गाड़ी गर्म हो रही है", "तापमान सामान्य है", "इंजन कांप रहा है"] }
          ],
          mechanicRecommendation: "टोइंग करके इंजन मैकेनिक के पास ले जाएं। हेड गैस्केट बदला जाएगा।",
          estimatedCost: "₹8,000 – ₹22,000 (हेड गैस्केट / टर्बो मरम्मत)",
          speechScript: `सावधान: साइलेंसर से सफेद या काला धुआं निकलना इंजन में गंभीर खराबी का संकेत है। गाड़ी को तुरंत बंद करें और टोइंग की मदद लें।`
        },
        te: {
          title: `సైలెన్సర్ నుండి పొగ రావడం హెచ్చరిక — ${vName}`,
          summary: `సైలెన్సర్ నుండి దట్టమైన పొగ రావడం ఇంజిన్ అంతర్గత లోపానికి సంకేతం. తెల్లటి పొగ అంటే కూలెంట్ ఆవిరై మండటం (హెడ్ గ్యాస్కెట్ డ్యామేజ్).`,
          severity: "critical",
          urgencyBadge: "ప్రమాదం — హెడ్ గ్యాస్కెట్ వైఫల్యం",
          possibleCauses: [
            { cause: "సిలిండర్ హెడ్ గ్యాస్కెట్ పగిలి ఇంజిన్‌లోకి కూలెంట్ రావడం", probability: "60%" },
            { cause: "టర్బోచార్జర్ లేదా పిస్టన్ ఆయిల్ రింగ్స్ దెబ్బతినడం", probability: "25%" },
            { cause: "ఎయిర్ ఫిల్టర్ జామ్ కావడం లేదా ఇంధనం అధికంగా మండటం (నల్లటి పొగ)", probability: "15%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "ఆయిల్ డిప్‌స్టిక్ తీసి తనిఖీ చేయండి", instruction: "ఆయిల్ రంగు చూడండి. టీ లేదా మిల్క్‌షేక్ లాగా ముదురు రంగులో ఉంటే కూలెంట్ ఆయిల్‌లో కలిసింది. వెంటనే ఇంజిన్ ఆఫ్ చేయండి." },
            { step: 2, title: "కూలెంట్ స్థాయి చూడండి", instruction: "లీకేజ్ లేకుండా కూలెంట్ తగ్గిపోతుంటే ఇంజిన్ లోపలే మండిపోతోందని అర్థం." },
            { step: 3, title: "ఎక్కువగా రేస్ ఇవ్వవద్దు", instruction: "ఇంజిన్ సిలిండర్లు పూర్తిగా డ్యామేజ్ అయ్యే ప్రమాదం ఉంది." },
            { step: 4, title: "టోయింగ్ వాహనాన్ని పిలవండి", instruction: "డ్రైవ్ చేయకుండా సురక్షితంగా టోయింగ్ ద్వారా గ్యారేజీకి చేర్చండి." }
          ],
          followUpQuestions: [
            { question: "వస్తున్న పొగ ఏ రంగులో ఉంది?", options: ["దట్టమైన తెల్లటి పొగ", "నల్లటి పొగ", "నీలి రంగు పొగ"] },
            { question: "ఇంజిన్ హీట్ అవుతోందా?", options: ["అవును, వేడెక్కుతోంది", "హీట్ నార్మల్ గానే ఉంది", "ఇంజిన్ జర్కింగ్ ఇస్తోంది"] }
          ],
          mechanicRecommendation: "వెంటనే టోయింగ్ చేసి ఇంజిన్ గ్యారేజీకి తీసుకెళ్లాలి. హెడ్ గ్యాస్కెట్ రీప్లేస్ చేయాలి.",
          estimatedCost: "₹8,000 – ₹22,000 (హెడ్ గ్యాస్కెట్ మరమ్మతులు)",
          speechScript: `తీవ్ర హెచ్చరిక: మీ ${vName} సైలెన్సర్ నుండి పొగ వస్తోంది. ఇంజిన్ లోపల కూలెంట్ లేదా ఆయిల్ లీక్ అవుతోంది. ఇంజిన్ ఆఫ్ చేసి టోయింగ్ సహాయం పొందండి.`
        }
      },

      // 6. DEFAULT / GENERAL SYMPTOM
      general: {
        en: {
          title: `Diagnostic Assessment — ${vName}`,
          summary: `Vehicle breakdown symptoms analyzed based on reported conditions. Safe roadside protocol advised.`,
          severity: "medium",
          urgencyBadge: "MEDIUM — INSPECT AT NEARBY GARAGE",
          possibleCauses: [
            { cause: "Sensor or electrical wiring harness loose contact", probability: "45%" },
            { cause: "Fuel delivery restriction or contaminated fuel", probability: "35%" },
            { cause: "Auxiliary drive belt or vacuum system leak", probability: "20%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "Check Instrument Warning Lights", instruction: "Observe check engine lamp, oil pressure light, and battery indicator." },
            { step: 2, title: "Park Safely Away from Traffic", instruction: "Engage hazard lights, move to the road shoulder, and turn off unnecessary electrical accessories." },
            { step: 3, title: "Visual Inspection Under Hood", instruction: "Look for loose electrical connections, broken belts, or liquid dripping beneath." },
            { step: 4, title: "Proceed Cautiously to Workshop", instruction: "If no abnormal noises or smoke, drive at low speed (below 40 km/h) to the closest mechanic." }
          ],
          followUpQuestions: [
            { question: "Are there any warning lights illuminated on dashboard?", options: ["Check Engine light", "Oil pressure light", "None"] },
            { question: "Did the issue occur suddenly or gradually?", options: ["Suddenly stopped", "Gradually got worse", "Intermittent"] }
          ],
          mechanicRecommendation: "OBD-II scanner diagnosis at a local workshop recommended.",
          estimatedCost: "₹500 – ₹2,500 (Diagnostic scan & basic repair)",
          speechScript: `Diagnosis complete for your ${vName}. Check your dashboard warning lamps, park safely, and proceed cautiously to the nearest workshop for an OBD diagnostic scan.`
        },
        hi: {
          title: `वाहन समस्या विश्लेषण — ${vName}`,
          summary: `बताए गए लक्षणों के आधार पर प्राथमिक जांच पूरी हुई। सुरक्षा प्रोटोकॉल का पालन करें।`,
          severity: "medium",
          urgencyBadge: "मध्यम — नजदीकी गैराज में जांच कराएं",
          possibleCauses: [
            { cause: "सेंसर या वायरिंग में ढीला कनेक्शन", probability: "45%" },
            { cause: "फ्यूल सप्लाई या पेट्रोल/डीजल में कचरा", probability: "35%" },
            { cause: "ड्राइव बेल्ट या वैक्यूम सिस्टम में रिसाव", probability: "20%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "डैशबोर्ड वार्निंग लाइट देखें", instruction: "चेक इंजन, ऑयल प्रेशर या बैटरी लाइट की जांच करें।" },
            { step: 2, title: "सुरक्षित जगह पर गाड़ी लगाएं", instruction: "हेज़ार्ड लाइट चालू करके गाड़ी सड़क किनारे खड़ी करें।" },
            { step: 3, title: "बोनट खोलकर सामान्य जांच करें", instruction: "कोई तार ढीला तो नहीं या कोई बेल्ट तो नहीं टूटी।" },
            { step: 4, title: "धीमी गति में गैराज जाएं", instruction: "यदि कोई अजीब आवाज या धुआं नहीं है तो 40 किमी/घंटा से कम गति में पास के मैकेनिक के पास जाएं।" }
          ],
          followUpQuestions: [
            { question: "क्या मीटर में कोई वार्निंग लाइट जल रही है?", options: ["चेक इंजन लाइट", "ऑयल लाइट", "कोई लाइट नहीं"] },
            { question: "समस्या अचानक शुरू हुई या धीरे-धीरे?", options: ["अचानक गाड़ी रुकी", "धीरे-धीरे बढ़ी", "कभी-कभी होती है"] }
          ],
          mechanicRecommendation: "नजदीकी वर्कशॉप पर OBD स्कैनर द्वारा कंप्यूटर जांच करवाएं।",
          estimatedCost: "₹500 – ₹2,500 (कंप्यूटर स्कैन व सामान्य मरम्मत)",
          speechScript: `आपके वाहन की प्राथमिक जांच पूरी हो गई है। डैशबोर्ड लाइट चेक करें और धीमी गति में नजदीकी मैकेनिक के पास जाएं।`
        },
        te: {
          title: `వాహన సమస్య విశ్లేషణ — ${vName}`,
          summary: `మీరు తెలిపిన లక్షణాల ఆధారంగా ప్రాథమిక విశ్లేషణ పూర్తయింది. రోడ్డు భద్రతా మార్గదర్శకాలను పాటించండి.`,
          severity: "medium",
          urgencyBadge: "మధ్యస్థం — సమీప గ్యారేజీలో తనిఖీ చేయించండి",
          possibleCauses: [
            { cause: "సెన్సార్ లేదా వైరింగ్ లూజ్ కావడం", probability: "45%" },
            { cause: "ఇంధన సరఫరాలో అడ్డంకి లేదా కల్తీ ఇంధనం", probability: "35%" },
            { cause: "డ్రైవ్ బెల్ట్ లూజ్ కావడం", probability: "20%" }
          ],
          troubleshootingSteps: [
            { step: 1, title: "డ్యాష్‌బోర్డ్ వార్నింగ్ లైట్లు చూడండి", instruction: "చెక్ ఇంజిన్ లైట్, ఆయిల్ లైట్ వెలుగుతున్నాయేమో పరిశీలించండి." },
            { step: 2, title: "సురక్షితంగా రోడ్డు పక్కన ఆపండి", instruction: "హజార్డ్ లైట్లు వేసి వాహనాన్ని పక్కకు తీయండి." },
            { step: 3, title: "బోనెట్ తెరిచి సాధారణ తనిఖీ చేయండి", instruction: "ఏవైనా వైర్లు ఊడిపోయాయా లేదా బెల్ట్ తెగిపోయిందా చూడండి." },
            { step: 4, title: "నెమ్మదిగా గ్యారేజీకి వెళ్లండి", instruction: "వింత శబ్దాలు, పొగ లేకపోతే తక్కువ వేగంతో (40 కి.మీ లోపు) దగ్గర్లోని గ్యారేజీకి వెళ్లండి." }
          ],
          followUpQuestions: [
            { question: "డ్యాష్‌బోర్డ్‌లో ఏదైనా వార్నింగ్ లైట్ వెలుగుతోందా?", options: ["చెక్ ఇంజిన్ లైట్", "ఆయిల్ ప్రెజర్ లైట్", "ఏమీ లేదు"] },
            { question: "సమస్య అకస్మాత్తుగా వచ్చిందా లేక క్రమంగానా?", options: ["అకస్మాత్తుగా ఆగిపోయింది", "నెమ్మదిగా మొదలైంది", "అప్పుడప్పుడు వస్తోంది"] }
          ],
          mechanicRecommendation: "సమీప వర్క్‌షాప్‌లో OBD స్కానర్ ద్వారా కంప్యూటర్ డయాగ్నోసిస్ చేయించండి.",
          estimatedCost: "₹500 – ₹2,500 (కంప్యూటర్ స్కానింగ్ & చిన్న మరమ్మతులు)",
          speechScript: `మీ వాహనం ప్రాథమిక విశ్లేషణ పూర్తయింది. వార్నింగ్ లైట్లను గమనించి, నెమ్మదిగా సమీప గ్యారేజీకి వెళ్లండి.`
        }
      }
    };

    const scenario = DB[category] || DB.general;
    const content = scenario[lang] || scenario.en;

    return {
      id: 'diag_' + Date.now(),
      vehicle: vName,
      vehicleType,
      fuelType,
      language: lang,
      timestamp: new Date().toISOString(),
      ...content
    };
  }
}

window.aiEngine = new AIEngine();
