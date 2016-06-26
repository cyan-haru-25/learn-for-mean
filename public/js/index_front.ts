/// <reference path="../../vender/definitelyTyped/jquery.d.ts" />
import {bootstrap, Component,FORM_DIRECTIVES} from 'angular2/core';
import base_front = require("./_base_front");

@Component({
    selector: 'my-app',
    directives: [FORM_DIRECTIVES],  // View->Modelが出来るようになる
    template: _template,
    //templateUrl:'http://localhost:3000/'
})

class IndexFront extends base_front.BaseFront{
      title: string = "Hello World!";
      constructor(){
          super();
      }
}

bootstrap(IndexFront);

