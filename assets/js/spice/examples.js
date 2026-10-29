import filter from './examples/filter.cir?raw';
import amplifier from './examples/common-emitter.cir?raw';
import follower from './examples/emitter-follower.cir?raw';
import sallen from './examples/sallen-key.cir?raw';
import instrumentation from './examples/instrumentation-amplifier.cir?raw';

export const examples={
  filter:{source:filter,description:'Series R–L / shunt C low-pass with a resistive load; illustrative component values.',url:'https://circuits.mit.edu/S26/psets/12/series_filters',reference:'MIT 6.200, Series RLC: Filters'},
  amplifier:{source:amplifier,description:'Voltage-divider biased common-emitter amplifier.',url:'https://wiki.analog.com/university/courses/electronics/text/chapter-9',reference:'Analog Devices, chapter 9.2'},
  follower:{source:follower,description:'Common-collector emitter follower.',url:'https://wiki.analog.com/university/courses/electronics/text/chapter-9',reference:'Analog Devices, chapter 9.4'},
  sallen:{source:sallen,description:'Unity-gain Sallen–Key low-pass. Expand XU1 to inspect the official LM741 macromodel.',url:'https://www.ti.com/lit/an/sloa024b/sloa024b.pdf',reference:'TI SLOA024B'},
  instrumentation:{source:instrumentation,description:'Three-op-amp instrumentation amplifier. Open XINA → XINPUT / XDIFF → XU1 / XU2 / XU3 to inspect each LM741 macromodel.',url:'https://www.ti.com/lit/an/sboa282a/sboa282a.pdf',reference:'TI SBOA282A topology, adapted with LM741'},
};
