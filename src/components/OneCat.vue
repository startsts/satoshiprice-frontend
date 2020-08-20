<template>
<tbody>
  <OneGood v-for="(el, index) in goods" v-bind:el="el" v-bind:index="index" v-bind:key="el.id" v-bind:country="country" />
</tbody>
</template>

<script>
import OneGood from "@/components/OneGood";
export default{
    name:"OneCat",
    props: ['goods','country'],
    components: {OneGood},
    data() {
        return {
          show_calc:0,
        }
    },
   computed: {
      fiat_price: function () {
        return this.$parent.fiat_price
      }
    },
}
</script>