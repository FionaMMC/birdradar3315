import { assetUrl } from "@/lib/site-path";
import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/atlas/SiteNav";
import styles from "@/components/atlas/ResearchPage.module.css";
import snapshot from "@/public/data/migration-snapshot.json";
import { BIRDS } from "@/lib/birds";
import { getMigrationSummary, type MigrationDataset } from "@/lib/migration-data";

export const metadata: Metadata = {
  title: "Data & sources — BirdRadar",
  description: "The studies, observation records, licenses and methods behind BirdRadar’s historical migration atlas.",
};

const data = snapshot as MigrationDataset;
const summary = getMigrationSummary(data);
const telemetry = data.sources.filter((source) => source.kind === "telemetry");
const occurrenceSources = data.sources.filter((source) => source.kind === "occurrence");
const observationContributors = [...new Map(occurrenceSources.flatMap((source) => source.attributions || []).map((attribution) => [attribution.datasetKey, attribution])).values()];
const photographedBirds = BIRDS.filter((bird) => bird.photo);
const number = (value: number) => value.toLocaleString("en-AU");
const date = (value: string) => new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const refreshed = (value: string) => new Date(value).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Australia/Sydney", timeZoneName: "short" });
const licenseLabel = (value: string) => value.includes("by-nc") ? "CC BY-NC 4.0" : value.includes("/by/") ? "CC BY 4.0" : value.includes("zero") || value === "CC0-1.0" ? "CC0 1.0" : value;

export default function SourcesPage() {
  return <main className={styles.page}>
    <img className={styles.backdrop} src={assetUrl("/assets/atlas/collection-poster.webp")} alt="" width="1536" height="1024" />
    <div className={styles.veil} aria-hidden="true" />
    <SiteNav />
    <header className={styles.hero}>

      <h1>The evidence<br />behind the atlas.</h1>
      <p className={styles.intro}>Real recorded positions, with their history intact. Follow each layer back to the researchers and observers who made it possible.</p>
      <nav className={styles.jumpLinks} aria-label="On this page">
        <a href="#tracking">Individual tracking <span aria-hidden="true">↘</span></a>
        <a href="#observations">Observations <span aria-hidden="true">↘</span></a>
        <a href="#photography">Bird photography <span aria-hidden="true">↘</span></a>
        <a href="#reading-the-map">Reading the map <span aria-hidden="true">↘</span></a>
      </nav>
      <div className={styles.snapshot}>
        <p>Snapshot prepared <strong><time dateTime={data.generatedAt}>{refreshed(data.generatedAt)}</time></strong></p>
        <p>{number(summary.individualCount)} tracked individuals · {number(summary.pointCount)} daily positions · {number(summary.occurrenceCount)} separate observations</p>
      </div>
    </header>

    <section id="tracking" className={styles.section} aria-labelledby="tracking-title">
      <div className={styles.sectionHeading}>
        <h2 id="tracking-title">An individual.<br />A recorded journey.</h2>
        <p>Tracking records link a known bird to a place and time. These archived Movebank studies cover different years and regions. They show historical sample movements, including time spent at stopovers and resident sites.</p>
      </div>
      <div className={styles.studies}>
        {telemetry.map((source) => {
          const tracks = data.tracks.filter((track) => track.sourceId === source.id);
          const species = data.species.find((bird) => bird.id === tracks[0]?.speciesId)!;
          const individuals = new Set(tracks.map((track) => track.individualId)).size;
          return <article id={source.id} key={source.id} className={styles.study}>

            <h3>{species.name}</h3>
            <p className={styles.scientificName}>{species.scientificName}</p>
            <p className={styles.studySummary}>{species.id === "osprey" ? "Satellite telemetry of North American ospreys, tracing fall migration routes, timing and wintering sites across the Americas." : species.id === "eastern-curlew" ? "GPS tracking from Australian non-breeding grounds along the East Asian–Australasian flyway. The atlas includes 17 individuals from the archived GPS file; Argos records and the paper’s larger combined sample are not included." : "Waved albatross tracking around the Galápagos and eastern Pacific, published with the Env-DATA study. These records include breeding-season foraging and other movements."}</p>
            <dl className={styles.facts}>
              <div><dt>Tracked individuals</dt><dd>{number(individuals)}</dd></div>
              <div><dt>Daily positions shown</dt><dd>{number(source.retainedRecordCount)}</dd></div>
              <div className={styles.wideFact}><dt>Recorded period · UTC</dt><dd><time dateTime={source.period.start}>{date(source.period.start)}</time> – <time dateTime={source.period.end}>{date(source.period.end)}</time></dd></div>
            </dl>
            <div className={styles.sourceLinks}>
              <a href={source.url}>Dataset DOI <span aria-hidden="true">↗</span></a>
              <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 <span aria-hidden="true">↗</span></a>
              <Link href={`/species/${species.id}`}>Meet this bird <span aria-hidden="true">↗</span></Link>
            </div>
            <p className={styles.citation}>{source.citation}</p>
            <p className={styles.retrieved}>Source retrieved <time dateTime={source.retrievedAt}>{refreshed(source.retrievedAt)}</time></p>
          </article>;
        })}
      </div>
    </section>

    <section id="observations" className={styles.section} aria-labelledby="observations-title">
      <div className={styles.sectionHeading}>
        <h2 id="observations-title">A sighting.<br />A point in time.</h2>
        <p>GBIF brings together independent observations from many contributors. A point records where a bird was observed. Observation heat gently blends nearby records; individual identity is unknown, so these sightings are never joined into flight paths.</p>
      </div>
      <div className={styles.occurrenceIntro}>
        <article className={styles.study}>
          <h3>Many birds, many observers.</h3>
          <dl className={styles.facts}>
            <div><dt>Included observations</dt><dd>{number(summary.occurrenceCount)}</dd></div>
            <div><dt>Species samples</dt><dd>{occurrenceSources.length}</dd></div>
            <div><dt>Contributing datasets</dt><dd>{observationContributors.length}</dd></div>
          </dl>
          <div className={styles.sourceLinks}><a href={assetUrl("/data/gbif-catalog-query-provenance.json")}>Monthly query provenance <span aria-hidden="true">↗</span></a></div>
        </article>
        <div className={styles.copy}>
          <p>The expanded catalog uses small monthly global and Australian samples from 2024–2025. The earlier Bar-tailed Godwit sample covers selected East Asian and Australasian records. Each sample’s query method and returned dates are preserved below.</p>
          <p>This is a convenience sample in the API’s returned order. Coverage depends on where people observed and shared birds; the sample is neither complete nor adjusted for observer effort. Point counts cannot be read as population size.</p>
          <p>Observation heat gives each independent record one contribution, blending nearby records within a finite radius. Its fixed colour scale uses the selected species’ full-period sample as the denominator, so filtering a month does not inflate its colours. Recording effort remains part of the pattern.</p>
          <p>Included records carry CC0 or CC BY licenses. Each observation on the map links to its source record. The contributing catalog’s license can differ from the license attached to an individual record; both are preserved below.</p>
        </div>
      </div>
      <h3 className={styles.attributionHeading}>Every observation sample.</h3>
      <div className={styles.attributions}>
        {occurrenceSources.map((source) => {
          const records = data.occurrences.filter((record) => record.sourceId === source.id);
          const species = data.species.find((bird) => bird.id === records[0]?.speciesId);
          return <details key={source.id} id={source.id} className={styles.attribution}>
            <summary>{species?.name || source.name} · {number(source.retainedRecordCount)} observations</summary>
            {species && <p className={styles.scientificName}>{species.scientificName}</p>}
            <p className={styles.citation}>{source.method}</p>
            <p className={styles.license}>Returned records · {date(source.period.start)} – {date(source.period.end)}<br />{source.attributions?.length || 0} contributing datasets</p>
            <div className={styles.sourceLinks}><a href={source.url}>GBIF species record <span aria-hidden="true">↗</span></a>{species && <Link href={`/track-migration?species=${species.id}&month=all`}>Explore this sample <span aria-hidden="true">↗</span></Link>}</div>
            <p className={styles.citation}>{source.citation}</p>
            <p className={styles.retrieved}>Source retrieved <time dateTime={source.retrievedAt}>{refreshed(source.retrievedAt)}</time></p>
          </details>;
        })}
      </div>
      <h3 className={styles.attributionHeading}>With thanks to the contributors.</h3>
      <p className={styles.attributionNote}>Open a dataset for its full citation, catalog license and examples of the licensed records included in this snapshot.</p>
      <div className={styles.attributions}>
        {observationContributors.map((attribution) => {
          const records = data.occurrences.filter((record) => record.datasetKey === attribution.datasetKey);
          const examples = [...new Map(records.map((record) => [record.license, record])).values()];
          const doi = attribution.citation.match(/https:\/\/doi\.org\/[^\s]+/)?.[0];
          return <details key={attribution.datasetKey} className={styles.attribution}>
            <summary>{attribution.title}</summary>
            <p className={styles.citation}>{attribution.citation}</p>
            <p className={styles.license}>Catalog license: <a href={attribution.license}>{licenseLabel(attribution.license)}</a><br />Included records: {number(records.length)} · {examples.map((record) => licenseLabel(record.license)).join(" / ")}</p>
            <div className={styles.sourceLinks}>
              <a href={attribution.url}>Dataset <span aria-hidden="true">↗</span></a>
              {doi && <a href={doi}>DOI <span aria-hidden="true">↗</span></a>}
              {examples.map((record) => <a key={record.license} href={record.url}>{licenseLabel(record.license)} record <span aria-hidden="true">↗</span></a>)}
            </div>
          </details>;
        })}
      </div>
    </section>

    <section id="photography" className={styles.section} aria-labelledby="photography-title">
      <div className={styles.sectionHeading}><h2 id="photography-title">Real birds.<br />Shared with care.</h2><p>Species photographs are credited separately from research records and illustrated stamps. Images are cropped to fit the photographic postage format; their source and license remain available here and beside the unlocked artwork.</p></div>
      <div className={styles.attributions}>{photographedBirds.map((bird) => <details key={bird.id} className={styles.attribution}><summary>{bird.name} · {bird.photoLicense}</summary><p className={styles.citation}>{bird.photoCredit}. Cropped for display in BirdRadar’s stamp collection.</p><div className={styles.sourceLinks}><a href={bird.photoSource}>Original photograph <span aria-hidden="true">↗</span></a><a href={bird.photoLicenseUrl}>{bird.photoLicense} license <span aria-hidden="true">↗</span></a><Link href={`/species/${bird.id}`}>Field notes <span aria-hidden="true">↗</span></Link></div></details>)}</div>
    </section>

    <section id="reading-the-map" className={styles.section} aria-labelledby="reading-title">
      <div className={styles.sectionHeading}>
        <h2 id="reading-title">How to read<br />the light.</h2>
        <p>The soft, layered field makes recorded patterns easier to explore. Tracking density describes use of space by tracked individuals. Observation heat describes the concentration of published sightings in the selected sample. Neither measures global abundance, flight frequency or birds in the air right now.</p>
      </div>
      <div className={styles.methods}>
        <article><span className={styles.methodNumber}>01 / Daily positions</span><h3>One real fix per day.</h3><p>For each individual, the earliest eligible fix on each UTC day is retained. Coordinates are rounded to six decimals. These are measured positions, with no invented locations or daily averages.</p></article>
        <article><span className={styles.methodNumber}>02 / Sample density</span><h3>One bird, one vote.</h3><p>Each tracked bird contributes once to each 1° cell it visits during the selected period. The cell value is the fraction of active tracked individuals of that species visiting it. Visual smoothing blends nearby measured cells.</p></article>
        <article><span className={styles.methodNumber}>03 / Time &amp; gaps</span><h3>Keep the gaps visible.</h3><p>Lines connect successive measured fixes; the exact route between them is unknown. Gaps over 72 hours, apparent speeds above 160 km/h and antimeridian crossings split lines. A month means that month across the study’s historical years.</p></article>
      </div>
      <div className={styles.sourceLinks} style={{ marginTop: 44 }}>
        <a href={assetUrl("/data/migration-snapshot.json")} download>Download the data snapshot <span aria-hidden="true">↓</span></a>
        <a href="https://creativecommons.org/licenses/by/4.0/">About CC BY 4.0 <span aria-hidden="true">↗</span></a>
      </div>
      <p className={styles.attributionNote} style={{ marginTop: 18 }}>Source retrieval and snapshot preparation are separate from observation dates. Refreshes are manual; the atlas uses the historical snapshot dated above.</p>
    </section>
    <footer className={styles.footer}>
      <Link href="/track-migration">Return to the atlas <span aria-hidden="true">↗</span></Link>
      <p>Open research. Visible sources.<br />Room for what the data cannot tell us.</p>
    </footer>
  </main>;
}
