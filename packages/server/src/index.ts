import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";

// Infrastructure
import { UserRepository } from "@auth/infrastructure/repositories/UserRepository";
import { BcryptPasswordService } from "@auth/infrastructure/services/BcryptPasswordService";
import { JwtTokenService } from "@auth/infrastructure/services/JwtTokenService";

// Application
import { RegisterUserUseCase } from "@auth/application/usecases/RegisterUserUseCase";
import { LoginUserUseCase } from "@auth/application/usecases/LoginUserUseCase";
import { GetUserUseCase } from "@auth/application/usecases/GetUserUseCase";
import { UpdateDisplayNameUseCase } from "@auth/application/usecases/UpdateDisplayNameUseCase";
import { DeleteUserUseCase } from "@auth/application/usecases/DeleteUserUseCase";

// Presentation
import { AuthController } from "@auth/presentation/controllers/AuthController";
import { AuthRoutes } from "@auth/presentation/routes/AuthRoutes";
import { AuthMiddleware } from "@core/presentation/middlewares/AuthMiddleware";
import { SocketAuthMiddleware } from "@core/presentation/middlewares/SocketAuthMiddleware";
import { SocketHandler } from "@core/presentation/socket/SocketHandler";
import { ErrorHandler } from "@core/presentation/middlewares/ErrorHandler";

// Database
import { PrismaClient } from "@core/infrastructure/database/PrismaClient";

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  // Express app setup
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser()); // Cookie parser追加

  // Dependencies injection
  const userRepository = new UserRepository();
  const passwordService = new BcryptPasswordService();
  const tokenService = new JwtTokenService();

  // Use cases
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordService);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordService);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const updateDisplayNameUseCase = new UpdateDisplayNameUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);

  // Middlewares
  const authMiddleware = new AuthMiddleware(tokenService);
  const socketAuthMiddleware = new SocketAuthMiddleware(tokenService);

  // Controllers
  const authController = new AuthController(
    registerUserUseCase,
    loginUserUseCase,
    getUserUseCase,
    updateDisplayNameUseCase,
    deleteUserUseCase,
    tokenService
  );

  // Routes
  const authRoutes = new AuthRoutes(authController, authMiddleware);

  // API routes
  app.use("/api/auth", authRoutes.router);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(ErrorHandler.handle);

  // Socket.IO setup
  new SocketHandler(io, socketAuthMiddleware);

  // Start server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await PrismaClient.disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await PrismaClient.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
