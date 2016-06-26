import express = require('express');
import base_controler = require("./_base_controler");
import mail_helper = require("../helper/mail_helper");
import member_model = require("../model/member_model");

export class MemberRegistControler extends base_controler.BaseControler
{
    // コンストラクター
    constructor()
    {
        super();
    }

    /**
     * メール送信オブジェクト取得
     */
    public memberRegistSubmit(req: express.Request, res: express.Response):void
    {
        var mailHelper =  new mail_helper.MailHelper;
        var memberModel = new member_model.MemberModel;
        //SMTPの接続
        var smtp = mailHelper.getTransportObje();


        // メンバー登録
        memberModel.registMember(req.query).then(function(in_member_id:number){

            var res_msg = req.query.name+"様\n\n"
            + "お客様のメンバー仮登録が完了しました。\n\n"
            + "会員番号は以下になります。\n"
            + in_member_id + "\n\n"
            + 'パスワードはこちらです。\n'
            + req.query.password + "\n\n"
            + "\n"
            + mail_helper.CONST_BLUEWORKS_SIGN;

            //メールの内容
            var mailOptions = {
                from: mail_helper.CONST_FROM_ADDRESS,
                to: req.query.email,
                subject: 'send mail test',
                text: res_msg, // plaintext body
                //html: "<b>Hello world ✔</b>" // html body(こっちが優先されるらしい)
            };


            // 成功時
            // メール送信結果を持って結果を返す
            var sendMailPromis = new Promise(function (resolve, reject) {
                //メールの送信
                smtp.sendMail(mailOptions, function(err, res){
                    //送信に失敗したとき
                    if(err){
                        reject(err);
                    }else{
                        //送信に成功したとき
                        resolve();
                    }
                    //SMTPの切断
                    smtp.close();
                });

            });

            // メール送信実行
            sendMailPromis.then(
                // resolve時の処理
                function () {
                    console.log('send mail success!');
                    res.send('メンバー登録が完了しました。 メンバーIDは'+ in_member_id +'です。\n当IDで予約が可能です。\nさらに登録結果はyahooメールを使って登録したアドレスに送っています。');
                })
            .catch(
                // reject時の処理
                function (err) {
                    console.log(err);
                    console.log('Message sent: ' + err.message);
                    res.status(400);
                    res.send('メンバー登録が完了しています。IDは'+ in_member_id +'です。');
                }
            );
        }).catch(function(err){
            // reject時の処理
                console.log(err);
                console.log('Message sent: ' + err.message);
                res.status(400);
                res.send('メンバー登録に失敗しました');
        });

        
    };

}
