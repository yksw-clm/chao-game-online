import { z } from "zod";

// ユーザーID
export const userIdSchema = z
  .string({ error: (issue) => (issue.input === undefined ? "このフィールドは必須です" : "文字列を入力してください") })
  .min(3, "ユーザーIDは3文字以上である必要があります。")
  .max(15, "ユーザーIDは15文字以下である必要があります。")
  .regex(/^[a-zA-Z0-9_]+$/, "ユーザーIDは半角英数字とアンダースコアのみ使用できます。");

// 表示名
export const displayNameSchema = z
  .string({ error: (issue) => (issue.input === undefined ? "このフィールドは必須です" : "文字列を入力してください") })
  .min(1, "表示名は1文字以上である必要があります。")
  .max(10, "表示名は10文字以下である必要があります。")
  .regex(
    /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}a-zA-Z0-9_]+$/u,
    "表示名は日本語・英数字・アンダースコアのみ使用できます。"
  );

// パスワード
export const passwordSchema = z
  .string({ error: (issue) => (issue.input === undefined ? "このフィールドは必須です" : "文字列を入力してください") })
  .min(8, "パスワードは8文字以上である必要があります。")
  .max(64, "パスワードは64文字以下である必要があります。")
  .regex(/^[\x21-\x7E]+$/, "パスワードには半角英数字および記号のみ使用できます。")
  .refine((val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[^a-zA-Z0-9]/.test(val), {
    message: "英大文字・小文字・数字・記号をすべて含めてください。",
  });
