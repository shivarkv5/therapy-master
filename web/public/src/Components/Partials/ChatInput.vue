<template>
    <div class="bottomchat">
        <div class="chat-container">

            <div class="flexible">
                
                <!-- Text input -->

                <div class="input-container">
                    <input :aria-label="config.i18n[lang()].inputTitle" class="input" type="text" :placeholder="config.i18n[lang()].inputTitle" v-model="query" @keypress.enter="submit()" />
                </div>

                <!-- Send message button (arrow button) -->

                <div :aria-label="config.i18n[lang()].sendTitle" :title="config.i18n[lang()].sendTitle" class="button-container" v-if="micro == false && query.length > 0" @click="submit()">
                    <i class="material-icons" aria-hidden="true">arrow_upward</i>
                </div>

                <!-- Microphone Button -->

                <div :aria-label="config.i18n[lang()].microphoneTitle" :title="config.i18n[lang()].microphoneTitle" class="button-container mic_button" :class="{'mic_active': micro}" @click="micro = !micro" v-else>
                    <i class="material-icons" aria-hidden="true">mic</i>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="sass" scoped>
.bottomchat
    position: absolute
    bottom: 0
    left: 0
    width: 100%
    box-shadow: 0 2px 8px 0 rgba(0,0,0,.08)
    background-color: white

.flexible
    display: flex

.chat-container
    position: fixed
    width: 96%
    bottom: 0
    background: #fff
    margin-left: auto
    margin-right: auto
    padding: 12px

.input
    font-size: 16px
    font-weight: 500
    width: 100%
    box-sizing: border-box
    background-color: transparent
    border: none
    outline: none
    padding-left: 8px
    padding-right: 8px

.input-container
    width: 100%
    padding: 8px
    box-sizing: border-box
    border-radius: 40px
    flex: 1 0 0
    background-color: #F1F3F4

.button-container
    padding: 8px
    width: 24px
    height: 24px
    margin-left: 6px
    border-radius: 50%
    cursor: pointer
    background-color: black
    color: white

.mic_button
    background-color: #F1F3F4
    color: rgba(0,0,0,.8)
    font-size: 24px

.mic_active
    background-color: #F44336
    color: white
</style>

<script>

export default {
    name: 'ChatInput',
    props: [],
    components: {},
    data(){
        return {
            query: '',
            micro: false,
            recognition: null
        }
    },
    created(){
        let recognition
        if(window.webkitSpeechRecognition){
            recognition = new webkitSpeechRecognition()
            recognition.interimResults = true
            recognition.lang = this.lang()
        }

        this.recognition = recognition
    },
    watch: {
        /* This function triggers when user clicks on the microphone button */
        micro(bool){
            let self = this // <- correct scope

            if(bool == true){
                /* When value is true, start voice recognition */
                this.recognition.start()
                this.recognition.onresult = (event) => {
                    for (let i = event.resultIndex; i < event.results.length; ++i){
                        self.query = event.results[i][0].transcript // <- push results to the Text input
                    }
                }
                
                this.recognition.onend = () => {
                    self.recognition.stop()
                    self.micro = false
                    self.submit(self.query) // <- submit the result
                }
            }

            else {
                this.recognition.abort() // <- if user stops the recognition, abort it (in V1 this prevented users from starting a new recording)
            }
        }
    },
    methods: {
        submit(){
            if(this.query.length > 0){
                this.$emit('submit', this.query)
                this.query = ''
            }
        }
    }
}
</script>
