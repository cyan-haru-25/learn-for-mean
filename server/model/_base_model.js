/// <reference path="../../vender/definitelyTyped/mongodb.d.ts" />
"use strict";
const base_class = require("../_base/_base_class");
class BaseModel extends base_class.BaseClass {
    // コンストラクター
    constructor() {
        super();
        console.log(this.constructor.toString().match(/\w+/g)[1] + " is created");
    }
    /**
     * レコード登録
     */
    insertRecord(reservation) {
        this.my_collection.insert(reservation, function (err, obj) {
            if (err)
                console.error(err);
            console.dir(obj);
        });
        return true;
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=_base_model.js.map