const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment');
const { Logger, DataProcessor, RetryHandler, URLValidator } = require('./utils');

class WeChatArticleCrawler {
    constructor(options = {}) {
        this.options = {
            headless: options.headless !== false, // 預設為無頭模式
            timeout: options.timeout || 30000,
            userAgent: options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            outputDir: options.outputDir || './output',
            maxRetries: options.maxRetries || 3,
            delay: options.delay || 2000, // 請求間隔
            ...options
        };
        
        this.browser = null;
        this.context = null;
        this.page = null;
        this.articles = [];
        this.logger = new Logger({
            level: options.logLevel || 'info',
            console: true,
            file: options.logToFile || false,
            filePath: options.logPath || './logs/crawler.log'
        });
        this.retryHandler = new RetryHandler(this.options.maxRetries, 1000);
    }

    async init() {
        console.log('🚀 初始化 Playwright 瀏覽器...');
        
        this.browser = await chromium.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        this.context = await this.browser.newContext({
            userAgent: this.options.userAgent,
            viewport: { width: 1920, height: 1080 },
            locale: 'zh-CN'
        });

        this.page = await this.context.newPage();
        
        // 設置請求攔截，避免加載圖片和字體以提高速度
        await this.page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['image', 'font', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        console.log('✅ 瀏覽器初始化完成');
    }

    async crawlWeChatArticle(articleUrl) {
        // 驗證 URL
        if (!URLValidator.isValidWeChatURL(articleUrl)) {
            throw new Error('請提供有效的微信文章 URL');
        }

        this.logger.info(`📖 開始爬取文章: ${articleUrl}`);
        
        return await this.retryHandler.execute(async () => {
            try {
                await this.page.goto(articleUrl, { 
                    waitUntil: 'networkidle',
                    timeout: this.options.timeout 
                });

                // 等待文章內容加載
                await this.page.waitForSelector('#js_content', { timeout: 10000 });

                const articleData = await this.extractArticleData();
                
                // 驗證文章數據
                DataProcessor.validateArticleData(articleData);
                
                // 清理和處理數據
                articleData.textContent = DataProcessor.cleanText(articleData.textContent);
                articleData.summary = DataProcessor.generateSummary(articleData.textContent);
                articleData.images = DataProcessor.extractImagesFromContent(articleData.content);
                
                this.articles.push(articleData);
                
                this.logger.info(`✅ 成功爬取文章: ${articleData.title}`);
                return articleData;

            } catch (error) {
                this.logger.error(`❌ 爬取文章失敗: ${error.message}`);
                throw error;
            }
        });
    }

    async extractArticleData() {
        const articleData = await this.page.evaluate(() => {
            // 提取文章標題
            const title = document.querySelector('#activity-name')?.textContent?.trim() || 
                         document.querySelector('h1')?.textContent?.trim() || 
                         document.title;

            // 提取作者信息
            const author = document.querySelector('#js_name')?.textContent?.trim() || 
                          document.querySelector('.author')?.textContent?.trim() || 
                          '未知作者';

            // 提取發布時間
            const publishTime = document.querySelector('#publish_time')?.textContent?.trim() || 
                               document.querySelector('.publish_time')?.textContent?.trim() || 
                               new Date().toISOString();

            // 提取文章內容
            const contentElement = document.querySelector('#js_content');
            const content = contentElement ? contentElement.innerHTML : '';

            // 提取純文本內容
            const textContent = contentElement ? contentElement.textContent?.trim() : '';

            // 提取文章摘要（前200個字符）
            const summary = textContent ? textContent.substring(0, 200) + '...' : '';

            // 提取圖片
            const images = [];
            if (contentElement) {
                const imgElements = contentElement.querySelectorAll('img');
                imgElements.forEach(img => {
                    const src = img.getAttribute('data-src') || img.src;
                    if (src) {
                        images.push(src);
                    }
                });
            }

            // 提取文章鏈接
            const articleUrl = window.location.href;

            return {
                title,
                author,
                publishTime,
                content,
                textContent,
                summary,
                images,
                articleUrl,
                crawledAt: new Date().toISOString()
            };
        });

        return articleData;
    }

    async crawlMultipleArticles(urls) {
        this.logger.info(`📚 開始批量爬取 ${urls.length} 篇文章...`);
        
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            this.logger.info(`\n[${i + 1}/${urls.length}] 處理文章: ${url}`);
            
            try {
                await this.crawlWeChatArticle(url);
                results.success++;
                
                // 添加隨機延遲避免被反爬蟲
                if (i < urls.length - 1) {
                    const randomDelay = this.options.delay + Math.random() * 1000;
                    this.logger.debug(`⏳ 等待 ${Math.round(randomDelay)}ms...`);
                    await this.page.waitForTimeout(randomDelay);
                }
                
            } catch (error) {
                results.failed++;
                results.errors.push({
                    url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
                this.logger.error(`❌ 跳過文章 ${url}: ${error.message}`);
                continue;
            }
        }

        this.logger.info(`\n✅ 批量爬取完成`);
        this.logger.info(`成功: ${results.success}, 失敗: ${results.failed}, 跳過: ${results.skipped}`);
        
        if (results.errors.length > 0) {
            this.logger.warn(`錯誤詳情:`, results.errors);
        }
        
        return {
            articles: this.articles,
            statistics: results
        };
    }

    async saveToJSON(filename = null) {
        if (this.articles.length === 0) {
            console.log('⚠️  沒有文章數據可保存');
            return;
        }

        await fs.ensureDir(this.options.outputDir);
        
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const filename_ = filename || `wechat_articles_${timestamp}.json`;
        const filepath = path.join(this.options.outputDir, filename_);

        await fs.writeJson(filepath, this.articles, { spaces: 2 });
        console.log(`💾 文章數據已保存到: ${filepath}`);
        
        return filepath;
    }

    async saveToCSV(filename = null) {
        if (this.articles.length === 0) {
            console.log('⚠️  沒有文章數據可保存');
            return;
        }

        await fs.ensureDir(this.options.outputDir);
        
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const filename_ = filename || `wechat_articles_${timestamp}.csv`;
        const filepath = path.join(this.options.outputDir, filename_);

        const csvWriter = createCsvWriter({
            path: filepath,
            header: [
                { id: 'title', title: '標題' },
                { id: 'author', title: '作者' },
                { id: 'publishTime', title: '發布時間' },
                { id: 'summary', title: '摘要' },
                { id: 'articleUrl', title: '文章鏈接' },
                { id: 'crawledAt', title: '爬取時間' }
            ]
        });

        await csvWriter.writeRecords(this.articles);
        console.log(`💾 文章數據已保存到: ${filepath}`);
        
        return filepath;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 瀏覽器已關閉');
        }
    }

    // 獲取已爬取的文章數據
    getArticles() {
        return this.articles;
    }

    // 清空文章數據
    clearArticles() {
        this.articles = [];
    }
}

module.exports = WeChatArticleCrawler;
