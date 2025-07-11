#!/bin/bash
# filepath: /root/dev/chao-game-online/packages/server/test-auth-flow.sh

# 色付きログ用の関数
print_success() {
    echo -e "\033[32m✓ $1\033[0m"
}

print_error() {
    echo -e "\033[31m✗ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠ $1\033[0m"
}

# サーバーのベースURL
BASE_URL="http://localhost:3001"

# Cookie jar ファイル（テスト用）
COOKIE_JAR="/tmp/auth_test_cookies.txt"

# テスト用ユーザーデータ
TEST_USER_ID="testuser12345"
TEST_DISPLAY_NAME="テストユーザー"
TEST_PASSWORD="TestPass123!"
UPDATED_DISPLAY_NAME="更新テストユーザー"

# テスト結果のカウンター
TOTAL_TESTS=0
PASSED_TESTS=0

# テスト関数
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local response_file="/tmp/test_response.json"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    print_info "テスト実行: $test_name"
    
    # curlコマンドを実行し、レスポンスコードとボディを取得
    local actual_status
    actual_status=$(curl -s -w "%{http_code}" -o "$response_file" -c "$COOKIE_JAR" -b "$COOKIE_JAR" "${@:3}")
    
    # レスポンスボディを表示
    if [[ -f "$response_file" ]]; then
        local response_body
        response_body=$(cat "$response_file")
        if [[ -n "$response_body" ]]; then
            echo "Response: $response_body" | jq . 2>/dev/null || echo "Response: $response_body"
        fi
    fi
    
    # ステータスコードの確認
    if [[ "$actual_status" == "$expected_status" ]]; then
        print_success "$test_name - ステータスコード: $actual_status (期待値: $expected_status)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name - ステータスコード: $actual_status (期待値: $expected_status)"
        return 1
    fi
}

# テストの準備
setup_test() {
    print_info "=== 認証フローテスト開始 ==="
    print_info "テストユーザーID: $TEST_USER_ID"
    
    # Cookie jarファイルをクリア
    rm -f "$COOKIE_JAR"
    touch "$COOKIE_JAR"
}

# テストの後片付け
cleanup_test() {
    rm -f "$COOKIE_JAR"
    rm -f "/tmp/test_response.json"
    
    print_info "=== テスト結果 ==="
    print_info "実行テスト数: $TOTAL_TESTS"
    print_info "成功テスト数: $PASSED_TESTS"
    print_info "失敗テスト数: $((TOTAL_TESTS - PASSED_TESTS))"
    
    if [[ $PASSED_TESTS -eq $TOTAL_TESTS ]]; then
        print_success "すべてのテストが成功しました！"
        exit 0
    else
        print_error "一部のテストが失敗しました。"
        exit 1
    fi
}

# Cookieの内容を確認する関数
check_cookies() {
    print_info "=== Cookie確認 ==="
    if [[ -f "$COOKIE_JAR" ]]; then
        grep -E "(access_token|refresh_token)" "$COOKIE_JAR" | while read -r line; do
            print_info "Cookie: $line"
        done
    else
        print_warning "Cookieファイルが見つかりません"
    fi
}

# アクセストークンの有効期限切れをシミュレートする関数
simulate_token_expiry() {
    print_info "=== アクセストークン期限切れシミュレーション ==="
    print_warning "注意: 実際の有効期限切れテストには、JWTの有効期限を短く設定する必要があります"
    print_info "ここでは、現在のトークンでの認証がまだ有効であることを確認します"
}

# メイン関数
main() {
    setup_test
    
    # 1. ヘルスチェック
    run_test "ヘルスチェック" "200" \
        -X GET "$BASE_URL/health"
    
    echo ""
    
    # 2. ユーザー登録
    run_test "ユーザー登録" "201" \
        -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"displayName\": \"$TEST_DISPLAY_NAME\",
            \"password\": \"$TEST_PASSWORD\"
        }"
    
    check_cookies
    echo ""
    
    # 3. 重複ユーザー登録エラーテスト
    run_test "重複ユーザー登録エラー" "409" \
        -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"displayName\": \"別のユーザー\",
            \"password\": \"$TEST_PASSWORD\"
        }"
    
    echo ""
    
    # 4. ユーザー情報取得（登録時のCookieを使用）
    run_test "ユーザー情報取得（登録後）" "200" \
        -X GET "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 5. 表示名更新
    run_test "表示名更新" "200" \
        -X PUT "$BASE_URL/api/auth/me/display-name" \
        -H "Content-Type: application/json" \
        -d "{
            \"displayName\": \"$UPDATED_DISPLAY_NAME\"
        }"
    
    echo ""
    
    # 6. 更新後のユーザー情報取得
    run_test "ユーザー情報取得（更新後）" "200" \
        -X GET "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 7. ログアウト（Cookieクリア）
    print_info "ログアウト（Cookieクリア）をシミュレート"
    rm -f "$COOKIE_JAR"
    touch "$COOKIE_JAR"
    
    # 8. 認証なしでのアクセステスト
    run_test "認証なしでのユーザー情報取得エラー" "401" \
        -X GET "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 9. ログイン
    run_test "ログイン" "200" \
        -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"password\": \"$TEST_PASSWORD\"
        }"
    
    check_cookies
    echo ""
    
    # 10. ログイン後のユーザー情報取得
    run_test "ユーザー情報取得（ログイン後）" "200" \
        -X GET "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 11. 間違ったパスワードでのログインエラーテスト
    print_info "新しいセッションで間違ったパスワードテスト"
    local temp_cookie_jar="/tmp/temp_cookies.txt"
    run_test "間違ったパスワードでのログインエラー" "401" \
        -c "$temp_cookie_jar" \
        -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"password\": \"WrongPassword123!\"
        }"
    rm -f "$temp_cookie_jar"
    
    echo ""
    
    # 12. バリデーションエラーテスト
    run_test "無効なユーザーIDでの登録エラー" "400" \
        -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"ab\",
            \"displayName\": \"テスト\",
            \"password\": \"$TEST_PASSWORD\"
        }"
    
    echo ""
    
    run_test "無効なパスワードでの登録エラー" "400" \
        -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"validuser123\",
            \"displayName\": \"テスト\",
            \"password\": \"simple\"
        }"
    
    echo ""
    
    # 13. 無効なトークンテスト
    print_info "無効なCookieでのアクセステスト"
    echo "localhost:3001	FALSE	/	FALSE	0	access_token	invalid_token" > "$COOKIE_JAR"
    echo "localhost:3001	FALSE	/	FALSE	0	refresh_token	invalid_refresh_token" >> "$COOKIE_JAR"
    
    run_test "無効なトークンでのユーザー情報取得エラー" "401" \
        -X GET "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 14. 正常なトークンでログインし直す
    rm -f "$COOKIE_JAR"
    touch "$COOKIE_JAR"
    
    run_test "再ログイン" "200" \
        -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"password\": \"$TEST_PASSWORD\"
        }"
    
    echo ""
    
    # 15. トークンリフレッシュテスト（自動リフレッシュの確認）
    simulate_token_expiry
    
    run_test "トークンリフレッシュ後のユーザー情報取得" "200" \
        -X GET "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 16. ユーザー削除
    run_test "ユーザー削除" "204" \
        -X DELETE "$BASE_URL/api/auth/me"
    
    echo ""
    
    # 17. 削除後のログイン試行（削除されたユーザーでのログインエラー）
    print_info "削除されたユーザーでのログイン試行テスト"
    run_test "削除後のログイン試行エラー" "401" \
        -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"userId\": \"$TEST_USER_ID\",
            \"password\": \"$TEST_PASSWORD\"
        }"
    
    cleanup_test
}

# jqコマンドの存在確認
if ! command -v jq &> /dev/null; then
    print_warning "jqコマンドが見つかりません。JSONの整形表示が無効になります。"
    print_info "jqをインストールするには: sudo apt-get install jq (Ubuntu/Debian) または brew install jq (macOS)"
fi

# サーバーの起動確認
print_info "サーバーの起動確認中..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    print_error "サーバーに接続できません。$BASE_URL でサーバーが起動していることを確認してください。"
    exit 1
fi

print_success "サーバーへの接続を確認しました。"
echo ""

# メイン関数を実行
main