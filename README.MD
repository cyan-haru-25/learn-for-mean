# 概要

本アプリは以下の技術をざっくり学ぶ為に作りました。

* Node.js
* Express
* Angular2
* MongoDB
* TypeScript


予約管理できるシステムを意識した作りになっていて
下の流れで動き見ていけるかと思います。

　①メンバー登録  
　②予約登録

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
# 導入手順
・無線はDropBox等は切っておく

[nodist]
ここの手順でNodistとnodeをインストール
http://qiita.com/yokoh9/items/20d6bdc6030a3a861189

※nodist(ここのalphaではないlatest(0.7.2))を使う
　https://github.com/marcelklehr/nodist/releases/


あとはここを参考にワークショップをインストール
https://github.com/nodeschool/osaka/blob/master/setup/windows.md

*[手順]*  
※全てWindowsを前提としています。

①ダウンロードしたファイルの中にある`learn-for-mean-master`を任意のフォルダに置いて下さい。  
　※ここでは`C:\`直下に置く前提で説明します。

②ダウンロードしたフォルダに移動して
nodeのパッケージをインストールします。

```
cd C:\learn-for-mean-master
npm install
```

③アプリを起動します。

```
npm start
```

④作ったサイトにアクセスします。  
[http://localhost/](http://localhost/)


これだけで、先に書いた技術を使っての、以下の機能が使える状態になりました。

* Webサーバ機能
* DB接続
* メール送信

あとは、それぞれの機能がどう実装されているか、修正したりしながら学習していきましょう。

<br>
# 開発環境
開発するにあたっては、`typescript`と`scss`をコンパイル出来る開発環境を前提としています。

<br>
# 【typescriptのコンパイル】

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
以上で、tsファイルを修正すれば、jsファイルにコンパイルされます。  

※設定ファイル
* `tasks.json` -> タスクの実行設定
* `tsconfig.json` -> コンパイル設定


<br>
# 【SASSのコンパイル】
以下の設定で、プロジェクトファイル中にcompass用の設定ファイル`config.rb`をそのまま使えるはずです。  
Bootstrapをcompassを使って導入しているので、多分この設定じゃないと厳しい。

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

### ③'Windows-31jエラーが出る場合  
以下のサイトを参考に  
http://sssssn.com/archives/28
```
環境変数「RUBYOPT」に「-EUTF-8」を追加
```

以上で、scssを修正すると、cssが出力されるはずです。

【参考】  
'_bootstrap-variables.scss'を修正する事で、Bootstrapの共通設定を変えたり、Bootstrapで使われている定数を参照できたりするので便利です。

<br>
# その他ポイント
* nodemonでtsファイルの変更を監視しています。  
　⇒設定ファイルは`nodemon.json`です。