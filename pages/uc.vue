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
        /**
         * blob构造函数是File
         * FileReader读取文件
         */
        async blobToString(blob) {
            return new Promise(resolve => {
                const reader = new FileReader()
                reader.onload = function() {
                    // 1.将结果转为unicode编码，2.转成16进制，再转大写
                    let res = reader.result.split('')
                                .map(i => i.charCodeAt())
                                .map(j => j.toString(16).toUpperCase())
                                .join(' ')
                    // 返回转换后的结果
                    resolve(res)
                }
                // 调用读取文件方法
                reader.readAsBinaryString(blob)
            })
        },
        /**
         * 判断图片文件头信息
         * gif文件头前6个16进制 47 49 46 38 37 61，47 49 46 38 39 61
         * GIF87A，GIF89A  每个字符ascii拿出来转成16进制
         * 后四位表示宽高
         */
        async fnIsGif(file) {
            let res = await this.blobToString(file.slice(0, 6))            
            return res === "47 49 46 38 37 61" || res === "47 49 46 38 39 61"
        },
        // png是前八位
        async fnIsPng(file) {
            let res = await this.blobToString(file.slice(0, 8))                        
            return res === "89 50 4E 47 0D 0A 1A 0A" || res === "89 50 4E 47 D A 1A A"
        },
        // jpg是头两位、后两位
        async fnIsJpg(file) {
            // file.size / 1024 就是文件大小
            let start = await this.blobToString(file.slice(0, 2))
            let end = await this.blobToString(file.slice(-2, file.size))    
            return start === "FF D8" && end === "FF D9"
        },
        async fnIsImage(file) {
            return await this.fnIsGif(file) || await this.fnIsPng(file) || await this.fnIsJpg(file)
        },
        fnFileChanhe(e) {                        
            const [file] = e.target.files
            // 1.通过文件的后缀名判断文件格式，不准确，后缀名是可以修改的                     
            if (!file) {
                return
            }
            this.file = file
        },
        /**
         * 先校验文件的格式
         */
        async fnUploadFile() {
            let isImage = await this.fnIsImage(this.file)            
            if (!isImage) {
                console.log("err: ", "文件格式有误");
                return
            }
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