import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./global.css";
import { AuthPage } from "./pages/AuthPage";
import { useAuthStore } from "./features/auth/useAuthStore";
import { useAuthSocketSync } from "./hooks/useAuthSocketSync";

// アプリケーションのメインコンポーネント
const App = () => {
	// アプリケーション起動時に認証状態の監視を開始
	useEffect(() => {
		const unsubscribe = useAuthStore.getState().initialize();
		return () => unsubscribe(); // クリーンアップ関数
	}, []);

	// 認証とSocket接続を同期するフックを呼び出す
	useAuthSocketSync();

	return <RouterProvider router={router} />;
};

const router = createBrowserRouter([{ path: "/", element: <AuthPage /> }]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
