import { z } from "zod";

export const PlaceStoneSchema = z.object({
	x: z.number().int().min(0, "X座標は0以上の整数で指定してください"),
	y: z.number().int().min(0, "Y座標は0以上の整数で指定してください"),
});
export type PlaceStonePayload = z.infer<typeof PlaceStoneSchema>;
