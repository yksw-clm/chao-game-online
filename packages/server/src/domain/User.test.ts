import { describe, it, expect } from "bun:test";
import { User } from "./User";

describe("User", () => {
	describe("create", () => {
		it("有効なプロパティが渡された場合、Userインスタンスを正しく生成できる", () => {
			const user = User.create({
				uid: "test-uid",
				displayName: "Test User",
			});

			expect(user.uid).toBe("test-uid");
			expect(user.displayName).toBe("Test User");
		});

		it("uidが提供されない場合、エラーがスローされる", () => {
			const invalidUserData = { uid: "" };
			expect(() => User.create(invalidUserData as any)).toThrow("uidが指定されていません。");
		});
	});
});
