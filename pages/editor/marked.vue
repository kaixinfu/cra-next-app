<template>
<div>
    <div class="btn">
        <el-button @click="fnSubmit" type="primary">提交</el-button>
    </div>
    <el-row :gutter="20">
        <el-col :span="11">
            <textarea ref="textarea" class="mark-left" :value="content" @input="fnContentChange"></textarea>
        </el-col>
        <el-col :span="11">
            <div class="mark-right" v-html="markedCentent"></div>
        </el-col>
    </el-row>
</div>
</template>

<script>
import marked from 'marked'
export default {
    data() {
        return {
            content:`### 标题
            `
        }
    },
    components: {
    
    },
    computed: {
        markedCentent: function() {
            return marked(this.content, {})
        }
    },
    mounted() {
        this.fnTextareaEvent()
    },
    methods: {
        fnTextareaEvent() {
            this.$refs.textarea.addEventListener("patse", e => {

            })
        },
        fnSubmit() {
            console.log("this.content", this.content)
            console.log("markedCentent", this.markedCentent)
        },
        fnContentChange(e) {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                this.content = e.target.value
            }, 500)
        }
    }
}
</script>

<style>
.mark-left {
    width: 100%;
    height: 100vh;
    outline: none;
}
.btn {
    position: absolute;
    z-index: 100;
    right: 30px;
    top: 10px;
}
</style>
