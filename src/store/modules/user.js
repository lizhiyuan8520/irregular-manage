import { login, logout, getInfo, irLogin } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
    'user', {
        state: () => ({
            token: getToken(),
            id: '',
            name: '',
            avatar: '',
            roles: [],
            permissions: []
        }),
        actions: {
            // 登录
            login(userInfo) {
                const username = userInfo.username.trim()
                const password = userInfo.password
                const code = userInfo.code
                const uuid = userInfo.uuid
                return new Promise((resolve, reject) => {
                    login(username, password, code, uuid).then(res => {
                        console.log(res);
                        setToken(res.token)
                        this.token = res.token
                        resolve()
                    }).catch(error => {
                        reject(error)
                    })
                })
            },
            irLogin(userInfo) {
                const username = userInfo.username.trim()
                const password = userInfo.password
                const captcha = userInfo.code
                return new Promise((resolve, reject) => {
                    irLogin({ username, password, captcha }).then(res => {
                        setToken(res.data.token)
                        this.token = res.data.token
                        this.permissions = res.data.permsList
                        resolve()
                    }).catch(error => {

                        reject(error)
                    })
                })
            },
            // 获取用户信息
            getInfo() {
                return new Promise((resolve, reject) => {
                    getInfo().then(res => {
                        console.log("---getInfo--res------",res);
                        const user = res.user;
                        const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;

                        if (user.roles && user.roles.length > 0) { // 验证返回的roles是否是一个非空数组
                            this.roles = user.roles
                            this.permissions = res.permissions
                        } else {
                            this.roles = ['ROLE_DEFAULT']
                        }
                        this.id = user.userId
                        this.name = user.userName
                        this.avatar = avatar
                        resolve(res)
                    }).catch(error => {
                        reject(error)
                    })
                })
            },
            // 退出系统
            logOut() {
                return new Promise((resolve, reject) => {
                    logout(this.token).then(() => {
                        this.token = ''
                        this.roles = []
                        this.permissions = []
                        removeToken()
                        resolve()
                    }).catch(error => {
                        reject(error)
                    })
                })
            }
        }
    })

export default useUserStore