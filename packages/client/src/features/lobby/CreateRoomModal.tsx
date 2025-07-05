import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRoomSchema, type CreateRoomPayload } from "@chao-game-online/shared/schemas/index";
import { useLobbyStore } from "./useLobbyStore";
import { GameTypeNames, GameTypes } from "@chao-game-online/shared/core";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useRoomStore } from "../room/useRoomStore";
import { useNavigate } from "react-router-dom";

export const CreateRoomModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { createRoom } = useLobbyStore();
	const { setRoom } = useRoomStore();
	const navigate = useNavigate();

	const form = useForm<CreateRoomPayload>({
		resolver: zodResolver(CreateRoomSchema),
		defaultValues: {
			name: "",
			GameType: GameTypes.FOUR_REVERSI, // デフォルト値
		},
	});

	const onSubmit = (data: CreateRoomPayload) => {
		createRoom(data, (res) => {
			if (res.success) {
				setRoom(res.data); // ルーム情報をストアに保存
				setIsOpen(false);
				navigate(`/room/${res.data.number}`); // ルーム画面へ遷移
			} else {
				alert(`ルームの作成に失敗しました: ${res.error}`);
			}
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>ルームを作成</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>新しいルームを作成</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ルーム名</FormLabel>
									<FormControl>
										<Input placeholder="ルーム名を入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="GameType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ゲームの種類</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="ゲームを選択" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(GameTypes).map((gameType) => (
												<SelectItem key={gameType} value={gameType}>
													{GameTypeNames[gameType]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									キャンセル
								</Button>
							</DialogClose>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								作成
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
