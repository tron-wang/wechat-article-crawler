const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 開始測試微信文章爬蟲 API...\n');

    try {
        // 1. 測試健康檢查
        console.log('1️⃣ 測試健康檢查...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ 健康檢查通過:', healthResponse.data.status);

        // 2. 測試服務狀態
        console.log('\n2️⃣ 測試服務狀態...');
        const statusResponse = await axios.get(`${BASE_URL}/api/status`);
        console.log('✅ 服務狀態:', statusResponse.data.status);

        // 3. 測試爬取單篇文章
        console.log('\n3️⃣ 測試爬取單篇文章...');
        const testUrl = 'https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q';
        
        const crawlResponse = await axios.post(`${BASE_URL}/api/crawl`, {
            url: testUrl,
            options: {
                headless: true,
                timeout: 30000,
                delay: 3000
            }
        });

        if (crawlResponse.data.success) {
            console.log('✅ 單篇文章爬取成功');
            console.log('📖 文章標題:', crawlResponse.data.data.title);
            console.log('👤 作者:', crawlResponse.data.data.author);
            console.log('📅 發布時間:', crawlResponse.data.data.publishTime);
            console.log('📝 內容長度:', crawlResponse.data.data.textContent.length, '字符');
            console.log('🖼️ 圖片數量:', crawlResponse.data.data.images.length);
        } else {
            console.log('❌ 單篇文章爬取失敗:', crawlResponse.data.error);
        }

        // 4. 測試批量爬取
        console.log('\n4️⃣ 測試批量爬取...');
        const testUrls = [
            'https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q',
            // 可以添加更多測試 URL
        ];

        const batchResponse = await axios.post(`${BASE_URL}/api/crawl/batch`, {
            urls: testUrls,
            options: {
                headless: true,
                timeout: 30000,
                delay: 5000
            }
        });

        if (batchResponse.data.success) {
            console.log('✅ 批量爬取成功');
            console.log('📊 統計信息:', batchResponse.data.data.statistics);
            console.log('📚 成功爬取文章數:', batchResponse.data.data.articles.length);
        } else {
            console.log('❌ 批量爬取失敗:', batchResponse.data.error);
        }

        // 5. 測試錯誤處理
        console.log('\n5️⃣ 測試錯誤處理...');
        
        // 測試無效 URL
        try {
            await axios.post(`${BASE_URL}/api/crawl`, {
                url: 'https://invalid-url.com'
            });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ 無效 URL 錯誤處理正確');
            } else {
                console.log('❌ 無效 URL 錯誤處理失敗');
            }
        }

        // 測試缺少 URL
        try {
            await axios.post(`${BASE_URL}/api/crawl`, {});
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ 缺少 URL 錯誤處理正確');
            } else {
                console.log('❌ 缺少 URL 錯誤處理失敗');
            }
        }

        console.log('\n🎉 API 測試完成！');

    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        if (error.response) {
            console.error('響應狀態:', error.response.status);
            console.error('響應數據:', error.response.data);
        }
    }
}

// 如果直接運行此文件，則執行測試
if (require.main === module) {
    testAPI().catch(console.error);
}

module.exports = testAPI;
