$(function(){

    // textail対応
    $("#markup_input").val(getLocalStorage(MARKUP_KEY));
    var $org = $("#markup_input");	// 入力側
    var $text_target = $("#markup_preview");	// プレビュー側
    var $first_prev = $("#markup_preview_first");
    var $text_prev = $('#markup_preview_last');

    var markuped_val = '';
    // Message入力値を変換する処理
    var convert = function() {
        setTimeout(function() {
            try {
                //markuped_val = textiled($org.val());
                markuped_val = marked($org.val()).replace(/&gt;/g,'>');

                $first_prev.val(markuped_val);

                markuped_val = textiled(markuped_val);
                $text_target.html(markuped_val);
                $text_prev.val(markuped_val);
                setLocalStorage(MARKUP_KEY,$("#markup_input").val());
            } catch(err) {
                $text_target.html("Error occurred!");
                throw err;
            }

        }, 0);
    };
    // とりあえず１回変換
    convert();

    // その後、キーダウンイベント設定
    $org.bind("keydown", convert);
});

/***************************************************
 * ストレージ
 ****************************************************/
var globalLocalStorages = localStorage;
var MARKUP_KEY = "markup_storage_key";
// セッションデータ取得(Jsonデータと判断できる場合はparseして返す)
function getLocalStorage(key) {

    var ret_val = globalLocalStorages.getItem(key);
    try{
        ret_val = JSON.parse(ret_val);
    }catch(e){
        
    }
    
    return ret_val;
}


// localStorageへの格納(オブジェクトの場合は文字列に変換して格納)
function setLocalStorage(key,value) {

    // 値の入力チェック
    if (key) {
        globalLocalStorages.removeItem(key);
        if(typeof value === 'object'){
            globalLocalStorages.setItem(key, JSON.stringify(value));
        }else{
            globalLocalStorages.setItem(key, value);
        }
    }

}

// localStorageから削除
function removeLocalStorage(key) {
    globalLocalStorages.removeItem(key);
}

// localStorageからすべて削除
function removeAllLocalStorage() {
    globalLocalStorages.clear();
}