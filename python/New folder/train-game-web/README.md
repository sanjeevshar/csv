Train Game — Web Prototype

Overview:
- Lightweight web prototype showing a train moving across an India route on a real map.
- Uses Mapbox GL JS for map + a simple DOM train marker animation.
- Connects to device GPS (if allowed) and shows real current date/time.

How to run:
1. Get a Mapbox token from https://www.mapbox.com and set it as `MAPBOX_TOKEN` in `index.html` or as a query param: `?token=YOUR_TOKEN`.
2. Serve the folder over a local web server, e.g.:

```powershell
cd "train-game-web"
python -m http.server 8000
# or with npm: npx http-server -c-1
```

3. Open `http://localhost:8000` in your browser.

Notes & next steps:
- Replace `assets/horn.mp3` with a realistic horn audio file.
- Replace route data with full India rail network (large dataset and routing needed).
- For full-on 3D realism and physics, consider porting to Unity or Godot and using high-quality assets.
