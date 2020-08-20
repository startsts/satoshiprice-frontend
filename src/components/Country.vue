<template>
  <div class="home">
    <main>
        <div class="showinfo">
            <a href="" v-if="!show_calc_mechanism" v-on:click.prevent="toggleShowCalcMechanism"><i class="fa fa-info-circle"></i> Show calculation method</a>
            <transition name="bounce">
            <div class="calc_mechanism" v-if="show_calc_mechanism">
                <div>BTC price used:
                    <span>{{ country.btc_global_price | btc_format(2,4) }}</span> USD -> <span>{{ country.btc_price | btc_format(2) }}</span> {{ country.fiat_code }} <a target="_blank" :href="country.btc_price_source_link"><i class="fa fa-external-link-alt"></i></a>
                    &nbsp;<i v-if="country.btc_price_fee" class="fa fa-asterisk info infot" v-tooltip :rel="'Added ' + country.btc_price_fee + '% trade fee'"></i>
                </div>
                <div class="source"><i class="fa fa-database"></i> Goods price source: <a target="_blank" :href="country.price_source_link ">{{ country.price_source }}</a></div>
                <div>
                    Local BTC price actualization: <span :class="(country.btc_price_updated_ago == 'Never' || country.btc_price_updated_ago > 30)?'red':'green'">{{ country.btc_price_updated_ago }} minutes ago</span>
                </div>
            </div>
            </transition>
        </div>
        <div class="goodsdata">
            <div class="toggle_cur">
                <a href="" :class="{toggled:fiat_price}" v-on:click.prevent="toggleFiat"><i class="fa fa-btc"></i> / <i class="fa fa-dollar-sign"></i></a>
            </div>
            <table class="allgoods" v-cloak>
                <tr><th colspan="5" class="header">Nacional mass consumption goods</th></tr>
                <OneCat :goods="nacional" :country="country" />
                <tr><th colspan="5" class="header">World-wide mass consumption goods</th></tr>
                <OneCat :goods="global" :country="country" />
            </table>
        </div>
    </main>
  </div>
</template>
<script>
import OneCat from "@/components/OneCat";

export default {
  name: 'Country',
  components: {OneCat},
  props: ['country_id'],
  data() {
    return {
        goods: [],
        show_calc_mechanism: false,
        fiat_price: false,
        country:null,
    }
  },
  created(){
    this.loadCountry();
  },
  watch:{
    country_id(){
        this.loadCountry();
    },
    country(){
      this.$store.commit('setCountry', this.country);
      this.loadGoods();
    }
  },
  computed: {
        nacional() {
            return this.goods.filter(good => {return !good.mass})
        },
        global() {
            return this.goods.filter(good => {return good.mass})
        }
    },
  methods:{
    async loadCountry(){
      this.country = await fetch(`${this.$store.getters.getServerUrl}/country/${this.country_id}/`)
          .then(responce => responce.json()).then(data => {return data});
    },
    async loadGoods(){
        this.goods = await fetch(`${this.$store.getters.getServerUrl}/goods/${this.country_id}`)
            .then(responce => responce.json()).then(data => {return data});
    },
    toggleShowCalcMechanism(){
        this.show_calc_mechanism = !this.show_calc_mechanism;
    },
    toggleFiat(){
        this.fiat_price=!this.fiat_price;
    },
  }
}
</script>
