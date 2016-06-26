/// <reference path="../../vender/definitelyTyped/jquery.d.ts" />
import {bootstrap, Component,FORM_DIRECTIVES} from 'angular2/core';
import base_front = require("./_base_front");

@Component({
    selector: 'my-app',
    directives: [FORM_DIRECTIVES],  // View->Modelが出来るようになる
    templateUrl: 'html/member_regist_template.html'
    //templateUrl:'http://localhost:3000/'
})

export class ReservationFront extends base_front.BaseFront{
      private title: string = "Hello World!";
      // 残念な事に、DatePickerで設定した日付はバインディング出来ていない。
      private input:Object = {name:"",
                            email:"",
                            password:"",
                            password_check:"",
                            tel:"",
                            other:"",
                        };

      /**
       * 初期処理
       */
      constructor()
      {
        super();
        // DatePickerの設定
        $('#birthday').datetimepicker(this.CommonHelper.datePicker_comOption);

      }

      /**
       * サブミット処理
       */
        public form_validate(){
            if(this.input.password.length <=4){
                $("#password")[0].setCustomValidity("パスワードは5文字以上で入力して下さい。"); 
                return;
            }
            if(this.input.password !== this.input.password_check){
                $("#password_check")[0].setCustomValidity("確認用のパスワードが正しくありません。"); 
                return;
            }

            // Ａｎｇｕｌａｒで取れない分の値
            var data = {birthday:$('#birthday').val()};

            $.ajax({
                url: "/regist/submit",
                data: $.extend(data,this.input),
                //type :'post',
                success: function(data) {
                    alert(data);
                },
                error: function(data) {
                    alert('エラーが発生しました。\n申し訳ありませんが、お急ぎの場合は弊社までお問合せ下さい。\n050-5880-5096');
                }
            });
            return false;
        }
}

bootstrap(ReservationFront);