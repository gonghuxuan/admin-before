import request from '@/utils/request'

export function get(url, params) {
  return request({
    url: url.url,
    method: 'get',
    data: params
  })
}

export function post(url, params) {
  return request({
    url: url.url,
    method: 'post',
    data: params
  })
}
