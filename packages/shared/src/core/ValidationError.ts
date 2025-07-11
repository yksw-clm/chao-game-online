import { AppError } from "./AppError";

/**
 * 入力バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super("VALIDATION_ERROR", `${field}: ${message}`);
  }
}
