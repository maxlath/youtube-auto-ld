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

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  try {
    const url = tabInfo.url
    const tabId = tabInfo.id

    const anchor = document.createElement('a')
    anchor.href = url

    if (anchor.host.includes('youtube.com')) {
      log('is youtube')

	        browser.tabs.sendMessage(tabId, {
	            message: 'youtube-tab-updated',
	            url
	        })
    }
  } catch (ex) {
    error(ex)
  }
})
