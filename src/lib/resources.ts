import { map, filter, compact, contain } from 'licia-es'

let isPerformanceSupported = false
const performance = (window as any).webkitPerformance || window.performance
if (performance && performance.getEntries) {
  isPerformanceSupported = true
}

export function getScripts(): string[] {
  if (isPerformanceSupported) {
    return getResources('script')
  }

  const elements = document.querySelectorAll('script')

  return compact(map(elements, element => element.src))
}

export function getImages(): string[] {
  if (isPerformanceSupported) {
    return getResources('img')
  }

  const elements = document.querySelectorAll('img')

  return compact(map(elements, element => element.src))
}

export function isImage(url: string) {
  return contain(getImages(), url)
}

function getResources(type: string) {
  return map(
    filter(
      performance.getEntries(),
      (entry: any) => entry.initiatorType === type
    ),
    entry => entry.name
  )
}
