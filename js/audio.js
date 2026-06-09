// ===== ЗВУКОВОЙ ДВИЖОК =====
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.ambSource = null;
    this.ambBuffer = null;
    this.ambGain = null;
    this.uiSounds = {};
    this.triggers = []; // Массив для 8 триггеров
    this.triggerIndex = 0; // Счетчик для последовательного воспроизведения
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
      
      this.loadAmb();
      this.loadUISounds();
      this.loadTriggers(); // Загружаем триггеры
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
      } catch (error) {
        console.error(`Failed to load UI sound "${name}":`, error);
      }
    }
  }

  // Загрузка 8 триггеров
  async loadTriggers() {
    if (this.triggers.length > 0) return; // Уже загружены
    
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

  // Воспроизведение следующего триггера по кругу
  playNextTrigger() {
    if (this.triggers.length === 0 || !this.audioContext) return;

    const buffer = this.triggers[this.triggerIndex];
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.6, this.audioContext.currentTime); // Чуть тише, чтобы не оглушить

    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start(0);

    // Переходим к следующему, зацикливаем на 8
    this.triggerIndex = (this.triggerIndex + 1) % 8;
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
    // Мышь
    ambZone.addEventListener('mousedown', (e) => {
      e.preventDefault();
      audioEngine.init().then(() => audioEngine.startAmb());
    });
    ambZone.addEventListener('mouseup', () => audioEngine.stopAmb());
    ambZone.addEventListener('mouseleave', () => audioEngine.stopAmb());

    // Тач
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
});