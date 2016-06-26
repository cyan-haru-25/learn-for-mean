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
let IndexFront = class IndexFront extends base_front.BaseFront {
    constructor() {
        super();
        this.title = "Hello World!";
    }
};
IndexFront = __decorate([
    core_1.Component({
        selector: 'my-app',
        directives: [core_1.FORM_DIRECTIVES],
        template: _template,
    })
], IndexFront);
core_1.bootstrap(IndexFront);
//# sourceMappingURL=index_front.js.map