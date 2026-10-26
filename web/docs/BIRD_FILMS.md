# Bird films

The films are existing material from the BirdRadar repository, restored from its Git LFS objects. They are photographic footage, not generated images, telemetry or evidence of birds at the visitor’s location. Their original project license and permissions are unchanged; a filename credit is inherited metadata, not independent verification of authorship or publication rights.

## Original interaction

Commit `5138505` contains the original `LightsOutChallenge.tsx`: after the visitor’s checkbox confirmation, an 800 ms transition changed the background from `6151210_City Buildings Gloomy Flying Birds_By_Lukas_Pich_Artlist_4K.mp4` to `rainbow.mp4`. Original Latham’s Snipe and Black-faced Spoonbill pages also contained videos. These source pages are now retained in `web/legacy/species/`.

The restored experience uses city birds before the action and a separate, skippable birds-in-flight sequence after recording. Recording is immediate and is never dependent on film playback. The eight-second sequence can be paused, skipped with its button or Escape, and replayed from completion. Reduced-motion starts on the poster and waits for manual Play. Unavailable media leaves the poster and a functioning Skip action. Every looping film pauses while hidden or offscreen; sound is always muted. A record is a self-report of an action, not a claim that the action caused the archival birds to fly.

## Reviewed footage and identity boundaries

Frames were inspected at three seconds and playable metadata was read with `ffprobe` on 2026-10-25. These inspections establish visible content, not exact taxonomic identity.

| Original archive asset | Visible content | Product use |
| --- | --- | --- |
| `Latham's Snipe.mp4` | Close-up of a snipe | Latham’s Snipe profile, labelled snipe footage with exact species unverified |
| `75588_Spoonbill scratching under its wing with its beak _By_Studio_Non_Artlist_4K.mp4` | A spoonbill preening | Black-faced Spoonbill profile, labelled spoonbill footage with exact species unverified |
| `rainbow.mp4` | Bee-eaters with red throats | Rainbow Bee-eater profile, explicitly other bee-eaters, not a confirmed Rainbow Bee-eater |
| `6151210_City Buildings Gloomy Flying Birds_By_Lukas_Pich_Artlist_4K.mp4` | A flock flying across a city | Lights Out’s initial atmosphere, not the visitor’s city |
| `59014_Flock of birds flying in the sky_By_Ami_Bornstein_Artlist_HD.mp4` | Flock against open sky | Lights Out’s post-action flight and other profiles, explicitly shared archival flight footage |

Names such as “rainbow.mp4” are not reliable species identification. Exact species in the footage, filming date and location are not independently established. No film is presented as the selected individual, migration study or local record. `lib/bird-video.ts` is the independent media map; catalog/data identity remains in `lib/birds.ts`.

## Delivery derivatives

Original source files are unchanged. The browser uses muted H.264 / yuv420p derivatives with fast-start metadata, 1600×900, 24 fps, CRF 25 and the `fast` preset. They are in `public/assets/films/`:

- `snipe.mp4`: original seconds 1–13 (12 seconds).
- `bee-eaters.mp4`: original seconds 0–12.
- `spoonbill.mp4`: original seconds 0–11.9.
- `city-birds.mp4`: original seconds 2–12 (10 seconds).
- Matching JPEG posters are original frames at three seconds, scaled to 1600 pixels wide at JPEG quality 2.
- `birds-in-flight.jpg` is a frame at three seconds of the already optimized `public/assets/atlas/migration-flight.mp4`. The source is encoded at 1600×900 with sample aspect ratio 4:3, giving display aspect ratio 64:27. Its poster therefore uses `scale=1600:675,setsar=1`: a square-pixel 1600×675 JPEG matching the displayed film, so contained mobile playback does not expose mismatched poster strips. That existing 12.76-second film remains unchanged; the post-action presentation stops at eight seconds.

Only four original LFS assets were restored for this work, plus the flock source already restored earlier. No new footage was downloaded from a third-party stock service. Profile videos leave their subject visible, using a directional reading mask and moving the illustrated keepsake below the film. Mobile keeps the real footage in an unobscured separate strip below the introduction.
