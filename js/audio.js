// ===== ЗВУКОВОЙ ДВИЖОК (МОБИЛЬНАЯ ВЕРСИЯ) =====
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.ambSource = null;
    this.ambBuffer = null;
    this.ambGain = null;
    this.uiSounds = {};
    this.isInitialized = false;
    this.loadPromises = [];
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
      
      this.loadAmb();
      this.loadUISounds();
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  async loadAmb() {
    if (this.ambBuffer) return;
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

  startAmb() {
    if (!this.ambBuffer || !this.audioContext) {
      console.warn('AMB buffer not ready yet');
      return;
    }
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
    if (!this.uiSounds[soundName] || !this.audioContext) {
      console.warn(`UI sound "${soundName}" not ready`);
      return;
    }

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

  const ambZone = document.getElementById('ambZone');
  
  if (ambZone) {
    ambZone.addEventListener('mousedown', (e) => {
      e.preventDefault();
      audioEngine.init().then(() => audioEngine.startAmb());
    });

    ambZone.addEventListener('mouseup', () => {
      audioEngine.stopAmb();
    });

    ambZone.addEventListener('mouseleave', () => {
      audioEngine.stopAmb();
    });

    ambZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      audioEngine.init().then(() => audioEngine.startAmb());
    }, { passive: false });

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