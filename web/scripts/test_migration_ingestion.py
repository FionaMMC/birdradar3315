import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("ingestion", Path(__file__).with_name("refresh-migration-data.py"))
ingestion = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ingestion)


class MigrationIngestionTests(unittest.TestCase):
    source = {"id": "study", "speciesId": "bird", "scientificName": "Example bird"}
    header = "visible,timestamp,location-long,location-lat,individual-local-identifier,individual-taxon-canonical-name\n"

    def parse(self, rows):
        return ingestion.parse_tracks(self.header + "\n".join(rows), self.source)

    def test_owner_exclusions_invalid_coordinates_and_undeployed_tags_are_removed(self):
        tracks, count = self.parse([
            "false,2020-01-01 00:00:00,10,20,A,Example bird",
            "true,2020-01-01 00:00:00,10,91,A,Example bird",
            "true,2020-01-01 00:00:00,10,20,,Example bird",
            "true,2020-01-01 00:00:00,10,20,A,Wrong taxon",
            "true,2020-01-01 00:00:00,10,20,A,Example bird",
        ])
        self.assertEqual(count, 5)
        self.assertEqual(len(tracks), 1)
        self.assertEqual(len(tracks[0]["points"]), 1)

    def test_daily_thinning_uses_actual_earliest_fix_regardless_of_row_order(self):
        tracks, _ = self.parse([
            "true,2020-01-01 23:00:00,11,21,A,Example bird",
            "true,2020-01-01 01:00:00,10,20,A,Example bird",
        ])
        point = tracks[0]["points"][0]
        self.assertEqual(point["timestamp"], "2020-01-01T01:00:00.000Z")
        self.assertEqual(point["longitude"], 10)

    def test_long_gaps_and_dateline_crossings_do_not_create_map_lines(self):
        tracks, _ = self.parse([
            "true,2020-01-01 00:00:00,179,20,A,Example bird",
            "true,2020-01-02 00:00:00,-179,20,A,Example bird",
            "true,2020-01-10 00:00:00,-178,20,A,Example bird",
        ])
        self.assertEqual(len(tracks), 3)
        self.assertEqual({t["individualId"] for t in tracks}, {"A"})

    def test_partial_dates_are_not_invented_and_utc_is_explicit(self):
        self.assertIsNone(ingestion.parse_timestamp("2020-01"))
        self.assertEqual(ingestion.iso(ingestion.parse_timestamp("2020-01-01 02:00:00+02:00")), "2020-01-01T00:00:00.000Z")

    def test_gps_only_source_rejects_other_sensors(self):
        source = self.source | {"sensorType": "gps"}
        tracks, count = ingestion.parse_tracks(
            self.header.rstrip() + ",sensor-type\n" +
            "true,2020-01-01 00:00:00,10,20,A,Example bird,solar-geolocator\n" +
            "true,2020-01-02 00:00:00,11,21,A,Example bird,gps\n" +
            "true,2020-01-03 00:00:00,12,22,A,Example bird,\n", source)
        self.assertEqual(count, 3)
        self.assertEqual(len(tracks), 1)
        self.assertEqual([p["timestamp"] for p in tracks[0]["points"]], ["2020-01-02T00:00:00.000Z"])

    def test_catalog_observations_require_a_real_date_matching_taxon_and_open_license(self):
        row = dict(key=123, speciesKey=456, eventDate="2025-01-15", decimalLatitude=-33.8, decimalLongitude=151.2,
                   occurrenceStatus="PRESENT", basisOfRecord="HUMAN_OBSERVATION", datasetKey="dataset",
                   license="http://creativecommons.org/licenses/by/4.0/legalcode")
        species = dict(id="test-bird")
        point = ingestion.parse_catalog_occurrence(row, species, 456, 1)
        self.assertEqual(point["timestamp"], "2025-01-15T00:00:00.000Z")
        self.assertEqual(point["sourceId"], "gbif-catalog-test-bird")
        self.assertEqual(point["license"], row["license"])
        for changes in [dict(speciesKey=999), dict(eventDate="2025-01"), dict(eventDate="2023-01-15"),
                        dict(eventDate="2025-02-15"), dict(decimalLatitude=91), dict(occurrenceStatus="ABSENT"),
                        dict(basisOfRecord="PRESERVED_SPECIMEN"), dict(license="https://creativecommons.org/licenses/by-nc/4.0/legalcode"),
                        dict(license="https://creativecommons.org/licenses/by/4.0/other")]:
            self.assertIsNone(ingestion.parse_catalog_occurrence(row | changes, species, 456, 1), changes)
        self.assertIsNotNone(ingestion.parse_catalog_occurrence(row | dict(license="http://creativecommons.org/publicdomain/zero/1.0/legalcode"), species, 456, 1))


if __name__ == "__main__":
    unittest.main()
