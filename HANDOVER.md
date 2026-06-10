# CryptoContext 项目交接文档

> 最后更新：2026-06-10 ·（注意：本文件在公开仓库中，**不要写入任何真实余额/账户细节**）

## 当前状态：上线就绪（Launch-ready）

- **线上（canonical）**：https://cryptocontext.aiself.site —— 旧 Vercel 域名的人类页面 308 跳转到此；其 `/api/*` 仍然可用（不破坏既有 MCP 配置）
- **无需注册的公开演示**：https://cryptocontext.aiself.site/demo（全部为虚构数据）
- **GitHub**：https://github.com/0xrikt/crypto-context（MIT，公开）
- **MCP 端点**：`https://cryptocontext.aiself.site/api/mcp`（JSON-RPC 2.0，Bearer token）
- **Context 导出**：`GET /api/context/full`（cookie 或 Bearer 双鉴权，text/markdown）

## 功能全景（全部已上线并在生产验证）

| 域 | 内容 |
|----|------|
| 数据源 | 16 家交易所（CCXT，只读 key，OKX/Bitget/KuCoin 需 passphrase）；8 条链钱包（7 EVM + Solana 全 SPL） |
| Context | 持仓/集中度/交易模式/资金流（确定性计算）+ GLM 投资者画像（中文笔记→中文画像）+ 用户策略笔记（/dashboard/notes） |
| 分发 | MCP（get_portfolio / get_context）· 一键复制全文 · 可下载 skill（crypto-context.zip，token 走环境变量） |
| 性能 | 所有源并行抓取 + 每源超时（交易所 20s / 钱包 15s）+ 交易所快照兜底（snapshots 表，成功时回写缓存）+ 交易所批量行情（fetchTickers 一次取价） |
| 认证邮件 | Resend 自有域名发信（mail.earthonline.site，已验证、无限速），全部模板品牌化（emerald），链接走 canonical 域名 |
| 安全 | AES-256-GCM 密钥加密、RLS、token sha256、限流（含 /api/profile）、auth 错误脱敏、open-redirect 防护、API key 校验放行 base64 字符 |
| SEO/分享 | 完整 OG/Twitter 卡片（生成式 OG 图）、icon/apple-icon、robots/sitemap、canonical、主题色 |

## 关键文件

- `src/lib/context-assembler.ts` —— context 装配单一事实源（MCP 与 /api/context/full 共用）
- `src/lib/context.ts` —— 文档拼装（顺序：用户笔记 → AI 画像 → 组合 → 交易/资金流）
- `src/lib/generators/investor-profile.ts` —— GLM 画像（语言跟随用户笔记）
- `src/components/demo/` —— /demo 与 /dev/preview 共用的虚构数据演示壳
- `auth-templates/` —— 认证邮件模板（build-templates.py 为源头，推送经 Supabase Management API）
- `launch/` —— 发布物料（Show HN / Twitter / Reddit / MCP 目录提交），URL 已全部切到 canonical
- `migrations/` —— 0001 投资者画像、0002 钱包品牌、0003 策略笔记（均已应用到生产）

## 待办（人工，唯一阻塞项）

1. **GitHub 仓库元数据**：本机 `gh` 登录的是 EarthOnlineDev（无 0xrikt 仓库管理权，HTTP 404）。请以 **0xrikt** 身份运行：
   ```bash
   gh repo edit 0xrikt/crypto-context \
     --description "Give any AI agent your real crypto portfolio via MCP. Unifies every exchange + wallet + your strategy into one context. Open source, read-only, \$0." \
     --homepage "https://cryptocontext.aiself.site" \
     --add-topic mcp --add-topic model-context-protocol --add-topic crypto \
     --add-topic portfolio --add-topic ai-agents --add-topic claude
   ```
2. 发布时间窗（HN 周二-周四，US 上午）见 `launch/README.md`。

## 已知限制（发布后 backlog）

- 限流为单实例内存版（当前规模可用；规模化换 Redis/Upstash）
- 仅现货余额（无合约持仓）；行情依赖交易所 ticker + CoinGecko
- MCP token 无过期/last-used 审计（revoke 可用）
- 测试：vitest 单测覆盖纯逻辑（security/context/brands/profile-facts）；无 E2E
