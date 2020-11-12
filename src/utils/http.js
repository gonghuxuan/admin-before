import axios from 'axios'
import store from '../store/index.js'

// let Base64 = require("js-base64").Base64;

axios.defaults.timeout = 5000
// axios.defaults.baseURL = 'http://139.9.58.19:40001';
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
}

// 请求拦截器
axios.interceptors.request.use(
  config => {
    const { url, data, callback = false } = config || {}
    const newData = {
      Form: [
        {
          FormData: data || {},
          FormHead: { FormId: url.FormId || '' }
        }
      ]
    }
    Object.assign(config, { data: newData, url: url.url, callback })
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
// 响应拦截器
axios.interceptors.response.use(
  res => {
    const data = res.data || {}
    const message = codeMessage[res.status]
    // 判断响应头retstatus是否报错（F：是, N：否）
    const isError = res.headers.retstatus === 'F'
    const result = data.Form
      ? Object.assign(res, { data: data.Form[0].FormData })
      : res
    Object.assign(res, { isError, message })
    if (isError || res.status === 404 || res.isAxiosError) {
      isError && Object.assign(res, { message: res.data.RetMessage })
      return Promise.reject(res)
    }
    return result
  },
  err => {
    console.log(err.response, 11)
    if (err && err.response) {
      const obj = {
        url: err.response.config.url,
        status: err.response.status,
        statusText: err.response.statusText,
        message: codeMessage[err.response.status] || '请求失败'
      }
      // eslint-disable-next-line eqeqeq
      if (obj.status == 400) {
        obj.message =
          err.response.data.errorMsg || codeMessage[err.response.status]
      }
      if (err.response.data.errorCode === '999998') {
        store.commit('setUserInfo', {})
        sessionStorage.removeItem('isLogin')
      }
      return Promise.reject(obj)
    }
    return Promise.reject(err)
  }
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
export function get(url, params = {}) {
  const getTimestamp = new Date().getTime()
  return new Promise((resolve, reject) => {
    axios
      .get(url + '?getTimestamp=' + getTimestamp, {
        params: params
      })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post(url, data, timeout) {
  if (timeout) {
    axios.defaults.timeout = timeout._timeout
  } else {
    axios.defaults.timeout = 5000
  }
  // let config = { headers: {} };

  // const getTimestamp = new Date().getTime();

  // let newParams = encodeData(data)
  const newParams = data
  return new Promise((resolve, reject) => {
    console.log(url)
    axios.post(url, newParams).then(
      response => {
        resolve(response.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

