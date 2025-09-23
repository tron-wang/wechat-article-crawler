const WeChatArticleCrawler = require('./crawler');

async function main() {
    const crawler = new WeChatArticleCrawler({
        headless: false, // 設為 false 可以看到瀏覽器操作過程
        outputDir: './output',
        delay: 3000 // 3秒延遲
    });

    try {
        // 初始化爬蟲
        await crawler.init();

        // 示例1: 爬取單篇文章
        console.log('\n=== 示例1: 爬取單篇文章 ===');
        const singleArticleUrl = 'https://mp.weixin.qq.com/s/your-article-url-here';
        
        // 注意：請替換為真實的微信文章 URL
        // const article = await crawler.crawlWeChatArticle(singleArticleUrl);
        // console.log('爬取到的文章:', article);

        // 示例2: 批量爬取多篇文章
        console.log('\n=== 示例2: 批量爬取多篇文章 ===');
        const articleUrls = [
            'https://mp.weixin.qq.com/s/url1',
            'https://mp.weixin.qq.com/s/url2',
            'https://mp.weixin.qq.com/s/url3'
        ];

        // 注意：請替換為真實的微信文章 URL 列表
        // const articles = await crawler.crawlMultipleArticles(articleUrls);

        // 示例3: 保存數據
        console.log('\n=== 示例3: 保存數據 ===');
        
        // 保存為 JSON 格式
        // await crawler.saveToJSON('my_articles.json');
        
        // 保存為 CSV 格式
        // await crawler.saveToCSV('my_articles.csv');

        // 示例4: 獲取爬取結果
        console.log('\n=== 示例4: 獲取爬取結果 ===');
        const allArticles = crawler.getArticles();
        console.log(`共爬取到 ${allArticles.length} 篇文章`);

        // 顯示文章標題列表
        allArticles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title}`);
        });

    } catch (error) {
        console.error('❌ 爬蟲運行出錯:', error.message);
    } finally {
        // 關閉瀏覽器
        await crawler.close();
    }
}

// 如果直接運行此文件，則執行 main 函數
if (require.main === module) {
    main().catch(console.error);
}

module.exports = main;
