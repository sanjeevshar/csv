#!/usr/bin/env python3
"""
Download Geofabrik India PBF and extract railway LineStrings to GeoJSON.

Requirements: osmium, geojson
  pip install osmium geojson

Usage:
  python download_india_rail.py
"""

import os
import json
import urllib.request
import subprocess
from pathlib import Path

def download_file(url, dest):
    """Download file with progress."""
    print(f"Downloading {url}...")
    try:
        urllib.request.urlretrieve(url, dest, lambda b, bs, ts: print(f"  {b*bs//ts*100//100}%", end="\r"))
        print("Done.")
    except Exception as e:
        print(f"Failed: {e}")
        raise

def extract_railways_to_geojson(pbf_file, output_geojson):
    """Extract railway ways from PBF to GeoJSON using osmium."""
    print(f"Extracting railways from {pbf_file} to {output_geojson}...")
    
    # Use osmium to get railway ways
    cmd = [
        'osmium', 'tags-filter', '-o', output_geojson, 
        pbf_file, 'w/railway=rail'
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Extracted to {output_geojson}")
    except Exception as e:
        print(f"osmium failed: {e}. Trying ogr2ogr...")
        # Fallback: use ogr2ogr
        cmd = [
            'ogr2ogr', '-f', 'GeoJSON', output_geojson, pbf_file,
            '-sql', "SELECT * FROM multilinestrings WHERE railway='rail'"
        ]
        subprocess.run(cmd, check=True)

def main():
    base_dir = Path(__file__).parent.parent.parent
    data_dir = base_dir / 'data'
    data_dir.mkdir(exist_ok=True)
    
    pbf_file = data_dir / 'india-latest.osm.pbf'
    geojson_file = data_dir / 'railways.geojson'
    
    # Download Geofabrik India PBF if not present
    if not pbf_file.exists():
        download_url = 'https://download.geofabrik.de/asia/india-latest.osm.pbf'
        download_file(download_url, str(pbf_file))
    else:
        print(f"PBF already exists at {pbf_file}")
    
    # Extract railways
    if not geojson_file.exists():
        extract_railways_to_geojson(str(pbf_file), str(geojson_file))
    else:
        print(f"GeoJSON already exists at {geojson_file}")
    
    print(f"✓ Rail network ready at {geojson_file}")
    print("  Next: use build_graph.js to generate routes")

if __name__ == '__main__':
    main()
