 <template>
    <div>
        <el-form class="login-form" :rules="rules">
            <el-form-item props="email">
                <span>
                    <i class="el-icon-mobile"></i>
                </span>
                <el-input placeholder="邮箱"></el-input>
            </el-form-item>
            <el-form-item props="passwd">
                <span>
                    <i class="el-icon-lock"></i>
                </span>
                <el-input placeholder="密码"></el-input>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
    layout: "login",
    data() {
        return {
            rules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'change' }
                ],
                passwd: [
                    { required: true, message: '请输入密码', trigger: 'change' }
                ],
            }
        }
    }
}
</script> 

<style lang="stylus">
.login-form
    width 800px
    margin 50px auto
</style>