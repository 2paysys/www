! function( $ ) {
	window.lrLoadedJs = $.extend(
		{},
		window.lrLoadedJs || {},
		{
			json : true,
			jquery : true,
			jquerycookie : true,
			jqueryplaceholder : true,
			lrapi_internal : true,
			lrapi_public : true,
			lrapi : true,
			theme_base : true,
			theme_common : true,
			theme_classic : true,
			theme_clean : true,
			theme_focus : true,
			theme_mobile_app : true,
			theme_neostylus : true,
			theme_video : true,
			presetThemes : true
		}
	);
}( jQuery );
