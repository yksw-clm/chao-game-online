import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/AuthForm";

export const AuthPage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card>
				<CardHeader>
					<CardTitle className="text-center">Chao Game Online</CardTitle>
				</CardHeader>
				<CardContent>
					<AuthForm />
				</CardContent>
			</Card>
		</div>
	);
};
