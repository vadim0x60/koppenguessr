# Image-source feasibility — 2026-09-07

## Decision

Use YFCC100M as the preferred source for a metadata-only pilot, subject to
obtaining the official metadata under its Webscope agreement and reviewing the
allowed Creative Commons licenses. Do not acquire training images yet.

Keep the 2014 MMSys World-Wide Scale Geotagged Image Dataset only as a technical
fallback. Its archive is online and contains image bytes, but neither its
metadata nor README records per-photo licenses, so public downloadability does
not establish training or redistribution rights.

Do not treat the `do-me/Flickr-Geo` Hugging Face mirror as a rights-approved
substitute. It is useful evidence that a large current Flickr metadata scan has
the required technical fields, but its ODC-By dataset declaration does not grant
rights to the underlying photos, most sampled records are Flickr license ID 0
(All Rights Reserved), and it is not YFCC100M.

## Findings

| Source | What is available | What it establishes | Blocking issue |
| --- | --- | --- | --- |
| YFCC100M / Multimedia Commons | Metadata for 99.2M photos was released; about 48M are geotagged. The archived Multimedia Commons collection documents 99,171,688 images at up to 500 px and per-item Creative Commons license metadata. Its public S3 bucket still lists and serves image objects. | Scale, uploader IDs, coordinates, dates, per-item licenses, and an immutable image snapshot fit the proposed acquisition and split contract. | Yahoo Webscope currently says metadata access is unavailable. Use remains subject to the Webscope agreement and each item's license. We need the metadata to connect S3 image hashes to coordinates, users, and licenses. |
| MMSys 2014 / UMass Trace Repository | The live tar is 85,124,894,720 bytes. Its metadata zip is 1,128,024,567 bytes and contains one 3,816,250,832-byte CSV. Three `PhotoCollection` zips total 83,402,327,121 bytes; a range probe confirmed JPEG content. Metadata includes Flickr ID, uploader ID, tags, coordinates, accuracy, capture/upload dates, and URL components. | Contrary to the dataset README and the literature-review summary, this hosted copy contains actual image bytes, so present-day Flickr link rot is not the immediate technical blocker. | There is no per-image license field or blanket image license in the README. The README says to contact the author for image files even though the tar contains them. Treat that inconsistency as a rights gate, not permission. |
| `do-me/Flickr-Geo` mirror | 217,646,487 geotagged rows derived from a separate 2024 Flickr index, with uploader, coordinates, Flickr accuracy, dates, tags, numeric license, and URLs. | The metadata shape is sufficient for filtering, labeling, grouping by uploader, and geographic splitting. | It is not the cited 14M corpus or YFCC100M. Its provenance and photo rights are inadequate for selecting training images without independent verification. |

Primary references:

- CS229 report: <https://cs229.stanford.edu/proj2019spr/report/23.pdf>
- UMass archive index: <https://traces.cs.umass.edu/docs/traces/multimedia/>
- UMass archive: <https://skulddata.cs.umass.edu/traces/mmsys/2014/user03.tar>
- YFCC100M paper: <https://arxiv.org/abs/1503.01817>
- Multimedia Commons documentation: <https://multimediacommons.wordpress.com/yfcc100m-core-dataset/>
- Multimedia Commons S3 bucket: <http://multimedia-commons.s3.amazonaws.com/>
- Current Flickr API terms: <https://www.flickr.com/help/terms/api>
- Current Flickr general terms: <https://www.flickr.com/help/terms>
- Beck et al. Köppen–Geiger V3 record: <https://figshare.com/articles/dataset/21789074>

## Metadata diagnostic

To test the field and label pipeline without acquiring images, three shards from
commit `b35beeb56823e358e12d126111e3f1dcfed82075` of `do-me/Flickr-Geo`
were inspected: `part-01000`, `part-02575`, and `part-05149`. Their SHA-256
values are, respectively:

- `c0be48355fad78aeb8d8e3dfa4c47cd7003b50163af4d052c7d7983053407eb3`
- `39bfa8bfb8a6cd503030462abc7bfd169cc3ec590aa36b9638e3cec9874c53a9`
- `68e7326a09c3f622fb925c35ca6943728a62f1495ba48dda6b5be709f7bd025b`

This is a deterministic three-shard diagnostic, not a random sample or a
population estimate. The 130,043 rows contained 22,910 uploader IDs and 61,488
exact coordinate pairs. Of these:

- 122,959 mapped to land in the January 2026 corrected V3 Beck et al.
  1991–2020 Köppen–Geiger raster.
- 87,630 land rows had Flickr coordinate accuracy 15 or 16.
- 7,651 also used provisional candidate license IDs 4, 5, 7, 8, 9, or 10. This
  set is only a screening assumption; legal review must decide which licenses
  and model uses are acceptable.
- 202 additionally contained one of the legacy positive tags `landscape`,
  `nature`, `outdoor(s)`, or `scenery`.

Not all 30 theoretical Köppen classes were represented after filtering. Before
license and tag filtering, 25 appeared; Dfd, Dsd, and Dwd were absent, while Csc
had one row. After the provisional rights and precision filters, 24 appeared;
Dsc and Dwc had one row each, and several extreme classes remained sparse. This
confirms that the raster lookup works and common classes have ample candidates,
but rare-class coverage needs a much larger scan and probably targeted
acquisition.

The diagnostic also shows why raw image count is misleading. The provisional
7,651 rows came from only 837 uploaders and 3,814 coordinate pairs. The 202
tag-filtered rows came from only 25 uploaders and 120 coordinate pairs.
Whole-uploader and geographic grouping will substantially reduce independent
split support, and legacy tag filtering is too selective and concentrated to be
the sole scene filter.

The label source is now straightforward: Beck et al. V3, corrected January 2026,
1991–2020, approximately 1 km, CC BY 4.0. Pin file `61012822`
(`koppen_geiger_tif.zip`), size 130,618,411 bytes, MD5
`7fc2f5a15d4f5fe0ce59c9a9b502aa09`, and use
`1991_2020/koppen_geiger_0p00833333.tif` plus `legend.txt`.

## Pilot gate

Proceed in this order:

1. Obtain an authorized copy of YFCC100M metadata and retain its governing
   agreement with the dataset version.
2. Decide on an explicit allowed-license set. Preserve creator attribution and
   license URL per image; do not infer image rights from a metadata mirror's
   dataset-level license.
3. Scan all geotagged photos metadata-only. Require plausible coordinates,
   suitable Flickr accuracy, photos rather than videos, usable capture dates
   where available, and a selected license.
4. Join coordinates to the pinned Beck V3 raster and report subtype, major group,
   raster confidence or boundary quality when available, uploader counts,
   coordinate clusters, dates, and licenses.
5. Form duplicate/user/geographic groups before sampling. Measure support after
   50 km split buffers; do not extrapolate from image counts.
6. Select an approximately 5,000-site manifest across climate, region, land use,
   season, and uploader. Then retrieve a capped image sample, verify hashes and
   attribution, run semantic relevance scoring, and manually audit accepted and
   rejected strata.
7. Keep the evaluation distribution at natural frequencies and geographically
   held out. Use class-aware training sampling or loss rather than discarding
   most common-class data.

No image download, train/validation/test split, or claim of dataset readiness is
justified until steps 1–5 pass.
