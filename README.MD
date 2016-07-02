# 【概要】

本アプリは以下の技術を、アプリの動作を見ながら学ぶ為に作りました。

* Node.js
* Express
* Angular2
* MongoDB
* TypeScript


予約管理できるシステムを意識した作りになっていて  
下の流れで動き見ていけるかと思います。

　①メンバー登録  
　②予約登録

動作環境は驚くほど簡単にできます。  
さらに、開発環境の構築にもそこまで時間を要しません。

また、本プロジェクトをベースにWebアプリの開発を行えば、基本設定をする手間無く素早い開発が出来るはずです。

<br>
# 対象
本アプリはAngular2とexpressで`TypeScript`を使っています。
なので、少なくとも`TypeScript`を使って行く気が無い方には向いていないと思います。

知識に関しては、オブジェクト指向の考え方が分かる人であれば、身に着けていけると思います。


<br>
# 前提
nodeがインストールされている必要があります。

Windowsですが、インストール手順はここら辺を参考にして下さい。  
nodeのバージョンを管理できるNodistのインストール手順になっています。  
[http://qiita.com/yokoh9/items/20d6bdc6030a3a861189](http://qiita.com/yokoh9/items/20d6bdc6030a3a861189)

※nodistのダウンロード先(ここのalphaではないlatest(0.7.2)を使う)  
[https://github.com/marcelklehr/nodist/releases/](https://github.com/marcelklehr/nodist/releases/)

<br>
# 【アプリ動作環境設定手順】

※全てWindowsを前提としています。

### ①ダウンロードしたファイルの中にある`learn-for-mean-master`を任意のフォルダに置いて下さい。  
　※ここでは`C:\`直下に置く前提で説明します。

### ②ダウンロードしたフォルダに移動して
nodeのパッケージをインストールします。

```
cd C:\learn-for-mean-master
npm install
```

### ③アプリを起動します。

```
npm start
```
※フォルダさえ合っていれば`start_node.cmd`で実行できるはずです。

### ④作ったサイトにアクセスします。  
[http://localhost:8080/](http://localhost:8080/)


これだけで、動作確認できる状態になりました。

アプリは以下のような機能も持ちますが、これだけで、これらも全て設定完了です。
* Webサーバ機能
* DB接続
* メール送信

あとは、それぞれの機能がどう実装されているか、修正したりしながら学習していきましょう。

<br>
# 【開発環境設定手順】
開発するにあたっては、`typescript`と`scss`をコンパイル出来る開発環境を前提としています。

<br>
## 【typescriptのコンパイル】

参考にVSCode(Visual Studio Code)を使う場合ですが、以下のサイトの手順でtypescriptをコンパイルする環境が作れます。  
http://qiita.com/tkyaji/items/33b3e0aef207c4e29b94  

<br>
【手順】  
### ①vscodeを以下でダウンロードしてインストール
https://code.visualstudio.com/Docs/?dv=win


### ②vscodeを実行し、プロジェクトフォルダを開く

### ③typeスクリプトのインストール（これだけは-gで入れる必要がある）
```
npm install -g typescript
```

### ④以下コマンドでtypescriptのコンパイルを監視(及び停止)
```
Ctrl+Shift+B
```
以上で、tsファイルを修正すれば、jsファイルにコンパイルできる状態になりました。  

※使っている設定ファイル
* `tasks.json` -> タスクの実行設定
* `tsconfig.json` -> コンパイル設定

【ついでに】  
本プロジェクトではexpressのテンプレートに`ect`を使っていますが、vsCodeはデフォルトでectのハイライトに対応していません。  
そこで、ectのハイライトを有効にする為に、以下のファイルの９行目に "extensions"の定義があるので、そこに".ect"を追加する事をおススメします。  
　`[プログラムフォルダ]Microsoft VS Code\resources\app\extensions\html\package.json  `

そうする事で"ect"ファイルにhtmlと同じハイライトが適用されます。
```
"extensions": [ ".html", ".htm", ".shtml", ".xhtml", ".mdoc", ".jsp", ".asp", ".aspx", ".jshtm", ".vue" ],
```
　　↓
```
"extensions": [ ".html", ".htm", ".shtml", ".xhtml", ".mdoc", ".jsp", ".asp", ".aspx", ".jshtm", ".vue",".ect" ],
```
※vsCodeのバージョンアップの都度設定が必要なので少し面倒です。

<br>
## 【SASSのコンパイル】
Bootstrapをcompassを使って導入しているので、以下の手順で設定しましょう。  
※上級者の方は、別の方法でも設定できるかと思います。

<br>
【手順】
### ①rubyをインストール  
以下の手順でrubyをインストールしましょう  
http://qiita.com/shimoju/items/41035b213ad0ac3a979e  
※`ruby -v`でバージョンを確認できる所まででOK
 
### ②compassのインストール  
以下サイトを参考にcompassの設定をします。  
http://qiita.com/makoto_kw/items/e6afe3c03abf3d3ff63e  
```
gem install compass
gem install bootstrap-sass
```
の所まででOK


### ③コマンドプロンプトで以下を実行して、sassの監視ができます。
```
compass watch C:\learn-for-mean-master\public
```
※ディレクトリさえ合っていれば、プロジェクト中の`compass_watch.cmd`で実行可能。

### ③-1 Windows-31jエラーが出る場合  
以下のサイトを参考に  
http://sssssn.com/archives/28
```
環境変数「RUBYOPT」に「-EUTF-8」を追加
```

### ③-2 "DEPRECATION WARNING on line 87 of"エラーが出る場合
エラーの原因になっている、以下のファイルの86～95行目をコメントアウト（64bitでv2.3.0のrubyの場合に出るのかも）  
C:\Ruby23-x64\lib\ruby\gems\2.3.0\gems\compass-core-1.0.3\stylesheets\compass\css3\_deprecated-support.scss

以上で、scssを修正すると、cssが出力されるはずです。

【参考】  
'_bootstrap-variables.scss'を修正する事で、Bootstrapの共通設定を変えたり、Bootstrapで使われている定数を参照できたりするので便利です。

<br>
# その他ポイント
* nodemonでtsファイルの変更を監視しています。  
　⇒設定ファイルは`nodemon.json`です。

<br>
# フォルダ構成
[ルート]  
├─.vscode			// vsCodeの設定  
├─bin				// アプリ起動設定ファイル  
├─node_modules	// node installで出来る  
├─public			// 画面側処理置き場  
│  ├─css			// SCSS置き場  
│  ├─fonts		// BootStrapで使うフォント  
│  ├─html		// angular2用のテンプレート(angular2)  
│  ├─img			// 画像  
│  ├─js			// 画面用TSファイル置き場(angular2,typescript)  
│  │  ├─bootstrap	// BootStrapを使うのに必要だった（はず）  
│  │  ├─front_helper	// 画面側JSの共通処理ファイル  
│  │  └─jquery		// Jquer系のライブラリ  
│  ├─lib				// 一部参照しないといけないライブラリがあります  
│  │  └─node_modules  
│  ├─markup_integrate  
│  └─_commons		// これは今となってはここにある必要は無い。プロジェクトごとにサブディレクトリを分けていた時の名残。public全体で共通のソース置き場。  
│      ├─css  
│      ├─img  
│      └─js  
├─server				// サーバ側ソース(express,typescript)  
│  ├─controler		// 画面処理系クラス(mongodb)  
│  ├─helper			// 画面に属しない共通処理用クラス  
│  ├─model			// DBアクセス用クラス(mongodb)  
│  ├─routes			// 処理振り分け（ルーター）クラス  
│  ├─views			// 画面用テンプレート  
│  └─_base			// 全体で共通の基底クラス、定義等  
└─vender				// 多分、必要なクラスの定義が入っている。  
    └─definitelyTyped  
