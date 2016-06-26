"use strict";
const common_helper = require("./front_helper/common_front_helper");
/**
 * FrontJSの共通クラス
 */
class BaseFront // classを指定してクラス化
 {
    /**
     * 初期処理
     */
    constructor() {
        // クラス名ログ出力
        console.log(this.constructor.toString().match(/\w+/g)[1] + " is created");
        this.CommonHelper = new common_helper.CommonFrontHelper;
        this.CommonHelper.ready_function();
    }
}
exports.BaseFront // classを指定してクラス化
 = BaseFront // classを指定してクラス化
;
//# sourceMappingURL=_base_front.js.map