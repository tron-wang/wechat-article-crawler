const WeChatArticleCrawler = require('./src/crawler');

async function advancedCrawl() {
    const articleUrl = 'https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q';
    
    console.log('🔧 高級微信文章爬蟲 - 處理反爬蟲機制');
    console.log(`目標文章: ${articleUrl}\n`);

    // 嘗試多種配置來繞過反爬蟲機制
    const strategies = [
        {
            name: '策略1: 標準配置',
            options: {
                headless: false,
                delay: 3000,
                timeout: 30000,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        },
        {
            name: '策略2: 移動端模擬',
            options: {
                headless: false,
                delay: 5000,
                timeout: 45000,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                viewport: { width: 375, height: 667 }
            }
        },
        {
            name: '策略3: 延長等待時間',
            options: {
                headless: false,
                delay: 8000,
                timeout: 90000,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }
    ];

    for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`\n🎯 嘗試 ${strategy.name}...`);
        
        const crawler = new WeChatArticleCrawler({
            ...strategy.options,
            outputDir: './output',
            logLevel: 'info'
        });

        try {
            await crawler.init();
            
            // 先訪問微信首頁建立會話
            console.log('🌐 訪問微信首頁建立會話...');
            await crawler.page.goto('https://mp.weixin.qq.com', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            // 等待一段時間
            await crawler.page.waitForTimeout(3000);
            
            // 嘗試訪問目標文章
            console.log('📖 嘗試訪問目標文章...');
            await crawler.page.goto(articleUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: strategy.options.timeout 
            });

            // 檢查是否遇到驗證頁面
            const pageContent = await crawler.page.content();
            if (pageContent.includes('環境異常') || pageContent.includes('驗證')) {
                console.log('⚠️  遇到驗證頁面，嘗試等待...');
                
                // 等待用戶手動處理驗證（如果瀏覽器可見）
                if (!strategy.options.headless) {
                    console.log('👤 請在瀏覽器中手動完成驗證，然後按 Enter 繼續...');
                    await new Promise(resolve => {
                        process.stdin.once('data', () => resolve());
                    });
                }
            }

            // 嘗試提取文章數據
            const article = await crawler.crawlWeChatArticle(articleUrl);
            
            console.log('\n✅ 爬取成功！');
            console.log('📊 文章信息:');
            console.log(`標題: ${article.title}`);
            console.log(`作者: ${article.author}`);
            console.log(`發布時間: ${article.publishTime}`);
            console.log(`內容長度: ${article.textContent.length} 字符`);
            console.log(`圖片數量: ${article.images.length}`);

            // 保存數據
            await crawler.saveToJSON(`article_${i + 1}.json`);
            await crawler.saveToCSV(`article_${i + 1}.csv`);
            
            console.log('✅ 數據保存完成！');
            await crawler.close();
            return; // 成功後退出

        } catch (error) {
            console.error(`❌ ${strategy.name} 失敗:`, error.message);
            
            // 截圖保存當前狀態
            try {
                await crawler.page.screenshot({ 
                    path: `./output/error_strategy_${i + 1}.png`,
                    fullPage: true 
                });
                console.log(`📸 錯誤截圖已保存: error_strategy_${i + 1}.png`);
            } catch (screenshotError) {
                console.log('截圖失敗:', screenshotError.message);
            }
            
            await crawler.close();
        }
    }

    console.log('\n❌ 所有策略都失敗了');
    console.log('\n💡 建議解決方案:');
    console.log('1. 手動在瀏覽器中訪問該文章並完成驗證');
    console.log('2. 檢查是否需要登錄微信賬號');
    console.log('3. 嘗試使用代理服務器');
    console.log('4. 等待一段時間後重試');
    console.log('5. 檢查文章是否仍然公開可訪問');
}

// 運行高級爬蟲
advancedCrawl().catch(console.error);
