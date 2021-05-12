<template>
  <!-- Here are the suggestions -->
  <div class="suggestions" id="suggestions" v-if="suggestions.suggestions">
    <!-- -->

    <Suggestion
      class="list"
      id="list"
      v-if="suggestions.checkboxFlag===0"
      v-for="(suggestion, index) in suggestions.suggestions.text_suggestions"
      :key="index"
      :title="suggestion"
      @click.native="if(!suggestions.lastquestion)
                      {
                          $emit('submit', suggestion);
                          suggestions=[]
                      }
                      else
                      {
                        if(suggestion.trim()==='No'){
                          $emit('submit','No')
                        }else{
                          $emit('submit','');
                        }
                          suggestions=[];
                      }"
    />
    <div
      class="list"
      v-if="suggestions.checkboxFlag===1"
      v-for="(suggestion, index) in suggestions.suggestions.text_suggestions"
      :key="index"
    >
      <div class="suggestion" v-bind:id="'div'+index" @click="clicked(index)">
        <input
          type="checkbox"
          :value="suggestion"
          name="checkbox"
          @click="clicked(index)"
          v-bind:id="index"
        />
        <label for="index">{{suggestion}}</label>
      </div>
    </div>
    <input
      type="button"
      value="submit"
      id="submitbutton"
      v-if="suggestions.checkboxFlag===1"
      @click="checkedAns.length>0?send(checkedAns):''"
    />
    <Suggestion
      v-if="suggestions.suggestions.link_suggestion"
      :title="suggestions.suggestions.link_suggestion.destinationName"
      :url="suggestions.suggestions.link_suggestion.uri"
    />
  </div>
</template>

<style lang="sass" scoped>
.suggestion
    font-weight: 600 !important
    border: 2px solid rgba(0,0,0,.1) !important
    font-size: 12px
    text-align: left
    padding: 8px 12px
    border-radius: 40px
    color: rgba(0,0,0,.6)
    cursor: pointer
    margin-right: 5px
    margin-bottom: 12px

    &:hover
        color: black
        border: 2px solid rgba(0,0,0,.3) !important

#submitbutton
    background: cornflowerblue;
    padding: 10px 20px 10px 20px;
    border-radius: 20px;
    font-size: 15px;
    color: white;

.suggestions
    width: 80%
    border-radius: 1px 12px
    padding: 9px
    margin-left: 15px;
    text-align: center

.emptylist
    background: transparent
</style>

<script>
import Suggestion from "./../RichComponents/Suggestion";
export default {
  name: "Suggestions",
  props: ["suggestions"],
  components: {
    Suggestion
  },
  data() {
    return {
      query: "",
      checker: true,
      checkedAns: []
    };
  },
  methods: {
    submit() {
      if (this.query.length > 0) {
        this.$emit("submit", this.query);
        this.query = "";
      }
    },

    clicked(i) {
      var check = document.getElementById("" + i);
      if (check.checked !== true) {
        check.checked = true;
        console.log(check.value);
        this.checkedAns.push(check.value);
        console.log(this.checkedAns);
      } else {
        check.checked = false;
        // console.log("Here s the index value",index)
        this.checkedAns = this.checkedAns.filter((value, index) => {
          return value !== check.value;
        });
      }
    },
    send(a) {
      this.$emit("submit", a.toString().replace(",", ", "));
      this.checkedAns = [];
      a = [];
      var checked = document.getElementsByName("checkbox");
      for (var i = 0; i < checked.length; i++) {
        if (checked[i].checked) {
          checked[i].checked = false;
        }
      }
    }
  }
};
</script>
