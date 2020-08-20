<template>
  <div id="app">
    <Nav />
    <router-view />
    <InformPopup />
    <ToolTip />
  </div>
</template>

<style>
@import "static/css/bootstrap.min.css";
@import "static/css/satoshi.css";
@import "static/css/flags.css";

@import "static/fortawesome/fontawesome-free/css/fontawesome.min.css";
@import "static/fortawesome/fontawesome-free/css/all.min.css";
@import "static/fortawesome/fontawesome-free/css/v4-shims.min.css";
</style>

<script>
import Nav from "@/components/Nav";
import Country from "@/components/Country";
import InformPopup from "@/components/InformPopup";
import ToolTip from "@/components/ToolTip";
export default{
    components: {Nav,Country,InformPopup,ToolTip},
    methods:{

    }
}
</script>