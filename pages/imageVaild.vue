 <template>
    <div class="login-container">
        <h1>校验文件格式：不上传后端，只校验格式。</h1>
        <h1>可以随意修改文件后缀名，原理就是校验文件的头尾信息</h1>
        <div ref="drag" id="drag">
            <input type="file" name="file" @change="fnFileChanhe">
        </div>
        <div>
            <el-progress :stroke-width="26" :text-inside="true" :percentage="uploadProgress"></el-progress>
        </div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="文件格式" prop="type">
                <el-checkbox-group v-model="ruleForm.type">
                    <el-checkbox v-for="type in imageTypes" :label="type" name="type" :key="type"></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item>
                <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="fnCheckImage('ruleForm', 'common')">普通校验</el-button>
                <span>校验结果：{{isImageVaild1}}</span>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="fnCheckImage('ruleForm', 'info')">根据文件信息校验</el-button>
                <span>校验结果：{{isImageVaild2}}</span>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import md5 from "md5";
export default {
    layout: "login",
    data() {
        return {
            file: null,
            uploadProgress: 0,
            imageTypes: ["gif", "png", "jpg"],
            ruleForm: {
                type: []
            },
            rules: {
                type: [
                    { type: 'array', required: true, message: '请至少选择一个文件类型', trigger: 'change' }
                ]
            },
            isImageVaild1: '',
            isImageVaild2: ''
        }
    },
    computed: {

    },
    methods: {
        resetForm(formName) {
            this.isImageVaild1 = '';
            this.isImageVaild2 = '';
            this.$refs[formName].resetFields();
        },
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
        // 校验文件格式
        async fnIsImage(file) {
            let checks = {
                gif: await this.fnIsGif(file),
                png: await this.fnIsPng(file),
                jpg: await this.fnIsJpg(file)
            }
            Promise.all(this.ruleForm.type.map(type => checks[type])).then(res => {
                this.isImageVaild2 = res.includes(true) ? "正确" : "错误";
            })
        },
        fnFileChanhe(e) {                        
            const [file] = e.target.files
            // 1.通过文件的后缀名判断文件格式，不准确，后缀名是可以修改的                     
            if (!file) {
                return
            }
            this.file = file
        },
        async fnCheckImage(formName, type) {
            if (!this.file) {
                this.$message.error('请先上传文件');
                return
            } 
            this.$refs[formName].validate(async (valid) => {
                if (valid) {                    
                    if (type === 'common') {
                        let type = this.file.type;
                        let isVaild = false;
                        this.ruleForm.type.forEach(key => {
                            if (type.includes(key)) {
                                isVaild = true
                            }
                        })
                        this.isImageVaild1 = isVaild ? "正确" : "错误";
                    } else if (type === 'info') {
                        await this.fnIsImage(this.file);
                    }
                }
            });
        }
    },
    async mounted() {
        let res = await this.$http.get("/user/info")
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