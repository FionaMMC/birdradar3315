#!/usr/bin/env python3
"""Build a reproducible, key-free historical snapshot from primary public sources.

Run: python3 scripts/refresh-migration-data.py --cache /tmp/birdradar-data-cache
Files in --cache are retained to allow offline rebuilding with --offline.
This is a manual refresh command, not an automatically scheduled task.
"""
import argparse
import csv
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import io
import json
import math
from pathlib import Path
import time
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    dict(id="movebank-osprey", handle="10255/move.736", doi="10.5441/001/1.sv6335t3",
         filename="Osprey in North and South America 1995-2002 (Martell).csv",
         speciesId="osprey", scientificName="Pandion haliaetus", name="Osprey", nameZh="鱼鹰", color="#f6b86b",
         citation="Martell MS, Douglas D (2019). Data from: Osprey in North and South America 1995–2002. Movebank Data Repository. https://doi.org/10.5441/001/1.sv6335t3"),
    dict(id="movebank-albatross", handle="10255/move.331", doi="10.5441/001/1.3hp3s250",
         filename=None, speciesId="waved-albatross", scientificName="Phoebastria irrorata", name="Waved albatross", nameZh="加拉帕戈斯信天翁", color="#78ceea",
         citation="Cruz S, Proaño CB, Anderson D, Huyvaert K, Wikelski M (2013). Data from: The Environmental-Data Automated Track Annotation (Env-DATA) System: Linking animal tracks with environmental data. Movebank Data Repository. https://doi.org/10.5441/001/1.3hp3s250"),
    dict(id="movebank-eastern-curlew", handle="10255/move.1313", doi="10.5441/001/1.v8r49083",
         filename="Full annual cycle tracking of Far Eastern Curlew (Numenius madagascariensis)-gps.csv",
         speciesId="eastern-curlew", scientificName="Numenius madagascariensis", name="Far Eastern Curlew", nameZh="大杓鹬", color="#edb0a3", sensorType="gps",
         methodNote="GPS file only: 17 tracked birds from the Australian study. The separate Argos file is not included; the publication's combined 21-bird sample is not the displayed sample.",
         citation="Lilleyman A, Coleman JT, Maglio G, Bush R, Jessop R, O'Brien G, Stanioch D, Minton CDT, Fuller RA, Garnett ST, Woodworth BK (2021). Data from: Study Full annual cycle tracking of Far Eastern Curlew (Numenius madagascariensis). Movebank Data Repository. https://doi.org/10.5441/001/1.v8r49083"),
]


def iso(timestamp):
    return timestamp.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def parse_timestamp(value):
    try:
        value = value.strip().replace("Z", "+00:00")
        # Dates without a day are not precise enough for this map.
        if len(value) < 10:
            return None
        parsed = datetime.fromisoformat(value)
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
    except (ValueError, AttributeError):
        return None


def coordinate(value, bound):
    try:
        number = float(value)
        return number if math.isfinite(number) and abs(number) <= bound else None
    except (TypeError, ValueError):
        return None


def distance_km(a, b):
    lat1, lat2 = map(math.radians, (a["latitude"], b["latitude"]))
    dlat = lat2 - lat1
    dlon = math.radians(b["longitude"] - a["longitude"])
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371.0088 * 2 * math.asin(min(1, math.sqrt(h)))


def parse_tracks(text, source):
    """Keep owner-visible positions, one actual fix per UTC animal-day; never invent fixes."""
    days = {}
    total = 0
    for row in csv.DictReader(io.StringIO(text.lstrip("\ufeff"))):
        total += 1
        if row.get("visible", "").lower() != "true":
            continue
        if row.get("individual-taxon-canonical-name") != source["scientificName"]:
            continue
        if source.get("sensorType") and row.get("sensor-type") != source["sensorType"]:
            continue
        individual = row.get("individual-local-identifier", "").strip()
        timestamp = parse_timestamp(row.get("timestamp", ""))
        lon = coordinate(row.get("location-long"), 180)
        lat = coordinate(row.get("location-lat"), 90)
        if not individual or timestamp is None or lat is None or lon is None:
            continue
        point = dict(longitude=round(lon, 6), latitude=round(lat, 6), timestamp=iso(timestamp), month=timestamp.month)
        key = (individual, timestamp.date())
        if key not in days or point["timestamp"] < days[key]["timestamp"]:
            days[key] = point
    animals = defaultdict(list)
    for (individual, _), point in days.items():
        animals[individual].append(point)
    tracks = []
    for individual, points in sorted(animals.items()):
        points.sort(key=lambda p: p["timestamp"])
        segment = []
        index = 0
        def finish():
            nonlocal segment, index
            if segment:
                tracks.append(dict(id=f"{source['id']}:{individual}:{index}", sourceId=source["id"],
                                   speciesId=source["speciesId"], individualId=individual, points=segment))
                segment = []
                index += 1
        for point in points:
            if segment:
                prev = segment[-1]
                hours = (parse_timestamp(point["timestamp"]) - parse_timestamp(prev["timestamp"])).total_seconds() / 3600
                # Break uncertain jumps instead of drawing inferred journeys across gaps.
                if hours > 72 or hours <= 0 or distance_km(prev, point) / hours > 160 or abs(point["longitude"] - prev["longitude"]) > 180:
                    finish()
            segment.append(point)
        finish()
    return tracks, total


def get_bytes(url, cache, filename, offline=False):
    dest = cache / filename
    if dest.exists():
        return dest.read_bytes()
    if offline:
        raise RuntimeError(f"Missing cache file: {dest}")
    print(f"Downloading {filename}", flush=True)
    request = urllib.request.Request(url, headers={"User-Agent": "BirdRadar-data-preview/1.0 (public historical snapshot)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                data = response.read()
            dest.write_bytes(data)
            return data
        except (OSError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def get_json(url, cache, filename, offline=False):
    return json.loads(get_bytes(url, cache, filename, offline))


def archive_tracks(source, cache, offline):
    prefix = source["id"]
    meta = get_json("https://datarepository.movebank.org/server/api/pid/find?" + urllib.parse.urlencode({"id": source["handle"]}), cache, prefix + "-metadata.json", offline)
    rights = " ".join(row["value"] for row in meta["metadata"].get("dc.rights", []))
    if "CC0" not in rights:
        raise ValueError(f"Expected CC0 license for {prefix}, found: {rights}")
    bundles = get_json(meta["_links"]["bundles"]["href"], cache, prefix + "-bundles.json", offline)
    original = next(b for b in bundles["_embedded"]["bundles"] if b["name"] == "ORIGINAL")
    listing = get_json(original["_links"]["bitstreams"]["href"], cache, prefix + "-files.json", offline)
    files = listing["_embedded"]["bitstreams"]
    if source["filename"]:
        selected = next(f for f in files if f["name"] == source["filename"])
    else:
        candidates = [f for f in files if f["name"].lower().endswith((".csv", ".csv.zip")) and "reference" not in f["name"].lower() and "acceleration" not in f["name"].lower()]
        if len(candidates) != 1:
            raise ValueError(f"Ambiguous tracking files for {prefix}: {[f['name'] for f in candidates]}")
        selected = candidates[0]
    if selected["sizeBytes"] > 100_000_000:
        raise ValueError("Snapshot input exceeds the deliberate 100 MB download limit")
    raw = get_bytes(selected["_links"]["content"]["href"], cache, prefix + "-events.bin", offline)
    sha = hashlib.sha256(raw).hexdigest()
    if selected["name"].endswith(".zip"):
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            names = [name for name in archive.namelist() if name.lower().endswith(".csv")]
            if len(names) != 1:
                raise ValueError("Expected exactly one CSV in archive")
            raw = archive.read(names[0])
    tracks, total = parse_tracks(raw.decode("utf-8-sig"), source)
    points = [point for track in tracks for point in track["points"]]
    if not points:
        raise ValueError(f"No valid telemetry records for {prefix}")
    metadata = dict(id=prefix, name=meta["name"], kind="telemetry", url=f"https://doi.org/{source['doi']}",
                    citation=source["citation"], license="CC0-1.0", retrievedAt=iso(datetime.fromtimestamp((cache / (prefix + "-events.bin")).stat().st_mtime, timezone.utc)),
                    period=dict(start=min(p["timestamp"] for p in points), end=max(p["timestamp"] for p in points)),
                    method=(source.get("methodNote", "") + " Owner-visible records only. Earliest real fix per individual per UTC day; positions rounded to 6 decimals. Lines split at gaps over 72 hours, apparent speed over 160 km/h, or antimeridian crossing. Historical tracking sample; not all birds or live migration.").strip(),
                    rawSha256=sha, sourceRecordCount=total, retainedRecordCount=len(points))
    return tracks, metadata


def gbif_occurrences(cache, offline):
    records = {}
    queries = []
    fetched_count = 0
    for month in range(1, 13):
        params = [("taxonKey", "2481681"), ("hasCoordinate", "true"), ("hasGeospatialIssue", "false"),
                  ("occurrenceStatus", "PRESENT"), ("year", "2023,2025"), ("decimalLongitude", "90,180"),
                  ("decimalLatitude", "-50,75"), ("month", str(month)), ("limit", "50"),
                  ("license", "CC0_1_0"), ("license", "CC_BY_4_0")]
        url = "https://api.gbif.org/v1/occurrence/search?" + urllib.parse.urlencode(params)
        queries.append(url)
        page = get_json(url, cache, f"gbif-godwit-month-{month:02}.json", offline)
        fetched_count += len(page.get("results", []))
        for row in page.get("results", []):
            stamp = parse_timestamp(row.get("eventDate", ""))
            lat = coordinate(row.get("decimalLatitude"), 90)
            lon = coordinate(row.get("decimalLongitude"), 180)
            license_url = row.get("license", "")
            if stamp is None or lat is None or lon is None or not any(k in license_url for k in ("/publicdomain/zero/", "/licenses/by/")):
                continue
            key = str(row["key"])
            records[key] = dict(id=key, latitude=round(lat, 6), longitude=round(lon, 6), timestamp=iso(stamp), month=stamp.month,
                                speciesId="bar-tailed-godwit", sourceId="gbif-godwit", datasetKey=row.get("datasetKey", ""),
                                license=license_url, url=f"https://www.gbif.org/occurrence/{key}")
    points = list(records.values())
    if not points:
        raise ValueError("GBIF returned no eligible occurrence records")
    attributions = []
    for key in sorted({point["datasetKey"] for point in points if point["datasetKey"]}):
        dataset = get_json(f"https://api.gbif.org/v1/dataset/{key}", cache, f"gbif-dataset-{key}.json", offline)
        citation = dataset.get("citation", {})
        citation = citation.get("text", "") if isinstance(citation, dict) else str(citation)
        attributions.append(dict(datasetKey=key, title=dataset.get("title", key), url=f"https://www.gbif.org/dataset/{key}",
                                 citation=citation or dataset.get("title", key), license=dataset.get("license", "See occurrence record")))
    meta = dict(id="gbif-godwit", name="GBIF bar-tailed godwit observation sample", kind="occurrence", url="https://www.gbif.org/species/2481681",
                citation="GBIF.org occurrence search, Limosa lapponica, 2023–2025, 90–180°E / 50°S–75°N. Contributing datasets and licenses are preserved on each occurrence link.",
                license="CC0-1.0 / CC-BY-4.0 (per record)", retrievedAt=iso(datetime.fromtimestamp(max((cache / f"gbif-godwit-month-{month:02}.json").stat().st_mtime for month in range(1, 13)), timezone.utc)),
                period=dict(start=min(p["timestamp"] for p in points), end=max(p["timestamp"] for p in points)),
                method="Up to the first 50 API results per calendar month in 2023–2025. A convenience sample of observation records, not a systematic survey, abundance estimate, movement trajectory, or complete occurrence download.",
                sourceRecordCount=fetched_count, retainedRecordCount=len(points), attributions=attributions)
    return points, meta, queries


def parse_catalog_occurrence(row, species, taxon_key, month):
    """Accept actual dated observations only, with an explicit reusable record license."""
    stamp = parse_timestamp(row.get("eventDate", ""))
    lat = coordinate(row.get("decimalLatitude"), 90)
    lon = coordinate(row.get("decimalLongitude"), 180)
    license_url = row.get("license", "").rstrip("/").removesuffix("/legalcode")
    if (stamp is None or stamp.year not in (2024, 2025) or stamp.month != month or
            lat is None or lon is None or row.get("speciesKey") != taxon_key or
            row.get("occurrenceStatus") != "PRESENT" or row.get("basisOfRecord") != "HUMAN_OBSERVATION" or
            license_url not in ("http://creativecommons.org/publicdomain/zero/1.0", "https://creativecommons.org/publicdomain/zero/1.0",
                                "http://creativecommons.org/licenses/by/4.0", "https://creativecommons.org/licenses/by/4.0")):
        return None
    key = str(row["key"])
    return dict(id=key, latitude=round(lat, 6), longitude=round(lon, 6), timestamp=iso(stamp), month=stamp.month,
                speciesId=species["id"], sourceId=f"gbif-catalog-{species['id']}", datasetKey=row.get("datasetKey", ""),
                license=row["license"], url=f"https://www.gbif.org/occurrence/{key}")


def catalog_occurrences(cache, offline):
    """Small global + Australian monthly samples; effort is not comparable across strata."""
    catalog = json.loads((ROOT / "scripts/bird-catalog-sources.json").read_text())
    all_points, all_sources, all_queries = [], [], []
    for species in catalog:
        match_url = "https://api.gbif.org/v1/species/match?" + urllib.parse.urlencode({"name": species["scientificName"], "strict": "true"})
        match = get_json(match_url, cache, f"gbif-catalog-{species['id']}-taxon.json", offline)
        if match.get("matchType") != "EXACT" or match.get("canonicalName") != species["scientificName"] or match.get("rank") != "SPECIES":
            raise ValueError(f"Expected an exact GBIF species match for {species['scientificName']}")
        taxon_key = match.get("speciesKey") or match["usageKey"]
        jobs = []
        for month in range(1, 13):
            for scope in ("global", "australia"):
                params = [("taxonKey", str(taxon_key)), ("hasCoordinate", "true"), ("hasGeospatialIssue", "false"),
                          ("occurrenceStatus", "PRESENT"), ("basisOfRecord", "HUMAN_OBSERVATION"), ("year", "2024,2025"),
                          ("month", str(month)), ("limit", "6"), ("license", "CC0_1_0"), ("license", "CC_BY_4_0")]
                if scope == "australia":
                    params.append(("country", "AU"))
                url = "https://api.gbif.org/v1/occurrence/search?" + urllib.parse.urlencode(params)
                filename = f"gbif-catalog-{species['id']}-{scope}-{month:02}.json"
                jobs.append((month, scope, url, filename))
        def fetch(job):
            month, scope, url, filename = job
            return job, get_json(url, cache, filename, offline)
        # Only GBIF searches run concurrently, at a bounded four requests. Movebank stays sequential.
        with ThreadPoolExecutor(max_workers=4) as pool:
            pages = list(pool.map(fetch, jobs))
        points, fetched_count = {}, 0
        for (month, scope, url, filename), page in pages:
            all_queries.append(dict(speciesId=species["id"], taxonKey=taxon_key, month=month, scope=scope, url=url))
            fetched_count += len(page.get("results", []))
            for row in page.get("results", []):
                point = parse_catalog_occurrence(row, species, taxon_key, month)
                if point:
                    points[point["id"]] = point
        if not points:
            raise ValueError(f"No eligible catalog observations for {species['id']}")
        points = list(points.values())
        attributions = []
        for key in sorted({point["datasetKey"] for point in points if point["datasetKey"]}):
            dataset = get_json(f"https://api.gbif.org/v1/dataset/{key}", cache, f"gbif-dataset-{key}.json", offline)
            citation = dataset.get("citation", {})
            citation = citation.get("text", "") if isinstance(citation, dict) else str(citation)
            attributions.append(dict(datasetKey=key, title=dataset.get("title", key), url=f"https://www.gbif.org/dataset/{key}",
                                     citation=citation or dataset.get("title", key), license=dataset.get("license", "See occurrence record")))
        meta = dict(id=f"gbif-catalog-{species['id']}", name=f"GBIF {species['name']} monthly observation sample", kind="occurrence",
                    url=f"https://www.gbif.org/species/{taxon_key}",
                    citation=f"GBIF.org occurrence search, {species['scientificName']}, 2024–2025. Global and Australian monthly convenience samples; contributing datasets are cited below.",
                    license="CC0-1.0 / CC-BY-4.0 (per record)",
                    retrievedAt=iso(datetime.fromtimestamp(max((cache / job[3]).stat().st_mtime for job in jobs), timezone.utc)),
                    period=dict(start=min(p["timestamp"] for p in points), end=max(p["timestamp"] for p in points)),
                    method="Up to the first six GBIF API records per calendar month globally and six in Australia, 2024–2025; duplicate GBIF IDs removed. Only dated, georeferenced human observations of the matched species with CC0-1.0 or CC-BY-4.0 record licenses are retained. Strata are deliberately uneven and are not comparable abundance samples, complete ranges, inferred flight paths, live detections or forecasts.",
                    sourceRecordCount=fetched_count, retainedRecordCount=len(points), attributions=attributions)
        all_points.extend(points)
        all_sources.append(meta)
        print(f"{species['id']}: {len(points)} retained observations", flush=True)
    return all_points, all_sources, [species | dict(kind="occurrence") for species in catalog], all_queries


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, default=Path("/tmp/birdradar-data-cache"))
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--catalog-only", action="store_true", help="Refresh the monthly catalog while preserving existing telemetry and the original godwit sample exactly")
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    output = ROOT / "public/data/migration-snapshot.json"
    if args.catalog_only:
        result = json.loads(output.read_text())
        catalog_ids = {source["id"] for source in result["sources"] if source["id"].startswith("gbif-catalog-")}
        catalog_species = {point["speciesId"] for point in result["occurrences"] if point["sourceId"] in catalog_ids}
        result["sources"] = [source for source in result["sources"] if source["id"] not in catalog_ids]
        result["occurrences"] = [point for point in result["occurrences"] if point["sourceId"] not in catalog_ids]
        result["species"] = [species for species in result["species"] if species["id"] not in catalog_species]
        queries = json.loads((output.parent / "gbif-query-provenance.json").read_text())["queries"]
        result["generatedAt"] = iso(datetime.now(timezone.utc))
    else:
        result = dict(version=1, generatedAt=iso(datetime.now(timezone.utc)), sources=[], species=[], tracks=[], occurrences=[])
        for source in SOURCES:
            tracks, meta = archive_tracks(source, args.cache, args.offline)
            result["tracks"].extend(tracks)
            result["sources"].append(meta)
            result["species"].append({key: source[key] for key in ("name", "nameZh", "scientificName", "color")} | dict(id=source["speciesId"], kind="telemetry"))
        occurrences, meta, queries = gbif_occurrences(args.cache, args.offline)
        result["occurrences"] = occurrences
        result["sources"].append(meta)
        result["species"].append(dict(id="bar-tailed-godwit", name="Bar-tailed godwit", nameZh="斑尾塍鹬", scientificName="Limosa lapponica", color="#c5abf5", kind="occurrence"))
    catalog_points, catalog_sources, catalog_species, catalog_queries = catalog_occurrences(args.cache, args.offline)
    result["occurrences"].extend(catalog_points)
    result["sources"].extend(catalog_sources)
    result["species"].extend(catalog_species)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Do not replace a working snapshot unless every requested source succeeded.
    pending = output.with_suffix(".json.tmp")
    serialized = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
    if len(serialized.encode("utf-8")) > 4_000_000:
        raise ValueError("Snapshot exceeds the 4 MB budget; reduce sampling before publishing")
    pending.write_text(serialized, encoding="utf-8")
    pending.replace(output)
    (output.parent / "gbif-query-provenance.json").write_text(json.dumps(dict(generatedAt=result["generatedAt"], queries=queries), indent=2) + "\n")
    (output.parent / "gbif-catalog-query-provenance.json").write_text(json.dumps(dict(generatedAt=result["generatedAt"], queries=catalog_queries), indent=2) + "\n")
    individuals = {(t["sourceId"], t["individualId"]) for t in result["tracks"]}
    print(json.dumps(dict(output=str(output), individuals=len(individuals), telemetryPoints=sum(len(t["points"]) for t in result["tracks"]), observations=len(result["occurrences"]))))


if __name__ == "__main__":
    main()
