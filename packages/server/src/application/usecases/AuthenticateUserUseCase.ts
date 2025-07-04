import type { User } from "@domain/User";
import type { IAuthService } from "../services/IAuthService";

/**
 * ユーザー認証に関するユースケース。
 * 認証ロジックの具体的な実装(Firebase)からは完全に分離されている。
 */
export class AuthenticateUserUseCase {
	// コンストラクタで認証サービスの実装を注入する (DI)
	constructor(private readonly authService: IAuthService) {}

	/**
	 * ユースケースを実行し、トークンを検証してユーザー情報を取得します。
	 * @param token 検証するトークン
	 * @returns 認証されたユーザー情報
	 * @throws トークンが未定義の場合や検証に失敗した場合
	 */
	public async execute(token?: string): Promise<User> {
		if (!token) {
			throw new Error("トークンが提供されていません");
		}

		const user = await this.authService.verifyToken(token);

		return user;
	}
}
