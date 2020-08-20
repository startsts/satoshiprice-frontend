<template>
    <header id="header">
        <a href="/" class="logo">Satoshi<span>Price</span></a>
        <div class="slogan"><u>The measure of all things</u></div>
        <div class="country" v-if="country">
            <div class="sel" v-on:click="toggleCountryList"><span class="flag flag-" :class="'flag-'+country.flag_code.toLowerCase()"></span> {{ country.name }} <span><i class="fa fa-map-marked-alt"></i> {{ country.locality }}</span></div>
            <div class="list" v-if="show_country_list">
                <router-link v-on:click.native="show_country_list = false" :to="{ name: 'Country', params: { country_id: c.id }}" v-for="c in countries" :key="c.id" ><span class="flag flag-" :class="'flag-'+c.flag_code.toLowerCase()"></span> {{ c.name }}</router-link>
            </div>
        </div>
    </header>
</template>

<script>
export default{
    name:"Nav",
    data() {
        return {
            show_country_list: false,
            countries: [],
        }
    },
    created(){
       this.loadCountries();
    },
    computed:{
      country(){
        return this.$store.getters.getCountry
      }
    },
    methods:{
        toggleCountryList: function(){
            this.show_country_list = !this.show_country_list;
        },
        async loadCountries(){
            this.countries = await fetch(
                `${this.$store.getters.getServerUrl}/countries/`
            ).then(responce => responce.json()).then(data => {return data});
        },
    }
}
</script>

<style scoped>
    header{
      min-width:900px;
    }
</style>