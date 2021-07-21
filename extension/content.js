const debug = false
let log = console.log
let error = console.error
if (!debug) { log = () => {}; error = () => {} }

class Main {
  constructor () {
    this.lastUrl = null

    YTAutoLD.setDebug(debug)
    this.init()
  }

  async init () {
    if (!Utils.isHostYouTube()) { return }

    const settings = await this.getSettings()
    const quality = this.getDefaultQuality(settings)

    Utils.appendScriptToDOM([
      YTAutoLD.toString(),
      `var ytAutoLD = new YTAutoLD('${quality}');`,
      'ytAutoLD.init();'
    ])

    this.setListeners()
  }

  getDefaultQuality (settings = {}) {
    return settings.quality ? settings.quality : ytAutoLD.DEFAULT_QUALITY
  }

  setListeners () {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      log(request.message)

      if (request.message === 'quality-updated') {
        this.triggerSetQualityScript(request.quality)
        this.triggerUpdatePlayerQualityScript()
      }

      if (request.message === 'youtube-tab-updated') {
        if (this.lastUrl !== request.url) {
          setTimeout(() => {
            this.triggerUpdatePlayerQualityScript()
          }, 1000)

          this.lastUrl = request.url
          log('url updated')
        }
      }
    })
  }

  triggerUpdatePlayerQualityScript () {
    Utils.appendScriptToDOM([
      'try { ytAutoLD.updatePlayerQuality(); } catch(ex) { ytlderror(ex); }'
    ])
  }

  triggerSetQualityScript (quality) {
    Utils.appendScriptToDOM([
      `try { ytAutoLD.setQuality('${quality}'); } catch(ex) { ytlderror(ex); }`
    ])
  }

  async getSettings () {
    return browser.storage.sync.get()
  }
}

const main = new Main()
