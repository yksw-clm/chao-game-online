import { useEffect } from "react";
import { RouterProvider, createBrowserRouter, useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./features/auth/useAuthStore";
import { useAuthSocketSync } from "./hooks/useAuthSocketSync";
import { AuthPage } from "./pages/AuthPage";
import { LobbyPage } from "./pages/LobbyPage";
import { RoomPage } from "./pages/RoomPage";
import { useSocketStore } from "./services/socket/useSocketStore";

/**
 * 認証状態やSocket接続に応じて画面遷移を管理するレイアウトコンポーネント。
 */
const AppLayout = () => {
	const navigate = useNavigate();
	const { idToken } = useAuthStore();
	const { isConnected } = useSocketStore();

	// 認証状態とSocket接続を同期するフック
	useAuthSocketSync();

	useEffect(() => {
		// ログイン済みで、Socketも接続されていればロビー画面へ遷移
		if (idToken && isConnected) {
			navigate("/lobby");
		}
	}, [idToken, isConnected, navigate]);

	// 子ルート（AuthPageやLobbyPageなど）をレンダリングする
	return <Outlet />;
};

/**
 * 認証が必要なルートを保護するコンポーネント。
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { idToken, isLoading } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		// 読み込み完了後、未認証であればログインページへリダイレクト
		if (!isLoading && !idToken) {
			navigate("/");
		}
	}, [idToken, isLoading, navigate]);

	if (isLoading) return <div>読み込み中...</div>;
	return <>{children}</>;
};

// ルーターの設定
const router = createBrowserRouter([
	{
		// AppLayoutを共通の親要素として設定
		element: <AppLayout />,
		children: [
			{
				path: "/",
				element: <AuthPage />,
			},
			{
				path: "/lobby",
				element: (
					<ProtectedRoute>
						<LobbyPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/room/:roomNumber",
				element: (
					<ProtectedRoute>
						<RoomPage />
					</ProtectedRoute>
				),
			},
		],
	},
]);

export const App = () => {
	// アプリケーション起動時に認証状態の監視を開始する
	useEffect(() => {
		const unsubscribe = useAuthStore.getState().initialize();
		return () => unsubscribe(); // クリーンアップ
	}, []);

	// RouterProviderをレンダリングする
	return <RouterProvider router={router} />;
};
