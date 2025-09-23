module.exports = {
    // 爬蟲基本配置
    crawler: {
        headless: true, // 是否使用無頭模式
        timeout: 30000, // 頁面加載超時時間（毫秒）
        delay: 2000, // 請求間隔時間（毫秒）
        maxRetries: 3, // 最大重試次數
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },

    // 輸出配置
    output: {
        dir: './output', // 輸出目錄
        json: {
            enabled: true,
            filename: 'wechat_articles_{timestamp}.json'
        },
        csv: {
            enabled: true,
            filename: 'wechat_articles_{timestamp}.csv'
        }
    },

    // 微信文章選擇器配置
    selectors: {
        title: [
            '#activity-name',
            'h1',
            '.title'
        ],
        author: [
            '#js_name',
            '.author',
            '.profile_nickname'
        ],
        publishTime: [
            '#publish_time',
            '.publish_time',
            '.publish-date'
        ],
        content: [
            '#js_content'
        ]
    },

    // 反爬蟲配置
    antiDetection: {
        // 隨機延遲範圍（毫秒）
        randomDelay: {
            min: 1000,
            max: 5000
        },
        // 是否隨機化 User-Agent
        randomUserAgent: false,
        // 是否禁用圖片加載
        disableImages: true,
        // 是否禁用字體加載
        disableFonts: true
    },

    // 日誌配置
    logging: {
        level: 'info', // debug, info, warn, error
        console: true,
        file: false,
        filePath: './logs/crawler.log'
    }
};
