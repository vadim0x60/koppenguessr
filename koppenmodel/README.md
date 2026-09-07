# koppenmodel

Research plan for **visual climate classification**: what can images reveal about
long-term climate, which visual cues support that inference, and where does it
fail? Koppenmodel and koppengame are complementary parts of this larger effort.
The model supports controlled experiments; the game is an educational interface
and potential human-study instrument, not the definition of model success.

Primary data: licensed geotagged photo collections, labeled against climate maps.
Neither Street View access nor beating human game scores is a prerequisite.
No photo collection, model download, or training has been run. Implemented tools
include the offline game-metadata audit/view planner and a shared
[built-up-land sampling pilot](../sampling/README.md) using a public GHSL raster.
They do not yet implement the broader photo pipeline described here.

The [image-source feasibility report](reports/image-source-feasibility.md)
selects YFCC100M as the preferred pilot source, contingent on authorized access
to its currently unavailable official metadata and per-license review. The
public 2014 MMSys Flickr archive is only a technical fallback because it omits
per-image licenses. The report also pins the corrected January 2026 Beck et al.
Köppen–Geiger V3 raster and records a metadata-only label-coverage diagnostic.

## Research questions

1. How much long-term climate information is recoverable from a single photo,
   at the major-group and subtype levels, on geographically unseen locations?
2. Which cues carry it: vegetation structure, terrain, soil, seasonal appearance,
   or human geography? Compare controlled cue ablations and matched subsets;
   saliency alone is not evidence of a causal explanation.
3. How much apparent skill comes from location recognition, photographer/source
   bias, or climate-map labeling artifacts rather than transferable scene cues?
4. How do relevance filtering, season, land use, spatial scale, and uncertainty in
   geotags or climate boundaries affect predictability and calibration?
5. Where do humans and models agree or fail differently on the same observations?
   A future controlled game-based study can investigate this, without treating
   competitive rank as the research objective.

## Task and success criteria

- Input: a single ground-level RGB photograph initially. Additional same-site
  photos are a later experiment where capture proximity is verified; arbitrary
  photo collections need not provide panoramas or standardized camera headings.
- Output: a calibrated probability distribution over climate classes, top-1
  answer, and uncertainty, including abstention for uninformative scenes. Report
  both forced-choice performance and selective performance at stated coverage.
- Never feed coordinates, panorama IDs, filenames, country metadata, iframe URLs,
  game state, hints, option elimination, answer reveals, or location labels into
  the predictor. Coordinates are allowed **offline only** for labeling and splits.
  Natural scene cues such as vegetation, terrain, buildings, and visible signs
  are allowed; provider location overlays are not scene cues.
- Optimize climate generalization, not panorama retrieval or memorization of
  the game's finite pool. No known-location lookup branch. Geographic recognition
  from pixels may arise in the encoder, but must survive region-held-out tests.
- “Any location” is an ambition, not a guarantee: a photograph cannot uniquely
  determine decades of monthly temperature and rainfall. Cfa/Cwa, Cfb/Csb,
  continental subtypes, seasonal snow versus EF, irrigated landscapes, and indoor
  scenes require uncertainty rather than confident invented distinctions.

Success is a reproducible estimate of visual climate predictability and its limits,
not an arbitrary accuracy release threshold. Register hypotheses, primary metrics,
splits, and comparisons before inspecting the final test. Report baseline-relative
effects, geographic cluster-bootstrap confidence intervals, calibration, unsupported
classes, and negative results. Stronger predictive models are useful, but a credible
finding that certain distinctions are not visually recoverable is also valuable.

## Existing game audit (application context, not the research benchmark)

Inspected koppengame revision
[`7a005a4`](https://github.com/vadim0x60/koppengame/commit/7a005a48dc1c2e8102bc121a8624fa28fd4917b9)
on 2026-09-06, before the repository reorganization. Source references below are
now relative to `../game/`; the game files retain their original contents:

| Finding | Source / consequence |
| --- | --- |
| 30 selectable answers; Aw and As merged | `app.js:31–70,109–124`. Keep the training taxonomy versioned; merge probabilities only at the game adapter. |
| 2,628 records, all with unique IDs, panorama IDs, and exact coordinate pairs | `locations.json`, audited offline; this says nothing about near-duplicates or present-day availability. |
| 28 raw codes, 27 represented game answers | Aw and As have 100 each, hence merged support 200. Csc has 41, Cwc 86, EF 1; all other represented raw codes have 100. Dfd/Dsd/Dwd have zero. |
| Shuffled no-replacement deck and fixed-pano embeds | `app.js:158–205`. Current game frequency is not a globally representative climate prior. |
| Exact match earns one point; hints eliminate answers without score penalty | `app.js:226–349`. Hints are explicitly out of scope regardless of scoring. |
| Public JSON and browser state contain answers | `app.js:109–124,262–349`. Isolate the predictor from the game controller; do not benchmark a DOM/URL leak. |
| Main generation uses `/tmp/world-main.json` and a `kgcpy` raster, retaining curated records | `generate_dataset.py:357–430`. Source pool version, raster version, period, and licensing are not pinned here. |
| Legacy pano verification searches within 5 km | `find_verified_locations.py:8–19`. Availability verification is not climate-label verification; re-label actual camera coordinates. |

The README's “31 choices” is stale relative to the 30 runtime choices. The game
behavior and data are unchanged. The seed's SHA-256 is recorded in
`reports/seed-audit.json`.

## 1. Resolve imagery rights before acquiring data

Start with photo collections whose image licenses and access terms permit this
research. Public accessibility is not a license, and usable geotags are not
universal. Audit per-image rights and coordinate precision before choosing a source.
Track attribution, redistribution, privacy, retention, and derivative-model rules.
Owner-contributed imagery and explicit research agreements are alternatives.

Google-specific constraints below matter only if that source is used; they do not
block a photo-based research program.

The game's MIT source license does **not** grant training rights to Google imagery
or establish rights for upstream datasets.
[Google Maps Platform terms, §3.2.3](https://cloud.google.com/maps-platform/terms) restrict scraping/caching and using
Maps content to improve ML/AI models, explicitly including training, testing,
validation, and fine-tuning (checked 2026-09-06). A browser screenshot or a paid API
key is not a workaround. The exact applicable agreement must be reviewed; permission
must cover evaluation and derived features as well as training and storage.

Obtain appropriate permission before Google-based model development/evaluation.
Otherwise leave Google-game performance unvalidated. Street-level imagery can be
an optional transfer domain later, alongside other photo sources; it is not the
required final benchmark. Do not silently replace the live game's imagery.

This is a concrete execution gate, not an implemented collector. The offline
planner creates no image URLs and makes no network calls. Before implementing a
provider adapter, record a rights approval reference, permitted uses, expiry, and
source version. Keep credentials outside manifests and logs.

## 2. Build a globally useful dataset

### Taxonomy and labels

Choose a versioned taxonomy based on the scientific climate reference, not the
game's answer buttons. Report both major groups and supported subtypes. A raster
may not distinguish As or support every theoretical class; record this explicitly
rather than manufacturing labels. Retain raw source and normalized research labels.
If a later game adapter needs Aw/As merged, sum their probabilities there.

Pin raster publication, checksum, spatial resolution, reference climate period,
nodata handling, and conventions (notably the 0°C versus −3°C C/D boundary).
Check the raster license before use. Sample at the **actual capture coordinate**
using the raster's documented CRS and indexing, not a copied nearest-pano query
point. Date imagery separately from the long-term climate reference period.

For each point, save center label, neighboring-cell class proportions, distance
to a boundary where measurable, and agreement with an independent climate source
using compatible definitions. Coastlines, steep elevation changes, and boundaries
get a quality flag. Use high-confidence labels first; test soft neighborhood
targets/downweighting later on validation. Do not delete hard cases from the only
test: publish both clean-label and boundary/ambiguous slices. Keep game labels
and audited climate labels separate when they disagree; report both rather than
“correcting” the model into reproducing game errors.

### Coverage and sampling

The implemented [geographic-only pilot](../sampling/README.md) annotates the game
seed at 100 m/500 m scales and exports training-only land-use weights. Pass
`--land-use ../sampling/pilot/manifest.json` to `prepare.py` to attach these to
the unsplit view plan; all sites remain, including those excluded from the game.
Scene visibility/cultural-cue review is queued, not completed. Recompute weight
normalization on training sites after geographic splitting; never filter or
reweight the locked evaluation set with the game's selection policy.

1. Pilot: ~5,000 distinct sites across available classes and multiple separated
   regions per class. Inspect coverage before fixing quotas; EF and extreme
   continental subtypes may require special licensed sources and expert review.
2. Scale: ~100,000–300,000 sites if the pilot justifies it. Aim for ≥1,000 distinct
   sites in each feasible common class and ≥3 independent geographic regions per
   class, not thousands of neighboring frames on the same road. Rarity can make
   those targets impossible; publish actual support rather than padding classes.
3. Balance joint climate × region × land use × season × photo-source coverage.
   Include urban, rural, forest, desert, coastal, alpine, snow, irrigated, obscured,
   and low-quality scenes. Tourist photos, road imagery, and owner-contributed
   photos each have selection biases; none represents all locations by itself.
4. Avoid country/climate confounding: obtain the same climate from different
   countries and different climates within a country. Prioritize confusion pairs
   and uncertain/disagreeing training examples after the initial model; never mine
   errors from the locked test to extend training.

### Photo relevance filtering (future pipeline)

Validate geotag plausibility and precision before raster lookup; flag coordinates
whose uncertainty spans multiple climate classes. Separate capture coordinates
from manually assigned subject/place coordinates where the source allows it.

Use a frozen scene classifier or image/text model to score environmental context.
Initially reject obvious indoor food shots, documents, screenshots, and corrupt
images; downweight ambiguous close-ups or portraits rather than indiscriminately
removing them. Keep scenes with terrain, exposed ground, vegetation, or surrounding
streetscape. **Do not require greenery:** deserts, ice, and urban scenes matter.
Do not confuse aesthetic landscape quality with climate informativeness.

Manually audit accepted and rejected samples stratified by climate and source.
Pin the filtering model, prompts, scores, and thresholds, choosing thresholds on
pilot/training data only. Record retention rates by class, region, and source.
Compare unfiltered, hard-filtered, and softly weighted training sets under a fixed
compute/data budget. Evaluate on both a predeclared environmental-photo subset
and an unfiltered sample from the intended source population, reporting rejection
and abstention coverage. Filtering must not quietly make the benchmark easier.

### Acquisition contract (future script)

`collect` will accept an approved provider and site manifest, require an explicit
execution flag, item/byte/request/spend caps, and perform a small approved pilot
before a full run. Dry-run is the default. Use supported APIs, rate limiting,
bounded exponential backoff, resumable per-view status, checksums, and atomic
writes. Preserve capture location/time, source ID, camera heading/pitch/FOV if known,
dimensions, source/rights references, and failures. Never substitute a nearby
pano silently; any replacement is a new site requiring relabeling and split checks.

Proposed metadata per site: opaque `site_id`, `source`, `source_version`,
`rights_ref`, `capture_id`, `sequence_id`, `photographer_id` where permitted,
`lat`, `lng`, `coordinate_precision`, `capture_date`, `relevance_score`,
`raw_code`, `taxonomy_version`, `raster_sha256`, `label_quality`, `region_id`,
`split`, and views containing opaque image path, checksum, and camera settings.
Store metadata separately from training batches. Batches expose RGB, class target,
and view mask only. Include no climate/country text in image filenames or renders.
Reject blank/error/loading images; retain lawful attribution in stored/displayed
sources. Define an approved scene-only model input separately, excluding provider
address/minimap UI without violating attribution terms.

## 3. Splits that actually measure generalization

Split **sites before views or augmentation**, using a pinned seed and persisted
manifest. Start with roughly 70/15/15 train/validation/test geographic allocation,
then report actual class/region counts rather than promising exact proportions.

- Group all views, repeat visits, panorama versions, shared sequence/capture IDs,
  exact hashes, and perceptual near-duplicates. The whole connected group belongs
  to one partition. Keep nearby photographer sequences together; add a
  photographer-held-out diagnostic where metadata permits it. Inspect suspicious
  visual matches manually where authorized.
- Allocate broad spatial regions, then enforce a minimum 50 km geodesic separation
  across partitions by removing boundary sites into a documented buffer partition.
  A grid cell hash alone is insufficient: neighboring cells can share one road.
  Use spatial indexing and exact geodesic checks, including dateline/polar cases.
  Run 100 km sensitivity and region-held-out experiments; 50 km is a starting
  protocol, not a guarantee of independence.
- Hold entire countries/ecoregions out in additional challenge tests; avoid a
  single arbitrary country split that makes classes absent by construction.
  Also hold out provider/camera generation and capture seasons where feasible.
- Verify no capture, duplicate cluster, sequence, or protected geographic buffer
  crosses partitions. Fail closed on violations, and publish per-class support.
- EF's single seed record cannot support train/val/test. Absent and singleton
  classes require new independent sites; until then, report “not evaluable”. Do
  not count fabricated zero-support results as evidence of generalization.
- Keep a representative acquisition-distribution test and a climate-balanced
  challenge test. Neither should be called an area-weighted “global accuracy”
  without a defensible sampling design. Keep the current game pool as an optional
  external test only if its imagery use is permitted; exclude its neighboring
  sites from training when claiming unseen-place performance on it.

## 4. Model and staged experiments

**Recommended starting point:** a single-photo pretrained visual encoder followed
by a climate classifier. Start with frozen DINOv2 ViT-B
features and regularized multinomial logistic regression; compare a frozen SigLIP
encoder and text-prompt climate baseline where checkpoint licenses permit use.
Pin exact checkpoint IDs, revisions, preprocessing, dependencies, and licenses
before running. No foundation model training from scratch.

Progression, each justified by validation improvement:

1. Majority/prior and uniform baselines; frozen single-view encoder + linear head.
2. Compare photo-relevance filtering strategies and geographic coverage before
   adding model complexity. Optionally test shared-encoder pooling on verified
   same-site photo sets; compare with single-photo results on those same sites.
   Cache features only where rights allow.
3. Fine-tune upper encoder blocks with a lower encoder learning rate than the head,
   AdamW, warmup/cosine schedule, mixed precision, early stopping on geographic
   validation macro-F1. Initial sweep: encoder LR 1e−5/3e−5, head LR 1e−4/3e−4,
   weight decay 0.01/0.05, ≤20 epochs, effective batch 64 sites. These are starting
   settings to profile, not a promise that all configurations fit one GPU.
4. If useful, learn attention pooling over views with random view dropout. Add an
   auxiliary five-group head (class CE + 0.2 × group CE initially). Derive reported
   group probabilities by summing calibrated class probabilities for consistency.
   Consider monthly climate regression only if trustworthy, licensed continuous
   targets add benefit; do not make it an initial dependency.
5. Ensemble complementary encoders only if the measured gain merits latency.
   Fit temperature scaling on validation predictions; never calibrate on test.

Use mild crop/resize, exposure changes, JPEG artifacts and view dropout. Avoid
aggressive color shifts, fake snow, or synthetic vegetation that changes climate
evidence. Avoid horizontal flips initially because text and road cues change.
Compare natural sampling with modest class-aware batches; do not simultaneously
apply extreme inverse-frequency weights and oversampling. Label noise and regional
coverage are likely more important than a larger head.

Run ablations for view count, frozen versus tuned encoder, pooling, balancing,
group loss, boundary-label treatment, and signs/architecture reliance (authorized
masked-scene diagnostic). Track seeds and confidence intervals; test the final
selected recipe once, not every experiment. Pretraining geolocation overlap may
be unknown and should be disclosed, not claimed impossible.

## 5. Research evaluation and optional applications

Report exact top-1/top-3, macro-F1, balanced accuracy, per-class precision/recall,
five-group accuracy, confusion matrix, NLL, Brier score, calibration, and
risk/coverage under abstention. Include per-region/provider/season/land-use and
boundary slices, support counts, and region-cluster bootstrap 95% intervals.
Report errors caused by invalid imagery separately while also counting them in
end-to-end coverage. Measure p50/p95 latency, GPU memory, and number of views.

Publish a reproducibility bundle: source/license inventory, taxonomy/raster version,
filtering protocol, split manifests where redistributable, model configuration,
seeds, metrics, and a stratified error analysis. Compare vegetation-rich, arid,
urban, seasonal, and irrelevant-photo slices. Treat cue ablations as diagnostics:
masking can introduce distribution shift, so it does not by itself establish what
the model causally understands.

An optional human comparison should use the same held-out images and class guide,
no hints or hidden metadata, and a prespecified protocol for participant expertise,
time/view budgets, and repeated trials. Obtain consent and appropriate study review
before collecting participant data. The existing game's scores are not such a study.

Future inference API: `predict(images, view_mask)` → ordered class probabilities,
top label, calibrated confidence, and invalid-input status. Model weights,
preprocessing, taxonomy, and calibration parameters form one versioned artifact.
The game adapter merges Aw/As probabilities and selects the highest-probability
game answer. Keep unavailable-class limitations visible; never secretly use the
current game's class-frequency table to rule out climates in general inference.

### Optional game adapter (not a research milestone requirement)

The trusted controller can render the round, capture permitted scene pixels,
rotate for additional views, and click the predicted answer. The isolated
predictor receives only images. It gets neither DOM/network access nor the round
manifest. Hint usage stays zero. Never use `locations[currentIndex]`, iframe URL,
post-answer pixels, or browser network responses as observations. Provider
loading/consent/error screens must trigger a bounded retry or an explicit failed
round, not a confident climate prediction. Integration tests must inject distinct
hidden answers into otherwise identical observations and verify identical model
outputs. Use a controlled authorized renderer for repeatable heading/FOV tests;
the existing cross-origin iframe is not a reliable camera-control API.

## 6. Resource envelope and order of work

| Stage | Work and exit gate |
| --- | --- |
| Now (done) | Inspect source, audit seed, write this plan and offline planner/tests. No images, APIs, model weights, training, or game changes. |
| Rights + protocol | Approved imagery source and climate raster; taxonomy and split contract pinned; privacy/retention rules recorded. |
| Approved pilot | Acquire photos from ~5k diverse sites; audit geotags, labels, relevance filtering, geographic separation, and class coverage. |
| Baselines | Single-photo frozen encoders, filtering comparisons, and cue diagnostics; establish confusion pairs and whether scaling is worthwhile. |
| Scale + tune | Expand geographic coverage, selectively fine-tune, calibrate, and register the final recipe. |
| Research report | Run locked geographic/domain tests; publish effects, uncertainty, cue diagnostics, negative results, and reproducibility materials. |
| Optional applications | Educational game adapter or controlled human study; neither is required to establish the model's research value. |

One photo × 5k sites = 5k images; one × 100k = 100k. At an assumed 0.2–0.5 MB
per resized image, these are ~1–2.5 GB and ~20–50 GB before originals, rejected
photos, duplicates, or checkpoints. At 768 float32 features per image, cached
features are ~15 MB and ~307 MB respectively (decimal units). Multiple photos per
site increase storage but not independent site count. Budget raw candidate volume
using the pilot's measured retention rate. API costs depend on the source;
estimate requests × contracted price plus retries before enabling acquisition.

Profile 1,000 authorized views for throughput and VRAM before reserving compute.
A single 16–24 GB GPU is a plausible starting point for frozen feature extraction
and small-batch ViT-B tuning with accumulation, not a verified requirement. Estimate
runtime from measured views/second and epochs rather than inventing GPU-hour
figures. No GPU or paid service is needed for the current offline work.

## Offline tooling available now

Python 3.10+, standard library only; run from this directory:

```sh
python3 prepare.py --game ../game --output /tmp/koppen-audit.json
python3 -m unittest discover -s tests -v
# Optional metadata-only view schedule, NOT a download or a train/test split:
python3 prepare.py --game ../game --output /tmp/koppen-view-audit.json \
  --views-output /tmp/koppen-planned-views.jsonl
```

An initial report is included in `reports/seed-audit.json`. Outputs must be new
paths; the tool refuses to overwrite either inputs or previous reports.

The planner reads selectable codes from `app.js`, audits schema and support,
records source checksums, reports duplicate identities and contradictory pano
labels, and estimates a four-view budget. Optional view rows contain privileged
label/location metadata for a future authorized collector, **not model input**.
It deliberately assigns no split: safe geographic splitting needs capture
provenance and deduplication unavailable in the seed. Collection, labeling,
splitting, training, evaluation, and browser-adapter scripts remain future work,
with contracts described above; none are presented as functioning components.
