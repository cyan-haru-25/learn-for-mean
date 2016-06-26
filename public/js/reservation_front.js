"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../vender/definitelyTyped/jquery.d.ts" />
const core_1 = require('angular2/core');
const base_front = require("./_base_front");
let ReservationFront = class ReservationFront extends base_front.BaseFront {
    /**
     * 初期処理
     */
    constructor() {
        super();
        this.title = "Hello World!";
        // 画面項目と対応したObject。初期値が必要な要素のみ値を設定。
        this.input = {};
        this.in_member_id = '';
        this.in_password_id = '';
        // DatePickerの設定
        $('#from_datetime').datetimepicker(this.CommonHelper.dateTimePicker_comOption);
        $('#to_datetime').datetimepicker(this.CommonHelper.dateTimePicker_comOption);
        // クリック時に入力チェック
        $("#reservation_submit").on('click', function (e) {
            // エラーの初期化
            $("#to_datetime")[0].setCustomValidity("");
            // 日付の大小チェック
            var from_date = $("#from_datetime").data("datetimepicker").getDate();
            var to_date = $("#to_datetime").data("datetimepicker").getDate();
            if ($("#to_datetime").val() == "") {
                $("#to_datetime")[0].setCustomValidity("このフィールドを入力して下さい。");
            }
            else if (to_date.getTime() <= from_date.getTime()) {
                $("#to_datetime")[0].setCustomValidity("終了日は開始日より後を設定して下さい。");
            }
        });
    }
    /**
     * メンバーID検索処理
     */
    mid_search() {
        // メンバーID・パスワードが未入力の場合は処理終了
        if (!this.input.member_id || !this.input.password)
            return;
        // id,パスワードが変わっていない場合は処理終了
        if (this.in_member_id == this.input.member_id &&
            this.in_password_id == this.input.password)
            return;
        // 入力値を保存
        this.in_member_id = this.input.member_id;
        this.in_password_id = this.input.password;
        var _self = this;
        $.ajax({
            url: "/reservation/search_mid",
            data: this.input,
            //type :'post',
            success: function (member_info) {
                if (member_info) {
                    _self.input.name = member_info.name;
                    _self.input.email = member_info.email;
                }
            },
            error: function (data) {
                alert('エラーが発生しました。\n申し訳ありませんが、お急ぎの場合は弊社までお問合せ下さい。\n050-5880-5096');
            }
        });
    }
    /**
     * サブミット処理
     */
    form_validate() {
        // 残念な事に、DatePickerで設定した日付はバインディング出来ていないので自分で設定。
        var data = { from_datetime: $('#from_datetime').val(),
            to_datetime: $('#to_datetime').val()
        };
        $.ajax({
            url: "/reservation/submit",
            data: $.extend(data, this.input),
            //type :'post',
            success: function (data) {
                alert(data);
            },
            error: function (data) {
                alert('エラーが発生しました。\n申し訳ありませんが、お急ぎの場合は弊社までお問合せ下さい。\n050-5880-5096');
            }
        });
        // Falseを返してサブミットしないようにする。
        return false;
    }
};
ReservationFront = __decorate([
    core_1.Component({
        selector: 'my-app',
        directives: [core_1.FORM_DIRECTIVES],
        templateUrl: 'html/reservation_template.html'
    })
], ReservationFront);
exports.ReservationFront = ReservationFront;
core_1.bootstrap(ReservationFront);
//# sourceMappingURL=reservation_front.js.map