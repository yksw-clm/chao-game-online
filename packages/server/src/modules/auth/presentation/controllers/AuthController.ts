import type { Request, Response } from "express";
import { RegisterUserUseCase } from "@auth/application/usecases/RegisterUserUseCase";
import { LoginUserUseCase } from "@auth/application/usecases/LoginUserUseCase";
import { GetUserUseCase } from "@auth/application/usecases/GetUserUseCase";
import { UpdateDisplayNameUseCase } from "@auth/application/usecases/UpdateDisplayNameUseCase";
import { DeleteUserUseCase } from "@auth/application/usecases/DeleteUserUseCase";
import { JwtTokenService } from "@auth/infrastructure/services/JwtTokenService";
import type { AuthenticatedRequest } from "@core/presentation/middlewares/AuthMiddleware";
import { Result, AppError } from "@chao-game-online/shared/core";
import type { RegisterUserDto, LoginUserDto, UpdateDisplayNameDto } from "@chao-game-online/shared/auth";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateDisplayNameUseCase: UpdateDisplayNameUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly tokenService: JwtTokenService
  ) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: RegisterUserDto = req.body;
      const user = await this.registerUserUseCase.execute(dto);
      const token = this.tokenService.generateToken(user.userId);

      res.status(201).json(Result.ok({ user, token }));
    } catch (error) {
      if (error instanceof AppError) {
        const statusCode = error.code === "USER_ALREADY_EXISTS" ? 409 : 400;
        res.status(statusCode).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "ユーザー登録に失敗しました")));
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: LoginUserDto = req.body;
      const user = await this.loginUserUseCase.execute(dto);
      const token = this.tokenService.generateToken(user.userId);

      res.status(200).json(Result.ok({ user, token }));
    } catch (error) {
      if (error instanceof AppError) {
        const statusCode = error.code === "USER_NOT_FOUND" || error.code === "INVALID_PASSWORD" ? 401 : 400;
        res.status(statusCode).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "ログインに失敗しました")));
    }
  };

  public getUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json(Result.fail(new AppError("UNAUTHORIZED", "認証が必要です")));
        return;
      }

      const user = await this.getUserUseCase.execute(req.userId);
      res.status(200).json(Result.ok(user));
    } catch (error) {
      if (error instanceof AppError) {
        const statusCode = error.code === "USER_NOT_FOUND" ? 404 : 400;
        res.status(statusCode).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "ユーザー情報の取得に失敗しました")));
    }
  };

  public updateDisplayName = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json(Result.fail(new AppError("UNAUTHORIZED", "認証が必要です")));
        return;
      }

      const dto: UpdateDisplayNameDto = {
        userId: req.userId,
        displayName: req.body.displayName,
      };

      const user = await this.updateDisplayNameUseCase.execute(dto);
      res.status(200).json(Result.ok(user));
    } catch (error) {
      if (error instanceof AppError) {
        const statusCode = error.code === "USER_NOT_FOUND" ? 404 : 400;
        res.status(statusCode).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "表示名の更新に失敗しました")));
    }
  };

  public deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json(Result.fail(new AppError("UNAUTHORIZED", "認証が必要です")));
        return;
      }

      await this.deleteUserUseCase.execute(req.userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        const statusCode = error.code === "USER_NOT_FOUND" ? 404 : 400;
        res.status(statusCode).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "ユーザーの削除に失敗しました")));
    }
  };
}
