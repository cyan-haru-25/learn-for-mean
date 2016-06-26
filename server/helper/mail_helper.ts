export var CONST_BLUEWORKS_SIGN = "○○株式会社\n" 
    + "　電話 ： (land)06-XXXX-XXXX\n"
    + "　　　　(mobile)090-XXXX-XXXX\n"
    + "　　メール ： free_use_mail_87@yahoo.co.jp\n"
    + "\n";

export var CONST_FROM_ADDRESS = "テスト用yahooメール<free_use_mail_87@yahoo.co.jp>";

export class MailHelper  // classを指定してクラス化
{



    // 【参考】※バージョンはここに書いてあるものと合わせよう
    // http://kurukurupapa.hatenablog.com/entry/2016/02/21/192714
    private mailer = require('nodemailer');
    private smtpTransport = require("nodemailer-smtp-transport");
    // コンストラクター
    constructor()
    {
        console.log(this.constructor.toString().match(/\w+/g)[1] + " is created");
    }

    /**
     * メール送信オブジェクト取得
     */
    public getTransportObje():any
    {
        //SMTPの設定
        var setting = {
            // yahooメールを使う場合（送信元はヤフーのアドレスにしないと送れない）
            host: "smtp.mail.yahoo.co.jp",
            port: 465,
            secure: true,
            auth: {
                user: 'free_use_mail_87',
                pass: 'freeusemail'
            },
        };

        //SMTPの接続
        return this.mailer.createTransport(this.smtpTransport(setting));
    };

    /**
     * メールボディ取得
     */
    public getMailBody(p_type:number,p_param:Object) :string
    {
        return 'mail-body';
    }
}
