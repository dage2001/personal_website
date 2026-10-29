# Built-in classic circuit examples

The viewer offers five named circuit examples rather than a mixed device-family demonstration. Netlists are self-contained: paste one into the editor or open the `.cir` file without adding an external library.

| Example | Topology and source | Adaptation |
| --- | --- | --- |
| `filter.cir` | Capacitor-output series RLC low-pass, [MIT 6.200, Series RLC: Filters](https://circuits.mit.edu/S26/psets/12/series_filters) | Illustrative R/L/C values and a 1 kΩ output load |
| `common-emitter.cir` | Divider-biased common-emitter amplifier, [Analog Devices chapter 9.2](https://wiki.analog.com/university/courses/electronics/text/chapter-9) | Illustrative component values and a simple NPN model |
| `emitter-follower.cir` | Common-collector emitter follower, [Analog Devices chapter 9.4](https://wiki.analog.com/university/courses/electronics/text/chapter-9) | Illustrative component values and a simple NPN model |
| `sallen-key.cir` | Unity-gain Sallen–Key low-pass, [TI SLOA024B, section 3](https://www.ti.com/lit/an/sloa024b/sloa024b.pdf) | R1=R2=10 kΩ, C1=C2=10 nF; 20-BJT 741-style teaching circuit |
| `instrumentation-amplifier.cir` | Three-op-amp instrumentation amplifier, [TI SBOA282A](https://www.ti.com/lit/an/sboa282a/sboa282a.pdf) | Reference resistor ratios, LM741 in place of TLV171; explicit nested input/difference stages |

The Sallen–Key example has ideal natural frequency 1/(2πRC) ≈ 1.59 kHz and Q=0.5. The instrumentation amplifier's ideal gain is 1+2×10 kΩ/2.21 kΩ ≈ 10.05. These are topology calculations, not measured or simulated device performance.

## Op-amp hierarchy

In `instrumentation-amplifier.cir`, open:

1. `XINA` — the complete instrumentation amplifier.
2. `XINA/XINPUT` — two input amplifiers and the gain-setting network; or `XINA/XDIFF` — the difference output stage.
3. `XINA/XINPUT/XU1`, `XINA/XINPUT/XU2`, or `XINA/XDIFF/XU3` — the transistor-level 741 internal circuit.

The definition `LM741_TL` contains **20 BJTs, 11 resistors and one 30 pF compensation capacitor**; no dependent/behavioral sources, ideal gain blocks or ideal bias current sources occur inside it. Its port order is **IN_P, IN_N, PWR_VCC, RET_VEE, OUT_SIG, IO_NULL1, IO_NULL5**, corresponding to package pins **3, 2, 7, 4, 6, 1, 5**. The offset-null pins are exposed and left externally unconnected in these examples.

## Transistor-level provenance and scope

The connectivity and passive values are independently transcribed from the internal schematic supplied in the discussion and [TI LM741 datasheet, section 7.2](https://www.ti.com/lit/ds/symlink/lm741.pdf). That drawing repeats Q15 and leaves the VBE multiplier unnumbered; this transcription names the gain input follower Q16 and the VBE multiplier Q18, retaining Q15 for output current limiting. The drawing is a simplified internal topology, not a complete die extraction.

`../models/lm741-transistor.lib` is embedded in both examples. The old manufacturer behavioral macromodel is removed from the examples and public model directory. The new NPN/PNP device parameters are generic teaching parameters, **not manufacturer-calibrated LM741 parameters**. They are suitable for inspecting transistor topology, not for qualifying hardware or claiming datasheet accuracy.

Each IC definition has its own scoped layout comments: differential input, bias reference, gain/compensation and output. Supply and return interfaces are above and below those groups. Opening an IC uses its own constraints and never inherits the application's outer hierarchy constraints. The same source works without a viewer because these are ordinary SPICE comments.

Local LTspice 24.1.9 sanity checks: follower outputs for inputs -100/0/+100 mV were -99.606/+0.393/+100.391 mV; supply current approximately 1.69 mA. At 100 Hz, the Sallen-Key gain magnitude was 0.99604 and instrumentation gain 10.0481, both non-inverting. These limited DC/AC checks are not a full bandwidth, slew, noise, protection or stability characterization.

Run the optional development-only check with `LTSPICE_EXE` set, using `node scripts/test-spice-741-native.mjs`. The browser has no simulator dependency. Sallen-Key has 40 primitive devices; the three-op-amp example has 110. Each IC internally has 32 primitives plus seven interface markers.

The former mixed-device, nested-filter and LTspice-family inputs remain only in `scripts/fixtures/spice/` for parser/rendering regression coverage. They are excluded from the static site and from the built-in example catalog.
