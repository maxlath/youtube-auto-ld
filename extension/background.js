const debug = false
let log = console.log
let error = console.error
if (!debug) { log = () => {}; error = () => {} }

log('bg')

const DEFAULT_QUALITY_ICON = 6 // medium

browser.storage.sync.get().then(data => {
  let itemNum = data.qualityItemNum || null

  if (!itemNum) {
    itemNum = DEFAULT_QUALITY_ICON
    const qualityItemNum = 6
    const quality = 'medium'
    browser.storage.sync.set({ qualityItemNum, quality })
  }

  new BrowserAction(itemNum)
})

let lastUrl

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  try {
    const url = tabInfo.url
    const tabId = tabInfo.id

    if (isYoutubeUrl(url)) {
      if (isYoutubeUrl(lastUrl) && areSameVideo(lastUrl, url)) {
        log('same video: passing')
        return
      }

      log('is youtube')
      lastUrl = url

      browser.tabs.sendMessage(tabId, {
        message: 'youtube-tab-updated',
        url
      })
    }
  } catch (ex) {
    error(ex)
  }
})

const isYoutubeUrl = url => url != null && new URL(url).host.includes('youtube.com')

const areSameVideo = (previousUrl, newUrl) => getSearchWithoutT(previousUrl) === getSearchWithoutT(newUrl)

const getSearchWithoutT = url => {
  const { search } = new URL(url)
  const params = new URLSearchParams(search)
  params.delete('t')
  return params.toString()
}
