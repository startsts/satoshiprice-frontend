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
        if(i==4)return false;
        var new_cnt = 4;
        var new_max_top = (blocks_all+4)*slot_h_m;
        var j=0;
        while(j<new_cnt){
            var rand = n_arr[d.matrix2[i][j]];
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
        $(".success").html("XLM ledger #" + String(d.block) + "<br>hash ..." + String(d.hash));
        //colors
        if(d.winners){
            d.winners.forEach(function(el){
                if(el==user_pk){
                    $(".winnings").html(loader_small).load($(".winnings").attr("rel"));
                    if(!$(".slots_nosound").hasClass("red")){
                        if(d.color && d.color.length > 3)play_sound("slot3/bigwin.mp3");
                        else play_sound("slot3/smallwin.mp3");
                    }
                    upd_bals();
                    if(d.wild){
                        setTimeout(function(){
                            if(!$(".slots_nosound").hasClass("red"))play_sound("slot3/rage.mp3");
                            if(d.wild==1){
                                var w = Number($(".rage .m .prbar .p").css("width").replace("px",""));
                                if(w>=165){
                                    $(".rage .m .prbar .p").css("width","0%");
                                    if(!$(".slots_nosound").hasClass("red")){
                                        setTimeout(function(){play_sound("slot3/macri.mp3");},1000);
                                    }
                                    $(".macri_rage").show();
                                    $(".free_bets").show().attr("rel","5").find("i").html("5");
                                }else{
                                    w+=20;
                                    $(".rage .m .prbar .p").css("width",String(w)+"px");
                                }
                            }
                            if(d.wild==2){
                                var w = Number($(".rage .c .prbar .p").css("width").replace("px",""));
                                console.log("w",w,$(".rage .m .prbar .p").css("width"));
                                if(w>=165){
                                    $(".rage .c .prbar .p").css("width","0%");
                                    if(!$(".slots_nosound").hasClass("red")){
                                        setTimeout(function(){play_sound("slot3/cristi.mp3");},1000);
                                    }
                                    $(".cristi_rage").show();
                                    $(".free_bets").show().attr("rel","5").find("i").html("5");
                                }else{
                                    w+=20;
                                    $(".rage .c .prbar .p").css("width",String(w)+"px");
                                }
                            }
                        },800);
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
    preload_sound("slot3/spin.mp3");
    preload_sound("slot3/smallwin.mp3");
    preload_sound("slot3/bigwin.mp3");
    preload_sound("slot3/cristi.mp3");
    preload_sound("slot3/macri.mp3");
    preload_sound("slot3/rage.mp3");

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
        if(!$(".slots_nosound").hasClass("red"))play_sound("slot3/spin.mp3");
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
                    if(i==4)return false;
                    if($(this).find("span").length>blocks_all){
                        var delitems = blocks_all + 8;
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
        ctx.strokeStyle = "#84e530";
        ctx.lineWidth = 5;
        ctx.moveTo(0, 60);
        ctx.lineTo(420, 60);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.lineTo(420, 180);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 300);
        ctx.lineTo(420, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 420);
        ctx.lineTo(420, 420);
        ctx.stroke();

        //red - diagonal
        ctx.beginPath();
        ctx.strokeStyle = "#f74747";
        ctx.moveTo(0, 0);
        ctx.lineTo(440, 440);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 480);
        ctx.lineTo(440, 40);
        ctx.stroke();

        //blue
        ctx.beginPath();
        ctx.strokeStyle = "#4561d1";
        ctx.moveTo(0, 190);
        ctx.lineTo(180, 190);
        ctx.lineTo(280, 290);
        ctx.lineTo(420, 290);
        ctx.lineTo(570, 290);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 290);
        ctx.lineTo(180, 290);
        ctx.lineTo(280, 190);
        ctx.lineTo(420, 190);
        ctx.lineTo(570, 190);
        ctx.stroke();

        //celeste
        ctx.beginPath();
        ctx.strokeStyle = "#80a6f2";
        ctx.moveTo(0, 70);
        ctx.lineTo(300, 70);
        ctx.lineTo(420, 170);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 410);
        ctx.lineTo(300, 410);
        ctx.lineTo(420, 310);
        ctx.stroke();

        //pink
        ctx.beginPath();
        ctx.strokeStyle = "#e544a2";
        ctx.moveTo(20, 290);
        ctx.lineTo(180, 190);
        ctx.lineTo(280, 190);
        ctx.lineTo(420, 190);
        ctx.lineTo(570, 190);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, 290);
        ctx.lineTo(180, 400);
        ctx.lineTo(280, 400);
        ctx.lineTo(420, 400);
        ctx.lineTo(570, 400);
        ctx.stroke();

        //orange
        ctx.beginPath();
        ctx.strokeStyle = "#e59c42";
        ctx.moveTo(20, 190);
        ctx.lineTo(180, 20);
        ctx.lineTo(290, 190);
        ctx.lineTo(440, 20);
        ctx.stroke();
        ctx.moveTo(20, 280);
        ctx.lineTo(180, 440);
        ctx.lineTo(290, 280);
        ctx.lineTo(440, 440);
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

    $(".freespinsn button").click(function(){
        $(this).closest(".rageres").fadeOut(800);
        return false;
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