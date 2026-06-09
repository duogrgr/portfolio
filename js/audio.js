// ===== ЗВУКОВОЙ ДВИЖОК =====
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.ambSource = null;
    this.ambBuffer = null;
    this.ambGain = null;
    this.uiSounds = {};
    this.triggers = [];
    this.triggerIndex = 0;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized && this.audioContext.state === 'running') return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (this.audioContext.state !== 'running') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('AudioContext initialized/resumed');
      
      this.loadUISounds();
      this.loadTriggers();
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  async loadUISounds() {
    const soundFiles = {
      switch: 'audio/ui/switch.ogg',
      button: 'audio/ui/button.ogg',
      slider: 'audio/ui/slider.ogg'
    };

    for (const [name, url] of Object.entries(soundFiles)) {
      if (this.uiSounds[name]) continue;
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.uiSounds[name] = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log(`UI sound "${name}" loaded`);
      } catch (error) {
        console.error(`Failed to load UI sound "${name}":`, error);
      }
    }
  }

  async loadTriggers() {
    if (this.triggers.length > 0) return;
    
    for (let i = 1; i <= 8; i++) {
      try {
        const response = await fetch(`audio/amb/trigger${i}.ogg`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.triggers.push(buffer);
      } catch (error) {
        console.error(`Failed to load trigger${i}.ogg:`, error);
      }
    }
    console.log('8 AMB triggers loaded');
  }

  playNextTrigger() {
    if (this.triggers.length === 0 || !this.audioContext) return;

    const buffer = this.triggers[this.triggerIndex];
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.6, this.audioContext.currentTime);

    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start(0);

    this.triggerIndex = (this.triggerIndex + 1) % 8;
  }

  playUI(soundName) {
    if (!this.uiSounds[soundName] || !this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.uiSounds[soundName];

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);

    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start(0);
    console.log(`UI sound "${soundName}" played`);
  }
}

const audioEngine = new AudioEngine();

document.addEventListener('DOMContentLoaded', () => {
  const unlockAudio = () => {
    audioEngine.init();
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  };
  
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('click', unlockAudio, { once: true });

  const uiTriggers = document.querySelectorAll('.ui-sound-trigger');
  
  uiTriggers.forEach(trigger => {
    if (trigger.type === 'range') return;

    trigger.addEventListener('click', () => {
      audioEngine.init().then(() => {
        const soundName = trigger.getAttribute('data-sound');
        if (soundName) audioEngine.playUI(soundName);
      });
    });
    
    trigger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      audioEngine.init().then(() => {
        const soundName = trigger.getAttribute('data-sound');
        if (soundName) audioEngine.playUI(soundName);
        trigger.click(); 
      });
    }, { passive: false });
  });

  console.log('Audio engine ready');
});