import type { IAuthService } from "@application/services/IAuthService";
import { User } from "@domain/User";
import { describe, it, expect, spyOn, beforeEach } from "bun:test";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

// IAuthServiceのモックを作成
const mockAuthService: IAuthService = {
	verifyToken: async (token: string) => User.create({ uid: "default-uid", displayName: "DefaultUser" }),
};

// spyOnを使って、特定のメソッドの呼び出しを監視・制御
const verifyTokenSpy = spyOn(mockAuthService, "verifyToken");

// テスト対象のインスタンスを生成
const authenticateUserUseCase = new AuthenticateUserUseCase(mockAuthService);

describe("AuthenticateUserUseCase", () => {
	beforeEach(() => {
		verifyTokenSpy.mockReset();
	});

	it("有効なトークンが提供された場合、対応するユーザー情報を取得できる", async () => {
		const fakeToken = "valid-token";
		const fakeUser = User.create({ uid: "fake-uid", displayName: "FakeUser" });

		// モックの振る舞いを定義
		verifyTokenSpy.mockResolvedValue(fakeUser);

		const result = await authenticateUserUseCase.execute(fakeToken);

		expect(result).toBe(fakeUser);

		// verifyTokenが正しい引数で1回呼び出されたことを確認
		expect(verifyTokenSpy).toHaveBeenCalledWith(fakeToken);
		expect(verifyTokenSpy).toHaveBeenCalledTimes(1);
	});

	it("トークンが提供されない場合、エラーがスローされる", async () => {
		// Promiseがrejectされることをテストします
		expect(authenticateUserUseCase.execute(undefined)).rejects.toThrow(new Error("トークンが提供されていません"));
	});

	it("AuthServiceでのトークン検証が失敗した場合、そのエラーがそのままスローされる", async () => {
		const fakeToken = "invalid-token";
		const authError = new Error("無効なトークン");

		// モックがエラーを投げるように設定
		verifyTokenSpy.mockRejectedValue(authError);

		expect(authenticateUserUseCase.execute(fakeToken)).rejects.toThrow(authError);
	});
});
