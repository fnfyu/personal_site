# 个人全能主页 (Personal Hub)

这是一个基于 Next.js 14、Tailwind CSS 和 React 构建的现代个人门户。它集成了个人主页、游戏库同步、AI 助手和无限扩展功能，专为极客与玩家设计。

## 核心功能
- **个人主页**: 现代简约的响应式设计，动态效果丰富。
- **游戏库**: 
  - 支持 Steam API 自动拉取（名称、封面、时长）。
  - 支持手动录入 Epic 或其他平台游戏。
  - 支持评分、通关状态标记、标签管理。
- **AI 助手**: 集成大模型 API，支持智能对话与助手功能。
- **一键部署**: 专为 Vercel 优化，支持零代码一键上线。

---

## 🚀 部署与配置教程

### 1. 部署到 Vercel (零代码)
1. 将此项目上传到你的 GitHub 仓库。
2. 登录 [Vercel](https://vercel.com/)。
3. 点击 **Add New** -> **Project**，导入你的仓库。
4. 在 **Environment Variables** (环境变量) 中添加以下配置（可选，部署后再配也可以）：
   - `STEAM_API_KEY`: 你的 Steam API Key (获取方式见下文)。
   - `AI_API_KEY`: 你的 AI 模型 API Key (如 OpenAI/Gemini)。
   - `AI_API_ENDPOINT`: (可选) API 代理地址。
5. 点击 **Deploy**，等待上线。

### 2. 获取 Steam API Key
1. 访问 [Steam API Key 申请页面](https://steamcommunity.com/dev/apikey)。
2. 登录 Steam 账号。
3. 在 "Domain Name" 随便填一个域名（如 `mysite.com`）。
4. 复制生成的 **Key** 到 Vercel 的环境变量 `STEAM_API_KEY`。
5. 在网站前台同步时，输入你的 **Steam ID (64位)**。你可以在 Steam 个人资料页面的 URL 中找到它，或使用在线工具查询。

### 3. Epic 游戏同步方案
由于 Epic Games 官方目前没有开放类似 Steam 的公开 Web API，目前的同步方案如下：
- **手动导入**: 建议在游戏库中使用“手动录入”功能，输入名称与封面 URL。
- **自动获取封面**: 项目已内置自动抓取逻辑，输入名称后系统会尝试从公共图库获取封面。
- **后续扩展**: 未来可支持导入 Epic 导出的 CSV 数据或通过插件同步。

### 4. 配置 AI 助手
1. 获取 OpenAI 或其他兼容接口的 API Key。
2. 在 Vercel 环境变量中设置 `AI_API_KEY`。
3. 如果使用中转接口，请设置 `AI_API_ENDPOINT`。
4. 重新部署或在 Vercel 控制台触发重新生效。

---

## 🛠️ 技术栈
- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Framer Motion (动画)
- **图标**: Lucide React
- **部署**: Vercel

---

## 🎨 未来扩展建议
你可以根据 `src/app/extensions/page.tsx` 中的清单继续开发：
- **博客系统**: 新建 `src/app/blog`。
- **工具箱**: 新建 `src/app/tools`。
- **数据面板**: 集成 GitHub API 展示活跃度。

---

## ⚠️ 免责声明
本项目仅供个人学习与使用。Steam API 数据遵循 Valve 相关条款。 AI 回复由第三方模型提供。
