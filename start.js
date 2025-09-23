#!/usr/bin/env node

const WeChatArticleCrawler = require('./src/crawler');
const readline = require('readline');

// 創建命令行界面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    console.log('🚀 微信文章爬蟲啟動器\n');
    
    try {
        // 獲取用戶輸入
        const articleUrl = await askQuestion('請輸入微信文章 URL: ');
        
        if (!articleUrl.trim()) {
            console.log('❌ 未提供文章 URL，程序退出');
            process.exit(1);
        }

        const headless = await askQuestion('是否使用無頭模式？(y/n，默認 y): ');
        const saveFormat = await askQuestion('保存格式 (json/csv/both，默認 both): ');

        // 創建爬蟲實例
        const crawler = new WeChatArticleCrawler({
            headless: headless.toLowerCase() !== 'n',
            outputDir: './output',
            logLevel: 'info'
        });

        console.log('\n🚀 開始爬取...');
        
        await crawler.init();
        const article = await crawler.crawlWeChatArticle(articleUrl);
        
        console.log('\n📊 爬取結果:');
        console.log(`標題: ${article.title}`);
        console.log(`作者: ${article.author}`);
        console.log(`發布時間: ${article.publishTime}`);
        console.log(`內容長度: ${article.textContent.length} 字符`);
        console.log(`圖片數量: ${article.images.length}`);

        // 保存數據
        if (saveFormat.toLowerCase() === 'json' || saveFormat.toLowerCase() === 'both' || !saveFormat) {
            await crawler.saveToJSON();
        }
        
        if (saveFormat.toLowerCase() === 'csv' || saveFormat.toLowerCase() === 'both' || !saveFormat) {
            await crawler.saveToCSV();
        }

        console.log('\n✅ 爬取完成！');

    } catch (error) {
        console.error('\n❌ 爬取失敗:', error.message);
    } finally {
        await crawler.close();
        rl.close();
    }
}

// 處理程序退出
process.on('SIGINT', async () => {
    console.log('\n\n👋 程序被用戶中斷');
    rl.close();
    process.exit(0);
});

main().catch(console.error);
