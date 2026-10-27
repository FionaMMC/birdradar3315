# Bird photograph provenance

These are photographs of the named species, chosen from the corresponding Wikipedia species article and verified against the original Wikimedia Commons `imageinfo` metadata. They are not generated illustrations, and they do not depict the specific tracked individuals or birds visiting a user's home.

Downloaded files are unaltered Commons thumbnails at a requested width of 960 px. The interface may crop the displayed photograph to fit its stamp or hero; display credits disclose that crop. The source image keeps its own CC BY-SA/CC0 license and is separate from the surrounding interface. The photographer, source and license should remain accessible wherever the image appears.

| Species | Photographer / creator | License | Original Commons file |
| --- | --- | --- | --- |
| waved-albatross | D. Gordon E. Robertson | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Waved_Albatross_pair.jpg) |
| eastern-curlew | JJ Harrison ( https://www.jjharrison.com.au/ ) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Numenius_madagascariensis_1_-_Stockton_Sandspit.jpg) |
| bar-tailed-godwit | Andreas Trepte | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Bar-tailed_Godwit.jpg) |
| ruddy-turnstone | Chuck Homler d/b/a Focus On Wildlife | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Ruddy_turnstone_(Arenaria_interpres)_Breeding_Plumage_Heislerville_WMA,_Cumberland_County,_New_Jersey,_USA.jpg) |
| sanderling | Chuck Homler, Focus On Wildlife | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Sanderling_(Calidris_alba)_in_Breeding_Plumage_in_the_Delaware_Bay_-_Heislerville_WMA_-_Cumberland_County_-_New_Jersey_-_May_2026.jpg) |
| red-knot | Chuck Homler d/b/a Focus On Wildlife | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Rufa_red_knot_(Calidris_canutus_rufa)_in_Delaware_Bay,_New_Jersey.jpg) |
| great-knot | Original: tcager ; this edit: User:MPF | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Calidris_tenuirostris,_Nadezhdinsky,_Primorsky_Krai,_Russia_1_(crop).jpg) |
| curlew-sandpiper | Imran Shah from Islamabad, Pakistan | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Curlew_Sandpiper_(Calidris_ferruginea)_(44855173205).jpg) |
| sharp-tailed-sandpiper | Alpsdake | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Calidris_acuminata_(s4).JPG) |
| whimbrel | Andreas Trepte | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Whimbrel_Numenius_phaeopus.jpg) |
| common-tern | MPF | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:2014-05-18_Sterna_hirundo,_Killingworth_Lake,_Northumberland_04.jpg) |
| arctic-tern | Charles J. Sharp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Arctic_tern_(Sterna_paradisaea)_Flatey_3.jpg) |
| barn-swallow | Andreas Trepte | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) | [Source and full attribution](https://commons.wikimedia.org/wiki/File:Rauchschwalbe_Hirundo_rustica.jpg) |

`public/data/bird-photo-provenance.json` preserves original/download URLs, source title, retrieval date, SHA-256 and alteration note for every image. `scripts/refresh-bird-photos.py` verifies the license before downloading and updates both that manifest and the visible metadata fields in `lib/birds.ts`, keeping them in sync. Its cache lives outside the repository.

```sh
# Manual refresh from the verified public sources.
python3 scripts/refresh-bird-photos.py --cache /tmp/birdradar-photo-cache

# Rebuild from the cached images and metadata with no network access.
python3 scripts/refresh-bird-photos.py --offline --cache /tmp/birdradar-photo-cache
```

No unrelated stamp illustration is reused for a new species. Existing seven illustrations and original bird videos retain their previously recorded provenance.
