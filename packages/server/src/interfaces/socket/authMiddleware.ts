import { AuthenticateUserUseCase } from "@application/usecases/AuthenticateUserUseCase";
import { FirebaseAuthService } from "@infrastructure/firebase/firebaseAuthService";
import type { AuthenticatedSocket } from "./types";

// 依存性を注入してユースケースのインスタンスを生成
const authService = new FirebaseAuthService();
const authenticateUserUseCase = new AuthenticateUserUseCase(authService);

/**
 * Socket.IO認証ミドルウェア。
 * フレームワークの処理と、ユースケースの呼び出しを担う。
 */
export const authMiddleware = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
	const token = socket.handshake.auth.token as string | undefined;

	try {
		// ユースケースを実行してユーザー情報を取得
		const user = await authenticateUserUseCase.execute(token);
		// socket.dataにドメインモデルのUserを格納
		socket.data.user = user;
		console.log(`Authenticated: ${user.uid}`);
		next();
	} catch (error) {
		console.error(error);
		next(error instanceof Error ? error : new Error("Authentication error"));
	}
};
