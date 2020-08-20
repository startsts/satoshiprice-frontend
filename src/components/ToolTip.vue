<template>
  <div class="tooltips" v-if="text" v-bind:style="{ left: left + 'px', top: top + 'px'  }">
    <div class="content">
      {{ text }}
    </div>
    <div class="arrow"></div>
  </div>
</template>

<script>
export default {
  name: "ToolTip",
  data() {
    return {

    }
  },
  computed: {
    text() {
      return this.$store.getters.getTooltip.text
    },
    left() {
      return this.$store.getters.getTooltip.left
    },
    top() {
      return this.$store.getters.getTooltip.top
    }
  }
}
</script>

<style scoped>
.tooltips{
  position:absolute;
  top:20px;
  left:60px;
  width:auto;
  max-width:260px;
  z-index:309;
  box-shadow:0 0 4px 1px rgba(0,0,0,0.6);
}

.tooltips .content{
  background:orange;
  min-height:35px;
  height:auto;
  padding:10px;
  color:white;
  font-size:9pt;
}

.tooltips .arrow{
  width:0;
  height:0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right:10px solid orange;
  position:absolute;
  left:0;
  top:50%;
  margin:-10px 0 0 -20px;
  width:20px;
}
</style>