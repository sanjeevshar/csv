#!/usr/bin/env node
// Build a simple graph from a railways GeoJSON and compute shortest path between two coordinates.
const fs = require('fs');
const path = require('path');

function usage(){
  console.log('Usage: node build_graph.js "lon1,lat1" "lon2,lat2" output.geojson');
}

if (process.argv.length < 5) { usage(); process.exit(1); }

const startArg = process.argv[2];
const endArg = process.argv[3];
const outPath = process.argv[4];

const start = startArg.split(',').map(Number);
const end = endArg.split(',').map(Number);
if (start.length!==2 || end.length!==2 || start.some(isNaN) || end.some(isNaN)) { console.error('Invalid coords'); usage(); process.exit(2); }

const dataFile = path.resolve(process.cwd(), 'data/railways.geojson');
if (!fs.existsSync(dataFile)) { console.error('Missing data/railways.geojson — export rail LineStrings and save to that path. See tools/rail_network/README.md'); process.exit(3); }

const raw = JSON.parse(fs.readFileSync(dataFile,'utf8'));
if (!raw || !raw.type || raw.type !== 'FeatureCollection') { console.error('Expected FeatureCollection in data/railways.geojson'); process.exit(4); }

// helpers
function keyForCoord(c){ return c[0].toFixed(6)+','+c[1].toFixed(6); }
function haversineKm(a,b){ const R=6371; const toRad=d=>d*Math.PI/180; const dLat=toRad(b[1]-a[1]); const dLon=toRad(b[0]-a[0]); const lat1=toRad(a[1]), lat2=toRad(b[1]); const s=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2; return 2*R*Math.atan2(Math.sqrt(s), Math.sqrt(1-s)); }

const nodes = {}; // key -> { id, coord }
const adj = {}; // id -> [{to, weight}]
let nextId = 1;

function ensureNode(coord){ const k=keyForCoord(coord); if (nodes[k]) return nodes[k].id; const id = String(nextId++); nodes[k] = { id, coord }; adj[id]=[]; return id; }

function addEdge(aCoord,bCoord){ const a=ensureNode(aCoord); const b=ensureNode(bCoord); const w = haversineKm(nodes[keyForCoord(aCoord)].coord, nodes[keyForCoord(bCoord)].coord); adj[a].push({to:b, weight:w}); adj[b].push({to:a, weight:w}); }

// build graph
for (const f of raw.features){ if (!f.geometry) continue; if (f.geometry.type === 'LineString'){ const coords = f.geometry.coordinates; for (let i=0;i<coords.length-1;i++) addEdge(coords[i], coords[i+1]); } else if (f.geometry.type === 'MultiLineString'){ for (const ls of f.geometry.coordinates){ for (let i=0;i<ls.length-1;i++) addEdge(ls[i], ls[i+1]); } } }

const nodeList = Object.values(nodes);
if (nodeList.length===0){ console.error('No nodes found in railways.geojson'); process.exit(5); }

// nearest node (linear)
function nearestNodeId(coord){ let best=null; let bestD=Infinity; for (const n of nodeList){ const d = haversineKm(coord, n.coord); if (d<bestD){ bestD=d; best=n; } } return best.id; }

// Dijkstra
function dijkstra(startId, endId){ const dist = {}; const prev = {}; const q = new Set(); for (const id of Object.keys(adj)){ dist[id] = Infinity; prev[id] = null; q.add(id); } dist[startId]=0;
  while(q.size){ let u=null; let best=Infinity; for (const id of q){ if (dist[id]<best){ best=dist[id]; u=id; } }
    if (u===null) break; q.delete(u); if (u===endId) break; for (const e of adj[u]){ const alt = dist[u] + e.weight; if (alt < dist[e.to]){ dist[e.to]=alt; prev[e.to]=u; } }
  }
  if (dist[endId]===Infinity) return null; const path=[]; let u=endId; while(u){ path.push(u); u=prev[u]; } path.reverse(); return path.map(id=>nodes[ Object.keys(nodes).find(k=>nodes[k].id===id) ].coord ); }

const startNode = nearestNodeId(start);
const endNode = nearestNodeId(end);
console.log('startNode', startNode, 'endNode', endNode);
const routeCoords = dijkstra(startNode, endNode);
if (!routeCoords){ console.error('No route found between points'); process.exit(6); }

const geo = { type: 'Feature', properties: { start: start, end: end }, geometry: { type: 'LineString', coordinates: routeCoords } };
const outDir = path.dirname(outPath); if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(geo));
console.log('Route written to', outPath, 'length nodes:', routeCoords.length);
