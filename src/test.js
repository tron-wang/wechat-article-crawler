const WeChatArticleCrawler = require('./crawler');
const { URLValidator } = require('./utils');

async function testCrawler() {
    console.log('🧪 開始測試微信文章爬蟲...\n');

    // 測試 URL 驗證
    console.log('=== 測試 URL 驗證 ===');
    const testUrls = [
        'https://mp.weixin.qq.com/s/valid-url',
        'https://mp.weixin.qq.com/s/another-valid-url',
        'https://invalid-url.com',
        'https://mp.weixin.qq.com/s/',
        null,
        ''
    ];

    testUrls.forEach(url => {
        const isValid = URLValidator.isValidWeChatURL(url);
        console.log(`URL: ${url || 'null'} -> 有效: ${isValid}`);
    });

    // 測試爬蟲初始化
    console.log('\n=== 測試爬蟲初始化 ===');
    const crawler = new WeChatArticleCrawler({
        headless: true,
        logLevel: 'debug',
        outputDir: './test-output'
    });

    try {
        await crawler.init();
        console.log('✅ 爬蟲初始化成功');

        // 測試數據處理功能
        console.log('\n=== 測試數據處理功能 ===');
        const testData = {
            title: '  測試標題  \n\n  ',
            content: '<p>測試內容</p><img src="test.jpg">',
            textContent: '  測試內容  \n\n  更多內容  '
        };

        const { DataProcessor } = require('./utils');
        
        console.log('清理前標題:', JSON.stringify(testData.title));
        console.log('清理後標題:', JSON.stringify(DataProcessor.cleanText(testData.title)));
        
        console.log('提取的圖片:', DataProcessor.extractImagesFromContent(testData.content));
        console.log('生成的摘要:', DataProcessor.generateSummary(testData.textContent, 50));

        // 測試保存功能（使用模擬數據）
        console.log('\n=== 測試保存功能 ===');
        crawler.articles = [
            {
                title: '測試文章1',
                author: '測試作者',
                publishTime: '2024-01-01',
                content: '<p>測試內容1</p>',
                textContent: '測試內容1',
                summary: '測試摘要1',
                images: [],
                articleUrl: 'https://mp.weixin.qq.com/s/test1',
                crawledAt: new Date().toISOString()
            },
            {
                title: '測試文章2',
                author: '測試作者',
                publishTime: '2024-01-02',
                content: '<p>測試內容2</p>',
                textContent: '測試內容2',
                summary: '測試摘要2',
                images: [],
                articleUrl: 'https://mp.weixin.qq.com/s/test2',
                crawledAt: new Date().toISOString()
            }
        ];

        await crawler.saveToJSON('test_articles.json');
        await crawler.saveToCSV('test_articles.csv');
        console.log('✅ 保存功能測試完成');

    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        await crawler.close();
    }

    console.log('\n🎉 測試完成！');
}

// 如果直接運行此文件，則執行測試
if (require.main === module) {
    testCrawler().catch(console.error);
}

module.exports = testCrawler;
