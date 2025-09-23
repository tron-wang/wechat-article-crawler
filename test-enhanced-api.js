const axios = require('axios');

const API_BASE_URL = 'https://wechat-article-crawler-production.up.railway.app';
const TEST_URL = 'https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q';

async function testEnhancedAPI() {
    console.log('🧪 測試增強版微信文章爬蟲 API');
    console.log(`API 地址: ${API_BASE_URL}`);
    console.log(`測試文章: ${TEST_URL}\n`);

    try {
        // 1. 測試健康檢查
        console.log('1️⃣ 測試健康檢查...');
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ 健康檢查通過:', healthResponse.data.status);
        console.log('');

        // 2. 測試單篇文章爬取
        console.log('2️⃣ 測試單篇文章爬取...');
        const crawlResponse = await axios.post(`${API_BASE_URL}/api/crawl`, {
            url: TEST_URL,
            options: {
                maxRetries: 2, // 減少重試次數以加快測試
                strategies: [
                    {
                        name: '測試策略1',
                        options: {
                            headless: true,
                            delay: 2000,
                            timeout: 30000,
                            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    }
                ]
            }
        });

        if (crawlResponse.data.success) {
            console.log('✅ 單篇文章爬取成功!');
            console.log(`標題: ${crawlResponse.data.data.title}`);
            console.log(`作者: ${crawlResponse.data.data.author}`);
            console.log(`發布時間: ${crawlResponse.data.data.publishTime}`);
            console.log(`內容長度: ${crawlResponse.data.data.textContent.length} 字符`);
            console.log(`圖片數量: ${crawlResponse.data.data.images.length}`);
        } else {
            console.log('❌ 單篇文章爬取失敗:', crawlResponse.data.error);
        }
        console.log('');

        // 3. 測試批量爬取
        console.log('3️⃣ 測試批量爬取...');
        const batchResponse = await axios.post(`${API_BASE_URL}/api/crawl/batch`, {
            urls: [TEST_URL],
            options: {
                maxRetries: 1, // 減少重試次數
                strategies: [
                    {
                        name: '測試策略1',
                        options: {
                            headless: true,
                            delay: 2000,
                            timeout: 30000,
                            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    }
                ]
            }
        });

        if (batchResponse.data.success) {
            console.log('✅ 批量爬取成功!');
            console.log(`統計: 成功 ${batchResponse.data.data.statistics.success} 篇，失敗 ${batchResponse.data.data.statistics.failed} 篇`);
            if (batchResponse.data.data.articles.length > 0) {
                console.log(`第一篇文章標題: ${batchResponse.data.data.articles[0].title}`);
            }
        } else {
            console.log('❌ 批量爬取失敗:', batchResponse.data.error);
        }
        console.log('');

        // 4. 測試狀態端點
        console.log('4️⃣ 測試狀態端點...');
        const statusResponse = await axios.get(`${API_BASE_URL}/api/status`);
        console.log('✅ 狀態端點正常:', statusResponse.data.status);
        console.log(`運行時間: ${Math.round(statusResponse.data.uptime)} 秒`);
        console.log(`內存使用: ${Math.round(statusResponse.data.memory.heapUsed / 1024 / 1024)} MB`);
        console.log('');

        console.log('🎉 所有測試完成！');

    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        if (error.response) {
            console.error('響應狀態:', error.response.status);
            console.error('響應數據:', error.response.data);
        }
    }
}

// 運行測試
testEnhancedAPI();
