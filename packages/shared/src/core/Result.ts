/**
 * 成功または失敗を表す関数の戻り値の型
 */
export class Result<TSuccess, TError = string> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: TSuccess,
    public readonly error?: TError
  ) {
    if (isSuccess && error) throw new Error("Success result must not have an error");
    if (!isSuccess && !error) throw new Error("Failure result must have an error");
  }

  public static ok<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  public static fail<T = string>(error: T): Result<never, T> {
    return new Result<never, T>(false, undefined, error);
  }
}
