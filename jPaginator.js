(function( $ ){

	var methods = {
		init : function( options ) {

			if ( this.attr("id") == "" ) {
				$.error( 'You must define an unique id on your element - ex : $("#myId").jPaginator();' );
			}
			if (this.length != 1) {
				$.error( 'You must use this plugin with a single element - ex : $("#myId").jPaginator();' );
			}

			$(this).html("").append(
				"<div class='paginator_root'>"+
					"<div class='paginator_bmax left'></div><div class='paginator_b left'></div>"+
					"<div class='paginator_p_wrap'>"+
						"<div class='paginator_p_bloc'></div>"+
					"</div>"+
					"<div class='paginator_b right'></div><div class='paginator_bmax right'></div>"+
				"</div>"+
				"<div class='paginator_slider' class='ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all'>"+
					"<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>"+
				"</div>"
			);


			var settings = {
				selectedPage:1,
				nbPages:100,
				length:10,
				widthPx:30,
				marginPx:1,
				withSlider:true,
				withMaxButton:true,
				withAcceleration:true,
				speed:2,
				coeffAcceleration:2,
				minSlidesForSlider:3
			};
			
			var controls = {
				realWid:0,
				curNum:1,
				infRel:0,
				cInfMax:0,
				cInf:0,
				nbMove:0,
				isMoving:false,
				isLimitL:false,
				isLimitR:false
			};

			return this.each(function(){

				var $this = $(this); 
				var data = $this.data('jPaginator');   

				if ( options ) { 
					$.extend( settings, options );
				}


				$this.find(".paginator_slider").slider({
					animate: false
				});

				// init controls data
				for (i=1;i<=settings.length+2;i++) {
					$this.find(".paginator_p_bloc").append($("<div class='paginator_p'></div>") );
				}

				settings.length = Math.min(settings.length,settings.nbPages);

				var hasHoverButton = true;
				if ( settings.nbPages <= settings.length ) {
					$this.find(".paginator_slider").hide();
					$this.find(".paginator_slider").children().hide();
					$this.find(".paginator_bmax").hide();
					$this.find(".paginator_b").hide();
					hasHoverButton = false;
				}


				var totalSlides = Math.ceil(settings.nbPages/settings.length);
				if ( totalSlides < settings.minSlidesForSlider) {
					settings.withSlider = false;
				}

				if ( !settings.withSlider) {
					$this.find(".paginator_slider").hide();
					$this.find(".paginator_slider").children().hide();
				}
				if ( !settings.withMaxButton) {
					$this.find(".paginator_bmax").hide();
				}

				var borderPx = 0;
				var sBorder = $this.find(".paginator_p").first().css("border-left-width");
				if (sBorder.indexOf("px")>0) {
					borderPx = sBorder.replace("px","")*1;
				}

				controls.realWid = settings.widthPx + settings.marginPx*2 + borderPx*2;


				var widAll = 1* controls.realWid * settings.length ;

				$this.find(".paginator_p").css("width",settings.widthPx + "px");
				$this.find(".paginator_p").css("margin","0 " + settings.marginPx + "px 0 " + settings.marginPx + "px" );

				$this.find(".paginator_p_wrap").css("width",widAll+ "px");
				$this.find(".paginator_slider").css("width",widAll+ "px");

				controls.cInfMax = settings.nbPages * controls.realWid - ( settings.length * controls.realWid ) ; 

				// init selected page
				settings.selectedPage = Math.min(settings.selectedPage,settings.nbPages);

				if ( ! data ) {

					$this.data('jPaginator', {
						settings : settings,
						controls : controls
					});
				}

				goToSelectedPage($this);


				// events
				$this.find(".paginator_p").bind('click.jPaginator', function() {
					onClickNum($this,$(this));
				});

				if (settings.withSlider) {
					$this.find( ".paginator_slider" ).bind( "slidechange.jPaginator", function(event, ui) {
						handleSliderChange($this,event, ui);
					});

					$this.find( ".paginator_slider" ).bind( "slide.jPaginator", function(event, ui) {
						handleSliderChange($this,event, ui);
					});
				}

				if ( hasHoverButton ) {
					$this.find(".paginator_b").bind('mouseenter.jPaginator', function() {
						onEnterButton($this,$(this));
					});

					$this.find(".paginator_b").bind('mouseleave.jPaginator', function() {
						onLeaveButton($this,$(this));
					});
				}

				if (settings.withMaxButton) {
					$this.find(".paginator_bmax").bind('click.jPaginator', function() {
						onClickButtonLimit($this,$(this));
					});
				}

				$this.find(".paginator_p").bind('mouseenter.jPaginator', function() {
					onEnterNum($this,$(this));
				});

				$this.find(".paginator_p").bind('mouseleave.jPaginator', function() {
					onLeaveNum($this,$(this));
				});

			});
		},


		// chainability : return this.each(function(){var $this = $(this);});
		destroy : function( ) {

			return this.each(function(){  
				$(window).unbind('.jPaginator');
				$(this).removeData('jPaginator');  
			});

		}

	}; // fin public methods

	// private methods
	function onClickNum(that,e) { 
		var settings = that.data('jPaginator').settings;

		var newPage = 1*e.html();
		that.find(".paginator_p.selected").removeClass("selected");
		settings.selectedPage = newPage;

		// update data
		that.data('jPaginator').settings = settings ;

		goToSelectedPage(that);		
	}

	function onEnterButton(that,e) { 
		var controls = that.data('jPaginator').controls;

		var dir = 'left';
		if ( e.hasClass("right") ) { dir = 'right'; }
		controls.isMoving = true ;
		
		// update data
		that.data('jPaginator').controls = controls ;

		move(that,dir);
	}

	function onLeaveButton(that,e) { 
		reset(that);
	}

	function onClickButtonLimit(that,e) {
		var dir = 'left';
		if ( e.hasClass("right") ) { dir = 'right'; }
		moveToLimit(that,dir);
	}

	function onEnterNum(that,e) { 
		that.find(".paginator_p.hover").removeClass("hover");
		e.addClass("hover");
	}

	function onLeaveNum(that,e) {
		that.find(".paginator_p.hover").removeClass("hover");
	}


	function goToSelectedPage(that) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;

		moveSliderTo(that, controls.cInf);  
		
		var newNum = settings.selectedPage- Math.floor((settings.length-1)/2);
		updateNum(that, newNum );

		if (typeof(jPaginatorPageClicked) == "function") {
			jPaginatorPageClicked(that.attr("id"),settings.selectedPage); 
		}
	}

	function updateNum(that,newNum) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;

		that.find(".paginator_p.selected").removeClass("selected");

		newNum = Math.min(settings.nbPages-settings.length+1,newNum);
		newNum = Math.max(1,newNum);

		var n = newNum-2  ;
		that.find(".paginator_p_bloc .paginator_p").each(function(i) {
			n += 1;
			$(this).html(n);
			if ( settings.selectedPage == n ) {
				$(this).addClass("selected");
			}
		});

		that.find(".paginator_p_bloc").css("left","-"+controls.realWid+"px");

		controls.curNum = newNum;
		controls.cInf = (newNum-1)*controls.realWid;

		// update data
		that.data('jPaginator', {settings : settings,controls : controls});

	}
	function moveSliderTo(that,pos) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;
	  
		var newPc = Math.round( (pos / controls.cInfMax) * 100 ) ;
		var oldPc = that.find(".paginator_slider").slider("option", "value");

		if ( newPc != oldPc ) {
			that.find(".paginator_slider").slider("option", "value", newPc);
		}
	} 

	function handleSliderChange(that,e, ui) {

		var controls = that.data('jPaginator').controls;

		if ( !controls.isMoving ) {
			moveToPc(that,ui.value);			 
		}
	}

	function moveToPc(that,pc) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;

		pc = Math.min(100,pc);
		pc = Math.max(0,pc);

		var realInf = Math.round( controls.cInfMax * pc / 100);
		var gap = realInf-controls.cInf;
		
		if ( pc == 100 ) { updateNum(that,settings.nbPages-settings.length+1); return; } ;
		if ( pc == 0 ) { updateNum(that,1); return; } ;

		moveGap(that,gap);
	}
	

	function moveGap(that,gap) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;

		var iGap = Math.abs(gap)/gap;
		var pxGap = controls.infRel+gap; 
		var pageGap = iGap * Math.floor( Math.abs(pxGap)/controls.realWid);
		var dGap = pxGap%controls.realWid;

		controls.infRel = dGap;    

		var cInfTmp = (controls.curNum - 1) * controls.realWid + controls.infRel ;

		var newPage = controls.curNum + pageGap;
		if ( newPage < 1 )				{ cInfTmp = -1 } ;
		if ( newPage > settings.nbPages )	{ cInfTmp =  controls.cInfMax + 1 } ;

		if (cInfTmp < 0 ) { doReset = true; updateNum(that,1); controls.cInf = 0; controls.infRel = 0; moveSliderTo(that,0); controls.isLimitL = true; reset(that); return; }
		if (cInfTmp > controls.cInfMax ) { doReset = true; updateNum(that,settings.nbPages); controls.cInf = controls.cInfMax; controls.infRel = 0;  moveSliderTo(that,controls.cInfMax); controls.isLimitR = true; reset(that); return; }

		controls.isLimitL = false; controls.isLimitR = false;

		controls.cInf = cInfTmp;

		// update data
		that.data('jPaginator', {settings : settings,controls : controls});

		if (gap == 0) { return; }
		if ( pageGap != 0 ) {
			updateNum(that,newPage);
		}

		moveSliderTo(that,controls.cInf);
		that.find(".paginator_p_bloc").css("left", -1*dGap-controls.realWid +"px");

	} 
	function reset(that) {
		var controls = that.data('jPaginator').controls;

		controls.nbMove = 0;
		controls.isMoving = false;

		// update data
		that.data('jPaginator').controls = controls ;
	}
	function moveToLimit(that,dir) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;

		if ( controls.isLimitR && dir == 'right' ) { return ; }
		if ( controls.isLimitL && dir == 'left' ) { return ; }

		var gap = Math.round(controls.cInfMax/10);

		if (dir=='left') { gap *= -1; }

		moveGap(that,gap);

		setTimeout(function() { 
			controls.nbMove +=1;
			moveToLimit(that,dir);
		}, 20);

	}
	function move(that,dir) {

		var settings = that.data('jPaginator').settings;
		var controls = that.data('jPaginator').controls;

		if ( controls.isMoving ) {

			var gap = Math.min( Math.abs(settings.speed) ,5); 
			var coeff = Math.min( Math.abs(settings.coeffAcceleration) ,5); 
			if ( settings.withAcceleration ) {
				gap = Math.round( gap +  Math.round( coeff * (controls.nbMove*controls.nbMove)/80000 ) ); 
			}

			if (dir=='left') { gap *= -1; }

			moveGap(that,gap);

			setTimeout(function() { 
				controls.nbMove +=1;
				move(that,dir);
			}, 10);
		} 

	}



	$.fn.jPaginator = function( method ) {

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.jPaginator' );
		}    
	};

})( jQuery );