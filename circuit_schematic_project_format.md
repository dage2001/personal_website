# SPICE viewer project files

Use **Download → Project** to save `spice-schematic.spiceproj`, and **Upload** to resume in this viewer. Upload also accepts ordinary SPICE netlists. No server, account or external service is required.

The preview toolbar's Upload is the single file entry point. It accepts one project, a main netlist with its dependency libraries, or libraries alone. File extensions, content and include references determine roles automatically; ambiguous files or multiple main-netlist candidates open a role-selection dialog. A cancelled selection preserves the current work. Netlist-side file inputs have been removed.

Project files are UTF-8 JSON with `format: "spice-viewer-project"` and `version: 4`. Version 1, 2 and 3 files remain readable. New versions prevent older viewers from silently dropping label-editing, manual-group or layout-template state. They contain:

- Original netlist and uploaded library texts.
- Drawing settings, display grid, grid visibility, editing and flywire modes.
- Current instance path, pan and zoom, and saved viewports of visited sheets.
- Node colors and automatic palette assignments.
- Per-instance component positions, rotations/mirrors, pin identities and wire segments for each visited grid-enabled sheet. Incomplete wiring is saved; remaining flywires are derived from the actual connectivity when reopened.
- Optional per-sheet `snapshot.labelOverrides`: stable owner/index identity, display text, owner-relative position and rotation/mirror orientation. Label editing mode is saved separately. Text changes are display annotations; original device values and node identities always come from the netlist.
- Optional per-sheet `snapshot.manualGroups`: flat, disjoint sets of component identifiers for manual editing. Their bounding boxes are derived from member symbol geometry, excluding text. Groups never introduce SPICE subcircuits, nets, ports or layout directives. Automatic layout and automatic routing ignore them; Generate creates a fresh current sheet without manual grouping.
- Optional per-sheet `templateSource`: source instance path for a successfully applied layout format brush. All nested target sheets are saved separately with their corresponding source paths. This supports completion badges after reopening. Subsequent manual edits clear the affected sheet's and its ancestors' template markers for that drawing configuration. The active brush gesture and highlights are session-only.

Sheets are identified by instance path, topology signature and drawing settings. Repeated instances remain separate. Unvisited sheets are generated on demand from their subcircuit definitions. Alignment and distribution save their resulting placements and wiring like any other edit. Ground symbols retain their electrical identity and saved placement, despite being excluded from the SPICE device count. Undo history, activity logs, selection boxes, cursor guides, an unfinished route gesture and fullscreen window positions are session-only. Loading a project appends to the existing session log.

The original netlist remains the electrical source of truth. The loader checks the file version, layout version, source hierarchy and every saved sheet's topology, then renders reference symbols locally and checks their identities, rigid transforms, grid coordinates, wire connectivity, label targets and group membership/envelopes before replacing the current document. Imported SVG/HTML is never executed or inserted. Malformed or incompatible projects produce an explicit error and leave the current document intact. All supported project versions require the same layout-rules version; future migrations must be explicit rather than silently discarding manual geometry.

Limits: 32 MiB per project, 2 million netlist characters, 1,000 saved sheet/configuration records; each record allows up to 10,000 components and 50,000 wire segments. The format is uncompressed and can be reviewed as text. It includes uploaded library contents, so sharing a project also shares those libraries.

SVG, ASC and Bundle remain export formats for the current sheet. Bundle includes the ASC, generated ASY symbols, original netlist, libraries and connectivity manifest for LTspice. It does not restore this viewer's complete interactive editing state; use Project for that purpose.

The `interactive` field restores the Edit button and horizontal tool reveal. Flywires is now a one-shot, confirmed action on the current sheet; new exports retain the legacy `flywire` field as `false`. Legacy files with `flywire: true` still restore their saved incomplete wiring, but the flag never clears additional or newly generated sheets. Use Auto-route explicitly to complete the saved wiring.
