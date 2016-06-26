// 設定ファイル
import config_class = require("../_base/_config_class");

// 親クラス
import base_model = require("./_base_model");

import mongodb = require('mongodb');

var reservation_collection;


// コレクションはクラスを作る前に作っておく
// こいつは node start した時点で実行される
mongodb.MongoClient.connect(config_class.ConfigClass.mongo_connect_url, function(err, database) {
    if(err)console.dir(err);
    reservation_collection = database.collection("reservation");
});


export class ReservationModel extends base_model.BaseModel  // classを指定してクラス化
{

    // コンストラクター
    constructor()
    {
        super();
        // 自分のコレクションを親クラスに設定
        this.my_collection = reservation_collection;
    }

}
