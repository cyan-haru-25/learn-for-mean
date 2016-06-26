/* =========================================================*/
// jquery.rollover.js / ver.1.1

// Copyright (c) 2015 CoolWebWindow
// This code is released under the MIT License
// https://osdn.jp/projects/opensource/wiki/licenses%2FMIT_license

// Date: 2015-12-28
// Author: CoolWebWindow
// Mail: info@coolwebwindow.com
// Web: http://www.coolwebwindow.com

// Used jquery.js
// http://jquery.com/
/* =========================================================*/

$(function($){
    $.fn.rollover = function() {
        return this.each(function() {
            // 画像名を取得
            var src = $(this).attr('src');
            //すでに画像名に「_on.」が付いていた場合、ロールオーバー処理をしない
            if (src.match('_on.')) return;
            // ロールオーバー用の画像名を取得（_onを付加）
            var src_on = src.replace(/^(.+)(\.[a-z]+)$/, "$1_on$2");
            // 画像のプリロード（先読み込み）
            $('<img>').attr('src', src_on);
            // スマホ対応
            var onMouseover = ('ontouchstart' in document) ? 'touchstart' : 'mouseenter';
            var onMouseout = ('ontouchstart' in document) ? 'touchend' : 'mouseleave';
            // ロールオーバー処理
            $(this).on(onMouseover,function() {
                 $(this).attr('src', src_on);
            });
            $(this).on(onMouseout,function() {
                 $(this).attr('src', src);
            });
       });
    };
});
