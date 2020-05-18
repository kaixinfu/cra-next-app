 <template>
    <div class="login-container">
        <el-form class="login-form" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
            <div class="logo-container">
                <img src="/logo.png" alt="">
            </div>
            <el-form-item prop="email" label="邮箱">
                <el-input v-model="ruleForm.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>
            <el-form-item prop="captcha" label="验证码" class="captcha-container">
                <div class="captcha">
                    <img @click="fnUpdateCaptcha" :src="code.captchaUrl" alt="">
                </div>
                <el-input v-model="ruleForm.captcha" placeholder="请输入验证码"></el-input>
            </el-form-item>
            <el-form-item prop="nickname" label="昵称">
                <el-input v-model="ruleForm.nickname" placeholder="请输入昵称"></el-input>
            </el-form-item>
            <el-form-item prop="passwd" label="密码">
                <el-input v-model="ruleForm.passwd" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="repasswd" label="确认密码">
                <el-input v-model="ruleForm.repasswd" placeholder="请再次输入密码"></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
    layout: "login",
    data() {
        return {
            code: {
                captchaUrl: '',
            },
            ruleForm: {
                email: '',
                nickname: '',
                passwd: '',
                repasswd: '',
                captcha: ''
            },
            rules: {
                email: [
                    {required: true, message: '请输入邮箱', trigger: 'blur'},
                    {type: 'email', message: '请输入正确的邮箱'}
                ],
                nickname: [
                    {required: true, message: '请输入昵称', trigger: 'blur'}
                ],
                passwd: [
                    {required: true, pattern: /^[\w_-]{6,12}$/g, message: '请输入6到12位密码', trigger: 'blur'}
                ],
                repasswd: [
                    {required: true, message: '请再次输入密码', trigger: 'blur'},
                    {validator: (rule, value, callback) => {
                        if (value === '') {
                            callback(new Error('请再次输入密码'));
                        } else if (value !== this.ruleForm.passwd) {
                            callback(new Error('两次输入密码不一致!'));
                        } else {
                            callback();
                        }
                    }}
                ],
                captcha: [
                    {required: true, message: '请输入验证码', trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        fnUpdateCaptcha() {            
            this.code.captchaUrl = '/api/captcha?_t=' + new Date().getTime();
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {                
                if (valid) {
                    console.log('通过');
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
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