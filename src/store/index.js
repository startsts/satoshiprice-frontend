import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        backendUrl: "https://api.satoshiprice.online/api",
        tooltip:{
            "text":"", left:0, top:0
        },
        inform_popup_item:null,
        country:null,
    },
    modeules: {},
    getters:{
        getServerUrl: state => {
            return state.backendUrl
        },
        getTooltip: state => {
            return state.tooltip
        },
        getPopupItem: state => {
            return state.inform_popup_item
        },
        getCountry: state => {
            return state.country
        }
    },
    mutations: {
        tooltip (state, event) {
            if(!event)state.tooltip={"text":"", left:0, top:0}
            else state.tooltip={"text":event.target.getAttribute("rel"), left:event.target.getBoundingClientRect().left+37, top:event.target.getBoundingClientRect().top-4}
        },
        popupShow(state, el){
            state.inform_popup_item=el;
        },
        setCountry(state, country){
            state.country=country;
        },
    }
})

export default store