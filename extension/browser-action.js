var BrowserAction = (function() {
    const ICON_QUALITY_PATH_MAP = {
        // _0: "../images/qualities/4320p.png",
        // _1: "../images/qualities/2160p.png",
        // _2: "../images/qualities/1440p.png",
        // _3: "../images/qualities/1080p.png",
        // _4: "../images/qualities/720p.png",
        _5: "../images/qualities/480p.png",
        _6: "../images/qualities/360p.png",
        _7: "../images/qualities/240p.png",
        _8: "../images/qualities/144p.png",
        _9: "../images/qualities/360p.png",
        DEFAULT: "../images/qualities/360p.png"
    };

    class BrowserAction {
        constructor(itemNum = null) {
            if (itemNum) {
                this.setIcon(itemNum);
            }
        }

        setIcon(itemNum) {
            let path = ICON_QUALITY_PATH_MAP[`_${itemNum}`] || ICON_QUALITY_PATH_MAP.DEFAULT;
            browser.browserAction.setIcon({ path });
        }
    }

    return BrowserAction;
})();