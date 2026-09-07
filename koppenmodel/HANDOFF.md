# Model-work handoff

## Current state

Training is not runnable yet. There is no authorized photo corpus, normalized
photo manifest, geographic train/validation/test split, model implementation,
checkpoint, or training configuration in this repository. Do not work around
this by using the game's Google imagery or by treating a public download URL as
an image license.

What is complete:

- The 2,628-record game seed has an offline schema/support/identity audit and
  optional four-view plan in `prepare.py`; `reports/seed-audit.json` is the
  checked-in result.
- Every game seed site has GHSL built-up-land annotations and training-only
  sampling weights in `../sampling/pilot/manifest.json`.
- `reports/image-source-feasibility.md` compares candidate Flickr sources,
  records an actual 130,043-row metadata diagnostic, selects YFCC100M as the
  preferred source, and pins the climate-label raster.
- The research protocol in `README.md` defines leakage controls, model inputs,
  metrics, staged baselines, and the distinction between the research model and
  game adapter.

## Decisions already made

Preserve these unless new evidence is documented:

1. Prefer YFCC100M because it has uploader, geolocation, capture-date, and
   per-item Creative Commons metadata plus an archived media snapshot. Official
   metadata access and its governing agreement are still required.
2. Label capture coordinates with Beck et al. Köppen–Geiger V3, corrected
   January 2026, period 1991–2020, approximately 1 km. The exact archive and
   checksum are pinned in the feasibility report.
3. Retain the scientific subtype taxonomy. Aw/As merging belongs only in the
   game adapter. Mark unsupported classes as not evaluable rather than
   fabricating balance.
4. Split sites before views or augmentation. Keep each duplicate cluster,
   uploader/sequence group, and nearby geographic group in one partition;
   enforce the proposed 50 km cross-partition buffer and run a 100 km
   sensitivity check.
5. Keep evaluation at the acquisition distribution and unweighted. Address
   training imbalance with sampling or loss, not by deleting most common-class
   data.
6. Models receive RGB and an optional view mask only. Coordinates, countries,
   labels, source IDs, filenames, tags, and split metadata are offline pipeline
   inputs, never predictor features.
7. Start with frozen DINOv2 ViT-B features and a regularized multinomial
   logistic-regression head. Add fine-tuning or multi-view pooling only after a
   measured validation improvement.

## External gate

Before implementing image acquisition, record all of the following in a source
inventory:

- dataset version and governing access agreement;
- allowed per-image licenses and the legal interpretation used for training,
  evaluation, cached features, model release, and redistribution;
- attribution, deletion, privacy, and retention requirements;
- an authorized metadata location and checksum;
- whether the archived Multimedia Commons image object is allowed when the live
  Flickr object has changed or disappeared.

The current actionable blocker is obtaining an authorized YFCC100M metadata
copy. Multimedia Commons still serves archived image objects, but the official
Yahoo Webscope metadata distribution is unavailable. The 2014 MMSys archive and
the `do-me/Flickr-Geo` mirror are evidence and fallbacks, not approved image
sources.

Keep large metadata, rasters, photos, features, and checkpoints outside Git.
Commit only code, schemas, configurations, reports, and manifests that the
source agreement permits redistributing. Never commit credentials or URLs
containing access tokens.

## Implementation order and contracts

Implement one stage at a time and make each stage resumable, deterministic, and
auditable:

1. **Ingest:** stream approved source metadata into a normalized site/photo
   manifest. Preserve opaque source ID, uploader ID, coordinates and precision,
   capture date, media type, license URL, attribution, and source version.
   Reject malformed rows with counted reason codes.
2. **Label:** join the actual capture coordinate to the pinned climate raster.
   Store raw subtype, raster value/version/checksum, confidence or neighborhood
   proportions, and boundary-quality flags. Do not infer labels from country or
   tags.
3. **Filter:** reject corrupt and obvious non-photo/indoor/document content,
   then score rather than blindly remove ambiguous scenes. Pin model revision,
   prompt/classes, threshold, and retention by climate, region, source, and
   license. Audit accepted and rejected samples manually.
4. **Group and split:** combine exact/perceptual duplicates, uploader or sequence
   relationships, and geographic neighbors into connected groups. Persist the
   seed and assignments. Fail validation if a protected identity or distance
   crosses partitions.
5. **Acquire:** download only approved objects with explicit item/byte/request
   limits, retries, checksums, atomic writes, and per-item status. Do not silently
   replace unavailable objects.
6. **Baseline:** extract frozen features, fit uniform/prior and linear baselines,
   and save the exact checkpoint revision, preprocessing, class order, seed,
   dependencies, and manifest checksum.
7. **Evaluate:** select on geographic validation only, lock the recipe, then run
   the test once. Produce per-class support and metrics, calibration,
   geographic/source/season/land-use slices, abstention curves, and
   region-cluster bootstrap intervals.

The eventual command-line interface should make data lineage explicit. These
are target contracts, not commands that exist today:

```sh
python3 -m koppenmodel.ingest --source-inventory ... --metadata ... --output ...
python3 -m koppenmodel.label --manifest ... --raster ... --output ...
python3 -m koppenmodel.split --manifest ... --seed ... --output ...
python3 -m koppenmodel.train --manifest ... --config ... --run-dir ...
python3 -m koppenmodel.evaluate --run-dir ... --split test --output ...
```

Every output must refuse accidental overwrites and record input checksums.
Training batches expose only decoded RGB, target index, and view mask. A run
directory should contain resolved configuration, environment lock,
source/manifest/taxonomy/checkpoint hashes, logs, best checkpoint, validation
predictions, and metrics. Test predictions and metrics are created only by the
locked evaluation command.

## Checks available now

From the repository root:

```sh
PYTHONPATH=koppenmodel python3 -m unittest discover -s koppenmodel/tests -v
uv run --with-requirements sampling/requirements.txt \
  python3 -m unittest discover -s sampling -p 'test_*.py' -v
node --test game/test_sampling.cjs

python3 koppenmodel/prepare.py --game game \
  --land-use sampling/pilot/manifest.json \
  --output /tmp/model-audit.json --views-output /tmp/model-views.jsonl
```

The generated view file is metadata-only, unsplit, and blocked pending rights
and label review. It is not training data.

## First takeover milestone

A takeover is ready to start model implementation when it can produce a checked,
redistributable report—not necessarily a public manifest—showing counts by
license, uploader, coordinate cluster, climate subtype, region, and capture year
for the full approved YFCC100M scan. The report must also show candidate support
after grouping and 50 km split buffers. Only then select the approximately
5,000-site image pilot and profile acquisition, filtering, storage, and
feature-extraction throughput.
