 <template>
  <div class="login-container">
    <h1>计算md5的三种方式</h1>
    <div id="drag" ref="drag">
      <input @change="fnFileChanhe" name="file" type="file" />
    </div>
    <div>
      <el-progress :percentage="uploadProgress" :stroke-width="26" :text-inside="true"></el-progress>
    </div>
    <div>
      <el-button @click="fnUploadFile">计算md5：</el-button>
      <div>web Worker: {{workerHash}}</div>
      <div>requestIdleCallback: {{idleHash}}</div>
      <div>抽样计算: {{sampleHash}}</div>
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
      uploadProgress: 0,
      chunkSize: 0.1 * 1024 * 1024,
      hashPregress: 0,
      workerHash: '',
      idleHash: '',
      sampleHash: ''
    }
  },
  computed: {},
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
      this.chunks = this.fnCreateFileChunk(this.file)
      // hash是作为文件的唯一标识
      this.workerHash = await this.fnCalculateHashWorker(this.chunks)
      this.idleHash = await this.fnCalculateHashIdle(this.chunks)
      this.sampleHash = await this.fnCalculateHashSample(this.chunks)
      return
      let isImage = await this.fnIsImage(this.file)
      if (!isImage) {
        console.log('err: ', '文件格式有误')
        return
      }
      // 由于文件是二进制的，所有要放在formdata
      const formdata = new FormData()
      formdata.append('name', 'file')
      formdata.append('file', this.file)
      let res = await this.$http.post('/uploadFile', formdata, {
        onUploadProgress: e => {
          this.uploadProgress = Number(((e.loaded / e.total) * 100).toFixed(2))
        },
      })
    },
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
}
</style>