const urlApi = require('../utils/urlapi')
const rp = require('request-promise-native')
const { appID, appsecret } = require('../config')
const tools = require('../utils/tools')



class Wechat {
    constructor() {

    }
    getAccessToken() {
        const url = `${urlApi.accessToken}&appid=${appID}&secret=${appsecret}`;
        return new Promise((resolve, reject) => {
            rp({ method: 'GET', url, json: true })
                .then(res => {
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000
                    resolve(res)
                })
                .catch(err => {
                    reject('getAccessToken方法出问题了' + err)
                })
        })

    }
    saveAccessToken(accessToken) {
        return tools.writeFileAsync(accessToken, 'accessToken.json')
    }
    readAccessToken() {
        return tools.readFileAsync('accessToken.json')
    }
    isValidAccessToken(data) {
        data = JSON.parse(data)
        if (!data && !data.expires_in && !data.access_token) {
            return false
        }
        return data.expires_in > Date.now()
    }
    fetchAccessToken() {
        return this.readAccessToken()
            .then(async res => {
                if (this.isValidAccessToken(res)) {
                    return Promise.resolve(res)
                } else {
                    const res = await this.getAccessToken()
                    await this.saveAccessToken(res)
                    return Promise.resolve(res)
                }
            })
            .catch(async err => {
                const res = await this.getAccessToken()
                await this.saveAccessToken(res)
                return Promise.resolve(res)
            })
            .then(res => {
                this.access_token = res.access_token
                this.expires_in = res.expires_in
                return Promise.resolve(res)
            })
    }
}

(async () => {
    const w = new Wechat()
    let accessToken = await w.fetchAccessToken()
    console.log(accessToken)
})()