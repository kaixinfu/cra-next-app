 <template>
    <div>
        <el-form class="login-form" :model="ruleForm" :rules="rules" ref="registerRef">
            <el-form-item props="email">
                <span>
                    <i class="el-icon-mobile"></i>
                </span>
                <el-input placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item props="passwd">
                <span>
                    <i class="el-icon-lock"></i>
                </span>
                <el-input placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item props="captcha">
                <img @click="fnUpdateCaptcha" :src="captchaUrl" alt="">
                <el-input placeholder="请输入验证码"></el-input>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
    layout: "login",
    data() {
        return {
            captchaUrl: '',
            ruleForm: {
                name: '',
                region: '',
            },
            rules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'change' }
                ],
                passwd: [
                    { required: true, message: '请输入密码', trigger: 'change' }
                ],
                captcha: [
                    { required: true, message: '请输入验证码', trigger: 'change' }
                ]
            }
        }
    },
    methods: {
        fnUpdateCaptcha() {            
            this.captchaUrl = '/api/captcha?_t=' + new Date().getTime();
        }
    },
    mounted() {        
        this.fnUpdateCaptcha();
    }
}
</script> 

<style lang="stylus">
.login-form
    width 800px
    margin 50px auto
</style>