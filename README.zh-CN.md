<div align="center">

<img src="skills/assets/Head.png" alt="Ship Faster" width="720" />

<br />

**大多数 AI 工具给你的是碎片。这给你的是一个过程。**

*从想法到部署——不丢失任何上下文。*

<br />

[📚 文档](./docs/) · [🗂️ 技能目录](./docs/skills-catalog.md) · [🛠️ 技能](./skills/) · [📦 模板](./templates/) · [⚡ 快速开始](#-快速开始)

<br />

[English](./README.md) | 简体中文

</div>

---

## 🤔 为什么选择 Ship Faster？

| 没有 Ship Faster | 使用 Ship Faster |
|------------------|------------------|
| 😩 Agent 执行到一半丢失上下文 | ✅ 每次运行写入磁盘 — **随时恢复** |
| 🔥 没有审计记录 | ✅ 完整日志 + 证据，支持 **回放/审查** |
| 💣 部署、数据库写入、支付有风险 | ✅ 危险操作前有 **审批门控** |
| 🎲 临时 prompt，输出不一致 | ✅ **可组合技能**，结构可预测 |

---

## 🎯 适合谁用？

- 🤖 **AI 编程代理**（Claude Code、Cursor、OpenCode 等）— 技能是主要接口
- 👨‍💻 **开发者** — 复制粘贴 prompt，审查产物，批准门控
- 👥 **团队** — 需要可复现、可审计的 AI 辅助开发流程

> 💡 这不是 CLI，不是 SaaS。只是一套 **复制到 agent 技能目录** 的文件。

---

## 🔗 兼容工具

- 代理：Claude Code、Cursor、OpenCode，以及任意支持 MCP 的 agent
- 默认技术栈假设：Next.js + TypeScript + Supabase + Stripe + Vercel

---

## ⚡ 快速开始

### 方式 A：只安装技能（10 秒）

```bash
# macOS / Linux
mkdir -p ~/.claude/skills
curl -L https://github.com/Heyvhuang/ship-faster/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=2 -C ~/.claude/skills ship-faster-main/skills/
```

<details>
<summary>🪟 Windows (PowerShell)</summary>

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.claude\skills" | Out-Null
$zip = "$env:TEMP\ship-faster-main.zip"
Invoke-WebRequest -Uri "https://github.com/Heyvhuang/ship-faster/archive/refs/heads/main.zip" -OutFile $zip
Expand-Archive -Path $zip -DestinationPath "$env:TEMP\ship-faster" -Force
Copy-Item -Recurse -Force "$env:TEMP\ship-faster\ship-faster-main\skills\*" "$HOME\.claude\skills\"
```

</details>

### 方式 B：克隆完整仓库（30 秒）

```bash
git clone https://github.com/Heyvhuang/ship-faster.git
cd ship-faster
cp -r skills/* ~/.claude/skills/
# 或运行模板: cd templates/001-copyback-studio && pnpm install && pnpm dev
```

### 方式 C：用 skills.sh 安装（npx）

```bash
# 列出技能
npx --yes skills add Heyvhuang/ship-faster --list

# 安装全部技能（Claude Code）
npx --yes skills add Heyvhuang/ship-faster --yes --agent claude-code

# 只安装一个技能
npx --yes skills add Heyvhuang/ship-faster --yes --agent claude-code --skill workflow-ship-faster
```

---

## 🚀 选择你的路径

| 场景 | Prompt |
|------|--------|
| 💡 **我有一个想法** | `Use workflow-project-intake` |
| 📦 **我有一个仓库** | `Use workflow-ship-faster` |
| 🎯 **我要做一个功能** | `Use workflow-feature-shipper` |
| 🎨 **我需要 UI/UX 方向** | `Use tool-design-style-selector` |

---

## 🔄 工作原理

<p align="center">
<img src="skills/assets/ship-faster-flow.png" alt="Ship Faster 工作流" width="780" />
</p>

每次运行都写入磁盘，支持 **回放/审计/恢复**：

```
runs/ship-faster/active/<run_id>/
├── proposal.md      # 为什么/做什么/范围
├── tasks.md         # 检查清单 [ ] → [x]（从这里恢复！）
├── context.json     # 开关（deploy/db/billing/seo）
├── evidence/        # 大型输出 / 审计记录
└── logs/            # 调试事件
```

> 📖 了解更多：[运行与审批](docs/concepts/runs-and-approvals.md)

---

## 🎮 Pixel Office Kit

<p align="center">
  <img src="assets/stage-office-demo.gif" alt="Pixel Office Kit — AI agent 像素办公室" width="720" />
</p>

<p align="center"><sub>自主 Agent · 日夜变化 · Canvas 渲染 — <a href="https://www.voxyz.space/vault"><b>Pro 版：实时交互 + 情绪系统 + 对话 + Matrix 特效 + OpenClaw 数据集成</b></a></sub></p>

---

## 🛠️ 技能（34）

可组合的工作流，复制到 `~/.claude/skills/`。

### 🔄 工作流
- ⚡ [workflow-ship-faster](skills/workflow-ship-faster/) — 端到端：想法 → 基础 → 设计 → 部署
- 📥 [workflow-project-intake](skills/workflow-project-intake/) — 头脑风暴 → 澄清 → 路由
- 🚀 [workflow-feature-shipper](skills/workflow-feature-shipper/) — PR 级别功能迭代
- 🧠 [workflow-brainstorm](skills/workflow-brainstorm/) — 一次一个问题 → 设计规格
- 📋 [workflow-execute-plans](skills/workflow-execute-plans/) — 批量执行 + 检查点
- 📤 [workflow-template-extractor](skills/workflow-template-extractor/) — 从真实项目提取模板
- 🌱 [workflow-template-seeder](skills/workflow-template-seeder/) — 从规格播种新模板

### 🔧 工具
- 🎨 [tool-design-style-selector](skills/tool-design-style-selector/) — 生成 design-system.md
- 🖌️ [tool-ui-ux-pro-max](skills/tool-ui-ux-pro-max/) — 配色 / 字体 / UX 查询
- 🔍 [tool-ast-grep-rules](skills/tool-ast-grep-rules/) — AST 代码搜索重写
- 🔎 [deep-research](skills/deep-research/) — 深度代码库研究（Explore 子代理隔离执行）
- 🧰 [tool-hooks-doctor](skills/tool-hooks-doctor/) — 检查/安装 Claude Code evolution hooks
- 🔐 [tool-better-auth](skills/tool-better-auth/) — Better Auth 集成指引
- 🧪 [tool-systematic-debugging](skills/tool-systematic-debugging/) — 以根因为先的调试流程
- 🧩 [tool-schema-markup](skills/tool-schema-markup/) — Schema / JSON-LD 指引
- 📈 [tool-programmatic-seo](skills/tool-programmatic-seo/) — Programmatic SEO（模板化规模页面）
- 📝 [tool-x-article-publisher](skills/tool-x-article-publisher/) — 发布到 X Articles
- 📣 [publish-x-article](skills/publish-x-article/) — 发布到 X Articles（别名）

### 🔎 审查
- ✅ [review-quality](skills/review-quality/) — 合并就绪 + 可维护性审计
- ⚛️ [review-react-best-practices](skills/review-react-best-practices/) — React/Next.js 性能规则
- 🔍 [review-seo-audit](skills/review-seo-audit/) — SEO 审计框架
- 🧹 [review-clean-code](skills/review-clean-code/) — Clean Code 原则分析
- 📄 [review-doc-consistency](skills/review-doc-consistency/) — 文档与代码一致性检查
- 🚦 [review-merge-readiness](skills/review-merge-readiness/) — 结构化 PR 审查

### 🔌 服务
- 🗄️ [supabase](skills/supabase/) — 数据库操作（审批门控）+ 内置 Postgres 最佳实践
- 💳 [stripe](skills/stripe/) — 计费操作，带确认门控
- ☁️ [cloudflare](skills/cloudflare/) — Workers / KV / R2 / D1

### 🔌 服务（MCP）
- 🗄️ [mcp-supabase](skills/mcp-supabase/) — Supabase MCP，带写入确认
- 💳 [mcp-stripe](skills/mcp-stripe/) — Stripe MCP 交易，带审批门控
- ☁️ [mcp-cloudflare](skills/mcp-cloudflare/) — Cloudflare MCP，带权限层级

### 🧬 元技能
- 🔄 [skill-evolution](skills/skill-evolution/) — 捕获上下文 → 生成补丁
- ✨ [skill-creator](skills/skill-creator/) — 从零创建新技能
- 🔧 [skill-improver](skills/skill-improver/) — 分析运行 → 改进技能
- 🔗 [workflow-creator](skills/workflow-creator/) — 从现有技能创建工作流链

> 📋 完整目录：[`docs/skills-catalog.md`](docs/skills-catalog.md) · [`skills/manifest.json`](skills/manifest.json)

---

## 📦 模板（7）

可运行的示例项目 — 演示 + 回归测试参考。

| | 模板 | 技术栈 | 描述 |
|:-:|:-----|:-------|:-----|
| 🎨 | [CopyBack Studio](templates/001-copyback-studio/) | Next.js + Supabase + R2 | AI 图像工作流 |
| 📊 | [UnitEconomics Console](templates/002-uniteconomics-console/) | Next.js | 商业指标仪表板 |
| 💰 | [MarginLedger](templates/003-marginledger/) | Vite + React | 利润率追踪器 |
| 📋 | [Kanban Load Mirror](templates/004-kanban-load-mirror/) | Vite + React | 任务负载均衡 |
| 📈 | [Multi-Store Daily Brief](templates/005-multi-store-daily-brief/) | Vite + React | 零售分析 |
| ❓ | [Ticket to FAQ](templates/006-ticket-to-faq/) | Vite + React | 工单 → FAQ 生成器 |
| 🏠 | [Elevate Move-in Booking](templates/007-elevate-move-in-booking/) | Vite + React | 预约调度 |

> 💡 仓库根目录 **不可运行**。请选择一个模板或对你自己的项目运行技能。

---

## 🎮 组件

独立 UI 组件 — 可嵌入你自己的项目。

| | 组件 | 技术栈 | 描述 |
|:-:|:----|:-------|:-----|
| 🏢 | [Pixel Office Kit](pixel-office-kit/) | Next.js + Canvas | AI agent 像素办公室 — 观看 agent 工作、走动和协作 |

<details>
<summary>预览：Pixel Office Kit</summary>
<br>
<p align="center">
  <img src="pixel-office-kit/public/stage-office-demo.gif" alt="Pixel Office Kit 演示" width="720" />
</p>
<p align="center"><sub>4 个 agent · 自主行为 · 日夜变化 — <a href="https://www.voxyz.space/vault"><b>Pro 版：6 agent + 情绪系统 + 对话 + Matrix 特效 + OpenClaw 数据集成</b></a></sub></p>
</details>

---

## 🔒 安全

- 永远不要提交密钥或 `.env.local` 文件
- 构建产物（`.next/`、`*.tsbuildinfo`）已被 gitignore
- 写操作（数据库、部署、支付）需要显式批准

---

## 📜 许可证

MIT 许可证 — 查看 [LICENSE](LICENSE)

---

<div align="center">

**由 [VoxYZ](https://voxyz.space) 制作**

*小步快跑，持续交付。*

链接：[Twitter](https://twitter.com/voxyz) · [GitHub](https://github.com/Heyvhuang)

</div>
