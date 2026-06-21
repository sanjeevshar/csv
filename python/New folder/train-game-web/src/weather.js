// weather.js — fetch real weather and render particles / sun & ambient audio
export async function initWeather(map, opts = {}){
  const token = opts.openWeatherToken || new URLSearchParams(location.search).get('owm');
  const canvas = document.getElementById('weatherCanvas'); const sunDot = document.getElementById('sunDot');
  const ctx = canvas.getContext('2d'); let particles = [];
  let ambientAudio = null; let currentMode = 'clear';

  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight; canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
  }
  resize(); window.addEventListener('resize', resize);

  function makeParticles(type){
    particles = [];
    const count = type === 'rain' ? 400 : type === 'snow' ? 200 : 0;
    for (let i=0;i<count;i++) particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, v: type==='rain'? (4+Math.random()*8) : (0.5+Math.random()*1.5), len: type==='rain'? (10+Math.random()*20) : 0 });
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (particles.length) {
      ctx.strokeStyle = 'rgba(180,200,255,0.6)'; ctx.lineWidth = 1;
      for (const p of particles) {
        if (p.len>0) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x - p.len*0.3, p.y + p.len); ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill(); }
        p.y += p.v; p.x += (p.v*0.2);
        if (p.y>canvas.height+50){ p.y = -10; p.x = Math.random()*canvas.width }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  function playAmbient(type){
    if (ambientAudio) { ambientAudio.pause(); ambientAudio = null; }
    if (type==='rain') { ambientAudio = new Audio('./assets/ambient-rain.mp3'); ambientAudio.loop = true; ambientAudio.volume = 0.6; ambientAudio.play().catch(()=>{}); }
    // add other types later
  }

  function applyVisuals(weather, lat, lon){
    // Sun position
    try {
      const pos = SunCalc.getPosition(new Date(), lat, lon); // altitude (rad), azimuth (rad)
      const alt = pos.altitude; const az = pos.azimuth;
      // compute screen point from a far-away point in direction of sun
      const sunLng = map.getCenter().lng + Math.cos(az) * 10; const sunLat = map.getCenter().lat + Math.sin(az) * 10;
      const p = map.project([sunLng, sunLat]); sunDot.style.left = (p.x - 18) + 'px'; sunDot.style.top = (p.y - 18) + 'px';
      const hourFactor = Math.max(0.2, Math.min(1.0, (Math.sin(alt) + 1) / 2));
      const cloudFactor = Math.min(1, (weather.clouds? weather.clouds.all/100 : 0));
      const brightness = 0.4 + 0.6 * hourFactor * (1 - 0.6*cloudFactor);
      map.getCanvas().style.filter = `brightness(${brightness})`;
      // fog if supported
      if (map.setFog) {
        const fogColor = weather.rain ? '#4a5568' : (weather.snow ? '#ddd' : '#bcd2ff');
        map.setFog({ 'range':[0.5, 3 + (cloudFactor*5)], 'color': fogColor });
      }
    } catch (e) { console.warn('suncalc/apply failed', e); }

    // precipitation
    if (weather.rain) { makeParticles('rain'); playAmbient('rain'); currentMode='rain'; }
    else if (weather.snow) { makeParticles('snow'); currentMode='snow'; }
    else { makeParticles('clear'); currentMode='clear'; }
  }

  async function updateForCoords(lat, lon){
    if (!token) { console.warn('No OpenWeather token (set ?owm=TOKEN) — using clear sky fallback'); applyVisuals({clouds:{all:0}}, lat, lon); return; }
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${token}&units=metric`);
      const data = await res.json();
      const w = { rain: data.rain && Object.values(data.rain)[0] > 0, snow: data.snow && Object.values(data.snow)[0] > 0, clouds: data.clouds, raw: data };
      applyVisuals(w, lat, lon);
    } catch (e) { console.warn('weather fetch failed', e); applyVisuals({clouds:{all:10}}, lat, lon); }
  }

  // initial update using map center
  const center = map.getCenter(); updateForCoords(center.lat, center.lng);

  // expose an update function
  return { updateForCoords, getMode: () => currentMode };
}
