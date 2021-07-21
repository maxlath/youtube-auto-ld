class YTAutoLD {
  constructor (quality = null) {
    this.quality = quality
    this.player = null
    this.currentUrl = null

    this.updateCurrentURL()
  }

  async init () {
    try {
      ytldlog('init!!')
      this.player = await this.findPlayer()
      this.updatePlayerQuality()
      this.setMutationObserver()
    } catch (ex) {
      ytlderror(ex)
    }
  }

  get Player () {
    return this.player
  }

  setQuality (quality) {
    this.quality = quality
  }

  updateCurrentURL () {
    this.currentUrl = window.location.href
  }

  getPlayerElement () {
    return document.getElementById('movie_player') ||
			document.querySelector('.html5-video-player')
  }

  getAlternativeQuality () {
    const availableQualities = this.Player.getAvailableQualityLevels()

    if (availableQualities.length > 0) {
      return availableQualities[0]
    }

    return null
  }

  isHostYouTube () {
    return window.location.host.includes('youtube.com')
  }

  updatePlayerQuality () {
    try {
      // ytldlog("updatePlayerQuality");
      // ytldlog(this.quality);
      // ytldlog(this.Player.getAvailableQualityLevels());
      const isQualityAvaliable = this.player.getAvailableQualityLevels().includes(this.quality)
      const chosenQuality = isQualityAvaliable ? this.quality : this.getAlternativeQuality()

      if (chosenQuality === null) {
        throw new Error("YTAutoLD.updatePlayerQuality: 'chosenQuality' is null")
      }
      // ytldlog(isQualityAvaliable);
      // ytldlog(chosenQuality);
      this.player.setPlaybackQuality(chosenQuality)
      if (this.player.setPlaybackQualityRange) {
        this.player.setPlaybackQualityRange(chosenQuality)
      }
    } catch (ex) {
      ytlderror(ex)
    }
  }

  findPlayer () {
    return new Promise((resolve, reject) => {
      if (!this.isHostYouTube()) { reject() }
      const interval = setInterval(() => {
        ytldlog('trying to find player2')
        if (this.isPlayerExists()) {
          ytldlog('found it!!!')
          clearInterval(interval)
          resolve(this.getPlayerElement())
        }
      }, 500)
    })
  }

  isPlayerExists () {
    const player = document.getElementById('movie_player') ||
			document.querySelector('.html5-video-player')
    ytldlog(player)

    return player && player.getAvailableQualityLevels().length !== 0
  }

  setMutationObserver () {
    const target = this.player.querySelector('.video-stream') ||
			this.player.querySelector('.html5-main-video')

    if (!target) { return }

    const observerOptions = { attributes: true }
    const observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach(mutation => {
			    switch (mutation.type) {
        case 'attributes':
          if (mutation.attributeName === 'src') {
            if (this.currentUrl !== window.location.href) {
              this.updateCurrentURL()
              this.updatePlayerQuality()
              // ytldlog("player changed");
            }
          }
          break
			    }
      })
    })

    observer.observe(target, observerOptions)
  }

  static setDebug (debug) {
    if (debug) {
      Utils.appendScriptToDOM([
        'var ytldlog = console.log;',
        'var ytlderror = console.error;'
      ])
    } else {
      Utils.appendScriptToDOM([
        'var ytldlog = () => {};',
        'var ytlderror = () => {};'
      ])
    }
  }
}

YTAutoLD.DEFAULT_QUALITY = 'medium'
