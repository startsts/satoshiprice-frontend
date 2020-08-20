<template>
  <div>
    <Country :country_id="country_id" />
  </div>
</template>

<script>
import Country from "@/components/Country";

export default {
  components: {Country},
  name: 'Home',
  props: ['country_id'],
  data() {
        return {

        }
  },
  created(){
        localStorage.setItem("country", this.country_id);
  },
  watch:{
    $route (){
        localStorage.setItem("country", this.country_id);
    },
  },
}
</script>