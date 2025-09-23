const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const WeChatArticleCrawler = require('./src/crawler');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100, // 每 15 分鐘最多 100 次請求
    message: {
        error: '請求過於頻繁，請稍後再試',
        retryAfter: '15 分鐘'
    }
});
app.use('/api/', limiter);

// 請求日誌中間件
app.use((req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;
    console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}`);
    next();
});

// 高級反爬蟲策略配置
const antiCrawlerStrategies = [
    {
        name: '策略1: 標準配置',
        options: {
            headless: true,
            delay: 3000,
            timeout: 30000,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 }
        }
    },
    {
        name: '策略2: 移動端模擬',
        options: {
            headless: true,
            delay: 5000,
            timeout: 45000,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            viewport: { width: 375, height: 667 }
        }
    },
    {
        name: '策略3: 延長等待時間',
        options: {
            headless: true,
            delay: 8000,
            timeout: 90000,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1366, height: 768 }
        }
    },
    {
        name: '策略4: 高級瀏覽器模擬',
        options: {
            headless: true,
            delay: 10000,
            timeout: 120000,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            viewport: { width: 1440, height: 900 },
            extraHTTPHeaders: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        }
    }
];

// 高級爬取函數
async function advancedCrawlArticle(url, requestId, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const strategies = options.strategies || antiCrawlerStrategies;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        for (let i = 0; i < strategies.length; i++) {
            const strategy = strategies[i];
            console.log(`[${requestId}] 嘗試 ${strategy.name} (第 ${attempt + 1} 次嘗試)`);
            
            const crawler = new WeChatArticleCrawler({
                ...strategy.options,
                outputDir: './temp',
                logLevel: 'info',
                ...options
            });

            try {
                await crawler.init();
                
                // 先訪問微信首頁建立會話
                console.log(`[${requestId}] 訪問微信首頁建立會話...`);
                await crawler.page.goto('https://mp.weixin.qq.com', { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                
                // 等待一段時間
                await crawler.page.waitForTimeout(3000);
                
                // 嘗試訪問目標文章
                console.log(`[${requestId}] 嘗試訪問目標文章...`);
                await crawler.page.goto(url, { 
                    waitUntil: 'domcontentloaded',
                    timeout: strategy.options.timeout 
                });

                // 檢查是否遇到驗證頁面
                const pageContent = await crawler.page.content();
                if (pageContent.includes('環境異常') || pageContent.includes('驗證') || pageContent.includes('異常')) {
                    console.log(`[${requestId}] 遇到驗證頁面，等待 5 秒後重試...`);
                    await crawler.page.waitForTimeout(5000);
                    
                    // 再次檢查
                    const newContent = await crawler.page.content();
                    if (newContent.includes('環境異常') || newContent.includes('驗證') || newContent.includes('異常')) {
                        throw new Error('遇到反爬蟲驗證頁面');
                    }
                }

                // 嘗試提取文章數據
                const article = await crawler.crawlWeChatArticle(url);
                
                console.log(`[${requestId}] 爬取成功: ${article.title}`);
                await crawler.close();
                
                return article;

            } catch (error) {
                console.error(`[${requestId}] ${strategy.name} 失敗:`, error.message);
                
                // 截圖保存當前狀態
                try {
                    await crawler.page.screenshot({ 
                        path: `./temp/error_${requestId}_strategy_${i + 1}.png`,
                        fullPage: true 
                    });
                    console.log(`[${requestId}] 錯誤截圖已保存: error_${requestId}_strategy_${i + 1}.png`);
                } catch (screenshotError) {
                    console.log(`[${requestId}] 截圖失敗:`, screenshotError.message);
                }
                
                await crawler.close();
                
                // 如果不是最後一個策略，繼續嘗試下一個
                if (i < strategies.length - 1) {
                    console.log(`[${requestId}] 嘗試下一個策略...`);
                    continue;
                }
            }
        }
        
        // 如果所有策略都失敗了，等待後重試
        if (attempt < maxRetries - 1) {
            const waitTime = (attempt + 1) * 10000; // 10秒, 20秒, 30秒
            console.log(`[${requestId}] 所有策略失敗，${waitTime/1000}秒後重試...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    throw new Error('所有反爬蟲策略都失敗了');
}

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// 爬取單篇文章
app.post('/api/crawl', async (req, res) => {
    const requestId = req.requestId;
    const { url, options = {} } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            error: '請提供文章 URL',
            requestId
        });
    }

    // 驗證 URL 格式
    const urlPattern = /^https?:\/\/mp\.weixin\.qq\.com\/s\/[a-zA-Z0-9_-]+$/;
    if (!urlPattern.test(url)) {
        return res.status(400).json({
            success: false,
            error: '請提供有效的微信文章 URL',
            requestId
        });
    }

    try {
        console.log(`[${requestId}] 開始爬取文章: ${url}`);
        
        const article = await advancedCrawlArticle(url, requestId, options);
        
        console.log(`[${requestId}] 爬取成功: ${article.title}`);

        res.json({
            success: true,
            data: article,
            requestId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(`[${requestId}] 爬取失敗:`, error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            requestId,
            timestamp: new Date().toISOString()
        });
    }
});

// 批量爬取文章
app.post('/api/crawl/batch', async (req, res) => {
    const requestId = req.requestId;
    const { urls, options = {} } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
            success: false,
            error: '請提供文章 URL 數組',
            requestId
        });
    }

    if (urls.length > 10) {
        return res.status(400).json({
            success: false,
            error: '批量爬取最多支持 10 篇文章',
            requestId
        });
    }

    // 驗證所有 URL
    const urlPattern = /^https?:\/\/mp\.weixin\.qq\.com\/s\/[a-zA-Z0-9_-]+$/;
    const invalidUrls = urls.filter(url => !urlPattern.test(url));
    if (invalidUrls.length > 0) {
        return res.status(400).json({
            success: false,
            error: `無效的 URL: ${invalidUrls.join(', ')}`,
            requestId
        });
    }

    try {
        console.log(`[${requestId}] 開始批量爬取 ${urls.length} 篇文章`);
        
        const articles = [];
        const errors = [];
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`[${requestId}] [${i + 1}/${urls.length}] 處理文章: ${url}`);
            
            try {
                const article = await advancedCrawlArticle(url, requestId, options);
                articles.push(article);
                successCount++;
                console.log(`[${requestId}] [${i + 1}/${urls.length}] 成功: ${article.title}`);
            } catch (error) {
                console.error(`[${requestId}] [${i + 1}/${urls.length}] 失敗:`, error.message);
                errors.push({
                    url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                failedCount++;
            }
        }
        
        console.log(`[${requestId}] 批量爬取完成: 成功 ${successCount} 篇，失敗 ${failedCount} 篇`);

        res.json({
            success: true,
            data: {
                articles,
                statistics: {
                    total: urls.length,
                    success: successCount,
                    failed: failedCount
                },
                errors: errors.length > 0 ? errors : undefined
            },
            requestId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(`[${requestId}] 批量爬取失敗:`, error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            requestId,
            timestamp: new Date().toISOString()
        });
    }
});

// 獲取爬取狀態
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// 下載爬取結果
app.get('/api/download/:format', (req, res) => {
    const { format } = req.params;
    const { filename } = req.query;

    if (!['json', 'csv'].includes(format)) {
        return res.status(400).json({
            success: false,
            error: '不支持的格式，請使用 json 或 csv'
        });
    }

    const filePath = path.join('./temp', filename || `articles.${format}`);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            error: '文件不存在'
        });
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error('下載文件失敗:', err);
            res.status(500).json({
                success: false,
                error: '下載文件失敗'
            });
        }
    });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
    console.error(`[${req.requestId}] 服務器錯誤:`, error);
    
    res.status(500).json({
        success: false,
        error: '服務器內部錯誤',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: '端點不存在',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🚀 微信文章爬蟲 API 服務器已啟動`);
    console.log(`📡 服務地址: http://localhost:${PORT}`);
    console.log(`📚 API 文檔: http://localhost:${PORT}/api/docs`);
    console.log(`🏥 健康檢查: http://localhost:${PORT}/health`);
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信號，正在關閉服務器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信號，正在關閉服務器...');
    process.exit(0);
});

module.exports = app;
