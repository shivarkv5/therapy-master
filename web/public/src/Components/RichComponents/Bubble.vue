<template>
  <div>
    <div class="bubble" :class="{'me': from == 'me'}" v-if="makeLinksClickable(text)!==null" v-html="makeLinksClickable(text)"></div>
  </div>
</template>

<style lang="sass" scoped>
.bubble
    padding: 12px
    border-radius: 12px
    color: rgba(0,0,0,.8)
    border: 1.5px solid rgba(0,0,0,.1)
    display: inline-block
    width: 80%
    float: left
    border-top-left-radius: 0px;

.bubble a
    color: rgba(0,0,0,.8);

.me
    float: right
    background-color: #F1F3F4
    border: 1.5px solid #F1F3F4
    float: right
    border-top-left-radius: 12px;
</style>

<script>
export default {
  name: "Bubble",
  props: ["speech", "text", "from"],
  methods: {
    makeLinksClickable(text) {
      let text1;
      let exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
      if(text){
      var pat = new RegExp(exp)
      text1 = text.replace(exp, "<a target='_blank' href='$1'>$1</a>")
      let exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      return text1.replace(
        exp2,
        '$1<a target="_blank" href="http://$2">$2</a>'
      );
      }else{
        return null;
      }
    }
  }
};
</script>
