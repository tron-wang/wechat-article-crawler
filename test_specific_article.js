const WeChatArticleCrawler = require('./src/crawler');

async function crawlSpecificArticle() {
    const articleUrl = 'https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q';
    
    console.log('🎯 嘗試爬取指定文章...');
    console.log(`文章 URL: ${articleUrl}\n`);

    const crawler = new WeChatArticleCrawler({
        headless: false, // 設為 false 可以看到瀏覽器操作過程
        outputDir: './output',
        logLevel: 'debug',
        delay: 5000, // 增加延遲時間
        timeout: 60000, // 增加超時時間
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    try {
        console.log('🚀 初始化瀏覽器...');
        await crawler.init();

        console.log('📖 開始爬取文章...');
        const article = await crawler.crawlWeChatArticle(articleUrl);
        
        console.log('\n✅ 爬取成功！');
        console.log('📊 文章信息:');
        console.log(`標題: ${article.title}`);
        console.log(`作者: ${article.author}`);
        console.log(`發布時間: ${article.publishTime}`);
        console.log(`內容長度: ${article.textContent.length} 字符`);
        console.log(`圖片數量: ${article.images.length}`);
        console.log(`摘要: ${article.summary}`);

        // 保存數據
        console.log('\n💾 保存數據...');
        await crawler.saveToJSON('specific_article.json');
        await crawler.saveToCSV('specific_article.csv');
        
        console.log('✅ 數據保存完成！');

    } catch (error) {
        console.error('\n❌ 爬取失敗:', error.message);
        
        // 如果是驗證頁面，提供解決建議
        if (error.message.includes('環境異常') || error.message.includes('驗證')) {
            console.log('\n💡 解決建議:');
            console.log('1. 這篇文章可能需要人機驗證');
            console.log('2. 嘗試在瀏覽器中手動訪問該 URL 並完成驗證');
            console.log('3. 等待一段時間後重試');
            console.log('4. 檢查是否需要登錄微信賬號');
        }
        
        // 嘗試截圖查看當前頁面狀態
        try {
            console.log('\n📸 截取當前頁面截圖...');
            await crawler.page.screenshot({ 
                path: './output/error_screenshot.png',
                fullPage: true 
            });
            console.log('截圖已保存到: ./output/error_screenshot.png');
        } catch (screenshotError) {
            console.log('截圖失敗:', screenshotError.message);
        }
        
    } finally {
        console.log('\n🔒 關閉瀏覽器...');
        await crawler.close();
    }
}

// 運行爬蟲
crawlSpecificArticle().catch(console.error);
