 <template>
    <div class="login-container">
        <h1>用户</h1>
    </div>
</template>
<script>
import md5 from "md5";
export default {
    layout: "login",
    data() {
        return {

        }
    },
    computed: {

    },
    methods: {

    },
    async mounted() {
        let res = await this.$http.get("/user/info")
        console.log("res", res);
        
    }
}
</script> 

<style lang="stylus">
.login-form
    width 800px
    margin 50px auto
</style>