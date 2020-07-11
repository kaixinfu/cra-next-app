<template>
    <div>
        <nuxt></nuxt>
    </div>
</template>
<script>
export default {
    
}
</script>

<style lang="stylus">
.login-container
    width 100%
    height 100%
    .login-form
        width 500px
        padding 100px auto
        margin 0 auto
        overflow hidden
    .logo-container
        text-align center
        margin-bottom 20px
        img
           width 200px
    .captcha-container
        position relative
        width 400px
        .el-button
            width 80px
            height 40px
            padding 0
            line-height 40px
        .captcha
             position absolute
             right -100px
             img 
                width 90px
                height 50px
                cursor pointer
</style>