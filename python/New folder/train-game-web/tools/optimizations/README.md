Performance optimizations and large-dataset guidance
===================================================

Summary
-------
This note lists practical steps and small code changes to handle large station/train datasets and make the browser UI responsive.

Key ideas
---------
- Render points with Mapbox GL layers (GeoJSON source + symbol/circle layers) instead of DOM `Marker`s — GPU-backed rendering scales to thousands of points.
- Use clustering (`cluster:true`) for dense point clouds. Expand clusters on click to zoom into area.
- Use vector tiles for very large datasets: pre-tile the station/railway data to Mapbox Vector Tiles (MBTiles) and serve tiles, avoid sending whole GeoJSON.
- Use spatial indexing (rbush/kdb-tree) server-side or client-side for nearest-neighbor queries — linear scans are slow for 100k+ nodes.
- Stream and paginate large route/rail imports; use worker threads (Web Worker) to build graphs off the main thread.
- Use image sprite atlas or Mapbox `addImage` for icons rather than many DOM elements.

Quick priorities implemented in repo
----------------------------------
1. `src/main.js` now builds a `stations` GeoJSON source and uses circle/symbol layers + clustering (good for thousands of points). 
2. `tools/rail_network/build_graph.js` exists for prototyping route generation from GeoJSON; for large datasets add an R-tree or KD-tree before nearest-node lookup.

Next steps to scale further
--------------------------
- Pre-tile railway lines to vector tiles (tippecanoe) and serve as vector source.
- Add `rbush` spatial index for `build_graph.js` nearest-node snapping (npm install rbush) and an option to stream parse OSM PBF.
- Move heavy graph building into a Node worker and export MBTiles / GeoJSON subsets.
