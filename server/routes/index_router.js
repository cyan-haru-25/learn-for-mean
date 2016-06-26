"use strict";
/// <reference path="../../vender/definitelyTyped/express.d.ts" />
const express = require('express');
const res_ctrl = require("../controler/reservation_controler");
const mem_reg_ctrl = require("../controler/member_regist_controler");
var mailer = require('nodemailer');
var router = express();
router.set('views', './server/views');
router.get('/', function (req, res, next) {
    var data = {
        title: "expressのテンプレート機能",
        subtitle: 'express[ect]',
        links: [{
                name: 'Google',
                url: 'http://google.com/'
            }, {
                name: 'Facebook',
                url: 'http://facebook.com/'
            }, {
                name: 'Twitter',
                url: 'http://twitter.com/'
            }],
        upperHelper: function (string) {
            return string.toUpperCase();
        }
    };
    res.render('index', data);
});
/**
 * 会員登録画面表示
 */
router.get('/regist', function (req, res, next) {
    console.log('/member-regist');
    res.render('member_regist');
});
/**
 * 会員登録
 */
router.get('/regist/submit', function (req, res, next) {
    console.log('/member-regist/submit');
    console.log(req.query);
    // メンバー登録処理
    var memberRegistCtrl = new mem_reg_ctrl.MemberRegistControler;
    memberRegistCtrl.memberRegistSubmit(req, res);
});
/**
 * 予約画面表示
 */
router.get('/reservation', function (req, res, next) {
    console.log('/reservation');
    res.render('reservation');
});
/**
 * 会員番号検索処理
 */
router.get('/reservation/search_mid', function (req, res, next) {
    console.log('accessed:/reservation/search_mid');
    console.log(req.query);
    // 予約登録処理
    var reservationCtrl = new res_ctrl.ReservationControler;
    reservationCtrl.searchMembeId(req, res);
});
/**
 * 予約申込み処理
 */
router.get('/reservation/submit', function (req, res, next) {
    console.log('accessed:/reservation/submit');
    console.log(req.query);
    // 予約登録処理
    var reservationCtrl = new res_ctrl.ReservationControler;
    reservationCtrl.reservationSubmit(req, res);
});
module.exports = router;
//# sourceMappingURL=index_router.js.map