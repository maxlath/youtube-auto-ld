const debug = false
let log = console.log
let error = console.error
if (!debug) { log = () => {}; error = () => {} }

// highres, hd2160, hd1440, hd1080, hd720
const removedItems = 5

function onQualityChanged (qualityItemNum, quality) {
  browser.storage.sync.set({ qualityItemNum, quality })

  browser.tabs.query({}).then(tabs => {
    for (const tab of tabs) {
      log('send update')
      browser.tabs.sendMessage(tab.id, {
        message: 'quality-updated',
        quality
      }).catch()
      // }).catch(error);
    }
  })
};

const Scroller = (function () {
  const DEFAULT_QUALITY_ITEM = 6 // medium
  const ITEM_HEIGHT = 38
  const NUM_OF_ITEMS = 5
  const SPEED_ANCHOR = ITEM_HEIGHT * NUM_OF_ITEMS // speed anchor
  const SPEED_FACTOR = 0.4
  const SPEED_PER_PIXEL = SPEED_FACTOR / SPEED_ANCHOR
  const MIN_TIME = 0.25

  class Scroller {
    constructor () {
      this.selectedItemNum = null
      this.position = 0
      this.element = this.getElement()
      this.numOfItems = this.getNumberOfItems()
      this.browserAction = new BrowserAction()

      this.addEventListeners()
      this.setDefaultState()
    }

    setDefaultState () {
      browser.storage.sync.get().then(data => {
        let itemNum = data.qualityItemNum || null

        if (!itemNum) { // instead of a click
          itemNum = DEFAULT_QUALITY_ITEM
          onQualityChanged(DEFAULT_QUALITY_ITEM, 'medium')
        }

        this.browserAction.setIcon(itemNum)

        this.setPositionByItemNum(itemNum)
        this.setSelectedItemNum(itemNum)
        this.setCheckmarkByItemNum(itemNum)
      })
    }

    hasPositionChanged (position) {
      return this.position !== position
    }

    setPosition (position) {
      this.position = position

      log(this.element.style.transform)
      this.element.style.transform = `translate3d(0,${this.position}px,0)`
    }

    getElement () {
      return document.querySelector('.items .scroller')
    }

    getNumberOfItems () {
      return document.querySelectorAll('.items .item').length
    }

    getItemByItemNum (itemNum) {
      let itemList = document.querySelectorAll('.items .item')
      itemList = [ ...itemList ]

      for (const item of itemList) {
        if (item.dataset.itemNum == itemNum) {
          return item
        }
      }

      return null
    }

    setSelectedItemNum (itemNum) {
      this.selectedItemNum = itemNum
    }

    setPositionByItemNum (itemNum) {
      itemNum = itemNum - removedItems
      const newPosition = itemNum * ITEM_HEIGHT
      if (!this.hasPositionChanged(newPosition)) { return }

      const distance = this.calcDistance(this.position, newPosition)
      // log(distance);

      if (itemNum >= 0 && itemNum < this.numOfItems) {
        this.setTransitionSpeed(distance)
        this.setPosition(newPosition)
      }
    }

    setTransitionSpeed (distance) {
      let speed = this.calcTransitionSpeed(distance)

      if (speed < MIN_TIME) {
        speed = MIN_TIME
      }
      // log(speed);
      this.element.style.transition = `transform ${speed}s ease-out`
    }

    calcTransitionSpeed (distance) {
      return SPEED_PER_PIXEL * distance
    }

    calcDistance (oldPosition, newPosition) {
      return Math.abs(oldPosition - newPosition)
    }

    removeCheckmark () {
      let itemList = document.querySelectorAll('.items .item')
      itemList = [ ...itemList ]

      for (const item of itemList) {
        if (item.classList.contains('checked')) {
          item.classList.remove('checked')
          return
        }
      }
    }

    setCheckmarkByItemNum (itemNum) {
      const item = this.getItemByItemNum(itemNum)
      item.classList.add('checked')
    }

    addEventListeners () {
      let itemList = document.querySelectorAll('.items .item')
      itemList = [ ...itemList ]
      // log(itemList);

      for (const item of itemList) {
        item.addEventListener('mouseover', e => {
          // log("mouseover");
          // log(item);
          const itemNum = item.getAttribute('data-item-num')
          // log(itemNum);

          window.requestAnimationFrame(() => {
            // log("requestAnimationFrame");
            this.setPositionByItemNum(itemNum)
          })
        })

        item.addEventListener('click', event => {
          // log(item);
          const itemNum = item.getAttribute('data-item-num')
          const itemQuality = item.getAttribute('data-quality')
          // log(itemNum);
          this.removeCheckmark()
          this.setCheckmarkByItemNum(itemNum)
          this.selectedItemNum = itemNum
          this.browserAction.setIcon(itemNum)
          onQualityChanged(itemNum, itemQuality)
        })
      }

      const itemsElement = document.querySelector('.items')
      itemsElement.addEventListener('mouseleave', event => {
        // log("mouseleave");
        this.setPositionByItemNum(this.selectedItemNum)
      })
    }
  }

  return Scroller
})()

const localeBinder = new LocaleBinder()
const scroller = new Scroller()
