import axios from "axios";
const token="844130b00a6dac7af9de648c555194a5"

export default function request(config: any) {
    config.params={
        key:token,
        ...config.params
    }
    const service=axios.create({
        baseURL: 'https://restapi.amap.com/',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    service.interceptors.request.use(
        config => {
            return config
        },
        error => {
            return Promise.reject(error)
        }
    )
    service.interceptors.response.use(
        response => {
            return response.data
        },
        error => {
            return Promise.reject(error)
        }
    )
    return service(config)
} 