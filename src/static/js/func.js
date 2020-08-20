var ws_state,ws_col,ws_comp,ws_chat;
var bal_load_tmt, state_show_tmt, new_notif_show_tmt;
var DENOM = 100000000;
var user_pk;
var arb_data;
var sleep_mode;
var trmove;
var waiting_slot_result = false;
var last_ac = new Date();
var slots_sound;
var music_arr = shuffle(["music2.mp3"]);
music_arr.unshift("music1.mp3");
var music_current;
var reconnects=0;
var was_connected=false;
var quiz_cnt;
var open_markets;
var first_convert_load;
var cor_slot_sound;
var attack_sound;
var hidden_blocks = [];

var socket_type = "ws://";
if (location.protocol === 'https:') {
    socket_type = "wss://";
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function mktime()
{
    return Math.round((new Date()).getTime() / 1000)
}

function anim_number(block,start,number)
{
    $(block).prop('number', start).animateNumber({number: number,},{easing: 'swing',duration: 1100});
}

function latest_ledgers_highlight()
{
    $(".latest_ledgers .hash").each(function(){
        var new_str="";
        var str = $(this).text();
        var alr = 0;
        for (var i = 0; i < str.length; i++) {
           char = str.charAt(i);
           if((char=="0" || char=="1" || char=="2" || char=="3" || char=="4" || char=="5" || char=="6" || char=="7" || char=="8" || char=="9") && alr<2){
               new_str+='<span class="red">'+char+'</span>';
               alr+=1
           }else{
              new_str+=char;
           }
        }
        $(this).html(new_str);
    });
}

function guitar_anim()
{
    if(storage && localStorage.getItem('anim') == 'true'){
        if($(".k_center h1, .k_top h1, header h1").length){
            var blk = $(".k_center h1, .k_top h1, header h1");
            blk.append($(gca[getRandom(0,3)]).clone());
            blk.find(".gca:last").animate({"opacity":"0.7","left":"28px"},1200).animate({"left":"30px","top":"22px","opacity":"1"},700).animate({"left":"32px","top":"20px"},600).animate({"left":"34px","top":"22px"},700)
            .animate({"left":"36px","top":"20px"},600).animate({"left":"38px","top":"22px"},600).animate({"left":"40px","top":"20px"},600)
            .animate({"left":"42px","top":"22px"},600).animate({"left":"44px","top":"20px"},600).animate({"left":"46px","top":"22px"},600).animate({"left":"48px","top":"20px"},600)
            .animate({"left":"50px","top":"22px","opacity":"0"},900,function(){$(this).remove()});
        }
        if($(".kx").length){
            $(".kx").each(function(){
                $(this).find("h2 span:first").fadeIn(850);
                $(this).find("h2 span:last").fadeOut(850,function(){
                    $(this).fadeIn(550);
                    $(this).closest(".kx").find("h2 span:first").fadeOut(550);
                });
            });
        }
    }
    setTimeout(guitar_anim,getRandom(6500,12000));
}


var load_carry_items_tmt = null;
function before_load_carry_items()
{
    if(load_carry_items_tmt)clearTimeout(load_carry_items_tmt);
    $(".goods_list").html(loader_big);
    load_carry_items_tmt = setTimeout(function(){
        var url = $(".goods_list").attr("rel");
        var parts = $("input[name=loc_coords]").val().split(",");
        $.get(url,{lat:parts[0],lon:parts[1]},function(ret){
            $(".goods_list").html(ret);
        });
    },4000);
}


function showPosition(loc)
{
    if(loc.coords){
        $(".cur_loc").html(loader_small);
        $(".cur_loc").attr("rel",String(loc.coords.latitude)+","+String(loc.coords.longitude));
        $("input[name=loc_coords]").val(String(loc.coords.latitude)+","+String(loc.coords.longitude));
        initMap(loc.coords.latitude,loc.coords.longitude);
        $(".cur_loc_map").show();
    }else{
        $(".goods_list").html(loc);
    }
}

function getLocation(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    return "Geolocation is not supported by this browser.";
  }
}

var gmap;
var geocoder;

function google_geocoder_initialize() {
  geocoder = new google.maps.Geocoder();
}

function initMap(lat,lon) {
    gmap = new google.maps.Map(document.getElementById('map'), {
      center: {lat: lat, lng: lon},
      zoom: 16
    });
    var marker = new google.maps.Marker({
        position: {lat: lat, lng: lon},
        map: gmap,
        title: 'My location',
        draggable:true
      });
    var latlng = new google.maps.LatLng(lat, lon);
      geocoder.geocode({
        'latLng': latlng
      }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var loc_name = "";
          var loc_country = "";
          results.forEach(function(k,v){
            //console.log(k,v);
            if(k.types.indexOf("sublocality") > -1)loc_name = k.formatted_address;
            if(k.types.indexOf("locality") > -1 && !loc_name)loc_name = k.formatted_address;
            if(k.types.indexOf("country") > -1)loc_country = k.place_id;
          });
          if(!loc_name)loc_name="-";
          $(".cur_loc").html(loc_name);
          $("input[name=loc_title]").val(loc_name);
          $("input[name=loc_country]").val(loc_country);
        } else {
          alert('Geocoder failed due to: ' + status);
        }
      });

    google.maps.event.addListener(marker, 'dragend', function()
    {
        pos = marker.getPosition();
        var latlng = new google.maps.LatLng(pos.lat(), pos.lng());
          geocoder.geocode({
            'latLng': latlng
          }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              var loc_name = "";
              results.forEach(function(k,v){
                if(k.types.indexOf("sublocality") > -1)loc_name = k.formatted_address;
                if(k.types.indexOf("locality") > -1 && !loc_name)loc_name = k.formatted_address;
              });
              if(!loc_name)loc_name="-";
              $(".cur_loc").html(loc_name);
              $("input[name=loc_title]").val(loc_name);
            }})
        $("input[name=loc_coords]").val(pos.lat().toFixed(7)+","+pos.lng().toFixed(7));
        before_load_carry_items();
    });
}


function upd_bals()
{
    $.get("/ajax_balances/",function(ret){
        if(ret.balances){
            $(".ubal").each(function(){
                var code = $(this).attr("rel");
                if(ret.balances[code] || !isNaN(ret.balances[code])){
                    if(code=="bets")$(this).html(ret.balances[code]);
                    else $(this).html(nToDec(ret.balances[code]));
                }
            });
            if(ret.balances["exp"] || !isNaN(ret.balances["exp"])){
                $(".k_user .name span").html("EXP " + String(ret.balances["exp"]) + "/" + String(ret.next_level));
                var prc = (Number(ret.balances["exp"]) / Number(ret.next_level)) * 100;
                $(".k_user .trusts_p .prbar .p").css("width",String(prc)+"%");
                $(".k_user .name .level").html(String(ret.level));
            }
        }
    });
}


function prev_date_bet(obj,date)
{
    //console.log(date instanceof Date);
    if(date instanceof Date){
         var day = date.getDate();
         var monthIndex = date.getMonth();
         var year = date.getFullYear();
         var date = String(day)+"."+String(monthIndex+1)+"."+String(year)
    }
    var url = $(obj).closest(".prev_betting").attr("rel");
    $(obj).closest(".prev_betting").find(".forloadhist").html(loader_big);
    $.get(url,{date:date},function(ret){
        $(obj).closest(".prev_betting").find(".forloadhist").html(ret);
    });
}

function arrayMax(array) {
  return array.reduce(function(a, b) {
    return Math.max(a, b);
  });
}

function arrayMin(array) {
  return array.reduce(function(a, b) {
    return Math.min(a, b);
  });
}

function toFixedTrunc(value, n) {
  if(value.toString().indexOf("e-")>=0){
    value = removeExponent(value.toString());
  }
  const v = value.toString().split('.');
  if (n <= 0) return v[0];
  var f = v[1] || '';
  if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
  while (f.length < n) f += '0';
  return `${v[0]}.${f}`
}

function translate(block)
{
    if(storage){
        lang=localStorage.getItem('lang');
        if(lang!=blang || lang!="en"){
            blang=lang;
            if(lang=="en"){
                return trs(block,true);
            }else{
                l_file=localStorage.getItem('l_file');
                var langver = lang+app_ver;
                if(l_file != langver){
                    $.getJSON("/static/media/langs/"+lang+".json",{_: new Date().getTime()},function(ret){
                        localStorage.setItem('l_file',langver);
                        localStorage.setItem('l_file_c',JSON.stringify(ret));
                        lang_arr = ret;
                        return trs(block);
                    }).fail(function() {
                        localStorage.setItem('lang','en');
                    });
                }else{
                    try {
                        lang_arr = JSON.parse(localStorage.getItem('l_file_c'));
                    } catch (e) {
                        localStorage.setItem('l_file',"");
                    }
                    return trs(block);
                }
            }
        }
    }
}

var trans_int;
$(document).ajaxComplete(function() {
  if(trans_int){
    clearTimeout(trans_int);
  }
  if($(".updating .tmt:not(.baralr)").length){
        upd_tmt_bar($(".updating .tmt:not(.baralr)"));
  }
  trans_int=setTimeout(function(){apply_localtime();translate();if($("u:first").hasClass("tosel")){$("u:not(.tosel)").addClass("tosel");$(".infot:not(.tosel),select:not(.tosel)").addClass("tosel");} },30);
});

function bench()
{
    if(!localStorage.getItem('anim')){
        var dt1 = new Date();
        for(var i=0;i<20000;i++){
            r = 1/2;
        }
        var dt2 = new Date();
        var ddif = dt2.getTime()-dt1.getTime();
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        if(ddif<7 || (ddif<21 && isChrome)){
            localStorage.setItem('anim',"true");
        }else{
            localStorage.setItem('anim',"false");
        }
    }
    if(localStorage.getItem('anim')=="false"){
        $.fx.off = true;
        $("body").addClass("noanim");
    }else{
        $.fx.off = false;
        $("body").removeClass("noanim");
    }
}

function apply_settings()
{
    app_ver = $("body").attr("rel");
    if(storage){
	//delay before behcmark
        setTimeout(function(){bench()},3000);
        if(localStorage.getItem('anim')=="false"){
            $.fx.off = true;
            $("body").addClass("noanim");
        }else{
            $.fx.off = false;
            $("body").removeClass("noanim");
        }
        if(!localStorage.getItem('sounds')){
            localStorage.setItem('sounds',"true");
        }
	    if(!localStorage.getItem('mes_notify_header')){
            localStorage.setItem('mes_notify_header',"true");
        }
	    if(!localStorage.getItem('exchange_gaming')){
            localStorage.setItem('exchange_gaming',"true");
        }
        if(!localStorage.getItem('lang')){
            var userLang = navigator.language || navigator.userLanguage;
            if(userLang){
                if(userLang.indexOf("-")>=0)userLang=userLang.split("-")[0];
                $.get("/ajax_langs/",function(ret){
                    $.each(ret.langs, function(index, value) {
                        if(userLang==index){
                            localStorage.setItem('lang',index);
                        }
                    });
                });
            }
        }
        if($(".k_user").length){
            if(localStorage.getItem('mes_notify_header') == 'true' || localStorage.getItem('help_improve') == 'true'){
                $("body>.hright").css("display","inline-block");
            }else{
                $("body>.hright").css("display","none");
            }
            if(localStorage.getItem('mes_notify_header') == 'true'){$(".hright .notifies,.hright .msgs,.hright .balances").css("display","inline-block");}
            else{$(".hright .notifies,.hright .msgs,.hright .balances").css("display","none");}
            if(localStorage.getItem('help_improve') == 'true'){$(".hright .improve_tr").css("display","inline-block");}
            else{$(".hright .improve_tr").css("display","none");}

            if($("body>.hright a:visible").length==0){
                $("body>.hright").css("display","none");
            }


        }

        if(localStorage.getItem('withchat') == "false" || !localStorage.getItem('withchat')){
            $("body").removeClass("withchat");
        }

        if($(".chat").length){
            var lang = localStorage.getItem('lang');
            $(".chat .choose span:contains('"+lang+"')").click();
        }

        if(!$(".withchat .full .chat").length){
            if(!$(".chat_all").length){
                $("header a.chat").hide();
            }
            $("body").removeClass("withchat");
        }


        if(localStorage.getItem('disable_chat') == 'true'){
            $("aside").hide();
        }else{
            $("aside").show();
        }

        if(localStorage.getItem('coin_names') == 'true'){
            $("body").addClass("showcn");
        }else{
            $("body").removeClass("showcn");
        }

        if(localStorage.getItem('show_btc_price') == 'true'){
            $(".bal_coins .est").show();
            show_est_bal();
        }else{
            $(".bal_coins .est").hide();
        }

        if(localStorage.getItem('exchange_gaming') == 'true'){
            $(".gauge-container").removeClass("nogame");
        }else{
            $(".gauge-container").addClass("nogame");
        }

        translate();
        if(localStorage.getItem("music_continue")){
            $(".musicbox .checkbox_setting input[type=checkbox]").prop("checked",localStorage.getItem("music_continue")=="true");
        }
        if(sessionStorage.getItem('music') && localStorage.getItem("music_continue") == "true"){
            play_music(sessionStorage.getItem('music'),sessionStorage.getItem('music_pos'));
            $(".musicbox .play").hide();
            $(".musicbox .stop").show();
        }

        if($(".anim_alert").length){
            if(localStorage.getItem('anim') != 'true'){
                $(".anim_alert").show();
            }else{
                $(".anim_alert").hide();
            }
        }

        var inform_num = Number($("main>.inform").attr("rel"));
        inform_num_closed = Number(localStorage.getItem("inform_closed_num",inform_num));
        if(!inform_num_closed || isNaN(inform_num_closed) || inform_num_closed<inform_num){
            $("main>.inform").show();
        }

        advice_move();
    }
    apply_localtime();
}

function apply_localtime()
{
    $(".localtime").each(function(){
        $(this).text(dt_local($(this).text(),$(this).attr("rel")));
        $(this).removeClass("localtime");
    });

}

function show_est_bal()
{
    if(!storage || localStorage.getItem('show_btc_price') != 'true'){
        $(".bal_coins .est").hide();
    }
    if(storage && localStorage.getItem('show_btc_price') == 'true' && $(".bal_coins .est .glbtc").length){
        var gl_btc_price = Number($(".bal_coins .est .glbtc").html().replace(" ",""));
        if(typeof $(".bal_coins .coin:first").attr("rel") == typeof undefined)return false;
        if(gl_btc_price){
            //console.log("gl btc",gl_btc_price);
            var sum_btc_eq=0;
            $(".bal_coins .one").each(function(){
                var amnt = Number($(this).find(".coin .n").text());
                var pr = Number($(this).find(".coin").attr("rel"));
                //console.log("amnt",amnt,pr);
                if(amnt && pr){
                    sum_btc_eq += (amnt*pr);
                }
                //console.log(sum_btc_eq);
            });
            if(isNaN(sum_btc_eq))return false;
            $(".bal_coins .est b:first").html(sum_btc_eq.toFixed(2));
        }
    }
}

function show_settings(pg)
{
    if(storage){
        $(".win_settings").find("input[name=anim]").prop("checked",localStorage.getItem('anim') == 'true');
        $(".win_settings").find("input[name=sound]").prop("checked",localStorage.getItem('sounds') == 'true');
        $(".win_settings").find("input[name=coin_names]").prop("checked",localStorage.getItem('coin_names') == 'true');
        $(".win_settings").find("input[name=show_btc_price]").prop("checked",localStorage.getItem('show_btc_price') == 'true');
        $(".win_settings").find("input[name=show_est]").prop("checked",localStorage.getItem('show_est') == 'true');
        $(".win_settings").find("select[name=lang]").find("option[value="+localStorage.getItem('lang')+"]").prop("selected",true);
        $(".win_settings").find("input[name=help_improve]").prop("checked",localStorage.getItem('help_improve') == 'true');
        $(".win_settings").find("input[name=mes_notify_header]").prop("checked",localStorage.getItem('mes_notify_header') == 'true');
        $(".win_settings").find("input[name=exchange_gaming]").prop("checked",localStorage.getItem('exchange_gaming') == 'true');
        $(".win_settings").find("input[name=exchange_onepair]").prop("checked",localStorage.getItem('exchange_onepair') == 'true');
        $(".win_settings").find("input[name=order_conf]").prop("checked",localStorage.getItem('order_conf') == 'true');
        $(".win_settings").find("input[name=disable_chat]").prop("checked",localStorage.getItem('disable_chat') == 'true');
        if("Notification" in window){
            $(".win_settings").find("input[name=desktop_notif]").prop("checked",Notification.permission === "granted" && localStorage.getItem('desktop_notif') == 'true');
        }
    }
    if(pg=="fa"){
        $(".win_settings .menu a").eq(2).click();
    }
}

function desktop_notify(request_now,text)
{
    if (!("Notification" in window)) {
        if(request_now)alert("This browser does not support desktop notification");
        return false;
    }
    else if (Notification.permission === "granted") {
        if(text)var notification = new Notification("Cuatrok",{body:translate(text),icon: "https://cuatrok.net/static/img/favicon.ico"});
        if(request_now){
            localStorage.setItem('desktop_notif',true);
        }
    }
    else if (Notification.permission !== "denied" && request_now) {
        Notification.requestPermission().then(function (permission) {
        if (permission === "granted" && localStorage){
            localStorage.setItem('desktop_notif',true);
        }
        if (permission === "granted" && text) {
            var notification = new Notification("Cuatrok",{body:translate(text),icon: "https://cuatrok.net/static/img/favicon.ico"});
        }
    });
  }
}

function preload_all()
{
    preload_sound("click.mp3");preload_sound("hospital.mp3");preload_sound("scream.mp3");
    preload_sound("slot_jackpot.mp3");preload_sound("slot_win.mp3");preload_sound("tick.mp3");
    preload_sound("tick2.mp3");preload_sound("notify.mp3");preload_sound("attack.mp3");
}

function preload_sound(sound)
{
    if(!storage || localStorage.getItem('sounds') == "true"){
        $.ajax({
            url: '/static/sound/'+sound
        });
    }
}

var prev_order_sound;
var prev_notify_sound;

function play_sound(sound,return_obj,loop)
{
    if(!storage || localStorage.getItem('sounds') == "true"){
        var m = new Audio('/static/sound/'+sound);
        if(sound=="cosmos.mp3")slots_sound=m;
        if(sound=="order.mp3"){
            if(prev_order_sound && prev_order_sound > mktime()-3){return false;}
            prev_order_sound=mktime();
        }
        if(sound=="notify.mp3"){
            if(prev_notify_sound && prev_notify_sound > mktime()-3){return false;}
            prev_notify_sound=mktime();
        }
        if(loop)m.loop = true;
        m.play();
        if(return_obj)return m;
    }
}

var music_obj;
function play_music(name,pos)
{
    if(music_current==null)music_current=0;
    else music_current+=1;
    if(music_current>=music_arr.length)music_current=0;
    if(!music_obj || music_obj.paused){
        if(name)music_obj = new Audio('/static/sound/'+name);
        else music_obj = new Audio('/static/sound/'+music_arr[music_current]);
        if(localStorage){
            sessionStorage.setItem('music',music_arr[music_current]);
        }
        if(pos){
            music_obj.currentTime = pos;
        }
        music_obj.play();
        music_obj.onended = function() {
           play_music();
        }
    }else{
        music_obj.pause();
        sessionStorage.removeItem('music');
    }
}


function before_unload()
{
    if(localStorage && music_obj && !music_obj.paused){
        sessionStorage.setItem('music_pos',music_obj.currentTime);
    }
}

function collect_apply_filter()
{
    sel1 = localStorage.getItem("collect_networksel1");
    sel2 = localStorage.getItem("collect_networksel2");
    $(".dblock[rel=1] table.tasks tbody tr").each(function(){
        if($(this).html().indexOf("fa-"+sel1)>=0 || !sel1){
            $(this).show();
        }else{
            $(this).hide();
        }
    });
    $(".dblock[rel=2] table.tasks tbody tr").each(function(){
        if($(this).html().indexOf("type"+sel2)>=0 || !sel2){
            $(this).show();
        }else{
            $(this).hide();
        }
    });
    var alr_compl = String($(".alr_compl").val()).split(",");
    alr_compl.forEach(function(item) {
        $(".tasks tr[rel=1_"+item+"]").hide();
    });
}

function get_notifies(n)
{
    var notifies = $("header").attr("rel");
    if(notifies.indexOf("1")>=0){
        if(notifies.slice(n)=="2")return true;
    }
    return false
}

function ln_invoice_expired()
{
    $(".ln_dep,.expire_in").hide();
    $(".expired").show();
}

function upd_tmt_bar(block)
{
    $(block).addClass("baralr");
    var s = Number(block.attr("rel"));
    s-=1;
    if(s==0 && block.closest(".updating").find(".prbar").attr("rel")){
        var to_call = block.closest(".updating").find(".prbar").attr("rel");
        if(window[to_call])window[to_call]();
    }
    if(s<=0)return;
    block.attr("rel",String(s));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h*3600)/60);
    var sc = s - h*3600 - m*60;
    if(String(m).length<2)m="0"+String(m);
    if(String(sc).length<2)sc="0"+String(sc);
    block.html(h+":"+m+":"+sc);
    if(block.closest(".updating")){
        var bar = block.closest(".updating").find(".prbar .p");
        var prc = 100 - (s / Number(bar.attr("rel"))*100);
        bar.css("width",prc+"%");
    }
    setTimeout(function(){
        upd_tmt_bar(block)
    },1000);
}

function server_time_upd()
{
    block = $(".servertmt");
    var s = Number(block.attr("rel"));
    s+=1;
    block.attr("rel",String(s));
    if(s>=3600*24)s=0;
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h*3600)/60);
    var sc = s - h*3600 - m*60;
    if(String(m).length<2)m="0"+String(m);
    if(String(sc).length<2)sc="0"+String(sc);
    block.html(h+":"+m+":"+sc);
}

function save_prefs_storage(block)
{
    if(storage){
        localStorage.setItem('sounds',block.find("input[name=sound]").prop("checked"));
        localStorage.setItem('anim',block.find("input[name=anim]").prop("checked"));
        localStorage.setItem('lang',block.find("select[name=lang]").val());
        localStorage.setItem('help_improve',block.find("input[name=help_improve]").prop("checked"));
        localStorage.setItem('mes_notify_header',block.find("input[name=mes_notify_header]").prop("checked"));

        localStorage.setItem('coin_names',block.find("input[name=coin_names]").prop("checked"));
        localStorage.setItem('show_btc_price',block.find("input[name=show_btc_price]").prop("checked"));
        localStorage.setItem('show_est',block.find("input[name=show_est]").prop("checked"));
        localStorage.setItem('exchange_gaming',block.find("input[name=exchange_gaming]").prop("checked"));
        localStorage.setItem('exchange_onepair',block.find("input[name=exchange_onepair]").prop("checked"));
        localStorage.setItem('order_conf',block.find("input[name=order_conf]").prop("checked"));
        localStorage.setItem('disable_chat',block.find("input[name=disable_chat]").prop("checked"));

    }
    if("Notification" in window){
        if(block.find("input[name=desktop_notif]").prop("checked")){
            desktop_notify(true);
        }else{
            localStorage.setItem('desktop_notif',false);
        }
    }
    apply_settings();
}

function centre_w(block,width)
{
    if(block && block.find(".cont").length){
        width=Number(block.find(".cont").css("width").replace("px",""))
        var l=($(".modal_overlay").width()-width)/2;
        block.css("width",width).css("left",l);
    }
}

function shop_search()
{
    var t = $(".shops_filter .shoptype").val();
    var s = $(".shops_filter .search").val();
    var url = $(".allshops").attr("rel");
    $(".allshops").load(url+"?t="+t+"&s="+s+"&nofilter=1");
}

function operate_form(form,callback,addparams)
{
    var url = form.attr("action");
    var method = String(form.attr("method")).toLowerCase();
    var data = form.serialize();
    if(addparams)data+="&"+addparams;
    var processData = true;
    var ttype = "application/x-www-form-urlencoded";
    form.find("button[type=submit]").prop("disabled",true).find("div.txt,div.spinner").toggle();
    //check files
    if(form.find("input[type=file]").length){
        data = new FormData(form.get(0));
        processData = false;
        ttype = false;
    }
    $.ajax({
        url: url,
        method: method,
        data: data,
        success: function(data){form.find("button[type=submit]").prop("disabled",false).find("div.txt,div.spinner").toggle();callback(form,data);},
        error: function(data){form.find("button[type=submit]").prop("disabled",false).find("div.txt,div.spinner").toggle();callback(form,{"err":"Server error"});},
        processData: processData,
        contentType: ttype,
    });
}

function truncate(str, n){
  return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};

function trs(block,en)
{
    if(!(block instanceof jQuery) && block){
        if(!en){
            block = $('<div>'+block+'</div>');
            block.find("u").each(function(){
                t=$(this);
                var key1 = t.html();
                if(lang_arr[key1]){
                    t.html(lang_arr[key1]);
                }
            });
            return block.text();
        }
        return false;
    }
    if(!block)block=$("body");
    var els = 0;
    block.find("u,div[rel!=''][rel],span:not(.ubal)[rel!=''][rel]").each(function(){
        t=$(this);
        els+=1;
        if(t.is("u") && t.attr("old")){
            //console.log("tttt",en,t.attr("old"));
            t.html(t.attr("old"));
        }
        if(!en){
            var key1 = t.html();
            var key2 = t.attr("rel");
            if(lang_arr[key1]){
                t.attr("old",t.html());t.html(lang_arr[key1]);
            }
            if(lang_arr[key2]){
                t.attr("old",t.attr("rel"));t.attr("rel",lang_arr[key2]);
            }
            //console.log(key1,lang_arr[key1]);
            if(key1.length>35){
                var key3 = key1.replace(new RegExp("<br>", 'g'), "");
                if(lang_arr[key3]){
                    t.attr("old",t.html());t.html(lang_arr[key3]);
                }
            }
        }
    });
    block.find("select option").each(function(){
        t=$(this);
        var key1 = t.text();
        if($(this).attr("value") != null){
            var key1 = t.text();
            if(lang_arr[key1]){
                t.attr("old",t.text());t.text(lang_arr[key1]);
            }
        }
    });
    //tr page
    var page_title = $(document).prop('title');
    if(lang_arr[page_title]){
        $(document).prop('title',lang_arr[page_title]);
    }
}

function ordtype(t)
{
    if(t==1)return "buy";
    else return "sell";
}

function date_lz(n)
{
    if(String(n).length==1)n="0"+String(n);
    return n;
}

function dt_local(dt,format)
{
    var d = new Date(dt);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    if(format=="hms"){
        return date_lz(d.getHours()) + ":" + date_lz(d.getMinutes()) + ":" + date_lz(d.getSeconds());
    }
    var datestring = d.getDate()  + "." + date_lz(d.getMonth()+1) + "." + d.getFullYear() + " " + date_lz(d.getHours()) + ":" + date_lz(d.getMinutes());
    return datestring;
}

function nToDec(v,n){
    if(!n)n=8;
    return toFixedTrunc(v/100000000, n);
}

function removeExponent(s) {
    //console.log("before remove exp",s)
    s = s.replace(".","");
    var ie = s.indexOf('e')
    if (ie != -1) {
        if (s.charAt(ie + 1) == '-') {
            // negative exponent, prepend with .0s

            var n = s.substr(ie + 2).match(/[0-9]+/);
            var prev = s.substr(0,ie);

            s = ""; // remove the leading '0.' and exponent chars
            //alert(prev,s);
            for (var i = 0; i < n-1; i++) {
                s = '0' + s;
            }
            s = '0.' + s + prev;
        } else {
            // positive exponent, postpend with 0s
            var n = s.substr(ie + 1).match(/[0-9]+/);
            s = s.substr(0, ie); // strip off exponent chars
            for (var i = 0; i < n; i++) {
                s += '0';
            }
        }
    }
    //console.log("after remove exp",s)
    return s;
}

function rscroll()
{
    var b = $(".scroll_base:visible:not(.tokenslist) .scroll_wrap");
    var h2 = $(b).height();
    var t = $(b).parent().scrollTop();
    var ppos=0;
    b.find("a").each(function(){
        var pos = $(this).position().top;
        var base_font = Math.round(Number($("header h1").css("font-size").replace("px",""))*0.6);
        if(pos>-35){
            var font = base_font-ppos;
            ppos+=3;
            if(font<11)font=11;
            $(this).css("font-size",font+"px");
        }
    });
    setInterval(function(){if(scroll_interval)clearInterval(scroll_interval);},500);
}

var gdata = {};
var grects = {};
var disable_scr_top = {};

function highlight(d)
{
    if(d.code){
        if(d.code.startsWith("token")){
            var token = d.code;
            var blockt = $("a[rel="+token+"]");
            if(blockt.length){
                blockt.find("span").html(nToDec(d.m.last));
                var sign="";
                if(d.m.dif<0){
                    blockt.find("i").removeClass("green").addClass("red");
                }else{
                    blockt.find("i").addClass("green").removeClass("red");
                    sign="+";
                }
                blockt.find("i").html(sign+d.m.dif.toFixed(2)+"%");
            }
        }
        var block = $(".trading_block[rel="+d.code+"]");
        if(!block)return;
        block.find(".orders .loading").hide();
        var prev1 = [];
        block.find(".orders .bids table tr").each(function(){
            prev1.push($(this).find("td").eq(0).html()+$(this).find("td").eq(1).html()+$(this).find("td").eq(2).html())
        });
        var prev2 = [];
        block.find(".orders .asks table tr").each(function(){
            prev2.push($(this).find("td").eq(0).html()+$(this).find("td").eq(1).html()+$(this).find("td").eq(2).html())
        });
        block.find(".orders .asks table,.orders .bids table").html("");
        d.sell.forEach(function(item){
            var res = String(nToDec(item[0]))+String(nToDec(item[1]))+String(nToDec(item[2]));
            block.find(".orders .asks table").append("<tr><td>"+nToDec(item[0])+"</td><td>"+nToDec(item[1])+"</td><td>"+nToDec(item[2])+"</td></tr>");
            if(prev2.indexOf(res)==-1){
                block.find(".orders .asks table").find("tr:last").addClass("higl");
                setTimeout(function(block){block.find(".orders .asks table").find("tr.higl").removeClass("higl");}, 300, block);
            }
        });
        d.buy.forEach(function(item){
            var res = String(nToDec(item[0]))+String(nToDec(item[1]))+String(nToDec(item[2]));
            block.find(".orders .bids table").append("<tr><td>"+nToDec(item[0])+"</td><td>"+nToDec(item[1])+"</td><td>"+nToDec(item[2])+"</td></tr>");
            if(prev1.indexOf(res)==-1){
                block.find(".orders .bids table").find("tr:last").addClass("higl");
                setTimeout(function(block){block.find(".orders .bids table").find("tr.higl").removeClass("higl");}, 300, block);
            }
        });
        if(prev2.length==0 || true){
            if(!disable_scr_top[d.code]){
                block.find(".orders .asks").scrollTop(10000);
            }
        }
        var prev_last = block.find(".orders .last td").eq(1).html();
        var now_last = nToDec(d.m.last);
        block.find(".orders .last td").eq(1).html(now_last);
        if(prev_last!=now_last){
            block.find(".orders .last td").eq(1).addClass("higl");
            setTimeout(function(block){
                block.find(".orders .last td").eq(1).removeClass("higl");
            }, 300, block);
        }
        $(".basecoins a[rel="+d.code+"]").find("i").html(nToDec(d.m.last));
        if(prev_last!=now_last){
            $(".basecoins a[rel="+d.code+"]").find("i").addClass("higl");
            setTimeout(function(code){
                $(".basecoins a[rel="+code+"]").find("i").removeClass("higl");
            }, 300, d.code);
        }
        block.find(".coin_t .vol b").html(nToDec(d.m.vol,4));
        if(d.h){
            block.find(".hist_block tbody").html("");
            d.h.forEach(function(item){
                block.find(".hist_block tbody").append("<tr><td class='ltime'>"+dt_local(item.created)+"</td><td>"+ordtype(item.type)+"</td><td>"+nToDec(item.price)+"</td><td>"+nToDec(item.amount)+"</td><td>"+nToDec((item.price*item.amount)/DENOM)+"</td></tr>");
            });
        }
        var sign="";
        if(d.m.dif<0){
            block.find(".coin_dif").removeClass("green").addClass("red");
        }else{
            block.find(".coin_dif").addClass("green").removeClass("red");
            sign="+";
        }
        block.find(".coin_dif").html(sign+d.m.dif.toFixed(2)+"%");
        var vis_blocks = block.find(".more>div:visible").length;
        var width = block.find(".cont").width();
        if(width>1000){
            if(vis_blocks==1)block.find(".more>div").eq(1).show();
            var free_space = block.find(".main").width();
            block.find(".more>div").eq(1).css("width",(free_space-650)+"px");
        }else{
            block.find(".spesbuts a.orderslist").show();
        }
        if(block.find(".spesbuts a:visible.active").length==0)block.find(".spesbuts a:visible").eq(0).addClass("active");
        if(block.find(".spesbuts a:visible.active").length==2)block.find(".spesbuts a:visible").eq(1).removeClass("active");

        var g_key = d.code;
        gdata[g_key] = d.graph;
        show_graph(g_key);

        block.find(".orders .asks").on('scroll',function(){ disable_scr_top[d.code] = true; })

        var index = $(block).find(".spesbuts a.active").index();
        trading_block_sizing(block,index);

    }
}


function show_graph(g_key, direct_data)
{
    //els: min, high, open, close, vol_q, vol, dt
    var block = $(".shares_hist");
    var mult = block.find(".graph h3 a.sel").attr("rel");
    //console.log(mult);
    if(mult == 3 || mult == 6){
        //console.log(gdata[g_key]);
        if(!gdata[g_key])return;
        var temp = gdata[g_key];
        var gdatas = [];
        for(i=temp.length;i>0;i-=mult){
            var els = temp.slice(i-mult,i);
            if(els.length){
                var prices = [];
                var vol_q=0;
                var vol=0;
                els.forEach(function(el){
                    prices.push(el[0]);
                    prices.push(el[1]);
                    vol_q+=el[4];
                    vol+=el[5];
                });
                var price_max = arrayMax(prices);
                var price_min = arrayMin(prices);
                var dt = els[0][6];
                var open = els[0][2];
                var close = els[els.length-1][3];
                //console.log(dt,price_min,price_max);
                gdatas.push([price_min,price_max,open,close,vol_q,vol,dt]);
            }
        }
        gdatas = gdatas.reverse();
    }else{
        if(direct_data){
            var gdatas = direct_data;
        }else{
            var gdatas = gdata[g_key];
        }
    }

    if(mult>6 && !direct_data){return false;}
    //console.log(mult,direct_data);

    var data = {
         "els":gdatas
    }

    var parent = block.find(".graph");
    var canv = block.find(".graph_block canvas")[0];

    if (canv && canv.getContext && data["els"]) {
        var pw = parent.width()-20;
        if(pw>600){pw=600;parent.css("width","630px");}
        else if(pw>540){pw=540;parent.css("width","570px");}
        else if(pw>480){pw=480;parent.css("width","510px");}
        else {parent.css("width",String(pw+20)+"px");}
        $(canv).attr("width",pw).attr("height",parent.height()-50);
        if(pw<400){
            parent.find("h3").find("a").slice(2).hide();
        }else{
            parent.find("h3").find("a").show();
        }
        var ctx = canv.getContext('2d');
        var w = canv.width;
        var h = canv.height;
        var one = 9;
        var vol_h = 50;
        var leg_w = 80;
        var c_h = h - vol_h-10;
        var limit = Math.floor((w-leg_w) / (one+2));
        var els = data["els"];
        if(els.length>limit){
            els = els.slice(-1*limit);
        }
        var prices = [];
        var volumes = [];
        els.forEach(function(el,i){
            prices.push(el[0]);prices.push(el[1]);
            volumes.push(el[4]);
        });

        var price_max = arrayMax(prices);
        var price_min = arrayMin(prices);
        var vol_max = arrayMax(volumes);
        var vol_min = arrayMin(volumes);
        if(price_max==0 || !price_max)price_max=DENOM;
        else if(price_min==price_max){
            price_max = price_min * 2;
            price_min = 0;
        }

        var changes=2;
        ctx.clearRect(0, 0, w, h);
        rects = []
        els.forEach(function(el,i){
            if(changes==2){
                if(el[2]>el[3]){
                    higher = el[2];
                    lower = el[3];
                    var grd=ctx.createLinearGradient(((one+2)*i),0,((one+2)*i)+20,0);
                    grd.addColorStop(0,"#ef4594");
                    grd.addColorStop(1,"white");
                    ctx.fillStyle = grd;
                }else if(el[2]==el[3]){
                    higher = el[3];
                    lower = el[2];
                    ctx.fillStyle = "#e2e2e2";
                }else{
                    higher = el[3];
                    lower = el[2];
                    var grd=ctx.createLinearGradient(((one+2)*i),0,((one+2)*i)+20,0);
                    grd.addColorStop(0,"#82bc0f");
                    grd.addColorStop(1,"white");
                    ctx.fillStyle = grd;
                }
                var top_prc = 1-((higher - price_min) / (price_max-price_min));
                var bot_prc = 1-(lower - price_min) / (price_max-price_min);
                var top = Math.floor(top_prc * c_h);
                var top1 = top;
                var bot = Math.floor(bot_prc * c_h);
                var line_h = Math.abs(top-bot);
                if(line_h<=0){line_h=2;top-=1;}
                ctx.fillRect(((one+2)*i), top, one, line_h);
                var top_prc = 1-((el[1] - price_min) / (price_max-price_min));
                var bot_prc = 1-(el[0] - price_min) / (price_max-price_min);
                var top = Math.floor(top_prc * c_h);
                var bot = Math.floor(bot_prc * c_h);
                var line_h = Math.abs(top-bot);
                ctx.fillRect(((one+2)*i)+4, top, 1, line_h);
                var vol_prc = 1 -(el[4] - vol_min) / (vol_max-vol_min);
                if(vol_prc>=0.999){
                    vol_prc=0.99;
                }
                var top = Math.floor(vol_prc * vol_h);
                var line_h = vol_h-top;
                if(line_h<=0){line_h=2;top-=1;}
                if(!line_h)line_h=2;
                ctx.fillRect(((one+2)*i), c_h+top+10, one, line_h);
                var close_prc = 1-((el[3] - price_min) / (price_max-price_min));
                var close_top = Math.floor(close_prc * c_h);
            }
            rects.push({x: ((one+2)*i), y: close_top, w: one, open:el[2], close:el[3], vol_q:el[4], vol:el[5], dt:el[6]})

        });
        grects[g_key] = rects;
        var canvas_saved = ctx.getImageData(0,0,w,h);
        if(rects.length){
            last = rects[rects.length-1];
            block.find(".graph_block .rrow.cur").css("top",String(last.y-10)+"px").find(".content").html(nToDec(last.close));
        }

        block.find(".graph_block .min").html(nToDec(price_min));
        block.find(".graph_block .max").html(nToDec(price_max));
        $(canv).attr("rel",String(price_min)+"_"+String(price_max));
        $(canv).unbind().bind("mousemove",function(e){
            var ctx = this.getContext('2d');
            var g_key = $(this).closest(".trading_block").attr("rel");
            ctx.putImageData(canvas_saved, 0, 0);
            var y = e.pageY - $(this).offset().top;
            var x = e.pageX - $(this).offset().left;
            var prices = $(this).attr("rel").split("_");
            var m = Number(prices[1]) - Number(prices[0]);
            if(y<=c_h){
                var prc = y / c_h;
                var price = m * (1-prc) + Number(prices[0]);
                var top = c_h * prc;
                $(this).closest(".graph_block").find(".hovered").show().css("top",String(top-10)+"px").find(".content").html(nToDec(price));
                ctx.lineWidth=1;
                ctx.strokeStyle = '#e57f12';
                ctx.beginPath();
                ctx.moveTo(0,top);
                ctx.lineTo(w,top);
                ctx.stroke();

                for(i=0;i<grects[g_key].length;i++){
                    var rect = grects[g_key][i];
                    if(x>=rect.x && x<=rect.x+one){
                        var h = $(this).closest(".graph_block").find(".hovered_info");
                        //console.log(rect.dt);
                        h.show().css({"top":String(rect.y-45)+"px","left":String(rect.x+12)+"px"}).find(".dt").html(dt_local(rect.dt));
                        h.find(".vol").html(nToDec(rect.vol,2));
                        h.find(".vol_q").html(nToDec(rect.vol_q,2));
                        h.find(".open").html(nToDec(rect.open));
                        h.find(".clos").html(nToDec(rect.close));
                    }
                }


            }else{
                $(this).closest(".graph_block").find(".hovered").hide();
            }
        }).bind("mouseout",function(e){
            var ctx = this.getContext('2d');
            ctx.putImageData(canvas_saved, 0, 0);
            $(this).closest(".graph_block").find(".hovered,.hovered_info").hide();

        });
    }
}


function isLocalStorage() {
    try {
        var valueToStore = 'test';
        var mykey = 'key';
        localStorage.setItem(mykey, valueToStore);
        var recoveredValue = localStorage.getItem(mykey);
        localStorage.removeItem(mykey);
        return recoveredValue === valueToStore;
    } catch(e) {
        return false;
    }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function trading_block_sizing(block,index)
{
    if(block.hasClass("only")){
        block.find(".more>div").show();
        show_graph(block.attr("rel"));
        block.find(".main .more > div").css("width","99%");
        block.find("form.buy,form.sell").show();
    }else{
        var width = block.find(".cont").width();
        var free_space = block.find(".main").width();
        $(".trading_block").each(function(){
            if(!$(this).hasClass("only")){
                if($(this).find("form.buy:visible").length && $(this).find("form.sell:visible").length){
                    $(this).find("form.buy").show();
                    $(this).find("form.sell").hide();
                }
            }
        });

        if(width>1000){
            if(index==0){index=1;block.find(".spesbuts a").eq(index).addClass("active");}
            block.find(".more>div.orders").show();
            block.find(".more>div:not(.orders)").hide().eq(index-1).show();
            block.find(".more>div:visible").eq(0).css("width","280px");
            block.find(".more>div:visible").eq(1).css("width",(free_space-650)+"px");
            block.find(".spesbuts a.orderslist").hide();
        }else{
            if(index==-1)index=0;
            block.find(".more>div").hide().eq(index).show();
            block.find(".spesbuts a.orderslist").show();
            block.find(".more>div:visible").eq(0).css("width",(free_space-250)+"px");
        }
        if(index==1){
            show_graph(block.attr("rel"));
        }
    }
}

function advice_move()
{
    if($("header .advices").length){
        var ll = $("header ul.sections").position().left + $("header ul.sections").width();
        var rr = $("header .hright").position().left;
        if(rr-ll>250){
            var pp = ll+((rr-ll)/2)-120;
            $("header .advices").css("left",pp+"px").show();
        }else{
            $("header .advices").hide();
        }
    }
}

function need_resize()
{
    if($(".trading_block").length){
        $(".trading_block").each(function(){
            var block = $(this);
            var index = $(this).find(".spesbuts a.active").index();
            trading_block_sizing(block,index);
        });
        if(ws_comp){
            $(".trading_block").each(function(){
                var coin_code = $(this).attr("rel");
                ws_comp.send(JSON.stringify({action: "subs",code: coin_code}));
            });
        }
    }
    if($(".allshops").length){
        var all_w = $(".goods_list").width();
        $(".goods_list .scrolli").css("width",all_w-130);
    }
    advice_move();
}

var sleep_mode_html = '<div class="sleepmode"><u>Updating disabled due to inactivity</u><div><br><a href="" class="reload btn btn-danger">Reload</a>';

function need_sleep()
{

    var last = last_ac.getTime();
    var cur = new Date();
    cur = cur.getTime();
    //console.log(cur-last);
    if(cur-last>3600000*3){
        sleep_mode = true;
        if(ws_state)ws_state.close();
        if(ws_col)ws_col.close();
        if(ws_comp)ws_comp.close();
        if(ws_chat)ws_chat.close();
        $(".modal_overlay").show().find(".win_modal").html(sleep_mode_html);
    }else{
        setTimeout(need_sleep,5000);
    }
}

$(window).on('resize', function(){
      need_resize();
});

need_resize();