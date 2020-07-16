<template>
  <div class="container">
    <el-button type="primary" @click="fnGoto('imageVaild')">校验文件格式</el-button>
    <el-button type="primary" @click="fnGoto('md5')">计算文件md5</el-button>
    <el-button type="primary" @click="fnGoto('sliceUpload')">切片上传图片</el-button>
    <el-button type="primary" @click="fnGoto('reapirUpload')">断点续传</el-button>
    <el-button type="primary" @click="fnGoto('limitUpload')">控制并发上传</el-button>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  methods: {
    fnGoto(hash) {
      this.$router.push(hash)
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
