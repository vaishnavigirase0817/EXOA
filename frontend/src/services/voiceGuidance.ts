export interface VoiceSettings {
  enabled: boolean;
  volume: number;
  rate: number;
  voiceName: string;
}

class VoiceGuidanceService {
  private settings: VoiceSettings = {
    enabled: true,
    volume: 0.8,
    rate: 1.0,
    voiceName: '',
  };

  private speechQueue: string[] = [];
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(settings: VoiceSettings) => void> = new Set();
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Try to load settings
      try {
        const saved = localStorage.getItem('exoa_voice_settings');
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error('Failed to load voice settings:', e);
      }

      // Initialize voices list
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.voices = window.speechSynthesis.getVoices();
      this.notifyListeners();
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...updates };
    try {
      localStorage.setItem('exoa_voice_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save voice settings:', e);
    }
    this.notifyListeners();
  }

  addListener(listener: (settings: VoiceSettings) => void) {
    this.listeners.add(listener);
    // Initial call
    listener(this.settings);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.settings));
  }

  cancel() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.speechQueue = [];
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  speak(text: string, force: boolean = false) {
    if (!this.settings.enabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    if (force) {
      this.cancel();
    }

    // Prevent duplicate consecutive announcements in the queue
    if (this.speechQueue.includes(text) || (this.currentUtterance && this.currentUtterance.text === text)) {
      return;
    }

    this.speechQueue.push(text);
    this.processQueue();
  }

  private processQueue() {
    if (this.isSpeaking || this.speechQueue.length === 0) {
      return;
    }

    const text = this.speechQueue.shift();
    if (!text) return;

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Apply settings
    utterance.volume = this.settings.volume;
    utterance.rate = this.settings.rate;

    if (this.settings.voiceName) {
      const selectedVoice = this.voices.find((v) => v.name === this.settings.voiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      setTimeout(() => this.processQueue(), 250);
    };

    utterance.onerror = (e) => {
      // Don't log normal terminations as severe errors
      if (e.error !== 'interrupted') {
        console.error('SpeechSynthesis error:', e);
      }
      this.isSpeaking = false;
      this.currentUtterance = null;
      setTimeout(() => this.processQueue(), 250);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceGuidanceService = new VoiceGuidanceService();
