import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthMiddleware } from "@core/presentation/middlewares/AuthMiddleware";

export class AuthRoutes {
  public readonly router = Router();

  constructor(
    private readonly authController: AuthController,
    private readonly authMiddleware: AuthMiddleware
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // 認証不要なルート
    this.router.post("/register", this.authController.register);
    this.router.post("/login", this.authController.login);

    // 認証が必要なルート
    this.router.get("/me", this.authMiddleware.authenticate, this.authController.getUser);
    this.router.put("/me/displayName", this.authMiddleware.authenticate, this.authController.updateDisplayName);
    this.router.delete("/me", this.authMiddleware.authenticate, this.authController.deleteUser);
  }
}
