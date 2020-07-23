<template>
    <div ref="list" class="virtual-list-container" @scroll="fnScrollEvent($event)">
        <div class="virtual-item" :style="{height: listHight}">

        </div>
        <div class="foot-list" :style="{top: topHight}" >
            <article-item 
                class="virtual-list-item" 
                v-for="item in visibleData"
                :key="item._id"
                :article="item"
                :style="{height: size + 'px'}">
            </article-item>
        </div>
    </div>
</template>
<script>
import ArticleItem from "./ArticleItem.vue"
export default {
    components: {ArticleItem},
    props: {
        listData: {
            type: Array,
            default: () => []
        },
        size: {
            type: Number,
            default: 200
        }
    },
    data() {
        return {
            start: 0,
            end: 0,
            screenHeight: 800,
            startOffset: 0,
        }
    },
    computed: {
        listHight: function() {
            return this.listData.length * this.size + 'px'
        },
        topHight: function() {
            return this.startOffset + 'px'
        },
        visibleCount: function() {
            return Math.ceil(this.screenHeight / this.size)
        },
        visibleData: function() {
            return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
        }
    },
    methods: {
        fnScrollEvent() {
            let scrollTop = this.$refs.list.scrollTop
            this.start = Math.floor(scrollTop+this.size)
            this.end = this.start+this.visibleCount
            this.startOffset = scrollTop - (scrollTop % this.size)
        }
    },
    mounted() {
        this.end = this.start + this.visibleCount
    }
}
</script> 

<style scoped>
.virtual-list-container {
    height: 100%;
    overflow: hidden;
    position: relative;
}
.virtual-item {
    position: absolute;
    left: 0px;
    top: 0px;
    right: 0px;
    z-index: -1;
}
.foot-list {
    position: absolute;
    left: 0px;
    top: 0px;
    right: 0px;
}
.virtual-list-item {
    padding: 10px;
    color: blue;
    border-bottom: solid red 1px;
}
</style>