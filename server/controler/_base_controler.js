"use strict";
const base_class = require("../_base/_base_class");
class BaseControler extends base_class.BaseClass {
    // コンストラクター
    constructor() {
        super();
        console.log(this.constructor.toString().match(/\w+/g)[1] + " is created");
    }
}
exports.BaseControler = BaseControler;
//# sourceMappingURL=_base_controler.js.map