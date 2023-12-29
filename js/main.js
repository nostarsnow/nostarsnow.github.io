require([], function (){

	var isMobileInit = false;
	var loadMobile = function(){
		require(['/js/mobile.js'], function(mobile){
			mobile.init();
			isMobileInit = true;
		});
	}
	var isPCInit = false;
	var loadPC = function(){
		require(['/js/pc.js'], function(pc){
			pc.init();
			isPCInit = true;
		});
	}

	var browser={
	    versions:function(){
	    var u = window.navigator.userAgent;
	    return {
	        trident: u.indexOf('Trident') > -1, //IE内核
	        presto: u.indexOf('Presto') > -1, //opera内核
	        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
	        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
	        mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
	        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
	        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
	        iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者安卓QQ浏览器
	        iPad: u.indexOf('iPad') > -1, //是否为iPad
	        webApp: u.indexOf('Safari') == -1 ,//是否为web应用程序，没有头部与底部
	        weixin: u.indexOf('MicroMessenger') == -1 //是否为微信浏览器
	        };
	    }()
	}

	$(window).bind("resize", function(){
		if(isMobileInit && isPCInit){
			$(window).unbind("resize");
			return;
		}
		var w = $(window).width();
		if(w >= 700){
			loadPC();
		}else{
			loadMobile();
		}
	});

	if(browser.versions.mobile === true || $(window).width() < 700){
		loadMobile();
	}else{
		loadPC();
	}

	//是否使用fancybox
	if(yiliaConfig.fancybox === true){
		require(['/fancybox/jquery.fancybox.js'], function(pc){
			var isFancy = $(".isFancy");
			if(isFancy.length != 0){
				var imgArr = $(".article-inner img");
				for(var i=0,len=imgArr.length;i<len;i++){
					var src = imgArr.eq(i).attr("src");
					var title = imgArr.eq(i).attr("alt");
					imgArr.eq(i).replaceWith("<a href='"+src+"' title='"+title+"' rel='fancy-group' class='fancy-ctn fancybox'><img src='"+src+"' title='"+title+"'></a>");
				}
				$(".article-inner .fancy-ctn").fancybox();
			}
		});
		
	}
	//是否开启动画
	if(yiliaConfig.animate === true){

		require(['/js/jquery.lazyload.js'], function(){
			//avatar
			$(".js-avatar").each(function(){
				var $t = $(this);
				$t.attr("src", $t.attr("lazy-src"));
				this.onload = function(){
					$t.addClass("show");
				}
			})
			
		});
		
		if(yiliaConfig.isHome === true){
			//content
			function showArticle(){
				$(".article").each(function(){
					if( $(this).offset().top <= $(window).scrollTop()+$(window).height() && !($(this).hasClass('show')) ) {
						$(this).removeClass("hidden").addClass("show");
						$(this).addClass("is-hiddened");
					}else{
						if(!$(this).hasClass("is-hiddened")){
							$(this).addClass("hidden");
						}
					}
				});
			}
			$(window).on('scroll', function(){
				showArticle();
			});
			showArticle();
		}
		
	}
	
	//是否新窗口打开链接
	if(yiliaConfig.open_in_new == true){
		$(".article a[href]").attr("target", "_blank")
	}
	(function(){
	if ( $(".post-toc").length > 0 ){
		var $postToc = $(".post-toc"),
			$postTocOl = $("<div/>").addClass("post-toc-ol"),
			$articleEntry = $(".article-entry"),
			$articleChildren = $articleEntry.children(),
			$tocBtn = $("<div/>").addClass("post-toc-btn");
		if ( $articleEntry.find("h2").length < 1 ){
			return false;
		}
		$tocBtn.opts = {
			showClass : "current", 
			plus : '+ 展开目录',
			minus : '- 隐藏目录',
		};
		$postToc.opts = {
			h2 : [],
			h3 : []
		};
		var	tocHtml = function(article,tagName){
				var h2 = h3 = 0,
					html = '<ol class="post-toc-nav">',
					length = article.length;
				article.each(function(index,el){
					var $t = $(this),
						tag = this.tagName.toLowerCase(),
						id = $t.attr('id'),
						text = $t.text();
					if ( tag === "h2" ){
						if ( h3 !== 0 ){
							html += '</ol>';
						}
						if ( h2 !== 0 ){
							html += '</li>';
						}
						h2++;
						h3 = 0;
						html += '<li class="toc-nav-item toc-nav-level-2">' +
									'<a href="#' + id + '">' +
										'<span class="toc-nav-number">' +
											h2 +'. ' +
										'</span>' +
										'<span class="toc-nav-text">' +
											text +
										'</span>' +
									'</a>';
					}
					if ( tag === "h3" ){
						if ( h3 === 0 ){
							html += '<ol class="toc-nav-child">';
						}
						h3++;
						html += '<li class="toc-nav-item toc-nav-level-3">' +
									'<a href="#' + id + '">' +
										'<span class="toc-nav-number">' +
											h2 + '-' + h3 +'. ' +
										'</span>' +
										'<span class="toc-nav-text">' +
											text +
										'</span>' +
									'</a>' +
								'</li>';
					}
					if ( index === ( length - 1 ) ){
						html += '</li>';
					}
				});
				html += '</ol>';
				return html;
			},
			scrollToc = function(){
				var now = +new Date;
				if ( scrollGoing || now - lastTime < 20 ){
					return false;
				}
				lastTime = now;
				var windowTop = $window.scrollTop();
				$h2.removeClass('current');
				$h3.removeClass('current');
				for (var i = 0,length = $postToc.opts.h2.length; i < length; i++) {
					var $t = $postToc.opts.h2[i].html,
						top = $t.offset().top;
					if ( windowTop >= top ){
						if ( $postToc.opts.h2[i+1] === undefined || windowTop < $postToc.opts.h2[i+1].html.offset().top ){
							$h2.removeClass('current');
							$postToc.opts.h2[i].toc.addClass('current');
							break;
						}
					}
				};
				for (var i = 0,length = $postToc.opts.h3.length; i < length; i++) {
					var $t = $postToc.opts.h3[i].html,
						top = $t.offset().top;
					if ( windowTop >= top ){
						if ( $postToc.opts.h3[i].toc.parents(".toc-nav-item").hasClass('current') && ($postToc.opts.h3[i+1] === undefined || windowTop < $postToc.opts.h3[i+1].html.offset().top) ){
							$h3.removeClass('current');
							$postToc.opts.h3[i].toc.addClass('current');
							break;
						}
					}
				};
			};
		$postToc.html($tocBtn).append($postTocOl.html(tocHtml($(".article-entry").children())));
		var $h2 = $postTocOl.find(".toc-nav-level-2"),
			$h3 = $postTocOl.find(".toc-nav-level-3"),
			lastTime = 0,
			scrollGoing = false;
			$window = $(window);
		$h2.each(function(){
			var $t = $(this);
			$postToc.opts.h2.push({
				toc : $t,
				html : $($(this).find(">a").attr("href"))
			});
		});
		$h3.each(function(){
			var $t = $(this);
			$postToc.opts.h3.push({
				toc : $t,
				html : $($(this).find(">a").attr("href"))
			});
		});
		$tocBtn.on("click",function(){
			if ( $tocBtn.hasClass($tocBtn.opts.showClass) ){
				$tocBtn.removeClass($tocBtn.opts.showClass).html($tocBtn.opts.plus);
				$postTocOl.slideUp(300);
			}else{
				$tocBtn.addClass($tocBtn.opts.showClass).html($tocBtn.opts.minus);
				$postTocOl.slideDown(300);
			}
		});
		$tocBtn.trigger('click');
		$window.on('scroll',scrollToc);
		$postTocOl.on("click","a",function(e){
			e.preventDefault();
			var $t = $(this),
				href = $t.attr("href");
			scrollGoing = true;
			$("html,body").animate({scrollTop : $(href).offset().top - 15},500,function(){
				setTimeout(function(){
					scrollGoing = false;
				},100);
			});
			$h2.removeClass('current');
			$h3.removeClass('current');
			$t.parent().addClass('current');
			if ( $t.parent().hasClass('toc-nav-level-3') ){
				$t.parents(".toc-nav-level-2").addClass('current');
			}
		});
	}
	}());
});