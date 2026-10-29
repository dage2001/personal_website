# ASC 导出

ASC 与 SVG 共用选中的布局结果。运行时完全在浏览器内完成，不调用 LTspice、Weave、服务器或外部符号库。

## 数据流

1. Parser / Hierarchical IR / adapter 保持原有职责。
2. 渲染 worker 在候选布局确定后保留独立 Drawing IR：元件位置、真实端口坐标、网络编号和正交线段。SVG 继续走现有 netlistsvg 路径。
3. 布局缓存同时保存 Drawing IR；恢复缓存时一并恢复实例名称和网络编号。缩放和平移不影响导出坐标。
4. 点击 ASC 下载后才加载导出模块。ASC exporter 使用 Drawing IR 与当前电气投影，不重新布局，也不从 SVG 路径反推电路。
5. 回读生成的 ASC 和 ASY，检查元件、值、前缀、端口顺序、导线连通和不同网络间短接；检查失败时不给出成功下载。

## 下载

- **Download ASC**：下载 `spice-schematic.asc`。此文件包含器件实例、实际导线、网名和仿真指令；仍须配套符号文件。
- **ASC bundle**：下载 ZIP，包含同一 ASC、自生成的 `cv_symbol_*.asy`、`manifest.json`、原始 `source.cir`、上传库的原文与使用说明。全部解压到同一目录后打开 ASC。

ASC 格式不能内嵌任意 ASY。为准确保留当前图中的任意端口数量和端口位置，所有电气符号均由本地规则生成并随 ZIP 提供，不要求用户安装某个版本的厂商符号库。符号是可编辑的本地简化表示，外形不承诺与 SVG 逐像素一致。磁耦合 K 按 LTspice 原生方式作为 SPICE 文本语句保留。

使用兼容的 **Version 4、CRLF、Windows-1252**。注释中超出该编码的字符以 Unicode 码点注解表示；原文保存在 UTF-8 的 source.cir / source-libraries 中。电气值中无法编码的字符直接报错，避免静默改变模型或表达式。

## 布局和语义

- 将 ELK 坐标映射到 16 单位格点。映射保持各坐标轴上的相对顺序，并为不同轨道保留至少一个格点的距离，避免独立四舍五入造成短接。不运行第二套布局算法。
- 使用既有同网几何简化器清理重复线段，保留实际连线。一张连通网只放一个命名 FLAG，不在每个引脚重复标签。
- 顶层器件、简单节点尽量保留原名；展开后的器件使用带实例路径的唯一名称。manifest 保存完整原名、导出名、端口和叶器件对应表。
- 折叠块采用按实例绑定的 `.subckt` 定义，包含全部内部叶器件。完全或选择性展开时，相应器件直接出现在本页。打开内部页后导出的是当前页；内部页不是带有顶层激励的完整测试台。
- 实例参数和局部模型按作用域绑定；顶层参数仍作为符号参数保留，使 `.step param` 不会冻结在初始值。POLY 电压控制端按 LTspice Epoly/Gpoly 方式写入 Value，并保留对应的可视连线。
- 局部 `.ic` / `.nodeset` 提升为作用于唯一节点和器件名的顶层约束。厂商模型版权注释随 ASC 与来源文件保留。
- 导出检查针对当前 SVG 的电气投影。输入 parser 的警告也进入导出清单；不能据此把原本带有未支持语法的输入称为完整电路。
- 暂不能可靠迁移的局部 `.func`、其他局部指令或从折叠块内部跨到另一块的内部探针会明确拒绝导出，保留当前 SVG；不会静默删去指令。跨块内部探针可先在查看器展开相应实例，再导出。带模式的探针通配符（除单独 `*`）及指令中的字面 `\n` 也会报错，避免改名或 ASC 文本转义改变语义；文件路径可使用正斜杠。关闭 **Circuit layout rules** 时未生成 Drawing IR，ASC 按钮不可用。

## 验证

`npm run test:spice` 包含 ASC 回读、逐引脚原始拓扑对照、篡改器件值/人为短路拒绝、参数扫描及嵌套/选择性展开测试。

本地私有验收（输入不随网站发布）：

```powershell
$env:SPICE_ASC_PRIVATE='tmp/01_cluster_three_VDPO.annotated.cir'
node --test scripts/test-spice-asc.mjs
```

可选原生集成测试，需要本地安装 LTspice，仅用于开发验收：

```powershell
$env:LTSPICE_EXE='D:/Applications/LTSpice/LTspice.exe'
node scripts/test-spice-asc-native.mjs filter common-emitter emitter-follower sallen-key instrumentation-amplifier expanded-sallen private-collapsed private-expanded private-focused all-prefixes
```

原生对照显式检查并规范化 LTspice 自动添加的 BJT 接地衬底、MOS 源体连接；只有与原隐式连接一致时才视为等价。原生网表读取成功与拓扑一致，不代表已验证原电路的振荡、增益或稳定性。

本机 LTspice 24.1.9 完成十组原生端口对照：五个公开示例、展开 LM741、全部元件族，以及 VDPO 的折叠、展开和 Colpitts 内部页。另以最小工作点电路验证顶层访问子电路内部的电压/电流探针可求解。`§` 是原生网表的显示标记，不写进实际层级探针路径。

格式及验证思路参考：[Weave](https://github.com/senolgulgonul/weave)、[ADI ASC 参考](https://github.com/analogdevicesinc/ltspice-reference/blob/main/ai_ref/SCHEMATIC-REFERENCE.md)。本实现独立使用本项目的布局、命名、语义和符号生成规则，未引入 Weave 布局或符号表。
