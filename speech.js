/**
 * AutoHelp AI — Speech Module
 * Multilingual Speech-to-Text (STT) and Text-to-Speech (TTS)
 * Supports English, Hindi, and Telugu
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isPlayingAudio = false;
    this.speechRate = 1.0;
    this.voices = [];

    this.initRecognition();
    this.initSynthesis();
  }

  // Initialize Speech-to-Text (STT)
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech Recognition API is not supported in this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicUI(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const symptomInput = document.getElementById('symptomInput');
        if (symptomInput) {
          symptomInput.value = transcript;
          // Trigger input event to update char counter & validation
          symptomInput.dispatchEvent(new Event('input'));
        }
      };

      this.recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        this.isListening = false;
        this.updateMicUI(false);

        let errorMsg = "Microphone error. Please type your problem.";
        if (event.error === 'not-allowed') {
          errorMsg = "Microphone permission denied. Please allow mic access or use text input.";
        } else if (event.error === 'no-speech') {
          errorMsg = "No speech detected. Please try again.";
        }
        if (typeof showToast === 'function') {
          showToast(errorMsg, 'warning');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicUI(false);
      };
    } catch (err) {
      console.error("Error initializing SpeechRecognition:", err);
    }
  }

  // Initialize Text-to-Speech (TTS) voices
  initSynthesis() {
    if (!this.synth) return;

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  // Map application language to BCP 47 language tag
  getBCP47Tag(lang) {
    switch (lang) {
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      case 'en': default: return 'en-IN';
    }
  }

  // Toggle Speech Recognition
  toggleListening(lang = currentLang) {
    if (!this.recognition) {
      if (typeof showToast === 'function') {
        showToast("Speech Recognition is not supported on this browser. Please type below.", "warning");
      }
      const symptomInput = document.getElementById('symptomInput');
      if (symptomInput) symptomInput.focus();
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateMicUI(false);
    } else {
      // Set language for recognition
      this.recognition.lang = this.getBCP47Tag(lang);
      try {
        this.recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        this.isListening = false;
        this.updateMicUI(false);
      }
    }
  }

  updateMicUI(recording) {
    const micBtn = document.getElementById('micBtn');
    const waveform = document.getElementById('audioWaveform');
    const statusText = document.getElementById('micStatusText');

    if (recording) {
      if (micBtn) micBtn.classList.add('recording');
      if (waveform) waveform.classList.add('active');
      if (statusText) {
        statusText.classList.add('recording');
        statusText.textContent = t('listening_text');
      }
    } else {
      if (micBtn) micBtn.classList.remove('recording');
      if (waveform) waveform.classList.remove('active');
      if (statusText) {
        statusText.classList.remove('recording');
        statusText.textContent = t('speak_instruction');
      }
    }
  }

  // Find best matching voice for the language
  getVoiceForLang(lang) {
    const targetCode = this.getBCP47Tag(lang).toLowerCase();
    const prefix = targetCode.split('-')[0];

    // Exact match
    let voice = this.voices.find(v => v.lang.toLowerCase() === targetCode);
    if (voice) return voice;

    // Language prefix match (e.g. te or hi)
    voice = this.voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (voice) return voice;

    // Name keyword match
    if (lang === 'te') {
      voice = this.voices.find(v => v.name.toLowerCase().includes('telugu'));
      if (voice) return voice;
    } else if (lang === 'hi') {
      voice = this.voices.find(v => v.name.toLowerCase().includes('hindi'));
      if (voice) return voice;
    }

    // Default to first available voice or null
    return this.voices.find(v => v.default) || this.voices[0] || null;
  }

  // Read solution text aloud in target language
  speakText(text, lang = currentLang) {
    if (!this.synth) {
      if (typeof showToast === 'function') {
        showToast("Text-to-speech is not supported on this browser.", "warning");
      }
      return;
    }

    // Stop any ongoing speech
    this.stopSpeaking();

    // Clean markdown tags or symbols from speech text
    const cleanText = text
      .replace(/[*#_`~>]/g, '')
      .replace(/₹\s?/g, 'Rupees ')
      .replace(/%/g, ' percent ')
      .trim();

    if (!cleanText) return;

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.lang = this.getBCP47Tag(lang);
    this.currentUtterance.rate = this.speechRate;
    this.currentUtterance.pitch = 1.0;

    const matchedVoice = this.getVoiceForLang(lang);
    if (matchedVoice) {
      this.currentUtterance.voice = matchedVoice;
    }

    this.currentUtterance.onstart = () => {
      this.isPlayingAudio = true;
      this.updateAudioPlayerUI(true, false);
    };

    this.currentUtterance.onpause = () => {
      this.updateAudioPlayerUI(false, true);
    };

    this.currentUtterance.onresume = () => {
      this.isPlayingAudio = true;
      this.updateAudioPlayerUI(true, false);
    };

    this.currentUtterance.onend = () => {
      this.isPlayingAudio = false;
      this.updateAudioPlayerUI(false, false);
    };

    this.currentUtterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      this.isPlayingAudio = false;
      this.updateAudioPlayerUI(false, false);
    };

    this.synth.speak(this.currentUtterance);
  }

  pauseSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.updateAudioPlayerUI(false, true);
    }
  }

  resumeSpeaking() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.updateAudioPlayerUI(true, false);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlayingAudio = false;
      this.updateAudioPlayerUI(false, false);
    }
  }

  setRate(rate) {
    this.speechRate = parseFloat(rate) || 1.0;
    if (this.isPlayingAudio && this.currentUtterance) {
      // Re-trigger with updated rate
      const text = this.currentUtterance.text;
      const lang = this.currentUtterance.lang;
      this.speakText(text, lang);
    }
  }

  updateAudioPlayerUI(isPlaying, isPaused) {
    const playPauseBtn = document.getElementById('audioPlayPauseBtn');
    const audioLabel = document.getElementById('audioPlayerLabel');

    if (!playPauseBtn || !audioLabel) return;

    if (isPlaying) {
      playPauseBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
      playPauseBtn.setAttribute('title', 'Pause');
      audioLabel.textContent = t('audio_playing');
    } else if (isPaused) {
      playPauseBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
      playPauseBtn.setAttribute('title', 'Resume');
      audioLabel.textContent = t('pause_audio');
    } else {
      playPauseBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
      playPauseBtn.setAttribute('title', 'Play');
      audioLabel.textContent = t('read_aloud');
    }
  }
}

// Global speech service singleton
window.speechService = new SpeechService();
