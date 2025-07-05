import { describe, it, expect, beforeEach } from "bun:test";
import { Room } from "./Room";
import { User } from "./User";
import { GameType } from "@chao-game-online/shared/core";

describe("Room", () => {
	let host: User;
	let player2: User;

	beforeEach(() => {
		host = User.create({ uid: "host-uid", displayName: "Host User" });
		player2 = User.create({ uid: "player2-uid", displayName: "Player 2" });
	});

	describe("create", () => {
		it("有効なプロパティでRoomインスタンスを正しく生成できる", () => {
			const room = Room.create(12345, { name: "Test Room", gameType: GameType["four-reversi"], host });
			expect(room).toBeInstanceOf(Room);
			expect(room.number).toBe(12345);
			expect(room.getPlayerCount()).toBe(1); // ホストが自動で追加される
		});

		it.each([
			{ number: 1234, name: "Valid Name", reason: "ルーム番号が5桁未満" },
			{ number: 100000, name: "Valid Name", reason: "ルーム番号が5桁を超える" },
			{ number: 12345, name: "NG", reason: "ルーム名が3文字未満" },
			{ number: 12345, name: "This room name is way too long", reason: "ルーム名が20文字を超える" },
		])("無効なプロパティ ($reason) で生成しようとするとエラーをスローする", ({ number, name }) => {
			expect(() => {
				Room.create(number, { name, gameType: GameType["four-reversi"], host });
			}).toThrow();
		});
	});

	describe("addPlayer", () => {
		it("新しいプレイヤーをルームに追加できる", () => {
			const room = Room.create(12345, { name: "Test Room", gameType: GameType["four-reversi"], host });
			room.addPlayer(player2);
			expect(room.getPlayerCount()).toBe(2);
			expect(room.getPlayer(player2.uid)).toBe(player2);
		});

		it("ルームが満員の場合、新しいプレイヤーを追加しようとするとエラーをスローする", () => {
			const room = Room.create(12345, { name: "Test Room", gameType: GameType["four-reversi"], host });
			room.addPlayer(User.create({ uid: "p2", displayName: "P2" }));
			room.addPlayer(User.create({ uid: "p3", displayName: "P3" }));
			room.addPlayer(User.create({ uid: "p4", displayName: "P4" }));

			expect(room.isFull()).toBe(true);
			expect(() => {
				room.addPlayer(User.create({ uid: "p5", displayName: "P5" }));
			}).toThrow("このルームは満員です");
		});
	});

	describe("removePlayer", () => {
		let room: Room;
		beforeEach(() => {
			room = Room.create(12345, { name: "Test Room", gameType: GameType["four-reversi"], host });
			room.addPlayer(player2);
		});

		it("存在するプレイヤーをルームから削除できる", () => {
			room.removePlayer(player2.uid);
			expect(room.getPlayerCount()).toBe(1);
			expect(room.getPlayer(player2.uid)).toBeUndefined();
		});

		it("ホストが退出した場合、残っているプレイヤーが新しいホストになる", () => {
			room.removePlayer(host.uid);
			const state = room.toRoomStateDto();
			const newHost = state.players.find((p) => p.isHost);
			expect(newHost?.id).toBe(player2.uid);
			expect(room.getPlayerCount()).toBe(1);
		});

		it("存在しないプレイヤーを削除しようとするとエラーをスローする", () => {
			expect(() => {
				room.removePlayer("non-existent-uid");
			}).toThrow("指定されたユーザーはこのルームに存在しません");
		});
	});

	describe("DTO変換", () => {
		it("toRoomInfoDtoが正しい形式のデータを返す", () => {
			const room = Room.create(54321, { name: "DTO Test", gameType: GameType["four-gomoku"], host });
			room.addPlayer(player2);
			const dto = room.toRoomInfoDto();
			expect(dto).toEqual({
				number: 54321,
				name: "DTO Test",
				gameType: GameType["four-gomoku"],
				playerCount: 2,
				maxPlayerCount: 4,
			});
		});

		it("toRoomStateDtoが正しい形式のデータを返す", () => {
			const room = Room.create(54321, { name: "DTO Test", gameType: GameType["four-gomoku"], host });
			room.addPlayer(player2);
			const dto = room.toRoomStateDto();
			expect(dto.number).toBe(54321);
			expect(dto.players).toHaveLength(2);
			expect(dto.players).toContainEqual({ id: host.uid, displayName: host.displayName, isHost: true });
			expect(dto.players).toContainEqual({ id: player2.uid, displayName: player2.displayName, isHost: false });
		});
	});
});
