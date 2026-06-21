Rail network import and route generation
=====================================

Overview
--------
This small toolset converts a GeoJSON file of railway LineStrings (railways.geojson) into a node/edge graph and computes shortest routes between two coordinates along the rail network.

Why this approach
------------------
- Downloading a complete India OSM PBF and parsing it is heavy; instead this repo expects a pre-extracted `data/railways.geojson` (LineString / MultiLineString features with railway ways).
- You can obtain that GeoJSON via Overpass export or by converting Geofabrik extracts to GeoJSON using familiar tools (instructions below).

Files
-----
- `build_graph.js` — Node CLI that reads `data/railways.geojson`, builds an in-memory graph, and writes a route GeoJSON for a requested origin/destination.

How to get `data/railways.geojson`
----------------------------------
Recommended: use Overpass turbo with a bbox covering India or run small bbox queries and merge results.

Example Overpass (in Overpass Turbo UI):

```
[out:json][timeout:900];
(
  way[railway=rail](6.75,68.11,35.5,97.4);
);
out body;
>;
out skel qt;
```

Then export as GeoJSON. For large exports prefer Geofabrik PBF + `osmium/osmconvert` and `osmtogeojson` locally.

Place the exported GeoJSON at `data/railways.geojson` relative to the project root.

Usage
-----
Node (from project root):

```
node tools/rail_network/build_graph.js "lon1,lat1" "lon2,lat2" output_path

// example:
node tools/rail_network/build_graph.js "77.2195,28.6236" "74.8570,34.0206" data/routes/delhi_to_srinagar.geojson
```

Notes
-----
- The nearest-node snap is a linear scan and will be slow for very large networks; it's fine for prototyping and modest-size rail GeoJSON files (<100k nodes).
- For production use, consider spatial indexing (rbush/kdb-tree) and streaming OSM parsing.
