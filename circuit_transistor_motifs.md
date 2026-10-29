# Transistor structure recognition and layout preferences

The read-only `assets/js/spice/transistor-motifs.js` module consumes the visible Circuit IR and confirmed DC-node metadata. It returns members, device roles, shared nodes, matching evidence and structural confidence. It does not flatten hierarchy, rename devices, merge nodes, or infer a transistor operating point.

Supported first-pass structures:

- BJT B=C and FET G=D diode connections, preserving terminal identity.
- Same-polarity current mirrors with one reference and one or more outputs; direct returns or one resistor per return path. MOS body differences lower confidence.
- Assisted BJT mirrors with a reference collector driving a same-polarity emitter follower whose emitter drives the shared bases and whose collector has a confirmed supply potential.
- Two-transistor common-tail differential pairs; an unconnected/unbiased or multi-input tail has medium confidence. Confirmed supply nodes are not treated as a differential tail.
- Complementary common-base composite input pairs, as in the teaching 741: two input devices sharing collectors, separate emitter-to-emitter complementary branches and a common base node on the complementary devices.
- One unambiguous resistor from C to B and one from B to E: VBE multiplier connectivity. Parallel divider ambiguity is left unmatched.

Matches may overlap: a diode-connected reference can also belong to a mirror. A match describes connectivity, not proof that the device is biased correctly or that currents/gains meet a specification. Unknown transistor polarity is left unmatched. Loads and additional branches are allowed; they do not invalidate an otherwise complete structural match.

`layout-semantics.js` retains the result in `circuit.layout.motifs`. `layout-adapter.js` converts node references to real net bits; `layout-cache.js` canonicalizes every device role and net reference. `renderer.js` restores actual identities in exported reports. The detector does not depend on display labels, element numbers, coordinate order or a particular op-amp model name.

`motif-layout.js` provides the first layout integration:

- High-confidence structures wholly contained in a classic region influence ELK model order and real-edge shortness/straightness priorities. No extra schematic blocks, electrical devices, ordering wires or boundary ports are introduced.
- Differential inputs contribute a joint outward-control mirror candidate; two-device mirrors contribute an inward-control candidate. Existing candidates remain available.
- VBE multiplier matches determine divider resistor orientation. Unknown/medium-confidence matches remain visible in diagnostics but impose no layout preference.
- Candidate scoring includes control-pin vertical spread and excessive separation of differential/mirror branches. This is a soft preference, not a fixed-coordinate template.
- Ordinary ELK candidates remain in the comparison. Every selected result must pass fixed-pin, connectivity and wire geometry checks before SVG/ASC export.

A motif crossing an explicit functional-stage boundary is reported, but the boundary is not silently overridden. For example Q12/Q13 in the 741 teaching netlist are identified as a mirror but remain in separate BIAS/OUTPUT groups. Strict pair alignment, degeneration-aware differential pairs, general cascodes, arbitrary mirror feedback networks and full functional-stage synthesis are not implemented in this first pass.

Run `node --test scripts/test-spice-motifs.mjs` for the focused tests, or `npm run test:spice` for the complete suite. Tests include near-match negative cases, multi-output loads, resistor endpoint reversal, model polarity, MOS body mismatch, renamed devices, overlapping motifs, scoped cache equivalence and measured layout comparison. Evidence is exposed in the JSON view and SVG layout metadata.

Matching uses device, node-pin, shared-control and shared-source/collector indexes. Multi-input tail candidates are reported as one medium-confidence structure, rather than enumerating every pair. Multiple diode references on one control node remain ambiguous in this first pass and are not forced into a basic mirror match.
