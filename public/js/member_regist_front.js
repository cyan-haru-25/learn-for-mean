"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../../vender/definitelyTyped/jquery.d.ts" />
const core_1 = require('angular2/core');
const base_front = require("./_base_front");
let ReservationFront = class ReservationFront extends base_front.BaseFront {
    /**
     * 初期処理
     */
    constructor() {
        super();
        this.title = "Hello World!";
        // 残念な事に、DatePickerで設定した日付はバインディング出来ていない。
        this.input = { name: "",
            email: "",
            password: "",
            password_check: "",
            tel: "",
            other: "",
        };
        // DatePickerの設定
        $('#birthday').datetimepicker(this.CommonHelper.datePicker_comOption);
    }
    /**
     * サブミット処理
     */
    form_validate() {
        if (this.input.password.length <= 4) {
            $("#password")[0].setCustomValidity("パスワードは5文字以上で入力して下さい。");
            return;
        }
        if (this.input.password !== this.input.password_check) {
            $("#password_check")[0].setCustomValidity("確認用のパスワードが正しくありません。");
            return;
        }
        // Ａｎｇｕｌａｒで取れない分の値
        var data = { birthday: $('#birthday').val() };
        $.ajax({
            url: "/regist/submit",
            data: $.extend(data, this.input),
            //type :'post',
            success: function (data) {
                alert(data);
            },
            error: function (data) {
                alert('エラーが発生しました。\n申し訳ありませんが、お急ぎの場合は弊社までお問合せ下さい。\n050-5880-5096');
            }
        });
        return false;
    }
};
ReservationFront = __decorate([
    core_1.Component({
        selector: 'my-app',
        directives: [core_1.FORM_DIRECTIVES],
        templateUrl: 'html/member_regist_template.html'
    })
], ReservationFront);
exports.ReservationFront = ReservationFront;
core_1.bootstrap(ReservationFront);
//# sourceMappingURL=member_regist_front.js.map