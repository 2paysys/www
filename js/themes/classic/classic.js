
window.lrignition.themesJS.classic = function() {
	
	var self = this;
	
	$.extend(this.themeSpec, {
		boxBackgroundColorHex: function(ignition, name, value) {
			self.updateBoxBG(ignition, value, ignition.getSetting("boxAlpha"));
		},
		boxAlpha: function(ignition, name, value) {
			self.updateBoxBG(ignition, ignition.getSetting("boxBackgroundColorHex"), value);
		},
		boxPosition: function(ignition, name, value) {
			var el = ignition.getContainer().find(".LR-box-wrapper");
			var ml = "auto", mr = "auto";
			if(value == "left") {
				ml = "20px";
			} else if(value == "right") {
				mr = "20px";
			}
			el.css({
				"margin-left": ml,
				"margin-right": mr
			});
		}
	});
	
	this.init.push(function() {
	});
	
	// Uncomment to override default mode set behavior
	/*this.setMode = function(ignition, mode) {
		var container = ignition.getContainer();
		if(mode == "main") {
			container.find(".LR-content").removeClass("LR-sharing-page");
			container.find(".LR-site-share").hide();
			container.find(".LR-sign-up-container").show();
		} else if(mode == "postsignup") {
			container.find(".LR-content").addClass("LR-sharing-page");
			container.find(".LR-sign-up-container").hide();
			container.find(".LR-site-share").show();
		}
	};*/
	
};

window.lrignition.themesJS.classic.prototype = new window.lrignition.themesJS.common("classic");
