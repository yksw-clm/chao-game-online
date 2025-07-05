/**
 * ユーザーを表すドメインエンティティ。
 * 不変条件（uidは必須）と、関連する振る舞いをカプセル化する。
 */
export class User {
	public readonly uid: string;
	public readonly displayName: string;

	/**
	 * コンストラクタをprivateにすることで、
	 * 必ずファクトリメソッド経由での生成を強制する。
	 */
	private constructor(props: { uid: string; displayName: string }) {
		this.uid = props.uid;
		this.displayName = props.displayName;
	}

	/**
	 * Userインスタンスを生成するためのファクトリメソッド。
	 * @param props - ユーザーのプロパティ
	 * @returns Userのインスタンス
	 * @throws Error - 不変条件を満たさない場合（uidが存在しないなど）
	 */
	public static create(props: { uid: string; displayName: string }): User {
		// 不変条件：uidは必須
		if (!props.uid) {
			throw new Error("uidが指定されていません。");
		}
		return new User(props);
	}
}
