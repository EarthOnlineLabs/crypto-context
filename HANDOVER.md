# CryptoContext 项目交接文档

> 最后更新：2026-05-27

## 当前状态：V1 已上线，验收中

**线上地址**：https://app-rho-jet-70.vercel.app

### ✅ 已完成并验证

| 功能 | 状态 | 验证方式 |
|------|------|----------|
| 用户注册/登录 | ✅ 正常 | 浏览器测试 |
| 邮箱确认流程 | ✅ 正常 | 实际注册测试 |
| Bitget 连接 | ✅ 正常 | 生产环境浏览器验证，portfolio 显示 $6,579 (BGB) |
| Portfolio 同步 | ✅ 正常 | Bitget 验证通过 |
| MCP 端点 | ✅ 部署 | 未做端到端 MCP 客户端测试 |
| 安全加固 | ✅ 已实施 | curl 验证安全头；代码审查通过 |
| 10 交易所支持 | ✅ 代码就绪 | 仅 Bitget 实际测试 |

### ⏳ 待验收

- [ ] 除 Bitget 外的其他 9 家交易所连接测试（需要各交易所 API key）
- [ ] MCP 端到端测试（在 Claude Desktop / Claude Code 中配置 MCP，调用 get_portfolio）
- [ ] MCP Token 生成和管理（dashboard 上创建/撤销 token）
- [ ] 多交易所同时连接时的 portfolio 聚合
- [ ] 匿名化权限级别测试
- [ ] 前端完整流程自测（注册→连接→查看portfolio→生成MCP token→MCP调用）

### 🔧 已知问题

1. **ENCRYPTION_KEY 敏感**：Vercel 环境变量必须精确 64 位 hex，设置时用 `printf '%s'` 不能用 `echo`（echo 会加换行符导致 66 字符）
2. **速率限制是内存级**：Vercel Serverless 每个实例独立，重启后重置。对 Hobby plan 足够，Scale 需要换 Redis
3. **get_context 工具**：V1 返回全量 portfolio，语义检索待 V1.1 实现

## 最近修复

### Bitget 连接失败（已修复）
- **根因**：Vercel 上 ENCRYPTION_KEY 环境变量被 `echo` 加了换行符（66 字符而非 64），导致 AES-256-GCM 加密失败
- **修复**：用 `printf '%s'` 重新设置环境变量
- **额外改进**：CCXT Bitget 实例加了 `broker: "ccxt"` 配置

### 安全加固（已完成）
- 新增 `src/lib/security.ts`：速率限制、输入校验、错误脱敏、安全响应头
- 所有 API 端点加了速率限制和输入校验
- 错误信息脱敏：不向客户端泄露原始 CCXT 错误
- 中间件注入 7 种安全响应头（CSP, HSTS, X-Frame-Options 等）

### Vercel 超时优化（已完成）
- connect 端点不再同步拉取 portfolio（拆分为两步）
- 各端点 `maxDuration`：connect 30s, portfolio 60s, MCP 60s

## 基础设施

| 服务 | 详情 |
|------|------|
| Vercel | Team: riks-projects-ff86846d, Project: app |
| Supabase | Project: crypto-context (ckviuhczbifmroggxfto), Region: us-east-1 |
| GitHub | https://github.com/0xrikt/crypto-context |
| 部署 | 推 main 分支自动部署（Vercel Git Integration） |

## 环境变量（Vercel Production + Preview）

| 变量 | 状态 |
|------|------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ 已设置 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ 已设置 |
| SUPABASE_SERVICE_ROLE_KEY | ✅ 已设置 |
| ENCRYPTION_KEY | ✅ 已修复（64 位 hex，production + preview） |

## 下一步

### 短期（验收完成）
- 用户验收剩余交易所连接
- MCP 端到端测试
- 确定产品正式名称和自定义域名

### 中期（V1.1）
- get_context 工具增加语义检索
- 支持用户自定义投资笔记/thesis
- portfolio 历史快照和趋势

### 长期（V2）
- DEX/链上资产支持
- 多用户共享 context（团队版）
- 更多 MCP 工具（交易历史、PnL 分析）
