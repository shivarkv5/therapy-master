<template>
  <main id="app" :key="forcerender">
    <!-- TopHead is the header with the information about the app -->

    <TopHead></TopHead>

    <section class="container">
      <!-- Welcome component is for onboarding experience and language picker -->

      <!--  <Welcome v-if="messages.length == 0" :app="app" @start="send(config.i18n[lang()].startPhrase)"></Welcome> -->

      <!-- Messages Table -->

      <section class="messages" v-if="invalid_token === true">Invalid token was provided</section>

      <section class="messages" v-if="messages.length > 0">
        <table v-for="m in messages" class="chat-window">
          <tr>
            <!-- My message -->

            <td>
              <div class="message-time">{{ moment(m.send_timestamp).format("MM/DD/YYYY hh:mm A") }}</div>
              <Bubble :text="m.query" from="me" />
            </td>
          </tr>

          <!-- Component iterator (Dialogflow Gateway Feature) -->

          <tr v-for="component in m.components">
            <td>
              <!-- Default / Webhook bubble -->

              <Bubble
                v-bind:id="'msg'+iterator"
                :text="component.content"
                v-if="component.name == 'DEFAULT'"
              />

              <!-- Simple Response -->
              <Bubble
                :text="component.content.displayText || component.content.textToSpeech"
                v-if="component.name == 'SIMPLE_RESPONSE'"
              />

              <!-- Card -->

              <Card
                :title="component.content.title"
                :subtitle="component.content.subtitle"
                :image="component.content.image"
                :text="component.content.formattedText"
                :button="component.content.buttons[0]"
                v-if="component.name == 'CARD'"
              />

              <!-- Carousel layout and cards -->
              <div class="carousel" v-if="component.name == 'CAROUSEL_CARD'">
                <Card
                  v-for="card in component.content"
                  @click.native="send(card.info.key)"
                  :key="card.info.key"
                  :title="card.title"
                  :image="card.image"
                  :subtitle="card.subtitle"
                  :text="card.description"
                />
              </div>

              <!-- List -->

              <List
                @select="send"
                :items="component.content.items"
                :title="component.content.title"
                v-if="component.name == 'LIST'"
              />

              <!-- Webhook Image -->

              <Picture v-if="component.name == 'IMAGE'" :image="component.content" />
            </td>
          </tr>
        </table>

        <table class="chat-window" v-if="Object.keys(suggestions).length > 0">
          <tr>
            <td>
              <!-- Displaying suggestions -->
              <Suggestions
                :suggestions="{check,lastquestion,suggestions,checkboxFlag}"
                @submit="send"
              ></Suggestions>
            </td>
          </tr>
        </table>
      </section>
    </section>

    <!-- #bottom is the anchor, we need, when new messages arrive, to scroll down -->
    <div id="audiocon">
      <audio id="myAudio">
        <source id="as" src />
      </audio>
    </div>
    <div id="button"></div>
    <div id="bottom"></div>

    <!-- ChatInput is made for submitting queres -->

    <ChatInput @submit="send"></ChatInput>

    <!-- Audio toggle (on the top right corner), used to toggle the audio output, default mode is defined in the settings -->
  </main>
</template>

<style lang="sass">
@import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600,700')

body
    margin: 0
    padding: 0
    font-family: 'Open Sans', sans-serif
    font-display: swap
    background-color: white

.container
    max-width: 500px
    margin-left: auto
    margin-right: auto
    padding-left: 6px
    padding-right: 6px
    padding-top: 100px
    padding-bottom: 120px
    position: relative
.bubble, .bubble.me {font-size: 14px; line-height: 1.7; border:none !important;}
.message-time {font-size: 12px; text-align: center; padding-right: 12px;}
@font-face
    font-family: 'Material Icons'
    font-style: normal
    font-weight: 400
    font-display: swap
    src: url(https://fonts.gstatic.com/s/materialicons/v42/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2')

.material-icons
    font-family: 'Material Icons'
    font-weight: normal
    font-style: normal
    font-size: 24px
    line-height: 1
    letter-spacing: normal
    text-transform: none
    display: inline-block
    white-space: nowrap
    word-wrap: normal
    direction: ltr
    -webkit-font-feature-settings: 'liga'
    -webkit-font-smoothing: antialiased
</style>

<style lang="sass" scoped>
.chat-window
    width: 100%

td
    width: 100%

.audio-toggle
    position: fixed
    top: 0
    right: 0
    margin: 8px
    z-index: 999
    padding: 10px
    background-color: #F1F3F4
    border-radius: 50%
    width: 24px
    height: 24px
    cursor: pointer
    color: rgba(0,0,0,.8)

.carousel
    overflow-x: scroll
    overflow-y: hidden
    white-space: nowrap
    -webkit-overflow-scrolling: touch
    padding-bottom: 20px
</style>

<script>
import Welcome from "./../Welcome/Welcome.vue";
import TopHead from "./../Partials/TopHead.vue";
import ChatInput from "./../Partials/ChatInput.vue";
import Suggestions from "./../Partials/Suggestions.vue";

import Bubble from "./../RichComponents/Bubble.vue";
import Card from "./../RichComponents/Card.vue";
import List from "./../RichComponents/List.vue";
import Picture from "./../RichComponents/Picture.vue";
import $ from "jquery";
import * as uuidv1 from "uuid/v1";
const session = uuidv1(); // <- We need to set our session, to identify a conversation by dialogflow (for context etc.)
var tablesCount = 0;
export default {
  name: "app",
  components: {
    Welcome,
    TopHead,
    ChatInput,
    Bubble,
    Card,
    List,
    Picture,
    Suggestions
  },
  data() {
    return {
      app: null,
      messages: [],
      language: "",
      config: this.config,
      moment: this.moment,
      invalid_token: false,
      forcerender: 0,
      checkboxFlag: 0,
      check: true,
      lastquestion: false
    };
  },
  created() {
    this.user_token = (this.getQueryStringValue("user_token") || "").trim();
    this.phone = (this.getQueryStringValue("phone") || "").trim();
    if (this.user_token === "") {
      this.invalid_token = true;
      return;
    }

    /* If history is enabled, the messages are retrieved from localStorage */
    if (
      localStorage.getItem("message_history") !== null &&
      this.config.app.history == false
    ) {
      this.messages = JSON.parse(localStorage.getItem("message_history"));
    } else {
      this.send(this.config.i18n[this.lang()].startPhrase, 0);
    }
    /* Cache Agent (this will save bandwith) */
    if (localStorage.getItem("agent") !== null) {
      this.app = JSON.parse(localStorage.getItem("agent"));
    // } else {
    //   fetch("/gateway1?format=true",{
    //     method:'POST',
    //     headers:{
    //       "content-type":'application/json'
    //     }
    //   })
    //     .then(response => {
    //       return response.json();
    //     })
    //     .then(agent => {
    //       this.app = agent;
    //       localStorage.setItem("agent", JSON.stringify(agent));
    //     });
    }
  },
  computed: {
    suggestions(data=null) {
      let last_message = this.messages[this.messages.length - 1].components;
      let suggestions = [];
      for (let component in last_message) {
        if (last_message[component].name == "SUGGESTIONS") {
          suggestions.text_suggestions = last_message[component].content;
        }
        if (last_message[component].name == "LINK_OUT_SUGGESTION") {
          suggestions.link_suggestion = last_message[component].content;
        }
      }
      if(this.check){
          suggestions=[]
      }

      return suggestions;
      // <- the code above is used to extract suggestions from last message, to be able to display it on ChatInput
    }
  },
  watch: {
    /* This function is triggered, when new messages arrive */
    messages(messages) {
      setTimeout(() => {
        let app = document.querySelector("#app"); // <- We need to scroll down #app, to prevent the whole page jumping to bottom, when using in iframe
        if(this.messages.length>0){
        if (document.getElementsByClassName("messages")) {
          var md = document.getElementsByClassName("messages")[0];
          if (md['children']) {
            if (tablesCount != 0) {
              let diff = md.children.length - tablesCount;
              if (diff > 1) {
                md.children[
                  md.children.length - 1 - diff
                ].children[1].scrollIntoView({ behavior: "smooth" });
                tablesCount = md.children.length - 1;
              } else {
                if (
                  md.children[md.children.length - 1].children &&
                  md.children[md.children.length - 1].children.length > 1
                ) {
                  md.children[
                    md.children.length - 1
                  ].children[1].scrollIntoView({ behavior: "smooth" });
                } else if (
                  md.children[md.children.length - 1].children.length == 1
                ) {
                  md.children[
                    md.children.length - 1
                  ].children[1].scrollIntoView({ behavior: "smooth" });
                }
              }
            } else {
              if (
                md.children[md.children.length - 1].children &&
                md.children[md.children.length - 1].children.length > 1
              ) {
                //console.log("last index length > 1");
                md.children[md.children.length - 1].children[0].scrollIntoView({
                  behavior: "smooth"
                });
              } else if (
                md.children[md.children.length - 1].children.length == 1
              ) {
                //console.log("last index length 1");
                md.children[md.children.length - 1].children[0].scrollIntoView({
                  behavior: "smooth"
                });
              }
              tablesCount = md.children.length - 1;
            }
          }else{
            //console.log('children not found')
          }
        }
      }
      }, 2);

      if (this.config.app.history == true)
        localStorage.setItem("message_history", JSON.stringify(messages)); // <- Save history if the feature is enabled
    }
  },
  methods: {
    getQueryStringValue(key) {
      try{
      return decodeURIComponent(
        window.location.search['replace']?window.location.search.replace(
          new RegExp(
            "^(?:.*[&\\?]" +
              encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
              "(?:\\=([^&]*))?)?.*$",
            "i"
          ),
          "$1"
        ):""
      );
      }catch(e){
        return "";
      }
    },


    send(q) {
      if(q!==''){
      let send_timestamp = new Date().getTime();
      let request = {
        user_token: this.user_token || "",
        q: q,
        phone: this.phone || "",
        session_id: session,
        lang: this.lang() // <- the request language is being set on the Welcome screen, make sure to inspect that as well.
      }; // <- this is how a Dialogflow Gateway request looks like, by the way
      // //console.log(request, this.config.app.gateway + '?format=true');
      if (q === "reset") {
        localStorage.clear();
        this.messages = [];
      }
      /* Make a request to gateway with formatting enabled */

      fetch("/gateway1" + "?format=true", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "content-type": "application/json" }
      })
        .then(response => {
          return response.json();
        })
        .then(response => {
          var vid = document.getElementById("myAudio");
          var ssa = document.getElementById("as");
          //   audioSource.src = `data:audio/wav;base64,${response.components[0].outaudio}`;
          //   voice.autoplay = true;
          //   voice.load();
          //   voice.play();
          //enableAutoplay();
          // ssa.src ="data:audio/wav;base64," + response.components[0].outaudio;
          //vid.autoplay=true;
          //vid.autoplay = true;
          // vid.load();
          // vid.play();
          var data = response;
          if (q === "reset") {
            delete data.query;
          }
          //delete data.components[0].outaudio;
          var selectionCheck = "";
          var selectitems = ["Selectable", "Disselectable"];

          ////console.log("Data is not recognized 1")
          if (data.components.length !== 1) {
            if (data.components[1].content.length > 1) {
              this.check = false;
            } else {
              this.check = true;
            }
          } else {
            this.check = true;
          }
          if (data.components[0].content === "Thank you. Good bye") {
            this.check = false;
          }
          if (data.components.length > 1) {
            var selectionCheck =
              data.components[1].content[data.components[1].content.length - 1];
            if (selectionCheck === selectitems[0]) {
              this.checkboxFlag = 1;
              data.components[1].content.pop();
            } else if (selectionCheck === selectitems[1]) {
              this.checkboxFlag = 0;
              data.components[1].content.pop();
            } else {
              this.checkboxFlag = 0;
            }
          }
          if (data.components.length === 2) {
            if (data.components[1].content[0] === "No") {
              data.components[1].content.unshift("Yes");
              this.lastquestion = true;
              this.check = false;
            }
          } else {
            this.check = false;
          }
          // //console.log("Data is not recognized 1"+JSON.stringify(data))
          if(q==="reset"){

          }else{
          data.query=q
          }
          console.log(data)
          this.messages.push(data);
          response["send_timestamp"] = send_timestamp;
          response["receive_timestamp"] = new Date().getTime();
          this.handle(data); // <- trigger the handle function (explanation below)
          ////console.log(response) // <- (optional) log responses
        });
      }else{
        this.check= true
      }
    },
    handle(response) {
      /* This function is used for speech output */
      for (let component in response.components) {
        let text; // <- init a text variable

        /* Set the text variable according to component name */
        if (response.components[component].name == "DEFAULT")
          text = response.components[component].content;
        if (response.components[component].name == "SIMPLE_RESPONSE")
          text = response.components[component].content.textToSpeech;

        let speech = new SpeechSynthesisUtterance(text);
        speech.voiceURI = "native"; // <- change this, to get a different voice

        /* This "hack" is used to format our lang format, to some other lang format (example: en -> en_EN). Mainly for Safari, Firefox and Edge */
        speech.lang = this.lang() + "-" + this.lang().toUpperCase();

        if (this.config.app.muted == false)
          window.speechSynthesis.speak(speech); // <- if app is not muted, speak out the speech
      }
    }
  }
};
</script>