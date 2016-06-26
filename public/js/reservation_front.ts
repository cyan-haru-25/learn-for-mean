/// <reference path="../../../vender/definitelyTyped/jquery.d.ts" />
import {bootstrap, Component,FORM_DIRECTIVES} from 'angular2/core';
import base_front = require("./_base_front");

@Component({
    selector: 'my-app',
    directives: [FORM_DIRECTIVES],  // View->Modelが出来るようになる
    templateUrl: 'html/reservation_template.html'
    //templateUrl:'http://localhost:3000/'
})

export class ReservationFront extends base_front.BaseFront{
      private title: string = "Hello World!";
      // 残念な事に、DatePickerで設定した日付はバインディング出来ていない。
    //   private input:Object = {name:"",
    //                         email:"",
    //                         bike_type:"FZ-1",
    //                         other:"",
    //                         member_id:""
    //                     };
    // 画面項目と対応したObject。初期値が必要な要素のみ値を設定。
      private input:Object = {
                            bike_type:"FZ-1",
                        };

      private in_member_id:string = '';
      private in_password_id:string = '';


      /**
       * 初期処理
       */
      constructor()
      {
        super();

        // DatePickerの設定
        $('#from_datetime').datetimepicker(this.CommonHelper.dateTimePicker_comOption);
        $('#to_datetime').datetimepicker(this.CommonHelper.dateTimePicker_comOption);

        // クリック時に入力チェック
        $("#reservation_submit").on('click',function(e) {
            // エラーの初期化
            $("#to_datetime")[0].setCustomValidity(""); 

            // 日付の大小チェック
            var from_date = $("#from_datetime").data("datetimepicker").getDate();
            var to_date = $("#to_datetime").data("datetimepicker").getDate();

            if($("#to_datetime").val() == ""){
            $("#to_datetime")[0].setCustomValidity("このフィールドを入力して下さい。"); 
            }else if(to_date.getTime() <= from_date.getTime()){
            $("#to_datetime")[0].setCustomValidity("終了日は開始日より後を設定して下さい。"); 
            }

        });
      }

      /**
       * メンバーID検索処理
       */
        public mid_search(){

            // メンバーID・パスワードが未入力の場合は処理終了
            if(!this.input.member_id || !this.input.password)return;
            // id,パスワードが変わっていない場合は処理終了
            if(
                this.in_member_id == this.input.member_id &&
                this.in_password_id == this.input.password
            )return;
            // 入力値を保存
            this.in_member_id = this.input.member_id;
            this.in_password_id = this.input.password;

            var _self = this;
            $.ajax({
                url: "/reservation/search_mid",
                data: this.input,
                //type :'post',
                success: function(member_info) {
                    if(member_info){
                        _self.input.name = member_info.name;
                        _self.input.email = member_info.email;
                    }
                },
                error: function(data) {
                    alert('エラーが発生しました。\n申し訳ありませんが、お急ぎの場合は弊社までお問合せ下さい。\n050-5880-5096');
                }
            });
        }

      /**
       * サブミット処理
       */
        public form_validate(){
            var data = {from_datetime:$('#from_datetime').val(),
                    to_datetime:$('#to_datetime').val()
                };

            $.ajax({
                url: "/reservation/submit",
                data: $.extend(data,this.input),
                //type :'post',
                success: function(data) {
                    alert(data);
                },
                error: function(data) {
                    alert('エラーが発生しました。\n申し訳ありませんが、お急ぎの場合は弊社までお問合せ下さい。\n050-5880-5096');
                }
            });
            // Falseを返してサブミットしないようにする。
            return false;
        }
}

bootstrap(ReservationFront);