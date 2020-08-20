$(document).ready(function(){
    $(".ticket_cr .symbols_list b").click(function(){
        if($(this).hasClass("sel"))return false;
        var empt = $(".ticket_res b:empty").length;
        var vl = $(this).text();
        if(empt>0){
             $(".ticket_res b:empty").eq(0).html(vl);
             $(this).addClass("sel");
             var smb = $("input[name=symb]").val();
             smb += vl;
             $("input[name=symb]").val(smb);
        }
    });
    $(".bingo_page .ticket_cr .ops .reset").click(function(){
        $(".ticket_res b").html("");
        $(".ticket_cr .symbols_list b").removeClass("sel");
        $("input[name=symb]").val("");
    });

    $("html").on("click",".bingo_page .bingo_start_but",function(){
        var symb = $(this).closest(".ticket_cr").find("input[name=symb]").val();
        if(symb.length==8){
            $(this).closest(".ticket_cr").load($(this).attr("rel")+"?symb="+symb);
        }
        return false;
    });

    $("html").on("click",".bingo_repeat",function(){
        var url = $(this).attr("rel");
        $(this).closest(".ticket_cr").load(url);
        return false;
    });

});

function bingo_result(d)
{
    var waiting_block = $(".waiting");
    var hash_last12 = d.hash.slice(-12);
    $(".reload_bingo").show();
    waiting_block.removeClass("waiting").addClass("bingo_result").html("<u>New ETH block</u> #" + String(d.block) + ", hash ..." + String(hash_last12) + " ");
    for(i=0;i<hash_last12.length;i++){
        $(".ticket_cr b:contains('"+hash_last12[i]+"')").addClass("match");
    }
    if(d.winners){
        d.winners.forEach(function(el){
            if(el==user_pk){
                $(".reward").load($(".reward").attr("rel"));
            }
        });
    }
    if(d.bank_html){
        $(".bingo_bank").html(d.bank_html);
        translate($(".bingo_bank"));
    }
}