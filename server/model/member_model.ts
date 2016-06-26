// 設定ファイル
import config_class = require("../_base/_config_class");

// 親クラス
import base_model = require("./_base_model");

import mongodb = require('mongodb');

var member_collection;


// コレクションはクラスを作る前に作っておく
// こいつは node start した時点で実行される
mongodb.MongoClient.connect(config_class.ConfigClass.mongo_connect_url, function(err, database) {
    if(err)console.dir(err);
    member_collection = database.collection("members");
});


export class MemberModel extends base_model.BaseModel  // classを指定してクラス化
{

    // コンストラクター
    constructor()
    {
        super();
        // 自分のコレクションを親クラスに設定
        this.my_collection = member_collection;
    }

    /**
     * メンバー登録
     * 戻り値：Promise<登録したメンバーID>
     */
    public findMember(in_member_id:string,in_password:string):Promise<Object>{

        var member_info_promise:Promise<Object> = this.my_collection.findOne({mid:in_member_id,password:in_password},{});
        return member_info_promise;

    }

    /**
     * メンバー登録
     * 戻り値：Promise<登録したメンバーID>
     */
    public registMember(in_member_obj:Object):Promise<any>{
        var _self = this;

        return new Promise(function(resolve,reject){
            //var cursor = this.my_collection.find().sort({'mid':-1}).limit(1);
            // arg1:where句  arg2:field句 (0:除外 1:抽出) arg3:その他
            var find_max_mid:Promise<Object> = _self.my_collection.findOne({},{mid:1},{sort:{mid:-1}});
            find_max_mid.then(function(ret1){
                var _mid = "1";
                if(ret1){
                    _mid = ret1.mid.toString();
                }
                in_member_obj.mid = "TEST-9" + ("0000" + (parseInt(_mid.replace("TEST-","")) + 1)).slice(-5);
                
                // レコード登録
                _self.insertRecord(in_member_obj);

                console.info("registered member");
                console.dir(in_member_obj);
                resolve(in_member_obj.mid);
            }).catch(function(error){
                console.error("!!member regist error occured!!");
                console.dir(error);
                reject(error);
            });
        });
    }

}
