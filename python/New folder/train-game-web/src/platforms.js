// Adds small platform visuals (benches, signs, sprites) as DOM markers on the Mapbox map
export function addPlatformMarkers(map, stations){
  // inject minimal CSS for markers
  const mapboxgl = arguments[2]; // Accept mapboxgl as an argument
  if (!document.getElementById('platform-marker-styles')){
    const s = document.createElement('style'); s.id='platform-marker-styles'; s.innerHTML=`
      .platform-marker{position:relative;width:28px;height:16px}
      .platform-bench{width:22px;height:8px;background:#6b4f3b;border-radius:3px;box-shadow:0 1px 0 rgba(0,0,0,0.4);position:absolute;left:3px;top:4px}
      .platform-sign{width:18px;height:12px;background:#fff;border:2px solid #333;border-radius:2px;font-size:10px;line-height:12px;text-align:center;color:#111;position:absolute;left:5px;top:-14px;padding:0 2px}
      .platform-sprite{width:20px;height:20px;background-size:contain;background-repeat:no-repeat;position:absolute;left:4px;top:-22px}
    `; document.head.appendChild(s);
  }

  // small set of sprites (data URLs for placeholders)
  const benchSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="8"><rect rx="2" ry="2" width="22" height="8" fill="#6b4f3b"/></svg>');
  const signSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><rect width="18" height="12" fill="#ffffff" stroke="#222" stroke-width="1" rx="2"/></svg>');

  stations.forEach(st => {
    if (!st.coord) return;
    // bench marker
    const benchEl = document.createElement('div'); benchEl.className='platform-marker';
    const bench = document.createElement('div'); bench.className='platform-bench'; benchEl.appendChild(bench);
    const sign = document.createElement('div'); sign.className='platform-sign'; sign.textContent = st.code || st.name.split(' ')[0]; benchEl.appendChild(sign);
    const sprite = document.createElement('div'); sprite.className='platform-sprite'; sprite.style.backgroundImage = `url(${benchSvg})`; benchEl.appendChild(sprite);
    const marker = new mapboxgl.Marker(benchEl).setLngLat(st.coord).addTo(map);

    // add a small sign-only marker offset for larger stations
    if (st.fountain || (st.major)){
      const signEl = document.createElement('div'); signEl.className='platform-marker';
      const sdiv = document.createElement('div'); sdiv.className='platform-sign'; sdiv.textContent = st.name.split(' ')[0]; signEl.appendChild(sdiv);
      new mapboxgl.Marker(signEl).setLngLat([st.coord[0]+0.00025, st.coord[1]+0.00005]).addTo(map);
    }
  });
}

// Export default for dynamic import convenience
export default { addPlatformMarkers };
