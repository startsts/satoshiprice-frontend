<template>
  <tr>
    <td class="img"><img :src="el.get_img" /></td><td>{{ el.name }}</td><td>
    <div><span v-if="!fiat_price"  class="price">{{ el.satoshi }} satoshi</span><span v-if="fiat_price" class="price2">{{ el.price | btc_format(2) }} {{ country.fiat_code }}</span></div>
    <span v-if="el.fiat_price_updated_days_ago == 'Never' || el.fiat_price_updated_days_ago > 2" class="red">Updated {{ el.fiat_price_updated_days_ago }} days ago</span>
  </td><td><div class="calc" v-if="show_calc">
    <input autocomplete="off" type="text" value="1" v-model="quantity"> BTC = <span>{{ calced }}</span> <img :src="el.get_img" />
  </div></td><td class="actions"><div><a href="" v-on:click.prevent="toggleCalc()"><i class="fa fa-calculator"></i></a> <a href="" v-on:click.prevent="inform()"><i class="fa fa-exclamation-triangle"></i></a></div>
  </td>
  </tr>
</template>

<script>
export default {
  name: "OneGood",
  props: ["el","country"],
  data() {
    return {
      show_calc:false,
      quantity:1,
    }
  },
  computed: {
    fiat_price() {
      return this.$parent.fiat_price
    },
    calced(){
      return this.quantity*this.el.for1btc
    }
  },
  methods:{
    toggleCalc(){
      this.show_calc = !this.show_calc;
    },
    inform(){
      this.$store.commit('popupShow',this.el)
    },
  }
}
</script>

<style scoped>

</style>