import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useSocketStore } from "@/services/socket/useSocketStore";

export const useAuthSocketSync = () => {
	const { idToken } = useAuthStore();
	const { connect, disconnect, isConnected } = useSocketStore();

	useEffect(() => {
		if (idToken && !isConnected) {
			// ログイン状態（idTokenあり）かつ未接続なら接続
			connect(idToken);
		} else if (!idToken && isConnected) {
			// ログアウト状態（idTokenなし）かつ接続中なら切断
			disconnect();
		}
	}, [idToken, isConnected, connect, disconnect]);
};
