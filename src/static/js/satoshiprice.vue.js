var country = new Vue({
   el: 'header .country',
   data: {
        show_country_list: false,
    },
    methods: {
        toggleCountryList: function(){
            this.show_country_list = !this.show_country_list;
        }
    }
});

var calc_method = new Vue({
   el: '.all',
   delimiters: ['<%', '%>'],
   data: {
        show_calc_mechanism: false,
        goods:[],
        fiat_price: false,
        show_popup: false,
        show_tootip: false,
        tooltip_left:0,
        tooltip_top:0,
        tooltip_text:null,
    },created() {
       this.load();
    },
    computed: {
        nacional: function () {
            return this.goods.filter(function (good) {
              return !good.mass
            })
        },
        global: function () {
            return this.goods.filter(function (good) {
              return good.mass
            })
        }
    },
    methods: {
        toggleShowCalcMechanism: function(){
            this.show_calc_mechanism = !this.show_calc_mechanism;
        },
        showTooltip: function(el){
            this.show_tootip = true;
            var pos=$(el.target).offset();
            var el_height = $(el.target).height();
            var w = $(el.target).width();
            this.tooltip_left=pos.left+Number(w)+14;
            this.tooltip_top=pos.top-5;
            this.tooltip_text = el.target.getAttribute("rel");
        },
        hideTooltip: function(el){
            this.show_tootip = false;
        },
        load: function(el){
            axios.get('/api/goods/').then((response) => {
                this.goods=response.data.results;
            });
        },
        toggleFiatPrice: function(){
            this.fiat_price = !this.fiat_price;
        },
        toggleCalc: function(el){
            el.show_calc = !el.show_calc;
            if(el.show_calc && !el.quantity){el.quantity=1;el.calced=el.quantity*el.for1btc;}
            this.$forceUpdate();
        },
        calc: function(el){
            el.calced=el.quantity*el.for1btc;
            this.$forceUpdate();
        },
        toggleFiat: function(el){
            this.fiat_price=!this.fiat_price;
        },
        show_price:function(el){
            return nToDec(el.price,2);
        },
    }
});


