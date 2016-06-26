import base_class = require("../_base/_base_class");

export class BaseControler extends base_class.BaseClass
{

    // コンストラクター
    constructor()
    {
        super();
        console.log(this.constructor.toString().match(/\w+/g)[1] + " is created");
    }

}
