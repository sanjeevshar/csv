// Helpers to animate a marker along a set of coordinates
export function animateTrainAlong(map, marker, coords, opts = {}) {
  const speedKmph = opts.speedKmph || 80;
  const onUpdate = typeof opts.onUpdate === 'function' ? opts.onUpdate : null;
  const stations = opts.stations || [];
  // compute distances between points (Haversine)
  function toRad(d){return d*Math.PI/180}
  function distKm(a,b){
    const R=6371; const dLat=toRad(b[1]-a[1]); const dLon=toRad(b[0]-a[0]);
    const lat1=toRad(a[1]), lat2=toRad(b[1]);
    const s = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2*Math.atan2(Math.sqrt(s), Math.sqrt(1-s)); return R*c;
  }

  function pointToSegmentDistKm(p, v, w) {
    // p, v, w as [lng,lat]
    const toRad = d=>d*Math.PI/180;
    const R = 6371;
    // convert to cartesian via lat/lng approx for short distances
    const lat1 = toRad(v[1]), lon1 = toRad(v[0]);
    const lat2 = toRad(w[1]), lon2 = toRad(w[0]);
    const latP = toRad(p[1]), lonP = toRad(p[0]);
    // project to ECEF nearly — use simple planar projection centered at v
    const x1 = R * lon1 * Math.cos(lat1), y1 = R * lat1;
    const x2 = R * lon2 * Math.cos(lat2), y2 = R * lat2;
    const xp = R * lonP * Math.cos(lat1), yp = R * latP;
    const dx = x2 - x1, dy = y2 - y1;
    const l2 = dx*dx + dy*dy; if (l2 === 0) return Math.sqrt((xp-x1)*(xp-x1)+(yp-y1)*(yp-y1));
    let t = ((xp-x1)*dx + (yp-y1)*dy) / l2; t = Math.max(0, Math.min(1, t));
    const projx = x1 + t*dx, projy = y1 + t*dy; const d = Math.sqrt((xp-projx)*(xp-projx) + (yp-projy)*(yp-projy));
    return d; // in km approx
  }

  // build segments
  const segs = [];
  for (let i=0;i<coords.length-1;i++){
    const a=coords[i], b=coords[i+1]; const d=distKm(a,b); segs.push({a,b,d});
  }
  const totalKm = segs.reduce((s,x)=>s+x.d,0);

  let traveledKm = 0; let lastTime = performance.now();
  let segIndex = 0; let segTraveled = 0;
  let dwelling = false; let dwellRemaining = 0; let currentStation = null;
  const playAnnouncement = typeof opts.playAnnouncement === 'function' ? opts.playAnnouncement : ()=>{};
  const playCrowd = typeof opts.playCrowd === 'function' ? opts.playCrowd : ()=>{};
  const stopCrowd = typeof opts.stopCrowd === 'function' ? opts.stopCrowd : ()=>{};
  const playFountain = typeof opts.playFountain === 'function' ? opts.playFountain : ()=>{};
  const stopFountain = typeof opts.stopFountain === 'function' ? opts.stopFountain : ()=>{};
  const playLake = typeof opts.playLake === 'function' ? opts.playLake : ()=>{};
  const stopLake = typeof opts.stopLake === 'function' ? opts.stopLake : ()=>{};
  const enterTunnel = typeof opts.enterTunnel === 'function' ? opts.enterTunnel : ()=>{};
  const exitTunnel = typeof opts.exitTunnel === 'function' ? opts.exitTunnel : ()=>{};
  let inLake = false; let inTunnel = false;

  function bearing(a,b){
    const y = Math.sin(toRad(b[0]-a[0]))*Math.cos(toRad(b[1]));
    const x = Math.cos(toRad(a[1]))*Math.sin(toRad(b[1])) - Math.sin(toRad(a[1]))*Math.cos(toRad(b[1]))*Math.cos(toRad(b[0]-a[0]));
    return (Math.atan2(y,x)*180/Math.PI+360)%360;
  }

  function step() {
    const now = performance.now(); const dt = (now-lastTime)/1000; lastTime = now;
    const kmThisFrame = (speedKmph/3600)*dt; traveledKm += kmThisFrame; // move
    // handle dwelling at stations
    if (dwelling) {
      dwellRemaining -= dt;
      if (dwellRemaining <= 0) { dwelling = false; currentStation = null; try{ stopCrowd(); stopFountain(); }catch(e){} }
      requestAnimationFrame(step); return;
    }

    // advance along segments
    while (segIndex < segs.length && segTraveled + kmThisFrame >= segs[segIndex].d) {
      const remain = segs[segIndex].d - segTraveled;
      segTraveled = 0; segIndex++;
      if (segIndex>=segs.length) { segIndex=0; segTraveled=0; break; }
    }
      if (segIndex < segs.length) {
      segTraveled += kmThisFrame;
      const s = segTraveled / segs[segIndex].d;
      const a = segs[segIndex].a, b = segs[segIndex].b;
      const lng = a[0] + (b[0]-a[0])*s; const lat = a[1] + (b[1]-a[1])*s;
      marker.setLngLat([lng, lat]);
        if (onUpdate) try { onUpdate([lng, lat]); } catch(e){}
      const brg = bearing(a,b);
      marker.getElement().style.transform = `rotate(${brg}deg)`;

      // check proximity to stations
      for (const st of stations) {
        const d = distKm([lng,lat], st.coord);
        if (d <= (st.radiusKm || 0.6) && (!st._visited)) {
          // begin dwell
          st._visited = true; dwelling = true; dwellRemaining = st.dwell || 30; currentStation = st;
          try { playAnnouncement(st); playCrowd(st); if (st.fountain) try{ playFountain(); }catch(e){}; setTimeout(()=>{ try{ stopCrowd(); if (st.fountain) stopFountain(); }catch(e){} }, (st.dwell||30)*1000 + 2000); } catch(e){}
          break;
        }
      }

      // environment detection (lakes/tunnels)
      if (opts.environment) {
        const env = opts.environment;
        // lakes
        if (env.lakes) {
          let inAnyLake = false;
          for (const lake of env.lakes) {
            const dl = distKm([lng,lat], lake.coord);
            if (dl <= (lake.radiusKm || 1.0)) { inAnyLake = true; break; }
          }
          if (inAnyLake && !inLake) { inLake = true; try{ playLake(); }catch(e){} }
          if (!inAnyLake && inLake) { inLake = false; try{ stopLake(); }catch(e){} }
        }
        // tunnels
        if (env.tunnels) {
          let inAnyTunnel = false;
          for (const tun of env.tunnels) {
            // check distance to polyline segments
            for (let i=0;i<tun.coords.length-1;i++){
              const v = tun.coords[i], w = tun.coords[i+1];
              const dseg = pointToSegmentDistKm([lng,lat], v, w);
              if (dseg <= (tun.radiusKm || 0.5)) { inAnyTunnel = true; break; }
            }
            if (inAnyTunnel) break;
          }
          if (inAnyTunnel && !inTunnel) { inTunnel = true; try{ enterTunnel(); }catch(e){} }
          if (!inAnyTunnel && inTunnel) { inTunnel = false; try{ exitTunnel(); }catch(e){} }
        }
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
