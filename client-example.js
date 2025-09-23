const axios = require('axios');

class WeChatCrawlerClient {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    /**
     * 爬取單篇微信文章
     * @param {string} url - 微信文章 URL
     * @param {object} options - 爬蟲選項
     * @returns {Promise<object>} 爬取結果
     */
    async crawlArticle(url, options = {}) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/crawl`, {
                url,
                options
            });
            return response.data;
        } catch (error) {
            throw new Error(`爬取失敗: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * 批量爬取微信文章
     * @param {string[]} urls - 微信文章 URL 數組
     * @param {object} options - 爬蟲選項
     * @returns {Promise<object>} 爬取結果
     */
    async crawlArticles(urls, options = {}) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/crawl/batch`, {
                urls,
                options
            });
            return response.data;
        } catch (error) {
            throw new Error(`批量爬取失敗: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * 檢查服務健康狀態
     * @returns {Promise<object>} 健康狀態
     */
    async checkHealth() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return response.data;
        } catch (error) {
            throw new Error(`健康檢查失敗: ${error.message}`);
        }
    }

    /**
     * 獲取服務狀態
     * @returns {Promise<object>} 服務狀態
     */
    async getStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/status`);
            return response.data;
        } catch (error) {
            throw new Error(`獲取狀態失敗: ${error.message}`);
        }
    }

    /**
     * 下載爬取結果
     * @param {string} format - 文件格式 (json/csv)
     * @param {string} filename - 文件名
     * @returns {Promise<Buffer>} 文件內容
     */
    async downloadResult(format, filename) {
        try {
            const response = await axios.get(`${this.baseUrl}/api/download/${format}`, {
                params: { filename },
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            throw new Error(`下載失敗: ${error.response?.data?.error || error.message}`);
        }
    }
}

// 使用示例
async function example() {
    const client = new WeChatCrawlerClient('http://localhost:3000');

    try {
        // 檢查服務狀態
        console.log('🏥 檢查服務健康狀態...');
        const health = await client.checkHealth();
        console.log('服務狀態:', health.status);

        // 爬取單篇文章
        console.log('\n📖 爬取單篇文章...');
        const article = await client.crawlArticle('https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q', {
            headless: true,
            delay: 3000
        });

        if (article.success) {
            console.log('✅ 爬取成功!');
            console.log('標題:', article.data.title);
            console.log('作者:', article.data.author);
            console.log('發布時間:', article.data.publishTime);
            console.log('內容長度:', article.data.textContent.length, '字符');
        } else {
            console.log('❌ 爬取失敗:', article.error);
        }

        // 批量爬取
        console.log('\n📚 批量爬取文章...');
        const articles = await client.crawlArticles([
            'https://mp.weixin.qq.com/s/z7rvBArEDsnDW9sGhVpk_Q'
        ], {
            headless: true,
            delay: 5000
        });

        if (articles.success) {
            console.log('✅ 批量爬取成功!');
            console.log('成功爬取:', articles.data.statistics.success, '篇');
            console.log('失敗:', articles.data.statistics.failed, '篇');
        } else {
            console.log('❌ 批量爬取失敗:', articles.error);
        }

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    }
}

// 如果直接運行此文件，則執行示例
if (require.main === module) {
    example().catch(console.error);
}

module.exports = WeChatCrawlerClient;
