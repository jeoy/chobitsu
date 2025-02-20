import { uniqId, random, startWith, Url, convertBin } from 'licia-es'
import axios from 'axios'

const prefix = random(1000, 9999) + '.'

export function createId() {
  return uniqId(prefix)
}

export function getAbsoluteUrl(url: string) {
  const a = document.createElement('a')
  a.href = url
  return a.href
}

export class ErrorWithCode extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function createErr(code: number, message: string) {
  return new ErrorWithCode(code, message)
}

export function getUrl() {
  const href = location.href
  if (startWith(href, 'about:')) {
    return parent.location.href
  }
  return href
}

export function getOrigin() {
  const origin = location.origin
  if (origin === 'null') {
    return parent.location.origin
  }
  return origin
}

export async function getTextContent(url: string, proxy = '') {
  return await getContent(url, 'text', proxy)
}

export async function getBase64Content(url: string, proxy = '') {
  return convertBin(await getContent(url, 'arraybuffer', proxy), 'base64')
}

async function getContent(url: string, responseType: any, proxy = '') {
  try {
    const urlObj = new Url(url)
    urlObj.setQuery('__chobitsu-hide__', 'true')
    const result = await axios.get(urlObj.toString(), {
      responseType,
    })
    return result.data
  } catch (e) {
    if (proxy) {
      try {
        const result = await axios.get(proxyUrl(proxy, url), {
          responseType,
        })
        return await result.data
      } catch (e) {
        /* eslint-disable */
      }
    }
  }

  return responseType === 'arraybuffer' ? new ArrayBuffer(0) : ''
}

function proxyUrl(proxy: string, url: string) {
  const urlObj = new Url(proxy)
  urlObj.setQuery('url', url)
  urlObj.setQuery('__chobitsu-hide__', 'true')
  return urlObj.toString()
}
