
if(!window.lrignition) window.lrignition = {};
window.lrignition.ThemeBase = function() {
	
	var hexColorToRGB = function(color) {
		if(!color) return { r:0, b:0, g:0 };
		var r, g, b;
		if (color.charAt(0) == '#'){
			color = color.substr(1);
		}
		r = color.charAt(0) + '' + color.charAt(1);
		g = color.charAt(2) + '' + color.charAt(3);
		b = color.charAt(4) + '' + color.charAt(5);
		r = parseInt(r, 16);
		g = parseInt(g, 16);
		b = parseInt(b, 16);
		return {
			'r': r, 
			'g': g, 
			'b': b
		};
	}
	
	var goodSplit = function(str, delim, limit) {
		var ar = str.split(delim);
		if(limit === undefined) return ar;
		var ret = [];
		for(var i = 0; i < ar.length; i++) {
			if(i < limit) {
				ret.push(ar[i]);
			} else {
				if(ret.length < 1) ret.push("");
				ret[ret.length - 1] += delim + ar[i];
			}
		}
		return ret;
	};
	
	var asBoolean = function(v) {
		return lrSiteSettingAsBoolean(v);
	};
	
	String.prototype.goodSplit = function(delim, limit) {
		return goodSplit(this, delim, limit);
	};
	
	var parseSpec = function(str) {
		if($.isFunction(str)) {
			return {
				type: "function",
				f: str
			};
		}
		var parts1 = str.goodSplit(" ", 2);
		if(parts1.length == 2) {
			var type = parts1[0];
			var parts2 = parts1[1].goodSplit(" ", 2);
			var parts3 = parts1[1].goodSplit(" ", 3);
			if(type == "show") {
				return { type: "show", selector: parts1[1] };
			} else if(type == "hide") {
				return { type: "hide", selector: parts1[1] };
			} else if(type == "val") {
				return { type: "val", selector: parts2[0], value: parts2[1] };
			} else if(type == "text") {
				return { type: "text", selector: parts2[0], value: parts2[1] };
			} else if(type == "html") {
				return { type: "html", selector: parts2[0], value: parts2[1] };
			} else if(type == "attr") {
				return { type: "attr", selector: parts3[0], name: parts3[1], value: parts3[2] };
			} else if(type == "removeAttr") {
				return { type: "removeAttr", selector: parts2[0], name: parts2[1] };
			} else if(type == "addClass") {
				return { type: "addClass", selector: parts2[0], value: parts2[1] };
			} else if(type == "removeClass") {
				return { type: "removeClass", selector: parts2[0], value: parts2[1] };
			} else if(type == "condClass") {
				return { type: "condClass", selector: parts2[0], value: parts2[1] };
			} else if(type == "invCondClass") {
				return { type: "invCondClass", selector: parts2[0], value: parts2[1] };
			} else if(type == "css") {
				return { type: "css", selector: parts3[0], name: parts3[1], value: parts3[2] };
			} else if(type == "clickLink") {
				return { type: "clickLink", selector: parts2[0], value: parts2[1] };
			} else {
				return null;
			}
		} else {
			return null;
		}
	};
	
	var updateSpecSetting = function(ignition, settingName, spec, value) {
		if(value === "null" || value === "undefined" || value === null || value === undefined) return;
		
		if($.isArray(spec)) {
			$.each(spec, function(idx, subSpec) {
				updateSpecSetting(ignition, settingName, subSpec, value);
			});
			return;
		}
		
		var container = ignition.getContainer();
		
		var processSpecVal = function(str) {
			if($.isArray(str)) {
				var ret = [];
				$.each(str, function(k, v) {
					ret.push(processSpecVal(v));
				});
				return ret;
			}
			return str.replace('SETTINGNAME', settingName).replace('SETTINGVALUE', value);
		};
		
		if(!$.isPlainObject(spec)) {
			spec = parseSpec(spec);
		}
		var specEl = null;
		var specVal = "";
		if(spec.selector) specEl = container.find(spec.selector);
		if(spec.value) specVal = processSpecVal(spec.value);
		if(spec.type == "show") {
			if(asBoolean(value)) specEl.show();
			else specEl.hide();
		} else if(spec.type == "hide") {
			if(asBoolean(value)) specEl.hide();
			else specEl.show();
		} else if(spec.type == "val") {
			specEl.val(specVal);
		} else if(spec.type == "text") {
			specEl.text(specVal);
		} else if(spec.type == "html") {
			specEl.html(specVal);
		} else if(spec.type == "attr") {
			specEl.attr(spec.name, specVal);
		} else if(spec.type == "removeAttr") {
			specEl.removeAttr(spec.name);
		} else if(spec.type == "addClass") {
			specEl.addClass(specVal);
		} else if(spec.type == "removeClass") {
			specEl.removeClass(specVal);
		} else if(spec.type == "condClass") {
			if(asBoolean(value)) specEl.addClass(specVal);
			else specEl.removeClass(specVal);
		} else if(spec.type == "invCondClass") {
			if(!asBoolean(value)) specEl.addClass(specVal);
			else specEl.removeClass(specVal);
		} else if(spec.type == "css") {
			specEl.css(spec.name, specVal);
		} else if(spec.type == "clickLink") {
			if(ignition.isLive()) {
				specEl.unbind("click").click(function() {
					document.location.href = specVal;
				});
			}
		} else if(spec.type == "function") {
			spec.f(ignition, settingName, value);
		}
	};
	
	var obj = {
		
		themeSpec: {},
		
		themeName: "default",
		
		updateSetting: function(ignition, setting, value) {
			if(this.themeSpec[setting]) {
				updateSpecSetting(ignition, setting, this.themeSpec[setting], value);
			}
		},
		
		hexColorToRGB: hexColorToRGB
		
	};
	
	return obj;
	
}();
