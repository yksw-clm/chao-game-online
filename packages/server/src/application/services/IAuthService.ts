import type { User } from "@domain/User";

/**
 * 認証サービスのインターフェース。
 * 依存性逆転の原則に基づき、ユースケースはこのインターフェースに依存する。
 */
export interface IAuthService {
	/**
	 * トークンを検証し、アプリケーションのUserモデルを取得します。
	 * @param token 検証するトークン
	 * @returns 認証されたユーザー情報
	 * @throws 検証に失敗した場合
	 */
	verifyToken(token: string): Promise<User>;
}
