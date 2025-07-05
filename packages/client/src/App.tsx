import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuthStore } from "./features/auth/useAuthStore";
import { useAuthSocketSync } from "./hooks/useAuthSocketSync";
import { AuthPage } from "./pages/AuthPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <AuthPage />,
	},
]);

export const App = () => {
	// アプリケーション起動時に認証状態の監視を開始
	useEffect(() => {
		const unsubscribe = useAuthStore.getState().initialize();
		return () => unsubscribe(); // クリーンアップ
	}, []);

	// 認証とSocket接続を同期
	useAuthSocketSync();

	return <RouterProvider router={router} />;
};
