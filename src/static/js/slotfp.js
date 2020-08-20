var n_arr = {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"a","b":"b","c":"c","d":"d","e":"e","f":"f"};
var canv = document.getElementById("slotfpcanv");
var slot_h_m = 121;
var blocks_all = 200;
var slotfpreelsound = false;
var slots2_space_launch=true;

function slotfpresult(d)
{
    var max_top = blocks_all*slot_h_m;
    var all_delays = [];
    $(".slotfp:last>div:not(.actions):not(.lines)").each(function(i){
        if(i==5)return false;
        var new_cnt = 5;
        var new_max_top = (blocks_all+5)*slot_h_m;
        if(i==0 || i == 4){
            var new_cnt = 3;
            var new_max_top = (blocks_all+3)*slot_h_m;
        }
        var j=0;
        while(j<new_cnt){
            var rand = n_arr[d.matrix2[i][j]];
            if(rand=="1")rand="0";
            $(this).append('<span class="s'+rand+'"></span>');
            j+=1;
        }
        var remain = (blocks_all*slot_h_m) - $(this).scrollTop();
        var delay = remain * (0.07 + i*0.022);
        all_delays.push(delay);
        $(this).stop().animate({"scroll-top": String(new_max_top) + "px"},{duration:delay,easing:"linear",complete:function(){

        }});
    });
    var max_delay = Math.max.apply(Math, all_delays);
    setTimeout(function(){
        if(slots_sound){
            setTimeout(function(){
            slots_sound.pause();
            slots_sound.currentTime = 0;
            },600);
        }
        if(slotfpreelsound){
            slotfpreelsound.pause();
            slotfpreelsound.currentTime = 0;
        }
        $(".bank span i").html(nToDec(d.bank,4));
        $(".jackpot span i").html(nToDec(d.jackpot_amnt,4));
        $(".success").html("XLM ledger #" + String(d.block) + "<br>hash ..." + String(d.hash));
        //colors
        if(d.winners){
            d.winners.forEach(function(el){
                if(el==user_pk){
                    $(".winnings").html(loader_small).load($(".winnings").attr("rel"));
                    if(d.is_jackpot){
                        if(!$(".slots_nosound").hasClass("red"))play_sound("slot2/jackpot.mp3");
                        $(".slotfp:last>div:not(.actions):not(.lines) span").addClass("faded");
                        $(".slotfp:last>div:not(.actions):not(.lines) span.sf").removeClass("faded").addClass("satur");
                        upd_bals();
                    }else if(d.is_bonus){
                        var free_bets =  Number($(".free_bets").attr("rel"));
                        if(!free_bets){
                            $(".free_bets").show().attr("rel",d.is_bonus).find("i").text(d.is_bonus);
                        }else{
                            $(".free_bets").show().attr("rel",String(free_bets+Number(d.is_bonus))).find("i").text(String(free_bets+Number(d.is_bonus)));
                        }
                        if(!$(".slots_nosound").hasClass("red"))play_sound("slot2/bonus.mp3");
                        $(".slotfp:last>div:not(.actions):not(.lines) span").addClass("faded");
                        $(".slotfp:last>div:not(.actions):not(.lines) span.se").removeClass("faded").addClass("satur");
                    }
                    else{
                        if(!$(".slots_nosound").hasClass("red"))play_sound("slot2/win.mp3");
                        upd_bals();
                    }
                }
           })
        }
        $(".actions .slot2spin").prop("disabled",false);

        if(d.color && d.color.length){
            $(".slotfp:last>div:not(.actions):not(.lines) span").addClass("faded");
            var ii = 0;
            d.color.forEach(function(el2){
                var rr = 200;
                $(".slotfp:last>div:not(.actions):not(.lines)").eq(el2[0]).find("span").eq(rr+el2[1]).removeClass("faded").addClass("satur");
                console.log("color",el2);
                ii+=1;
            });
        }

    },max_delay);
}




$(document).ready(function(){

    preload_sound("slot2/reel2.mp3");
    preload_sound("slot2/win.mp3");
    preload_sound("slot2/bonus.mp3");

    $(".actions .bets button").click(function(e){
        var free_bets =  Number($(".free_bets").attr("rel"));
        if(!free_bets){
            $(".actions .bets button").removeClass("btn-success").addClass("btn-primary");
            $(this).addClass("btn-success");
            $(".actions .bets input[name=bet]").val($(this).attr("rel"));
        }else{
            alert("You can't change bet while have free spins");
        }
        return false;
    });

    $(".actions .slot2spin").click(function(){
        $(this).prop("disabled",true);
        $(this).addClass("anim");
        var but = $(this);
        setTimeout(function(){
            but.removeClass("anim");
        },1500);
        var form = $(this).closest("form");
        operate_form(form,function(form,ret){
            if(ret.err){form.find(".err").html(ret.err);$(".actions .slot2spin").prop("disabled",false);}
            if(ret.success){
                form.find(".err,.winnings").html("");
                form.find(".success").html(ret.success);
                if(!$(".slots_nosound").hasClass("red"))slotfpreelsound = play_sound("slot2/reel2.mp3",true,true);
                var free_bets = Number($(".free_bets").attr("rel"));
                if(free_bets){
                    $(".free_bets").attr("rel",String(free_bets-1)).find("i").text(String(free_bets-1));
                    if(free_bets==1){
                        $(".free_bets").hide();
                    }
                }
                $(".slotfp:last>div:not(.actions):not(.lines)").each(function(i){
                    //console.log("span total",$(this).find("span").length);
                    if(i==5)return false;
                    if($(this).find("span").length>blocks_all){
                        if(i==0 || i == 4){
                            var delitems = blocks_all + 6;
                        }else{
                            var delitems = blocks_all + 10;
                        }
                        //console.log("del items",delitems);
                        //console.log("prev",$(this).find("span").length);
                        $(this).find("span").remove();
                        //console.log("after",$(this).find("span").length);
                    }else{
                        $(this).find("span").remove();
                    }
                    console.log("before anim",$(this).find("span").length,"top",$(this).scrollTop());
                    $(this).scrollTop(0);
                    var ii=0;
                    while(ii<blocks_all){
                        ii+=1;
                        var keys = Object.keys(n_arr)
                        var rand = n_arr[keys[ keys.length * Math.random() << 0]];
                        if(rand=="1")rand="0";
                        $(this).append('<span class="s'+rand+'"></span>');
                    }
                    var wheel_to = blocks_all*slot_h_m;
                    //var dur_rand = Math.floor(Math.random() * 29000);
                    //if(dur_rand < 23000)dur_rand = 23000;
                    var dur_rand = 32000;
                    var animblock = $(this);
                    setTimeout(function(animblock_local){
                        return function() {
                            $(animblock_local).animate({"scroll-top": String(wheel_to) + "px"},{duration:dur_rand,easing:"linear",complete:function(){}});
                        }
                    }(animblock),2);
                });
            }
        });
        return false;


    });
    $(".showlines").click(function(){
        var ctx = canv.getContext("2d");
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        ctx.beginPath();
        ctx.strokeStyle = "#ED1010";
        ctx.lineWidth = 5;
        ctx.moveTo(60, 180);
        ctx.lineTo(180, 60);
        ctx.lineTo(420, 60);
        ctx.lineTo(540, 180);
        ctx.stroke();
        ctx.moveTo(60, 420);
        ctx.lineTo(180, 540);
        ctx.lineTo(420, 540);
        ctx.lineTo(540, 420);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#deea85";
        ctx.moveTo(30, 180);
        ctx.lineTo(180, 180);
        ctx.lineTo(420, 180);
        ctx.lineTo(570, 180);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 300);
        ctx.lineTo(180, 300);
        ctx.lineTo(420, 300);
        ctx.lineTo(570, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 420);
        ctx.lineTo(180, 420);
        ctx.lineTo(420, 420);
        ctx.lineTo(570, 420);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#bb81db";
        ctx.moveTo(30, 170);
        ctx.lineTo(180, 290);
        ctx.lineTo(420, 290);
        ctx.lineTo(570, 290);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 420);
        ctx.lineTo(180, 310);
        ctx.lineTo(420, 310);
        ctx.lineTo(570, 310);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = "#60e07e";
        ctx.moveTo(30, 290);
        ctx.lineTo(180, 170);
        ctx.lineTo(420, 170);
        ctx.lineTo(570, 170);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 290);
        ctx.lineTo(180, 430);
        ctx.lineTo(420, 430);
        ctx.lineTo(570, 430);
        ctx.stroke();


        ctx.beginPath();
        ctx.strokeStyle = "#ce7c25"
        ctx.moveTo(30, 190);
        ctx.lineTo(180, 190);
        ctx.lineTo(300, 280);
        ctx.lineTo(570, 280);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 410);
        ctx.lineTo(180, 410);
        ctx.lineTo(300, 320);
        ctx.lineTo(570, 320);
        ctx.stroke();

        //blue
        ctx.beginPath();
        ctx.strokeStyle = "#455ad1"
        ctx.moveTo(30, 190);
        ctx.lineTo(180, 20);
        ctx.lineTo(300, 190);
        ctx.lineTo(420, 20);
        ctx.lineTo(570, 190);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 410);
        ctx.lineTo(180, 580);
        ctx.lineTo(300, 410);
        ctx.lineTo(420, 580);
        ctx.lineTo(570, 410);
        ctx.stroke();

        //pink
        ctx.beginPath();
        ctx.strokeStyle = "#e02fa5"
        ctx.moveTo(30, 305);
        ctx.lineTo(180, 305);
        ctx.lineTo(300, 190);
        ctx.lineTo(570, 190);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 305);
        ctx.lineTo(180, 305);
        ctx.lineTo(300, 410);
        ctx.lineTo(570, 410);
        ctx.stroke();

        //green
        ctx.beginPath();
        ctx.strokeStyle = "#00ff1d";
        ctx.moveTo(35, 310);
        ctx.lineTo(300, 70);
        ctx.lineTo(555, 310);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(35, 290);
        ctx.lineTo(300, 530);
        ctx.lineTo(555, 290);
        ctx.stroke();

        //celeste
        ctx.beginPath();
        ctx.strokeStyle = "#33e8e8";
        ctx.moveTo(30, 190);
        ctx.lineTo(180, 300);
        ctx.lineTo(300, 180);
        ctx.lineTo(420, 300);
        ctx.lineTo(570, 190);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 410);
        ctx.lineTo(180, 320);
        ctx.lineTo(300, 420);
        ctx.lineTo(420, 320);
        ctx.lineTo(570, 410);
        ctx.stroke();



        setTimeout(function(){
            var ctx = canv.getContext("2d");
            ctx.clearRect(0, 0, canv.width, canv.height);
        },3000);

        return false;
    });

    $(".slotfp").mouseenter(function(){
        slots2_space_launch=true;
        $(".slotfp form .slot2spin").addClass("ready");
    });

    $(".slotfp").mouseleave(function(){
        slots2_space_launch=false;
        $(".slotfp form .slot2spin").removeClass("ready");
    });


    $("body").keyup(function(e){
        if(e.keyCode == 32 && slots2_space_launch){
            if(!$(".slotfp .slot2spin").prop("disabled")){
                $(".slotfp .slot2spin").click();
            }
            return false;
        }
    });


});