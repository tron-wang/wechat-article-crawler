#!/bin/bash

echo "🚀 微信文章爬蟲安裝腳本"
echo "=========================="

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js (https://nodejs.org/)"
    exit 1
fi

echo "✅ Node.js 已安裝: $(node --version)"

# 檢查 npm 是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 請先安裝 npm"
    exit 1
fi

echo "✅ npm 已安裝: $(npm --version)"

# 安裝依賴
echo ""
echo "📦 安裝項目依賴..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依賴安裝失敗"
    exit 1
fi

echo "✅ 依賴安裝完成"

# 安裝 Playwright 瀏覽器
echo ""
echo "🌐 安裝 Playwright 瀏覽器..."
npx playwright install

if [ $? -ne 0 ]; then
    echo "❌ Playwright 瀏覽器安裝失敗"
    exit 1
fi

echo "✅ Playwright 瀏覽器安裝完成"

# 創建必要的目錄
echo ""
echo "📁 創建必要目錄..."
mkdir -p output logs test-output

echo "✅ 目錄創建完成"

echo ""
echo "🎉 安裝完成！"
echo ""
echo "使用方法："
echo "  npm start          - 啟動交互式爬蟲"
echo "  npm run example    - 運行示例代碼"
echo "  npm test           - 運行測試"
echo ""
echo "開始使用: npm start"
