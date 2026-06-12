# CryptoContext 项目交接文档

> 最后更新：2026-06-12 ·（注意：本文件在公开仓库中，**不要写入任何真实余额/账户细节**）

## 当前状态：上线就绪（Launch-ready，已完成发布前打磨）

- **线上（canonical）**：https://cryptocontext.aiself.site —— 旧 Vercel 域名的人类页面 308 跳转到此；其 `/api/*` 仍然可用（不破坏既有 MCP 配置）
- **无需注册的公开演示**：https://cryptocontext.aiself.site/demo（全部为虚构数据）
- **GitHub**：https://github.com/0xrikt/crypto-context（MIT，公开）
- **MCP 端点**：`https://cryptocontext.aiself.site/api/mcp`（JSON-RPC 2.0，Bearer token）
- **Context 导出**：`GET /api/context/full`（cookie 或 Bearer 双鉴权，text/markdown）

## 2026-06-12 发布前打磨（本轮变更）

| 域 | 变更 |
|----|------|
| Context 正确性 | 资金流/手续费不再跨币种加总（按币种报告 + 主货币摘要）；交易量按计价货币分组（USD 稳定币聚合为 $，其他按币种标注）；"取不到历史"与"无活动"严格区分（unsupported/error/empty/partial 四态，写入文档与 metadata.dataStatus） |
| Context 完整性 | 新增 wallet_snapshots 兜底缓存（migration 0004，已应用到生产）——RPC 抖动降级为 cached 而非静默丢失整个 venue；全文 context 带 "Data Sources" 表（每源 live/cached/unreachable + 时间）；全部源失败时明确告知 AI"持仓未知≠零持仓" |
| Context 结构 | 文档开头加 AI 阅读指引 + Contents 行；画像带生成时间与来源标注；notes 晚于画像时向 AI 声明"以 notes 为准"，dashboard 同步提示 Regenerate |
| 看板 bug | Context Insights 按交易所分组并带名称标签（修复多账户两张同名无标卡片的混乱）；空状态压缩为单行；/api/context 返回 exchange/label |
| Copy full context | 预览改为全文滚动 + 分节清单（notes/profile/portfolio/trading/fund flow 各自 ✓/—），用户可在复制前确认无缺漏 |
| 品牌 | 新 logo "the aperture"（同心断弧+核心点；favicon/apple-icon/OG 全套更新），统一 `src/components/Logo.tsx` |
| 着陆页 | 视觉全面升级（文案与结构不变）：blueprint 网格、墨色证言终端与代码块、venue 跑马灯（16 exchanges · 8 chains）、连接线步骤卡、衬线体宣言、墨色 CTA 终章；hero 入场动画；移动端验证通过 |
| 宣发物料 | launch/ 全套与产品事实重新对齐：16 exchanges/8 chains；移除一切 "no LLM" 表述（数字确定性计算 + 可选 LLM 仅读聚合事实写画像叙述）；运行手册加 2026-06-12 修订记录与下一个 HN 窗口（Jun 16–18 Tue–Thu, 8–10am ET） |
| 品牌识别（第二批） | `src/components/icons/BrandLogo.tsx`：16 交易所 + 8 链 + 11 钱包 app 的统一 app-icon 风格内联 SVG（官方色块 + 几何 mark / 品牌色首字母，未知 id 降级 monogram）。落地页加 "Works with what you already use" logo 墙 + 带 logo 的 ticker；交易所连接表单换 logo 网格选择器；Context Insights 分组头带交易所 logo |
| 钱包品牌优先导入（第二批） | 心智模型从"链+地址"换成"我的 MetaMask"：品牌选择网格 → 贴地址 → POST /api/wallet/scan 并行探测 7 条 EVM 链余额 → 预勾选有钱的链一键全加（multi 生态品牌给 EVM+Solana 双输入框；保留 Other 原始路径）。存储模型不变（仍是 address+chain 行，零 migration）。Data Sources 卡片按 (brand, address) 分组（一卡=一个钱包账户，链为 chip），整组删除一次确认；context 数据源标签带品牌（如 "ethereum:0x36…dcc3 (metamask)"） |
| 真实 logo 资产（第三批） | **铁律：第三方品牌标一律用权威真实资产，绝不手绘**（教训见 tasks/lessons.md）。public/brands/ 32 个（交易所=CoinGecko 官方资产库；钱包=项目方 GitHub 官方头像；链=原生币标，Base 用 base-org）+ public/tokens/ 151 个币标（CoinGecko top150+平台币），全部本地打包零运行时依赖；清单在 src/lib/brand-assets.ts。BrandLogo 渲染真图（白底 tile 统一观感），未知 id 降级 monogram；新增 TokenIcon 用于 Holdings 表与 Allocation 图例 |

## 功能全景（全部已上线并在生产验证）

| 域 | 内容 |
|----|------|
| 数据源 | 16 家交易所（CCXT，只读 key，OKX/Bitget/KuCoin 需 passphrase）；8 条链钱包（7 EVM + Solana 全 SPL） |
| Context | 持仓/集中度/交易模式/资金流（确定性计算，按币种诚实呈现）+ 数据源新鲜度表 + GLM 投资者画像（语言跟随笔记）+ 用户策略笔记（/dashboard/notes）+ 画像过期提示 |
| 分发 | MCP（get_portfolio / get_context）· 一键复制全文（带分节清单）· 可下载 skill（crypto-context.zip，token 走环境变量） |
| 性能 | 所有源并行抓取 + 每源超时（交易所 20s / 钱包 15s）+ 双层快照兜底（snapshots + wallet_snapshots，成功时回写）+ 交易所批量行情 |
| 认证邮件 | Resend 自有域名发信（mail.earthonline.site），全部模板品牌化（emerald），链接走 canonical 域名 |
| 安全 | AES-256-GCM 密钥加密、RLS、token sha256、限流（含 /api/profile）、auth 错误脱敏、open-redirect 防护 |
| SEO/分享 | OG/Twitter 卡片（墨色新版）、新 icon/apple-icon、robots/sitemap、canonical、主题色 |

## 关键文件

- `src/lib/context-assembler.ts` —— context 装配单一事实源（MCP 与 /api/context/full 共用；含每源状态跟踪与双层快照兜底）
- `src/lib/context.ts` —— 文档拼装（阅读指引 → 用户笔记 → AI 画像[+过期警示] → 组合[+Data Sources] → 交易/资金流）
- `src/lib/generators/` —— trading-profile / fund-flow（dataStatus 四态；按币种计算）、investor-profile（GLM，语言跟随笔记）
- `src/components/Logo.tsx` —— 品牌标记单一来源（aperture mark + wordmark）
- `src/components/demo/` —— /demo 与 /dev/preview 共用的虚构数据演示壳
- `launch/` —— 发布物料（已与产品事实对齐；READ ME 内有修订记录）
- `migrations/` —— 0001 投资者画像、0002 钱包品牌、0003 策略笔记、0004 钱包快照（均已应用到生产）

## 待办

1. 发布执行：见 `launch/README.md` 运行手册——下一个 HN 窗口 **Jun 16–18（Tue–Thu）8–10am ET**；Day-0 目录提交可提前任意一天做。
2. 发布前最后一步：在生产 /demo 重拍一张干净的 transcript 截图备用（落地页墨色证言区截图效果好）。

## 已知限制（发布后 backlog）

- 限流为单实例内存版（当前规模可用；规模化换 Redis/Upstash）
- 仅现货余额（无合约持仓）；行情依赖交易所 ticker + CoinGecko
- MCP token 无过期/last-used 审计（revoke 可用）
- 测试：vitest 52 个单测覆盖纯逻辑（security/context/brands/profile-facts/generators）；无 E2E
- ESLint 存量 7 个 error（react-hooks 新规则对旧组件的告警，先于本轮存在；Vercel 构建不受影响）
