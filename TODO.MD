# TODOリスト
今後勉強の目的も含めて追加していきたい機能  
作業状況を `[状況:名前]`で残す。  
```
状況： △->着手　○->完了
```

---
## [見た目部分]
* `[:]`モバイル版のメニューを、初期状態では表示されないようにして、表示時はタップしたら消えるようにする
* `[:]`ボタンを押して会員情報を取ってくる
* `[:]`予約画面に入る前にログインが求められ、ログイン後はいると、基本情報は画面に表示された状態になる
* `[:]`セッションに会員情報を保持して、セッションに情報が残っている間はログイン状態を保持
* `[:]`ログイン中のみ入れる登録情報確認・編集画面を作る
* `[:]`予約情報を検索機能付きで一覧表示
* `[:]`メンバー情報を検索機能付きで一覧表示
* `[:]`予約の状況をカレンダー形式で表示する。
* `[:]`現在サイトにアクセスしているユーザを別画面で確認可能とする（socket.io）

---
## [内部処理]
* `[:]`nodeの永続化
* `[:]`datetimepickerの値を、javascriptの変数に反映させる
* `[:]`ajaxの排除
* `[:]`ログ出力処理（ログ出力共通クラス作成）
* `[:]`エラーハンドリング処理（大きく囲んでどこで例外が起きても落ちないようにする）
* `[:]`apiの認証処理（現状どこからでもAPIにアクセス出来てしまう）
