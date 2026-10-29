# Built-in classic circuit examples

The viewer offers five named circuit examples rather than a mixed device-family demonstration. Netlists are self-contained: paste one into the editor or open the `.cir` file without adding an external library.

| Example | Topology and source | Adaptation |
| --- | --- | --- |
| `filter.cir` | Capacitor-output series RLC low-pass, [MIT 6.200, Series RLC: Filters](https://circuits.mit.edu/S26/psets/12/series_filters) | Illustrative R/L/C values and a 1 kΩ output load |
| `common-emitter.cir` | Divider-biased common-emitter amplifier, [Analog Devices chapter 9.2](https://wiki.analog.com/university/courses/electronics/text/chapter-9) | Illustrative component values and a simple NPN model |
| `emitter-follower.cir` | Common-collector emitter follower, [Analog Devices chapter 9.4](https://wiki.analog.com/university/courses/electronics/text/chapter-9) | Illustrative component values and a simple NPN model |
| `sallen-key.cir` | Unity-gain Sallen–Key low-pass, [TI SLOA024B, section 3](https://www.ti.com/lit/an/sloa024b/sloa024b.pdf) | R1=R2=10 kΩ, C1=C2=10 nF; official LM741 macromodel |
| `instrumentation-amplifier.cir` | Three-op-amp instrumentation amplifier, [TI SBOA282A](https://www.ti.com/lit/an/sboa282a/sboa282a.pdf) | Reference resistor ratios, LM741 in place of TLV171; explicit nested input/difference stages |

The Sallen–Key example has ideal natural frequency 1/(2πRC) ≈ 1.59 kHz and Q=0.5. The instrumentation amplifier's ideal gain is 1+2×10 kΩ/2.21 kΩ ≈ 10.05. These are topology calculations, not measured or simulated device performance.

## Op-amp hierarchy

In `instrumentation-amplifier.cir`, open:

1. `XINA` — the complete instrumentation amplifier.
2. `XINA/XINPUT` — two input amplifiers and the gain-setting network; or `XINA/XDIFF` — the difference output stage.
3. `XINA/XINPUT/XU1`, `XINA/XINPUT/XU2`, or `XINA/XDIFF/XU3` — the LM741 IC macromodel's internal circuit.

The original manufacturer port order is preserved: **1 = non-inverting, 2 = inverting, 99 = positive supply, 50 = negative supply, 28 = output**. The internal view displays the manufacturer's equivalent macromodel, including its transistor, diode, passive and controlled-source stages; it is not a full transistor-level die schematic.

## LM741 provenance and redistribution

- Official source: [Texas Instruments LM741 model archive, SNOM211](https://www.ti.com/lit/zip/snom211), downloaded 2026-10-29.
- Original file in the archive: `lm741.lib`, 2596 bytes.
- SHA-256: `f58370983c8bd22bf6a59ddd05a1dd492f1a0ea60f673ffd460a356da5e693dc`.
- An unchanged copy lives at `../models/lm741.lib`; the same original block is embedded in both op-amp examples, with its copyright and legal notice preserved.
- The model's notice permits copying and distribution for free software support and prohibits resale of the model material. Its notice is also included in the frontend's `THIRD-PARTY.txt`.

The former mixed-device, nested-filter and LTspice-family inputs remain only in `scripts/fixtures/spice/` for parser/rendering regression coverage. They are excluded from the static site and from the built-in example catalog.
