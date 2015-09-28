<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=0,minimal-ui">
		<title>fullpage test</title>
		<style>
			html,body{width:100%;height:100%;position: relative;}
			body{padding:0;margin:0;background:rgb(255,255,255);font-size:16px;overflow: hidden;}
			body,ul,li,h1,h2,h3,h4,h5,h6,p{padding:0;margin:0;}
			span{display:block;}
			.main{background:rgb(0,0,0);position: absolute;top:0;left:0;right:0;overflow: hidden;}
			.page{background:rgb(220,220,220);position: absolute;top:0;left:0;right:0;bottom:0;background-size: cover;}
			.page_nav{position: fixed;top:0;right:0;bottom:0;width:1em;z-index: 99999;}
			.page_nav_choose{width:0.5625em;height:0.5625em;border-radius: 0.625em;background:rgb(255,255,255);}
			.prev,.next{cursor:pointer;background:rgb(255,255,255);position: absolute;width:2.5em;text-align:center;height:1.25em;z-index:99999;border:0.0625em rgb(0,0,0) solid;}
			.prev{top:0;left:50%;}
			.next{bottom:0;right:50%;}
			.page0{background:url(1.jpg) center center no-repeat;}
			.page1{background:url(2.jpg) center center no-repeat;}
			.page2{background:url(3.jpg) center center no-repeat;}
		</style>
		<script src="jquery.js"></script>
		<script>
			;(function(win, $){
				var doc = win.document;
				console.log(win.navigator.userAgent)
				$(function(){
					var ua = win.navigator.userAgent.toLowerCase(),
						isMobile = function(){
							return /iphone|ipad|ipod/.test(ua) || (/android/.test(ua) && /mobile/.test(ua)) || /mobile/.test(ua);
						},
						time = 500,
						aniTimeout;

					var swipeDirection = function(x1, x2, y1, y2) {
						return Math.abs(x1 - x2) >=
							Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
					};

					$.fn.swipe = function(){
						var args = arguments,
							len = args.length;
						if (len == 2) {
							var touch = {},
								ftouch, swipeTimeout;
							$(this).off("touchstart").on("touchstart", function(e) {
								swipeTimeout && clearTimeout(swipeTimeout);
								ftouch = e.originalEvent.touches[0];
								touch.x1 = ftouch.pageX;
								touch.y1 = ftouch.pageY;
							}).off("touchmove").on("touchmove", function(e) {
								ftouch = e.originalEvent.touches[0];
								touch.x2 = ftouch.pageX;
								touch.y2 = ftouch.pageY;
							}).off("touchend").on("touchend", function(e) {
								if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))
									swipeTimeout = setTimeout(function() {
										var direction = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
										if (/Up|Left/.test(direction)) args[0]();
										if (/Down|Right/.test(direction)) args[1]();
										touch = {}
									}, 0);
							}).off("touchcancel").on("touchcancel", function(e) {
								swipeTimeout && clearTimeout(swipeTimeout);
							});
						}
						return this;
					};

					$.fn.mousewheel = function(){
						var args = arguments,
							len = args.length;
						if (len == 2){
							$(this).off("mousewheel").on("mousewheel", function(e){
			                    if (e.originalEvent.deltaY > 0)
			                        args[0]();
			                    else if (e.originalEvent.deltaY < 0)
			                        args[1]();
			                    /*if (e.deltaX > 0)
			                        o += ' east (' + e.deltaX + ')';
			                    else if (e.deltaX < 0)
			                        o += ' west (' + e.deltaX + ')';
			                    o += ' deltaFactor (' + e.deltaFactor + ')';*/
							});
						}
						return this;
					};

					$.fn.keySwipe = function(){
						var args = arguments,
							len = args.length;
						if (len == 2){
							$(this).off("keyup").on("keyup", function(e){
								if (e.originalEvent.keyCode == 40 || e.originalEvent.keyCode == 39){
									args[0]();
								}else if (e.originalEvent.keyCode == 38 || e.originalEvent.keyCode == 37){
									args[1]();
								}
							});
						}
						return this;
					};

					var handle = {
						_initPage:function(target){
							var pages = target.jq.find(".page_nav").html("").parent().find(".page"),
								pageLen = pages.length,
								pageHeight = $(win).height(),
								pageWidth = $(win).width();

							target.jq.css({
								width: pageWidth,
								height: pageHeight* pageLen
							});

							target.pages = pageLen;

							pages.each(function(i, elem){
								$(elem).css($.extend({
									top: 0,
									height: pageHeight
								}, (/left/.test(target.direction) ? {
									top: pageHeight * i
								} : {
									left: pageWidth * i
								}))).parent().find(".page_nav").append($("<span></span>").addClass('page_nav_choose').off("click").on("click", function(){
									target.page = i;
									target.goPage();
								})[(!isMobile() ? "show" : "hide")]());
							});

							$(".prev").hide().off("click").on("click", function(){
								target.nextPage();
							});
							$(".next").show().off("click").on("click", function(){
								target.prevPage();
							});

							if (target.mousewheel)
								$(win).mousewheel(function(){
									target.prevPage();
								},function(){
									target.nextPage();
								});

							if (isMobile()){
								target.jq.swipe(function(){
									target.prevPage();
								}, function(){
									target.nextPage();
								});								
							}

							if (target.keySwipe){
								$(win).keySwipe(function(){
									target.prevPage();
								}, function(){
									target.nextPage();
								});
							}

							target.goPage(0);

						},
						_prevPage: function(target) {
							target.timeout && clearTimeout(target.timeout);
							target.timeout = setTimeout(function() {
								handle._go(target, -1);
							}, time);
						},
						_nextPage: function(target) {
							target.timeout && clearTimeout(target.timeout);
							target.timeout = setTimeout(function() {
								handle._go(target, 1);
							}, time);
						},
						_go: function(target, type) {
							var pages = target.jq.find(".page"),
								page = target.page;
							page = page - type;
							if (page <= 0) page = 0; else if (page >= target.pages - 1) page = target.pages - 1;

							if (page != target.page){
								if (page == 0) {
									$(".prev").hide();
									$(".next").show();
								}else if (page == target.pages - 1){
									$(".prev").show();
									$(".next").hide();
								}else {
									$(".prev,.next").show();
								}
								target.page = page;
								handle._animate(target, page, type);
							}
						},
						_animate: function(target, page, type){
							target.handle[page] && target.handle[page].loading && target.handle[page].loading(page+1);
							target.jq.animate($.extend({
								top: 0
							}, (/left/.test(target.direction) ? {
								top: "-" + page * $(win).height()
							} : {
								left: "-" + page * $(win).width()
							})), time, function(){
								target.handle[page] && target.handle[page].loaded && target.handle[page].loaded(page+1);
							});
						}
					};

					var fullpage = function(ops){
						return new fullpage.fn.init(ops);
					};
					fullpage.fn = fullpage.prototype = {
						init: function(ops){
							this.page = 0;
							this.mousewheel = false;
							this.direction = "leftRight";
							this.keySwipe = false;
							this.handle = [];
							$.extend(this, ops);
							handle._initPage(this);
							var self = this;
							$(win).on("resize",function(){
								self.refresh();
							});
							return this;
						},
						refresh: function(){
							handle._initPage(this);
							return this;
						},
						prevPage: function(){
							var self = this;
							self.pageTimeout && clearTimeout(self.pageTimeout);
							self.pageTimeout = setTimeout(function(){
								handle._prevPage(self);
							}, time);
							return this;
						},
						nextPage: function(){
							var self = this;
							self.pageTimeout && clearTimeout(self.pageTimeout);
							self.pageTimeout = setTimeout(function(){
								handle._nextPage(self);
							}, time);
							return this;
						},
						goPage: function(num){
							num = num || this.page || 0;
							handle._animate(this, num);
							return this;
						}
					};
					fullpage.fn.init.prototype = fullpage.fn;

					fullpage.isMobile = isMobile;

					$.fn.fullpage = function(ops){
						return fullpage($.extend(ops || {}, {
							main: $(this).selector,
							jq: $(this)
						}));
					};

					$(".main").fullpage({
						mousewheel: true,
						keySwipe: true,
						direction: "leftRight",
						handle: [
							{
								loading: function(num) {
									console.log(num)
									console.log("nexting 1")
								},
								loaded: function(num) {
									console.log(num)
									console.log("next callback 1")
								}
							}, {
								loading: function(num) {
									console.log(num)
									console.log("nexting 2")
								},
								loaded: function(num) {
									console.log(num)
									console.log("next callback 2")
								}
							}, {
								loading: function(num) {
									console.log(num)
									console.log("nexting 3")
								},
								loaded: function(num) {
									console.log(num)
									console.log("next callback 3")
								}
							}
						]
					});
				});
			})(this, jQuery)
		</script>
	</head>
	<body>
		<span class="prev">prev</span>
		<span class="next">next</span>
		<div class="main">
			<div class="page page0">0</div>
			<div class="page page1">1</div>
			<div class="page page2">2</div>
			<div class="page_nav">loading...</div>
		</div>
	</body>
</html>
