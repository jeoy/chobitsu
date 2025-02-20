import { each, Emitter, strHash, toStr } from 'licia-es'
import { createId, getTextContent } from './util'

const elProto: any = Element.prototype

let matchesSel: any = () => false

if (elProto.webkitMatchesSelector) {
  matchesSel = (el: any, selText: string) => el.webkitMatchesSelector(selText)
} else if (elProto.mozMatchesSelector) {
  matchesSel = (el: any, selText: string) => el.mozMatchesSelector(selText)
}

export function matchesSelector(el: any, selText: string) {
  return matchesSel(el, selText)
}

const emitter = new Emitter()
export function onStyleSheetAdded(fn: any) {
  emitter.on('styleSheetAdded', fn)
}

export function getStyleSheets() {
  each(document.styleSheets, (styleSheet: any) => {
    if (!styleSheet.styleSheetId) {
      styleSheet.styleSheetId = getStyleSheetId(styleSheet.href)
    }
  })

  return document.styleSheets
}

export function getMatchedCssRules(node: any) {
  const ret: any[] = []

  each(document.styleSheets, (styleSheet: any) => {
    let styleSheetId = styleSheet.styleSheetId
    if (!styleSheetId) {
      styleSheetId = getStyleSheetId(styleSheet.href)
      styleSheet.styleSheetId = styleSheetId
      emitter.emit('styleSheetAdded', styleSheet)
    }
    try {
      // Started with version 64, Chrome does not allow cross origin script to access this property.
      if (!styleSheet.cssRules) return
    } catch (e) {
      return
    }

    each(styleSheet.cssRules, (cssRule: any) => {
      let matchesEl = false

      // Mobile safari will throw DOM Exception 12 error, need to try catch it.
      try {
        matchesEl = matchesSelector(node, cssRule.selectorText)
      } catch (e) {
        /* tslint:disable-next-line */
      }

      if (!matchesEl) return

      ret.push({
        selectorText: cssRule.selectorText,
        style: cssRule.style,
        styleSheetId,
      })
    })
  })

  return ret
}

export function formatStyle(style: any) {
  const ret: any = {}

  for (let i = 0, len = style.length; i < len; i++) {
    const name = style[i]

    ret[name] = style[name] || 'unsupported'
  }

  return ret
}

const inlineStyleSheetIds = new Map()
const inlineStyleNodeIds = new Map()

export function getOrCreateInlineStyleSheetId(nodeId: any) {
  let styleSheetId = inlineStyleSheetIds.get(nodeId)
  if (styleSheetId) return styleSheetId

  styleSheetId = getStyleSheetId()
  inlineStyleSheetIds.set(nodeId, styleSheetId)
  inlineStyleNodeIds.set(styleSheetId, nodeId)

  return styleSheetId
}

export function getInlineStyleSheetId(nodeId: any) {
  return inlineStyleSheetIds.get(nodeId)
}

export function getInlineStyleNodeId(styleSheetId: string) {
  return inlineStyleNodeIds.get(styleSheetId)
}

const styleSheetTexts = new Map()

export async function getStyleSheetText(styleSheetId: string, proxy = '') {
  if (styleSheetTexts.get(styleSheetId)) {
    return styleSheetTexts.get(styleSheetId)
  }
  for (let i = 0, len = document.styleSheets.length; i < len; i++) {
    const styleSheet: any = document.styleSheets[i]
    if (styleSheet.styleSheetId === styleSheetId) {
      const text = await getTextContent(styleSheet.href, proxy)
      styleSheetTexts.set(styleSheetId, text)
      break
    }
  }
  return styleSheetTexts.get(styleSheetId) || ''
}

function getStyleSheetId(sourceUrl = '') {
  if (sourceUrl) {
    return toStr(strHash(sourceUrl))
  }

  return createId()
}
