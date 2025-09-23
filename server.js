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

    const crawler = new WeChatArticleCrawler({
        headless: options.headless !== false,
        timeout: options.timeout || 30000,
        delay: options.delay || 3000,
        outputDir: './temp',
        logLevel: 'info',
        ...options
    });

    try {
        console.log(`[${requestId}] 開始爬取文章: ${url}`);
        
        await crawler.init();
        const article = await crawler.crawlWeChatArticle(url);
        
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
    } finally {
        await crawler.close();
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

    const crawler = new WeChatArticleCrawler({
        headless: options.headless !== false,
        timeout: options.timeout || 30000,
        delay: options.delay || 5000,
        outputDir: './temp',
        logLevel: 'info',
        ...options
    });

    try {
        console.log(`[${requestId}] 開始批量爬取 ${urls.length} 篇文章`);
        
        await crawler.init();
        const result = await crawler.crawlMultipleArticles(urls);
        
        console.log(`[${requestId}] 批量爬取完成: 成功 ${result.statistics.success} 篇，失敗 ${result.statistics.failed} 篇`);

        res.json({
            success: true,
            data: {
                articles: result.articles,
                statistics: result.statistics
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
    } finally {
        await crawler.close();
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
