/// <reference path="../../vender/definitelyTyped/mongodb.d.ts" />

import base_class = require("../_base/_base_class");
import mongodb = require('mongodb');

export abstract class BaseModel extends base_class.BaseClass  // classを指定してクラス化
{

    public my_collection:mongodb.Collection;

    // コンストラクター
    constructor()
    {
        super();
        console.log(this.constructor.toString().match(/\w+/g)[1] + " is created");
    }

    /**
     * レコード登録
     */
    public insertRecord(reservation:Object):boolean
    {
        this.my_collection.insert(reservation,function(err,obj){
            if(err)console.error(err);
            console.dir(obj);
        })
        return true;
    }

}
