# SPICE viewer project files

Use **Download → Project** to save `spice-schematic.spiceproj`, and **Upload** to resume in this viewer. Upload also accepts ordinary SPICE netlists. No server, account or external service is required.

Project files are UTF-8 JSON with `format: "spice-viewer-project"` and `version: 1`. They contain:

- Original netlist and uploaded library texts.
- Drawing settings, display grid, grid visibility, editing and flywire modes.
- Current instance path, pan and zoom, and saved viewports of visited sheets.
- Node colors and automatic palette assignments.
- Per-instance component positions, rotations/mirrors, pin identities and wire segments for each visited grid-enabled sheet. Incomplete wiring is saved; remaining flywires are derived from the actual connectivity when reopened.

Sheets are identified by instance path, topology signature and drawing settings. Repeated instances remain separate. Unvisited sheets are generated on demand from their subcircuit definitions. Undo history, an unfinished route gesture and fullscreen window positions are session-only.

The original netlist remains the electrical source of truth. The loader checks the file version, layout version, source hierarchy and every saved sheet's topology, then renders reference symbols locally and checks their identities, rigid transforms, grid coordinates and wire connectivity before replacing the current document. Imported SVG/HTML is never executed or inserted. Malformed or incompatible projects produce an explicit error and leave the current document intact. Version 1 requires the same layout-rules version; future migrations must be explicit rather than silently discarding manual geometry.

Limits: 32 MiB per project, 2 million netlist characters, 1,000 saved sheet/configuration records; each record allows up to 10,000 components and 50,000 wire segments. The format is uncompressed and can be reviewed as text. It includes uploaded library contents, so sharing a project also shares those libraries.

SVG, ASC and Bundle remain export formats for the current sheet. Bundle includes the ASC, generated ASY symbols, original netlist, libraries and connectivity manifest for LTspice. It does not restore this viewer's complete interactive editing state; use Project for that purpose.
