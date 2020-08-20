var rul_num = {
    "34":360,
    "6":350,
    "27":340,
    "13":330,
    "36":320,
    "11":310,
    "30":300,
    "8":290,
    "23":280,
    "10":270,
    "5":260,
    "24":250,
    "16":240,
    "33":230,
    "1":220,
    "20":210,
    "14":200,
    "31":190,
    "9":180,
    "22":170,
    "18":160,
    "29":150,
    "7":140,
    "28":130,
    "12":120,
    "35":110,
    "3":100,
    "26":90,
    "0":80,
    "32":70,
    "15":60,
    "19":50,
    "4":40,
    "21":30,
    "2":20,
    "25":10,
    "17":0
}

var prev_r_bets = null;
var wheel_stop = false;

var wheelpos = 0;
var wstep = 0;

function start_rulette()
{
    //submit bets
    var bet_now = Number($(".desk .cur").html());
    if(bet_now>0){
        prev_r_bets = JSON.parse($(".betsf").val());
        var form = $(".rbetform");
        operate_form(form,function(form,ret){
            if(ret.err){
                $("#betresult").addClass("red").removeClass("green").html(ret.err);
                $(".desk .wrapp .bet").remove();
                $(".desk .wrapp").attr("rel","0");
                updbets();
            }
            if(ret.success){
                $("#betresult").removeClass("red").addClass("green").html(ret.success)
            }
        });
    }

    $("#rulette_ball").css({"transform": "rotate(0deg)","rotation":0});
    $("#rulette_ball").stop().animate(
    {rotation: 360},
    {duration: 12500,easing:"linear",
    step: function(now, fx) {
       $(this).css({"transform": "rotate("+now+"deg)"});
       var m = Math.floor(now);
       var ml="2";
       if(now>250)ml="1";
       if(m % 2)$(this).css({"margin-left":ml+"px"});
       else $(this).css({"margin-left":"0px"});
    },
    });

    wheelpos = 0;
    wstep = 0;
    wheel_stop=false;
    $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
    setTimeout(function(){
        //console.log("anim1");
        $("#rulette_wheel").animate(
        {rotation: 360},
        {duration: 5500,
         step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
         easing:"linear",
         complete:function(){
                $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                //console.log("anim2");
                if(!wheel_stop)setTimeout(function(){
                    $("#rulette_wheel").animate({rotation: 360},{duration: 6300,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                        complete:function(){
                            $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                            //console.log("anim3");
                            if(!wheel_stop)setTimeout(function(){
                                $("#rulette_wheel").animate({rotation: 360},{duration: 6400,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                                    complete:function(){
                                        $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                                        //console.log("anim4");
                                        if(!wheel_stop)setTimeout(function(){
                                            $("#rulette_wheel").animate({rotation: 360},{duration: 6600,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                                                complete:function(){
                                                    $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                                                    //console.log("anim5");
                                                    if(!wheel_stop)setTimeout(function(){
                                                        $("#rulette_wheel").animate({rotation: 360},{duration: 6800,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                                                            complete:function(){
                                                                $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                                                                //console.log("anim6");
                                                                if(!wheel_stop)setTimeout(function(){
                                                                    $("#rulette_wheel").animate({rotation: 360},{duration: 7000,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                                                                        complete:function(){
                                                                            $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                                                                            //console.log("anim6");
                                                                            if(!wheel_stop)setTimeout(function(){
                                                                                $("#rulette_wheel").animate({rotation: 360},{duration: 7000,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                                                                                    complete:function(){
                                                                                        $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                                                                                        //console.log("anim6");
                                                                                        if(!wheel_stop)setTimeout(function(){
                                                                                            $("#rulette_wheel").animate({rotation: 360},{duration: 7200,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},
                                                                                                complete:function(){
                                                                                                    $("#rulette_wheel").css({"transform": "rotate(0deg)","rotation":0});
                                                                                                    //console.log("anim6");
                                                                                                    if(!wheel_stop)setTimeout(function(){
                                                                                                        $("#rulette_wheel").animate({rotation: 360},{duration: 7300,easing:"linear",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"});wheelpos=Math.floor(now);},

                                                                                                        });
                                                                                                    },1);
                                                                                                }
                                                                                            });
                                                                                        },1);
                                                                                    }
                                                                                });
                                                                            },1);
                                                                        }
                                                                    });
                                                                },1);
                                                            }
                                                        });
                                                    },1);
                                                }
                                            });
                                        },1);
                                    }
                                });
                            },1);
                        }
                    });
                },1);
        }});
    },100);




}



function roulette_result(d)
{
    //console.log("cur transform",wheelpos);
    wheel_stop=true;
    var cur_wheelpos = wheelpos;
    var num = $("#moveton").val();
    var pos = rul_num[d.n];
    var lack = 360 - pos;
    pos = pos + (lack * 0.03);
    var dif = (wheelpos+pos) - wheelpos;
    var resultpos = wstep+pos;
    var far = false;
    if(resultpos<=wheelpos){resultpos+=360;far = true;}
    else if(resultpos-wheelpos<150)durat-=1000;
    var dif2 = resultpos - wheelpos;
    var durat = dif2 * 55;
    if(durat<7800)durat=7800;
    if(durat>11000)durat=11000;
    $("#rulette_wheel").stop(true,true);
    $("#rulette_wheel").css({"transform": "rotate("+cur_wheelpos+"deg)"});
    if(far){
        $("#rulette_wheel").animate({rotation: 360+resultpos},{duration: durat*1.5, easing:"easeOutQuad",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"}); }, complete:function(){
            $("#rulette_ball").stop(true,true);
            roulette_end(d,resultpos);
        }});
    }else{
        $("#rulette_wheel").animate({rotation: resultpos},{duration: durat,easing:"easeOutQuad",step: function(now, fx) {$(this).css({"transform": "rotate("+now+"deg)"}); }, complete:function(){
            $("#rulette_ball").stop(true,true);
            roulette_end(d,resultpos);
        }});
    }
}

function roulette_new_round(d)
{
    if($(".until_close").hasClass("hide")){
        $("#rulette_wheel").stop(true,true);
        $(".until_close").removeClass("hide");
        $(".result2 .closed").addClass("hide");
        $(".result2 .round_end").addClass("hide");
        if(d.remain20)$(".until_close span").text("20");
        else $(".until_close span").text("30");
        $(".rulette_partial .desk .pan .buttons button").prop("disabled",false);
        $(".result2 .prevnumber").removeClass("anim");
        $(".desk .clearallbets").trigger("click");
        $("#betresult").html("");
        play_sound("tick.mp3");
    }
}

function roulette_end(d,resultpos)
{
    $("#rulette_wheel").stop(true,true);
    $(".until_close").addClass("hide");
    $(".result2 .closed").addClass("hide");
    $(".result2 .round_end").removeClass("hide");
    $(".prev_ledger i").eq(0).html(d.block);
    $(".prev_ledger i").eq(1).html(d.hash);
    $(".result2 .prevnumber").html(d.n);
    if(d.n!=d.n1){
        $(".result2 .prevnumbersh").html("("+String(d.n1)+"-37)");
    }else{
        $(".result2 .prevnumbersh").html("");
    }
    $(".result2 .prevnumber").removeClass("bl rd gr anim");
    $(".result2 .prevnumber").addClass(d.color).addClass("anim");
    $(".desk .previous span:last").remove();
    $(".desk .previous span:last").addClass("last");
    $(".desk .previous").prepend('<span class='+d.color+'>'+d.n+'</span>');
    //console.log("rul winners",d.winners);
    var nowinner = true
    if(d.winners){
        console.log(d);
        d.winners.forEach(function(el){
            if(el==user_pk){
                $(".your_prev").load($(".your_prev").attr("rel"));
                nowinner = false;
            }
        });
    }
    if(nowinner){
        $(".prev_win").html("0");
        $(".prev_bet").html($(".desk .cur").html());
    }

}

function updbets()
{
    var b = {};
    var one = Number($(".onebet").attr("rel"));
    var cnt = 0;
    $(".desk table td").each(function(){
        var cell = $(this).attr("rel");
        var bet = $(this).find(".wrapp").attr("rel");
        if(bet && Number(bet) > 0){
            b[cell] = bet;
            cnt += Number(bet);
        }
    });
    if(Object.keys(b).length<1){
        $(".betsf").val("");
        $(".desk .cur").html(0);
    }else{
        $(".betsf").val(JSON.stringify(b));
        $(".desk .cur").html((cnt*one).toFixed(2));
    }
}



$(document).ready(function(){

    preload_sound("roulette_start.mp3");


    $("#moveto").click(function(){
        var num = $(this).prev().val();
        start();
    });
    $(".desk table td").each(function(){
        var h = $(this).html();
        if(h){
            if(!$(this).attr("rel"))$(this).attr("rel",h);
            $(this).html('<div class="wrapp">'+h+"</div>");
        }
    });
    $("html").on("click",".desk .wrapp",function(){
        var bet_now = Number($(".desk .cur").html());
        if(bet_now>=1 || $(".round_end:visible").length || $(".closed:visible").length || !user_pk)return false;
        var alr = $(this).attr("rel");
        if(alr)alr=Number(alr);
        else alr=0;
        alr += 1;
        if(alr>20){alr=20;}
        $(this).append('<div class="bet">'+alr+'</div>').attr("rel",alr);
        updbets();
    });

    $("html").on("contextmenu",".desk .wrapp",function(){
        var alr = $(this).attr("rel");
        if($(".round_end:visible").length || $(".closed:visible").length || !user_pk)return false;
        if(alr)alr=Number(alr);
        else alr=0;
        alr -= 1;
        if(alr<1){
            $(this).find('.bet').remove();
            alr=0;
        }else{
            $(this).find('.bet').html(alr);
        }
        $(this).attr("rel",alr);
        updbets();
        return false;
    });


    $(".desk .clearallbets").click(function(){
        if($(".round_end:visible").length || $(".closed:visible").length || !user_pk)return false;
        $(".desk .wrapp .bet").remove();
        $(".desk .wrapp").attr("rel","0");
        updbets();
    });


    $(".desk .repeat").click(function(){
        if($(".round_end:visible").length || $(".closed:visible").length || !user_pk)return false;
        if(prev_r_bets){
            Object.keys(prev_r_bets).forEach(function(key, index) {
                $(".desk td[rel="+key+"]").find(".wrapp").attr("rel",prev_r_bets[key]).append('<div class="bet">'+prev_r_bets[key]+'</div>');
            });
            $(".betsf").val(JSON.stringify(prev_r_bets));
            updbets();
        }
    });


    $(".desk .double").click(function(){
        if($(".round_end:visible").length || $(".closed:visible").length || !user_pk)return false;
        if(prev_r_bets){
            Object.keys(prev_r_bets).forEach(function(key, index) {
                var prev_bet = Number(prev_r_bets[key]) * 2;
                if(prev_bet>=20)prev_bet=20;
                $(".desk td[rel="+key+"]").find(".wrapp").attr("rel",prev_bet).append('<div class="bet">'+prev_bet+'</div>');
            });
            $(".betsf").val(JSON.stringify(prev_r_bets));
            updbets();
        }
    });





    var prevnumber = $(".prevnumber").text();
    pos = rul_num[prevnumber];
    var lack = 360 - pos;
    var pos = pos + (lack * 0.03);
    $("#rulette_wheel").css({"transform": "rotate("+pos+"deg)"}).animate({"opacity":1},500);
    $("#rulette_ball").animate({"opacity":1},500);

    var rul_worker = new Worker('/static/js/work.js');
    rul_worker.onmessage = function(){
        console.log("worker_message2");
        if(!$(".until_close").hasClass("hide")){
            var until_close = Number($(".until_close span").text());
            if(!isNaN(until_close) && until_close > 0){
                until_close -= 1;
                $(".until_close span").text(until_close);
            }
            if(until_close==0){
                $(".until_close").addClass("hide");
                $(".result2 .closed").removeClass("hide");
                $(".rulette_partial .desk .pan .buttons button").prop("disabled",true);
                play_sound("roulette_start.mp3");
                start_rulette();
            }
        }
    };

});


