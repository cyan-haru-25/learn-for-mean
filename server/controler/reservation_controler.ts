import express = require('express');
import base_controler = require("./_base_controler");
import mail_helper = require("../helper/mail_helper");
import res_model = require("../model/reservation_model");
import member_model = require("../model/member_model");

export class ReservationControler extends base_controler.BaseControler
{
    // コンストラクター
    constructor()
    {
        super();
    }

    /**
     * メンバーIDの検索
     */
    public searchMembeId(req: express.Request, res: express.Response):void
    {
        var memberModel = new member_model.MemberModel;
        memberModel.findMember(req.query.member_id,req.query.password).then(function(member_info:Object){
                res.status(200);
                res.send(member_info);
        }).catch(function(err){
                res.status(400);
                res.send('メンバー検索に失敗しました。');
        });
    }

    /**
     * メール送信オブジェクト取得
     */
    public reservationSubmit(req: express.Request, res: express.Response):void
    {
        var mailHelper =  new mail_helper.MailHelper;
        var resModel = new res_model.ReservationModel;

        // レコード登録
        resModel.insertRecord(req.query);

        //メールの内容
        var mailOptions = {
            from: mail_helper.CONST_FROM_ADDRESS,
            to: req.query.email,
            subject: '予約を承りました',
            text: "Hello world ✔", // plaintext body
            html: "<b>Hello world ✔</b>" // html body(こっちが優先されるらしい)
        };

        //SMTPの接続
        var smtp = mailHelper.getTransportObje();

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
                res.send('メールを送信しました。<br>弊社からの折り返しの連絡をお待ち下さい。');
            })
           .catch(
            // reject時の処理
            function (err) {
                console.log(err);
                console.log('Message sent: ' + err.message);
                res.status(400);
                res.send('メールの送信に失敗しました');
            }
        );
        
    };

}
