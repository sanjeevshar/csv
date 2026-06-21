// audioManager.js — load audio assets if present, otherwise provide simple synthesized fallbacks
export async function createAudioManager() {
  const base = './assets/';
  const files = {
    horn: base + 'horn.mp3',
    announcement: base + 'announcement.mp3',
    crowd: base + 'crowd.mp3',
    ambientRain: base + 'ambient-rain.mp3',
    fountain: base + 'fountain.mp3'
  };

  const manager = {
    _audio: {},
    async init() {
      // try loading each file via fetch to see if exists
      for (const k of Object.keys(files)) {
        try {
          const res = await fetch(files[k], { method: 'HEAD' });
          if (res.ok) {
            this._audio[k] = new Audio(files[k]);
            this._audio[k].loop = (k === 'crowd' || k === 'ambientRain');
          } else {
            console.warn('Audio missing:', files[k]);
            this._audio[k] = null;
          }
        } catch (e) { this._audio[k] = null; }
      }
      // create WebAudio context for synthesized horn fallback
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ this.ctx = null; }
      return this;
    },
    setAsset(name, fileOrUrl) {
      try {
        let src = null;
        if (fileOrUrl instanceof File) {
          src = URL.createObjectURL(fileOrUrl);
        } else if (typeof fileOrUrl === 'string') {
          src = fileOrUrl;
        }
        if (!src) return;
        if (this._audio[name]) {
          try { this._audio[name].pause(); } catch(e){}
          this._audio[name] = null;
        }
        const a = new Audio(src);
        a.loop = (name === 'crowd' || name === 'ambientRain');
        this._audio[name] = a;
        return a;
      } catch (e) { console.warn('setAsset failed', e); }
    },
    playHorn() {
      if (this._audio.horn) { this._audio.horn.currentTime = 0; this._audio.horn.play().catch(()=>{}); return; }
      // fallback: short synthesized horn
      if (!this.ctx) return;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(220, this.ctx.currentTime);
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + 1.2);
    },
    playAnnouncement() {
      if (this._audio.announcement) { this._audio.announcement.currentTime = 0; this._audio.announcement.play().catch(()=>{}); return; }
      // fallback: speak a simple announcement using SpeechSynthesis if available
      if (window.speechSynthesis) {
        const s = new SpeechSynthesisUtterance('Now arriving. Please mind the gap.'); window.speechSynthesis.cancel(); window.speechSynthesis.speak(s);
      }
    },
    playCrowd() {
      if (this._audio.crowd) { this._audio.crowd.currentTime = 0; this._audio.crowd.play().catch(()=>{}); return; }
      // no robust fallback for crowd
    },
    stopCrowd() { if (this._audio.crowd) try { this._audio.crowd.pause(); this._audio.crowd.currentTime = 0; } catch(e){} },
    playAmbient(type) { if (type === 'rain' && this._audio.ambientRain) { this._audio.ambientRain.currentTime = 0; this._audio.ambientRain.play().catch(()=>{}); } }
    ,
    playFountain() { if (this._audio.fountain) { this._audio.fountain.currentTime = 0; this._audio.fountain.loop = true; this._audio.fountain.play().catch(()=>{}); } },
    stopFountain() { if (this._audio.fountain) try { this._audio.fountain.pause(); this._audio.fountain.currentTime = 0; } catch(e){} }

    // simple tunnel/reverb handling
    async enterTunnel() {
      if (!this.ctx) return;
      if (this._inTunnel) return; this._inTunnel = true;
      try {
        // create convolver with short impulse
        const irLen = this.ctx.sampleRate * 1.0; const ir = this.ctx.createBuffer(2, irLen, this.ctx.sampleRate);
        for (let ch=0; ch<2; ch++){
          const data = ir.getChannelData(ch);
          for (let i=0;i<irLen;i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/irLen, 2);
        }
        this._convolver = this.ctx.createConvolver(); this._convolver.buffer = ir;
        this._lp = this.ctx.createBiquadFilter(); this._lp.type = 'lowpass'; this._lp.frequency.setValueAtTime(1200, this.ctx.currentTime);
        // connect convolver and lp to master (we'll route media elements through them when needed)
        this._convolver.connect(this.ctx.destination);
        this._lp.connect(this._convolver);
        // fade behavior flags
      } catch(e){ console.warn('enterTunnel failed', e); }
    },
    exitTunnel() { try { this._inTunnel = false; if (this._lp) { this._lp.disconnect(); this._lp = null; } if (this._convolver) { this._convolver.disconnect(); this._convolver = null; } } catch(e){} },

    // lake ambient
    playLake() { if (this._audio.lake) { this._audio.lake.currentTime = 0; this._audio.lake.loop = true; this._audio.lake.play().catch(()=>{}); } },
    stopLake() { if (this._audio.lake) try { this._audio.lake.pause(); this._audio.lake.currentTime = 0; } catch(e){} }
  };
  return manager.init();
}
