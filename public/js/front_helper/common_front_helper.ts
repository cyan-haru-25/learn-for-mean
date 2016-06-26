/// <reference path="../../../../DefinitelyTyped-master/jquery/jquery.d.ts" />


/* ===================================================================

 * PC向けメニュー

=================================================================== */
// $(function($) {
// 	$(window).on('scroll', function() {
// 		var headerH = $('header').outerHeight(true);
// 		if ($(this).scrollTop() > headerH) {
// 			$('nav').addClass('fixed');
// 		} else {
// 			$('nav').removeClass('fixed');
// 		}
// 	});
// });


/* ===================================================================

 * スマホ向けメニュー

=================================================================== */

export class CommonFrontHelper
{
	/**
	 * dateTimePickerの共通のオプション
	 */
	public dateTimePicker_comOption:Object = {
            format: 'yyyy/mm/dd  hh時',
            language: 'ja',
            autoclose:true,
            weekStart:1,
            minView: 1
        }

	/**
	 * dateTimePickerの共通のオプション
	 */
	public datePicker_comOption:Object = {
            format: 'yyyy/mm/dd',
            language: 'ja',
            autoclose:true,
            weekStart:1,
            minView: 2
        }

	/**
	 * 初期処理
	 */
	public ready_function():void
	{
		$('#spMenu').hide();
		var windowWidth = window.innerWidth || document.documentElement.clientWidth || 0;

		// 読み込み時処理
		slideMenu();
		headerHight();
		summay();
		spMenu();
		subNav();

		// formの共通設定
		$('form input:not(.btn),form select,form textarea').each(function(_index,_elm){
			$(_elm).addClass('form-control');
			var _id = $(_elm).attr('id');
			if(_id){
				$(_elm).attr('name',_id);
				$(_elm).parent().find('label').attr('for',_id);
			}
		});
		

		// リサイズ時処理
		$(window).on('resize', function(){
			var nowWidth = window.innerWidth || document.documentElement.clientWidth || 0;
			if(windowWidth != nowWidth) {
				slideMenu();
				headerHight();
			}
		});

		// Markupの返還
		$(".markup_textile").each(function(_index,_elm){
			$(_elm).html(textiled($(_elm).html().replace(/\t/g, "")));
		});
		$(".markup_integrate").each(function(_index,_elm){
			//$(_elm).html(marked($(_elm).html()));
			$(_elm).html(get_markuped($(_elm).html()));
			$(_elm).find('table').addClass('table table-bordered table-hover table-responsive table_base');
			$(_elm).find('table').each(function(__index,__elm){
				$(__elm).wrap("<div class='table_wraper'></div>");
			});
		});

		// PCとスマートフォンのメニュー切り替え
		function slideMenu() {
			if ($('article#main').css('float') == 'none') {
				$('#spMenu').show();
				$('.gnav').hide();
			}else {
				$('#spMenu').hide();
				$('.gnav').show();
				$('.gnav').css("display","");
			}
		}

		// ヘッダー分の余白調整
		function headerHight() {
			// if ($('main').css('float') == 'none') {
			// 	var headerH = $('header').outerHeight(true);
			// 	$('body').css({'margin-top' : headerH});
			// }else {
				// $('body').css({'margin-top' : 0});
			// }
		}

		// メニューボタンの表示（
		function spMenu() {
			$('#spMenu').on('click', function(e) {
				$('.gnav').slideToggle(e);
				$('#navBtnIcon').toggleClass('nav_close');
				$('html, body').toggleClass('lock');
			});
		}

		// サブメニューの表示
		function subNav() {
			if ($('article#main').css('float') == 'none') {
				$('.subnav > a').on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					$(this).parent().find('ul').slideToggle();
					$(this).parent().toggleClass('active');
				});
			} else {
				if('ontouchstart' in document) {
					$('.subnav > a').on('click', function(e) {
						e.preventDefault();
						$(this).parent().toggleClass('showNav');
						$(this).parent().find('li').toggleClass('showSub');
					});
				} else {
					$('.subnav').hover(function(){
						$(this).find('li').addClass('showSub');
					}, function(){
						$(this).find('li').removeClass('showSub');
					});
				}
			}
		}

		// 要約部分の非表示
		function summay() {
			if ($('article#main').css('float') == 'none') {
				var position = 50; // 非表示位置
				var $element = $('.summary');
				if ($(window).scrollTop() > position){
					$element.hide();
				}
				$(window).on('scroll', function(){
					if ($(this).scrollTop() >= position) {
						$element.not(':animated').hide();
					} else {
						$element.not(':animated').show();
					}
					headerHight();
				});
			}
		}

	}
}

