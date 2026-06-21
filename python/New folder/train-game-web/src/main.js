import { animateTrainAlong } from './train.js';
import { initWeather } from './weather.js';

const tokenFromQuery = new URLSearchParams(location.search).get('token');
const MAPBOX_TOKEN = tokenFromQuery || '';
if (!MAPBOX_TOKEN) {
  alert('Set MAPBOX_TOKEN in the URL as ?token=YOUR_TOKEN');
}

import('https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js').then(({default: mapboxgl}) => {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11?optimize=true&access_token=' + MAPBOX_TOKEN,
    center: [80,22.5],
    zoom: 4
  });

  map.on('load', () => {
    // sample route across India (approx)
    const route = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.1025,28.7041], // Delhi
          [78.0081,27.1767], // Agra
          [72.5714,23.0225], // Ahmedabad
          [72.8777,19.0760], // Mumbai
          [77.5946,12.9716], // Bengaluru
          [80.2707,13.0827], // Chennai6
          [88.3639,22.5726]  // Kolkata
        ]
      }
    };

    map.addSource('route', { type: 'geojson', data: route });
    map.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#ff6', 'line-width': 4 } });

    // Add train marker
    const trainEl = document.createElement('div');
    trainEl.className = 'train';
    const trainMarker = new mapboxgl.Marker(trainEl).setLngLat(route.geometry.coordinates[0]).addTo(map);

    // Avatar marker for GPS
    const avatarEl = document.createElement('div'); avatarEl.className = 'avatar';
    const avatarMarker = new mapboxgl.Marker(avatarEl).setLngLat([80,22.5]).addTo(map);

    // weatherController will be initialized later; declare here for handler scope
    let weatherController = null;

    // follow mode: 'none' | 'gps' | 'train'
    let followMode = 'none';
    function smoothFollowPoint(lnglat) {
      if (!lnglat) return;
      if (followMode === 'gps' || followMode === 'train') {
        try { map.easeTo({ center: lnglat, duration: 800 }); } catch(e){}
      }
    }

    // Add station markers and populate train selector
    import('./stations.js').then(async mod => {
      const stations = mod.stations || [];
      const stationMap = {};
      // Build GeoJSON features for performant rendering via Mapbox layers
      const stationFeatures = stations.map(st => {
        stationMap[st.id] = st;
        return {
          type: 'Feature',
          properties: {
            id: st.id,
            name: st.name,
            info: st.info || '',
            dwell: st.dwell || 30,
            fountain: !!st.fountain,
            code: st.code || ''
          },
          geometry: { type: 'Point', coordinates: st.coord }
        };
      });

      // add a clustered source for stations (fast for many points)
      if (map.getSource('stations') == null) {
        map.addSource('stations', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: stationFeatures },
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 14
        });

        // cluster circles
        map.addLayer({ id: 'stations-clusters', type: 'circle', source: 'stations', filter: ['has', 'point_count'], paint: { 'circle-color': '#f28cb1', 'circle-radius': ['step', ['get', 'point_count'], 12, 100, 18, 500, 28] } });
        map.addLayer({ id: 'stations-cluster-count', type: 'symbol', source: 'stations', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 } });

        // individual station circles
        map.addLayer({ id: 'stations-circle', type: 'circle', source: 'stations', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': ['case', ['get','fountain'], '#3bb2d0', '#c33'], 'circle-radius': 6, 'circle-stroke-color':'#fff', 'circle-stroke-width':2 } });

        // labels
        map.addLayer({ id: 'stations-label', type: 'symbol', source: 'stations', filter: ['!', ['has', 'point_count']], layout: { 'text-field': ['get','name'], 'text-font':['Open Sans Semibold','Arial Unicode MS Bold'], 'text-size': 11, 'text-offset':[0,1.2] }, paint: { 'text-color':'#111' } });

        // click -> popup
        map.on('click', 'stations-circle', (e) => {
          const feat = e.features && e.features[0]; if (!feat) return;
          const props = feat.properties || {};
          const coord = feat.geometry.coordinates.slice();
          const html = `<strong>${props.name}</strong><div>${props.info||''}</div><div>Dwell: ${props.dwell}s</div>`;
          new mapboxgl.Popup({ offset: 10 }).setLngLat(coord).setHTML(html).addTo(map);
        });

        map.on('mouseenter', 'stations-circle', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'stations-circle', () => map.getCanvas().style.cursor = '');
      } else {
        // update data if source exists
        map.getSource('stations').setData({ type: 'FeatureCollection', features: stationFeatures });
      }

      // add platform visuals (benches, signs, sprites)
      try { import('./platforms.js').then(m => { if (m && m.addPlatformMarkers) m.addPlatformMarkers(map, stations, mapboxgl); }); } catch(e){ console.warn('platform visuals load failed', e); }

      // load trains but don't spawn yet; populate selector
      try {
        const tmod = await import('./trains.js');
        const trains = tmod.trains || [];
        const trainList = document.getElementById('trainList');
        
        if (!trainList) {
          console.error('trainList element not found');
          return;
        }
        
        console.log(`DEBUG: Loaded ${trains.length} trains from trains.js`, trains);
        
        trainList.innerHTML = '';
        
        let selectedTrainId = trains.length > 0 ? trains[0].id : null;
        
        // Add all trains as clickable items
        for (const t of trains) {
          const item = document.createElement('div');
          item.className = 'train-item' + (t.id === selectedTrainId ? ' selected' : '');
          item.textContent = t.name;
          item.dataset.trainId = t.id;
          
          item.addEventListener('click', () => {
            // Remove selected class from all items
            document.querySelectorAll('.train-item').forEach(el => el.classList.remove('selected'));
            // Add selected class to clicked item
            item.classList.add('selected');
            selectedTrainId = t.id;
            console.log(`Selected train: ${t.name}`);
          });
          
          trainList.appendChild(item);
          console.log(`Added train item: ${t.name}`);
        }
        
        console.log(`✓ ${trains.length} trains loaded and displayed`);
        
        // Update startBtn to use selectedTrainId
        document.getElementById('startBtn').addEventListener('click', async () => {
          if (!selectedTrainId) return alert('Please select a train');
          const t = trains.find(x=>x.id===selectedTrainId); 
          if (!t) return alert('Train not found');
          const coords = (t.stations || []).map(id => (stationMap[id] && stationMap[id].coord) || null).filter(Boolean);
          if (coords.length < 2) return alert('Selected train route is incomplete in station data');

          // show loading
          document.getElementById('loadingText').textContent = 'Loading route...';
          document.getElementById('startBtn').disabled = true;

          // center map on start
          const start = coords[0]; map.flyTo({ center: start, zoom: 8 });

          // update weather for start location
          if (typeof weatherController !== 'undefined' && weatherController) {
            try { await weatherController.updateForCoords(start[1], start[0]); } catch(e){}
          }

          // spawn the train marker and animate only this train
          const tEl = document.createElement('div'); tEl.className = 'train'; tEl.style.background = '#0044cc'; tEl.style.width='36px'; tEl.style.height='16px';
          const label = document.createElement('div'); label.style.position='absolute'; label.style.top='-18px'; label.style.left='-6px'; label.style.background='rgba(0,0,0,0.6)'; label.style.color='#fff'; label.style.padding='2px 6px'; label.style.borderRadius='4px'; label.style.fontSize='12px'; label.textContent = t.name;
          tEl.appendChild(label);
          const marker = new mapboxgl.Marker(tEl).setLngLat(coords[0]).addTo(map);
          // prepare ordered station objects for timetable
            const orderedStations = (t.stations || []).map(id => stationMap[id]).filter(Boolean);
            let lastKnownPos = coords[0];
            // Attach a best-effort route polyline (for realism in 3D)
            // If a pre-generated geojson route exists, we'll fetch and use it.
            const routeGeojsonPathGuess = `/data/routes/${t.id}.geojson`;
            let resolvedRouteCoordinates = null;
            try {
              const res = await fetch(routeGeojsonPathGuess);
              if (res.ok) {
                const gj = await res.json();
                if (gj && gj.geometry && gj.geometry.type === 'LineString') {
                  resolvedRouteCoordinates = gj.geometry.coordinates;
                }
              }
            } catch (e) {
              // fallback to station coords
            }

          function haversineKm(a,b){ const R=6371; const toRad=d=>d*Math.PI/180; const dLat=toRad(b[1]-a[1]); const dLon=toRad(b[0]-a[0]); const lat1=toRad(a[1]), lat2=toRad(b[1]); const s=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2; return 2*R*Math.atan2(Math.sqrt(s), Math.sqrt(1-s)); }
          function computeTimetable(curPos){
            const now = Date.now(); const result = [];
            let accumMs = 0;
            // for each station in order, compute travel time from current pos to station
            for (let i=0;i<orderedStations.length;i++){
              const st = orderedStations[i];
              const dist = haversineKm(curPos, st.coord); // approx direct distance
              const travelMs = (dist / (t.speedKmph || 80)) * 3600 * 1000;
              const arrival = new Date(now + accumMs + travelMs);
              const departure = new Date(arrival.getTime() + (st.dwell||30)*1000);
              result.push({ station: st, arrival, departure, travelMs });
              accumMs += travelMs + (st.dwell||30)*1000;
              // after first iteration, set curPos to station for next leg estimate
              curPos = st.coord;
            }
            return result;
          }

          // show timetable panel
          const ttPanel = document.getElementById('timetablePanel'); const ttContent = document.getElementById('timetableContent');
          document.getElementById('closeTimetable').onclick = ()=>{ ttPanel.style.display='none'; };
          ttPanel.style.display = 'block';

          // update helper
          function updateTimetableUI(curPos){
            const table = computeTimetable(curPos);
            ttContent.innerHTML = '';
            for (const row of table) {
              const div = document.createElement('div'); div.style.padding='6px 0';
              const name = document.createElement('div'); name.textContent = row.station.name; name.style.fontWeight='600';
              const times = document.createElement('div'); times.style.opacity='0.8'; times.textContent = `Arr: ${row.arrival.toLocaleTimeString()}  Dep: ${row.departure.toLocaleTimeString()}`;
              div.appendChild(name); div.appendChild(times);
              ttContent.appendChild(div);
            }
          }

          import('./environment.js').then(envmod => {
            const env = { lakes: envmod.lakes || [], tunnels: envmod.tunnels || [] };
            animateTrainAlong(map, marker, coords, {
              speedKmph: t.speedKmph || 80,
              stations: stations.map(s=>({ ...s, radiusKm:0.6 })),
              onUpdate: (pos) => { lastKnownPos = pos; if (followMode === 'train') smoothFollowPoint(pos); updateTimetableUI(pos); },
              playAnnouncement: (st)=>{ try { if (window.audioManager) window.audioManager.playAnnouncement(st); } catch(e){} },
              playCrowd: (st)=>{ try { if (window.audioManager) window.audioManager.playCrowd(st); } catch(e){} },
              stopCrowd: ()=>{ try { if (window.audioManager) window.audioManager.stopCrowd(); } catch(e){} },
              playFountain: ()=>{ try { if (window.audioManager) window.audioManager.playFountain(); } catch(e){} },
              stopFountain: ()=>{ try { if (window.audioManager) window.audioManager.stopFountain(); } catch(e){} },
              playLake: ()=>{ try { if (window.audioManager) window.audioManager.playLake(); } catch(e){} },
              stopLake: ()=>{ try { if (window.audioManager) window.audioManager.stopLake(); } catch(e){} },
              enterTunnel: ()=>{ try { if (window.audioManager) window.audioManager.enterTunnel(); } catch(e){} },
              exitTunnel: ()=>{ try { if (window.audioManager) window.audioManager.exitTunnel(); } catch(e){} },
              environment: env
            });
          }).catch(e=>{ console.warn('env load failed', e); });

          // hide overlay
          document.getElementById('homeOverlay').style.display = 'none';
          document.getElementById('loadingText').textContent = '';
        });
      } catch (e) { console.warn('failed to load trains', e); }

      // 3D Game button handler
      document.getElementById('start3DBtn').addEventListener('click', async () => {
        const tmod = await import('./trains.js');
        const trains = tmod.trains || [];
        if (trains.length === 0) return alert('No trains loaded');
        const selectedTrain = trains[0];
        const coords = (selectedTrain.stations || []).map(id => (stationMap[id] && stationMap[id].coord) || null).filter(Boolean);
        if (coords.length < 2) return alert('Train route incomplete');

        // Hide map, show 3D container
        document.getElementById('homeOverlay').style.display = 'none';
        map.getContainer().style.display = 'none';
        
        let gameContainer = document.getElementById('gameContainer3D');
        if (!gameContainer) {
          gameContainer = document.createElement('div');
          gameContainer.id = 'gameContainer3D';
          gameContainer.style.position = 'fixed';
          gameContainer.style.inset = '0';
          gameContainer.style.zIndex = '1';
          document.body.appendChild(gameContainer);
        }
        gameContainer.innerHTML = '';
        
          // Import and start 3D game
          try {
            const game3D = await import('./3d-game.js');
            const envMod = await import('./environment.js');
            const environment = {
              lakes: envMod.lakes || [],
              tunnels: envMod.tunnels || []
            };

            const orderedStationIds = selectedTrain.stations || [];
            // If a pre-generated best-effort route exists for this train, use it for 3D.
            // Otherwise fallback to coords (station-to-station polyline approximation).
            let routeFor3D = coords;
            try {
              const routeRes = await fetch(`/data/routes/${selectedTrain.id}.geojson`);
              if (routeRes.ok) {
                const gj = await routeRes.json();
                if (gj && gj.geometry && gj.geometry.type === 'LineString' && Array.isArray(gj.geometry.coordinates)) {
                  routeFor3D = gj.geometry.coordinates;
                }
              }
            } catch (e) {}

            const gameControls = game3D.init3DGame('gameContainer3D', {
              trainData: selectedTrain,
              stationData: stations,
              routeCoordinates: routeFor3D,
              orderedStationIds,
              speedKmph: selectedTrain.speedKmph || 80,
              environment
            });
          
            // Auto-start the train after 1 second
            setTimeout(() => {
              gameControls.startTrain();
              // Gradually increase speed
              const speedInterval = setInterval(() => {
                gameControls.setTrainSpeed(Math.min(window.trainGameSpeed || 0, 100));
                window.trainGameSpeed = (window.trainGameSpeed || 0) + 2;
                if (window.trainGameSpeed > 100) clearInterval(speedInterval);
              }, 100);
            }, 1000);
          
          
          // Add back button
          const backBtn = document.createElement('button');
          backBtn.textContent = '← Back to Map';
          backBtn.style.position = 'fixed';
          backBtn.style.top = '12px';
          backBtn.style.left = '12px';
          backBtn.style.zIndex = '100';
          backBtn.style.padding = '12px 20px';
          backBtn.style.background = '#1db954';
          backBtn.style.color = '#012';
          backBtn.style.border = 'none';
          backBtn.style.borderRadius = '8px';
          backBtn.style.cursor = 'pointer';
          backBtn.style.fontSize = '16px';
          backBtn.onclick = () => {
            game3D.cleanup3DGame();
            gameContainer.remove();
            map.getContainer().style.display = 'block';
            document.getElementById('homeOverlay').style.display = 'flex';
            window.trainGameSpeed = 0;
          };
          document.body.appendChild(backBtn);
        } catch (err) {
          console.error('3D game init failed:', err);
          alert('3D game failed to load: ' + err.message);
          document.getElementById('homeOverlay').style.display = 'flex';
          map.getContainer().style.display = 'block';
        }
      });
    });

  // hook up clock and GPS
    const clockEl = document.getElementById('clock');
    const posEl = document.getElementById('position');

    function updateClock() {
      const now = new Date();
      clockEl.textContent = 'Time: ' + now.toLocaleString();
    }
    setInterval(updateClock, 1000); updateClock();

    const followSelect = document.getElementById('followMode');
    if (followSelect) followSelect.value = 'none';
    if (followSelect) followSelect.addEventListener('change', () => { followMode = followSelect.value; });

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(pos => {
        const lng = pos.coords.longitude, lat = pos.coords.latitude;
        posEl.textContent = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        avatarMarker.setLngLat([lng, lat]);
        if (followMode === 'gps') smoothFollowPoint([lng, lat]);
        // update weather for GPS location if available
        if (weatherController) weatherController.updateForCoords(lat, lng);
      }, err => { posEl.textContent = 'GPS: denied or unavailable'; }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 });
    } else {
      posEl.textContent = 'GPS: not supported';
    }

    // audio horn
    const horn = new Audio('./assets/horn.mp3');
    document.getElementById('hornBtn').onclick = () => horn.play().catch(()=>{});
    document.addEventListener('keydown', e => { if (e.key.toLowerCase()==='h') horn.play().catch(()=>{}); });

    // animate train along route (if stations not loaded above, fallback)
    // animateTrainAlong(map, trainMarker, route.geometry.coordinates, { speedKmph: 80 });

    // init weather system (set OpenWeather token via ?owm=TOKEN)
    try { weatherController = initWeather(map, { openWeatherToken: null }); } catch(e){ console.warn('weather init failed', e); }

    // init audio manager
    import('./audioManager.js').then(async mod => {
      try { window.audioManager = await mod.createAudioManager(); } catch(e){ console.warn('audio manager init failed', e); }
    }).catch(e=>{ console.warn('audioManager load failed', e); });
    // wire upload inputs to audioManager (use pending queue if manager not ready yet)
    const pendingUploads = {};
    function applyUpload(name, file) {
      if (window.audioManager && typeof window.audioManager.setAsset === 'function') {
        window.audioManager.setAsset(name, file);
      } else { pendingUploads[name] = file; }
    }
    // attach handlers
    const upHorn = document.getElementById('uploadHorn'); if (upHorn) upHorn.addEventListener('change', e=>{ if (e.target.files[0]) applyUpload('horn', e.target.files[0]); });
    const upAnn = document.getElementById('uploadAnnouncement'); if (upAnn) upAnn.addEventListener('change', e=>{ if (e.target.files[0]) applyUpload('announcement', e.target.files[0]); });
    const upCrowd = document.getElementById('uploadCrowd'); if (upCrowd) upCrowd.addEventListener('change', e=>{ if (e.target.files[0]) applyUpload('crowd', e.target.files[0]); });
    const upRain = document.getElementById('uploadRain'); if (upRain) upRain.addEventListener('change', e=>{ if (e.target.files[0]) applyUpload('ambientRain', e.target.files[0]); });
    // when audioManager initializes (might be shortly), apply pending
    (async function waitAndApply(){
      for (let i=0;i<30;i++){
        if (window.audioManager && typeof window.audioManager.setAsset === 'function') break;
        await new Promise(r=>setTimeout(r,200));
      }
      if (window.audioManager && typeof window.audioManager.setAsset === 'function') {
        for (const k of Object.keys(pendingUploads)) { window.audioManager.setAsset(k, pendingUploads[k]); }
      }
    })();

    // simple day/night by brightness filter based on local hour
    function updateDayNight() {
      const h = new Date().getHours();
      const brightness = (h>=6 && h<=18) ? 1 : 0.4;
      map.getCanvas().style.filter = `brightness(${brightness})`;
    }
    setInterval(updateDayNight, 60*1000); updateDayNight();
  });
});
