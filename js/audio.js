// ===== ЗВУКОВОЙ ДВИЖОК =====
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.ambSource = null;
    this.ambBuffer = null;
    this.ambGain = null;
    this.uiSounds = {};
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      console.log('AudioContext initialized');
      
      this.loadAmb();
      this.loadUISounds();
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  async loadAmb() {
    try {
      const response = await fetch('audio/amb/loop.ogg');
      const arrayBuffer = await response.arrayBuffer();
      this.ambBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('AMB loop loaded');
    } catch (error) {
      console.error('Failed to load AMB loop:', error);
    }
  }

  async loadUISounds() {
    const soundFiles = {
      switch: 'audio/ui/switch.ogg',
      button: 'audio/ui/button.ogg',
      slider: 'audio/ui/slider.ogg'
    };

    for (const [name, url] of Object.entries(soundFiles)) {
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

  startAmb() {
    if (!this.ambBuffer || !this.audioContext) return;
    if (this.ambSource) return;

    this.ambSource = this.audioContext.createBufferSource();
    this.ambSource.buffer = this.ambBuffer;
    this.ambSource.loop = true;

    this.ambGain = this.audioContext.createGain();
    this.ambGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.ambGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.3);

    this.ambSource.connect(this.ambGain);
    this.ambGain.connect(this.audioContext.destination);

    this.ambSource.start(0);
    console.log('AMB started');
  }

  stopAmb() {
    if (!this.ambSource || !this.ambGain) return;

    this.ambGain.gain.setValueAtTime(this.ambGain.gain.value, this.audioContext.currentTime);
    this.ambGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

    setTimeout(() => {
      if (this.ambSource) {
        this.ambSource.stop();
        this.ambSource.disconnect();
        this.ambSource = null;
        this.ambGain = null;
        console.log('AMB stopped');
      }
    }, 300);
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
  const ambZone = document.getElementById('ambZone');
  
  if (ambZone) {
    ambZone.addEventListener('mousedown', (e) => {
      e.preventDefault();
      audioEngine.init();
      audioEngine.startAmb();
    });

    ambZone.addEventListener('mouseup', () => {
      audioEngine.stopAmb();
    });

    ambZone.addEventListener('mouseleave', () => {
      audioEngine.stopAmb();
    });

    ambZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      audioEngine.init();
      audioEngine.startAmb();
    });

    ambZone.addEventListener('touchend', (e) => {
      e.preventDefault();
      audioEngine.stopAmb();
    });

    ambZone.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      audioEngine.stopAmb();
    });
  }

  const uiTriggers = document.querySelectorAll('.ui-sound-trigger');
  
  uiTriggers.forEach(trigger => {
    if (trigger.type === 'range') return;

    trigger.addEventListener('click', () => {
      audioEngine.init();
      const soundName = trigger.getAttribute('data-sound');
      if (soundName) {
        audioEngine.playUI(soundName);
      }
    });
  });

  console.log('Audio engine ready');
});