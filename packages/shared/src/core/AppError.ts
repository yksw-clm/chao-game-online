/**
 * アプリケーション全体で使用するエラーベースクラス
 */
export class AppError extends Error {
  public readonly code: string;
  public override readonly cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
