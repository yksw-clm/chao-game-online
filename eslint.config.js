import js from "@eslint/js";
import tseslint from "typescript-eslint";

// クライアント用のプラグイン
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  // 1. 全パッケージの共通設定
  {
    // グローバルに無視するファイル・ディレクトリ
    ignores: ["**/dist/", "**/node_modules/", "**/*.config.{js,ts,cjs}"],
  },
  {
    // TypeScriptの基本設定
    files: ["packages/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },

  // 2, クライアント(React)用の設定
  {
    files: ["packages/client/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser, // ブラウザ環境のグローバル変数を有効化
      },
    },
    rules: {
      // React Hooksのルールを有効化
      ...reactHooks.configs.recommended.rules,
      // Viteのためのルール
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // クライアントのUIコンポーネント用の設定
  {
    files: ["packages/client/src/shared/ui/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  // 3. サーバー(Bun)用の設定
  {
    files: ["packages/server/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js環境のグローバル変数を有効化
        ...globals.bun, // Bun環境のグローバル変数を有効化
      },
    },
    rules: {
      // サーバー用の固有のルール
    },
  }

  // 4. 共通型定義パッケージの設定（追加ルールなし）
);
