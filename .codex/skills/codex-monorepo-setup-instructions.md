# Codex 指示書: React + Vite 複数アプリ / Express API / ESM統一モノレポ環境構築

## 目的

TypeScript / React / Vite / Express / PostgreSQL を前提とした、転職用ポートフォリオ向けのモノレポ環境を構築してください。

Next.js は今回は含めません。

複数の React + Vite アプリを `apps/` 配下に分けて管理し、1つのデプロイ先で複数アプリを公開できる構成にします。

例:

```txt
https://example.com/
  → portal

https://example.com/app1/
  → app1

https://example.com/notion-todo-pomodoro/
  → notion-todo-pomodoro

https://example.com/api/
  → Express API
```

## 技術方針

- パッケージマネージャーは npm workspaces を使う
- TypeScript を使う
- CommonJS は使わず、ESM に統一する
- 各 `package.json` に `"type": "module"` を設定する
- import 時に `.ts` / `.tsx` / `.js` 拡張子は書かない
- React アプリは Vite を使う
- バックエンドは Express + TypeScript を使う
- API は tsup で ESM バンドルして Node.js で実行する
- UI は shadcn/ui を `packages/ui` に集約する
- 共通型・共通schema・共通utilityを `packages/` に分離する
- 認証は将来的に Express API 側で共通化できる設計にする
- DB は将来的に PostgreSQL / Prisma を使える構成を想定する

---

# 完成させたいディレクトリ構成

以下の構成を作成してください。

```txt
portfolio-monorepo/
  package.json
  tsconfig.base.json
  .gitignore
  README.md

  apps/
    portal/
      package.json
      tsconfig.json
      vite.config.ts
      index.html
      src/
        main.tsx
        App.tsx
        index.css
        pages/
          HomePage.tsx
          LoginPage.tsx
          LogoutPage.tsx
        routes/
          router.tsx

    app1/
      package.json
      tsconfig.json
      vite.config.ts
      index.html
      src/
        main.tsx
        App.tsx
        index.css
        app/
          router.tsx
        features/
          example/
            components/
              ExampleCard.tsx
            pages/
              ExamplePage.tsx

    notion-todo-pomodoro/
      package.json
      tsconfig.json
      vite.config.ts
      index.html
      src/
        main.tsx
        App.tsx
        index.css
        app/
          router.tsx
        features/
          example/
            components/
              ExampleCard.tsx
            pages/
              ExamplePage.tsx

    api/
      package.json
      tsconfig.json
      tsup.config.ts
      src/
        index.ts
        app.ts
        routes/
          health.routes.ts
        middleware/
          errorHandler.ts

  packages/
    ui/
      package.json
      tsconfig.json
      components.json
      src/
        index.ts
        lib/
          utils.ts
        components/
          ui/
            button.tsx
            card.tsx
        styles/
          globals.css

    types/
      package.json
      tsconfig.json
      src/
        index.ts

    schemas/
      package.json
      tsconfig.json
      src/
        index.ts

    utils/
      package.json
      tsconfig.json
      src/
        index.ts
```

---

# ルート package.json

ルートの `package.json` を作成してください。

要件:

- `private: true`
- `type: "module"`
- npm workspaces を使う
- 各アプリをルートから起動できる script を用意する
- 全体の typecheck / build を実行できる script を用意する

例:

```json
{
  "name": "portfolio-monorepo",
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:portal": "npm run dev -w apps/portal",
    "dev:app1": "npm run dev -w apps/app1",
    "dev:notion-todo-pomodoro": "npm run dev -w apps/notion-todo-pomodoro",
    "dev:api": "npm run dev -w apps/api",
    "build:portal": "npm run build -w apps/portal",
    "build:app1": "npm run build -w apps/app1",
    "build:notion-todo-pomodoro": "npm run build -w apps/notion-todo-pomodoro",
    "build:api": "npm run build -w apps/api",
    "build": "npm run build --workspaces",
    "typecheck": "npm run typecheck --workspaces"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

---

# ルート tsconfig.base.json

全パッケージ共通の TypeScript 設定です。

重要:

- ここでは `module` と `moduleResolution` は指定しない
- React/Vite と Express/API で最適値が異なるため、各パッケージ側で指定する
- パスエイリアスは `@repo/*` を使う
- import 拡張子は書かない方針なので `allowImportingTsExtensions` は有効にしない

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@repo/ui": ["packages/ui/src/index.ts"],
      "@repo/ui/*": ["packages/ui/src/*"],
      "@repo/types": ["packages/types/src/index.ts"],
      "@repo/types/*": ["packages/types/src/*"],
      "@repo/schemas": ["packages/schemas/src/index.ts"],
      "@repo/schemas/*": ["packages/schemas/src/*"],
      "@repo/utils": ["packages/utils/src/index.ts"],
      "@repo/utils/*": ["packages/utils/src/*"]
    }
  }
}
```

---

# React / Vite アプリ共通方針

対象:

```txt
apps/portal
apps/app1
apps/notion-todo-pomodoro
```

各アプリは独立した Vite + React アプリとして作成してください。

## React / Vite アプリ用 tsconfig 指示

各 React アプリの `tsconfig.json` は次の方針にしてください。

- `extends: ../../tsconfig.base.json`
- `module: "ESNext"`
- `moduleResolution: "bundler"`
- `jsx: "react-jsx"`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`
- `noEmit: true`
- `types: ["vite/client"]`
- import時に `.ts` / `.tsx` / `.js` は付けない

例:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

---

# apps/portal

`portal` はトップページ・アプリ一覧・ログイン/ログアウト導線を持つアプリです。

## apps/portal/package.json

```json
{
  "name": "@repo/portal",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/ui": "*",
    "@repo/types": "*",
    "@repo/utils": "*",
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

## apps/portal/vite.config.ts

`portal` はルート `/` に配置する想定です。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
});
```

## apps/portal/src/App.tsx

- `/` に HomePage
- `/login` に LoginPage
- `/logout` に LogoutPage
- HomePage には app1 / notion-todo-pomodoro へのリンクを置く

例:

```tsx
import { Link } from "react-router-dom";
import { Button } from "@repo/ui";

export function App() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">Portfolio Portal</h1>
      <p className="mt-2 text-muted-foreground">
        複数の学習用アプリをまとめたポートフォリオです。
      </p>

      <div className="mt-8 flex gap-4">
        <Button asChild>
          <a href="/app1/">App 1</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/notion-todo-pomodoro/">App 2</a>
        </Button>
      </div>

      <div className="mt-8">
        <Link to="/login">Login</Link>
      </div>
    </main>
  );
}
```

---

# apps/app1

`app1` はサブパス `/app1/` に配置する Vite + React アプリです。

## apps/app1/package.json

```json
{
  "name": "@repo/app1",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5174",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4174",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/ui": "*",
    "@repo/types": "*",
    "@repo/schemas": "*",
    "@repo/utils": "*",
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "@tanstack/react-query": "latest",
    "@reduxjs/toolkit": "latest",
    "react-redux": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

## apps/app1/vite.config.ts

`base` は `/app1/` にしてください。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/app1/",
  plugins: [react()],
});
```

## React Router 指示

`BrowserRouter` を使う場合は、`basename="/app1"` を設定してください。

```tsx
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

export function Root() {
  return (
    <BrowserRouter basename="/app1">
      <App />
    </BrowserRouter>
  );
}
```

---

# apps/notion-todo-pomodoro

`notion-todo-pomodoro` はサブパス `/notion-todo-pomodoro/` に配置する Vite + React アプリです。

## apps/notion-todo-pomodoro/package.json

app1 と同様で構いません。パッケージ名とポートだけ変えてください。

```json
{
  "name": "@repo/notion-todo-pomodoro",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5175",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4175",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/ui": "*",
    "@repo/types": "*",
    "@repo/schemas": "*",
    "@repo/utils": "*",
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "@tanstack/react-query": "latest",
    "@reduxjs/toolkit": "latest",
    "react-redux": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

## apps/notion-todo-pomodoro/vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/notion-todo-pomodoro/",
  plugins: [react()],
});
```

## React Router 指示

`BrowserRouter` を使う場合は、`basename="/notion-todo-pomodoro"` を設定してください。

---

# packages/ui

shadcn/ui ベースの共通UIパッケージです。

重要:

- 各アプリに shadcn/ui を個別生成しない
- shadcn/ui コンポーネントは `packages/ui` に集約する
- `Button` / `Card` など最低限のコンポーネントを用意する
- 各アプリから `@repo/ui` として import できるようにする

## packages/ui/package.json

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*",
    "./styles/*": "./src/styles/*"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "latest"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit"
  }
}
```

## packages/ui/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "noEmit": true
  },
  "include": ["src"]
}
```

## packages/ui/src/lib/utils.ts

shadcn/ui 用の `cn` 関数を作成してください。

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## packages/ui/src/index.ts

最低限、以下を export してください。

```ts
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./lib/utils";
```

---

# Tailwind CSS / shadcn/ui 方針

Tailwind CSS を使う場合、各アプリの `tailwind.config.ts` の `content` に `packages/ui` を含めてください。

例:

```ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

shadcn/ui のテーマ用CSS変数は、最初は `packages/ui/src/styles/globals.css` に配置し、各アプリの `src/index.css` から import できるようにしてください。

例:

```css
@import "@repo/ui/styles/globals.css";
```

---

# packages/types

共通型を置くパッケージです。

## packages/types/package.json

```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

## packages/types/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "include": ["src"]
}
```

## packages/types/src/index.ts

```ts
export type User = {
  id: string;
  name: string;
  email: string;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
```

---

# packages/schemas

Zod schema など、フロントとバックエンドで共有するバリデーションschemaを置くパッケージです。

## packages/schemas/package.json

```json
{
  "name": "@repo/schemas",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "latest"
  },
  "devDependencies": {
    "typescript": "latest"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit"
  }
}
```

## packages/schemas/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "include": ["src"]
}
```

## packages/schemas/src/index.ts

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

# packages/utils

共通utility関数を置くパッケージです。

## packages/utils/package.json

```json
{
  "name": "@repo/utils",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

## packages/utils/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "include": ["src"]
}
```

## packages/utils/src/index.ts

```ts
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
```

---

# apps/api

Express + TypeScript の API サーバーです。

重要:

- ESMで統一する
- tsupでESMバンドルする
- TypeScript上のimportでは `.js` / `.ts` 拡張子を書かない
- 開発時は `tsx watch src/index.ts`
- 本番は `node dist/index.js`

## apps/api/package.json

```json
{
  "name": "@repo/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/schemas": "*",
    "@repo/types": "*",
    "@repo/utils": "*",
    "bcrypt": "latest",
    "cookie-parser": "latest",
    "cors": "latest",
    "dotenv": "latest",
    "express": "latest",
    "jsonwebtoken": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/bcrypt": "latest",
    "@types/cookie-parser": "latest",
    "@types/cors": "latest",
    "@types/express": "latest",
    "@types/jsonwebtoken": "latest",
    "@types/node": "latest",
    "tsup": "latest",
    "tsx": "latest",
    "typescript": "latest"
  }
}
```

## apps/api/tsconfig.json

APIはtsupでバンドルする前提なので、TypeScript設定は以下にしてください。

- `module: "ESNext"`
- `moduleResolution: "bundler"`
- `lib: ["ES2022"]`
- `types: ["node"]`
- `noEmit: true`
- import時に `.js` / `.ts` 拡張子を書かない

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src", "tsup.config.ts"]
}
```

## apps/api/tsup.config.ts

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: false,
  splitting: false,
});
```

## apps/api/src/app.ts

```ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { healthRouter } from "./routes/health.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/health", healthRouter);

app.use(errorHandler);
```

## apps/api/src/index.ts

```ts
import "dotenv/config";
import { app } from "./app";

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
```

## apps/api/src/routes/health.routes.ts

```ts
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ ok: true });
});
```

## apps/api/src/middleware/errorHandler.ts

```ts
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal Server Error",
  });
};
```

---

# importルール

プロジェクト全体で、import時に `.ts` / `.tsx` / `.js` 拡張子は書かないでください。

OK:

```ts
import { Button } from "@repo/ui";
import { loginSchema } from "@repo/schemas";
import { healthRouter } from "./routes/health.routes";
```

NG:

```ts
import { healthRouter } from "./routes/health.routes.ts";
import { healthRouter } from "./routes/health.routes.js";
```

理由:

- Vite側は `moduleResolution: "bundler"` で解決する
- API側は tsup でバンドルしてから Node.js で実行する
- Node.jsで直接TypeScript出力を実行しないため、TypeScript上のimportに `.js` を書かない設計にできる

---

# 認証設計の準備

今回は最低限の環境構築のみでよいですが、将来的に以下の設計に対応しやすい構成にしてください。

```txt
apps/portal
  → login / logout / register / account

apps/app1
  → 未ログイン時は /login?redirect=/app1/ に遷移

apps/notion-todo-pomodoro
  → 未ログイン時は /login?redirect=/notion-todo-pomodoro/ に遷移

apps/api
  → /api/auth/login
  → /api/auth/logout
  → /api/auth/me
```

Cookie認証を想定します。

- Express API が `httpOnly Cookie` を発行する
- Cookieの `path` は `/` にする
- 同一ドメイン配下の portal / app1 / notion-todo-pomodoro で共通利用できるようにする

---

# デプロイ想定

Viteアプリはそれぞれ build した成果物をNginxで配信する想定です。

```txt
/var/www/portfolio/
  portal/
  app1/
  notion-todo-pomodoro/
```

URL:

```txt
/       → portal
/app1/  → app1
/notion-todo-pomodoro/  → notion-todo-pomodoro
/api/   → Express API
```

Nginxで `/api/` を Express API にリバースプロキシする想定です。

---

# README.md に書く内容

READMEには最低限以下を書いてください。

````md
# Portfolio Monorepo

React + Vite の複数アプリと Express API を npm workspaces で管理するモノレポです。

## Apps

- `apps/portal`: ポートフォリオトップ・ログイン導線
- `apps/app1`: 学習用アプリ1
- `apps/notion-todo-pomodoro`: 学習用アプリ2
- `apps/api`: Express API

## Packages

- `packages/ui`: shadcn/ui ベースの共通UI
- `packages/types`: 共通型
- `packages/schemas`: 共通バリデーションschema
- `packages/utils`: 共通utility

## 方針

- ESMに統一
- TypeScript importでは拡張子を書かない
- React/Viteアプリは `moduleResolution: bundler`
- APIはtsupでESMバンドル
- shadcn/uiは `packages/ui` に集約

## Scripts

```bash
npm run dev:portal
npm run dev:app1
npm run dev:notion-todo-pomodoro
npm run dev:api
npm run build
npm run typecheck
```
````

````

---

# 最後に実行する確認コマンド

環境構築後、以下が通ることを確認してください。

```bash
npm install
npm run typecheck
npm run build
npm run dev:portal
npm run dev:app1
npm run dev:notion-todo-pomodoro
npm run dev:api
````

少なくとも以下が動作することを確認してください。

```txt
portal:
http://localhost:5173

app1:
http://localhost:5174/app1/

notion-todo-pomodoro:
http://localhost:5175/notion-todo-pomodoro/

api:
http://localhost:3000/api/health
```
