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
  data() {
        return {
            country_id:null,
        }
  },
  created(){
     this.country_id = localStorage.getItem("country");
     if(!this.country_id)this.country_id=0;
  },
}
</script>
