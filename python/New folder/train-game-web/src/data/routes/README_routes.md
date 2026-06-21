# Routes folder (3D realism)

## How it works
`src/main.js` attempts to load a pre-generated route polyline for the selected train:

- URL: `/data/routes/<train.id>.geojson`
- Format: GeoJSON Feature with `geometry.type === "LineString"`
- `geometry.coordinates`: array of `[lng, lat]` points

If the file is missing or invalid, 3D falls back to the old station-to-station approximation.

## What to generate
Use `tools/rail_network/build_graph.js` to generate shortest rail polyline routes from real rail LineStrings.

### Example
1) Put your rail network GeoJSON at:
- `train-game-web/data/railways.geojson`

2) Generate route for a train id (example):
- Create start/end from station coords and output GeoJSON into `data/routes/`.

> This repo toolset uses nearest-node snapping + Dijkstra over an in-memory graph.

## Train id mapping
Train IDs are defined in:
- `src/trains.js`

So you should name files exactly like `train.id.geojson`.

Example placeholder used for development:
- `rajdhani_nd_mum_example.geojson`

