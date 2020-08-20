function logo_explode()
{
    preload_sound("logo_explode.mp3");

    setTimeout(function(){
        play_sound("logo_explode.mp3");
        $(".cut_scene .logo").addClass("anim");
    },1200);
    setTimeout(function(){
        $(".cut_scene .logo").fadeOut(300);
        $(".cut_scene .video").fadeIn(300);
        $(".cut_scene .video video").trigger('play');
    },3200);
    setTimeout(function(){
        $(".cut_scene .line1").fadeIn(300);
    },4000);
    setTimeout(function(){
        $(".cut_scene .line2").fadeIn(300);
    },7300);
    setTimeout(function(){
        $(".cut_scene .line3").fadeIn(300);
    },13300);
    setTimeout(function(){
        $(".cut_scene .line4").fadeIn(300);
    },16300);
    setTimeout(function(){
        $(".cut_scene .understand").fadeIn(300);
    },24300);
    setTimeout(function(){
        $(".cut_scene").fadeOut(300);
    },38000);
    $(".cut_scene .understand").click(function(){
        $(".cut_scene").fadeOut(300);
        $.get("/ajax/cut_scene/");
        return false;
    });
}

function connect(){
    if($(".k_user").length){
    preload_sound("notify.mp3");
    ws_state = new WebSocket(socket_type+window.location.hostname+":8002/");
    ws_state.onerror = function(event){
        setTimeout(function(){
            $(".state_win").show().find("div").addClass("red").html("<u>Can't connect to State Socket. Check your firewall or try another browser</u>");
            translate($(".state_win"));
        },4000);
        //reconnect in 7 + rand(0-5) seconds
        if(!sleep_mode && reconnects < 5)setTimeout(function(){reconnects+=1;connect();},7000 + getRandom(10, 3000));
        if(reconnects==5 && was_connected)$(".modal_overlay").show().find(".win_modal").html(sleep_mode_html);
    }
    ws_state.onclose = function(event){
        setTimeout(function(){
            $(".state_win").show().find("div").addClass("red").html("<u>Can't connect to State Socket. Check your firewall or try another browser</u>");
            translate($(".state_win"));
        },4000);
        //reconnect in 7 + rand(0-5) seconds
        if(!sleep_mode && reconnects < 5)setTimeout(function(){reconnects+=1;connect();},7000 + getRandom(10, 3000));
        if(reconnects==5 && was_connected)$(".modal_overlay").show().find(".win_modal").html(sleep_mode_html);
    }
    ws_state.onmessage = function (event) {
        was_connected=true;
        console.log(event.data);
        data = JSON.parse(event.data);
        var d=data.data;
        if(d.state && !state_show_tmt){
            if(d.state=="ok"){
                $(".state_win").hide().find("div").removeClass("red");
                if(d.platf_ver){
                    if(String(d.platf_ver) != $("body").attr("rel")){
                        $(".state_win").show().find("div").addClass("red").html("<u>Platform update available, please refresh the page</u>");
                        translate($(".state_win"));
                    }
                }
            }else{
                $(".state_win").show().find("div").addClass("red").html("<u>"+d.state_msg+"</u>");
                translate($(".state_win"));
            }
        }
        if(d.gl_btc){
            $(".bal_coins .est .glbtc").html(d.gl_btc);
            show_est_bal();
        }
        if($(".bal_coins").length){
            var coinsrefr = ["btc","sin","doge","xlm"];
            coinsrefr.forEach(function(el){
                if(d["gl_"+el]){
                    var pr = String(d["gl_"+el]).replace(" ","");
                    $(".bal_coins").find(".c."+el).closest(".coin").attr("rel",pr);
                }
            });
            if(d.gl_btc){show_est_bal();}
        }
        if(d.notify_text){
            if(!state_show_tmt){
                $(".state_win").show().find("div").removeClass("red").html(d.notify_text);
                play_sound("order.mp3");
                state_show_tmt = setTimeout(function(){
                           $(".state_win").fadeOut(1000);
                           clearTimeout(state_show_tmt);
                           state_show_tmt = null;
                },4000);
            }
        }
        if(d.upd_bals){
            if(bal_load_tmt)clearTimeout(bal_load_tmt);
            bal_load_tmt=setTimeout(function(){
                upd_bals();
            },500);
        }
        if(d.upd_coin_orders){
            if($(".trading_block[rel="+d.upd_coin_orders+"] userhist.active").length){
                block = $(".trading_block[rel="+d.upd_coin_orders+"]");
                var coin_code = d.upd_coin_orders;
                block.find(".more .uhist_block").html(loader_small).load("/convert/uhist/?coin_code="+coin_code);
            }
        }
        if(d.refr_lottery){
            if($(".lottery_bank").length){
                $("main .wrap").html(loader_big).load("/ajax_lottery/");
            }
        }
        if(d.upd_notifies_num){
            var before = Number($(".notif_cnt:first").html());
            if(!before || isNaN(before))before=0;
            before+=1;
            $(".notif_cnt").html(before);
            if(localStorage && localStorage.getItem("new_notif_show_tmt")!="true"){
                localStorage.setItem("new_notif_show_tmt","true");
                play_sound("notify.mp3");
                if(d.new_notif_text){
                    desktop_notify(false,d.new_notif_text);
                }
                setTimeout(function(){
                    localStorage.setItem("new_notif_show_tmt","false");
                },1000);
            }
        }
        if(d.new_msg){
            console.log("new_msg", d);
            if($(".msgs_page").length && $(".msgs[rel="+d.from+"]").length){
                $(".msgs_page .users .list a.active").trigger("click");
            }else{
                var before = Number($(".msg_cnt:first").html());
                if(!before || isNaN(before))before=0;
                before+=1;
                $(".msg_cnt").html(before);
                if($(".msgs_page .users .list a[data-id="+d.from+"]").length){
                    $(".msgs_page .users .list a[data-id="+d.from+"]").addClass("notread");
                }
                if(get_notifies(8)){
                    $(".state_win").show().find("div").removeClass("red").html("<u>New message!</u>");
                    play_sound("order.mp3");
                    state_show_tmt = setTimeout(function(){
                           $(".state_win").fadeOut(1000);
                           clearTimeout(state_show_tmt);
                           state_show_tmt = null;
                    },4000);
                }
            }
        }
        //console.log(d);
        if(d.upd_deps){
            $(".latest_deps[rel="+d.code+"]").html(d.html);
            translate($(".latest_deps[rel="+d.code+"]"));
            apply_localtime();
        }
        if(d.upd_wds){
            $(".withdr_pend[rel="+d.code+"]").html(d.html);
            translate($(".withdr_pend[rel="+d.code+"]"));
            apply_localtime();
        }
        if(d.new_xlm_block_line){
            if($(".latest_ledgers").length){
                $(".latest_ledgers table tr").eq(1).remove();
                $(".latest_ledgers table tbody").append(d.new_xlm_block_line);
                $(".latest_ledgers table tr:last").addClass("yellow_high");
                setTimeout(function(){
                    $(".latest_ledgers table tr.yellow_high").css("background-color","transparent");
                },400);
                latest_ledgers_highlight();
                //if bet is waiting use ajax request
                if($(".difficulty.lock.done").length){
                    $.get("/ajax_get_bet_result/",function(ret){
                        if(ret.result){
                            $(".betpage_form .betbutblock button u").toggleClass("hide");
                            $(".difficulty.lock").removeClass("lock").removeClass("done");
                            $(".betpage_form .result").html(ret.result);
                            if(ret.result.indexOf("lost")>0){
                                play_sound("tick2.mp3");
                            }else{
                                play_sound("tick.mp3");
                            }
                            if($(".betpage_prev table tr").length>1){
                                $(".betpage_prev table tr:last").remove();
                            }
                            $(".betpage_prev table tr").eq(0).after(ret.history_line);
                        }
                    });
                }
            }
        }
        if(d.plinko_result){
            if($(".pl_img.new").length){
                var pl = $(".pl_img.new");
                pl.removeClass("new");
                plinko_next(pl,[d.line,0]);
                $(".plinko_base .state .waiting").hide();
                $(".plinko_base .state .result").show();
                $(".plinko_base .state .result b").eq(0).html(d.block);
                $(".plinko_base .state .result b").eq(1).html(d.result);
                $(".plinko_form button").removeAttr("disabled");
                //latest_ledgers_highlight();
            }
        }
        if(d.refr_attack){
            if($(".attack_block .attack_state .waiting:visible").length){
                setTimeout(function(){
                    $.get($(".attack_block .attack_state").attr("rel"),function(ret){
                        $(".attack_block .attack_state .waiting").hide();
                        $(".attack_block .attack_state .result").show();
                        $(".attack_block .attack_state .result b").eq(0).html(ret.block);
                        $(".attack_block .attack_state .result b").eq(1).html(ret.result);
                        $(".attack_block .attack_state .result .rendered").html(ret.html);
                        $(".arrow_block span").stop().animate({left:String(ret.result)+"%"},400);
                        console.log(attack_sound);
                        if(attack_sound)attack_sound.pause();
                        if(Number(ret.result)<60)play_sound("slot_jackpot.mp3");
                        else play_sound("tick2.mp3");
                        $("header,aside,main .wrap,footer,body").removeClass("black");
                    });
                },3500);
            }
        }
        if(d.upd_food_water){
            anim_number($(".k_user .food span"),Number($(".k_user .food span").text()),d.food);
            $(".k_user .food").toggleClass("red_alert",Number(d.food) < 10);
            anim_number($(".k_user .water span"),Number($(".k_user .water span").text()),d.water);
            $(".k_user .water").toggleClass("red_alert",Number(d.water) < 10);
        }
        if(d.upd_level){
            $(".level_up").fadeIn(700);
            $(".level_up div").html(d.upd_level);
            play_sound("slot_jackpot.mp3");
            setTimeout(function(){
                $(".level_up").fadeOut(700);
            },5000);
        }
        if(d.inform_hunt_win){
            $(".inform_hunt_win").fadeIn(300);
            $(".inform_hunt_win .prize_amnt").html(nToDec(d.prize,2));
            var hero=d.hero
            setTimeout(function(){
                play_sound("rollhunt/win" + hero + ".mp3");
            },1200);
            setTimeout(function(){
                $(".inform_hunt_win").fadeOut(700);
            },5000);
        }
        if(d.make_upd_trainings){
            if($(".training_block").length){
                $.get("/ajax_training_upd/",function(ret){
                    $(".training_block .data").html(ret);
                });
            }
        }
        if(d.inform_rain){
            play_sound("rain.mp3");
        }
        if(d.new_cor_slot_block){
            var corslot_sound = !$(".slot_cor .play_data .sound").hasClass("disabled");
            if($(".slot_cor .latest .one").length>=4){
                $(".slot_cor .latest .one:first").remove();
            }
            $(".slot_cor .latest").append('<a class="one"><div>#'+d.new_cor_slot_block+'</div><span>'+d.hash+'...</span></a>');
            if($(".spinbut button").hasClass("lock")){
                setTimeout(function(){
                    $(".slot_cor .play_data .won .ledger").html('<a target="_blank" href="https://stellarchain.io/ledger/'+d.new_cor_slot_block+'">#'+d.new_cor_slot_block+'</a>');
                    if(cor_slot_sound)cor_slot_sound.pause();
                    var datas = d.result_normalized;
                    var j=0;
                    $(".slot_cor .reels>div").each(function(){
                        for(i=0;i<3;i++){
                            var rnd = datas[i*4+j]
                            $(this).append('<span><img rel='+rnd+' src="/static/img/slot1/'+rnd+'.png"/></span>');
                        }
                        j+=1;
                    });
                    $(".slot_cor .reels div").stop();
                    $(".slot_cor .reels div").scrollTop(14000);
                    $(".slot_cor .reels div").animate({"scrollTop":30000},600);
                    $(".spinbut button").removeClass("lock");
                    if($(".slot_cor .auto button.on").length){
                        $(".spinbut button").addClass("prelock");
                        if(d.winners_list.indexOf(Number(user_pk))>=0 || d.jackpot_list.indexOf(Number(user_pk))>=0){
                            setTimeout(function(){$(".spinbut button").removeClass("prelock");},3300);
                        }else{
                            setTimeout(function(){$(".spinbut button").removeClass("prelock");},1300);
                        }
                    }

                    if(d.winners_list.indexOf(Number(user_pk))>=0){
                        if(d.big_win){
                            if(corslot_sound)play_sound("scream.mp3");
                            $(".big_msg u").show().html("Big win!");
                            setTimeout(function(){
                                $(".big_msg u").fadeOut(1900);
                            },1100);
                        }else{
                            if(corslot_sound)play_sound("slot_win.mp3");
                        }
                        //console.log("winners_lines", d.winners_lines);
                        var latest = $(".slot_cor .reels>div:first span").length - 3;
                        d.winners_lines.forEach(function(line, index, array){
                            line.forEach(function(currentValue, index, array){
                                $(".slot_cor .reels>div").eq(currentValue[1]).find("span").eq(latest+currentValue[0]).find("img").addClass("highlight");
                            });
                        });
                    }
                    if(d.jackpot_list.indexOf(Number(user_pk))>=0){
                        if(d.big_win){
                            if(corslot_sound)play_sound("scream.mp3");
                            $(".big_msg u").show().html("Big win!");
                            setTimeout(function(){
                                $(".big_msg u").fadeOut(1900);
                            },1100);
                        }else{
                            if(corslot_sound)play_sound("slot_jackpot.mp3");
                        }
                        //highlight jackpot symbol
                        $(".slot_cor .reels>div img[rel=f]").addClass("highlight");
                    }
                    if(d.winners_list.indexOf(Number(user_pk))>=0 || d.jackpot_list.indexOf(Number(user_pk))>=0){
                        $.get("/ajax_cor_slot_result/",function(ret){
                            $(".play_data .won b").html(nToDec(ret.prize,2));
                        });
                    }
                },800);
            }
        }
    }
    }

}

var ws_dice;
var rolls=0;
var dice_nonce;
var curr_bet;
var base_bet;
var dice_profit=0;
var dice_wagered=0;
var dice_highest=0
var dice_wins=0;
var dice_losses=0;
var cur_streak=0;
var cur_streak_color="";
var max_red_streak=0;
var max_green_streak=0;
var dice_result_tmt;

function show_dice_stats()
{
    $(".dicecurstats .profit").text(dice_profit.toFixed(8));
    if(dice_profit>0)$(".dicecurstats .profit").addClass("green").removeClass("red");
    if(dice_profit<0)$(".dicecurstats .profit").addClass("red").removeClass("green");
    $(".dicecurstats .wagered").text(dice_wagered.toFixed(8));
    $(".dicecurstats .lostwon").text(dice_losses.toFixed(0)+"/"+dice_wins.toFixed(0));
    $(".dicecurstats .cur_streak").text(String(cur_streak)).removeClass("green").removeClass("red").addClass(cur_streak_color);
    $(".dicecurstats .lostwon").text(dice_losses.toFixed(0)+"/"+dice_wins.toFixed(0));
    $(".dicecurstats .max_streaks .green").text(String(max_green_streak));
    $(".dicecurstats .max_streaks .red").text(String(max_red_streak));
    $(".dicecurstats .highest_bet").text(dice_highest.toFixed(8));
}

function connect_dice()
{
    console.log("con dice");
    ws_dice = new WebSocket(socket_type+window.location.hostname+":8007/");
    ws_dice.onerror = function(event){
        console.log("dice err",event.code);
    }
    ws_dice.onclose = function(event){
        console.log("dice err",event.code);
    }
    ws_dice.onopen = function(event){
        //ws_dice.send(JSON.stringify({"action": "bet", "number":"1", "amount":"0.0004"}));
        console.log("con dice connected");
    }
    ws_dice.onmessage = function (event) {
        //console.log(event.data);
        var data = JSON.parse(event.data);
        console.log(data);
        if(data.betinfo){
            if(data.highrollers){
                var new_row = '<tr><td>#'+data.bet_id+'</td><td>'+dt_local(data.bet_created,"hms")+'</td><td>'+truncate(data.user, 10)+'</td><td>'+data.number+'</td><td class="'+cur_streak_color+'">'+data.rnd.toFixed(2)+'</td><td>'+data.amount.toFixed(8)+'</td><td class="'+cur_streak_color+'">'+data.prize.toFixed(8)+'</td></tr>';
                $(new_row).insertAfter(".highrollers tr:first");
                $(".highrollers tr").slice(11).remove();
            }
            var new_row = '<tr><td>#'+data.bet_id+'</td><td>'+dt_local(data.bet_created,"hms")+'</td><td>'+truncate(data.user, 10)+'</td><td>'+data.number+'</td><td class="'+cur_streak_color+'">'+data.rnd.toFixed(2)+'</td><td>'+data.amount.toFixed(8)+'</td><td class="'+cur_streak_color+'">'+data.prize.toFixed(8)+'</td></tr>';
            $(new_row).insertAfter(".allbets tr:first");
            $(".allbets tr").slice(11).remove();
        }
        if((data.rnd || data.error) && !data.betinfo){
            if(data.rnd){
                rolls+=1;
                console.log(rolls);
                var bg="";
                if(!data.win){
                    bg="bgred";
                    dice_losses+=1;
                    if(cur_streak==0 || cur_streak_color=="red"){
                        cur_streak+=1;
                        if(cur_streak>max_red_streak)max_red_streak=cur_streak;
                    }else{
                        cur_streak=1;
                        if(cur_streak>max_red_streak)max_red_streak=cur_streak;
                    }
                    cur_streak_color="red";
                    if(!autorolls && $(".dicecontrol .sound").hasClass("fa-volume-up")){
                        play_sound("tick2.mp3");
                    }
                }
                else{
                    dice_wins+=1;
                    if(cur_streak==0 || cur_streak_color=="green"){
                        cur_streak+=1;
                        if(cur_streak>max_green_streak)max_green_streak=cur_streak;
                    }else{
                        cur_streak=1;
                        if(cur_streak>max_green_streak)max_green_streak=cur_streak;
                    }
                    cur_streak_color="green";
                    if(!autorolls && $(".dicecontrol .sound").hasClass("fa-volume-up")){
                        play_sound("tick.mp3");
                    }
                }
                dice_profit+=data.prize;
                dice_wagered+=data.amount;
                if(data.amount>dice_highest){
                    dice_highest=data.amount;
                }

                if($(".dicelast .lastnumbers span").length>4)$(".dicelast .lastnumbers span:first").remove();
                $(".dicelast .lastnumbers").append('<span class="'+bg+'">'+data.rnd.toFixed(2)+'</span>');
                var parts = data.rnd.toFixed(2).split(".");
                $(".dicebar.main .result").stop(true, true).show().css("left",(data.rnd-2).toFixed(2)+"%").removeClass("red green").addClass(cur_streak_color);
                if(dice_result_tmt)clearTimeout(dice_result_tmt);
                dice_result_tmt=setTimeout(function(){
                    $(".dicebar.main .result").fadeOut(550);
                },900);
                $(".dicebar.main .result span").text(parts[0]);
                $(".dicebar.main .result u").text(parts[1]);
                $(".diceform .error").html("");
                show_dice_stats();
                var new_row = '<tr><td>#'+data.bet_id+'</td><td>'+dt_local(data.bet_created,"hms")+'</td><td>'+data.number+'</td><td class="'+cur_streak_color+'">'+data.rnd.toFixed(2)+'</td><td>'+data.amount.toFixed(8)+'</td><td class="'+cur_streak_color+'">'+data.prize.toFixed(8)+'</td></tr>';
                $(new_row).insertAfter(".mybets tr:first");
                $(".mybets tr").slice(11).remove();
                var stop_on_profit = Number($(".stop_on_profit").val());
                if(!isNaN(stop_on_profit) && stop_on_profit>0 && autorolls){
                    if(dice_profit>=stop_on_profit){
                        $(".diceform .error").html("Stopped on profit");
                        if(autorolls && $(".dicecontrol .sound").hasClass("fa-volume-up")){
                            play_sound("notify.mp3");
                        }
                        dice_nonce = null;
                        autorolls=false;
                        $(".diceform>div input,.autorolls>div input,.dicecontrol button").prop("disabled",false);
                        $(".autorolls .enable").removeClass("hide");
                        $(".autorolls .stop").addClass("hide");
                        return false;
                    }
                }
                var stop_on_lose = Number($(".stop_on_lose").val());
                if(!isNaN(stop_on_lose) && stop_on_lose>0 && autorolls){
                    if(dice_profit<=-1*stop_on_lose){
                        $(".diceform .error").html("Stopped on loss");
                        if(autorolls && $(".dicecontrol .sound").hasClass("fa-volume-up")){
                            play_sound("notify.mp3");
                        }
                        dice_nonce = null;
                        autorolls=false;
                        $(".diceform>div input,.autorolls>div input,.dicecontrol button").prop("disabled",false);
                        $(".autorolls .enable").removeClass("hide");
                        $(".autorolls .stop").addClass("hide");
                        return false;
                    }
                }
            }
            if(data.bal_doge != null){
                $(".k_user .coin .n[rel=doge]").html(nToDec(data.bal_doge));
                console.log("upd bal doge");
            }
            if(data.error){
                dice_nonce = null;
                $(".diceform .error").html(data.error_text);
                if(autorolls && $(".dicecontrol .sound").hasClass("fa-volume-up")){
                    play_sound("notify.mp3");
                }
                autorolls=false;
                $(".diceform>div input,.autorolls>div input,.dicecontrol button").prop("disabled",false);
                $(".autorolls .enable").removeClass("hide");
                $(".autorolls .stop").addClass("hide");
                return false;
            }
            setTimeout(function(){
                //ws_dice.send(JSON.stringify({"action": "bet", "number":"2", "amount":"0.0004"}));
                //check for auto bet
                if(autorolls){
                    console.log("check nonce",dice_nonce,data.nonce)
                    if(!dice_nonce || data.nonce == dice_nonce+1){
                        //nonce ok
                        dice_nonce = data.nonce;
                        var number = $(".diceform .odds").val();
                        var amnt = $(".diceform .amnt").val();
                        if(!curr_bet){
                            curr_bet = Number(amnt);
                            base_bet = Number(amnt);
                        }
                        var reset_on_win = $(".reset_on_win").prop("checked");
                        var reset_on_lose = $(".reset_on_lose").prop("checked");
                        var incr_on_win = Number($(".incr_on_win").val());
                        var incr_on_lose = Number($(".incr_on_lose").val());
                        if(data.win){
                            if(reset_on_win){
                                curr_bet = base_bet;
                            }
                            if(incr_on_win){
                                var prc = incr_on_win/100;
                                curr_bet += prc*curr_bet;
                            }
                        }else{
                            if(reset_on_lose){
                                curr_bet = base_bet;
                            }
                            if(incr_on_lose){
                                var prc = incr_on_lose/100;
                                curr_bet += prc*curr_bet;
                            }
                        }
                        amnt=curr_bet.toFixed(8);
                        $(".diceform .amnt").val(amnt);
                        ws_dice.send(JSON.stringify({"action": "bet", "number":number, "amount":amnt}));
                    }else{
                       $(".diceform .error").text("wrong nonce, refresh page and check last bets");
                    }
                }else{
                    dice_nonce = null;
                }
            },220);
        }
    }
}

var dicebarmouse=false;
var autorolls=false;

$("html").on("mousedown touchstart", ".dicebar.main .handle", function(ev){
    dicebarmouse=true;
});

$("html").on("mousemove touchmove", function(ev){
    ev.preventDefault();
    var x = ev.screenX-130;
    if(dicebarmouse && x>-20 && x<620){
        console.log(x);
        var prc = ((x / 635)*100);
        var prc2=Math.round(prc+3,0);
        if(prc2<1)prc2=1;
        if(prc2>99)prc2=99;
        var payout = 100 / prc2;
        $(".diceform .odds").val(prc2.toFixed(0));
        $(".diceform .payout").val(payout.toFixed(2));
        $(".dicebar.main .handle").css("left",String(prc)+"%");
        $(".dicebar.main .greenbg").css("width",String(prc+4)+"%");
        dice_calc_profit();
    }
});

$("html").on("mouseup touchend", ".dicebar.main", function(ev){
    dicebarmouse=false;
});

$("html").on("click", ".dicecontrol .blueb", function(ev){
    $(".autorolls").toggle();
});

$("html").on("click", ".dicebar.main", function(ev){
    dicebarmouse=false;
    ev.preventDefault();
    var x = ev.screenX-130;
    if(x>-20 && x<620){
        console.log(x);
        var prc = ((x / 635)*100);
        var prc2=Math.round(prc+3,0);
        if(prc2<1)prc2=1;
        if(prc2>99)prc2=99;
        var payout = 100 / prc2;
        $(".diceform .odds").val(prc2.toFixed(0));
        $(".diceform .payout").val(payout.toFixed(2));
        $(".dicebar.main .handle").css("left",String(prc)+"%");
        $(".dicebar.main .greenbg").css("width",String(prc+4)+"%");
        dice_calc_profit();
    }
});

function dice_calc_profit()
{
    var amnt = Number($(".diceform .amnt").val());
    var payout =  Number($(".diceform .payout").val());
    var profit = (amnt * payout) - amnt;
    console.log(profit,profit<0.00000001);
    if(profit<0.00000001)profit=0;
    $(".diceform .profit").val(profit.toFixed(8));
}

$("html").on("keyup change", ".diceform .amnt", function(ev){
    dice_calc_profit();
});

$("html").on("click", ".diceform .change span", function(ev){
    var amnt = Number($(".diceform .amnt").val());
    if($(this).attr("rel")=="1"){
        amnt = amnt/2;
    }else{
        amnt = amnt*2;
    }
    if(amnt<0.00000001){
        amnt=0.00000001;
    }else if(amnt>30){
        amnt=30;
    }
    $(".diceform .amnt").val(amnt.toFixed(8));
});

$("html").on("click focus",".incr input", function(ev){
    $(this).addClass("highl");
    $(this).closest("div").find(".reset .checkbox").removeClass("checked");
    $(this).closest("div").find(".reset .hcheckbox").prop("checked",false);
});

$("html").on("click focus",".incr input", function(ev){
    $(this).addClass("highl");
    $(this).closest("div").find(".reset .checkbox").removeClass("checked");
    $(this).closest("div").find(".reset .hcheckbox").prop("checked",false);
});

$("html").on("blur",".incr input", function(ev){
    if($(this).val().length==0){
        $(this).removeClass("highl");
        $(this).closest("div").find(".reset .checkbox").addClass("checked");
        $(this).closest("div").find(".reset .hcheckbox").prop("checked",true);
    }
});

$("html").on("click touchstart",".reset", function(ev){
    $(this).closest("div").find(".reset .checkbox").addClass("checked");
    $(this).closest("div").find(".reset .hcheckbox").prop("checked",true);
    $(this).closest("div").find(".incr input").val("").removeClass("highl");
});

$("html").on("click",".dicecontrol .greenb", function(ev){
    var number = $(".diceform .odds").val();
    var amnt = $(".diceform .amnt").val();
    ws_dice.send(JSON.stringify({"action": "bet", "number":number, "amount":amnt}));
});

$("html").on("click",".autorolls .greenb", function(ev){
    if(!autorolls){
        autorolls=true;
        curr_bet = null;
        base_bet = null;
        $(".diceform>div input,.autorolls>div input,.dicecontrol button").prop("disabled",true);
        var number = $(".diceform .odds").val();
        var amnt = $(".diceform .amnt").val();
        ws_dice.send(JSON.stringify({"action": "bet", "number":number, "amount":amnt}));
    }else{
        autorolls=false;
        $(".diceform>div input,.autorolls>div input,.dicecontrol button").prop("disabled",false);
    }
    $(".autorolls .enable,.autorolls .stop").toggleClass("hide");
});

$("html").on("click",".dicecurstats .fa-broom", function(ev){
    dice_profit=0;
    dice_wagered=0;
    dice_highest=0
    dice_wins=0;
    dice_losses=0;
    cur_streak=0;
    cur_streak_color="";
    max_red_streak=0;
    max_green_streak=0;
    show_dice_stats();
});

$("html").on("click",".dicelast .splashes button", function(ev){
    var ind = $(this).index();
    $(".dicelast .splash").hide().eq(ind).show();
    if(ind==2){
        $(".splash.fair .changeseeds").load("/ajax_diceseeds/");
    }
});

$("html").on("click",".dicelast .splash .close", function(ev){
    $(".dicelast .splash").hide();
    return false;
});

$("html").on("click",".dicebetdetails .close", function(ev){
    $(this).closest(".dicebetdetails").hide();
    return false;
});

$("html").on("click",".dicecontrol .sound", function(ev){
    $(this).toggleClass("fa-volume-off fa-volume-up");
});

$("html").on("click",".betslists a", function(ev){
    var ind = $(this).index();
    $(".betslists a").removeClass("sel").eq(ind).addClass("sel");
    $(".diceallbets table").hide().eq(ind).show();
    var type = $(this).attr("rel");
    if(type)$.get("/ajax_tower_hist/?type="+String(type),function(ret){
        $(".diceallbets table[type="+type+"] tr:not(.th)").remove();
        $(ret).insertAfter($(".diceallbets table[type="+type+"] tr.th:last"));
    });
    return false;
});

$("html").on("click",".contests .yest_winners", function(ev){
    var type = $(this).attr("rel");
    $(".diceallbets table").hide();
    $(".diceallbets table[type="+type+"]").show();
    if(type)$.get("/ajax_tower_hist/?type="+String(type),function(ret){
        $(".diceallbets table[type="+type+"] tr:not(.th)").remove();
        $(ret).insertAfter($(".diceallbets table[type="+type+"] tr.th:last"));
    });
    return false;
});

$("html").on("click",".splash.faucet .greenb", function(ev){
    $.get($(this).attr("rel"),function(ret){
        $(".splash.faucet .result").html(ret);
    });
    return false;
});

$("html").on("click",".diceallbets table td", function(ev){
    var bet_id = $(this).closest("tr").find("td:first").text().replace("#","");
    if($(this).closest("tr").hasClass("bt")){
        if(bet_id)$(".dicebetdetails").show().find(".data").html(loader_small).load("/ajax_dicebet_details/?id="+String(bet_id),function(ret){
            $(".dicebetdetails .data").html(ret);
        });
    }else{
        var tr=$(this).closest("tr");
        if(bet_id && !tr.hasClass("opened"))$.get("/ajax_dicebet_details/?game="+String(bet_id),function(ret){
            $(ret).insertAfter(tr);
        });
        tr.addClass("opened");
    }
});

$("html").on("click",".splash.fair .menus a", function(ev){
    var ind = $(this).index();
    $(".fair .menus a").removeClass("sel").eq(ind).addClass("sel");
    $(".fair").find(".sect").hide().eq(ind).show();
    return false;
});

$("html").on("submit",".splash.fair .seed form", function(ev){
    operate_form($(this),function(form,ret){
        form.closest(".changeseeds").html(ret);
    });
    return false;
});

$("html").on("click",".verif .greenb", function(ev){
    $(this).closest(".verif").find(".verif_data").toggle();
    return false;
});

$("html").on("keyup change",".martingaleform input", function(ev){
    var payout = $(this).val();
    var result = (1/(payout-1))*100;
    $(".martingaleform .increase").text(result.toFixed(2));
});


$("html").on("keyup change",".wagercalcform input", function(ev){
    $(".wagercalcform .optpayout").html(loader_big);
    setTimeout(function(){
    var basebet = Number($(".wagercalcform input.basebet").val());
    if(isNaN(basebet))return false;
    var bal = Number($(".wagercalcform input.bal").val());
    if(isNaN(bal))return false;

    var increase_on_loss = $(".wagercalcform input.incr").prop("checked");
    var can_handle = [];
    var busted_in = [];
    var wagered_total = [];

    if(!increase_on_loss){
        var payouts = [1.01,1.1,2,3,4,5,6,7];

        for(var j=0;j<payouts.length;j++){
            var payout = payouts[j];
            var basebet = Number($(".wagercalcform input.basebet").val());
            var bal = Number($(".wagercalcform input.bal").val());
            var odds = ((100-(100/(1.01*payout)))/100)*1000;
            var wagered=0;
            var i=0;
            while(true){
                var rnd = getRandom(0, 1000);
                if(rnd<odds){
                    bal-=basebet;
                }else{
                    bal+=(basebet*(payout-1));
                }
                wagered+=basebet;
                i+=1;
                if(i>10000000 || bal<basebet){
                    can_handle.push(i);
                    busted_in.push(i);
                    wagered_total.push(wagered);
                    break;
                }
            }
            console.log(payout,odds,wagered,bal);
        }
        var maxX = Math.max.apply(null, wagered_total);
        var index = wagered_total.indexOf(maxX);
        $(".wagercalcform .optpayout").text(payouts[index]);
        $(".wagercalcform .canhandle").text(can_handle[index]);
        $(".wagercalcform .bustedin").text(busted_in[index]);
        $(".wagercalcform .wageruntil").text(wagered_total[index].toFixed(8));
        $(".wagercalcform table").hide();
        return false;
    }

    var payouts = [1.01,1.02,1.03,1.04,1.05,1.06,1.07,1.08,1.09,1.1];
    var wager_table = [];
    for(var j=0;j<payouts.length;j++){
        var payout = payouts[j];
        var basebet = Number($(".wagercalcform input.basebet").val());
        var bal = Number($(".wagercalcform input.bal").val());
        var increase = (1/(payout-1))*100;
        var odds = (100-(100/(1.01*payout)))/100;
        var base_odds=odds;
        var all_odds=[]
        for(var i=0;i<10000;i++){
            bal -= basebet;
            all_odds.push([1-odds,basebet,0]);
            odds2 = odds*100;
            var everyrolls = Math.floor(1 / (odds2/100));
            var newbasebet=Math.round( ( basebet*(1+increase/100) + Number.EPSILON ) * 100000000 ) / 100000000;
            if(newbasebet.toFixed(8) == basebet.toFixed(8))newbasebet+=0.00000001;
            basebet=newbasebet;
            odds *= base_odds;
            if(bal<basebet || !increase_on_loss){

                var wagered = 0;
                var remain = everyrolls;
                for(var z=0;z<all_odds.length;z++){
                    var rollshere = remain * all_odds[z][0];
                    if(z>0)rollshere = remain * (all_odds[z][0]-all_odds[z-1][0]);
                    rollshere = Math.floor(rollshere);
                    all_odds[z][2] = rollshere
                    console.log("rolls here", rollshere);
                    wagered += rollshere * all_odds[z][1];

                    //remain -= rollshere;
                    //console.log("add wagered",wagered,"remain",remain);
                }
                can_handle.push(i);
                busted_in.push(everyrolls);
                wagered_total.push(wagered);
                wager_table.push(all_odds);
                console.log("payout",payout,"can handle",i,"everyrolls",everyrolls,"all_odds",all_odds,"wagered",wagered);
                break;
            }
        }
    }
    var maxX = Math.max.apply(null, wagered_total);
    var index = wagered_total.indexOf(maxX);
    $(".wagercalcform .optpayout").text(payouts[index]);
    $(".wagercalcform .canhandle").text(can_handle[index]);
    $(".wagercalcform .bustedin").text(busted_in[index]);
    $(".wagercalcform .wageruntil").text(wagered_total[index].toFixed(8));
    $(".wagercalcform table").show();
    $(".wagercalcform table tr:gt(0)").remove();
    for(var i=0;i<wager_table[index].length;i++){
        $(".wagercalcform table").append('<tr><td>'+String(wager_table[index][i][1].toFixed(8))+'</td><td>'+String(wager_table[index][i][2].toFixed(0))+'</td>');
    }
    },100);
});

$("html").on("keyup change",".oddscalcform input", function(ev){
    var payout = Number($(".oddscalcform input:first").val());
    if(isNaN(payout))return false;
    var basebet = Number($(".oddscalcform input.basebet").val());
    if(isNaN(basebet))return false;
    var bal = Number($(".oddscalcform input.bal").val());
    if(isNaN(bal))return false;
    var increase = (1/(payout-1))*100;
    var custom_incr = Number($(".oddscalcform input.incr").val());
    if(custom_incr && !isNaN(custom_incr))increase=custom_incr;
    var odds = (100-(100/(1.01*payout)))/100;
    var base_odds=odds;
    $(".oddscalcform table tr:gt(0)").remove();
    for(var i=0;i<10000;i++){
        bal -= basebet;
        odds2 = odds*100;
        var everyrolls = 1.5 / (odds2/100);
        if(everyrolls<5)everyrolls="every second"
        else if(everyrolls<2500)everyrolls="every " + (everyrolls/60).toFixed(1) + " minutes"
        else if(everyrolls<3600*18)everyrolls="every " + (everyrolls/3600).toFixed(1) + " hours"
        else if(everyrolls<3600*200)everyrolls="every " + (everyrolls/(3600*24)).toFixed(1) + " days"
        else if(everyrolls<3600*9000)everyrolls="every " + (everyrolls/(3600*24*30)).toFixed(1) + " months"
        else everyrolls="every " + (everyrolls/(3600*24*30*12)).toFixed(1) + " years"
        $(".oddscalcform table").append('<tr><td>'+String(i+1)+'</td><td>'+String(basebet.toFixed(8))+'</td><td>'+String(bal.toFixed(8))+'</td><td>'+String(odds2.toFixed(8))+'%</td><td>'+String(everyrolls)+'</td></tr>');
        var newbasebet=Math.round( ( basebet*(1+increase/100) + Number.EPSILON ) * 100000000 ) / 100000000;
        if(newbasebet.toFixed(8) == basebet.toFixed(8))newbasebet+=0.00000001;
        basebet=newbasebet;
        odds *= base_odds;
        console.log(bal,basebet,increase);
        if(bal<basebet){
            $(".oddscalcform .canhandle").text(i);
            break;
        }
    }
});

$("html").on("click",".oddscalcform button", function(ev){
    $(this).closest(".oddscalcform").find("table").toggle();
});

$("html").on("click",".strategies>a", function(ev){
    var ind = $(this).index();
    $(".strategies").hide();
    $(".one_strat").hide().eq(ind).show();
    return false;
});

$("html").on("click",".one_strat .fa-angle-double-left", function(ev){
    $(".strategies").show();
    $(".one_strat").hide();
    return false;
});

$("html").on("click",".enhancer .redb", function(ev){
    $(this).closest(".enhancer").find(".details").toggle();
    return false;
});

function connect_chat()
{
    console.log("con chat");
    ws_chat = new WebSocket(socket_type+window.location.hostname+":8006/");
    ws_chat.onerror = function(event){
        console.log("chat err",event.code);
        setTimeout(function(){
            $(".full .chat form").hide();
            if(!sleep_mode  && reconnects < 5){
                setTimeout(function(){connect_chat();},7000 + getRandom(10, 3000));
            }
        },8000);
    }
    ws_chat.onclose = function(event){
        //console.log("chat err",event.code);
        setTimeout(function(){
            $(".full .chat form").hide();
            if(!sleep_mode && reconnects < 5){
                setTimeout(function(){connect_chat();},7000 + getRandom(10, 3000));
            }
        },8000);
    }
    ws_chat.onopen = function(event){
        var lang_code = $(".chat .title .chath span").attr("rel");
        if(lang_code == "enru")lang_code == "en";
        if(lang_code){
            ws_chat.send(JSON.stringify({"action": "lang", "lang":lang_code}));
        }
        $(".full .chat form").show();
    }
    ws_chat.onmessage = function (event) {
        console.log(event.data);
        data = JSON.parse(event.data);
        var lang_code = $(".chat .title .chath span").attr("rel");
        if(lang_code == "enru")lang_code == "en";
        if(data.refr){
            Object.keys(data.online).forEach(function(key,i){
                if(key==lang_code)$(".full .chat .inchat b").html(data.online[key]);
            });
            $(".full .chat .typing b").html("0");
            Object.keys(data.typing).forEach(function(key,i){
                if(key==lang_code)$(".full .chat .typing b").html(data.typing[key]);
            });
        }
        if(data.clear){
            $(".full .chat .messages").html("");
        }
        if(data.mention){
            if(data.mention==user_pk){
                play_sound("notify.mp3");
            }
        }
        if(data.banned){
            if(data.until)$(".full .chat form").html("You are banned at chat until "+String(data.until));
            else $(".full .chat form").html("You are banned at chat forever");
        }
        if(data.delete_for_id){
            $("aside .chat .messages div[rel="+data.delete_for_id+"]").remove();
        }
        if(data.msg){
            var msg = data.msg;
            var h = $(".chat .messages")[0].scrollHeight;
            var bh = $(".chat .messages").height();
            var scr = $(".chat .messages").scrollTop();
            if(msg[1]==lang_code){
                var c_class="";
                if(msg[4]==0)c_class="rain";
                else if(msg[4]==-1)c_class="gifts";
                else if(msg[4]==-2)c_class="mission";
                else{
                    if(msg[5])c_class=msg[5];
                }
                if(c_class.indexOf("vip")>=0){
                    nick_before = '<i class="fa fa-user-ninja infot" rel="VIP"></i> ';
                }else{
                    nick_before = '';
                }
                if(c_class.indexOf("voice")>=0){
                    $(".chat .messages").append('<div class="'+c_class+'" rel="'+msg[4]+'"><i class="fa fa-fw fa-address-book"></i> '+nick_before+' <span class="nick" rel="'+dt_local(msg[0])+'" >'+msg[2]+':</span> <audio controls><source src="/static/media/voice/'+msg[4]+'.webm'+'?'+getRandom(0, 9999)+'" type="audio/webm"></audio></div>');
                }else{
                    $(".chat .messages").append('<div class="'+c_class+'" rel="'+msg[4]+'"><i class="fa fa-fw fa-address-book"></i> '+nick_before+' <span class="nick" rel="'+dt_local(msg[0])+'" >'+msg[2]+':</span> '+msg[3]+'</div>');
                }
                //console.log("scroll",scr,h-bh-20);
                if(scr > h-bh-20 || scr==0){
                    $(".full .chat .messages").scrollTop(30000);
                }
            }
        }

    }
}


var scroll_interval;
var blang = "en";
var lang_arr = null;
var app_ver = null;

var chat_c_menu = '<span class="chat_c_menu"><a class="seeprofile" target="_blank" href="/profile/?u=">See profile</a><a class="onlymod ban" href="/banchat/?u=">Ban</a></span>'
var gca = ['<div class="gca coin"><div class="c btc"></div></div>','<div class="gca coin"><div class="c eth"></div></div>',
'<div class="gca coin"><div class="c xrp"></div></div>','<div class="gca coin"><div class="c xlm"></div></div>'];

var storage = isLocalStorage();
var loader_big='<div class="loader_big"><div class="loader"><div class="loader"><div class="loader"><div class="loader"></div></div></div></div></div>';
var loader_small='<div class="loader_small"><div class="loader"><div class="loader"><div class="loader"><div class="loader"></div></div></div></div></div>';
var loader_inline = '<span class="spinner vis inlbl"></span>';

$(document).ready(function(){
    $("header .settings").click(function(){
        $(".k_menu,.k_user").fadeToggle(300);
        play_sound("click.mp3");
        return false;
    });
    $("html").on("click","button",function(e){
        if($(this).find("u.tosel")){
            var t = $(this).find("u.tosel");
            $(".improve_tr_block textarea:first").val($(t).text());
            $(".improve_tr_block input[name=lang_new]").val(localStorage.getItem('lang'));

            if($(t).attr("old") && $(t).attr("old").length && $(this).attr("old") != $(this).text() ){
                $(".improve_tr_block input[name=lang_origin]").val(localStorage.getItem('lang'));
            }else{
                $(".improve_tr_block input[name=lang_origin]").val("en");
            }

        }
    });


    $("html").on("click",".tosel.infot",function(e){
        var t = $(this).attr("rel").replace("<u>","").replace("</u>","");
        $(".improve_tr_block textarea:first").val(t);
        $(".improve_tr_block input[name=lang_new]").val(localStorage.getItem('lang'));
        if($(t).attr("old") && $(t).attr("old").length && $(this).attr("old") != $(this).text() ){
            $(".improve_tr_block input[name=lang_origin]").val(localStorage.getItem('lang'));
        }else{
            $(".improve_tr_block input[name=lang_origin]").val("en");
        }
    });

    $("html").on("click","u.tosel",function(e){
        if(!e.altKey){
            e.stopPropagation();
            $(".improve_tr_block textarea:first").val($(this).text());
            $(".improve_tr_block input[name=lang_new]").val(localStorage.getItem('lang'));
            if($(this).attr("old") && $(this).attr("old").length && $(this).attr("old") != $(this).text() ){
                $(".improve_tr_block input[name=lang_origin]").val(localStorage.getItem('lang'));
            }else{
                $(".improve_tr_block input[name=lang_origin]").val("en");
            }
            return false;
        }
    });
    $("header,.full").click(function(){
        $(".k_menu:not(.show),.k_user:not(.show)").fadeOut(300);
    });
    $(".k_menu .settings").click(function(e){
        if($(e.target).attr('class') != "tosel"){
            $(".overlay").fadeIn(300);
            $(".win_settings").show(400).html(loader_big).load("/settings/",show_settings);
            play_sound("click.mp3");
            return false;
        }
    });
    $("html").on("click",".win_settings .return",function(){
        $(".overlay").fadeOut(300);
        $(".win_settings").hide(400);
        play_sound("click.mp3");
        return false;
    });
    $("html").on("click",".win_settings .menu a:not(.return)",function(){
        var ind = $(this).index() - 1;
        $(".win_settings .menu a:not(.return)").removeClass("active");
        $(this).addClass("active");
        $(".win_settings .content").hide().eq(ind).show();
        play_sound("click.mp3");
        return false;
    });

    $("html").on("mouseenter",".infot,.showcn .coin .c[rel],.token[alt]",function(){
        if($(this).hasClass("token")){
            $(".tooltips").find(".content").html('<a href="/token_details/'+$(this).attr("alt")+'/"><i class="fa fa-fw fa-info"></i> info</a>');
        }else{
            $(".tooltips").find(".content").html($(this).attr("rel"));
        }
        if($(this).hasClass("smiles_but")){
            var smiles = $(this).attr("rel").split("-");
            var res = "";
            smiles.forEach(function(el){
                if(el.length!="" && el.length!="\n")res += "<span class='onesmile'>"+el+"</span>";
            });
            $(".tooltips").find(".content").html(res);
        }
        var pos=$(this).offset();
        var height=$(".tooltips").height();
        var el_height = $(this).height()
        var w = $(this).width();
        $(".tooltips").fadeIn(150).css({"left":pos.left+Number(w)+14,"top":pos.top-(height/2)+1+el_height/2});
    });
    $("html").on("mouseleave",".infot,.showcn .coin .c",function(e){
        if(e.relatedTarget && $(e.relatedTarget).hasClass("arrow"))return false;
        $(".tooltips").fadeOut(150);
    });
    $("html").on("mouseleave",".tooltips .arrow,.tooltips .content",function(e){
        if(e.relatedTarget && ($(e.relatedTarget).hasClass("content") || $(e.relatedTarget).hasClass("infot")  || $(e.relatedTarget).hasClass("fa-info")))return false;
        $(".tooltips").fadeOut(150);
    });

    $("html").on("click",'.checkbox_setting label',function(){
        var ch = $(this).closest('.checkbox_setting').find('input[type="checkbox"]');
        ch.prop("checked", !ch.prop("checked"));
        ch.trigger("change");
        play_sound("click.mp3");
    });
    $("html").on("click",'.radio_setting label',function(){
        var ch = $(this).closest('.radio_setting').find('input[type="radio"]');
        ch.prop("checked", !ch.prop("checked"));
        play_sound("click.mp3");
    });
    $(".k_center .auth a:first").click(function(){
        $(".k_center .descr,.k_center .login:not(.login2fa):not(.email_conf_code):not(.restore)").toggle();
        if($(".k_center .descr:visible").length){
             $(".k_center .login").hide();
        }
        return false;
    });
    $("form.login").submit(function(){
        var addparams="";
        if($(".register_confirm:visible").length)addparams="conf";
        operate_form($(this),function(form,ret){
            if(ret.err){
                form.find(".err").html(ret.err);
                $(".login tr").hide();
                $(".login tr:not(.register_confirm):not(.captcha)").show();
                translate(form);
            }
            if(ret.state=="need2fa"){
                $(".login:not(.login2fa):not(.email_conf_code),.login.login2fa").toggle();
                $(".login2fa input[type=text]").focus();
                $(".login.restore").hide();
            }
            if(ret.state=="email_conf_code"){
                $(".login:not(.login2fa),.email_conf_code").toggle();
                $(".login.restore").hide();
            }
            if(ret.state=="logined"){
                if(ret.next)location.href=ret.next;
                else location.href="/balances/";
            }
            if(ret.state=="not_found"){
                $(".login:not(.login2fa):not(.email_conf_code):not(.restore) tr").toggle();
                $(".login tr.captcha").hide();
            }
            if(ret.state=="captcha"){
                $(".login tr").hide();
                $(".login tr.captcha").show();
                $(".login tr.captcha img").attr("src",ret.captcha);
                $(".login tr.captcha input[name=captcha_key]").val(ret.captcha_key);
            }
        },"addparams="+addparams);
        return false;
    });
    $("form.login .cancel_reg").click(function(){
        $(".login:not(.login2fa):not(.email_conf_code):not(.restore) tr:not(.captcha)").toggle();
        return false;
    });
    $("form .restore").click(function(){
        $(".login:not(.login2fa):not(.email_conf_code)").toggle();
        return false;
    });



    $("html").on("click",".win_settings .apply",function(e){
        save_prefs_storage($(".win_settings"));
        $(".win_settings .content:visible .applied").show().fadeOut(5000);
        play_sound("click.mp3");
        return false;
    });
    $("html").on("click",".win_settings .restore_def",function(e){
        $(".win_settings input[name=help_improve],.win_settings input[name=show_btc_price],.win_settings input[name=show_est],.win_settings input[name=order_conf]").prop("checked",false);
        $(".win_settings input[name=mes_notify_header],.win_settings input[name=sound],.win_settings input[name=anim]").prop("checked",true);
        save_prefs_storage($(".win_settings"));
        $(".win_settings .content:visible .applied").show().fadeOut(5000);
        play_sound("click.mp3");
        return false;
    });


    $("html").on("click",".win_settings .apply2",function(){
        var form = $(this).closest("form");
        operate_form($(form),function(form,ret){
            if(ret.notify){
                $("header").attr("rel",ret.notify);
            }
        });
        $(".win_settings .content:visible .applied").show();
        play_sound("click.mp3");
        return false;
    });

    $("html").on("click",".win_settings .change_pwd",function(){
        var form = $(this).closest("form");
        operate_form($(form),function(form,ret){
            if(ret.err){
                form.find(".result").addClass("red").html(ret.err);
            }else if(ret.success){
                form.find(".result").removeClass("red").addClass("green").html(ret.success);
            }
        });
        play_sound("click.mp3");
        return false;
    });

    $("html").on("submit",".fa_alr,.fa_enable",function(){
        operate_form($(this),function(form,ret){
            if(ret.success){
                $(".win_settings").html(loader_big).load("/settings/",function(){show_settings("fa")});
            }else if(ret.err){
                form.find(".err").html(ret.err);
            }
        });
        return false;
    });

    $("html").on("click",".win_settings .enfor a",function(){
        $(this).closest(".enfor").find("a").removeClass("btn-danger").addClass("btn-warning");
        $(this).closest(".enfor").find("input[name=enfor]").val($(this).attr("rel"));
        $(this).addClass("btn-danger").removeClass("btn-warning");
        return false;
    });

    $("html").on("click",".improve_tr",function(){
        $("u").toggleClass("tosel");
        $(".infot,select").addClass("tosel");
        if($("u:first").hasClass("tosel")){
            if($(".improve_tr_block").length){$(".improve_tr_block").show();$(".improve_tr_block textarea").val("");}
            else{
                $("body").append('<div class="improve_tr_block"></div>');
                $(".improve_tr_block").load("/improve_tr/");
            }
        }else{
            $(".improve_tr_block").hide();
            $(".infot,select").removeClass("tosel");
        }
        return false;
    });

    $("html").on("click","select.tosel",function(){
        var t = $(this).find("option:selected");
        $(".improve_tr_block textarea:first").val($(t).text());
        $(".improve_tr_block input[name=lang_new]").val(localStorage.getItem('lang'));
        if($(t).attr("old") && $(t).attr("old").length && $(this).attr("old") != $(t).text() ){
            $(".improve_tr_block input[name=lang_origin]").val(localStorage.getItem('lang'));
        }else{
            $(".improve_tr_block input[name=lang_origin]").val("en");
        }
    });

    $("html").on("click",".bal_coins .one button:not(.cancel):not(.activate2fa):not(.noajax):not([type=submit])",function(){
        var o = $(this).closest(".one");
        o.removeClass("hiding").addClass("expand").find(".forload").html(loader_big).load($(this).attr("rel"));
        o.parent().find(".one").not(o).removeClass("expand").addClass("hiding");
        return false;
    });

    $("html").on("click",".dhist .hist",function(){
        var o = $(this).closest(".block");
        o.find(".forload").html(loader_big).load($(this).attr("rel"));
        return false;
    });

    $("html").on("click",".bal_hist .step-links a",function(){
        $(this).closest(".forload").load($(this).attr("href"));
        return false;
    });

    $("html").on("click",".deposit .cancel,.withdraw .cancel,.bal_hist .cancel",function(){
        $(".bal_coins .one").removeClass("expand").removeClass("hiding");
        $(this).closest(".forload").html("");
        return false;
    });



    $("html").on("click",".deposit .paym_id_notice a",function(){
        $(this).closest(".paym_id_notice").hide();
        $(this).closest(".deposit").find(".adrs").show().removeClass("hide");
        return false;
    });

    $("html").on("click",".withdraw .choose a",function(e){
        e.stopPropagation();
        $(this).closest(".choose").find("a").not(this).addClass("btn-outline-primary").removeClass("btn-primary");
        $(this).removeClass("btn-outline-primary").addClass("btn-primary");
        var mult = Number($(this).attr("rel"));
        $(this).closest("form").find("input[name=fee]").val(mult);
        var base_fee = Number($(this).closest("form").find(".base_fee").attr("rel"));
        $(this).closest("form").find(".base_fee").html(toFixedTrunc(mult*base_fee));
        var fee = Number($(this).closest("form").find(".base_fee").text());
        var amnt = $(".amnt input[name=amount]").val();
        var res = amnt - fee;
        $(".amnt .tosend").html(toFixedTrunc(res,8));
        return false;
    });

    $("html").on("change",".withdraw .adr .recent",function(e){
        var vl = $(this).find("option:selected").attr("rel");
        if(vl){
            if(vl.indexOf(":::")>=0){
                var parts = vl.split(":::");
                var adr = parts[0];
                var paym = parts[1];
                $(this).closest("form").find("input[name=paym_id]").val(paym);
            }else{
                var adr = vl
                $(this).closest("form").find("input[name=paym_id]").val("");
            }
            $(this).closest("form").find("input[name=address]").val(adr);
        }
        return false;
    });

    $("html").on("click",".withdraw .av_bal",function(e){
        e.stopPropagation();
        var all = Number($(this).text());
        var fee = Number($(this).closest("form").find(".base_fee").text());
        var res = all - fee;
        $(".amnt input[name=amount]").val(toFixedTrunc(all,8));
        $(".amnt .tosend").html(toFixedTrunc(res,8));
        return false;
    });

    $("html").on("click keyup change",".withdraw input[name=amount]",function(e){
        e.stopPropagation();
        var amnt = $(".amnt input[name=amount]").val();
        var fee = Number($(this).closest("form").find(".base_fee").text());
        var res = amnt - fee;
        if(isNaN(res))$(".amnt .tosend").html("");
        else $(".amnt .tosend").html(toFixedTrunc(res,8));
        return false;
    });

    $("html").on("submit",".deposit form",function(){
        operate_form($(this),function(form,ret){
            form.closest(".forload").html(ret);
        });
        return false;
    });

    $("html").on("submit","form.withdraw",function(){
        operate_form($(this),function(form,ret){
            form.closest(".forload").html(ret);
        });
        return false;
    });



    $("html").on("submit",".improve_tr_block form",function(){
        operate_form($(this),function(form,ret){
            if(ret.limit){
                form.find(".err").html(ret.limit);
                translate(form);
            }
            if(ret.success){
                form.find(".err").html(ret.success);
                form.find("textarea").val("");
                translate(form);
            }
        });
        return false;
    });

    $("html").on("click","header .chat",function(){
        $("body").toggleClass("withchat");
        if($("body").hasClass("withchat")){
            connect_chat();
        }else{
            ws_chat.close();
        }
        need_resize();
        if(storage){
            localStorage.setItem('withchat',$("body").hasClass("withchat"));
        }
        return false;
    });

    $("html").on("keyup",".full .chat .f input",function(){
        var lang_code = $(".chat .title .chath span").attr("rel");
        if(lang_code == "enru")lang_code == "en";
        ws_chat.send(JSON.stringify({action: "typing", "lang":lang_code}));
    });



    $("html").on("submit",".chat .msgs form",function(){
        //var lang_code = "en";
        var lang_code = $(".chat .title .chath span").attr("rel");
        if(lang_code == "enru")lang_code == "en";
        var msg = $(".chat textarea").val();
        if(msg.length>200){
            alert("200 symbols maximum");
            return false;
        }
        if(msg.length>0){
            ws_chat.send(JSON.stringify({action: "msg", "lang":lang_code, "msg":msg}));
            $(".chat textarea").val("");
        }
        return false;
    });

    $("html").on("keyup",".chat form textarea",function(e){
        var key = e.keyCode;
        if (key === 13) {
            $(".chat .msgs form").submit();
        }
    });

    $("html").on("click",".full .chat .choose span",function(e){
        var lang_code = $(this).attr("rel");
        if(lang_code == "enru")lang_code == "en";
        $(".chat .title .chath span").html(lang_code);
        $(".chat .title .chath span").attr("rel",lang_code);
        $(this).closest(".choose").hide();
        if(ws_chat)ws_chat.send(JSON.stringify({action: "lang", "lang":lang_code}));
        return false;
    });



    $("html").on("click",".wmodal",function(){
        var href = $(this).attr("href");
        $(".modal_overlay").show().find(".win_modal").html(loader_small).load(href,function(){
            centre_w($(".modal_overlay .win_modal"));
            $(".modal_overlay .win_modal").attr("rel",href);
        });
        return false;
    });

    $("html").on("click",".win_modal a.close",function(){
        $(".modal_overlay").hide();
    });

    $("html").on("click",".state_win a.close",function(){
        $(".state_win").toggleClass("min");

    });

    $("html").on("click",".win_modal .start_task",function(){
        $(this).hide();
        $(this).closest(".all").find(".check_task").show();
    });

    $("html").on("click",".win_modal .check_task",function(e){
        e.stopPropagation();
        var href = $(this).closest("a").attr("href");
        var block = $(this).closest("div");
        $(this).prop("disabled",true);
        var but = $(this);
        $(this).closest("div").find(".result").html(loader_small).load(href,function(ret){
            if(ret.indexOf("Success")>=0){
                block.find("a").remove();
                var task_pk = $(".win_modal .tasksm").attr("rel");
                var alr_compl = String($(".alr_compl").val()).split(",");
                alr_compl.push(task_pk);
                $(".alr_compl").val(alr_compl.join(","));
            }else{
                but.prop("disabled",false);
            }
        });
        return false;
    });

    $("html").on("submit",".bct_nickname_save",function(e){
        var form = $(this);
        operate_form(form,function(form,ret){
            $(".modal_overlay .win_modal").html(ret);
        });
        return false;
    });

    $("html").on("click",".win_modal .authin",function(e){
        $(this).closest(".win_modal").find(".after_auth").show();
    });

    $("html").on("click",".win_modal .after_auth",function(e){
        var href = $(".modal_overlay .win_modal").attr("rel");
        $(".win_modal").html(loader_small).load(href,function(){
            centre_w($(".modal_overlay .win_modal"));
            $(".modal_overlay .win_modal").attr("rel",href);
        });
        return false;
    });

    $("html").on("click",".auth .fb",function(e){
        FB.login(function(response) {
            trylogin();
        }, {scope: 'public_profile,email'});
        return false;
    });

    $("html").on("click",".win_modal a.clear,.win_modal a.clear_all",function(){
        var link = $(this);
        $.get($(this).attr("href"),function(){
            if(link.hasClass("clear_all")){
                link.closest(".win_modal").find(".notifi_one").slideUp(400);
                setTimeout(function(){
                    $(".modal_overlay").hide();
                    $(".notif_cnt").html("");
                },500);
            }else{
                link.closest(".notifi_one").slideUp(400);
                var prev = $(".notif_cnt:first").html();
                if(!prev || isNaN(prev))prev=0;
                else{
                    $(".notif_cnt").html(prev-1);
                    if(prev-1==0)$(".notif_cnt").html("");
                }
            }
        });
        return false;
    });


    $("html").on("change",".create_task_sel_type,.create_task_sel_network,.create_task_sel_coin",function(){
        var form = $(this).closest("form");
        operate_form(form,function(form,ret){
            $(".modal_overlay .win_modal").html(ret);
        });
        return false;
    });

    $("html").on("submit",".modal_overlay .win_modal form:not(.report)",function(){
        operate_form($(this),function(form,ret){
            if(ret.success){
                if(ret.redir)location.href=ret.redir;
            }else{
                $(".modal_overlay .win_modal").html(ret);
            }
        });
        return false;
    });

    $("html").on("click",".modal_overlay .win_modal .subm",function(){
        $(this).closest("form").append('<input type="hidden" name="submit" value="1">');
        $(this).closest("form").submit();
        return false;
    });

    $("html").on("keyup change",".cr_task_form input[name=cost],.cr_task_form input[name=quanity]",function(){
        var cost = Number($(".cr_task_form input[name=cost]").val());
        if($(".cr_task_form input[name=quanity]").length){
            var q = Number($(".cr_task_form input[name=quanity]").val());
            var to_pay = cost * q;
        }else{
            var to_pay = cost;
        }
        var fee = to_pay * 0.02;
        if(fee<0.00000001)fee=0.00000001;
        console.log("fee",fee);
        to_pay += fee;
        console.log("to_pay",to_pay);
        if(!isNaN(to_pay))$(".cr_task_form .topay .n").html(toFixedTrunc(to_pay,8));
        else $(".cr_task_form .topay .n").html("0");
    });

    $("html").on("click",".cr_task_form .min_cost",function(){
        var cost = $(this).attr("rel");
        $(".cr_task_form input[name=cost]").val(cost).trigger("change");
        return false;
    });


    $("html").on("click",".userinfo .line_menu a",function(){
        $(this).addClass("active").closest(".line_menu").find("a").not(this).removeClass("active");
        $(this).closest(".userinfo").find(".block").hide().eq($(this).closest("li").index()).show();
        return false;
    });

    $("html").on("click",".collect_menu a",function(){
        if(localStorage && $(this).attr("rel")){
            localStorage.setItem("collect_menu",$(this).attr("rel"));
        }
    });

    $("html").on("click",".line_menu li:not(.create) a[rel]",function(e){
        e.preventDefault();
        $(this).addClass("active").closest("ul").find("a").not(this).removeClass("active");
        $(this).closest(".full").find(".dblock").hide().eq($(this).parent().index()).show();
        if($(".shopform").length){
            $("#map").appendTo($(this).closest(".full").find(".dblock:visible .mapblock"));
        }
    });

    if(localStorage && $(".collect_menu").length){
        var el = localStorage.getItem("collect_menu");
        if(!el)el="4";
        $(".collect_menu a[rel="+el+"]").trigger("click");
    }

    $("html").on("click",".activate2fa",function(){
        $(".win_settings,.overlay").show(400);
        $(".win_settings").html(loader_big).load("/settings/",function(){show_settings("fa")});
        $(this).closest(".bal_coins .one").removeClass("expand").removeClass("hiding");
        return false;
    });
    if(location.hash){
        if(location.hash == "#login" || location.hash == "login"){
            $(".k_center .auth a:first").click();
        }
    }
    if(location.href.indexOf("?next=")>=0){
        $(".k_center .auth a:first").click();
    }

    $("html").on("submit",".upd_profile",function(){
        operate_form($(this),function(form,ret){
            if(ret.err){
                $(form).find(".ret").addClass("red").html(ret.err);
            }else if(ret.success){
                $(form).find(".ret").removeClass("red").html(ret.success);
            }
        });
        return false;
    });

    if($(".withchat .full").length){
        var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        if($(".withchat .full").height() < h-201)$(".withchat .full").css("min-height",String(h-201)+"px");
    }

    $("html").on("click",".ajax_avatars",function(){
        $(this).closest(".upload_or_avatar").html(loader_small).load($(this).attr("rel"));
        return false;
    });

    $("html").on("click",".upload_or_avatar .avatars a",function(){
        var img = $(this).find("img").clone();
        $.get($(this).attr("href"),{},function(ret){
            $(".userinfo .photo").html("").find("img").remove();
            $(".userinfo .photo").append(img);
        });
        return false;
    });

    $("html").on("change",".upload_or_avatar .uploads input[type=file]",function (){
        $(this).closest("form").submit();
     });

     $("html").on("submit",".upload_or_avatar .uploads form",function (){
        operate_form($(this),function(form,ret){
            if(ret.err){
                form.find(".err").html(ret.err);
            }else{
                $(".userinfo .photo").html("").find("img").remove();
                $(".userinfo .photo").append('<img src="'+ret.src+'">');
                form.find(".err").html("");
            }
        });
        return false;
     });

    $("html").on("click",".chat .title .chath",function(){
        $(this).parent().find(".choose").toggle();
    });

    $("html").on("click",".quizp .op",function(){
        $.get($(this).attr("href"),function(ret){
            if(ret.err){
                $(".quizp .err").show().html(ret.err);
            }else{
                $(".quizp .err").hide();
            }
        });
        return false;
    });




    var scroll_dnd;
    $("html").on("click",".scroll",function(e){
        var posY = $(this).offset().top;
        var h1 = $(this).parent().find(".scroll_list").height();
        var h2 = $(this).parent().find(".scroll_wrap").height();
        var h = $(this).height();
        var pos = e.pageY-posY;
        var prc = pos/h;
        var scroll = prc * (h2-h1);
        var s2=scroll.toFixed();
        scroll_interval = setInterval(function(){rscroll();},200);
        $(this).parent().find(".scroll_list").animate({scrollTop:s2 * 1.03},{duration:600,queue:false});
        $(this).parent().find(".scroll span").animate({top:pos-15},{duration:600,queue:false,complete:function(){rscroll();clearInterval(scroll_interval);}});
        rscroll();
        return false;
    });

    $("html").on("mousedown"," .scroll span",function(e){
        scroll_dnd=true;
        return false;
    });

    $("html").on("mouseup","body",function(e){
        scroll_dnd=false;
        trmove=false;
        //return false;
    });

    $("html").on("mousemove",".scroll_base .scroll,.scroll_list,.scroll_list a,.scroll_base",function(e){
        if(scroll_dnd){
            e.stopPropagation();
            if($(this).hasClass("scroll_base")){
                var obj = $(this).find(".scroll");
            }else{
                var obj = $(this);
            }
            var posY = $(obj).closest(".scroll_base").find(".scroll").offset().top;
            var h1 = $(obj).closest(".scroll_base").find(".scroll_list").height();
            var h2 = $(obj).closest(".scroll_base").find(".scroll_wrap").height();
            var h = $(obj).closest(".scroll_base").find(".scroll").height();
            var pos = e.pageY-posY;
            var prc = pos/h;
            var scroll = prc * (h2-h1);
            var s2=scroll.toFixed();
            var pos = prc*h;

            var r_top = pos-15;
            if(r_top<0)r_top=0;
            if(r_top>h1)r_top=h1;

            $(obj).closest(".scroll_base").find(".scroll_list").animate({scrollTop:s2 * 1.03},{duration:50,queue:false});
            $(obj).closest(".scroll_base").find(".scroll span").animate({top:r_top},{duration:50,queue:false,complete:function(){rscroll();clearInterval(scroll_interval);}});
        }
        return false;
    });

    $(".scroll_list").bind('mousewheel DOMMouseScroll', function(event){
        event.stopPropagation();
        $(".arb_exchanges a.newload").removeClass("newload");
        var h1 = $(this).parent().find(".scroll_list").height();
        var h2 = $(this).parent().find(".scroll_wrap").height();
        var h = $(this).height();
        var prc=($(this).scrollTop()/(h2-h1))*100;
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            prc-=20;
            if(prc<0)prc=0;
        }
        else {
            prc+=20;
            if(prc>100)prc=100;
        }
        var pos = prc/100*$(this).parent().find(".scroll").height();
        var scroll = prc/100 * (h2-h1);
        var s2=scroll.toFixed();
        scroll_interval = setInterval(function(){rscroll();},200);
        $(this).parent().find(".scroll_list").animate({scrollTop:s2 * 1.03},{duration:400,queue:false});
        $(this).parent().find(".scroll span").animate({top:pos * 0.95},{duration:400,queue:false,complete:function(){rscroll();clearInterval(scroll_interval);}});
        return false;
    });
    $(".convert_page .coinslist .scroll_list").scrollTop(0);

    $(".convert_page .bases .types a").click(function(){
        $(".arb_exchanges a.newload").removeClass("newload");
        $(".convert_page .bases .types a").removeClass("active");
        $(this).addClass("active");
        if($(this).hasClass("erc20")){
            $(".convert_page .coinslist,.convert_page .arb_exchanges,.convert_page .bases>.basecoins,.convert_page .arbitage").hide();
            $(".convert_page .coinslist[rel=erc20]").show();
        }
        else if($(this).hasClass("stellar")){
            $(".convert_page .coinslist,.convert_page .arb_exchanges,.convert_page .bases>.basecoins,.convert_page .arbitage").hide();
            $(".convert_page .coinslist[rel=stellar]").show();
        }
        else if($(this).hasClass("waves")){
            $(".convert_page .coinslist,.convert_page .arb_exchanges,.convert_page .bases>.basecoins,.convert_page .arbitage").hide();
            $(".convert_page .coinslist[rel=waves]").show();
        }
        else if($(this).hasClass("eos")){
            $(".convert_page .coinslist,.convert_page .arb_exchanges,.convert_page .bases>.basecoins,.convert_page .arbitage").hide();
            $(".convert_page .coinslist[rel=eos]").show();
        }
        else if($(this).hasClass("basecoins")){
            $(".convert_page .coinslist,.convert_page .arb_exchanges,.convert_page .arbitage").hide();
            $(".convert_page .bases>.basecoins").show();
        }
        else{
            $(".convert_page .coinslist,.convert_page .arb_exchanges,.convert_page .bases>.basecoins").hide();
            var rel = $(".arbitage .coins div.coin.active").attr("rel");
            $(".convert_page .arbitage,.convert_page .arb_exchanges[rel="+rel+"]").show();
        }
        rscroll();
        if(localStorage){
            localStorage.setItem("convert_sel_type",$(this).attr("class").replace("active","").trim());
        }
        return false;
    });

    $("html").on("click",".convert_page .trading_block .control a",function(){
        if($(this).hasClass("down")){
            var ind = $(this).closest(".trading_block").index();
            if(ind<2){
                var block = $(this).closest(".trading_block").clone();
                $(this).closest(".trading_block").remove();
                block.insertAfter($(".convert_page .trading_block").eq(ind));
                $(".trading_block").each(function(){
                    var block = $(this);
                    var index = $(this).find(".spesbuts a.active").index();
                    trading_block_sizing(block,index);
                });
            }
        }
        if($(this).hasClass("up")){
            var ind = $(this).closest(".trading_block").index();
            if(ind>0){
                var block = $(this).closest(".trading_block").clone();
                $(this).closest(".trading_block").remove();
                block.insertBefore($(".convert_page .trading_block").eq(ind-1));
                $(".trading_block").each(function(){
                    var block = $(this);
                    var index = $(this).find(".spesbuts a.active").index();
                    trading_block_sizing(block,index);
                });
            }
        }
        if($(this).hasClass("clos")){
            var ind = $(this).closest(".trading_block").index();
            open_markets.splice(ind, 1);
            if(localStorage){
                localStorage.setItem("open_markets", JSON.stringify(open_markets));
            }
            $(this).closest(".trading_block").remove();
            var block_cnt = $(".trading_block").length;
            if(block_cnt==0){
                $(".trading .nomarket").show();
            }else{
                $(".trading .nomarket").hide();
            }
            if(block_cnt==1){
                $(".trading_block,.convert_page").addClass("only");
                trading_block_sizing($(".trading_block"));
            }
        }
        return false;
    });

    var trading_block = '<div class="trading_block"><div class="control"><a href="" class="clos"><i class="fa fa-fw fa-close"></i></a><a class="up" href=""><i class="fa fa-fw fa-arrow-up"></i></a><a class="down" href=""><i class="fa fa-fw fa-arrow-down"></i></a></div><div class="cont"></div></div>';


    $("html").on("click",".trading_block .loadmy",function(){
        var coin_code = $(".trading_block").attr("rel");
        $(this).closest(".uhist_block").html(loader_small).load("/convert/uhist/?coin_code="+coin_code);
        return false;
    });

    $("html").on("click",".convert_page .coinslist .coins a",function(){
        var c_code = $(this).attr("rel");
        var alr_tr_blocks = $(".trading_block").length;

        if($(".trading_block[rel="+c_code+"]").length){
            $(".trading_block[rel="+c_code+"] .cont").addClass("flash");
            var offs = $(".trading_block[rel="+c_code+"] .cont").offset().top;
            $('html, body').animate({
                scrollTop: parseInt(offs-10)
            }, 400);
            setTimeout(function(){
                $(".trading_block[rel="+c_code+"] .cont").removeClass("flash");
            },1500);
        }else{
            if(localStorage && localStorage.getItem('exchange_onepair') == 'true' && alr_tr_blocks==1){
                $(".trading_block").attr("rel",c_code).find(".cont").html(loader_big).load("/convert/ajax_market/?code="+c_code,function(){
                    if(ws_comp)ws_comp.send(JSON.stringify({action: "subs",code: c_code}));
                });
            }else{
                if(alr_tr_blocks>=3){
                    $(".convert_page .trading .trading_block:first").animate({"opacity":"0"},{duration:540});
                    $(".convert_page .trading .trading_block").slice(0,4).animate({"left":"18%"},{duration:540});
                    $(".convert_page .trading").animate({"top":"-330px"},{duration:540,complete:function(){
                        $(".convert_page .trading").css("top","0");
                        $(".convert_page .trading .trading_block").css("left","0");
                        $(".convert_page .trading .trading_block:first").remove();
                        $(".trading_block").each(function(){
                            var block = $(this);
                            var index = $(this).find(".spesbuts a.active").index();
                            trading_block_sizing(block,index);
                        });
                    }});
                }
                $(trading_block).clone().insertBefore($(".convert_page .trading .nomarket")).attr("rel",c_code).find(".cont").html(loader_big).load("/convert/ajax_market/?code="+c_code,function(){
                    if(ws_comp)ws_comp.send(JSON.stringify({action: "subs",code: c_code}));
                    var offs = $(".trading_block[rel="+c_code+"] .cont").offset().top;
                    setTimeout(function(){
                        $('html, body').animate({
                            scrollTop: parseInt(offs-10)
                        }, 400);
                    },300);
                });
                $(".convert_page,.trading_block").removeClass("only");
            }
            open_markets.shift();
            open_markets.push(c_code);
            if(localStorage){
                localStorage.setItem("open_markets", JSON.stringify(open_markets));
            }
        }
        return false;
    });

    $(".arbitage .coins .coin").click(function(){
        var rel = $(this).attr("rel");
        $(".arbitage .coins .coin").removeClass("active");
        $(this).addClass("active");
        $(".arb_exchanges").hide().filter("[rel="+rel+"]").show();
        $(".arb_exchanges a.newload").removeClass("newload");
        rscroll();
    });

    if($(".updating .tmt").length){
        upd_tmt_bar($(".updating .tmt"));
    }

    $(".lottery_buy").submit(function(){
        operate_form($(this),function(form,ret){
            if(ret.success){
                $(form).find(".ticketb").html(ret.success + ' <span class="digits"></span>');
                var i=1;
                String(ret.digits).split("").forEach(function(el){
                    $(form).find(".ticketb .digits").append('<span class="d">'+el+'</span>');
                    if(storage && localStorage.getItem('anim') == 'true'){
                        $(form).find(".ticketb .digits .d:last").css("top","-80px").animate({"top":"0px"},700*i);
                    }
                    i+=1;
                });
                var cur = Number($(".curtickets").text());
                $(".curtickets").text(cur+1);
            }
        });
        return false;
    });


    var all_slot_imgs = '<span class="icon s1"></span><span class="icon s2"></span><span class="icon s3"></span><span class="icon s4"></span><span class="icon s5"></span><span class="icon s6"></span><span class="icon s7"></span><span class="icon s8"></span><span class="icon s9"></span><span class="icon sa"></span><span class="icon sb"></span><span class="icon sc"></span><span class="icon sd"></span><span class="icon se"></span><span class="icon sf"></span>';
    $(".latest_slot form").submit(function(){
        $(this).find(".spin button").prop("disabled",true);
        operate_form($(this),function(form,ret){
            if(ret.success){
                waiting_slot_result = true;
                if(!$(".slots_nosound").hasClass("red"))play_sound("cosmos.mp3");
                $(".latest_slot .one").each(function(){
                    var obj = this;
                    $(this).html(all_slot_imgs);
                    $(this).scrollTop(0);
                    var speed = getRandom(3900, 5900);
                    var dist = getRandom(1000, 1300);
                    $(this).animate({'scroll-top': String(dist)+"px"},{duration:speed,complete:function(){
                        var speed2 = getRandom(4200, 6500);
                        var dist2 = getRandom(0, 200);
                        $(this).animate({'scroll-top':String(dist2)+"px"},{duration:speed2,complete:function(){
                            var speed3 = getRandom(5500, 6500);
                            var dist3 = getRandom(1000, 1300);
                            $(this).animate({'scroll-top':String(dist3)+"px"},{duration:speed3,complete:function(){
                                var speed4 = getRandom(6500, 8500);
                                $(this).animate({'scroll-top':"200px"},speed4);
                            }});
                        }});
                    }});
                });
                $(".play_state").html("<u>"+ret.success+"</u>");
            }else{
                $(".latest_slot .spin button").prop("disabled",false);
                if(ret.err){
                    $(".latest_slot .err").html("<u>"+ret.err+"</u>");
                }
            }
        });
        return false;
    });

    $(".latest_slot .lines span").hover(function(){
        var ind = Math.floor($(this).index()/2)+1;
        $(".latest_slot .lines").find("i[class^='ln"+String(ind)+"']").css("opacity","1");
    },function(){
        $(".latest_slot .lines i").css("opacity","0.1");
    });

    var slots_space_launch;
    $(".latest_slot").mouseenter(function(){
        slots_space_launch=true;
        $(".latest_slot form .spin button").addClass("ready");
    });

    $(".latest_slot").mouseleave(function(){
        slots_space_launch=false;
        $(".latest_slot form .spin button").removeClass("ready");
    });

    if($(".latest_slot").length){
        $("body").keyup(function(e){
            if(e.keyCode == 32 && slots_space_launch){
                $(".latest_slot form .spin button").click();
                return false;
            }
        });
    }

    $(".latest_slot .lines span").click(function(){
        $(this).toggleClass("disabled");
        var enabled = [];
        $(".latest_slot .lines span").each(function(i,v){
            if(!$(this).hasClass("disabled"))enabled.push(i+1);
        });
        $("form.res input[name=lines]").val(enabled.join(","));
        var one = 0.01;
        var total = one * enabled.length;
        $(".bet .bet_total span").html(total.toFixed(2));
        $(".latest_slot .choosen span").html(String(enabled.length));
    });

    $(".betting_form").submit(function(){
        operate_form($(this),function(form,ret){
            if(ret.success){
                $(form).find(".betting_form").html(ret.success);
            }else{
                $(form).find(".betting_form .err").html(ret.err);
            }
        });
        return false;
    });

    $(".betting_form select[name=type]").change(function(){
        var val = $(this).find("option:selected").val();
        if(val!="free"){
            $(".betting_form .amount").show().find(".coin .c").removeClass();
            $(".betting_form .amount .coin>span").addClass("c").addClass(val);
            var bet_amnt = $(this).find("option:selected").attr("rel");
            $(".betting_form .amount i").html(bet_amnt);
        }else{
            $(".betting_form .amount").hide();
        }
    });

    $(".betting_form select[name=type]").trigger("change");

    $("table.betting tr td:not(:first-child)").click(function(e){
        $(this).closest("tr").find("input[type=radio]").prop("checked",true);
    });


    $(".musicbox .play,.musicbox .stop").click(function(){
        play_music();
        $(".musicbox .play,.musicbox .stop").toggle();
        return false;
    });

    $(".musicbox .checkbox_setting input[type=checkbox]").change(function(){
        if(localStorage)localStorage.setItem("music_continue",this.checked);
    });


    setTimeout(need_sleep,5000);

    $("html").on("click keyup","*",function(){
        last_ac = new Date();
    });



    $("html").on("submit",".answerform",function(){
        operate_form($(this),function(form,ret){
            if(ret.error)alert(ret.error);
            else $(".quorumload").html(ret);
        });
        return false;
    });


    $('.datepicker').datepicker({autoclose: true, format: "dd.mm.yyyy"}).on("changeDate", function(e) {
        window[$(this).attr("rel")]($(this),e.date);
    });

    $(".prev_betting select").change(function(){
        var vl = $(this).val();
        if(vl=="showdatepicker"){
            $(this).closest(".prev_betting").find(".selectdate").show();
        }else{
            $(this).closest(".prev_betting").find(".selectdate").hide();
            prev_date_bet($(this),vl);
        }
    });

    $(".prev_betting select option:first").prop("selected",true);


    $(".prev_lotteries select").change(function(){
        var vl = $(this).val();
        var url = $(this).closest("select").attr("rel");
        $.get(url,{id:vl},function(ret){
            $(".prev_lotteries .content").html(ret);
        });
    });
    $(".prev_lotteries select option:first").prop("selected",true);

    $("html").on("click",".msgs_page .list a",function(){
        $(".msgs_page .list a").removeClass("active");
        $(this).addClass("active").removeClass("notread");
        var full_url = $(this).attr("href");
        var url = $(this).attr("rel");
        $.get(url,{},function(ret){
            $(".msgs_page .opened").html(ret);
            $(".msgs_page .opened .msgs").scrollTop($(".msgs_page .opened .msgs")[0].scrollHeight);
            $(".msgs_page form textarea").focus();
            window.history.pushState({"html":$("html").html(),"pageTitle":$(document).attr("title")},"", full_url);
        });
        return false;
    });

    if($(".msgs_page .opened").length){
        $(".msgs_page .opened .msgs").scrollTop($(".msgs_page .opened .msgs")[0].scrollHeight);
        $(".msgs_page .list a.active.notread").removeClass("notread");
    }

    $(".msgs_page .type a").click(function(){
         $(".msgs_page .type a").removeClass("active");
         $(this).addClass("active");
         var rel=$(this).attr("rel");
         $(".msgs_page .list").hide();
         $(".msgs_page .list[rel="+rel+"]").show();
         return false;
    });

    $("html").on("submit",".msgs_page form",function(){
        operate_form($(this),function(form,ret){
            if(ret.success){
                $(form).find("textarea").val("");
                $(".msgs_page .users .list a.active").trigger("click");
            }else{
                $(form).find(".err").html(ret.err);
            }
        });
        return false;
    });

    $("html").on("keyup",".msgs_page form textarea",function(e){
        if (e.keyCode == 13) {
            if(e.shiftKey){
                $(this).closest("form").submit();
            }
        }
    });

    $("html").on("click",".msgs_page button.spes",function(e){
        $(this).closest("form").find(".spes_menu").toggle();
        $(this).closest("form").find(".spes_menu input[type=checkbox]").prop("checked",false);
    });

    $("html").on("click",".msgs_page .spes_menu a",function(e){
        var url = $(this).attr("href");
        if($(this).closest(".spes_menu").find("input[type=checkbox]").prop("checked"))url += "&block=1";
        $(this).closest(".spes_menu").html(loader_small).load(url);
        return false;
    });




    $(".admstatlog").click(function(){
        $(".log").load($(this).attr("href"));
        return false;
    });

    $(".pan select").change(function(){
        if(localStorage){
            var num = $(this).closest(".dblock").attr("rel");
            localStorage.setItem("collect_networksel"+String(num),$(this).val());
            collect_apply_filter();
        }
    });

    if(localStorage && localStorage.getItem("collect_networksel1")){
        $(".dblock[rel=1] .pan select").find("option[value="+localStorage.getItem("collect_networksel1")+"]").prop("selected",true);
    }

    $("html").on("change",".collect_page .all .upload .upl input",function(){
        //console.log(this.files);
        data = new FormData($(this).closest("form").get(0));
        var form = $(this).closest("form");
        //console.log($(this).closest(".upl").attr("rel"));
        form.find(".upl span").html("<u>Uploading</u>");
        $.ajax({
            url: $(this).closest(".upl").attr("rel"),
            method: "post",
            data: data,
            processData: false,
            contentType: false,
            success: function(data){ form.html(data); },
            error: function(data){alert("Server error");},
        });
    });



    $("html").on("click",".collect_page .all .upload a.del",function(){
        var form = $(this).closest("form");
        $.get($(this).attr("href"),function(data){
            form.html(data);
        });
        return false;
    });

    $("html").on("submit",".draft form",function(){
        operate_form($(this),function(form,ret){
            if(ret.success){
                $(".draft form .saved").show().fadeOut(3500);
            }
        });
        return false;
    });

    var col_draft_tmt = null;
    function save_col_draft()
    {
        if(col_draft_tmt)clearTimeout(col_draft_tmt);
        col_draft_tmt = setTimeout(function(){
            $(".draft form").trigger("submit");
        },3000);
    }

    $("html").on("keyup change",".draft form textarea",function(){
        save_col_draft();
    });

    $("html").on("click",".collect_page .all .actions a[rel]",function(){
        var rel = $(this).attr("rel");
        $(".collect_page .all .actions a").removeClass("sel");
        $(this).addClass("sel");
        $(".collect_page .all .bl").hide();
        $(".collect_page .all .bl[rel="+rel+"]").show();
        return false;
    });

    $("html").on("click",".collect_page .all .actions a.submit_task",function(){
        var txt = $(".draft form textarea").val();
        $(".draft form").trigger("submit");
        $(".confirm_submit").toggle();
        $(".confirm_submit .short").toggle(txt.length<20);
        $(".confirm_submit .normal").toggle(txt.length>=20);
        return false;
    });

    $(".confirm_submit button[type=button]").click(function(){
        $(this).closest("form").hide();
        return false;
    });

    $("html").on("click",".collect_page .actions2 a",function(){
        var rel = $(this).attr("rel");
        if(rel){
            $(".confirm_reject").hide();
            $(".confirm_reject[rel="+rel+"]").show();
            return false;
        }
    });

    $("html").on("click",".collect_page button.cancel",function(){
        $(this).closest("form").hide();
        return false;
    });

    $("html").on("click",".rejtaskcheck form button",function(){
        var rel = $(this).attr("rel");
        $(this).closest("form").find("input[name=res]").val(rel);
        var f = $(this).closest("form");
        var bl = $(this).closest(".log");
        operate_form(f,function(ret){
            bl.html(ret);
        });
        return false;
    });

    $("html").on("mousedown",".improve_tr_block .movewn",function(){
        trmove=true;
        return false;
    });

    $("html").on("mousemove","body",function(e){
        if(trmove){
            var w = $(".improve_tr_block").width();
            var h = $(".improve_tr_block").height();
            $(".improve_tr_block").css("top",(e.pageY)+"px").css("left",(e.pageX-w)+"px");
        }
    });

    $("html").on("click", "a.tr_page_title",function(e){
        var title = $(document).prop('title');
        $(".improve_tr_block textarea:first").val(title);
        return false;
    });

     if($(".bal_coins").length && location.hash.indexOf("referals")>=0){
        $(".userinfo .line_menu li:last a").click();
    }

    $("html").on("change", ".hidefl input",function(e){
        $(".quorumload .quoruml").show();
        if($(this).prop("checked")){
            lang=localStorage.getItem('lang');
            $(".quorumload .quoruml").hide();
            $(".quorumload .quoruml[rel="+lang+"]").show();
            localStorage.setItem('hidefl',true);
        }else{
            localStorage.setItem('hidefl',false);
        }
    });

    if($(".hidefl input").length && localStorage && localStorage.getItem('hidefl') == "true"){
        $(".hidefl input").prop("checked",true).trigger("change");
    }

    $(".token_t form").submit(function(){
        operate_form($(this),function(form,ret){
                form.find(".check_state").html(ret);
            });
        return false;
    });

    $(".slots_page .showhide,.carry_page .showhide").click(function(){
        $(this).closest("div").find(".showhidebl").toggle();
        if(localStorage){
            var blid = $(this).attr("rel");
            if($(this).closest("div").find(".showhidebl:visible").length){
                localStorage.removeItem("hidebl"+blid);
            }else{
                localStorage.setItem("hidebl"+blid,"1");
            }
        }
        return false;
    });

    if(localStorage){
        $(".slots_page .showhide,.carry_page .showhide").each(function(){
            var blid = $(this).attr("rel");
            if(localStorage.getItem("hidebl"+blid))$(this).click();
        });
    }

    $("html").on("click",".slots_page .slots_nosound",function(){
        $(this).toggleClass("red");
        if($(this).hasClass("red")){
            if($(".latest_res").length)$(".latest_res").attr("rel",$(".latest_res").attr("rel").replace("sound=yes","sound=no"));
        }else{
            if($(".latest_res").length)$(".latest_res").attr("rel",$(".latest_res").attr("rel").replace("sound=no","sound=yes"));
        }
        return false;
    });

    $(".detect_loc").click(function(){
        getLocation();
    });

    $(".del_rad").change(function(){
        var vl = Number($(this).val());
        var zoom = 13;
        if(vl>=4)zoom=12;
        if(vl>9)zoom=11;
        var lat = Number($("#lat").val());
        var lon = Number($("#lon").val());

        var lf_lan = Number(Number(lat - (vl/110.574)).toFixed(3))
        var rg_lan = Number(Number(lat + (vl/110.574)).toFixed(3))
        var tp_lon = Number(Number(lon - (vl/111.320)).toFixed(3))
        var tb_lon = Number(Number(lon + (vl/111.320)).toFixed(3))

        console.log("coords",lf_lan,rg_lan,tp_lon,tb_lon)

        gmap = new google.maps.Map(document.getElementById('map'), {
          center: {lat: lat, lng: lon},
          zoom: zoom
        });
        $(".delmap#map").show();

        var redCoords = [
          {lat: lf_lan, lng: tp_lon},
          {lat: rg_lan, lng: tp_lon},
          {lat: rg_lan, lng: tb_lon},
          {lat: lf_lan, lng: tb_lon},
        ];

        new google.maps.Polygon({
          map: gmap,
          paths: redCoords,
          strokeColor: '#432a8e',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#432a8e',
          fillOpacity: 0.35,
          draggable: false,
          geodesic: true
        });

        $(".cur_customers").show();
        $.get("/carry/ajax_check_customers/?lf_lan="+String(lf_lan)+"&rg_lan="+String(rg_lan)+"&tp_lon="+String(tp_lon)+"&tb_lon="+String(tb_lon),function(ret){
            $(".cur_customers i").html(ret);
        });

    });

    /*$(".carry_page .line_menu a").click(function(){
        var rel = $(this).attr("rel");
        if(rel){
            $(".shopform").hide();
            $(this).addClass("active");
            $(".carry_page .line_menu a").removeClass("active");
            $(".shopform[rel="+rel+"]").show();
            return false;
        }
    })*/

    $(".carry_page .item_purchase").submit(function(){
        operate_form($(this),function(form,ret){
            if(ret.err)form.find(".err").html(ret.err);
            if(ret.success){
                form.find(".err").removeClass("red").addClass("green").html(ret.success);
                location.href = ret.link;
            }
        });
        return false;
    });

    $(".carry_page .see_my_items").click(function(){
        $(this).closest(".one_shop").find(".itemsforload").show().html(loader_small).load($(this).attr("href"));
        return false;
    });

    $("html").on("click",".carry_page .allshops .state .suspendshop",function(){
        var url = $(this).attr("href");
        $(this).closest(".state").html(loader_small).load(url);
        return false;
    });

    $("html").on("click",".carry_page .dig_invoice",function(){
        $(this).closest("form").find(".forload").load($(this).attr("rel"));
    });

    $("html").on("change",".addphoto input",function(e){
        $(this).closest("td").find(".choosen i").html(this.files.length);
    });

    if($(".itemaddform").length){
        var eqspan = $('<span id="eq"> <u>~</u> <i></i> USD</span>');
        eqspan.insertAfter("#id_price");
        var coinprice = Number($(".priceinfo").attr("rel").replace(" ",""));
        $("#id_price").on("click keyup keydown change",function(){
            var v = $(this).val();
            $("#eq i").html(coinprice*v);
        });
    }

    $(".choose_preview").click(function(){
        $(this).parent().find(".choose").toggle();
    });

    $(".itemimgs .oneimg").click(function(){
        if($(".choose_preview .choose:visible").length){
            $(".itemimgs .oneimg").removeClass("redbord");
            $(this).addClass("redbord");
            $("input[name=preview]").val($(this).index()-1);
            return false;
        }
    });

    $(".orders_to_do .confnot").click(function(){
        $(this).closest("form").find(".conf").toggle();
        return false;
    });

    $(".orders_to_do .conf button[type=button]").click(function(){
        $(this).closest("form").find(".conf").toggle();
        return false;
    });

    $(".orders_to_do form").submit(function(){
        operate_form($(this),function(form,ret){
            if(ret.err)alert(ret.err);
            if(ret.ret)form.closest(".actions").html(ret.ret);
        });
        return false;
    });

    $(".conf_del_form i").click(function(){
        var ind = $(this).index()+1;
        $(this).parent().find("i").removeClass("fa-star").addClass("fa-star-o");
        $(this).parent().find("i").slice(0,ind).removeClass("fa-star-o").addClass("fa-star");
        $(this).closest("form").find("input[name=rate]").val(ind);
        $(this).closest("form").find("button[type=submit]").prop("disabled",false);
        return false;
    });

    $("html").on("keyup keydown change",".refuse_form textarea",function(){
        $(this).closest("form").find("button[type=submit]").prop("disabled",false);
    });

    $(".confirm_delivery").click(function(){
        $(".conf_del_form").show();
        $(".refuse_form").hide();
    });

    $(".delivery_problem").click(function(){
        $(".conf_del_form").hide();
        $(".refuse_form").show();
    });

    $(".addtocart").click(function(){
        $(this).closest("form").find("input[name=tocart]").val("1");
        $(this).closest("form").submit();
    });

    $(".deliv_form .cancel").click(function(){
        $(this).closest("form").find("input[name=cancel]").val("1");
        $(this).closest("form").submit();
    });

    $(".carry_page select[name=payin]").change(function(){
        $(".allcoinstable td").hide();
        $(".allcoinstable").find("."+$(this).val()).show();
    });

    $(".carry_page .payin_nonpaid select").change(function(){
        $(".payin_nonpaid .opc").hide();
        $(".payin_nonpaid").find("."+$(this).val()).show();
    });

    $("html").on("change",".shops_filter .shoptype",function(){
        shop_search();
    });

    $("html").on("click",".shops_filter .searchshop",function(){
        shop_search();
    });

    $("html").on("keyup change",".cartform input",function(){
        $(this).closest(".cartform").find(".change").show();
    });

    var ajax_token_tmt = null;
    function ajax_token_parse(block,t,token_id,issuer_id)
    {
        block.load("/ajax_token_parse/?t="+String(t)+"&id="+String(token_id)+"&issuer_id="+String(issuer_id));
    }

    $("html").on("keyup change input propertychange",".add_token input#id_token_id,.add_token input#id_issuer_id,.add_token .token_type",function(){
        var token_id = $(this).closest("form").find("#id_token_id").val();
        var issuer_id = $(this).closest("form").find("#id_issuer_id").val();
        if(token_id.length>2){
            var t = $(this).closest("form").find(".token_type").val();
            $(this).closest("form").find(".check").show().find(".forload").html(loader_small);
            var block = $(this).closest("form").find(".check").show().find(".forload");
            if(ajax_token_tmt)clearTimeout(ajax_token_tmt);
            ajax_token_tmt = setTimeout(function(){
                ajax_token_parse(block,t,token_id,issuer_id);
            },900);
        }
    });

    $("html").on("click",".bal_tokens button.wd",function(){
        var url = $(this).attr("rel");
        $(this).closest(".forload").html(loader_big).load(url);
        return false;
    });

    $("html").on("click",".uhist .quick_access button.dep",function(){
        var url = $(this).attr("rel");
        $(this).parent().find(".forload").html(loader_big).load(url);
        return false;
    });

    $("html").on("click",".uhist .quick_access .cancel",function(){
        $(this).closest(".forload").html("");
        return false;
    });


    $("html").on("click",".ln_dep div.paid button",function(){
        $(this).prop("disabled",true);
        $(this).find(".txt").hide();
        $(this).find(".spinner").show();
        var t = $(this);
        $.get($(this).attr("rel"),function(ret){
            t.prop("disabled",false);
            t.find(".txt").show();
            t.find(".spinner").hide();
            if(ret.err){
                $(".ln_dep .paid .err").html(ret.err);
            }
            if(ret.success){
                $(".ln_dep,.expire_in").hide();
                $(".dep_found").show().find("b").html(ret.success);
            }
        });
    });

    $("html").on("click",".special_offer_popup .buttons button",function(){
        $(".special_offer_popup").hide();
        var accept_url = $(this).closest(".buttons").attr("rel");
        var redir_url = $(this).attr("rel");
        $.get(accept_url,function(){
            if(redir_url){
                location.href = redir_url;
            }
        });
        return false;
    });


    //before all

    user_pk = Number($(".k_user").attr("rel"));

    if(user_pk){
        $("html").on("click touchstart",".chat i.fa-address-book",function(){
            $(".tooltips").find(".content").html(chat_c_menu);
            var user_id = $(this).closest("div").attr("rel");

            $(".tooltips").find(".content a").each(function(){
                if($(this).attr("href").substr(-1)=="=")$(this).attr("href",$(this).attr("href")+String(user_id));
            });
            var pos=$(this).offset();
            var height=$(".tooltips").height();
            var pos_result = Number(pos.top-(height/2)+7).toFixed(0);
            if($(".tooltips:visible").length){
                if($(".tooltips").css("top") == pos_result+"px"){
                    $(".tooltips").fadeOut();
                    return false;
                }
            }
            $(".tooltips").fadeIn(150).css({"left":pos.left+20,"top":pos_result+"px"});
        });

        $("html").on("click touchstart",".chat .nick",function(ev){
            var msg = $(".chat form textarea").val();
            var nick = $(this).text();
            $(".chat form textarea").val("@"+nick.slice(0,-1)+" "+msg).focus();
            var tmpStr = $(".chat form textarea").val();
            $(".chat form textarea").val('');
            $(".chat form textarea").val(tmpStr);
            ev.preventDefault();
        });
    }

    $("html").on("click",".alert>button",function(){
        $(this).parent().find(".report").toggle();
    });

    $("html").on("submit",".alert .report",function(e){
        e.stopPropagation();
        operate_form($(this),function(form,ret){
            if(ret)form.closest(".alert").html(ret);
        });
        return false;
    });

    $("html").on("click",".alert .cancel",function(){
        $(this).closest(".report").hide();
        return false;
    });

    $("html").on("click","header .login a",function(){
        var rel = $(this).attr("rel");
        if(rel){
            $(this).toggleClass("toggled");
            if($(".logregblock."+rel+":visible").length){
                $(".logregblock").hide();
            }else{
                $(".logregblock").hide();
                $(".logregblock."+rel).show();
            }
            return false;
        }
    });

    $("html").on("click","main .toreg",function(){
        $(".logregblock").hide();
        $(".logregblock.reg").show();
        $("html,body").scrollTop(0);
        return false;
    });

    $(".logregblock form").submit(function(){
        var addparams="";
        if($(".logregblock.reg:visible").length)addparams="conf";
        operate_form($(this),function(form,ret){
            if(ret.err){
                form.find(".err").html(ret.err);
                $(".login tr").hide();
                $(".login tr:not(.register_confirm):not(.captcha)").show();
                translate(form);
            }
            if(ret.state=="need2fa"){
                $(".logregblock").hide();
                $(".logregblock.key2fa").toggle();
                $(".logregblock.key2fa input[name=key2fa]").focus();
            }
            if(ret.state=="email_conf_code"){
                $(".logregblock").hide();
                $(".logregblock.conf").show();
            }
            if(ret.state=="logined"){
                if(ret.next)location.href=ret.next;
                else location.href="/player/";
            }
            if(ret.state=="not_found"){
                $(".login:not(.login2fa):not(.email_conf_code):not(.restore) tr").toggle();
                $(".login tr.captcha").hide();
            }
            if(ret.state=="captcha"){
                $(".logregblock").hide();
                $(".logregblock.captcha").show();
                $(".logregblock.captcha img").attr("src",ret.captcha);
                $(".logregblock.captcha input[name=email]").val(ret.email);
                $(".logregblock.captcha input[name=username]").val(ret.username);
                $(".logregblock.captcha input[name=password]").val(ret.password);
                $(".logregblock.captcha input[name=captcha_key]").val(ret.captcha_key);
            }
        },"addparams="+addparams);
        return false;
    });

    $(".restore_password").click(function(){
        $(".logregblock").hide();
        $(".logregblock.restore").show();
        return false;
    });

    $(".menu .prefs").click(function(){
        $(".overlay").fadeIn(300);
        $(".win_settings").show(400).html(loader_big).load("/settings/",show_settings);
        play_sound("click.mp3");
        return false;
    });

   $("html").on("click",".menu a:not(.prefs):not(.close):not(.return):not(.win_settings .menu a),.ajaxlink",function(){
        var page = $(this).attr("rel");
        var full_url = $(this).attr("href");
        $("main .wrap").html(loader_big).load("/ajax_"+page+"/",function(){
            window.history.pushState({"html":$("main .wrap").html(),"pageTitle":$(document).attr("title")},"", full_url);
        });
        return false;
    });

    $("html").on("submit",".playerpage_form",function(e){
        e.stopPropagation();
        $("main .wrap").html(loader_big);
        operate_form($(this),function(form,ret){
            $("main .wrap").html(ret);
        });
        return false;
    });

    $("html").on("click",".helptable .leftsections a",function(e){
        if($(this).hasClass("secti")){
            $(".helptable .leftsections a.sub").hide();
            $(this).nextUntil(":not(.sub)").show().css("display","block");
            $(this).next(".sub").click();
        }else{
            $(".helptable .leftsections a").removeClass("sel");
            if($(this).hasClass("sub")){
                $(this).prevAll(".secti").eq(0).addClass("sel");
            }
        }
        $(this).addClass("sel");
        var rel = $(this).attr("rel");
        if(rel){
            $(".helptable .info>div").addClass("hide");
            $(".helptable .info ."+rel).removeClass("hide");
        }
        return false;
    });

    $("html").on("click",".helptable .itemsall .cont div",function(e){
        var rel = $(this).attr("rel");
        $(this).closest("table").find(".itemdetail").html(loader_big).load("/ajax_item_detail/?rel="+rel);
        $(this).find(".new").hide();
    });

    $("html").on("click",".betpage_form .difficulty span",function(e){
        if($(".betpage_form .difficulty").hasClass("lock"))return false;
        var ind = $(this).index();
        $(".betpage_form .difficulty span").removeClass("sel");
        $(".betpage_form .difficulty span").slice(0,ind).addClass("sel");
        $(".betpage_form .difficulty input[type=hidden]").val(ind);
        $(".betbutblock b").text($(this).attr("rel"));
    });

    $("html").on("submit",".betpage_form",function(e){
        if($(".betpage_form .difficulty").hasClass("lock"))return false;
        $(".rollhuntb span.hunt").fadeOut(500);
        $(".betpage_form .betbutblock button u").toggleClass("hide");
        $(".betpage_form .difficulty").addClass("lock");
        operate_form($(this),function(form,ret){
            form.closest(".betpage_form").find(".result").html(ret);
            if(ret.indexOf("Bet accepted")==-1){
                $(".betpage_form .difficulty").removeClass("lock");
                $(".betpage_form .betbutblock button u").toggleClass("hide");
            }else{
                $(".betpage_form .difficulty").addClass("done");
            }
        });
        return false;
    });

    $("html").on("click",".item_detail_block .actions button",function(e){
        var url = $(this).closest("form").attr("action");
        var data = $(this).closest("form").serialize();
        if($(this).hasClass("cook")){
            var page = "cook";
            var id = $(".item_detail_block .actions").find("input[name=id]").val();
            $("main .wrap").html(loader_big).load("/ajax_"+page+"/?id="+id);
            return false;
        }
        data += "&action=" + $(this).attr("rel");
        $.post(url,data,function(ret){
            if(ret.success){$(".item_detail_block .use_result").removeClass("red").html(ret.text);$(".item_detail_block .actions").hide();}
            if(ret.error)$(".item_detail_block .use_result").addClass("red").html(ret.text);
            if(ret.del_item){
                var id = $(".item_detail_block .actions").find("input[name=id]").val();
                $("#item"+id).remove();
            }
            if(ret.refr_inventory){
                var page = "inventory";
                $("main .wrap").html(loader_big).load("/ajax_"+page+"/");
            }
        });
        return false;
    });

    $("html").on("click",".cook_buttons .redb",function(e){
        var page = $(this).attr("page");
        $("main .wrap").html(loader_big).load("/ajax_"+page+"/");
        return false;
    });

    $("html").on("click",".cook_buttons .greenb",function(e){
        var page = $(this).attr("page");
        var id = $(this).attr("rel");
        $("main .wrap").html(loader_big).load("/ajax_"+page+"/?id="+id+"&confirm=1");
        return false;
    });

     $("html").on("click",".buybets",function(e){
        var page = "buy_bets";
        $("main .wrap").html(loader_big).load("/ajax_"+page+"/");
        return false;
    });


    $("html").on("click",".buybet_prices button",function(e){
        $(".buybet_prices button").removeClass("sel");
        $(this).addClass("sel");
        var price = $(this).attr("rel");
        var coin_code = $(this).closest("div").attr("rel");
        $(".buybet_prices input[name=coin_code]").val(coin_code);
        $(".buybet_amount total i").text(coin_code);
        var amount = $(".buybet_amount input").val();
        var sum = amount * price;
        $(".buybet_amount .total").html(sum.toFixed(2) + " " + coin_code);
        return false;
    });

    $("html").on("keyup",".buybet_amount input",function(e){
        var amount = $(".buybet_amount input").val();
        var price = $(".buybet_prices button.sel").attr("rel");
        if(price){
            var sum = amount * price;
            var coin_code = $(".buybet_prices button.sel").closest("div").attr("rel");
            $(".buybet_amount .total").html(sum.toFixed(2) + " " + coin_code);
        }
    });

    $("html").on("click touchstart",".betpage_prev .share",function(e){
        var msg = "BET:" + $(this).attr("rel");
        $("aside .chat form textarea").val(msg);
        e.preventDefault();
        return false;
    });

    $("html").on("submit",".buybetform",function(e){
        operate_form($(this),function(form,ret){
            form.find(".buybet_amount .result").html(ret);
            if(ret.indexOf("Bought")>=0){
                var page = "player";
                $("main .wrap").html(loader_big).load("/ajax_"+page+"/");
            }
        });
        return false;
    });

    $("html").on("submit",".secretshop form",function(e){
        operate_form($(this),function(form,ret){
            $("main .wrap").html(ret);
        });
        return false;
    });


    $("html").on("click",".onesmile",function(e){
        var msg = $(".chat form textarea").val();
        var smile = $(this).text();
        $(".chat form textarea").val(msg+smile).focus();
        var tmpStr = $(".chat form textarea").val();
        input.val('');
        input.val(tmpStr);
    });

    $("html").on("click",".create_rain .close",function(e){
        $(".create_rain").hide();
        return false;
    });

    $("html").on("click",".chat .makerain",function(e){
        $(".create_rain").show();
        return false;
    });

    $("html").on("click",".chat .tip",function(e){
        $(".create_tip").show();
        return false;
    });

    $("html").on("click",".chat .chatinfo",function(e){
        $(".chat_rules").show();
        return false;
    });


    $("html").on("click",".chat .voicemsg",function(e){
        $(".send_voice_msg").show();
        return false;
    });

    $("html").on("click",".send_voice_msg .close",function(e){
        $(".send_voice_msg").hide();
        if(media_stream)media_stream.getTracks().forEach(track => track.stop());
        return false;
    });


    $("html").on("click",".create_tip .close",function(e){
        $(".create_tip").hide();
        return false;
    });

    $("html").on("click",".chat_rules .close",function(e){
        $(".chat_rules").hide();
        return false;
    });

    $("html").on("submit",".create_rain form",function(e){
        operate_form($(this),function(form,ret){
            form.find(".result").html(ret);
        })
        return false;
    });

    $("html").on("submit",".create_tip form",function(e){
        operate_form($(this),function(form,ret){
            form.find(".result").html(ret);
        })
        return false;
    });

    $("html").on("click",".training_block .greenb:first",function(e){
        $(".training_block .rules").toggleClass("hide");
        return false;
    });

    $("html").on("click",".training_block .training_form .choose span",function(e){
        $(".training_block .training_form .choose span").removeClass("sel");
        $(this).addClass("sel");
        $(".training_form input[name=num]").val($(this).attr("rel"));
        return false;
    });

    $("html").on("click",".training_form button",function(e){
        $(this).closest("form").find("input[name=type]").val($(this).attr("rel"));
        operate_form($(this).closest("form"),function(form,ret){
            console.log(ret);
            if(ret.err)form.find(".result").html(ret.err);
            if(ret.success)$("main .wrap").html(loader_big).load("/ajax_training/");
        })
        return false;
    });

    $("html").on("click","a.seeprofile,a.ban",function(e){
        var href = "/ajax" + $(this).attr("href");
        $("main .wrap").html(loader_big).load(href);
        return false;
    });



    $("html").on("click",".map_map>div",function(e){
        $(".map_info").show();
        var data = $(this).attr("rel").split("|");
        $(".map_info .loc_name").html(data[0]);
        $(".map_info .loc_spes").html(data[1]);
        $(".map_info .infot").attr("rel",data[2]);

        var cur_loc = $(".map_info").attr("rel");
        if(data[3].indexOf(cur_loc)>=0){
            $(".map_info .go").show();
            $(".map_info input[name=loc]").val(data[4]);
            $(".map_info .noway").hide();
        }else{
            $(".map_info .go").hide();
            $(".map_info .noway").show();
        }

        if($(this).hasClass("here"))$(".map_info .noway").hide();
        $(".map_info u").removeAttr("old");
        translate($(".map_info"));
    });

    $("html").on("submit",".map_info .go",function(e){
        operate_form($(this),function(form,ret){
            if(ret.success){
                $(".total_overlay img").attr("src","/static/img/loc"+ret.new_loc_num+".jpg");
                $(".total_overlay .loc_title u").html(ret.new_loc_title);
                $(".total_overlay img").attr("rel",String(ret.new_loc_num));
                $(".total_overlay").show();
                $(".total_overlay u").removeAttr("old");
                translate($(".total_overlay"));
            }
        })
        return false;
    });

    $("html").on("click",".slot_cor .amounts button",function(e){
        $(".slot_cor .amounts button").removeClass("sel");
        $(this).addClass("sel");
        $(".slot_cor form input[name=bet]").val($(this).attr("rel"));
        return false;
    });


    $("html").on("click",".slot_cor .show_lines button",function(e){
        var canv = document.getElementById("slotcorcanv");
        var ctx = canv.getContext("2d");
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        ctx.beginPath();
        ctx.strokeStyle = "#ED1010";
        ctx.lineWidth = 5;
        ctx.moveTo(40, 100);
        ctx.lineTo(180, 100);
        ctx.lineTo(420, 100);
        ctx.lineTo(540, 100);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#ED1010";
        ctx.fillText("1", 10, 105);

        ctx.moveTo(40, 220);
        ctx.lineTo(180, 220);
        ctx.lineTo(420, 220);
        ctx.lineTo(540, 220);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#ED1010";
        ctx.fillText("2", 10, 230);

        ctx.moveTo(40, 340);
        ctx.lineTo(180, 340);
        ctx.lineTo(420, 340);
        ctx.lineTo(540, 340);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#ED1010";
        ctx.fillText("3", 10, 355);


        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#64c4ea";
        ctx.moveTo(40, 200);
        ctx.lineTo(260, 200);
        ctx.lineTo(420, 120);
        ctx.lineTo(540, 120);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#64c4ea";
        ctx.fillText("4", 10, 200);


        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#64c4ea";
        ctx.moveTo(40, 240);
        ctx.lineTo(260, 240);
        ctx.lineTo(420, 320);
        ctx.lineTo(540, 320);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#64c4ea";
        ctx.fillText("5", 10, 260);


        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#31a037";
        ctx.moveTo(40, 120);
        ctx.lineTo(260, 120);
        ctx.lineTo(420, 240);
        ctx.lineTo(540, 320);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#31a037";
        ctx.fillText("6", 10, 135);

        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#31a037";
        ctx.moveTo(40, 320);
        ctx.lineTo(260, 320);
        //ctx.lineTo(420, 240);
        ctx.lineTo(540, 120);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#31a037";
        ctx.fillText("7", 10, 325);

        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#e234a8";
        ctx.moveTo(40, 270);
        ctx.lineTo(260, 110);
        ctx.lineTo(420, 110);
        ctx.lineTo(540, 110);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#e234a8";
        ctx.fillText("8", 10, 285);

        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#e234a8";
        ctx.moveTo(40, 170);
        ctx.lineTo(260, 330);
        ctx.lineTo(420, 330);
        ctx.lineTo(540, 330);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#e234a8";
        ctx.fillText("9", 10, 175);

        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#edb81a";
        ctx.moveTo(40, 75);
        ctx.lineTo(260, 230);
        ctx.lineTo(420, 350);
        ctx.lineTo(540, 350);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#edb81a";
        ctx.fillText("10", 10, 75);

        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "#edb81a";
        ctx.moveTo(40, 370);
        //ctx.lineTo(260, 230);
        ctx.lineTo(420, 90);
        ctx.lineTo(540, 90);
        ctx.stroke();
        ctx.font = "23px Arial";
        ctx.fillStyle = "#edb81a";
        ctx.fillText("11", 10, 380);




        setTimeout(function(){
            var ctx = canv.getContext("2d");
            ctx.clearRect(0, 0, canv.width, canv.height);
        },4000);

        return false;
    });

    $("html").on("click",".slot_cor .play_data .sound",function(e){
        $(this).toggleClass("disabled");
        return false;
    });


     function animbl(block) {
         $(block).scrollTop(0);
         setTimeout(function(){$(block).animate({scrollTop:15000},15000,"linear",function(){});},150);
     }

    $("html").on("click",".spinbut button",function(e){
        if($(this).hasClass("lock")){
            return false;
        }
        var block = $(this);
        var form = block.closest("form");
        var corslot_sound = !$(".slot_cor .play_data .sound").hasClass("disabled");
        if(corslot_sound){
            play_sound("click.mp3");
        }
        operate_form(form,function(form,ret){
            if(ret.success){
                $(block).find("i").addClass("rotated");
                $(block).addClass("lock");
                $(".slot_cor .play_data .won .ledger").html("");
                $(".slot_cor .play_data .won b").html("0");
                var corslot_sound = !$(".slot_cor .play_data .sound").hasClass("disabled");
                if(corslot_sound){
                    cor_slot_sound = play_sound("hospital.mp3",true,true);
                }
                setTimeout(function(){
                    $(".spinbut i").removeClass("rotated");
                },1100);
                $(".slot_cor .reels>div").each(function(){
                    var alr = $(this).find("span").length;
                    if(alr>3){
                        console.log("remove except last 3");
                        $(this).find("span").slice(0,-3).remove();
                        $(this).scrollTop(0);
                    }
                    for(i=0;i<150;i++){
                        console.log("add150");
                        var rnd = getRandomFromArray(["01","23","45","67","89","ab","cd","e","f"]);
                        $(this).append('<span><img src="/static/img/slot1/'+rnd+'.png"/></span>');
                    }
                    animbl($(this));
                });
            }else{
                $(".big_msg u").show().html(ret.err);
                setTimeout(function(){
                    $(".big_msg u").fadeOut(1200);
                },700);
            }
        });
        return false;
    });

    $("html").on("click",".link .refs .show_refs",function(e){
        $(this).closest(".refs").find("table").toggleClass("hide");
        return false;
    });

    $("html").on("click",".slot_cor .auto button",function(e){
        $(this).toggleClass("on");
        return false;
    });

    $("html").on("submit",".fishform",function(e){
        $("main .wrap").html(loader_big);
        var form = $(this);
        setTimeout(function(){
            operate_form(form,function(form,ret){
                $("main .wrap").html(ret);
            });
        },1500);
        return false;
    });

    $("html").on("submit",".exploreform",function(e){
        $("main .wrap").html(loader_big);
        var form = $(this);
        setTimeout(function(){
            operate_form(form,function(form,ret){
                $("main .wrap").html(ret);
            });
        },1500);
        return false;
    });



    $("html").on("submit",".investform",function(e){
        $("main .wrap").html(loader_big);
        var form = $(this);
        setTimeout(function(){
            operate_form(form,function(form,ret){
                $("main .wrap").html(ret);
            });
        },200);
        return false;
    });



    $("html").on("click","main>.inform .close",function(e){
        var inform_num = $("main>.inform").attr("rel");
        localStorage.setItem("inform_closed_num",inform_num);
        $("main>.inform").hide();
        return false;
    });



    setInterval(function(){
        if($(".slot_cor .auto button.on").length){
            if(!$(".spinbut button").hasClass("lock") && !$(".spinbut button").hasClass("prelock")){
                $(".spinbut button").click();
            }
        }
    },1500);

    setInterval(function(){
        if($(".total_overlay:visible")){
            $(".total_overlay>img").addClass("unblur");
        }
        $(".total_overlay:visible .bar .prbar .p").animate({"width":"100%"},7000,"linear",function(){
            $(".total_overlay").hide();
            var page="map";
            location.href="/map/?moved_to="+$(".total_overlay img").attr("rel");
        });
    },1000);

    function exchangeform_calc()
    {
        var fee = Number($(".exchangeform input[name=fee]").val());
        var price1 = $(".exchangeform select[name=coin1] option:selected").attr("rel");
        var price2 = $(".exchangeform select[name=coin2] option:selected").attr("rel");
        var coin2 = $(".exchangeform select[name=coin2]").val();
        var amount = $(".exchangeform input[name=amount]").val();
        var total = (price1 * amount) / price2;
        if(coin2=="sin")fee=0;
        total = total - total * fee;
        if(!isNaN(total)){
            $(".exchangeform .get_amount").html(total.toFixed(2));
            $(".exchangeform .get_coin").html(coin2);
        }else{
            $(".exchangeform .get_amount,.exchangeform .get_coin").html("");
        }
    }

    $("html").on("click keyup change",".exchangeform input[name=amount]",function(){
        exchangeform_calc();
    });

    $("html").on("change",".exchangeform select",function(){
        exchangeform_calc();
    });

    $("html").on("submit",".exchangeform",function(e){
        var form = $(this);
        setTimeout(function(){
            operate_form(form,function(form,ret){
                if(ret.err)form.find(".result").addClass("red").removeClass("green").html(ret.err);
                else if(ret.success){
                    form.find(".result").addClass("green").removeClass("red").html(ret.success);
                    $(".exchangeform input[name=amount]").val("");
                    $(".exchangeform .get_amount,.exchangeform .get_coin").html("");
                }
            });
        },200);
        return false;
    });


    $("html").on("submit",".banform",function(e){
        operate_form($(this),function(form,ret){
            $(form).find(".result").html(ret);
        });
        return false;
    });

    $("html").on("submit",".lottery_tickets form",function(e){
        operate_form($(this),function(form,ret){

        });
        return false;
    });

    $("html").on("click",".plhistupd",function(e){
        $(".plinkohist").html(loader_big).load($(this).attr("rel"));
        return false;
    });

    $("html").on("click touchstart",".chat .minimize,.chatmin .maxchat",function(e){
        $(".chatmin,aside").toggle();
        return false;
    });


    $("html").on("click",".mount_choose button",function(e){
        var ind = $(this).index();
        $(".mount_choose button").removeClass("redb").addClass("greenb");
        $(this).addClass("redb").removeClass("greenb");
        $(".offerwall").hide();
        $(".offerwall").eq(ind).show();
        return false;
    });

    $("html").on("click",".desol_choose button",function(e){
        var ind = $(this).index();
        $(".desol_choose button").removeClass("redb").addClass("greenb");
        $(this).addClass("redb").removeClass("greenb");
        $(".desol_sect").addClass("hide");
        $(".desol_sect").eq(ind).removeClass("hide");
        return false;
    });


    $("html").on("submit",".island_form",function(e){
        $(this).find("button").hide();
        operate_form($(this),function(form,ret){
            form.html(ret);
        });
        return false;
    });


    $("html").on("submit",".map_attack form",function(e){
        $(this).find("button").hide();
        operate_form($(this),function(form,ret){
            form.html(ret);
        });
        return false;
    });

    $("html").on("click",".rollhuntb .rh",function(e){
        $(".rollhuntb .hunt").toggle(0).html(loader_small).load("/ajax/roll_hunt/");
        return false;
    });

    $("html").on("click",".rollhuntb .hunt button",function(e){
        $(".rollhuntb .hunt").html(loader_small).load("/ajax/roll_hunt/?start=1");
        return false;
    });

    $("html").on("click",".missions .one",function(e){
        $(".missions .one").removeClass("sel");
        if(!$(this).hasClass("unav")){
            $(this).addClass("sel");
        }
    });

    $("html").on("submit",".missions form",function(e){
        $(this).find("button").hide();
        operate_form($(this),function(form,ret){
            $("main .wrap").html(ret);
        });
        return false;
    });

    $("html").on("click",".dicestable .vote",function(e){
        var href = $(this).attr("href");
        var td = $(this).closest("td");
        $.get(href,function(ret){
            td.html(ret);
        });
        return false;
    });

    $("html").on("click",".dicestable .infbug",function(e){
        return false;
    });

    $("html").on("click",".adddice",function(e){
        $(".addingdice").toggleClass("hide");
        return false;
    });

    $("html").on("submit",".addingdice",function(e){
        operate_form($(this),function(form,ret){
            $(".addingdice").html(ret);
        });
        return false;
    });

    $("html").on("click",".informbug span",function(e){
        $(".diceinform").removeClass("hide");
        $(".diceinform .s1,.diceinform .s2").addClass("hide");
        $(".diceinform .s"+$(this).attr("rel")).removeClass("hide");
        var name = $(this).closest("div").attr("rel");
        $(".diceinform .dicename").html(name);
        $(".diceinform .dicename2").val(name);
        $('html,body').animate({scrollTop: $(".diceinform").offset().top-200}, '300');
        return false;
    });

    $("html").on("submit",".diceinform",function(e){
        operate_form($(this),function(form,ret){
            $(".diceinform_submitted").removeClass("hide");
            $(".diceinform").addClass("hide");
        });
        return false;
    });

    $("html").on("submit",".sbshares_trade form",function(e){
        operate_form($(this),function(form,ret){
            form.find("button").replaceWith(ret);
            if(ret=="ok")location.reload();
        });
        return false;
    });


    if (navigator.mediaDevices) {
      console.log('getUserMedia supported.');

      var constraints = { audio: true };
      var chunks = [];
      var voice_msg_audio;
      var voice_msg_blob;
      var mediaRecorder;
      var media_stream;

      $("html").on("click",".voicemsg_start",function() {
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("recorder started");
          $(".send_voice_msg .voicemsg_stop").show();
          $(".send_voice_msg .recorded").hide();
        });

        $("html").on("click",".voicemsg_stop",function() {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("recorder stopped");
          $(".send_voice_msg .recorded").show();
          $(".send_voice_msg .voicemsg_stop").hide();
        });

        $("html").on("click",".voicemsg_del",function() {
          $(".send_voice_msg .recorded").hide();
        });

        $("html").on("click",".voicemsg_listen",function() {
          voice_msg_audio.play();
        });

        $("html").on("click",".voicemsg_send",function() {
          var formData = new FormData();
          formData.append('audio', voice_msg_blob, 'audio.ogg');
          formData.append("csrfmiddlewaretoken", $(".send_voice_msg input[name=csrfmiddlewaretoken]").val());
          formData.append("lang", $(".chat .title .chath span").text());
           $.ajax({
            type: 'POST',
            url: '/ajax_voice/',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
               console.log(response)
            }
          });
          $(".send_voice_msg").hide();
          $(".send_voice_msg .cont").html("<u>You can send more voice message in 1 hour. Refresh the page in 1 hour</u>");
          $(".send_voice_msg .recorded").hide();
          media_stream.getTracks().forEach(track => track.stop());
        });


      $("html").on("click",".chat a.voicemsg",function(e){
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {

        media_stream = stream;
        mediaRecorder = new MediaRecorder(stream);

        $(".send_voice_msg .ops").show();
        $(".send_voice_msg .need_mic").hide();

        mediaRecorder.onstop = function(e) {
          console.log("data available after MediaRecorder.stop() called.");

          var clipName = "voicemsg";


          var audio = document.createElement('audio');
          var deleteButton = document.createElement('button');

          audio.setAttribute('controls', '');

          audio.controls = true;
          var blob = new Blob(chunks, { 'type' : 'audio/webm;codecs=opus' });
          voice_msg_blob = blob;
          chunks = [];
          var audioURL = URL.createObjectURL(blob);

          audio.src = audioURL;
          console.log("recorder stopped", audio.src);

          voice_msg_audio = audio;

          deleteButton.onclick = function(e) {
            evtTgt = e.target;
            evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
          }
        }

        mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        }
      })
      .catch(function(err) {
        console.log('The following error occurred: ' + err);
      });


      });
    }


    function attack_arrow(dir)
    {
        if(dir=="r"){
            var next_dir = "l";
            $(".arrow_block span").animate({left:"100%"},800,function(){attack_arrow(next_dir)});
        }else{
            var next_dir = "r";
            $(".arrow_block span").animate({left:"0%"},800,function(){attack_arrow(next_dir)});
        }
    }

    function start_attack()
    {
        $("header,aside,main .wrap,footer,body").addClass("black");
        attack_sound=play_sound("attack.mp3",true);
        $(".attackform button").fadeOut(1200);
        attack_arrow("r");
        $(".attack_block .attack_state .waiting").show();
    }
    $("html").on("submit",".attackform",function(e){
        operate_form($(this),function(form,ret){
            if(ret.err)form.find(".result u").addClass("red").removeClass("green").html(ret.err);
            else if(ret.success){
                form.find(".result u").html("");
                start_attack();
            }
        });
        return false;
    });


    var towersbetlocked=false;
    var towerlastbet=null;
    $("html").on("click",".towers .monster",function(e){
        $(".towers .roll").removeClass("green red").addClass("anim").find("span").html("");
        if(towersbetlocked)return false;
        towersbetlocked=true;
        operate_form($(this),function(form,ret){
            towersbetlocked=false;
            $(".towers .roll").removeClass("anim").find("span").html(ret.rnd);
            if(ret.win){$(".towers .roll").addClass("green");play_sound("tick.mp3");}
            else{$(".towers .roll").addClass("red");play_sound("tick2.mp3");}
            if(ret.remove_monster){
                $(".towers .monster[rel="+String(ret.remove_monster)+"] button").prop("disabled",true);
                $(".towers .monster[rel="+String(ret.remove_monster)+"]").fadeOut(700);
            }
            if(ret.remove_life){
                var bl = $(".towers .life span:not(.anim) .fas:last").closest("span");
                bl.addClass("anim");
                setTimeout(function(){
                    bl.removeClass("anim").find("i").removeClass("fas").addClass("far");
                },1200);
            }
            if(ret.game_win){
                $(".winsplash").fadeIn(500).find("span").html(nToDec(ret.prize));
                setTimeout(function(){
                    play_sound("slot_jackpot.mp3");
                },700);
                setTimeout(function(){
                    $(".towers .forload").load("/ajax_towerstart/",function(){$(".diceform .amnt").val(towerlastbet)});
                },1500);
            }
            if(ret.game_lose){
                $(".losesplash").fadeIn(500);
                setTimeout(function(){
                    $(".towers .forload").load("/ajax_towerstart/",function(){$(".diceform .amnt").val(towerlastbet)});
                },1500);
            }
            if(ret.latestbet_tr){
                $(ret.latestbet_tr).insertAfter($(".diceallbets .mybets tr:first"));
            }
        });
        return false;
    });

    $("html").on("click",".towers .choose a",function(e){
        $(".towerdifinp").val($(this).attr("rel"));
        $(".winsplash,.losesplash").fadeOut(500);
        towerlastbet=$(".diceform .amnt").val();
        operate_form($(this).closest("form"),function(form,ret){
            $(".towers .forload").html(ret);
        });
        return false;
    });

    $("html").on("click",".promotion_even a",function(e){
        $(".promotion_even .rules").show();
        $(".promotion_even a").hide();
        return false;
    });

    $("html").on("click",".showinfo>a",function(e){
        $(".showinfo>a,.calc_mechanism").toggle();
        return false;
    });

    $("html").on("click",".allgoods .fa-calculator",function(e){
        $(this).closest("tr").find(".calc").toggle();
        return false;
    });

    $("html").on("click","header .country .sel",function(e){
        $("header .country .list").toggle();
        return false;
    });

    $("html").on("click","main .toggle_cur a",function(e){
        $(this).toggleClass("toggled");
        $(".allgoods .price").each(function(){
            var rel = $(this).attr("rel");
            $(this).attr("rel",$(this).text());
            $(this).text(rel);
        });
        return false;
    });



    $("html").on("keyup change",".allgoods td .calc input",function(e){
        var amnt = Number($(this).val());
        var for1btc = Number($(this).attr("rel"));
        var result = for1btc*amnt;
        $(this).closest("td").find("span").html(result.toFixed(0));
        return false;
    });








    window.onpopstate = function(e){
        if(e.state){
            $("main .wrap").html(e.state.html);
            document.title = e.state.pageTitle;
        }
    };

    if(location.pathname!="/" && location.pathname.indexOf("accounts/")==-1 && location.pathname.indexOf("adm_stat")==-1 && location.pathname.indexOf("bal_stat")==-1 && location.pathname.indexOf("unsubs")==-1){
        var page = location.pathname.replace("/","").replace("/","");
        $("main .wrap").html(loader_big).load("/ajax_"+page+"/");
    }



    var tabID = sessionStorage.tabID ? sessionStorage.tabID : sessionStorage.tabID = Math.random();
    //console.log("tab id",tabID);
    rscroll();
    apply_settings();
    connect();
    connect_chat();
    //guitar_anim();
    var server_time_worker = new Worker('/static/js/work.js');
    server_time_worker.onmessage = function(){
        server_time_upd();
    }
    preload_all();
});

window.onbeforeunload = before_unload;