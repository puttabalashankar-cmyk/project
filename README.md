# 🚗 AutoHelp AI — Smart Vehicle Breakdown Assistance

[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript-blue)](#tech-stack)
[![Multilingual](https://img.shields.io/badge/Languages-English%20%7C%20हिन्दी%20%7C%20తెలుగు-brightgreen)](#multilingual-voice-support)
[![Hackathon](https://img.shields.io/badge/Hackathon-College%20Ready%20%E2%9A%A1-orange)](#hackathon-demo-mode)
[![License](https://img.shields.io/badge/License-MIT-purple)](#license)

**AutoHelp AI** is a complete, responsive roadside assistance web application built for college hackathons. When drivers or riders break down on highways or remote streets, language barriers and mechanical confusion cause panic and secondary collisions. AutoHelp AI allows users to **speak or type their problem in Telugu, Hindi, or English**, analyzes symptoms, provides safe step-by-step troubleshooting, locates nearby mechanics via GPS, and estimates realistic repair costs.

---

## 🌟 Key Features

### 1. 🎙️ Multilingual Voice Input & Output (STT & TTS)
- **Speech-to-Text (STT):** Press the prominent microphone button to speak in **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, or **English**. Includes pulsing wave animations while listening.
- **Text-to-Speech (TTS):** Automatically reads solutions aloud in the driver's preferred language with an integrated audio player (Play / Pause / Stop / Speed control).
- **Graceful Fallback:** If microphone permission is denied or unsupported, smoothly switches to text input.

### 2. 🧠 Smart AI Diagnosis
- **Vehicle-Aware:** Adapts to Cars and Motorcycles, Brands (Maruti, Tata, Hyundai, Royal Enfield, etc.), Models, and Fuel Types (Petrol, Diesel, EV, CNG).
- **Safety-First Protocols:** Identifies critical failure modes (e.g. Engine Overheating, Head Gasket Blown, Brake Failure, Flat Tyre, Battery Drain).
- **Interactive Follow-ups:** Asks relevant questions to refine diagnosis (e.g., *"Is steam rising from the hood?"*).
- **Strict Disclaimers:** Never guarantees certainty without evidence; flags *"DO NOT DRIVE"* and recommends towing when driving poses hazard.

### 3. 🗺️ Permission-Based Mechanic Finder
- **Interactive Leaflet Map:** Displays user location with a pulsing beacon marker alongside verified nearby service centers.
- **Distance Calculation:** Precise Haversine distance in kilometers.
- **Filter Workshops:** 24/7 Roadside Assistance, Car Specialists, Bike Specialists, EV Certified, Towing Services.
- **One-Click Actions:** Instant phone calls (`tel:...`) and Google Maps turn-by-turn driving directions.

### 4. 💰 Repair Cost Estimator
- Interactive calculator breakdown: **Parts Cost**, **Labor/Technician Fee**, and **Estimated Repair Time**.
- Transparent, clearly labeled pricing based on Indian automotive market averages.

### 5. 🚨 Emergency Roadside Safety (SOS)
- **One-Click Emergency Call:** Direct dials to `112` (National Emergency) and `1033` (National Highway Patrol).
- **Night Safety Strobe:** High-visibility screen flasher tool to alert approaching vehicles during dark nighttime breakdowns.
- **WhatsApp GPS Share:** Sends instant SOS distress message with exact Google Maps coordinates to family or mechanics.
- **5 Golden Safety Rules:** Checklist to prevent secondary highway accidents.

### 6. ⚡ Hackathon Demo Mode
- 5 pre-configured realistic breakdown scenarios with 1-click loading in **Telugu, Hindi, and English**:
  1. *Tata Nexon EV* — Drive Motor Overheating Warning (తెలుగు)
  2. *Royal Enfield Classic 350* — Dead Battery & Rapid Clicking (हिन्दी)
  3. *Hyundai Creta* — Brake Grinding & Spongy Pedal (English)
  4. *Maruti Swift* — White Smoke & Head Gasket Leak (తెలుగు)
  5. *Honda Activa 6G* — Highway Flat Tyre & Puncture (हिन्दी)

### 7. 🕒 Session History
- Saves recent diagnoses during the active session in `localStorage`.
- Allows instant review and replaying of audio solutions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, CSS3 (Modern Blue-and-White Theme, Glassmorphism, Responsive CSS Grid/Flexbox), Vanilla JavaScript (ES6+ Modules).
- **Mapping & Geolocation:** Leaflet.js with OpenStreetMap tiles, HTML5 Geolocation API, Overpass API.
- **Speech Technologies:** Web Speech API (`webkitSpeechRecognition` STT & `window.speechSynthesis` TTS).
- **Backend (Optional / Zero Dependencies):** Python 3 standard library (`http.server`, `urllib.request`) providing secure API proxy to Google Gemini without exposing secrets to frontend.
- **Design System:** Mobile-first, accessible, clean typography, SVG vector icons.

---

## 🚀 Quick Start Guide

### Option 1: Run with Python Server (Recommended)
This serves static assets and activates the secure backend proxy for Gemini AI:

```powershell
# 1. Open terminal in the project directory
cd "c:\Users\PUTTA BALA SHANKAR\OneDrive\Desktop\ai app"

# 2. Start the server (Uses Python 3 standard library)
py server.py
```

Open your browser at **`http://localhost:8000`**.

### Option 2: Run Client-Side Only (Zero Setup)
Double-click `index.html` to open it in Google Chrome, Microsoft Edge, or any modern browser. All features (Voice STT/TTS, Knowledge Engine, Leaflet Maps, and Cost Estimator) work immediately!

---

## 🔑 Configuring Gemini AI (Optional)

AutoHelp AI comes with a built-in **multilingual automotive knowledge engine** that works 100% offline out-of-the-box.

If you wish to use live Google Gemini AI:
1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Open `.env` and paste your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...YourKeyHere
   ```
3. Restart `py server.py`. The server will detect the key and switch to live cloud AI diagnostics while keeping the key secure from the browser.

---

## 📱 User Workflow

```
[1. Select Vehicle] ──> [2. Choose Language] ──> [3. Speak / Type Symptoms]
         │                       │                             │
         ▼                       ▼                             ▼
Car or Motorcycle         English, हिन्दी,            Web Speech STT /
(Brand, Model, Fuel)         or తెలుగు               Text Input Fallback
         │                       │                             │
         └───────────────────────┴─────────────────────────────┘
                                 │
                                 ▼
                     [4. AI Symptom Analysis]
                                 │
         ┌───────────────────────┼─────────────────────────┐
         ▼                       ▼                         ▼
   Urgency Status        Safe Troubleshooting       Audio Solution
(Critical / Medium)       Steps & Warnings           Read Aloud (TTS)
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                                 ▼
         [5. Locate Nearby Mechanics / Emergency SOS]
                                 │
         ┌───────────────────────┴─────────────────────────┐
         ▼                                                 ▼
Interactive GPS Map &                               112 / 1033 Hotline &
Turn-by-Turn Directions                           WhatsApp GPS Location
```

---

## 🏆 Hackathon Presentation Tips

1. **Demonstrate Multilingual Voice:** Click the language selector to switch to **తెలుగు (Telugu)** or **हिन्दी (Hindi)**. Click the microphone and speak, or load a scenario from *"⚡ Try Hackathon Demo Scenarios"*.
2. **Highlight the Audio Solution:** Show judges how AutoHelp AI reads the diagnosis aloud in fluent native speech, vital for drivers stranded on busy highways.
3. **Show Safety Protocols:** Emphasize the strict safety warnings (e.g. warning against opening hot radiator caps).
4. **Demonstrate GPS Map:** Show the live Leaflet map locating workshops, calculating Haversine distances, and offering 1-click calls and directions.
5. **Night SOS Strobe:** Click *"Screen SOS Strobe"* in the Safety section to display the emergency hazard screen for nighttime breakdowns.

---

## 📄 License
Built for educational and hackathon demonstration purposes. MIT License.
