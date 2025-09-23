const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class Logger {
    constructor(options = {}) {
        this.level = options.level || 'info';
        this.console = options.console !== false;
        this.file = options.file || false;
        this.filePath = options.filePath || './logs/crawler.log';
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
    }

    log(level, message, ...args) {
        if (this.levels[level] < this.levels[this.level]) {
            return;
        }

        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        if (this.console) {
            console.log(logMessage, ...args);
        }

        if (this.file) {
            this.writeToFile(logMessage, ...args);
        }
    }

    async writeToFile(message, ...args) {
        try {
            await fs.ensureDir(path.dirname(this.filePath));
            const fullMessage = args.length > 0 ? `${message} ${args.join(' ')}\n` : `${message}\n`;
            await fs.appendFile(this.filePath, fullMessage);
        } catch (error) {
            console.error('寫入日誌文件失敗:', error.message);
        }
    }

    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

class DataProcessor {
    static cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/\s+/g, ' ') // 替換多個空白字符為單個空格
            .replace(/\n\s*\n/g, '\n') // 替換多個換行為單個換行
            .trim();
    }

    static extractImagesFromContent(content) {
        if (!content) return [];
        
        const imgRegex = /<img[^>]+src="([^"]+)"/g;
        const images = [];
        let match;
        
        while ((match = imgRegex.exec(content)) !== null) {
            images.push(match[1]);
        }
        
        return images;
    }

    static generateSummary(text, maxLength = 200) {
        if (!text) return '';
        
        const cleaned = this.cleanText(text);
        return cleaned.length > maxLength ? 
            cleaned.substring(0, maxLength) + '...' : 
            cleaned;
    }

    static validateArticleData(article) {
        const required = ['title', 'content'];
        const missing = required.filter(field => !article[field]);
        
        if (missing.length > 0) {
            throw new Error(`文章數據缺少必要字段: ${missing.join(', ')}`);
        }
        
        return true;
    }
}

class RetryHandler {
    constructor(maxRetries = 3, baseDelay = 1000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
    }

    async execute(fn, context = null) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt === this.maxRetries) {
                    throw error;
                }
                
                const delay = this.baseDelay * Math.pow(2, attempt - 1); // 指數退避
                console.log(`⏳ 第 ${attempt} 次嘗試失敗，${delay}ms 後重試...`);
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class URLValidator {
    static isValidWeChatURL(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }
        
        const wechatPattern = /^https?:\/\/mp\.weixin\.qq\.com\/s\/[a-zA-Z0-9_-]+$/;
        return wechatPattern.test(url);
    }

    static normalizeURL(url) {
        if (!url) return null;
        
        // 移除查詢參數和錨點
        return url.split('?')[0].split('#')[0];
    }
}

module.exports = {
    Logger,
    DataProcessor,
    RetryHandler,
    URLValidator
};
