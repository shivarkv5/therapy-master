<template>
    <a target="_blank" rel="noopener noreferrer" :href="url" class="suggestion">{{title}}</a>
</template>

<style lang="sass" scoped>
.suggestion
    font-weight: 600 !important
    border: 2px solid rgba(0,0,0,.1) !important
    /*border: 2px solid #FF9331 !important*/
    white-space: initial !important
    display: block !important
    font-size: 12px
    padding: 8px 12px
    border-radius: 40px
    color: rgba(0,0,0,.6)
    cursor: pointer
    margin-right: 5px
    margin-bottom: 12px

    &:hover
        color: black
        border: 2px solid rgba(0,0,0,.3) !important
</style>

<script>
export default {
    name: 'Suggestion',
    props: ['title', 'url']
}
</script>
