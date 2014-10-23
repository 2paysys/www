! function($) {
	if(!window.lrignition) window.lrignition = {};
	if(!window.lrignition.themeSpecs) window.lrignition.themeSpecs = {};
	
	var mobileMediaQuery = "only screen and (min-device-width : 320px) and (max-device-width : 480px)";
	var tabletMediaQuery = "(min-height: 600px) and (max-height: 799px)";
	
	var genStdTheme = function( name, js, base, hasTabletCSS ) {
		var r = {
			name : name,
			baseTheme : base || 'common',
			html : {
				main : {
					name : 'theme_' + name + '_main',
					url : 'themes/' + name + '/' + name + '.html'
				}
			},
			css : {
				main : {
					name : 'theme_' + name,
					url : 'themes/' + name + '/' + name + '.css'
				},
				mainMobile : {
					name : 'theme_' + name + '-mobile',
					url : 'themes/' + name + '/' + name + '-mobile.css',
					mediaName: "mobile",
					mediaQuery: mobileMediaQuery
				}
			},
			js : js ? [
				{
					name : 'theme_' + name,
					url : 'themes/' + name + '/' + name + '.js'
				}
			] : []
		};
		if(hasTabletCSS) {
			r.css['mainTablet'] = {
				name : 'theme_' + name + '-tablet',
				url : 'themes/' + name + '/' + name + '-tablet.css',
				mediaName : 'tablet',
				mediaQuery : tabletMediaQuery
			};
		}
		return r;
	};
	$.extend(window.lrignition.themeSpecs, {
		
		"common": {
			name: "common",
			js: [
				{
					name: "theme_common",
					url: "themes/common/common.js"
				}
			]
		},
		
		"classic": {
			name: "classic",
			baseTheme: "common",
			html: {
				main: {
					name: "theme_classic_main",
					url: "themes/classic/classic.html"
				}
			},
			js: [
				{
					name: "theme_classic",
					url: "themes/classic/classic.js"
				}
			],
			css: {
				main: {
					name: "theme_classic",
					url: "themes/classic/classic.css"
				},
				mainMobile: {
					name: "theme_classic-mobile",
					url: "themes/classic/classic-mobile.css",
					mediaName: "mobile",
					mediaQuery: mobileMediaQuery
				},
				fonts1: {
					name: "theme_font_montserrat",
					url: "//fonts.googleapis.com/css?family=Montserrat"
				}
			}
		},
		
		"video": {
			name: "video",
			baseTheme: "common",
			html: {
				main: {
					name: "theme_video_main",
					url: "themes/video/video.html"
				}
			},
			css: {
				main: {
					name: "theme_video",
					url: "themes/video/video.css"
				},
				mainMobile: {
					name: "theme_video-mobile",
					url: "themes/video/video-mobile.css",
					mediaName: "mobile",
					mediaQuery: mobileMediaQuery
				}
			},
			js: [
				{
					name: "theme_video",
					url: "themes/video/video.js"
				}
			]
		},
		mobile_app : genStdTheme( 'mobile_app', true ),
		clean : genStdTheme( 'clean', true ),
		focus : genStdTheme( 'focus', true, null, true ),
		neostylus : genStdTheme( 'neostylus', true ),
		crowdfunding : genStdTheme( 'crowdfunding', true )
		
	});
}(jQuery);



