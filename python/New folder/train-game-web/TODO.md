# TODO — Real 3D Train Simulator Upgrade

## Step 1: Update 3D integration contract
- [x] Modify `src/main.js` to pass `speedKmph`, ordered station list, and `environment` data into `init3DGame()`.


## Step 2: Port “real journey logic” into 3D
- [ ] In `src/3d-game.js`, replace the simplistic `trainPosition += currentTrainSpeed * 0.01` logic with route-segment traversal similar to `src/train.js`.
- [ ] Implement station proximity detection using the ordered selected train stations.
- [ ] Implement dwell timers: stop the train for station dwell seconds.


## Step 3: Trigger events in 3D
- [ ] On station arrival: play announcement/crowd/fountain via `window.audioManager` if available.
- [ ] Add lake + tunnel detection using `src/environment.js` and trigger lake/tunnel audio.
- [ ] Add visual changes for lake/tunnel states.

## Step 4: Improve train + effects visuals
- [ ] Wheel rotation based on movement distance.
- [ ] Smoke/exhaust particle spawn rate increases with speed and accelerations.
- [ ] Add basic headlight/tail light emissive materials.

## Step 5: Add better HUD + controls
- [ ] HUD: speed (km/h), distance (km), next station, dwell remaining.
- [ ] Keyboard: horn (H), driver view toggle (V), better throttle/brake behavior.

## Step 6: Performance tuning
- [ ] Replace random tree meshes with `InstancedMesh` where possible.
- [ ] Reduce geometry counts (grass/trees/particles pooling).

## Step 7: Validate
- [ ] Run the web app and verify:
  - selected train station order matches
  - dwell works
  - horn works in 3D
  - lake/tunnel visuals + audio trigger
  - FPS remains acceptable

