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

## v11: paired placement and net-tree simplification

Three-pin BJT differential branch pairs within one explicit scope now use invisible atomic placement tiles. ELK sees the true pin coordinates and routes the tile; the two original devices and original edge identities are restored before drawing. Pair base pins face outward. No proxy wires, extra schematic block or electrical device is exported. Four-pin devices and cross-scope pairs retain the earlier soft handling.

Small classic sheets test each free transistor mirror through an actual layout. Bounded coordinate-improvement sweeps update their baseline immediately after accepting a better result. Pair pins are locked, so a single-device candidate cannot undo pair placement. The report exposes `pairConstraints`, `orientationDevicesTested` and actual mirrored device identities.

`net-shortcuts.js` optimizes existing routed net trees before both SVG and ASC capture: branch junctions can slide onto a clear same-net spine, and short staircases can lose an unnecessary elbow. Fixed pins, voltage rails and straight multi-pin spines remain protected. Foreign endpoints/T contacts and symbol interiors are obstacles; clean interior crossings do not join nets. The pass is bounded and is not a general router. See `scripts/test-spice-layout-v11.mjs` for direct-branch, staircase, obstacle, crossing, scope and 741 regressions.


## v12: 双管电流镜进入硬约束放置

识别结果不变。与差分对共用不可拆分放置单元；双管电流镜按 reference / output 顺序并排，B/G 相向。差分对拥有重叠优先级；低置信度、多输出、跨显式区域的电流镜继续使用软偏好。LM741 的 Q8/Q9、Q5/Q6、Q11/Q10 并排，Q12/Q13 因跨 BIAS/OUTPUT 区域不强制配对。辅助 Q7 不纳入 Q5/Q6 的单元。


## v13: 声明优先与跨区域镜

有 `pair` 注释的页面调用 `declaredTransistorMotifs`，校验指定器件形成的局部结构，禁止静默退回全图搜索。没有声明则继续使用原识别器。声明与自动匹配结果通过同一个 adapter 与 cache 路径，不改变连接或引脚身份。`origin: annotation` 标记用于审查。

LM741 已内嵌六条结构声明与八个自由晶体管的 `face`。Q12/Q13 跨 BIAS/OUTPUT 区域以 B 极同排约束求解；其余三个镜和两对差分支路仍相邻。VBE 倍增器是已声明结构，仍为局部方向与邻近偏好。


## v14：级联、互补双管与镜控制网

新增 `darlington-pair`、`sziklai-pair`、`cascode-pair`、`push-pull-pair`，覆盖注释校验、无注释自动识别、adapter 与规范化缓存。新类型的 driver/output 或 upper/lower 角色均显式重映射。双管并非一律同排：前三者在同作用域内使用紧凑错层模板，推挽射随结构保留软偏好。歧义、未知极性或不匹配连线不作为高置信度模板使用。

LM741 的 Q16/Q17 显式声明为 Darlington，Q14/Q20 与 R9/R10 显式声明为互补推挽；Q16/Q17 的 B 均朝左。镜及差分结构优先处理重叠。复杂整图新模板无法安全恢复电源轨时保留原有经典布局并报告 `compoundPairFallback`。

跨区域电流镜之前仅约束 B/G 同高，仍沿旧区域边界绕行。对真实同网、同高的镜控制极增加无长度上限的直连候选，并优先处理这些网；候选必须通过符号避障、异网终端/接触和全端点连接检查。一般局部捷径仍保留原 240 单位上限。修正同时写回 SVG 与 ASC 的公共图形数据。


## v15：配对邻近与视觉区域

结构识别及注释语法不变。新增布局适配层的 `compactPairGroups`，对同一真实实例、同级 row 的 classic 区域尝试配对重归属。Q13 从 OUTPUT 的布局区域临时迁到 BIAS，与 Q12 同排相邻；电气 IR 与原声明仍保留原值。重归属记录的器件 ID 通过 renderer 还原为真实实例名称。

`pairProximity` / `pairSeparationPenalty` 覆盖所有高置信度 `motifPairs`，包括软推挽和跨区域镜。`pairConstraints[].compacted` 与 `pairCompactions` 表示实际完成；不满足公共供电轨或经典区域检查时返回原布局并记录原因。
