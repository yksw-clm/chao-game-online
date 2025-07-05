import { create } from "zustand";
import { getIdToken, type User, onIdTokenChanged } from "firebase/auth";
import { auth } from "@/services/firebase";

type AuthState = {
	isLoading: boolean;
	user: User | null;
	idToken: string | null;
	initialize: () => () => void; // Unsubscribeを返す
};

export const useAuthStore = create<AuthState>((set) => ({
	isLoading: true,
	user: null,
	idToken: null,
	initialize: () => {
		const unsubscribe = onIdTokenChanged(auth, async (user) => {
			if (user) {
				const token = await getIdToken(user);
				set({ user, idToken: token, isLoading: false });
			} else {
				set({ user: null, idToken: null, isLoading: false });
			}
		});
		return unsubscribe;
	},
}));
