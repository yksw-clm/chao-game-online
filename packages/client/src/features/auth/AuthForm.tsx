import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// ログイン用スキーマ
const loginSchema = z.object({
	email: z.string({ required_error: "メールアドレスは必須です" }).email("有効なメールアドレスを入力してください"),
	password: z.string({ required_error: "パスワードは必須です" }).min(6, "パスワードは6文字以上で入力してください"),
});

// 新規登録用スキーマ
const signupSchema = z
	.object({
		email: z.string({ required_error: "メールアドレスは必須です" }).email("有効なメールアドレスを入力してください"),
		displayName: z
			.string({ required_error: "表示名は必須です" })
			.min(2, "表示名は2文字以上で入力してください")
			.max(10, "表示名は10文字以下で入力してください"),
		password: z.string({ required_error: "パスワードは必須です" }).min(6, "パスワードは6文字以上で入力してください"),
		passwordConfirm: z.string({ required_error: "パスワード確認は必須です" }).min(6, "パスワード確認は6文字以上で入力してください"),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "パスワードが一致しません",
		path: ["passwordConfirm"],
	});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export const AuthForm = () => {
	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const signupForm = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
	});

	const handleLogin = async (data: LoginFormData) => {
		try {
			await signInWithEmailAndPassword(auth, data.email, data.password);

			alert("ログインに成功しました！");
		} catch (error) {
			console.error("ログインエラー:", error);

			alert("ログインに失敗しました。");
		}
	};

	const handleSignUp = async (data: SignupFormData) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
			await updateProfile(userCredential.user, { displayName: data.displayName });

			alert("新規登録に成功しました！");
		} catch (error) {
			console.error("新規登録エラー:", error);
			alert("新規登録に失敗しました。");
		}
	};

	return (
		<Tabs defaultValue="login" className="w-[400px]">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="login">ログイン</TabsTrigger>
				<TabsTrigger value="signup">新規登録</TabsTrigger>
			</TabsList>
			<TabsContent value="login">
				<Form {...loginForm}>
					<form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 py-4" noValidate>
						<FormField
							control={loginForm.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>メールアドレス</FormLabel>
									<FormControl>
										<Input type="email" placeholder="メールアドレスを入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={loginForm.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>パスワード</FormLabel>
									<FormControl>
										<Input type="password" placeholder="パスワードを入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
							{loginForm.formState.isSubmitting ? "ログイン中..." : "ログイン"}
						</Button>
					</form>
				</Form>
			</TabsContent>
			<TabsContent value="signup">
				<Form {...signupForm}>
					<form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4 py-4" noValidate>
						<FormField
							control={signupForm.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>メールアドレス</FormLabel>
									<FormControl>
										<Input type="email" placeholder="メールアドレスを入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={signupForm.control}
							name="displayName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>表示名</FormLabel>
									<FormControl>
										<Input type="text" placeholder="表示名を入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={signupForm.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>パスワード</FormLabel>
									<FormControl>
										<Input type="password" placeholder="パスワードを入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={signupForm.control}
							name="passwordConfirm"
							render={({ field }) => (
								<FormItem>
									<FormLabel>パスワード確認</FormLabel>
									<FormControl>
										<Input type="password" placeholder="パスワードを再入力" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={signupForm.formState.isSubmitting}>
							{signupForm.formState.isSubmitting ? "登録中..." : "新規登録"}
						</Button>
					</form>
				</Form>
			</TabsContent>
		</Tabs>
	);
};
