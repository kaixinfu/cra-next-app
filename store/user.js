import {http} from "../plugins/axios"

export const state = () => ({
    token: "",
    id: "",
    email: "",
    nickname: "",
    avatar: ""
})
  
export const mutations = {
    SET_TOKEN(state, token) {
        state.token = token
    },
    SET_USER(state, user) {
        state.id = user._id
        state.email = user.email
        state.avatar = user.avatar
        state.nickname = user.nickname
    }
}

export const actions = {
    detail: async ({state, commit}, data) => {        
        let res = await http.get("user/detail")
        if (res && res.success) {
            commit("SET_USER", res.result)
            return res
        }
    }
}