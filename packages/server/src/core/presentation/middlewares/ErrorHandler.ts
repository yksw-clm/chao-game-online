import type { Request, Response } from "express";
import { Result, AppError, ValidationError } from "@chao-game-online/shared/core";

export class ErrorHandler {
  public static handle = (error: Error, req: Request, res: Response): void => {
    console.error("Error occurred:", error);

    if (error instanceof ValidationError) {
      res.status(400).json(Result.fail(error));
      return;
    }

    if (error instanceof AppError) {
      const statusCode = ErrorHandler.getStatusCode(error.code);
      res.status(statusCode).json(Result.fail(error));
      return;
    }

    // 予期しないエラー
    res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "内部サーバーエラーが発生しました")));
  };

  private static getStatusCode(errorCode: string): number {
    switch (errorCode) {
      case "USER_NOT_FOUND":
      case "INVALID_PASSWORD":
        return 404;
      case "USER_ALREADY_EXISTS":
        return 409;
      case "UNAUTHORIZED":
      case "TOKEN_EXPIRED":
      case "INVALID_TOKEN":
        return 401;
      case "VALIDATION_ERROR":
        return 400;
      default:
        return 500;
    }
  }
}
