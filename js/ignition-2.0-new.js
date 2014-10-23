
var lrSiteSettingAsBoolean = function(v) {
	if(v == "1" || v == "true" || v == "TRUE" || v == "yes") return true;
	return false;
};

var lrFormatNumber = function(n) {
	if(!n) return "0";
	if(n.substr) n = parseInt(n, 10);
	var str = "";
	var mag = 1000000000;
	var ctr = 1;
	while(mag >= 1) {
		var dig = Math.floor(n / mag);
		if(dig != 0 || str != "") {
			str = str + dig;
		}
		ctr--;
		if(ctr == 0 && mag > 1) {
			if(str != "") str = str + ",";
			ctr = 3;
		}
		n = n - dig * mag;
		mag = mag / 10;
	}
	return str;
};

var lrFormatMoney = function(n) {
	if(!n) return "0.00";
	if(n.substr) n = parseFloat(n);
	var allcents = Math.floor(n * 100.0);
	var dollars = Math.floor(n);
	var cents = allcents - dollars * 100;
	var centsstr = "" + cents;
	if(centsstr.length < 2) centsstr = "0" + centsstr;
	return lrFormatNumber(dollars) + "." + centsstr;
};

var _gaq = _gaq || [];

! function() {
	if( window.console === undefined )
		window.console = {
			log : function( inp ) { /* Ignore in IE */ }
		};
	
	var pageScriptTags = document.getElementsByTagName("script");
	var thisScriptSrc = pageScriptTags[pageScriptTags.length - 1].src;
	var thisSrcParts = thisScriptSrc.split("/");
	if(thisSrcParts.length > 0) thisSrcParts.length = thisSrcParts.length - 1;
	var thisScriptBase = '';
	for(var i = 0; i < thisSrcParts.length; i++) {
		thisScriptBase += thisSrcParts[i] + "/";
	}

	thisScriptBase = window.lrIgnBase || thisScriptBase;
	
	var lrapiUrlBase = thisScriptBase + "libs/LRAPI/";
	//var jqueryUrl = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
	var jqueryUrl = thisScriptBase + "libs/jQuery/jquery-1.8.0.js";
	var jqueryCookieUrl = thisScriptBase + "libs/jQuery/jquery.cookie.js";
	var cloudSpongeUrl = "https://api.cloudsponge.com/address_books.js";
	var themeJSBase = thisScriptBase;
	var themeHTMLBase = thisScriptBase;
	var themeCSSBase = thisScriptBase;
	var extraHTMLBase = thisScriptBase;
	
	var headElement = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
	
	// Loads in a JS file which may or may not be embedded
	var requireJS = function(name, url, complete) {
		
		// Loads in an arbitrary JS resource
		var loadJSResource = function(url, complete) {
			if(url.substr(0, 5) == "data:") {
				var data = url.substr(5);
				eval(data);
				if(complete) complete();
			} else {
				var scriptEl = document.createElement('script');
				scriptEl.src = url;
				scriptEl.onload = scriptEl.onreadystatechange = function() {
					if(!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
						scriptEl.onload = scriptEl.onreadystatechange = null;
						if(complete) complete();
					}
				};
				headElement.appendChild(scriptEl);
			}
		};
		
		if(window.lrLoadedJs && window.lrLoadedJs[name]) {
			// Already loaded
			if(complete) complete();
		} else {
			// Need to load
			// Make sure isn't already loading
			if(window.lrLoadingJs && window.lrLoadingJs[name] !== undefined) {
				// Add loaded callback
				if(complete) window.lrLoadingJs[name].push(complete);
				return;
			}
			if(!window.lrLoadingJs) window.lrLoadingJs = {};
			window.lrLoadingJs[name] = [];
			if(complete) window.lrLoadingJs[name].push(complete);
			loadJSResource(url, function() {
				if(!window.lrLoadedJs) window.lrLoadedJs = {};
				window.lrLoadedJs[name] = true;
				var i;
				for(i = 0; i < window.lrLoadingJs[name].length; i++) {
					window.lrLoadingJs[name][i]();
				}
				window.lrLoadingJs[name] = [];
			});
		}
		
	};
	
	// Loads in multiple required JS files in sequence
	var requireMultiJS = function(specs, complete) {
		var requireNextJS = function(specIdx) {
			if(specIdx >= specs.length) {
				if(complete) complete();
			} else {
				requireJS(specs[specIdx].name, specs[specIdx].url, function() {
					requireNextJS(specIdx + 1);
				});
			}
		};
		requireNextJS(0);
	};
	
	// Load in all JS dependencies
	requireMultiJS(
		[
			{ name: "json", url: thisScriptBase + "libs/JSON/json2.js" },
			{ name: "jquery", url: jqueryUrl },
			{ name: "jquerycookie", url: jqueryCookieUrl },
			{ name: "jqueryplaceholder", url: thisScriptBase + "libs/jQuery/jquery.placeholder.js" },
			{ name: "lrapi_internal", url: lrapiUrlBase + "lrapi_internal.js" },
			{ name: "lrapi_public", url: lrapiUrlBase + "lrapi_public.js" },
			{ name: "lrapi", url: lrapiUrlBase + "lrapi.js" },
			{ name: "theme_base", url: themeJSBase + "/theme_base.js" },
			{ name: "presetThemes", url: themeJSBase + "/presetThemes.js" }
		],
		function() {
			
			// Parse hash tag
			if( window.location.hash ) {
				var parts = window.location.hash.substring( 1 ).split( '!' );
				if( parts.length > 1 )
					window.location.hash = parts.shift();
				if( parts.length ) {
					$.each( parts, function( k, v ) {
						var key = v.split( '=' )[ 0 ];
						var value = v.substring( key.length + 1 );
						if(!window.hashparams) window.hashparams = {};
						window.hashparams[ key ] = unescape( value );
					} );
				}
			}
			
			// Main Ignition object constructor
			var IgnitionInstance = function(container, options) {
				
				var self = this;
			
				// Loads in CSS which may or may not be embedded
				var loadCSS = function(name, url, attrs, callback) {
				
					var cbNow = false;
				
					// If already loaded, do nothing
					if(window.lrLoadedCss && window.lrLoadedCss[name]) return window.lrLoadedCss[name];
					
					var el;
					if(window.lrEmbeddedCss && window.lrEmbeddedCss[name]) {
						// If embedded in a variable, pull from that instead of the URL
						el = $('<style type="text/css"></style>').text(window.lrEmbeddedCss[name]);
						cbNow = true;
					} else {
						// Pull from the URL
						el = $('<link rel="stylesheet" type="text/css" href="' + url + '" />');
						//if(callback) el.load(callback);	// fix
						cbNow = true;
					}
					if(attrs) el.attr(attrs);
					$(headElement).append(el);
					
					// Set as loaded
					if(!window.lrLoadedCss) window.lrLoadedCss = {};
					window.lrLoadedCss[name] = el;
					
					if(cbNow && callback) callback();
					
					return el;
					
				};
				
				// Unloads a named loaded CSS
				var unloadCSS = function(name) {
					if(window.lrLoadedCss && window.lrLoadedCss[name]) {
						window.lrLoadedCss[name].remove();
						delete window.lrLoadedCss[name];
					}
				};
				
				// Loads in HTML which may or may not be embedded
				var loadHTML = function(element, name, url, complete) {
					if(window.lrLoadedHtml && window.lrLoadedHtml[name]) {
						// Already loaded
						element.html(window.lrLoadedHtml[name]);
						if(complete) complete();
					} else if(url.substring(0, 6) == "asset:") {
						// Load via asset API.
						$.lr.api.downloadSiteAsset(url.split(":")[1].split("/")[0], url.split(":")[1].split("/")[1], function(ret) {
							var htmlData = ret.data;
							if(!window.lrLoadedHtml) window.lrLoadedHtml = {};
							window.lrLoadedHtml[name] = htmlData;
							element.html(htmlData);
							if(complete) complete();
						});
					} else {
						// Have to load it
		//				if(url.substr(0, 4) != 'http') {	// relative path
							element.load(url, null, function(htmlData) {
								if(!window.lrLoadedHtml) window.lrLoadedHtml = {};
								window.lrLoadedHtml[name] = htmlData;
								if(complete) complete();
							});
		/*				} else {		// absolute path
							$.lr.api.getIgnitionAsset( url, function( ret ) {
								element.html(ret[0]);
								if(!window.lrLoadedHtml) window.lrLoadedHtml = {};
								window.lrLoadedHtml[name] = ret[0];
								if(complete) complete();
							} );
						} */
					}
				};
				
				var curSiteSettings = {};
				
				// Gets the value of a site setting that may be nested inside JSON
				var getNestedSiteSetting = function( setting, data ) {
					if( setting === undefined ) return undefined;
					var rawParts = setting.split( '.' );
					var parts = [];
					parts.push( rawParts.shift() );
					if( rawParts.length ) parts.push( rawParts.join( '.' ) );
					if( data[ parts[ 0 ] ] ) {
						data = data[ parts[ 0 ] ];
					} else if( parts.length == 2 && ! $.isPlainObject( data ) ) {
						var parsed = JSON.parse(data);
						data = parsed[ parts[ 0 ] ];
					} else {
						return undefined;
					}
					if( parts.length == 2 ) return getNestedSiteSetting( parts[ 1 ], data );
					return data;
				};
				
				var getSiteSetting = function(setting) {
					if(curSiteSettings[setting]) return curSiteSettings[setting];
					return getNestedSiteSetting(setting, curSiteSettings);
				};
				
				var currentTheme = null;
				var currentThemeCSSName = null;
				var currentMode = "main";
				
				var currentThemeCSS = [];
				
				var setMode = function(mode) {
					currentMode = mode;
					if(currentTheme) currentTheme.setMode(self, mode);
				};
				
				var getIgnitionStateFragment = function() {
					if(document.location.hash) {
						var frag = document.location.hash;
						if(frag.substr(0, 1) == "#") frag = frag.substr(1);
						if(frag) return frag;
					}
					return null;
				};
				
				var checkRelativeUrl = function(url, base) {
					if(url.substr(0, 7) == "http://"
						|| url.substr(0, 8) == "https://"
						|| url.substr(0, 6) == "asset:"
						|| url.substr(0, 1) == "/"
					) {
						return url;
					}
					if(base.length > 1 && base.substr(base.length - 1, 1) == "/") {
						return base + url;
					} else {
						return base + "/" + url;
					}
				};
				
				var loadThemeJSAndFlatten = function(themeSpec, callback) {
					if(typeof(themeSpec) == "string" && themeSpec.substr(0, 1) == "{") themeSpec = JSON.parse(themeSpec);
					if($.isPlainObject(themeSpec)) {
						var afterLoadDeps = function(parentSpec) {
							var afterLoadJs = function() {
								var retEntry = {};
								retEntry.name = themeSpec.name || (parentSpec ? parentSpec.name : undefined);
								retEntry.baseTheme = themeSpec.baseTheme;
								retEntry.html = $.extend(
									{},
									(parentSpec ? parentSpec.html : {}) || {},
									themeSpec.html || {}
								);
								retEntry.css = $.extend(
									{},
									(parentSpec ? parentSpec.css : {}) || {},
									themeSpec.css || {}
								);
								retEntry.options = $.extend(
									{},
									(parentSpec ? parentSpec.options : {}) || {},
									themeSpec.options || {}
								);
								retEntry.names = [];
								if(themeSpec.name) retEntry.names.push(themeSpec.name);
								if(parentSpec && parentSpec.names) {
									$.each(parentSpec.names, function(idx, n) {
										retEntry.names.push(n);
									});
								}
								if(callback) callback(retEntry);
							};
							if(themeSpec.js) {
								var multiJs = [];
								$.each(themeSpec.js, function(idx, jsEntry) {
									var loadUrl;
									if(jsEntry.url) {
										loadUrl = checkRelativeUrl(jsEntry.url, themeJSBase);
									} else if(jsEntry.data) {
										loadUrl = "data:" + jsEntry.data;
									} else return;
									multiJs.push({ name: jsEntry.name, url: loadUrl });
								});
								if(multiJs.length) {
									requireMultiJS(multiJs, afterLoadJs);
								} else {
									afterLoadJs();
								}
							} else {
								afterLoadJs();
							}
						};
						if(themeSpec.baseTheme) {
							loadThemeJSAndFlatten(themeSpec.baseTheme, afterLoadDeps);
						} else {
							afterLoadDeps();
						}
					} else {
						if(window.lrignition.themeSpecs[themeSpec]) {
							loadThemeJSAndFlatten(window.lrignition.themeSpecs[themeSpec], callback);
						} else {
							if(callback) callback();
						}
					}
				};
				
				var setTheme = function(theme, callback, media) {
					// Function called after theme JS is loaded
					var initTheme = function(theme) {
						// Unload current theme CSS elements
						$.each(currentThemeCSS, function(idx, cssName) {
							unloadCSS(cssName);
						});
						currentThemeCSS = [];
						
						// Load new theme CSS
						if(theme.css) $.each(theme.css, function(idx, cssSpec) {
							// Determine whether or not to load this CSS file, and whether to include the media query in the link tag
							var loadIt = true;
							var includeMediaQuery = true;
							if(cssSpec.mediaName && media) {
								var mediaNames;
								var isCommon = false;
								includeMediaQuery = false;
								if($.isArray(cssSpec.mediaName)) mediaNames = cssSpec.mediaName;
								else mediaNames = [cssSpec.mediaName];
								$.each(mediaNames, function(idx, n) {
									if(n == "common") isCommon = true;
								});
								if(!isCommon) {
									loadIt = false;
									$.each(mediaNames, function(idx, n) {
										if(n == media) loadIt = true;
									});
								}
							}
							// If loading it, update embedded data if raw CSS data is provided.  This will cause loadCSS to use the embedded data.
							if(loadIt !== false && cssSpec.data) {
								if(!window.lrEmbeddedCss) window.lrEmbeddedCss = {};
								window.lrEmbeddedCss[cssSpec.name] = cssSpec.data;
							}
							// Load the CSS
							if(loadIt) {
								var attrs = {};
								if(includeMediaQuery && cssSpec.mediaQuery) attrs.media = cssSpec.mediaQuery;
								//if(loadIt === "mobile") attrs.media = "only screen and (min-device-width : 320px) and (max-device-width : 480px)";
								var url = cssSpec.url ? checkRelativeUrl(cssSpec.url, themeCSSBase) : null;
								loadCSS(cssSpec.name, url, attrs);
								currentThemeCSS.push(cssSpec.name);
							}
						});
						
						// Executed after HTML is finished loading
						var afterLoadHTML = function() {
							$( 'input[placeholder], textarea[placeholder]' ).placeholder();
							// Load theme options
							if(theme.options) setNestedSiteSetting('themeOptions', theme.options, true);
							// Initialize theme JS
							var themeConstructor = null;
							if(theme.name && window.lrignition.themesJS[theme.name]) {
								themeConstructor = window.lrignition.themesJS[theme.name];
							} else if(theme.names) {
								$.each(theme.names, function(idx, name) {
									if(window.lrignition.themesJS[name]) {
										themeConstructor = window.lrignition.themesJS[name];
										return false;
									}
								});
							}
							if(themeConstructor) {
								currentTheme = new themeConstructor(theme.name || "custom", theme.options);
								if(currentTheme.init) {
									if($.isArray(currentTheme.init)) {
										$.each(currentTheme.init, function(idx, f) {
											f.call(currentTheme, self);
										});
									} else {
										currentTheme.init(self);
									}
								}
							} else {
								console.log("No theme constructor found.");
							}
							if(callback) callback();
						};
						
						// Load the theme HTML
						var triggeredLoads = 0;
						var completeLoads = 0;
						var doneTriggeringLoads = false;
						var checkLoads = function() {
							if(doneTriggeringLoads && completeLoads == triggeredLoads) afterLoadHTML();
						};
						
						if(theme.html) $.each(theme.html, function(idx, htmlSpec) {
							// If it's embedded HTML, preload it for loadHTML to use
							if(htmlSpec.data) {
								if(!window.lrLoadedHtml) window.lrLoadedHtml = {};
								window.lrLoadedHtml[htmlSpec.name] = htmlSpec.data;
							}
							// Find the element to insert the html into
							var htmlEl = container;
							if(htmlSpec.selector) htmlEl = $(htmlSpec.selector);
							// Load the HTML into the element
							var url = htmlSpec.url ? checkRelativeUrl(htmlSpec.url, themeHTMLBase) : null;
							triggeredLoads++;
							loadHTML(htmlEl, htmlSpec.name, url, function() {
								completeLoads++;
								checkLoads();
							});
						});
						doneTriggeringLoads = true;
						checkLoads();
					};
					
					// Load theme JS, then initialize
					loadThemeJSAndFlatten(theme, function(theme) {
						if(theme) initTheme(theme);
						else {
							console.log("Error loading theme.  Falling back to classic.");
							loadThemeJSAndFlatten("classic", function(theme) {
								if(theme) initTheme(theme);
							});
						}
					});

				};
				
				var updateSiteSetting = function(setting, value) {
					if(currentTheme) {
						currentTheme.updateSetting(self, setting, value);
					}
				};
				
				var setSiteSetting = function(setting, value) {
					curSiteSettings[setting] = value;
					updateSiteSetting(setting, value);
				};
				
				var settingUpdateHooks = {};
				
				var addSettingUpdateHook = function(setting, func) {
					if(settingUpdateHooks[setting]) {
						settingUpdateHooks[setting].push(func);
					} else {
						settingUpdateHooks[setting] = [func];
					}
				};
				
				// Sets a site setting, where the value might be nested site settings
				var setNestedSiteSetting = function(setting, value, noupdate) {
					// First set the raw setting, in case it's used
					if(noupdate) {
						curSiteSettings[setting] = value;
					} else {
						setSiteSetting(setting, value);
					}
					// If the value might be nested, go through those
					var setNestedSettings = function(obj) {
						if(obj) {
							$.each(obj, function(innerKey, innerVal) {
								setNestedSiteSetting(setting + "." + innerKey, innerVal);
							});
						}
					};
					if($.isPlainObject(value)) {
						setNestedSettings(value);
					} else {
						value = "" + value;
						if(value && value.substr(0, 1) == "{") {
							setNestedSettings(JSON.parse(value));
						}
					}
					// Execute hooks
					if(settingUpdateHooks[setting]) {
						$.each(settingUpdateHooks[setting], function(idx, func) {
							func(setting, value);
						});
					}
				};
				
				var storeNestedSiteSettingBlob = function(data) {
					$.each(data, function(k, v) {
						setNestedSiteSetting(k, v, true);
					});
				};
				
				var resetSiteSettings = function() {
					$.each(curSiteSettings, function(name, val) {
						updateSiteSetting(name, val);
					});
				};
				
				var setThemeAndUpdate = function(themeName, media, callback) {
					setTheme(themeName, function() {
						setMode(currentMode);
						resetSiteSettings();
						if(callback) callback();
					}, media);
				};
				
				var getRefCode = function() {
					var refCode = null;
					if(window.location.search.length >= 2) {
						$.each(window.location.search.substring(1).split('&'), function(k, v) {
							var parts = v.split('=', 2);
							if(parts[0]) {
								if(parts[0] == 'lrRef' && parts.length > 1) refCode = decodeURIComponent(parts[1]);
							}
						});
					}
					return refCode;
				};
				
				var getMainInfoFromAPI = function(success, error) {
					var cb1 = function(data) {
						if(!data) {
							loadHTML(container, 'badSiteModal', extraHTMLBase + '/badSiteModal.html');
							return;
						}
						options.siteInfo = data;
						if(!options.domain) options.domain = data.siteDomain;
						if(!options.site_id) options.site_id = data.SID;
						var refCode = getRefCode();
						if(refCode) options.refcode = refCode;
						else if(!options.refCode) options.refCode = "0";
						if(refCode) {
							$.lr.api.getSiteUserChannelLink(options.site_id, refCode, function(data2) {
								options.siteUserChannelLink = data2;
								options.parent_id = data2.UID;
								if(success) success();
							}, error);
						} else {
							if(success) success();
						}
					};
					if(options.site_id) {
						if(options.useUnlaunchedInfo) {
							$.lr.api.getSiteInfo(options.site_id, cb1, error);
						} else {
							$.lr.api.getLaunchedSiteInfo(options.site_id, cb1, error);
						}
					} else if(options.domain) {
						$.lr.api.getSiteInfoByDomain(options.domain, cb1, error);
					} else {
						if(success) success();
					}
				};
				
				var getIPFromAPI = function(success, error) {
					$.lr.api.getClientIP(function(ret) {
						options.client_ip = ret.ip;
						if(success) success(ret.ip);
					}, error);
				};
				
				var getAllInfoFromAPI = function(success, error) {
					var ctr = 0;
					var cb = function() {
						ctr++;
						if(ctr == 2) {
							if(success) success();
						}
					};
					getMainInfoFromAPI(cb, error);
					getIPFromAPI(cb, error);
				};
				
				var defaultSiteSettings = {
					announcementBanner: "Announcement goes here!"
				};
				
				var initFromSite = function(success, error) {
					getAllInfoFromAPI(function() {
						if(options.siteInfo) {
							curSiteSettings = defaultSiteSettings;
							storeNestedSiteSettingBlob(options.siteInfo);
							var afterThemeSet = function() {
								resetSiteSettings();
								if(success) success();
							};
							if(curSiteSettings.theme) {
								setTheme(curSiteSettings.theme, afterThemeSet);
							} else {
								afterThemeSet();
							}
						} else {
							if(error) error("badparam", "Requires a site_id or domain");
						}
					}, error);
				};
				
				var clickTrack = function(success, error) {
					if(options.site_id && options.refcode !== null && options.refcode !== undefined) {
						$.lr.api.clickTrack(options.site_id, options.parent_id || "0", options.refcode || "0", navigator.userAgent, options.client_ip, document.referrer, function(ret) {
							options.clicktrack_source = ret.source;
							if(success) success();
						}, error);
					} else {
						if(error) error("unavailabledata", "Not all data available");
					}
				};
				
				var validateEmail = function(email) { 
					var exp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return exp.test(email);
				};
				
				var validatePhone = function(phone) {
					var exp     = /^((\+)?[1-9]{1,2})?([-\s\.])?((\(\d{1,4}\))|\d{1,4})(([-\s\.])?[0-9]{1,12}){1,2}$/;
					var numbers = phone.split('').length;
					return 10 <= numbers && numbers <= 20 && exp.test(phone);
				};
				
				var validateDOB = function(dob) {
					var exp = /^[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9]?[0-9]?$/;
					return exp.test(dob);
				};
				
				var errorClass = "error";
				
				var getUsedExtraFields = function() {
					var ret = [];
					if(lrSiteSettingAsBoolean(getSiteSetting("extraFields.extra-field-full-name"))) {
						ret.push("first-name");
						ret.push("last-name");
					}
					if(lrSiteSettingAsBoolean(getSiteSetting("extraFields.extra-field-phone"))) ret.push("phone-number");
					if(lrSiteSettingAsBoolean(getSiteSetting("extraFields.extra-field-company"))) ret.push("company");
					if(lrSiteSettingAsBoolean(getSiteSetting("extraFields.extra-field-zip"))) ret.push("zip-code");
					if(lrSiteSettingAsBoolean(getSiteSetting("extraFields.extra-field-dob"))) ret.push("dob");
					return ret;
				};
				
				var extraFieldsSelectors = {	// ExtraFieldName => Selector
					"first-name": ".first-name",
					"last-name": ".last-name",
					"phone-number": ".phone-number",
					"company": ".company",
					"dob": ".birthdate",
					"zip-code": ".zipcode"
				};
				
				var prefillSignupFields = function(email, extraFields) {
					container.find(".signup-email").val(email);
					$.each(extraFields, function(name, value) {
						if(extraFieldsSelectors[name]) container.find(extraFieldsSelectors[name]).val(value);
					});
				};
				
				var getAndValidateExtraFields = function() {
					var usedFields = getUsedExtraFields();
					var ret = {};
					var fields = extraFieldsSelectors;
					var allValid = true;
					$.each(fields, function(fieldName, elSelector) {
						var isUsed = false;
						$.each(usedFields, function(idx, f) {
							if(f == fieldName) isUsed = true;
						});
						if(isUsed) {
							var el = container.find(elSelector);
							var val = el.val();
							var fieldValid;
							if(fieldName == "phone-number") fieldValid = validatePhone(val);
							else if(fieldName == "dob") fieldValid = validateDOB(val);
							else fieldValid = (val != "");
							if(fieldValid) {
								ret[fieldName] = val;
								el.removeClass(errorClass);
							} else {
								allValid = false;
								el.addClass(errorClass);
							}
						}
					});
					if(!allValid) return null;
					return ret;
				};
				
				var getAndValidateMainEmail = function() {
					var el = container.find(".signup-email");
					var val = el.val();
					if(val == "") {
						el.addClass(errorClass);
						return null;
					} else {
						el.removeClass(errorClass);
						return val;
					}
				};
				
				var getSiteShareChannels = function() {
					var channels = [];
					if(lrSiteSettingAsBoolean(getSiteSetting("fbRecommendToggle"))) channels.push("facebook_like");
					if(lrSiteSettingAsBoolean(getSiteSetting("fbShareToggle"))) channels.push("facebook_share");
					if(lrSiteSettingAsBoolean(getSiteSetting("linkedInShareToggle")) || lrSiteSettingAsBoolean(getSiteSetting("linkedInToggle"))) channels.push("linkedin");
					if(lrSiteSettingAsBoolean(getSiteSetting("shareOnTumblrToggle")) || lrSiteSettingAsBoolean(getSiteSetting("tumblrToggle"))) channels.push("tumblr");
					if(lrSiteSettingAsBoolean(getSiteSetting("tweetToggle"))) channels.push("twitter");
					if(lrSiteSettingAsBoolean(getSiteSetting("emailShareToggle"))) channels.push("email");
					if(lrSiteSettingAsBoolean(getSiteSetting("shareLinkToggle"))) channels.push("link");
					return channels;
				};
				
				var setupShareButtons = function(shareUrls) {
					
					var loadFacebook = function() {
						if(!window.lrFacebookInit) {
							$('html').attr('xmlns:fb', 'http://ogp.me/ns/fb#');
							if(!$('#fb-root').length){
								$('body').prepend('<div id="fb-root"></div><script>(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id)) return;js=d.createElement(s);js.id=id;js.src="https://connect.facebook.net/en_US/all.js#xfbml=1&appId=255930487765390";fjs.parentNode.insertBefore(js,fjs);}(document,\'script\',\'facebook-jssdk\'));</script>');
							} else {
								$('#fb-root').after('<script>(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(d.getElementById(id)) return;js=d.createElement(s);js.id=id;js.src="https://connect.facebook.net/en_US/all.js#xfbml=1&appId=255930487765390";fjs.parentNode.insertBefore(js,fjs);}(document,\'script\',\'facebook-jssdk\'));</script>');
							}
							window.lrFacebookInit = true;
						}
					};
					
					var setupFacebookLike = function(container, share_url) {
						var el = $("<div />")
							.addClass("fb-like")
							.attr({
								'data-href':        share_url,
								'data-layout':		'button_count'
							});
						loadFacebook();
						container.append(el);
					};
					
					var setupFacebookShare = function(container, share_url) {
						var el = $("<div />")
							.addClass("fb-send")
							.attr({
								'data-href':        share_url,
								'data-layout':		'button_count'
							});
						loadFacebook();
						container.append(el);
					};
					
					var setupTwitter = function(container, share_url) {
						var el = $("<a />")
							.addClass("twitter-share-button")
							.attr({
								'href':          '',
								'class':         'twitter-share-button',
								'data-url':      share_url,
								//'data-via':      getSiteSetting("twitterHandle"),
								'data-text':     getSiteSetting("twitterMessage"),
								'data-count':    'none'
							});
						container.append(
							el,
							'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'
						);
					};
					
					var setupLinkedIn = function(container, share_url) {
						var el = $(document.createElement('script')).attr({
							'type':         'IN/Share',
							'data-url':     share_url
						});
						container.append(
							'<script src="https://platform.linkedin.com/in.js" type="text/javascript"></script>',
							el
						);
					};
					
					var setupTumblr = function(container, share_url, config) {
						var tumblr_script = document.createElement('script');
						tumblr_script.type = 'text/javascript';
						tumblr_script.src = 'http://platform.tumblr.com/v1/share.js';
						document.body.appendChild(tumblr_script);
						var commonComponents = 'url=' + encodeURIComponent(share_url);
						if(getSiteSetting("tumblrName")) commonComponents += '&name=' + encodeURIComponent(getSiteSetting("tumblrName"));
						if(getSiteSetting("tumblrDesc")) commonComponents += '&description=' + encodeURIComponent(getSiteSetting("tumblrDesc"));
						var href;
						if(getSiteSetting("tumblrImage")) {
							href = 'http://www.tumblr.com/share/photo?source=' + encodeURIComponent(getSiteSetting("tumblrImage")) + '&' + commonComponents;
						} else {
							href = 'http://www.tumblr.com/share/link?' + commonComponents;
						}
						var tumblr_button = $("<a />").attr({
							'href':  'http://www.tumblr.com/share/link?url=' + encodeURIComponent(share_url) + '&name=' + encodeURIComponent(getSiteSetting("tumblrName")) + '&description=' + encodeURIComponent(getSiteSetting("tumblrDesc")),
							'style': 'display:inline-block; text-indent:-9999px; overflow:hidden; width:81px; height:20px; background:url(\'http://platform.tumblr.com/v1/share_1.png\') top left no-repeat transparent;',
							'title': 'Share on Tumblr'
						});
						container.append(tumblr_button);
					};
					
					var setupLink = function(el, share_url) {
						if(el.is("input")) el.val(share_url);
						else el.text(share_url);
					};
					
					var channels = getSiteShareChannels();
					
					
					$.each(channels, function(idx, channel) {
						var url;
						if(url = shareUrls[channel]) {
							switch(channel) {
								case 'facebook_like':
									setupFacebookLike(container.find('.LR-share-facebook-like').empty(), url, {});
									break;
								case 'facebook_share':
									setupFacebookShare(container.find('.LR-share-facebook-send').empty(), url, {});
									break;
								case 'linkedin':
									setupLinkedIn(container.find('.LR-share-linkedin').empty(), url, {});
									break;
								case 'tumblr':
									setupTumblr(container.find('.LR-share-tumblr').empty(), url, {});
									break;
								case 'twitter':
									setupTwitter(container.find('.LR-share-tweet').empty(), url, {});
									break;
								case 'link':
									setupLink(container.find('.LR-share-link'), url);
									break;
							}
						}
					});
					
				};
				
				var isWidget = function() {
					return getSiteSetting("launchFormFactor") == "wg";
				};
				
				var hasCrowdFunding = function() {
					return getSiteSetting("launchFormFactor") == "cf";
				};
				
				var getShareUrlBaseFromSettings = function(settings) {
					if(settings.launchFormFactor == 'wg' && settings.widgetUrl) return settings.widgetUrl;
					return document.location.protocol + "//" + settings.siteDomain;
				};
				
				var makeValidUrl = function(url) {
					if(url.substr(0, 4).toLowerCase() != 'http') url = 'http://' + url;
					return url;
				};
				
				var getShareUrlBase = function() {
					if(isWidget() && getSiteSetting("widgetUrl")) return makeValidUrl(getSiteSetting("widgetUrl"));
					return document.location.protocol + "//" + document.location.host + document.location.pathname;
				};
				
				var getShareUrl = function(refCode, urlBase) {
					return (urlBase || getShareUrlBase()) + "?lrRef=" + refCode;
				};
				
				var getSiteShareUrls = function(complete) {
					if(options.siteShareUrls !== undefined) {
						complete(options.siteShareUrls);
						return;
					}
					var channels = getSiteShareChannels();
					var urls = {};
					var urlBase = getShareUrlBase();
					var completeCount = 0;
					var checkComplete = function() {
						completeCount++;
						if(completeCount == channels.length) {
							options.siteShareUrls = urls;
							complete(urls);
						}
					};
					var rawUrlChannels = [
						'facebook_like',
						'facebook_share'
					];
					$.each(channels, function(idx, channel) {
						$.lr.api.createSiteUserChannelLink(options.site_id, options.site_user_id, channel, urlBase, function(retData) {
							var u = ($.inArray(channel, rawUrlChannels) != -1) ? getShareUrl(retData.ref_code) : (retData.ref_url || getShareUrl(retData.ref_code));
							urls[channel] = u;
							checkComplete();
						}, function() {
							checkComplete();
						});
					});
				};
				
				var initSharingMain = function() {
					getSiteShareUrls(function(urls) {
						setupShareButtons(urls);
					});
				};
				
				var initPreviewUserInfo = function() {
					container.find('.LR-sharing-page').addClass('LR-stats');
					container.find('.LR-stats-clicks').text(123);
					container.find('.LR-stats-signups').text(40);
				};
				
				var initUserInfo = function() {
					$.lr.api.getSiteUser(options.site_id, options.site_user_id, function(data) {
						options.site_user_info = data;
						container.find('.LR-stats-clicks').text(data.user_clicks);
						container.find('.LR-stats-signups').text(data.user_signups);
						if(data.user_clicks > 0 || data.user_signups > 0) container.find('.LR-sharing-page').addClass('LR-stats');
					});
				};
				
				var getShareEmailList = function() {
					var emailListStr = container.find('.LR-share-email-emails').val();
					var emails = emailListStr.split(",");
					$.each(emails, function(idx, email) {
						emails[idx] = $.trim(email);
					});
					return emails;
				};
				
				var doEmailInvites = function(s, e) {
					var message = container.find('.LR-share-email-message').val();
					var emails = getShareEmailList();
					if(emails.length > 0) {
						$.lr.api.inviteUsersByEmail(options.site_id, emails, options.siteShareUrls.email, options.site_user_email, message, function() {
							if(s) s();
						}, e);
					}
				};
				
				var getMainDomain = function() {
					if(isWidget() && getSiteSetting("widgetUrl")) {
						var parts = getSiteSetting("widgetUrl").split("/");
						return parts[2];
					} else if(getSiteSetting("siteDomain")) {
						return getSiteSetting("siteDomain");
					} else {
						return document.location.hostname;
					}
				};
				
				var appendShareEmails = function(newEmails) {
					var emails = getShareEmailList();
					$.each(newEmails, function(newIdx, newEmail) {
						var exists = false;
						$.each(emails, function(eIdx, eEmail) {
							if(newEmail.toLowerCase() == eEmail.toLowerCase()) exists = true;
						});
						if(!exists) emails.push(newEmail);
					});
					var newStr = "";
					$.each(emails, function(idx, email) {
						if(newStr != "") newStr += ", ";
						newStr += email;
					});
					container.find('.LR-share-email-emails').val(newStr);
					if(newStr) {
						container.find('.LR-share-email-hide').show();
					}
				};
				
				var initEmailImport = function() {
					var importButtonEl = $(".LR-share-email-import");
					importButtonEl.hide();
					$.lr.api.updateCs(document.location.hostname, function(apiKey) {
						if(!apiKey || apiKey == 'null' || apiKey == 'NULL') {
							return;
						}
						window.csPageOptions = {
							domain_key: apiKey,
							afterInit: function() {
								importButtonEl.show();
								importButtonEl.unbind("click").click(function() {
									cloudsponge.launch();
								});
							},
							afterSubmitContacts: function(contacts, source, owner) {
								var emailAddrs = [];
								$.each(contacts, function(contactIdx, contact) {
									if(contact.email && contact.email.length > 0) {
										var primarySelected = null;
										var selected = null;
										$.each(contact.email, function(emailIdx, email) {
											if(email.primary && email.selected && !primarySelected) primarySelected = email.address;
											if(email.selected && !selected) selected = email.address;
										});
										if(primarySelected) emailAddrs.push(primarySelected);
										else if(selected) emailAddrs.push(selected);
									}
								});
								if(emailAddrs.length > 0) appendShareEmails(emailAddrs);
							}
						};
						requireJS("cloudsponge", cloudSpongeUrl, function() {
							cloudsponge.init();
						});
					});
				};
				
				// Returns an amount IN CENTS
				var getCrowdFundingUnitAmount = function() {
					var unitStr = getSiteSetting("themesettings.cost");
					if(!unitStr) return 0;
					// make sure it's a string
					unitStr = "" + unitStr;
					// Convert to a float
					var unitFloat = parseFloat(unitStr);
					// Convert to cents
					return Math.round(unitFloat * 100.0);
				};
				
				var getCrowdFundingPurchaseNumUnits = function() {
					var $el = container.find(".LR-purchaseQuantity");
					if($el.length == 0) return 1;
					return parseInt($el.val());
				};
				
				// Returns an amount IN CENTS
				var getCrowdFundingPurchaseAmount = function() {
					return getCrowdFundingUnitAmount() * getCrowdFundingPurchaseNumUnits();
				};
				
				// Formats a cents value to a string of dollars and cents
				var formatMoney = function(cents) {
					/*var centsStr = "" + cents;
					if(centsStr.length == 0) return "0.00";
					if(centsStr.length == 1) return "0.0" + centsStr;
					if(centsStr.length == 2) return "0." + centsStr;
					return centsStr.substr(0, centsStr.length - 2) + "." + centsStr.substr(centsStr.length - 2);*/
					return lrFormatMoney(cents / 100.0);
				};
				
				var formatPrettyMoney = function(cents) {
					return formatMoney(cents);
				};
				
				var updateCrowdFundingAmounts = function() {
					setNestedSiteSetting("crowdFundingUnitCost", formatMoney(getCrowdFundingUnitAmount()));
					setNestedSiteSetting("crowdFundingPurchaseAmount", formatMoney(getCrowdFundingPurchaseAmount()));
				};
				
				addSettingUpdateHook("themesettings.cost", updateCrowdFundingAmounts);
				
				var registerCFAmountUpdateEvent = function() {
					container.find(".LR-purchaseQuantity").bind('change', updateCrowdFundingAmounts).bind("keyup", updateCrowdFundingAmounts).bind("blur", updateCrowdFundingAmounts);
				};
				
				var updateCFCutoffDate = function() {
					var isPastCutoff = false;
					if(getSiteSetting("cfCutoffDate")) {
						var cutoffDateStr = getSiteSetting("cfCutoffDate");
						var cutoffDate = parseInt(cutoffDateStr, 10) + 24*60*60*1000-1000;
						var daysLeft;
						if(cutoffDate <= (new Date()).valueOf()) {
							isPastCutoff = true;
							daysLeft = 0;
						} else {
							daysLeft = Math.floor((cutoffDate.valueOf() - (new Date()).valueOf()) / 1000 / 60 / 60 / 24);
						}
						container.find(".LR-daysRemaing").text(daysLeft);
					}
					return isPastCutoff;
				};
				
				var initCrowdFundingStats = function() {
					if(hasCrowdFunding()) {
						// Check the cutoff date and fill in the days remaining
						var isPastCutoff = updateCFCutoffDate();
						// Get the reserve amount and purchase amount
						updateCrowdFundingAmounts();
						// Get the stats from API
						$.lr.api.getProjectStats(options.site_id, function(stats) {
							container.find(".LR-purchasersNum").text(lrFormatNumber(stats.participants));
							container.find(".LR-campaignGoalCurrentAmount").text(lrFormatMoney(stats.funded));
							//container.find(".LR-campaignGoalAmount").text(stats.goal);
							container.find(".LR-campaignProgressBarAmt").css("width", "" + stats.percentage + "%");
							var isSuccessful = parseFloat(stats.funded, 10) >= parseFloat(stats.goal);
							if(isPastCutoff && !isSuccessful) {
								container.find(".LR-content").addClass("LR-fundingUnsuccessful");
								container.find(".LR-content").removeClass("LR-goalSuccess");
							} else if(isSuccessful) {
								container.find(".LR-content").addClass("LR-goalSuccess");
								container.find(".LR-content").removeClass("LR-fundingUnsuccessful");
							} else {
								container.find(".LR-content").removeClass("LR-fundingUnsuccessful");
								container.find(".LR-content").removeClass("LR-goalSuccess");
							}
						});
						// Show the container
						container.find(".LR-campaignStats").show();
					} else {
						// Hide the div
						container.find(".LR-campaignStats").hide();
					}
				};
				
				var hbtrk = function(event) {
					var img = document.createElement('img');
					img.src = "http://hbtrk.launchrock.com:8000/tracking_pixel.gif?event=" + encodeURIComponent(event);
				};

				var updateLinkEx = function(siteLinks) {
					setNestedSiteSetting('linkExLinks', siteLinks);
				};
				
				var initLinkEx = function() {
					var numLinks = 2;
					$.lr.api.getDisplayExchangedLinks(options.site_id, numLinks, function(linkSites) {
						var siteLinks = [];
						var processingInfoCalls = linkSites.length;
						var checkInfoCallsComplete = function() {
							if(processingInfoCalls == 0) {
								if(siteLinks.length > 0) {
									updateLinkEx(siteLinks);
								}
							}
						};
						checkInfoCallsComplete();
						$.each(linkSites, function(siteIdx, linkSiteId) {
							//var apiCall = options.useUnlaunchedInfo ? 'getSiteInfo' : 'getLaunchedSiteInfo';
							var apiCall = 'getSiteInfo';
							$.lr.api[apiCall](linkSiteId, function(linkSiteInfo) {
								var urlBase = getShareUrlBaseFromSettings(linkSiteInfo);
								if(urlBase) {
									$.lr.api.createSiteLinkExChannelLink(linkSiteId, options.site_id, 'linkexch', urlBase, function(chanLink) {
										var u = chanLink.ref_url || getShareUrl(chanLink.ref_code, urlBase);
										siteLinks.push({
											site_id: linkSiteId,
											settings: linkSiteInfo,
											url: u
										});
										processingInfoCalls--;
										checkInfoCallsComplete();
									}, function() {
										processingInfoCalls--;
										checkInfoCallsComplete();
									} );
								} else {
									processingInfoCalls--;
									checkInfoCallsComplete();
								}
							}, function() {
								processingInfoCalls--;
								checkInfoCallsComplete();
							} );
						} );
					} );
				};
				
				var clearCFFormErrors = function() {
					container.find(".LR-billingForm").removeClass("LR-emailError");
					container.find(".LR-billingForm").removeClass("LR-paymentError");
				};
				
				var showCFEmailError = function() {
					container.find(".LR-billingForm").addClass("LR-emailError");
				};
				
				var showCFStripeError = function(message) {
					container.find(".LR-billingForm").addClass("LR-paymentError");
					container.find(".LR-stripeErrorMssg").text(message);
				};
				
				var initPostSignup = function() {
					setMode("postsignup");
					if(getSiteSetting("linkExchGroup")) initLinkEx();
					initSharingMain();
					initUserInfo();
					if(options.isLive) initEmailImport();
				};
				
				var initCrowdFundingForm = function() {
					setMode("crowdfundingform");
					requireJS("stripe", "https://js.stripe.com/v1/", function() {});
					if(options.stripeError) showCFStripeError(options.stripeError);
					updateCFFormState();
					var maxQuantity = getSiteSetting("themesettings.itemLimit");
					if(maxQuantity) {
						maxQuantity = parseInt(maxQuantity, 10);
					} else {
						maxQuantity = 5;
					}
					if(maxQuantity < 1) maxQuantity = 1;
					var $maxQEl = container.find('.LR-purchaseQuantity');
					$maxQEl.empty();
					for(var i = 1; i <= maxQuantity; i++) {
						$maxQEl.append( $('<option>' + i + '</option>') );
					}
				};
				
				var initMain = function() {
					setMode("main");
				};
				
				var setSiteUserCookie = function() {
					var cookieData = {
						s: options.site_id,
						u: options.site_user_id,
						e: options.site_user_email,
						x: options.site_user_extra_fields
					};
					var cookieVal = JSON.stringify(cookieData);
					var cookieName = "lrSiteUser" + options.site_id;
					$.cookie(cookieName, cookieVal, { expires: 365 });
				};
				
				var checkSiteUserCookie = function() {
					var cookieName = "lrSiteUser" + options.site_id;
					var val = $.cookie(cookieName);
					if(val) {
						decoded = JSON.parse(val);
						options.site_user_id = decoded.u;
						options.site_user_email = decoded.e;
						options.site_user_extra_fields = decoded.x;
						prefillSignupFields(options.site_user_email, options.site_user_extra_fields);
						return true;
					}
					return false;
				};
				
				var creatingUser = false;
				
				var createSiteUser = function(email, numExtraFields, extraFields, success, error, noPostSignup) {
					if(creatingUser || options.site_user_id) return;
					creatingUser = true;
					$.lr.api.createSiteUser(
						email, "", options.parent_id || "",
						options.site_id, (numExtraFields == 0) ? null : JSON.stringify(extraFields),
						options.clicktrack_source, options.refcode, options.client_ip,
						function(data) {
							creatingUser = false;
							options.site_user_id = data.UID;
							options.site_user_email = email;
							options.site_user_extra_fields = extraFields;
							setSiteUserCookie();
							if(!noPostSignup) {
								initPostSignup();
							}
							hbtrk("ignition_signup");
							if(success) success();
						}, function(a, b) {
							creatingUser = false;
							if(error) error(a, b);
						}
					);
				};
				
				// Sign up a user from info. on the form, and update the widget accordingly
				var doFormSignup = function(success, error) {
					if(creatingUser || options.site_user_id) return;
					var email = getAndValidateMainEmail();
					var extraFields = getAndValidateExtraFields();
					var numExtraFields = 0;
					if(extraFields) {
						$.each(extraFields, function(extraFieldName, extraFieldVal) {
							numExtraFields++;
						});
					}
					if(email === null || extraFields === null) {
						if(error) error("invalidfields", "Some fields are invalid.");
						return;
					}
					createSiteUser(email, numExtraFields, extraFields, success, error);
				};
				
				var setupEmailShare = function() {
					var sendButton = container.find('.LR-share-email-send');
					var emailsField = container.find('.LR-share-email-emails');
					var sentText = "Invitations Sent";
					var notSentText = "Send Invitations";
					var sendingText = "Sending ...";
					sendButton.val(notSentText);
					var canSend = true;
					sendButton.unbind('click').click(function() {
						if(!canSend) return;
						canSend = false;
						sendButton.val(sendingText);
						doEmailInvites(function() {
							// emails sent
							sendButton.addClass('LR-invitation-send-success');
							sendButton.val(sentText);
						}, function() {
							canSend = true;
							sendButton.val(notSentText);
						});
					});
					emailsField.bind('input', function() {
						sendButton.removeClass('LR-invitation-send-success');
						sendButton.val(notSentText);
						canSend = true;
					});
				};
				
				var goToCrowdFundingForm = function() {
					// Redirect to page with the billing form
					//var url = "https://" + getSiteSetting("siteName") + ".launchrock.com/";
					var saveOptions = {
						site_user_id: options.site_user_id,
						parent_id: options.parent_id,
						clicktrack_source: options.clicktrack_source,
						refcode: options.refcode,
						skipClickTrack: 1
					};
					var url = document.location.href;
					url += "?lrOptsite_id=" + encodeURIComponent(options.site_id);
					url += "&returnUrl=" + encodeURIComponent(document.location.href);
					$.each(saveOptions, function(optName, optVal) {
						if(optVal !== undefined) {
							url += "&lrOpt" + optName + "=" + encodeURIComponent(optVal);
						}
					});
					url += "#crowdfundingform";
					document.location.href = url;
				};
				
				var returnToSharingPage = function(showCFConfirm) {
					var urlParams = getURLParameters();
					var baseUrl = urlParams.returnUrl || getShareUrlBase();
					if(baseUrl.indexOf("#") != -1) {
						var baseUrlParts = baseUrl.split("#");
						baseUrl = baseUrlParts[0];
					}
					var saveOptions = {
						site_id: options.site_id,
						site_user_id: options.site_user_id,
						parent_id: options.parent_id,
						clicktrack_source: options.clicktrack_source,
						refcode: options.refcode,
						skipClickTrack: 1
					};
					if(showCFConfirm) {
						saveOptions.showCFConfirm = 1;
					}
					$.each(saveOptions, function(optName, optVal) {
						if(optVal !== undefined) {
							if(baseUrl.indexOf("?") == -1) {
								baseUrl = baseUrl + "?" + "lrOpt" + optName + "=" + encodeURIComponent(optVal);
							} else {
								baseUrl = baseUrl + "&" + "lrOpt" + optName + "=" + encodeURIComponent(optVal);
							}
						}
					});
					baseUrl = baseUrl + "#sharing";
					document.location.href = baseUrl;
				};
				
				var updateCFFormState = function() {
					if(container.find(".LR-differentAsBilling").is(":checked")) {
						container.find(".LR-shippingForm").show();
					} else {
						container.find(".LR-shippingForm").hide();
					}
				};
				
				var getAndValidateCFFormFields = function() {
					clearCFFormErrors();
					var billing = {};
					var shipping = {};
					var val;
					val = container.find(".LR-billingEmail").val();
					if(val && validateEmail(val)) {
						billing.email = val;
					} else {
						showCFEmailError();
						return null;
					}
					billing.firstname = container.find(".LR-billingFirstName").val();
					billing.lastname = container.find(".LR-billingLastName").val();
					billing.cardnumber = container.find(".LR-billingCreditCard").val();
					var expParts = container.find(".LR-billingCreditExpire").val().split("/");
					billing.exp_month = (expParts.length > 0) ? expParts[0] : "";
					billing.exp_year = (expParts.length > 1) ? expParts[1] : "";
					billing.cvc = container.find(".LR-billingCreditSecurity").val();
					billing.address1 = container.find(".LR-billingStreetAddress").val();
					billing.address2 = container.find(".LR-billingAptNum").val();
					billing.city = container.find(".LR-billingCity").val();
					billing.state = container.find(".LR-billingState").val();
					billing.zip = container.find(".LR-billingZip").val();
					if(container.find(".LR-differentAsBilling").is(":checked")) {
						shipping.firstname = billing.firstname;
						shipping.lastname = billing.lastname;
						shipping.address1 = container.find(".LR-shippingStreetAddress").val();
						shipping.address2 = container.find(".LR-shippingAptNum").val();
						shipping.city = container.find(".LR-shippingCity").val();
						shipping.state = container.find(".LR-shippingState").val();
						shipping.zip = container.find(".LR-shippingZip").val();
					} else {
						shipping.firstname = billing.firstname;
						shipping.lastname = billing.lastname;
						shipping.address1 = billing.address1;
						shipping.address2 = billing.address2;
						shipping.city = billing.city;
						shipping.state = billing.state;
						shipping.zip = billing.zip;
					}
					return {
						"billing": billing,
						"shipping": shipping
					};
				};
				
				var disableCFPurchase = false;
				
				var crowdFundingPurchase = function() {
					if(disableCFPurchase) return;
					if(!Stripe) {
						alert("Error: Stripe is not loaded.");
						return;
					}
					if(!getSiteSetting("themesettings.stripeApiKey")) {
						alert("Error: Site has no Stripe API key set.");
						return;
					}
					Stripe.setPublishableKey(getSiteSetting("themesettings.stripeApiKey"));
					var form = getAndValidateCFFormFields();
					if(!form) return;
					disableCFPurchase = true;
					var tokenParams = {
						number: form.billing.cardnumber,
						cvc: form.billing.cvc,
						exp_month: form.billing.exp_month,
						exp_year: form.billing.exp_year
					};
					if(form.billing.name) tokenParams.name = form.billing.firstname + " " + form.billing.lastname;
					if(form.billing.address1) tokenParams.address_line1 = form.billing.address1;
					if(form.billing.address2) tokenParams.address_line2 = form.billing.address2;
					if(form.billing.city) tokenParams.address_city = form.billing.city;
					if(form.billing.state) tokenParams.address_state = form.billing.state;
					if(form.billing.zip) tokenParams.address_zip = form.billing.zip;
					if(form.billing.country) tokenParams.address_country = form.billing.country;
					Stripe.createToken(tokenParams, function(status, response) {
						if(response.error) {
							showCFStripeError(response.error.message);
							disableCFPurchase = false;
						} else {
							var token = response.id;
							createSiteUser(form.billing.email, 0, {}, function() {
								// call sean's API call then redirect to sharing page (returnToSharingPage())
								$.lr.api.createStripePayment(
									options.site_id,
									options.site_user_id,
									options.parent_id || "0",
									token,
									"cf",
									formatMoney(getCrowdFundingPurchaseAmount()),
									form.shipping,
									function() {
										returnToSharingPage(true);
									}, function() {
										showCFStripeError("There was an error registering your payment.  Please try again later.");
										disableCFPurchase = false;
									}
								);
							}, function() {
								showCFStripeError("There was an error signing up for an account.  Please try again later.");
								disableCFPurchase = false;
							}, true);
						}
					});
				};
				
				var registerEvents = function() {
					container.find(".LR-sign-up-input").bind('keypress', function(e) {
						if(e.keyCode == 13) doFormSignup();
					});
					container.find(".LR-sign-up-submit").click(function() {
						doFormSignup();
					});
					setupEmailShare();
					if(hasCrowdFunding()) {
						container.find(".LR-reserveBtn").click(function() {
							goToCrowdFundingForm();
						});
						container.find(".LR-purchaseBtn").click(function() {
							crowdFundingPurchase();
						});
						container.find(".LR-differentAsBilling").click(function() {
							updateCFFormState();
						});
						registerCFAmountUpdateEvent();
						var showingDetails = false;
						container.find(".LR-toggleDetails").click(function() {
							if(showingDetails) {
								container.find(".LR-productDetails").hide();
								showingDetails = false;
							} else {
								container.find(".LR-productDetails").show();
								showingDetails = true;
							}
						});
					}
				};
				
				var trackPageview = function(key) {
					_gaq.push(['_setAccount', key]);
					_gaq.push(['_setDomainName', document.location.hostname]);
					if(options.site_id && getSiteSetting('siteDomain')) _gaq.push(['_setCustomVar', 1, 'Site ID', options.site_id + '-' + getSiteSetting('siteDomain')]);
					_gaq.push(['_trackPageview']);
				};

				var initGoogleAnalytics = function(key) {
					trackPageview(key);
					trackPageview('UA-21058689-4');
					var ga = document.createElement('script');
					ga.type = 'text/javascript';
					ga.async = true;
					ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(ga, s);
				};
				
				var initCommonHTML = function() {
					//$("head").append($('<meta name="viewport" content="width=device-width, initial-scale=1.0" />'));
				};
				
				var getURLParameters = function() {
					var params = {};
					if(window.location.search.length >= 2) {
						$.each(window.location.search.substring(1).split('&'), function(k, v) {
							var parts = v.split('=', 2);
							if(parts[0]) {
								params[parts[0]] = decodeURIComponent(parts[1]);
							}
						});
					}
					return params;
				};
				
				var initURLOptions = function() {
					var params = getURLParameters();
					$.each(params, function(name, value) {
						if(name.substr(0, 5) == "lrOpt") {
							options[name.substr(5)] = value;
						}
					});
				};
				
				var initLive = function(success, error) {
					options.isLive = true;
					initURLOptions();
					initCommonHTML();
					var afterMainInit = function(a, b) {
						if(options.site_id && curSiteSettings) {
							//var hasCookie = checkSiteUserCookie();
							var hasCookie = false;
							if(!options.skipClickTrack) clickTrack();
							if(getSiteSetting("analyticsId")) initGoogleAnalytics(getSiteSetting("analyticsId"));
							hbtrk("ignition_visit");
							registerEvents();
							initCrowdFundingStats();
							var startState = getIgnitionStateFragment();
							if(!startState) {
								if(hasCookie) startState = "sharing";
								else startState = "main";
							}
							if(startState == "sharing") {
								initPostSignup();
							} else if(startState == "crowdfundingform" && hasCrowdFunding()) {
								initCrowdFundingForm();
							} else {
								initMain();
							}
							if(success) success();
						} else {
							if(error) {
								if(a) error(a, b); else error("unknown", "Unknown error initializing widget");
							}
						}
					};
					initFromSite(afterMainInit, afterMainInit);
				};
				
				var initPreview = function() {
					initCommonHTML();
					curSiteSettings = defaultSiteSettings;
					options.isLive = false;
					initPreviewUserInfo();
				};
				
				var cleanUp = function() {
					var cssToRemove = [];
					$.each(window.lrLoadedCss, function(name, el) {
						cssToRemove.push(name);
					});
					$.each(cssToRemove, function(idx, name) {
						unloadCSS(name);
					});
					container.empty();
				};
				
				// Public functions that can be called on this IgnitionInstance object
				var publicFuncs = {
					
					getContainer: function() {
						return container;
					},
					
					isLive: function() {
						return options.isLive;
					},
					
					getOptions: function() {
						return options;
					},
					
					setTheme: setThemeAndUpdate,
					
					setSetting: setNestedSiteSetting,
					
					getSetting: getSiteSetting,
					
					isWidget: isWidget,
					
					setMode: setMode,
					
					initFromSite: initFromSite,
					
					clickTrack: clickTrack,
					
					initLive: initLive,
					
					initPreview: initPreview,
					
					destroy: cleanUp,
					
					
					updateCFCutoffDate: updateCFCutoffDate
					
				};
				
				$.extend(this, publicFuncs);
			
			};
			
			window.IgnitionInstance = IgnitionInstance;
			
			// Search for Ignition containers and create an instance for each one
			$("#lr-widget").each(function() {
				var options = {};
				if($(this).attr("rel")) {
					options.site_id = $(this).attr("rel");
				} else {
					options.domain = window.location.hostname;
				}
				if($(this).attr("data-unlaunched")) options.useUnlaunchedInfo = true;
				// Can specify options in hash params by prefixing the object name with "o" (THIS IS DONE WITH GET PARAMETERS INSTEAD)
				/*if(window.hashparams) {
					$.each(window.hashparams, function(hashParamName, hashParamVal) {
						if(hashParamName.substr(0, 1) == "o") {
							options[hashParamName.substr(1)] = hashParamVal;
						}
					});
				}*/
				var ig = new IgnitionInstance($(this), options);
				ig.initLive(function() {
					if(window.lrInitCallback) window.lrInitCallback(ig, this);
				});
				window.lrIgnition = ig;
			});
			
		}
	);
	
}();
