<template>
    <header class="app-head" :class="{'shrink': shrinked}">
        <!-- <img :alt="app.displayName" class="app-icon" :src="app.avatarUri" v-if="app.avatarUri" /> -->
        <div class="header-image">
        <h6  class="app-icon">Rachel</h6>
        </div>
    </header>
</template>

<style lang="sass" scoped>
.app-head
    z-index: 666
    padding-top: 15px
    padding-bottom: 10px
    position: fixed
    width: 100%
    display: flex
    transition: all .15s linear
    text-align: left
    padding-bottom: 20px
    background: white
    height: 40px
    justify-content: center
    align-items: center

.head-text
    margin-top: 3px
    margin-left: 80px;
    color: #fff
    font-size: 20px
    font-weight: 500

.header-image
    display: flex
    justify-content: center

.app-icon
    height: 30px;
    font-size: 25px;
    color: #2C84EC
    object-fit: cover;

    .app-name
        display: inline-block
        text-align: center
        margin-left: 10px
        transform: translateY(-8px)
        font-size: 18px
        font-weight: 500
        opacity: .8

.shrink
    transform: translateY(0px)
</style>

<script>
export default {
    name: 'TopHead',
    props: ['app'],
    data(){
        return {
            shrinked: false,
            current: 0
        }
    },
    created(){
        /* Add scroll listener and call handleScroll function, if user starts to scroll */
        window.addEventListener('scroll', this.handleScroll)
    },
    destroyed(){
        /* Destroy scroll listener */
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
        /* Trigger the function, when user is scrolling */
        handleScroll(){
            if(window.pageYOffset > 0 && window.pageYOffset > this.current){
                this.current = window.pageYOffset
                this.shrinked = true // <- shrink the toolbar if user scrolls down
            }
            if(window.pageYOffset > 0 && window.pageYOffset < this.current){
                this.current = window.pageYOffset
                this.shrinked = false // <- unshrink the toolbar if user scrolls up
            }
        }
    }
}
</script>

