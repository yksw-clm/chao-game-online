import { describe, it, expect, beforeEach } from "bun:test";
import { lobbyService } from "./LobbyService";
import { User } from "@domain/User";
import { GameTypes } from "@chao-game-online/shared/core";

// LobbyServiceはシングルトンのため、内部状態をリセットするためのヘルパーを定義
const resetLobby = () => {
	// @ts-expect-error: テストのためにプライベートプロパティにアクセス
	lobbyService._rooms.clear();
};

describe("LobbyService", () => {
	let host: User;
	let player2: User;

	beforeEach(() => {
		resetLobby();
		host = User.create({ uid: "host-uid", displayName: "Host User" });
		player2 = User.create({ uid: "player2-uid", displayName: "Player 2" });
	});

	describe("createRoom", () => {
		it("新しいルームを作成し、ロビーに追加できる", () => {
			const room = lobbyService.createRoom(host, "New Room", GameTypes.FOUR_REVERSI);
			expect(room).toBeDefined();
			expect(lobbyService.getRoom(room.number)).toBe(room);
			expect(lobbyService.getAllRoomsInfoDtos()).toHaveLength(1);
		});
	});

	describe("joinRoom", () => {
		it("既存のルームに参加できる", () => {
			const room = lobbyService.createRoom(host, "Test Room", GameTypes.FOUR_REVERSI);
			const joinedRoom = lobbyService.joinRoom(player2, room.number);

			expect(joinedRoom.getPlayerCount()).toBe(2);
			expect(joinedRoom.getPlayer(player2.uid)).toBe(player2);
		});

		it("存在しないルームに参加しようとするとエラーをスローする", () => {
			expect(() => {
				lobbyService.joinRoom(player2, 99999);
			}).toThrow("指定されたルームは存在しません");
		});
	});

	describe("leaveRoom", () => {
		let roomNumber: number;

		beforeEach(() => {
			const room = lobbyService.createRoom(host, "Test Room", GameTypes.FOUR_REVERSI);
			lobbyService.joinRoom(player2, room.number);
			roomNumber = room.number;
		});

		it("プレイヤーがルームから退出できる", () => {
			const updatedRoom = lobbyService.leaveRoom(player2.uid);
			expect(updatedRoom).toBeDefined();
			expect(updatedRoom?.getPlayerCount()).toBe(1);
			expect(lobbyService.getRoom(roomNumber)?.getPlayer(player2.uid)).toBeUndefined();
		});

		it("最後のプレイヤーが退出すると、ルームは削除される", () => {
			lobbyService.leaveRoom(host.uid); // 1人目
			const lastPlayerLeavedRoom = lobbyService.leaveRoom(player2.uid); // 2人目 (最後)

			expect(lastPlayerLeavedRoom).toBeUndefined();
			expect(lobbyService.getRoom(roomNumber)).toBeUndefined();
			expect(lobbyService.getAllRoomsInfoDtos()).toHaveLength(0);
		});

		it("どのルームにもいないプレイヤーが退出を試みても何も起こらない", () => {
			const nonMember = User.create({ uid: "non-member", displayName: "Non Member" });
			const result = lobbyService.leaveRoom(nonMember.uid);
			expect(result).toBeUndefined();
			expect(lobbyService.getRoom(roomNumber)?.getPlayerCount()).toBe(2);
		});
	});

	describe("findRoomByUserId", () => {
		it("ユーザーIDで参加しているルームを見つけられる", () => {
			const room = lobbyService.createRoom(host, "Find Me Room", GameTypes.FOUR_GOMOKU);
			const foundRoom = lobbyService.findRoomByUserId(host.uid);
			expect(foundRoom).toBe(room);
		});

		it("どのルームにもいないユーザーIDで検索するとundefinedを返す", () => {
			const foundRoom = lobbyService.findRoomByUserId("non-existent-user");
			expect(foundRoom).toBeUndefined();
		});
	});
});
