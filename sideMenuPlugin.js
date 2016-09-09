/* SideMenuPlugin - A scrolling menu for HTML objects
 * Version 0.0.1
 * 
 * Copyright (c) 2013 Felipe Dias
 * 
 * This file is part of SideMenuPlugin.
 * 
 * SideMenuPlugin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * SideMenuPlugin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SideMenuPlugin. If not, see <http://www.gnu.org/licenses/>.
 */

(function($) {
	
	//GLOBAL SETINGS
	function onResizeOrScroll() {
		$(".sidemenucontainer").each(function(index, menu) {
		
			var target = $(menu).parent().children(".sidemenutarget");
		
			var scrollRelative = $(window).scrollTop() - $(target).offset().top;
			var targetHeight = $(target).height();
			var menuHeight = $(menu).height();
			
			var topLimit = parseInt(target.css("marginTop"),10);
			var bottomLimit = targetHeight - menuHeight + parseInt(target.css("marginTop"),10);
			
			if (scrollRelative < topLimit) {
				$(menu).css('top', topLimit);
			}
			else if (scrollRelative > bottomLimit - parseInt(target.css("marginBottom"),10)) {
				   $(menu).css('top', bottomLimit);
			}
			else {
				$(menu).css('top', scrollRelative + parseInt(target.css("marginTop"),10) );
			}
		});
		
	}
	
	//ajusta o menu no resize da tela
	$(window).resize(onResizeOrScroll);

	//faz o menu seguir o scroll da tela
	$(window).scroll(onResizeOrScroll);
	
	$.fn.sideMenu = function(options) {
		var settings = $.extend({
			side: 'left',
			btnWidth : 80,
			btnHeight : 64,
			btnTabWidth : 16,
			targetZIndex : 333,
			btnSpecs : null
		}, options);
		
		var target = this;
		
		
		if ($(target).css('position') == 'static') {
			console.log("[sideMenuPlugin] WARNING: the plugin buttons won't be hidden since the target element has STATIC position.");
		}
		
		if (!$(target).parent().hasClass("sidemenuwrapper")) {
			console.log("[sideMenuPlugin] WARNING: the menu was not wrapped by a sidemenuwrapper-class element, so failures may occur.");
		}
		
		if ($(target).parent().children(".sidemenutarget").length != 0) {
			console.log("[sideMenuPlugin] WARNING: there is already a sidemenu within this sidemenuwrapper-class element, so failures may occur.");
		}
		
		
		$(target).addClass("sidemenutarget");
		
		if (settings.btnSpecs === null) {
			settings.btnSpecs = new Array(1);
			settings.btnSpecs[0] = {type : "button", image : settings.side == "left" ? "missing_specs_left.png" : "missing_specs_right.png", action : function(){alert("Button specs not supplied!");}};
		}
		
		var numberOfButtons = settings.btnSpecs.length;
		
		//ajusta o z-index do target
		$(target).css('zIndex', settings.targetZIndex);
		
		//gera o menu
		var sidemenucontainer = document.createElement("div");
		sidemenucontainer.className = "sidemenucontainer";
		$(target).parent().append(sidemenucontainer);
		
		//ajusta o menu
		$(sidemenucontainer).css('width',settings.btnWidth);
		$(sidemenucontainer).css('height',settings.btnHeight*numberOfButtons);
		$(sidemenucontainer).css('top',$(target).position().top + parseInt($(target).css("marginTop"),10));
		$(sidemenucontainer).css('zIndex',settings.targetZIndex-2);
		if (settings.side == "left") {
			$(sidemenucontainer).css('left',$(target).position().left - settings.btnTabWidth + parseInt($(target).css('marginLeft'),10));
		}
		else {
			$(sidemenucontainer).css('left', $(target).outerWidth() - $(sidemenucontainer).outerWidth() + settings.btnTabWidth + parseInt($(target).css('marginLeft'),10));
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
			$(sidemenubutton).css('background-image','url(' + settings.btnSpecs[i].image + ')');
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
			
		});
		
		return target;
	};
}) (jQuery);
