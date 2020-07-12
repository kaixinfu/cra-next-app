 <template>
    <div class="login-container">
        <h1>用户</h1>
        <div ref="drag" id="drag">
            <input type="file" name="file" @change="fnFileChanhe">
        </div>
        <div>
            <el-progress :stroke-width="26" :text-inside="true" :percentage="uploadProgress"></el-progress>
        </div>
        <div>
            <el-button @click="fnUploadFile">上传</el-button>
        </div>
    </div>
</template>
<script>
import md5 from "md5";
export default {
    layout: "login",
    data() {
        return {
            file: null,
            uploadProgress: 0
        }
    },
    computed: {

    },
    methods: {
        fnBindEvent() {
            const drag = this.$refs.drag
            drag.addEventListener("dragover", e => {                
                drag.style.borderColor = "red"
                e.preventDefault()
            })
            drag.addEventListener("dragleave", e => {
                drag.style.borderColor = "#eee"
                e.preventDefault()
            })
            drag.addEventListener("drop", e => {
                e.preventDefault()
                const fileList = e.dataTransfer.files
                this.file = fileList[0]
                drag.style.borderColor = "#eee"
            })
        },
        fnFileChanhe(e) {                        
            const [file] = e.target.files            
            if (!file) {
                return
            }
            this.file = file
        },
        async fnUploadFile() {
            // 由于文件是二进制的，所有要放在formdata
            const formdata = new FormData()
            formdata.append("name", "file")
            formdata.append("file", this.file)
            let res = await this.$http.post("/uploadFile", formdata, {
                onUploadProgress: e => {                    
                    this.uploadProgress = Number(((e.loaded/e.total)*100).toFixed(2))
                }
            })
        }
    },
    async mounted() {        
        let res = await this.$http.get("/user/info")
        console.log("res", res);
        this.fnBindEvent()
    }
}
</script> 

<style lang="stylus">
#drag
    height 100px
    line-height 100px
    border 2px dashed #eee
    text-align center
</style>