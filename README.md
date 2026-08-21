# M0Desk

M0Desk 是一个面向个人与多账号场景的个人工作台，用来统一管理项目、任务、知识、资料和临时想法。

在线地址：[https://secretary-lime.vercel.app](https://secretary-lime.vercel.app)

## 功能

- **今日总览**：查看今日任务、逾期任务、近期项目截止日期和收件箱内容。
- **项目管理**：记录目标、优先级、截止日期、当前阶段和下一步行动。
- **任务管理**：按状态、项目和优先级筛选，支持一键完成和逾期提醒。
- **知识库**：使用 Markdown 整理知识，支持分类、标签、状态和搜索。
- **资料库**：收藏论文、代码仓库、课程、视频和其他外部资料。
- **收件箱**：快速记录内容，并转换为任务、项目、知识或资料。
- **全局搜索**：使用 `Ctrl/Cmd + K` 搜索全部内容。
- **多用户隔离**：云端模式使用 Supabase Auth 与 RLS，每个账号只能访问自己的数据。
- **双后端**：本地使用 SQLite，云端使用 Supabase Postgres。
- **响应式界面**：支持桌面端和移动端，以及深色、浅色和跟随系统主题。

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS v4、shadcn/ui
- Supabase Postgres、Auth、Row Level Security
- Node.js 内置 SQLite
- Vercel

## 本地运行

需要 Node.js 22.5 或更高版本，推荐 Node.js 24。

```bash
npm install
npm run dev
```

启动后打开终端中显示的本地访问地址。

不配置 Supabase 环境变量时，应用自动使用本地 SQLite，数据保存在 `data/m0desk.db`。该文件不会提交到 Git。

## 使用 Supabase 云端模式

将 `.env.example` 复制为 `.env.local`，填写：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

在 Supabase SQL Editor 中依次执行：

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_multi_user_hardening.sql`

只使用 Supabase publishable key，不要在客户端或普通部署环境中配置 `service_role` key。

## 部署

在 Vercel Production 环境中设置：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
```

`NEXT_PUBLIC_APP_URL` 应填写稳定的正式域名，然后执行：

```bash
npx vercel --prod
```

同时在 Supabase Authentication 的 URL Configuration 中配置相同的 Site URL，并允许 `/auth/callback` 回调地址。

## 数据与隐私

- 本地模式的数据只保存在当前电脑的 SQLite 文件中。
- 云端模式通过 Supabase RLS 按账号隔离数据。
- 项目不会提交 `.env.local`、cookie、本地数据库或真实密钥。
- 设置页可以将当前账号的数据导出为 JSON。

## 项目结构

```text
src/app/                 页面和路由
src/components/          页面组件和通用 UI
src/lib/db/              SQLite 与 Supabase 数据访问层
src/lib/actions/         Server Actions
src/lib/supabase/        Supabase 客户端
src/proxy.ts             登录边界
supabase/migrations/     Postgres 数据库迁移
```

## License

[MIT](LICENSE)
