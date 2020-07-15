 <template>
  <div class="login-container">
    <h1>秒传文件、断点续传</h1>
    <div id="drag" ref="drag">
      <input @change="fnFileChanhe" name="file" type="file" />
    </div>
    <el-form ref="form" label-width="120px">
      <el-form-item label="计算hash的进度">
        <el-progress class="progress-style" :percentage="hashPregress" :stroke-width="26" :text-inside="true"></el-progress>
      </el-form-item>
      <el-form-item label="上传文件的进度">
        <el-progress class="progress-style" :percentage="uploadProgress" :stroke-width="26" :text-inside="true"></el-progress>
      </el-form-item>
      <el-form-item label="每个切片大小">
        <el-input-number :disabled="!!file" v-model="num" :min="0.1" :step="0.1" :max="1" label="描述文字"></el-input-number>
        <span>M</span>
      </el-form-item>
      <el-form-item label="每个切片宽高">
        <el-input-number :disabled="!!file" v-model="sliceWidth" :min="10" :step="1" :max="30" label="描述文字"></el-input-number>
        <span>px</span>
      </el-form-item>
      <el-form-item>
        <el-button @click="fnUploadFile">上传</el-button>
        <!-- <el-button @click="fnClearPublic">删除文件夹</el-button> -->
      </el-form-item>
    </el-form>
    <div :style="{width: chunkWidth + 'px'}" class="chunks-container">
      <div :key="chunk.name" class="chunks-item" v-for="chunk in chunks"
           :style="{width: sliceWidth + 'px', height: sliceWidth + 'px', lineHeight: (sliceWidth - 2) + 'px'}">
        <div
          :class="{
            'uploading': chunk.progress > 0 && chunk.progress < 100, 'success': chunk.progress === 100, 
            'error': chunk.progress < 0}"
          :style="{height: chunk.progress + '%'}"
        >
          <i class="el-icon-loading" v-if="chunk.progress > 0 && chunk.progress < 100"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import md5 from 'md5'
import sparkMD5 from 'spark-md5'
export default {
  layout: 'login',
  data() {
    return {
      file: null,
      num: 0.1,
      hashPregress: 0,
      chunks: [],
      sliceWidth: 20,
      merged: false
    }
  },
  computed: {
    chunkSize: function() {
      return Math.floor(1024 * 1024 * this.num)
    },
    chunkWidth: function() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * this.sliceWidth
    },
    uploadProgress: function() {
      if (!this.file || !this.chunks.length) {
        return 0
      }
      let loaded = this.chunks
        .map(item => {
          return item.chunk.size * item.progress
        })
        .reduce((a, b) => a + b, 0)
      return Number(((loaded / this.file.size)).toFixed(2))
    },
  },
  methods: {
    fnBindEvent() {
      const drag = this.$refs.drag
      drag.addEventListener('dragover', e => {
        drag.style.borderColor = 'red'
        e.preventDefault()
      })
      drag.addEventListener('dragleave', e => {
        drag.style.borderColor = '#eee'
        e.preventDefault()
      })
      drag.addEventListener('drop', e => {
        e.preventDefault()
        const fileList = e.dataTransfer.files
        this.file = fileList[0]
        drag.style.borderColor = '#eee'
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
          let res = reader.result
            .split('')
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
      return res === '47 49 46 38 37 61' || res === '47 49 46 38 39 61'
    },
    // png是前八位
    async fnIsPng(file) {
      let res = await this.blobToString(file.slice(0, 8))
      return res === '89 50 4E 47 0D 0A 1A 0A' || res === '89 50 4E 47 D A 1A A'
    },
    // jpg是头两位、后两位
    async fnIsJpg(file) {
      // file.size / 1024 就是文件大小
      let start = await this.blobToString(file.slice(0, 2))
      let end = await this.blobToString(file.slice(-2, file.size))
      return start === 'FF D8' && end === 'FF D9'
    },
    async fnIsImage(file) {
      return (
        (await this.fnIsGif(file)) ||
        (await this.fnIsPng(file)) ||
        (await this.fnIsJpg(file))
      )
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
     * 将文件切片
     */
    fnCreateFileChunk(file) {
      let chunks = []
      let cur = 0
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + this.chunkSize) })
        cur = cur + this.chunkSize
      }
      return chunks
    },
    // 影分身，计算md5值
    async fnCalculateHashWorker() {
      // new worker 是加载另外额外的一个js
      // 就是开了一个主线程之外的进程
      return new Promise(resolve => {
        this.worker = new Worker('/hash.js')
        // 注册两个事件，传递、回传
        this.worker.postMessage({ chunks: this.chunks })
        this.worker.onmessage = e => {
          const { progress, hash } = e.data
          this.hashPregress = Number(progress.toFixed(2))
          // hash有值了，说明计算完了
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    // 时间切片
    async fnCalculateHashIdle(file) {
      let chunks = this.chunks
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer()
        let count = 0
        const appendToSpark = async file => {
          return new Promise(res => {
            const reader = new FileReader()
            // 按照数组的形式读进来？相当于把这个对象读在blob？
            reader.readAsArrayBuffer(file)
            reader.onload = e => {
              spark.append(e.target.result)
              res()
            }
          })
        }
        const workLoop = async deadLine => {
          while (count < chunks.length && deadLine.timeRemaining() > 1) {
            await appendToSpark(chunks[count].file)
            count++
            if (count < chunks.length) {
              this.hashPregress = Number(
                ((100 * count) / chunks.length).toFixed(2),
              )
            } else {
              this.hashPregress = 100
              resolve(spark.end())
            }
          }
          window.requestIdleCallback(workLoop)
        }
        window.requestIdleCallback(workLoop)
      })
    },
    // 布隆过滤器：判断数据的存在与否
    // 假设一个单位是2M，头取2M，往后每2M取前中后各2各字节，最后不满2M的算是一个抽样
    // 损失一小部分的精度，大大提升计算的效率，很划算的
    // 再大的文件，比如1G的文件：也是4、5M的样子
    // 某些误判：一个文件可能只修改了其中某个字节，这种概率太小
    // 所以，这种算法，hash一样，文件不一定一样。hash不一样，文件一定不一样
    async fnCalculateHashSample() {
      return new Promise(resolve => {
        const spark = new sparkMD5.ArrayBuffer()
        const reader = new FileReader()
        const file = this.file
        const size = file.size

        const offset = 2 * 1024 * 1024
        const chunks = [file.slice(0, offset)]

        let cur = offset
        // 开头取2M，往后每隔2M取前中后各2字节，余下不够2M全算上
        while (cur < size) {
          // 不一定是2M?小于等于2M
          if (cur + offset >= size) {
            chunks.push(file.slice(cur, cur + offset))
          } else {
            let mid = cur + offset / 2
            let end = cur + offset
            chunks.push(cur, cur + 2)
            chunks.push(mid, mid + 2)
            chunks.push(end - 2, end)
          }
          cur = cur + offset
        }
        // 循环结束后，chunks会是一个前2M、中间采样、后2M的组合
        // 读取这个采样数组
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = e => {
          spark.append(e.target.result)
          this.hashPregress = 100
          resolve(spark.end())
        }
      })
    },
    /**
     * 先校验文件的格式
     */
    async fnUploadFile() {
      const chunks = this.fnCreateFileChunk(this.file)
      // 可以先用抽样hash判断是文件否已存在
      this.hash = await this.fnCalculateHashSample(this.chunks)
      // 询问后端，文件是否上传过，如果没有，是否有上传过的切片
      let data = {
        ext: this.file.name.split(".").pop(),
        hash: this.hash
      }
      let res = await this.$http.post("/checkFile", data)
      let uploadedChunks = []
      if (res && res.success) {
        uploadedChunks = res.result.uploadedChunks
        if (res.result.loaded) {
          this.$message({
            message: "秒传成功",
            type: 'success'
          });
          return
        }
      }
      // 给每个切片都加上hash的标识、索引。方便给后端再把这些切片组合成起来
      this.chunks = chunks.map((chunk, index) => {
        let name = `${this.hash}-${index}`;
        return {
          hash: this.hash,
          name,
          index,
          chunk: chunk.file,
          progress: uploadedChunks.includes(name) ? 100 : 0
        }
      })
      await this.fnUploadChunks()
    },
    async fnUploadChunks() {
      // 将各个切片转换成formData对象
      const requets = this.chunks.filter(item => !item.progress).map(chunk => {
        let keys = ['hash', 'name', 'chunk']
        let formData = new FormData()
        keys.forEach(key => {
          formData.append(key, chunk[key])
        })
        return {formData, index: chunk.index}
      })
      // 将每个切片转换成promise对象，存起来
      requets.map(({formData, index}) => {
        return this.$http.post('/uploadSliceFile', formData, {
          onUploadProgress: e => {
            // 这样子，每个切片都有自己的进度条了
            this.chunks[index]['progress'] = Number(
              ((e.loaded / e.total) * 100).toFixed(2),
            )
          },
        })
      })
      // 异步数量的控制
      // Promise.all有个问题，就是发起的请求过多，依然会使浏览器变得卡顿
      await Promise.all(requets)
      // 放合并文件请求
      await this.mergeRequest()
    },
    async mergeRequest() {
      let data = {
        ext: this.file.name.split(".").pop(),
        size: this.chunkSize,
        hash: this.hash
      }
      let res = await this.$http.post("/mergeUploadedSliceFile", data)
      if (res && res.success) {
        this.$message({
          message: res.message,
          type: 'success'
        });
      }
    },
    async fnClearPublic() {
      let res = await this.$http.get('/clearPublic')
    }
  },
  async mounted() {
    let res = await this.$http.get('/user/info')
    console.log('res', res)
    this.fnBindEvent()
  },
}
</script> 

<style lang="stylus">
#drag {
  height: 100px;
  line-height: 100px;
  border: 2px dashed #eee;
  text-align: center;
  margin: 10px
}
.progress-style
  width: 500px

.chunks-container {
  margin: 10px
  .chunks-item {
    border: 1px solid black;
    background: #eee;
    float: left;

    >.success {
      background: green;
    }

    >.uploading {
      background: blue;
    }

    >.error {
      background: red;
    }
  }
}
</style>