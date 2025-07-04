import type { IAuthService } from "@application/services/IAuthService";
import { User } from "@domain/User";
import { admin } from "./firebaseAdmin";

export class FirebaseAuthService implements IAuthService {
	public async verifyToken(token: string): Promise<User> {
		try {
			const decodedToken = await admin.auth().verifyIdToken(token);

			// FirebaseのDecodedIdTokenから、ドメインのUserモデルへ変換
			return User.create({
				uid: decodedToken.uid,
				displayName: decodedToken.name || "Unknown",
			});
		} catch (error) {
			// エラーログはインフラ層で記録するのが適切
			console.error("Firebaseトークンの検証に失敗:", error);
			throw new Error("トークンの検証に失敗しました");
		}
	}
}
