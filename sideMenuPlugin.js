/* sideMenuPlugin - A Scrolling Animated Menu Attached to HTML Objects
 * Version 1.0.0
 * 
 * Copyright 2013 Felipe Dias
 * 
 * Special thanks to Ralf Stoltze, whose jquery plugin 'hoverFlow' was
 * the best plugin I could find for the animation effects!
 * 
 * This file is part of sideMenuPlugin.
 * 
 * sideMenuPlugin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * sideMenuPlugin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with sideMenuPlugin.  If not, see <http://www.gnu.org/licenses/>.
 */

(function($) {
	
	//DEBUG MODES
	var OFF=0;
	var INFO=1;
	var WARN=2;
	var ERROR=3;
	
	//SPECIFIC SETTINGS
	var debugMode=OFF;
	
	//GLOBAL SETTINGS
	function onResizeOrScroll() {
		$(".sidemenucontainer").each(function(index, menu) {
		
			var target = $(menu).parent().children(".sidemenutarget");
		
			var scrollRelativeToTargetTop = $(window).scrollTop() - $(target).offset().top; //essa conta já inclui a borda superior
			var targetHeight = $(target).height() + parseInt($(target).css('borderTopWidth'),10) + parseInt($(target).css('borderBottomWidth'),10);
			var menuHeight = $(menu).height();
			
			var topLimit = parseInt($(target).css("marginTop"),10);
			var bottomLimit = targetHeight - menuHeight;
			
			if (scrollRelativeToTargetTop <= 0) {
				$(menu).css('top', topLimit);
			}
			else if (scrollRelativeToTargetTop >= bottomLimit) {
				$(menu).css('top', bottomLimit + parseInt($(target).css("marginTop"),10));
			}
			else {
				$(menu).css('top', scrollRelativeToTargetTop + parseInt($(target).css("marginTop"),10));
			}
		});
		
	}
	
	//debug function
	function debug(msg, mode) {
	
		mode = mode == null ? WARN : mode;
		
		if (mode <= debugMode) {
			switch(mode) {
			case INFO:
				msg = "[sideMenuPlugin] INFO: " + msg;
				break;
			case WARN:
				msg= "[sideMenuPlugin] WARNING: " + msg;
				break;
			case ERROR:
				msg = "[sideMenuPlugin] ERROR: " + msg;
				break;
			}
			
			console.log(msg);
		}
	}
	
	//ajusta o menu no resize da tela
	$(window).resize(onResizeOrScroll);

	//faz o menu seguir o scroll da tela
	$(window).scroll(onResizeOrScroll);
	
	$.fn.sideMenu = function(options) {
		var settings = $.extend({
			side: "left",
			btnWidth : 80,
			btnHeight : 64,
			btnTabWidth : 16,
			targetZIndex : 333,
			btnSpecs : null,
			animate : true
		}, options);
		
		var target = this;
		
		if (isNaN(settings.btnWidth) || isNaN(settings.btnHeight) || isNaN(settings.btnTabWidth) || isNaN(settings.targetZIndex)) {
			debug("The button dimensions or the z-index informed are not valid numbers! Aborting...", ERROR);
			return target;
		}
		
		//garante que os números são inteiros
		settings.btnWidth = parseInt(settings.btnWidth,10);
		settings.btnHeight = parseInt(settings.btnHeight,10);
		settings.btnTabWidth = parseInt(settings.btnTabWidth,10);
		settings.targetZIndex = parseInt(settings.targetZIndex,10);
		
		if (settings.side !== "left" && settings.side !== "right") {
			settings.side = "left";
			debug("The side should be either 'left' or 'right', but was given '" + settings.side + "'! Choosing 'left'...");
		}
		
		
		if ($(target).css('position') == 'static') {
			debug("The plugin buttons won't be hidden since the target element has STATIC position.");
		}
		
		if (!$(target).parent().hasClass("sidemenuwrapper")) {
			debug("The menu was not wrapped by a sidemenuwrapper-classed element, glitches may occur.");
		}
		
		if ($(target).parent().children(".sidemenutarget").length != 0) {
			debug("There is already a sidemenu within this sidemenuwrapper-classed element, glitches may occur.");
		}
		
		
		$(target).addClass("sidemenutarget");
		
		//verifica se as especificações dos botões foram passadas
		if (settings.btnSpecs === null) {
			debug("Button specifications not supplied!");
			settings.btnSpecs = new Array(1);
			settings.btnSpecs[0] = {type : "button", action : function(){alert("Button specs not supplied!");}};
		}
		
		var numberOfButtons = settings.btnSpecs.length;
		
		//verifica se uma imagem foi passada
		for (var i=0; i<numberOfButtons; i++) {
			if (!settings.btnSpecs[i].image) {
				debug("Image not supplied for button " + i + "!");
			}
		}
		
		//ajusta o z-index do target
		$(target).css('zIndex', settings.targetZIndex);
		
		//gera o menu
		var sidemenucontainer = document.createElement("div");
		sidemenucontainer.className = "sidemenucontainer";
		$(target).parent().append(sidemenucontainer);
		
		var checkCSS = setTimeout(function() { //workaround para targets que são criados dinamicamente: o navegador tem um delay para calcular alguns CSSs, principalmente o da margem
			debug("Trying to calculate position...", INFO);
			
			if ($(target).css('marginLeft') == null || $(target).css('marginTop') == null || $(target).position() == null) {
				return;
			}
			clearInterval(checkCSS);
			
			debug("Position calculated.", INFO);
			
			//verifica se o número de botões excede o tamanho do alvo e recalcula
			var menuTotalHeight = numberOfButtons*settings.btnHeight;
			if (menuTotalHeight > $(target).height() && $(target).height() > 0) {
				debug("The number of buttons exceed the target's height. Trying to recalculate, but distortions may occur...");
				var factor = (1.0*$(target).height())/menuTotalHeight;
				settings.btnWidth = parseInt(settings.btnWidth*factor,10);
				settings.btnHeight = parseInt(settings.btnHeight*factor,10);
				settings.btnTabWidth = parseInt(settings.btnTabWidth*factor,10);
			}
			
			//ajusta o menu
			$(sidemenucontainer).css('width',settings.btnWidth);
			$(sidemenucontainer).css('height',settings.btnHeight*numberOfButtons);
			$(sidemenucontainer).css('top',$(target).position().top + parseInt($(target).css("marginTop"),10));
			$(sidemenucontainer).css('zIndex',settings.targetZIndex-2);
			if (settings.side == "left") {
				$(sidemenucontainer).css('left',$(target).position().left - settings.btnTabWidth + parseInt(($(target).css('marginLeft') === 'auto'?0:$(target).css('marginLeft')),10));
			}
			else {
				$(sidemenucontainer).css('left', $(target).outerWidth() - $(sidemenucontainer).outerWidth() + settings.btnTabWidth + parseInt(($(target).css('marginLeft') === 'auto'?0:$(target).css('marginLeft')),10) + parseInt($(target).css('borderRightWidth'),10) - parseInt($(target).css('borderLeftWidth'),10));
			}
		
			//gera os botoes
			for (var i=0; i<numberOfButtons; i++) {
				var sidemenubutton = document.createElement("div");
				sidemenubutton.className = "sidemenubutton";
				$(sidemenucontainer).append(sidemenubutton);
			
				//ajusta os botoes
				$(sidemenubutton).css('width',settings.btnWidth);
				$(sidemenubutton).css('height',settings.btnHeight);
				$(sidemenubutton).css('zIndex',settings.targetZIndex-1);
				if (!settings.btnSpecs[i].image) {
					$(sidemenubutton).addClass(settings.side == "left" ? "sidemenu-missing-image-left" : "sidemenu-missing-image-right");
				}
				else {
					$(sidemenubutton).css('background-image','url(' + settings.btnSpecs[i].image + ')');
				}
				$(sidemenubutton).css('background-size',settings.btnWidth+"px " + settings.btnHeight+"px");
			}
		
			//ajusta os botoes
			$(sidemenucontainer).children().each(function(index, button) {
			
				//gera o anchor se for um link
				if (settings.btnSpecs[index].type === "link") {
					var link = document.createElement("a");
					link.className = "sidemenulink";
					link.href = settings.btnSpecs[index].href || "#";
					if (settings.btnSpecs[index].download != null) {
						link.download = settings.btnSpecs[index].download;
					}
				
					$(button).append(link);
				}
			
				//gera o trigger de click nos botoes
				$(button).on("click", { action : settings.btnSpecs[index].action }, function(event) {
					$(this)
						.stop(true, false)
						.animate({opacity: 0.25},50,'linear')
						.animate({opacity: 1},100,'linear',event.data.action || null);
				});
			
				if(settings.animate){
				//gera o trigger de entrada no botao
					$(button).mouseenter(
						function(e) {
							var btn = $(this);
							if (settings.side == 'left') {
								btn.hoverFlow(e.type, {left: -btn.outerWidth()+settings.btnTabWidth }, 225);
							}
							else {
								btn.hoverFlow(e.type, {left: btn.outerWidth()-settings.btnTabWidth }, 225);
							}
						}
					);
			
					//gera o trigger de saida do botao
					$(button).mouseleave(
						function(e) {
							var btn = $(this);
							btn.hoverFlow(e.type, {left: 0 }, 225);
						}
					);
				}
			
			});
		}, 175);
		
		return target;
	};
}) (jQuery);
