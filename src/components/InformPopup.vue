<template>
  <div class="popup" v-if="item">
    <div class="content">
      <div>Found wrong price? Inform us about the problem</div>
      <div class="green" v-if="was_sent">Your inform was sent, thank you!</div>
      <div v-if="!was_sent">
        <div><input v-model="item.name" placeholder="item" required="required" /></div>
        <div><textarea v-model="text" required="required" placeholder="Describe the problem"></textarea></div>
        <div>Please provide proof/link to right price if you can</div>
        <div><button type="button" class="redb" v-on:click.prevent="sendInform">Send</button></div>
      </div>
    </div>
    <a href="" class="close" v-on:click.prevent="$store.commit('popupShow',null)"><i class="fa fa-close"></i></a>
  </div>
</template>

<script>
export default {
  name: "InformPopup",
  data() {
    return {
      text: null,
      was_sent: false,
    }
  },
  computed: {
    item() {
      return this.$store.getters.getPopupItem
    },
  },
  methods:{
    async sendInform(){
      let data = {
        name: this.item.name,
        text: this.text,
        good: this.item.id
      }
      fetch(`${this.$store.getters.getServerUrl}/inform/`,{
        method:"POST",
        headers:{
          'Content-type': "application/json",
        },
        body: JSON.stringify(data)
      }).then(responce => responce.json()).then(data => {this.was_sent=true; });
    }
  }
}
</script>

<style scoped>
  .popup{
    position: fixed;
    top:50%;
    left:50%;
    margin:-200px 0 0 -300px;
    width:600px;
    height:400px;
    border-radius: 10px;
    background: #E8E8E8;
    color:black;
  }
  .popup .close{
    position: absolute;
    background: red;
    color:white;
    width:30px;
    height:30px;
    font-size:10pt;
    display: block;
    right:0;
    line-height: 30px;
    text-align: center;
    font-size:15pt;
    top:0;
  }
  .popup .content{
    margin:15px;
  }
  .popup input,.popup textarea{
    padding:9px;
    margin:4px 0;
    width:400px;
    border-radius: 5px;
    border:1px solid black;
  }
  .popup .redb{
    background: red;
    color:white;
    padding:8px;
    border-radius: 5px;
  }
  .green{
    color:green;
    margin-top:10px;
  }
</style>