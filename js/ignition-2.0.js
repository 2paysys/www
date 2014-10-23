/*
LaunchRock Ignition

Date:     07/02/2012
Version:  2.0
Language: JavaScript
Requires: JavaScript browser, jQuery (auto-loads), jQuery UI (auto-loads)
Author:   Sean McCullough
E-mail:   sean@launchrock.com
Support:  http://support.launchrock.com
*/

var tid;
var load_jq = function(){
var jq_url  = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';

  var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
             script;

  script       = document.createElement('script');
  script.async = 'false';
  script.src   = jq_url;
  
  script.onload = script.onreadystatechange = function(){
  
    if(!this.readyState || 
        this.readyState === 'loaded' || 
        this.readyState === 'complete'){
        
      script.onload = script.onreadystatechange = null;
      
    }
    
  };

  head.appendChild(script);
  
};

function ignition_init(){

  if(typeof(jQuery) === 'undefined'){
    load_jq();
  }else{
  
    clearInterval(tid);
    
    // Begin inline contributed code
    
    /*
    jQuery Cookie Plugin
    https://github.com/carhartl/jquery-cookie
    
    Copyright 2011, Klaus Hartl
    Dual licensed under the MIT or GPL Version 2 licenses.
    http://www.opensource.org/licenses/mit-license.php
    http://www.opensource.org/licenses/GPL-2.0
    */
    (function(a,b){function d(a){return a}function e(a){return decodeURIComponent(a.replace(c," "))}var c=/\+/g;
    a.cookie=function(c,f,g){if(arguments.length>1&&(!/Object/.test(Object.prototype.toString.call(f))||f==null)){
    g=a.extend({},a.cookie.defaults,g);if(f==null){g.expires=-1}if(typeof g.expires==="number"){var h=g.expires,
    i=g.expires=new Date;i.setDate(i.getDate()+h)}f=String(f);return b.cookie=[encodeURIComponent(c),"=",
    g.raw?f:encodeURIComponent(f),g.expires?"; expires="+g.expires.toUTCString():"",g.path?"; path="+g.path:"",
    g.domain?"; domain="+g.domain:"",g.secure?"; secure":""].join("")}g=f||a.cookie.defaults||{};var j=g.raw?d:e;
    var k=b.cookie.split("; ");for(var l=0,m;m=k[l]&&k[l].split("=");l++){if(j(m.shift())===c){return j(m.join("="))}}
    return null};a.cookie.defaults={}})(jQuery,document);

    // End inline contributed code
      
    lr               = {};
    lr.ignition      = {};
    lr.ignition.ui   = {};
    lr.ignition.util = {};
    lr.site          = {};
    
    // TODO: Objectize
    var api_host       = 'https://platform.launchrock.com',
        api_version    = 'v1',
        api_url        = api_host + '/' + api_version,
        lr_widget_div  = '#lr-widget',
        lr_widget      = $(lr_widget_div),
        lr_widget_type = lr_widget.attr('data-widget-type'),
        lr_site_id     = lr_widget.attr('data-site-id'),
        lr_wrap_id     = '#wrap-me-' + lr_site_id,
        lr_theme_url   = 'https://launchrock-assets.s3.amazonaws.com/themes/launchrock_proto/css/new-theme.css',
        lr_bs_url      = 'https://launchrock-assets.s3.amazonaws.com/themes/launchrock_proto/css/bootstrap_2/css/bootstrap.min.css',
        jq_ui_url      = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js',
        jq_ui_css_url  = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css';

    // jQuery UI
    $.getScript(jq_ui_url, function(){
      $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', jq_ui_css_url));
      console.log('jQuery UI loaded');
    });
    
    // Begin utility functions
    
    lr.ignition.util.validate_email = function(email){ 
      var exp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return exp.test(email);
    };
    
    lr.ignition.util.validate_phone = function(phone){
    
      var exp     = /^((\+)?[1-9]{1,2})?([-\s\.])?((\(\d{1,4}\))|\d{1,4})(([-\s\.])?[0-9]{1,12}){1,2}$/;
      var numbers = phone.split('').length;
      
      if(10 <= numbers && 
         numbers <= 20 && 
         exp.test(phone)
      ){
        return true;
      }
      
      return false;
      
    }
    
    lr.ignition.util.random_string = function(len){
    
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      rnd   = '';
      cnt   = 0;
      num   = 0;
  
      for (var i = 0; i < len; i++) {
      
        if((Math.floor(Math.random() * 2) == 0) && 
            num  < 3 || 
            cnt >= 5
        ){
        
          rnum  = Math.floor(Math.random() * 10);
          rnd  += rnum;
          num  += 1;
            
        }else{
        
          rnum  = Math.floor(Math.random() * chars.length);
          rnd  += chars.substring(rnum, rnum+1);
          cnt  += 1;
            
        }
          
      }
  
      return rnd;
    
    };
    
    lr.ignition.util.validate_extra_fields = function(){
    
      $extra_fields = $('.extra-fields').find('input, textarea, select');
      validated     = true;
      
      $extra_fields.each(function(){
      
        $(this).parent().removeClass('error');
        
        switch($(this).attr('id')){
        
          case 'first-name':
          
            if($(this).val() == ''){
              validated = false;
              $(this).parent().addClass('error');
            }
            
          break;
            
          case 'last-name':
          
            if($(this).val() == ''){
              validated = false;
              $(this).parent().addClass('error');
            }
            
          break;
          
          case 'phone-number':
          
            if(!lr.fn.validate_phone($(this).val())){
              validated = false;
              $(this).parent().addClass('error');
            }
            
          break;
          
          case 'company':
          
            if($(this).val() == ''){
              validated = false;
              $(this).parent().addClass('error');
            }
            
          break;
          
          case 'dob':
          
            if($(this).val() == ''){
              validated = false;
              $(this).parent().addClass('error');
            }
            
          break;
          
          case 'zip-code':
          
            if($(this).val() == ''){
              validated = false;
              $(this).parent().addClass('error');
            }
            
          break;
          
          default: break;
          
        }
        
      });
      
      return validated;
      
    };
    
    lr.ignition.util.check_error = function(data){
      return (data.response.status == 'OK') ? false : true;
    };
    
    lr.ignition.util.url_param = function(){
    
      var vars  = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
        vars[key] = value;
      });
      
      return vars;
      
    };
    
    lr.ignition.util.hex2rgb = function(color){
    
      var r,g,b;
      
      if (color.charAt(0) == '#'){
        color = color.substr(1);
      }
    
      r = color.charAt(0) + '' + color.charAt(1);
      g = color.charAt(2) + '' + color.charAt(3);
      b = color.charAt(4) + '' + color.charAt(5);
    
      r = parseInt( r,16 );
      g = parseInt( g,16 );
      b = parseInt( b ,16);
      
      return {
        'r':r, 
        'g':g, 
        'b':b
      };
      
    };
  
    lr.ignition.util.hex2aarrggbb = function(hex, alpha){
    
      if(hex.charAt(0) == '#'){
        hex = hex.substr(1);
      }
      
      return '#' + lr.ignition.util.hex(alpha * 255) + hex;
      
    };
  
    lr.ignition.util.hex = function(value){
    
      var hexDigits = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'); 
      value = Math.floor(value);
      
      return isNaN(value) ? "00" : hexDigits[(value - value % 16) / 16] + hexDigits[value % 16];
      
    };
    
    lr.ignition.util.t2h = function(text){
    
      if(text){
        return text.replace(/\n/g,'<br>');
      }else{
        return '';
      }
  
    };
    
    // End utility functions
    // Begin widget functions
    
    lr.ignition.load_css = function(){
      $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', lr_theme_url));
      $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', lr_bs_url));
    };
    
    lr.ignition.check_cookie = function(){
    
      if($.cookie('returning_user')){
        lr.site.returning_user = $.cookie('returning_user');
      }else{
        lr.site.returning_user = false;
      }
    
      console.log('Returning user:', lr.site.returning_user);
    
    };
    
    lr.ignition.hit = function(){

      $.post(api_url + '/clickTrack?callback=?', {
        site_id:   lr_site_id,
        parent_id: lr.site.referrer_id,
        browser:   navigator.userAgent.toString(),
        ip:        lr.site.client_ip,
        referrer:  document.referrer,
        comments:  ''
      },
      
      function(data){
      
        lr.site.traffic_source = data.response.click_track.source;
        console.log('Traffic recorded');
        
      }, 'json');
      
      return true;    
    
    };
    
    lr.ignition.load_referrer = function(referral_code){
    
      ref = lr.ignition.util.url_param().lrRef;
    
      if(typeof(ref) !== 'undefined'){
        
        console.log('Referral code present');
        
        $.post(api_url + '/getSiteUserChannelLink?callback=?', {
          site_id:       lr_site_id,
          referral_code: ref
        },
        
        function(data){
      
          if(!lr.ignition.util.check_error(data)){
          
            console.log('Valid referral code loaded', data);
            lr.site.referrer_id = data.response.channel_link.UID;
            
          }else{
          
            console.log('Invalid referral code');
            lr.site.referrer_id = 0;
            
          }
          
        }, 'json');
        
      }else{
      
        lr.site.referrer_id = 0;
        console.log('Referral code not present');
        
      }
      
      $.post(api_url + '/getClientIP?callback=?', {
        prod: 1,
      },
    
      function(data){
        
        lr.site.client_ip = data.response.client_ip.ip;
        
        lr.ignition.hit();
        lr.ignition.render();
        
      }, 'json');
      
    };
    
    lr.ignition.load_widget = function(site_id){
    
      $.post(api_url + '/getSiteInfo?callback=?', {
        site_id: lr_site_id
      },
      
      function(data){
      
        lr.site = data.response.site;
        console.log('Site information loaded');
        
        lr.ignition.load_referrer();
        
      }, 'json');
      
      return true;
    
    };
    
    lr.ignition.render = function(){
      
      console.log('Render init');
      
      lr.ignition.check_cookie();
      lr.ignition.load_css(lr_theme_url);
      lr.ignition.ui.render_dom();
      
    };
    
    lr.ignition.collect_extra_fields = function(){
    
      extra_fields       = $('.extra-fields').find('input, textarea, select');
      extra_fields_array = {};
      
      extra_fields.each(function(){
        extra_fields_array[$(this).attr('id')]=$(this).val();      
      });
      
      return extra_fields_array;
      
    };
    
    // End widget functions
    // Begin UI functions

    lr.ignition.ui.render_dom = function(){
      
      lr.ignition.ui.render_box();
      lr.ignition.ui.show_announcement();
      lr.ignition.ui.set_box_color();
      lr.ignition.ui.show_tab();
      
    };
    
    lr.ignition.ui.render_box = function(){
    
      if($(lr_widget_div).parent().get(0).tagName == "BODY"){
        lr.site.displayType = 'full';
      }else{
        lr.site.displayType = 'widget';
      }
    
      html = [
      
        '<div id="wrap-me-' + lr_site_id + '">',
        '<div class="site box boxcolor" style="display: none;">',
        '<h2 id="site-title-' + lr_site_id + '" class="site-title"></h2>',
        '<div id="site-logo-' + lr_site_id + '" class="logo-container" style="display:none;">',
        '  <span></span>',
        '</div>',
        '<div class="sign-up-container">',
        '  <h2 id="site-tagline-' + lr_site_id + '" class="tagline"></h2>',
        '  <p id="site-desc-' + lr_site_id + '" class="description">',
        '  </p>',
        '  <div class="sign-up">',
        '    <label for="sign-up"  class="input-label" id="instructions-' + lr_site_id + '"></label>',
        '    <input id="sign-up" type="text" data-initial="email@address.com" value="email@address.com" />',
        '    <a class="go" id="email-only-submit-button" style="margin:0px">GO</a>',
        '  </div>',
        '  <p class="email-error" style="display:none;text-align:left;color:red;font-weight:bold;"></p>',
        '</div>',
        '<div class="sign-up-form-container" style="display:none">',
        '  <div class="wrapper">',
        '    <div  class="inner">',
        '     <div class ="extra-fields">',
        '      <div data-extra-field="extra-field-name" class="input-block">',
        '        <label for="first-name" class="input-label">First Name</label>',
        '        <input type="text" id="first-name" />',
        '      </div>',
        '      <div data-extra-field="extra-field-name" class="input-block">',
        '        <label for="last-name" class="input-label">Last Name</label>',
        '        <input type="text" id="last-name" />',
        '      </div>',
        '      <div data-extra-field="extra-field-company" class="input-block medium">',
        '        <label for="company" class="input-label">Company</label>',
        '        <input type="text" id="company" />',
        '      </div>',
        '      <div data-extra-field="extra-field-phone" class="input-block medium">',
        '        <label for="phone-number" class="input-label">Phone Number</label>',
        '        <input type="text" id="phone-number" />',
        '      </div>',
        '      <div data-extra-field="extra-field-zip" class="input-block">',
        '        <label for="zip-code" class="input-label">Zip/Postal Code</label>',
        '        <input type="text" id="zip-code" />',
        '      </div>',
        '      <div data-extra-field="extra-field-dob" class="input-block">',
        '        <label for="dob" class="input-label">Date of Birth</label>',
        '        <input type="text" id="dob" />',
        '      </div>',
        '    </div>',
        '   </div>',
        '    <div class="trim bottom">',
        '      <div class="left">',
        '        <span id="signupError-' + lr_site_id + '" class="validation-error" style="display: none"></span>',
        '      </div>',
        '      <div class="right"> <a class="go" id="form-submit-button">GO</a></div>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="site-powered-by">',
        '  powered by <a style="text-indent: -9000px; " href="http://launchrock.com/?ref=oldlr">launchrock</a>',
        '</div>',
        '<div class="sharing-container" style="display:none">',
        '  <p id="invite-label-' + lr_site_id + '" class="description">',
        '    {{DESCRIPTION}}',
        '  </p>',
        '  <div id="sharebuttons-' + lr_site_id + '" class="sharing">',
        '    <div class="share-tip tip">Share this and watch your stats improve</div>',
        '    <span id="twitter-' + lr_site_id + '" class="twitter"></span>',
        '    <span id="linkedIn-' + lr_site_id + '" class="linkedIn"></span>',
        '    <span id="tumblr-' + lr_site_id + '" class="tumblr"></span>',
        '    <span id="facebook-' + lr_site_id + '" class="facebook"></span>',
        '    <br/><br/>',
        '    <div class="sharing-form">',
        '     <div class="share-via-email" style="display:none">',
        '      <label>Share by Email:</label>',
        '      <input type="text" value="Enter emails, (comma separated)" />',
        '      <div class="import">',
        '         <label>import</label>',
        '         <div class="bubble">',
        '            <span>Import your contacts:</span>',
        '            <a class="gmail">Gmail</a>',
        '            <a class="yahoo">Yahoo</a>',
        '            <a class="aol">AOL</a>',
        '            <a class="msn">MSN</a>',
        '            <a class="osx">OSX</a>',
        '            <a class="plaxo">Plaxo</a>',
        '         </div>',
        '      </div>',
        '      </div>',
        '      <label>Share this link:</label>',
        '      <input type="text" id="shareurl-' + lr_site_id + '" value="" style="cursor: pointer;" disabled />',
        '    </div>',
        '    <div class="stats-tip tip">Stats increase as users sign up with your links</div>',
        '    <div class="stats" style="display: none">',
        '      <div class="arrow"></div>',
        '      <br/>',
        '      <label>Your Live Stats:</label>',
        '      <div class="clicks">',
        '      </div>  ',
        '      <div class="sign-ups">',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="social">',
        '    <span class="find-us-on">Find Us On:</span>',
        '      <a href="" target="_blank" class="instagram instagram-social-link">Instagram</a>',
        '      <a href="" target="_blank" class="rss rss-social-link">RSS</a>',
        '      <a href="" target="_blank" class="youtube youtube-social-link">YouTube</a>',
        '      <a href="" target="_blank" class="twitter twitter-social-link">Twitter</a>',
        '      <a href="" target="_blank" class="pinterest pinterest-social-link">Pinterest</a>',
        '      <a href="" target="_blank" class="facebook facebook-social-link">Facebook</a>',
        '      <a href="" target="_blank" class="tumblr tumblr-social-link">Tumblr</a>',
        '      <a href="" target="_blank" class="vimeo vimeo-social-link">Vimeo</a>',
        '      <a href="" target="_blank" class="github github-social-link">GitHub</a>',
        '    </span>',
        '  </div>',
        '  <div class="clear"></div>',
        '</div>',
        '</div>',
        '</div>'
      
      ].join('\n');
      
      $('body')
      .css('margin',            '0')
      .css('background',        'url(' + lr.site.bgImage + ') fixed')
      .css('background-repeat', 'no-repeat')
      .css('background-size',   $(window).width() + ' ' + $(window).height());
      
      $(lr_widget_div).html(html);
      
      // Box alignment
      $(lr_wrap_id).find('.site').css('margin', '110px auto 50px');

      switch(lr.site.textAlignment){
      
        case 'left':
          $(lr_wrap_id).find('.site').css('margin','110px auto 50px 14.4%');
        break;
          
        case 'center':
          $(lr_wrap_id).find('.site').css('margin', '110px auto 50px');
        break;
        
        case 'right':
          $(lr_wrap_id).find('.site').css('margin', '110px 14.4% 50px auto');
        break;
        
        default: $(lr_wrap_id).find('.site').css('margin', '110px auto 50px');
          
      }
      
      // Instructions
      if(lr.site.instructionsToggle == 1){
        $('#instructions-' + lr_site_id).html(lr.ignition.util.t2h(lr.site.inviteList));
        $('#instructions-' + lr_site_id).show();
      }else{
        $('#instructions-' + lr_site_id).hide();
      }
      
      // Incentive
      if(lr.site.incentive == undefined || 
         lr.site.incentive == ''
      ){
        $('#invite-label-' + lr_site_id).hide();
      }else{
        $('#invite-label-' + lr_site_id).html(lr.ignition.util.t2h(lr.site.incentive));
      }
      
      // Description
      if(lr.site.descriptionToggle == 1){
      
        if(lr.site.description){
          $('#site-desc-' + lr_site_id).html(lr.ignition.util.t2h(lr.site.description));
        }
        
      }else{
        $('#site-desc-' + lr_site_id).hide();
      }
      
      // Logo / site name
      $(lr_wrap_id).find('h2.site-title').html(lr.site.siteName);
      
      if(lr.site.logo && 
         lr.site.logo != '' && 
         lr.site.logo != 'http://public.launchrock.com/images/')
      {
        $(lr_wrap_id).find('h2.site-title').hide();
        $(lr_wrap_id).find('.logo-container').show();
        $(lr_wrap_id).find('.logo-container').html('<img src="' + lr.site.logo + '" alt="' + lr.site.siteName + ' Logo" class="site-logo" />');
      }
      
      // E-mail list?  No idea.  Might be the import shit.
      $('#emailList-' + lr_site_id).focus(function(){
      
        if($(this).val() == $(this).attr('data-initial')){
          $(this).val('');
        }
        
        $('#share-email-more-'+ lr_site_id).slideDown();
        
      });
      
      $('#emailList-' + lr_site_id).blur(function(){
      
        if($(this).val() == ''){
        
          $(this).val($(this).attr('data-initial'));
          $('#share-email-more-' + lr_site_id).slideUp();
          
        }
        
      });
      
      // Extra fields
      lr.ignition.ui.set_extra_fields();
      
      // Form interactions
      $('#sign-up').focus(function(){
      
        if($(this).val() == $(this).attr('data-initial')){
          $(this).val('');
        }
        
      });
  
      $('#sign-up').blur(function(){
      
        if($(this).val() == ''){
          $(this).val($(this).attr('data-initial'));
        }
        
      });
      
    };

    lr.ignition.ui.set_box_color = function(){

      if(!lr.site.boxBackgroundColorHex || lr.site.boxBackgroundColorHex === ''){
        lr.site.boxBackgroundColorHex = '#000000';
      }
      
      if(!lr.site.boxAlpha || lr.site.boxAlpha === ''){
        lr.site.boxAlpha = 65;
      }
      
      var boxRGB   = lr.ignition.util.hex2rgb(lr.site.boxBackgroundColorHex),
          boxAlpha = (lr.site.boxAlpha / 100),
          AARRGGBB = lr.ignition.util.hex2aarrggbb(lr.site.boxBackgroundColorHex, boxAlpha),
          RGBA     = 'rgba(' + boxRGB.r + ',' + boxRGB.g + ',' + boxRGB.b + ',' + boxAlpha + ')',
          RGB      = 'rgb(' + boxRGB.r + ',' + boxRGB.g + ',' + boxRGB.b + ')';
      
      $('body').find('.boxcolor')
      .css('background', RGB)
      .css('background', RGBA)
      .css('filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr='+ AARRGGBB + ', endColorstr=' + AARRGGBB + ')')
      .css('-ms-filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr='+ AARRGGBB + ', endColorstr=' + AARRGGBB + ')');
      
    };
    
    lr.ignition.ui.show_tab = function(){
      $('body').append('<div style="position:fixed;bottom:0;right:0;z-index: 999999"><a href="http://launchrock.com/?ref=' + lr_site_id + '" title="Powered By LaunchRock"><img src="http://beta.launchrock.com/images/powered_by_lr.png" /></a></div>');
    };
    
    lr.ignition.ui.show_announcement = function(){
    
      if(lr.site.announcementBannerToggle == 1){
        $('body').append('<div id="titlebar-' + lr_site_id + '" class="titlebar boxcolor"><p>' + lr.site.announcementBanner + '</p></div>');
      }
      
    };
    
    lr.ignition.ui.set_extra_fields = function(){
    
      lr.site.extra_fields_count = 0;
      
      if(!lr.site.extraFields || 
          lr.site.extraFields == ''
      ){
      
        lr.site.extraFields_object = {
        
          'extra-field-name':    false,
          'extra-field-phone':   false,
          'extra-field-company': false,
          'extra-field-zip':     false,
          'extra-field-dob':     false,
          'extra-field-custom': {
            'toggle':   false,
            'type':     'text',
            'question': 'question',
            'answers': [
              'this',
              'that',
              'the-other'
            ]
            
          }
          
        }
        
      }else{
        lr.site.extraFields_object = lr.site.extraFields;
      }
      
      for(var key in lr.site.extraFields_object){
      
        if(lr.site.extraFields_object[key] === true){
        
          if(key == 'extra-field-custom'){
          
            if(lr.site.extraFields_object[key].toggle === true){
              // ?
            }
            
          }else{
          
            $('[data-extra-field="' + key + '"]').show();
            lr.site.extra_fields_count++;
            
          }
          
        }else if(lr.site.extraFields_object[key] === false){
          $('[data-extra-field="' + key + '"]').remove();
        }
        
      }

      if(lr.site.extra_fields_count > 0){
        
        // New user
        if(!lr.site.returning_user){
        
          $('#sign-up').addClass('initial').mouseup(function(){
          
            if($(this).is('.initial')){
              
              $(this)
              .removeClass('initial')
              .focus()
              .val('')
              .siblings('.go')
              .fadeOut(100);
              
              $('.sign-up-form-container').show('blind', {
                direction: 'vertical'
              }, 400);
              
            }
            
          });
        
        // Returning user  
        }else{
        
          $('#sign-up').bind('keydown', function(event){
  
            keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
            
            if(keycode == 13){
              
              $('#form-submit-button').click();
              return false;
              
            }else{
              return true;
            }
            
          }); 
        
        }
        
        // Full form submission
        $('#form-submit-button').click(function(){
        
          $('#signupError-' + lr_site_id)
          .slideUp();
          
          $('#instructions-' + lr_site_id)
          .removeClass('error');
          
          if(lr.ignition.util.validate_email($('#sign-up').val()) &&
             $('#sign-up').val() != $('#sign-up').attr('data-initial')
          ){

            if(lr.ignition.util.validate_extra_fields()){
              
              console.log('Submit new user: extra fields');

              $.post(api_url + '/createSiteUser?callback=?', {
                'email':        $('#sign-up').val(),
                'password':     lr.ignition.util.random_string(32),
                'parent_id':    lr.site.referrer_id,
                'site_id':      lr_site_id,
                'source' :      lr.site.traffic_souce,
                'extra_fields': lr.ignition.collect_extra_fields(),
                'ip':           lr.site.client_ip
              }, 
              
              function(data){
              
                if(!lr.ignition.util.check_error(data)){
                
                  console.log('User submitted');
                  
                  $.cookie('returning_user', $('#sign-up').val(), {
                    expires: 365, 
                    path:    '/' 
                  });
                    
                  lr.ignition.ui.show_sharing();
                  
                }else{
                  console.log('API error: ' + data.response.error_message);
                }
                
              }, 'json');
              
            }else{
            
              $('#signupError-' + lr_site_id)
              .html('Please fix the errors above.')
              .slideDown();
              
              console.log('Pulse incomplete form');
              
            }
          
          }else{
          
            $('#signupError-' + lr_site_id)
            .html('Please fix the errors above.')
            .slideDown();
          
            // TODO: add an .error class to theme css
            $('#instructions-' + lr_site_id)
            .addClass('error');
            
            console.log('Pulse invalid e-mail');
            
          }
          
        });
        
        $('#email-only-submit-button').click(function(){
          $('#sign-up').mouseup();
        });
        
      }else{
        
        // Single-element submission
        $('#email-only-submit-button').click(function(){
        
          console.log('Submit new user: e-mail only');
          
          if(lr.ignition.util.validate_email($('#sign-up').val()) &&
             $('#sign-up').val() != $('#sign-up').attr('data-initial')
          ){
          
            $.post(api_url + '/createSiteUser?callback=?', {
              'email':        $('#sign-up').val(),
              'password':     lr.ignition.util.random_string(32),
              'parent_id':    lr.site.referrer_id,
              'site_id':      lr_site_id,
              'source' :      lr.site.traffic_souce,
              'extra_fields': lr.ignition.collect_extra_fields(),
              'ip':           lr.site.client_ip
            }, 
            
            function(data){
              
              if(!lr.ignition.util.check_error(data)){
              
                console.log('User submitted');
                
                $.cookie('returning_user', $('#sign-up').val(), {
                  expires: 365, 
                  path:    '/' 
                });
                  
                lr.ignition.ui.show_sharing();
                
              }else{
                console.log('API error: ' + data.response.error_message);
              }
              
            }, 'json');
            
          }else{
          
            $('#signupError-' + lr_site_id)
            .html('Please fix the errors above.')
            .slideDown();
            
            console.log('Pulse incomplete form');
            
          }
          
        });
        
        $('#sign-up').bind('keydown', function(event) {
        
          var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
          
          if(keycode == 13){

            $('#email-only-submit-button').click();
            return false;
            
          }else{
            return true;
          }
          
        });
        
      }

    };
    
    lr.ignition.ui.show_sharing = function(){
    
      $('.sign-up-form-container').hide('blind', {
        direction: 'vertical'
      }, 200, function(){
      
        $('.site-powered-by').fadeOut(100);
        
        $(this).prev().hide('blind', {
          direction: 'vertical'
        }, 300, function(){
        
          $('.sharing-container').show('blind', {
            direction: 'vertical'
          }, 400);
          
          // Dep't?
          if(lr.site.displayType == 'full'){
          
            $('.share-tip.tip').animate({
              left: '-120px'
            }, 1000, function(){
              $('.share-tip.tip').animate({
                left: '-133px'
              }, 130);
            });
            
          }
          
        });
        
      });
      
      // Show stats shit on hover.
      $('.sharing > span').mouseover(function(){
      
        if(!$('.stats').is('.rolledDown')){
        
          $('.stats-tip.tip').css('top', ($('.clicks').offset().top + 170) + 'px');
          
          $('.stats').addClass('rolledDown').show('blind', {
            direction: 'vertical'
          }, 400);
          
          // Dep't?
          if(lr.site.displayType == 'full'){ 
           
            $('.share-tip.tip').fadeOut(300);
            $('.stats-tip.tip').animate({
              left: '-120px'
            }, 1000, function(){
            
              $('.stats-tip.tip').animate({
                left: '-133px'
              }, 130);
              
            });
            
          }
          
        }
        
      });
    
    };
    
    // End UI functions
    // Begin interactions
    
    $(window).resize(function(){
      $('body').css(
        'background-size', $(window).width() + ' ' + $(window).height()
      );
    });
    
    // End interactions
    
    // ALL ROUTINES ABOVE THIS LINE //
    lr.ignition.load_widget(lr_site_id);
    // NOTHING GOES BELOW THIS LINE //
    
  }
  
}

tid = setInterval(ignition_init, 1000);