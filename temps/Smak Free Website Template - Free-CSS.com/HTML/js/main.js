'use strict';

//Initial testimonial slider
$('#testimonials').bxSlider({
	mode: 'fade',
	auto: true,
	autoControls: true,
	controls: false
});

//carusel for clients
$('.client-slider').bxSlider({
	pager: false,
	minSlides: 1,
	maxSlides: 6,
	moveSlides: 2,
	slideWidth: 130,
	slideMargin: 25,
	prevSelector: $('#client-prev'),
	nextSelector: $('#client-next'),
	prevText: '<i class="fa fa-angle-double-left"></i>',
	nextText: '<i class="fa fa-angle-double-right"></i>'
});

$('.text-slider').bxSlider({
	pager: false,
	prevText: '<i class="fa fa-angle-left fa-3x"></i>',
	nextText: '<i class="fa fa-angle-right fa-3x"></i>'
	
});

//Efext on labels on contact form
$("input.label_better, textarea.label_better").label_better({
	animationTime: 500,
	easing: "bounce",
	offset: 0,
	hidePlaceholderOnFocus: true
});

$("#Grid").mixitup({});




function homeFullScreen() {

	var homeSection = $('.home');
	var windowHeight = $(window).outerHeight();

	if (homeSection.hasClass('home-fullscreen')) {

		$('.home-fullscreen').css('height', windowHeight);
	}
}

function stickyMenu() {

	var scrollTop = $(window).scrollTop();
	var offset = 0;

	if (scrollTop > offset) {
		$('#navbar').addClass('navbar-small');
	} else {
		$('#navbar').removeClass('navbar-small');
	}
}


function inviewAnimation() {

	$('.skills').bind('inview', function () {

		$('.skill').easyPieChart({
			size: 140,
			animate: 2000,
			lineWidth: 6,
			lineCap: 'square',
			barColor: '#ffe600',
			trackColor: '#ffffff',
			scaleColor: false
		});
	})

	$('.numbers').one('inview', function (event, visible) {

		if (visible === true) {

			$('.numbers .number').each(function () {
				var element = $(this);
				var duration = element.attr('data-duration');
				var count = element.attr('data-count')
				var id = element.attr('id');
				var numAnim = new countUp(id, 0, count, 0, duration);
				numAnim.start();

			})
		}

	})
	
	$('.heading > h1').one('inview', function(event, visible){
		$(this).addClass('animate fadeInRight');
	});
	
	$('.heading > div').one('inview', function(event, visible){
		$(this).addClass('animate fadeInLeft');
	});
	
	$('.process-item').one('inview', function(event, visible){
		$(this).addClass('animate fadeInLeft');
	});
	
	$('.service-item').one('inview', function(event, visible){
		$(this).addClass('animate');
	})
	
	$('.adress-element').one('inview', function(event, visible){
		$(this).addClass('animate fadeInUp');
	})
	
	$('.about-item').one('inview', function(event, visible){
		$(this).addClass('animate fadeInUp');
	})
}

function filterPath(string) {
	return string.replace(/^\//, '').replace(/(index|default).[a-zA-Z]{3,4}$/, '').replace(/\/$/, '');
}

function singlePageNav() {
	
	var lastId,
        topMenu = $(".navbar"),
        topMenuHeight = topMenu.outerHeight(),
        // All list items
        menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function () {
            var item = $($(this).attr("href"));
            if (item.length) {
                return item;
            }
        });

	$('a[href*=#]').each(function () {
		if (filterPath(location.pathname) == filterPath(this.pathname) && location.hostname == this.hostname && this.hash.replace(/#/, '')) {
			var $targetId = $(this.hash),
				$targetAnchor = $('[name=' + this.hash.slice(1) + ']');
			var $target = $targetId.length ? $targetId : $targetAnchor.length ? $targetAnchor : false;

			if ($target) {

				$(this).click(function () {

					//Hack collapse top navigation after clicking
					topMenu.parent().attr('style', 'height:0px').removeClass('in'); //Close navigation
					$('.navbar .btn-navbar').addClass('collapsed');

					var targetOffset = $target.offset().top - 52;
					$('html, body').animate({
						scrollTop: targetOffset
					}, 800);
					return false;
				});
			}
		}
	});
	
	// Bind to scroll
    $(window).scroll(function () {

        //Display or hide scroll to top button 
        if ($(this).scrollTop() > 100) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
		
        // Get container scroll position
        var fromTop = $(this).scrollTop() + topMenuHeight + 10;

        // Get id of current scroll item
        var cur = scrollItems.map(function () {
            if ($(this).offset().top < fromTop)
                return this;
        });

        // Get the id of the current element
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";

        if (lastId !== id) {
            lastId = id;
            // Set/remove active class
            menuItems
                .parent().removeClass("active")
                .end().filter("[href=#" + id + "]").parent().addClass("active");
        }
    });
}

function openProject() {

	var portfolioItem = $('.portfolio-item > a');
	var singleProject = $('#single-project');
	var loader = "<div class=\"project-loader\"><div class=\"bubblingG\"><span id=\"bubblingG_1\"></span><span id=\"bubblingG_2\"></span><span id=\"bubblingG_3\"></span></div>Loading...</div>";

	portfolioItem.click(function () {

		var link = $(this).attr('href');
		$('html, body').animate({
			scrollTop: singleProject.offset().top - 90
		}, 500);
		singleProject.slideUp(500).addClass("project");

		singleProject.after(loader);
		singleProject.empty();

		setTimeout(function () {
			singleProject.load(link, function (response, status) {
				if (status === "error") {
					alert("An error");
				} else {
					singleProject.slideDown(500);

					var closeProject = $('#close-project');
					closeProject.on('click', function () {
						singleProject.slideUp(500);
						setTimeout(function () {

							singleProject.empty();
						}, 500);
					});
				}
				$('.project-loader').remove();
			});
		}, 500);
		return false;
	});
}

//Initialization
openProject();
homeFullScreen();
inviewAnimation();
singlePageNav();


window.onload = function() {
 $('#wrapper').removeClass('loading');
 $('.loader').addClass('removing');
	setTimeout(function(){
		$('.loader').remove();
	}, 2000)

 
};
//What happen on window resize
$(window).resize(function () {
	homeFullScreen();
});

//What happen on window scroll	
$(window).on("scroll", function (e) {
	setTimeout(function () {
		stickyMenu();
	}, 300)
});

