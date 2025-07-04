import admin from "firebase-admin";
// serviceAccountKey.json は packages/server 直下に配置
import serviceAccount from "../../../serviceAccountKey.json";

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
	});
}

// 初期化済みの Firebase Admin SDK インスタンスをエクスポート
export { admin };
