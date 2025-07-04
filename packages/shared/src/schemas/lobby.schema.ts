import { z } from "zod";
import { GameType } from "../core";

// ルーム作成
export const CreateRoomSchema = z.object({
	name: z
		.string({ required_error: "ルーム名を入力してください" })
		.min(3, "ルーム名は3文字以上で入力してください")
		.max(20, "ルーム名は20文字以下で入力してください"),
	GameType: z.nativeEnum(GameType, {
		required_error: "ゲームを選択してください",
		invalid_type_error: "有効なゲームを選択してください",
	}),
});
export type CreateRoomPayload = z.infer<typeof CreateRoomSchema>;

// ルーム入室
export const JoinRoomSchema = z.object({
	roomNumber: z
		.number({ required_error: "ルーム番号を入力してください" })
		.min(10000, "ルーム番号は5桁の正の整数で指定してください")
		.max(99999, "ルーム番号は5桁の正の整数で指定してください"),
});
export type JoinRoomPayload = z.infer<typeof JoinRoomSchema>;
