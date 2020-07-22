<template>
  <el-container>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="1">
          <span>logo</span>
        </el-menu-item>
        <el-menu-item index="2">
          <nuxt-link to="/"></nuxt-link>
        </el-menu-item>

        <el-menu-item index="3" v-if="userInfo.id">
          <span>退出</span>
        </el-menu-item>
        <el-menu-item index="4" v-if="userInfo.id">
          <span>{{userInfo.nickname}}</span>
        </el-menu-item>
        <el-menu-item index="5" v-if="userInfo.id">
          <nuxt-link to="/editor/new">写文章</nuxt-link>
        </el-menu-item>

        <el-menu-item index="6" v-if="!userInfo.id">
          <nuxt-link to="/editor/new">注册</nuxt-link>
        </el-menu-item>
        <el-menu-item index="7" v-if="!userInfo.id">
          <nuxt-link to="/editor/new">登录</nuxt-link>
        </el-menu-item>

      </el-menu>
    </el-header>
    <el-main>
      <nuxt />
    </el-main>
    <el-footer>Footer</el-footer>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1"
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user
    }
  },
  methods: {
    async fnGetUserInfo() {
      let token = localStorage.getItem("token")
      if (token) {
        this.$store.dispatch("user/detail")
      }
    },
    handleSelect() {

    }
  },
  mounted() {
    this.fnGetUserInfo()
  }
}
</script>
<style>
</style>
