# Visual climate classification

Research into what photographs reveal about long-term climate, which visual cues
support that inference, and where it fails. This repository holds two complementary
projects—not a competition to maximize game scores:

- **[game/](game/README.md)** — Köppen Climate Zone Guessr, an educational Street
  View game and potential interface for future controlled human studies.
- **[koppenmodel/](koppenmodel/README.md)** — the research plan for image-only
  climate classification using licensed geotagged photos, plus offline metadata
  auditing tools. Collection and training are not implemented or run yet.

To continue the modeling work, start with the
**[model handoff](koppenmodel/HANDOFF.md)**. It records the current blocker,
pinned source and label decisions, implementation order, output contracts, and
the exact boundary between runnable checks and future training commands.

## Play and develop

[Play online](https://vadim0x60.github.io/koppengame/).
The existing URL redirects to `game/`; GitHub Pages still serves the root of
`master`, with no build step or Pages configuration change required.

From the repository root, run `python3 server.py` to serve the repository on port
8000. The root page redirects to the game, whose assets and data live together in
`game/`. In an Amp orb, run `amp orb services ensure` and open its returned portal.

The legacy game data-generation and API diagnostic scripts remain in `game/`.
Run them **from that directory** because their data paths are relative to the
working directory. They can make network requests and overwrite datasets; they
are not the offline test suite and must not be run as part of routine validation.

## Modeling: offline checks only

Python 3.10+, standard library only. From `koppenmodel/`:

```sh
python3 -m unittest discover -s tests -v
python3 prepare.py --game ../game --output /tmp/koppen-audit.json
```

The audit output path must not already exist. The research plan describes future
photo filtering, labeling, geographic splits, training, and evaluation. No imagery
or model weights are bundled. The source [MIT license](LICENSE) does not grant
rights to third-party imagery; each dataset requires its own rights review.
