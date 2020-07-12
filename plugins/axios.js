import Vue from 'vue'
import axios from 'axios'
import {MessageBox} from "element-ui"

const service = axios.create({
    baseURL: "/api"
})

export default ({store, redirect}) => {
    // 请求拦截 token
    service.interceptors.request.use(async config => {
        let token = localStorage.getItem("token")
        if (token) {
            config.headers.common['Authorization'] = 'Bearer ' + token
        }
        return config
    })
    // 响应拦截
    service.interceptors.response.use(async res => {
        let {data} = res
        switch(data.code) {
            case 401:
                MessageBox.confirm("登录失效", "失效", {
                    confirmButtonText: "",
                    showCancelButton: false,
                    type: "warning"
                }).then(res => {
                    localStorage.removeItem("token")
                    redirect({path: "/login"})
                })
                return
        }
        return data
    })
}
Vue.prototype.$http = service;

export const http = service
