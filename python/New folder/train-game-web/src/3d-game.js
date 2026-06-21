// 3D Train Simulator using Three.js - Enhanced with Physics & Controls
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r128/build/three.module.js';

let scene, camera, renderer;
let train, tracks = [];
let stations = [];
let currentTrainSpeed = 0; // normalized throttle (0..maxSpeed)
let maxSpeed = 0.8;
let trainPosition = 0; // normalized curve t (0..1)
let routeCoords = [];
let routeCurve = null;
let routeWorldPoints = null; // [{x,y,z}] sampled points in 3D space
let routeSegLens = null; // sampled segment lengths
let routeTotalLen = 0;

let segmentState = { segIndex: 0, segTraveled: 0 };
let isDwelling = false;
let dwellRemaining = 0;
let currentStation = null;
let stationTotalCount = 0;
let orderedStations = [];
let isRunning = false;
let particles = [];
let gameStats = { distance: 0, time: 0, stationsVisited: 0 };
let keys = {};

export function init3DGame(containerId, config, stationDataMaybe, routeCoordinatesMaybe) {
  // Backward compatible:
  // - old signature: (containerId, trainData, stationData, routeCoordinates)
  // - new signature: (containerId, { trainData, stationData, routeCoordinates, orderedStationIds, speedKmph, environment })
  const cfg = (config && typeof config === 'object' && config.trainData) ? config : {
    trainData: config,
    stationData: stationDataMaybe,
    routeCoordinates: routeCoordinatesMaybe
  };

  const trainData = cfg.trainData || {};
  const stationData = cfg.stationData || [];
  const routeCoordinates = cfg.routeCoordinates || [];
  const orderedStationIds = cfg.orderedStationIds || (trainData.stations || []);
  const environment = cfg.environment || null;
  const baseSpeedKmph = cfg.speedKmph || trainData.speedKmph || 80;

  // store for HUD/events if needed later
  // (not currently used for visuals, but keeps contract explicit)
  window.__trainGame3DEnvironment = environment;


  const container = document.getElementById(containerId);
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Setup scene
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 150, 250);

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 15, 30);

  // Renderer with better quality
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowShadowMap;
  renderer.shadowMap.resolution = 2048;
  container.appendChild(renderer.domElement);

  // Enhanced Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(100, 80, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.left = -200;
  directionalLight.shadow.camera.right = 200;
  directionalLight.shadow.camera.top = 200;
  directionalLight.shadow.camera.bottom = -200;
  directionalLight.shadow.camera.far = 500;
  scene.add(directionalLight);

  // Add sky box
  const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87ceeb,
    side: THREE.BackSide
  });
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyMesh);

  // Enhanced Ground
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.8,
    metalness: 0
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add grass texture pattern
  createGrassPattern();

  routeCoords = routeCoordinates || [];

  // Convert incoming lng/lat route -> 3D world points (single source of truth)
  const worldPoints = routeCoords.map((coord, idx) => {
    const x = (coord[0] - routeCoords[0][0]) * 15;
    const z = (coord[1] - routeCoords[0][1]) * 15;
    // For realism feel: small height variation, but keep stable.
    const y = Math.sin(idx / Math.max(1, routeCoords.length - 1) * Math.PI) * 1.5;
    return new THREE.Vector3(x, y, z);
  });

  routeCurve = worldPoints.length >= 2 ? new THREE.CatmullRomCurve3(worldPoints) : null;

  // Pre-sample for distance-based movement (more realistic than re-building each frame)
  routeWorldPoints = routeCurve ? routeCurve.getPoints(Math.max(40, Math.min(600, routeCoords.length * 60))) : null;
  if (routeWorldPoints && routeWorldPoints.length >= 2) {
    routeSegLens = [];
    routeTotalLen = 0;
    for (let i = 0; i < routeWorldPoints.length - 1; i++) {
      const d = routeWorldPoints[i].distanceTo(routeWorldPoints[i + 1]);
      routeSegLens.push(d);
      routeTotalLen += d;
    }
  }

  createTracks(routeCoords);

  createTrain(trainData);

  // Build station objects based on provided stationData + orderedStationIds when available
  createStations(stationData, orderedStationIds);
  orderedStations = (orderedStationIds || []).map(id => stations.find(s => s.id === id)).filter(Boolean);
  stationTotalCount = orderedStations.length;
  
  createParticles();



  // Keyboard controls
  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  
  // Mouse controls
  window.addEventListener('mousemove', onMouseMove);

  window.addEventListener('resize', onWindowResize);

  // Start animation loop
  animate();
  isRunning = true;

  // Display HUD
  createHUD();

  return { scene, camera, renderer, startTrain, stopTrain, setTrainSpeed: setSpeed };
}

function createGrassPattern() {
  for (let i = 0; i < 50; i++) {
    const treeGeometry = new THREE.ConeGeometry(3, 8, 8);
    const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x1a3d0a });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(Math.random() * 400 - 200, 4, Math.random() * 400 - 200);
    tree.castShadow = true;
    scene.add(tree);
  }
}

function createTracks(coords) {
  if (coords.length < 2) return;

  const points3D = coords.map((coord, idx) => {
    const x = (coord[0] - coords[0][0]) * 15;
    const z = (coord[1] - coords[0][1]) * 15;
    const y = Math.sin(idx / coords.length * Math.PI) * 3;
    return new THREE.Vector3(x, y, z);
  });

  // Main track
  const trackGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points3D),
    150,
    1,
    8,
    false
  );
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.2
  });
  const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
  trackMesh.castShadow = true;
  trackMesh.receiveShadow = true;
  scene.add(trackMesh);
  tracks.push({ mesh: trackMesh, curve: new THREE.CatmullRomCurve3(points3D) });

  // Steel rails
  for (let side of [-1, 1]) {
    const railPoints = points3D.map(p => p.clone().addScaledVector(new THREE.Vector3(1, 0, 0).normalize(), side * 1.5));
    const railGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(railPoints),
      150,
      0.2,
      8,
      false
    );
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
      metalness: 0.9
    });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.castShadow = true;
    scene.add(rail);
  }

  // Rail ties
  for (let i = 0; i < points3D.length - 1; i++) {
    const tieGeometry = new THREE.BoxGeometry(10, 0.3, 0.5);
    const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.copy(points3D[i]);
    tie.castShadow = true;
    tie.receiveShadow = true;
    scene.add(tie);
  }
}

function createTrain(trainData) {
  const trainGroup = new THREE.Group();

  // Engine
  const engineGeometry = new THREE.BoxGeometry(2.5, 3, 5);
  const engineMaterial = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    metalness: 0.7,
    roughness: 0.3
  });
  const engine = new THREE.Mesh(engineGeometry, engineMaterial);
  engine.castShadow = true;
  engine.receiveShadow = true;
  trainGroup.add(engine);

  // Cabin
  const cabinGeometry = new THREE.BoxGeometry(2.5, 2.5, 3.5);
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc0000,
    metalness: 0.6,
    roughness: 0.4
  });
  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.z = -5;
  cabin.castShadow = true;
  trainGroup.add(cabin);

  // Windows
  for (let i = 0; i < 3; i++) {
    const windowGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      metalness: 1,
      roughness: 0.1
    });
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(-1.3, 0.5, -5 - i * 1.2);
    trainGroup.add(windowMesh);
  }

  // Cargo cars
  const carColors = [0xffaa00, 0x00cc00, 0x0066ff];
  for (let i = 0; i < 3; i++) {
    const carGeometry = new THREE.BoxGeometry(2.5, 2.5, 4);
    const carMaterial = new THREE.MeshStandardMaterial({
      color: carColors[i],
      metalness: 0.5,
      roughness: 0.5
    });
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.z = -(5 + (i + 1) * 4.5);
    car.castShadow = true;
    car.receiveShadow = true;
    trainGroup.add(car);
  }

  // Wheels (8 total, 2 per axle)
  for (let i = 0; i < 4; i++) {
    for (let side of [-1, 1]) {
      const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.6, 32);
      const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.2
      });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 1.5, -1.5, -2 + i * 3);
      wheel.castShadow = true;
      trainGroup.add(wheel);
    }
  }

  // Smoke stack
  const smokeStackGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2, 16);
  const smokeStackMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
  const smokeStack = new THREE.Mesh(smokeStackGeometry, smokeStackMaterial);
  smokeStack.position.set(0, 2.5, 1.5);
  smokeStack.castShadow = true;
  trainGroup.add(smokeStack);

  trainGroup.position.y = 1.5;
  scene.add(trainGroup);
  train = trainGroup;
}

function createStations(stationData, orderedStationIds) {
  if (!routeCoords || routeCoords.length === 0) return;

  // If orderedStationIds provided, use them in order.
  // Map stationData items to 3D positions using route coordinate mapping.
  // NOTE: This is a visual approximation: we place each station at the nearest route point.
  const stationIdSet = new Set(orderedStationIds || []);
  const stationList = (stationData || []).filter(s => !orderedStationIds || stationIdSet.has(s.id));

  if (stationList.length === 0) {
    // fallback to 4 evenly spaced stations
    const stationIndices = [0, Math.floor(routeCoords.length / 3), Math.floor(2 * routeCoords.length / 3), routeCoords.length - 1];
    stationIndices.forEach((idx) => {
      const coord = routeCoords[idx];
      const x = (coord[0] - routeCoords[0][0]) * 15;
      const z = (coord[1] - routeCoords[0][1]) * 15;

      createStationMesh(x, z);
    });
    return;
  }

  for (const st of stationList) {
    // find nearest point on the route polyline to station coord
    let bestIdx = 0;
    let bestD = Infinity;
    for (let i = 0; i < routeCoords.length; i++) {
      const c = routeCoords[i];
      const dx = c[0] - st.coord[0];
      const dz = c[1] - st.coord[1];
      const d = dx * dx + dz * dz;
      if (d < bestD) { bestD = d; bestIdx = i; }
    }
    const coord = routeCoords[bestIdx];
    const x = (coord[0] - routeCoords[0][0]) * 15;
    const z = (coord[1] - routeCoords[0][1]) * 15;

    createStationMesh(x, z, st);
  }
}

function createStationMesh(x, z) {
  createStationMesh(x, z, null);
}

function createStationMesh(x, z, st) {
  // Station building
  const buildingGeometry = new THREE.BoxGeometry(6, 4, 6);
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    metalness: 0.2,
    roughness: 0.8
  });
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
  building.position.set(x + 15, 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  // Roof
  const roofGeometry = new THREE.ConeGeometry(4.5, 2, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    metalness: 0.3,
    roughness: 0.7
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(x + 15, 4.5, z);
  roof.castShadow = true;
  scene.add(roof);

  stations.push({ position: new THREE.Vector3(x, 0, z), building, visited: false, id: st?.id || null });
}


function createParticles() {
  // Smoke particles
  const smokeGeometry = new THREE.BufferGeometry();
  const smokePositions = new Float32Array(300);
  for (let i = 0; i < 300; i += 3) {
    smokePositions[i] = (Math.random() - 0.5) * 4;
    smokePositions[i + 1] = Math.random() * 20;
    smokePositions[i + 2] = (Math.random() - 0.5) * 4;
  }
  smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
  const smokeMaterial = new THREE.PointsMaterial({
    color: 0xcccccc,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5
  });
  const smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
  scene.add(smokeParticles);
  particles.push(smokeParticles);
}

function createHUD() {
  const hudContainer = document.createElement('div');
  hudContainer.id = 'gameHUD';
  hudContainer.style.position = 'fixed';
  hudContainer.style.top = '60px';
  hudContainer.style.left = '12px';
  hudContainer.style.background = 'rgba(0,0,0,0.8)';
  hudContainer.style.color = '#1db954';
  hudContainer.style.padding = '12px';
  hudContainer.style.borderRadius = '8px';
  hudContainer.style.fontFamily = 'monospace';
  hudContainer.style.fontSize = '12px';
  hudContainer.style.zIndex = '50';
  hudContainer.style.lineHeight = '1.6';
  hudContainer.innerHTML = `
    <div>Speed: <span id="hudSpeed">0</span> km/h</div>
    <div>Distance: <span id="hudDistance">0</span> km</div>
    <div>Stations: <span id="hudStations">0/4</span></div>
    <div style="margin-top: 8px; border-top: 1px solid #1db954; padding-top: 8px; font-size: 11px;">
      Controls:<br>
      ↑/↓ Speed | SPACE Stop
    </div>
  `;
  document.body.appendChild(hudContainer);
}

function startTrain() {
  currentTrainSpeed = 0;
  trainPosition = 0;
  segmentState.segIndex = 0;
  segmentState.segTraveled = 0;
  isDwelling = false;
  dwellRemaining = 0;
  currentStation = null;
  gameStats = { distance: 0, time: 0, stationsVisited: 0 };
  // reset station visited flags
  orderedStations.forEach(st => { try { st.visited = false; } catch (e) {} });
}

function stopTrain() {
  currentTrainSpeed = 0;
  isRunning = false;
}

function setSpeed(speed) {
  // speed comes as 0..100 from UI (see main.js), convert to normalized 0..1
  maxSpeed = Math.min((speed || 0) / 100, 1);
}

function onMouseMove(e) {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  // Subtle camera tilt with mouse
  camera.rotation.z = x * 0.1;
  camera.rotation.x = y * 0.05;
}

function animate() {
  requestAnimationFrame(animate);

  // Keyboard controls
  if (keys['arrowup'] || keys['w']) currentTrainSpeed = Math.min(currentTrainSpeed + 0.02, maxSpeed);
  if (keys['arrowdown'] || keys['s']) currentTrainSpeed = Math.max(currentTrainSpeed - 0.02, 0);
  if (keys[' ']) currentTrainSpeed = 0;

  if (isRunning && routeCurve && tracks.length > 0) {
    // When dwelling, freeze movement but still render + update HUD
    if (isDwelling) {
      dwellRemaining -= 1 / 60; // approx 60fps
      if (dwellRemaining <= 0) {
        isDwelling = false;
        dwellRemaining = 0;
        if (currentStation) {
          try { currentStation.building.material.color.set(0xd4a574); } catch(e) {}
        }
        currentStation = null;
      }
    } else {
      // advance along route segments (distance-based) using pre-sampled points
      if (!routeWorldPoints || !routeSegLens || routeSegLens.length < 1) return;

      const pts = routeWorldPoints;
      const segLens = routeSegLens;

      const kmThisFrameFactor = currentTrainSpeed * 0.08; // tuning for feel in 3D
      const travelDist = kmThisFrameFactor * 10; // world units per frame (approx)

      // Ensure segment indices are within bounds
      if (segmentState.segIndex >= segLens.length) {
        segmentState.segIndex = segLens.length - 1;
        segmentState.segTraveled = 0;
      }

      // consume distance across segments
      let remaining = travelDist;
      while (remaining > 0 && segmentState.segIndex < segLens.length) {
        const segRemaining = segLens[segmentState.segIndex] - segmentState.segTraveled;
        if (remaining < segRemaining) {
          segmentState.segTraveled += remaining;
          remaining = 0;
        } else {
          remaining -= segRemaining;
          segmentState.segIndex += 1;
          segmentState.segTraveled = 0;
          if (segmentState.segIndex >= segLens.length) break;
        }
      }

      if (segmentState.segIndex >= segLens.length) {
        isRunning = false;
      }

      // compute current point + tangent
      if (segmentState.segIndex < segLens.length) {
        const i = segmentState.segIndex;
        const a = pts[i];
        const b = pts[i + 1];
        const t = segLens[i] === 0 ? 0 : Math.max(0, Math.min(1, segmentState.segTraveled / segLens[i]));
        const point = a.clone().lerp(b, t);
        const tangent = b.clone().sub(a).normalize();


        train.position.copy(point);
        train.position.y += 1.5;

        // Train rotation along track
        const direction = new THREE.Vector3(0, 0, 1);
        train.quaternion.setFromUnitVectors(direction, tangent);

        // Rotate wheels
        train.children.forEach(child => {
          if (child.geometry && child.geometry.type === 'CylinderGeometry') {
            child.rotation.x += currentTrainSpeed * 0.35;
          }
        });

        // Update particles position
        particles.forEach(p => {
          p.position.copy(train.position);
          p.position.y += 3;
        });

        // Station proximity check using 3D station meshes order + dwell timers
        if (stationTotalCount > 0) {
          const nextIndex = gameStats.stationsVisited; // next expected
          const nextStationObj = orderedStations[nextIndex];
          if (nextStationObj) {
            const nextVisual = stations.find(s => s.id === nextStationObj.id);
            if (nextVisual && !nextVisual.visited) {
              const distance = train.position.distanceTo(nextVisual.position);
              if (distance < 8) {
                nextVisual.visited = true;
                nextVisual.building.material.color.set(0x00ff00);
                gameStats.stationsVisited++;
                currentStation = nextVisual;

                // Dwell
                const dwellSec = nextStationObj.dwell || 30;
                isDwelling = true;
                dwellRemaining = dwellSec;

                // Events (announcement/crowd/fountain)
                try {
                  if (window.audioManager) window.audioManager.playAnnouncement(nextStationObj);
                  if (window.audioManager) window.audioManager.playCrowd(nextStationObj);
                  if (nextStationObj.fountain) window.audioManager.playFountain();
                } catch (e) {}

                // Stop crowd/fountain after dwell
                setTimeout(() => {
                  try { if (window.audioManager) window.audioManager.stopCrowd(); } catch (e) {}
                  try { if (window.audioManager && nextStationObj.fountain) window.audioManager.stopFountain(); } catch (e) {}
                }, (dwellSec * 1000) + 500);
              }
            }
          }
        }

        // Lake/Tunnel triggers (best-effort; uses environment passed from main.js)
        const env = window.__trainGame3DEnvironment;
        if (env) {
          if (env.lakes) {
            // init flags on first run
            if (typeof window.__inLake3D === 'undefined') window.__inLake3D = false;
            let any = false;
            for (const lake of env.lakes) {
              const lx = (lake.coord[0] - routeCoords[0][0]) * 15;
              const lz = (lake.coord[1] - routeCoords[0][1]) * 15;
              const dl = Math.hypot(point.x - lx, point.z - lz);
              if (dl <= (lake.radiusKm || 1.0) * 20) { any = true; break; }
            }
            if (any && !window.__inLake3D) {
              window.__inLake3D = true;
              try { window.audioManager && window.audioManager.playLake(); } catch (e) {}
            } else if (!any && window.__inLake3D) {
              window.__inLake3D = false;
              try { window.audioManager && window.audioManager.stopLake(); } catch (e) {}
            }
          }
          if (env.tunnels) {
            if (typeof window.__inTunnel3D === 'undefined') window.__inTunnel3D = false;
            let anyT = false;
            for (const tun of env.tunnels) {
              if (!tun.coords || tun.coords.length < 2) continue;
              // simple check: min distance to tunnel points in 3D space
              for (let i = 0; i < tun.coords.length; i++) {
                const c = tun.coords[i]; // [lat,lng]
                const tx = (c[1] - routeCoords[0][0]) * 15; // lng -> x
                const tz = (c[0] - routeCoords[0][1]) * 15; // lat -> z

                const d = Math.hypot(point.x - tx, point.z - tz);
                if (d <= (tun.radiusKm || 0.5) * 25) { anyT = true; break; }
              }
              if (anyT) break;
            }
            if (anyT && !window.__inTunnel3D) {
              window.__inTunnel3D = true;
              try { window.audioManager && window.audioManager.enterTunnel(); } catch (e) {}
            } else if (!anyT && window.__inTunnel3D) {
              window.__inTunnel3D = false;
              try { window.audioManager && window.audioManager.exitTunnel(); } catch (e) {}
            }
          }
        }


        // HUD
        updateHUD();

        // Camera follow
        const cameraDistance = 40;
        const cameraHeight = 20;
        const lookAhead = curve.getPointAt(Math.min(trainPosition + 0.05, 1));
        camera.position.lerp(
          new THREE.Vector3(
            point.x - tangent.x * cameraDistance,
            point.y + cameraHeight,
            point.z - tangent.z * cameraDistance
          ),
          0.1
        );
        camera.lookAt(lookAhead);
      }
    }
  }

  renderer.render(scene, camera);
}

function updateHUD() {
  const speedDisplay = document.getElementById('hudSpeed');
  const distanceDisplay = document.getElementById('hudDistance');
  const stationsDisplay = document.getElementById('hudStations');

  if (speedDisplay) speedDisplay.textContent = Math.floor(currentTrainSpeed * 200);
  if (distanceDisplay) distanceDisplay.textContent = Math.floor(gameStats.distance);
  if (stationsDisplay) stationsDisplay.textContent = `${gameStats.stationsVisited}/4`;
}

function onWindowResize() {
  const container = renderer.domElement.parentElement;
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

export function cleanup3DGame() {
  if (renderer && renderer.domElement.parentElement) {
    renderer.domElement.parentElement.removeChild(renderer.domElement);
  }
  const hud = document.getElementById('gameHUD');
  if (hud) hud.remove();
  window.removeEventListener('resize', onWindowResize);
  keys = {};
}

