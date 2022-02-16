# Tradeon Backend API

Tradeon backend API 是以 node.js 環境，搭配 express 框架 和 mongoDB 資料庫的後端專案，部署於 AWS EC2，並依據 RESTful 的設計原則來滿足 [Tradeon 前端專案](https://github.com/Jane0901/trade-on-frontend/tree/main) 贈物網站中的資料需求。

## 目錄

- [Initial - 專案緣起](#Initial---專案緣起)
- [Features - 專案功能](#Features---專案功能)
- [DB Structure - 資料庫架構規劃](#DB-Structure---資料庫架構規劃)
- [API Reference - 格式範例](#API-Reference---格式範例)
- [Environment SetUp - 環境建置](#Environment-SetUp---環境建置)
- [Technical Skills - 專案採用技術](#Technical-Skills---專案採用技術)
- [Installing - 專案安裝流程](#Installing---專案安裝流程)
- [Contributor and Responsibility - 開發人員與職責分工](#Contributor-and-Responsibility---開發人員與職責分工)

## Initial - 專案緣起

這個專案源於[程式導師實驗計畫第五期](https://bootcamp.lidemy.com/)的期末專題，以 [Jane](https://github.com/Jane0901) 發想的贈物平台做為主題。

在斷捨離物品時，雖然有 FB 社團提供大家贈物，不過發文與留言格式混亂，而且一次贈送 / 索取多個物品，自己還要另外紀錄每個物品的交易情況。

為了解決上述問題，我們建立了 Trade On 贈物平台。Trade On 有格式統一的物品資訊，以及清楚的贈物流程，可以方便管理每一筆贈物 / 索物交易。另外，我們還有提供交易的一對一留言功能，增進會員的贈物 / 索物使用者體驗。

**專案核心價值**

- 對於贈物者：減少贈物的時間成本，能夠輕鬆上架物品，並且方便管理物品資訊
- 對於索物者：快速瀏覽格式一致的物品資訊，方便找到自己需要的物品
- 對於雙方：直接留言互動讓溝通更方便，以及藉由清楚的贈物 / 索物紀錄，更好掌握交易進度

## Features - 專案功能

- 使用者 CRUD：贈物文瀏覽、贈物文索取或詢問留言、建立索取交易、交易留言、交易瀏覽

- 管理員 CRUD：贈物分類管理、使用者權限管理、留言管理、常見問題管理

- AWS EC2 部署，並搭配 nginx 反向代理及 pm2 運行。

- 透過 cors 實作前後端分離

- 採用 JSON Web Tokens 實作跨域認證

- 採用 multer 對接前後端檔案程式

- 整合 imgur API，實作上傳圖片功能

- 採用 bcrypt 處理使用者密碼

- 使用 dotenv 設定環境變數

## DB Structure - 資料庫架構規劃

- [Mongoose Schema 資料結構與關聯一覽](https://drive.google.com/file/d/13En38xIpT3296hwi91ZlR5_z3woPgkLt/view)

![schema structure and relation](https://i.imgur.com/MhAzaVk.png)

## API Reference - 格式範例

API 詳細操作文件可見[此](https://hackmd.io/@ST0HtQp5T0Cw_bEqVtdStA/B1vji3gk5)

範例使用者帳號與密碼

| 信箱              | 密碼     | 權限       |
| ----------------- | -------- | ---------- |
| green111@mail.com | green111 | 一般使用者 |
| snow0913@mail.com | snow0913 | 一般使用者 |
| rogui888@mail.com | rogui888 | 一般使用者 |
| admin123@mail.com | admin123 | 管理員     |

以下圖片顯示有經過掛件 prettify

- [所有刊登](https://cosdelus.tw/tradeon/api/posts/all) : `https://codelus.tw/tradeon/api/posts/all`
  ![all posts](https://i.imgur.com/H0YcHWH.png)

- 單一刊登 : `https://codelus.tw/tradeon/api/posts/:id`
  ![one post](https://i.imgur.com/X6JHxQP.png)

- 刊登關聯的留言板 : `https://codelus.tw/tradeon/api/messages/post/:id`
  ![post related messages](https://i.imgur.com/lAVBXZk.png)

- 所有交易進程（需登入）: `https://codelus.tw/tradeon/api/transactions/all`
  ![all transactions](https://i.imgur.com/rcJTMDo.png)

- 單一交易進程（需登入）: `https://codelus.tw/tradeon/api/transactions/:id`
  ![one transaction](https://i.imgur.com/e6hx2fK.png)

## Environment SetUp - 環境建置

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)

## Technical Skills - 專案採用技術

![npm source tree](https://i.imgur.com/eux795I.png)

| 套件                 | 用途                                          |
| -------------------- | --------------------------------------------- |
| axios                | 用於串接 Imgur API                            |
| form-data            | 處理傳給 Imgur API request headers 等需求設定 |
| multer               | 處理前端 request 傳來的圖片檔案               |
| bcrypt               | 對使用者密碼進行雜湊加密                      |
| cors                 | 設定 Cross Origin Resource                    |
| dotenv               | 設定環境變數                                  |
| express              | 相容 Node.js 環境網頁框架                     |
| mongoose             | mongoDB ODM                                   |
| connect-mongo        | mongoDB 連線                                  |
| mongoose-paginate-v2 | 能夠對取得的資料便捷地產生 paginate 分頁      |
| passport             | 登入驗證 middleware                           |
| passport-local       | 針對 app 原生登入驗證                         |
| passport-jwt         | 針對 使用 JWT 登入驗證                        |
| passport-facebook    | 針對 facebook 第三方登入驗證（開發中）        |
| jsonwebtoken         | 產生 JWT 簽證與驗證                           |

## Installing - 專案安裝流程

1. 打開 terminal，Clone 此專案至本機電腦

   ```
   git clone https://github.com/JennieChu713/trade-on_backend.git
   ```

2. 開啟終端機(Terminal)，進入存放此專案的資料夾

   ```
   cd trade-on_backend
   ```

3. 安裝 npm 套件，可透過 `yarn` 或 `npm`下載專案相依套件

   ```
   npm i
   ```

   ```
   yarn
   ```

4. 環境變數設定

   將 .env.example 檔案名稱修改為 .env，並填入相對應的值

   ```
   //.env.example --> .env
   PORT = 3333

   MONGODB_URI = your mongodb route

   MONGODB_NAME= your mongodb name

   MONGODB_USER = your mongodb access username
   MONGDB_PASSWORD = your mongodb access username

   FRONTEND_URI = frontend url address for CORS list

   JWT_SECRET = your JWT-token secret

   JWT_EXPIRE = your JWT expiration setting

   IMGUR_CLIENT_ID = your imgur clientId
   IMGUR_CLIENT_SECRET = your imgur secret
   IMGUR_REFRESH_TOKEN = your imgur refresh token
   ```

5. 建立種子檔案

   ```
   npm run demoSeed
   ```

   ```
   yarn demoSeed
   ```

6. 啟動應用程式，執行 server.js 檔案

   ```
   npm run devStart
   ```

   ```
   yarn devStart
   ```

最後，開啟任一瀏覽器或 API 測試軟體，輸入 [http://localhost:3333](http://localhost:3333) 便可進行瀏覽。

## Contributor and Responsibility - 開發人員與職責分工

[Jane Chen](https://github.com/Jane0901)

1. 負責團隊資源協調與協作機制建立，實踐各階段的產品開發目標
2. 負責前台功能開發，包含新增或編輯贈物文頁、個人資料頁、交易紀錄頁、交易詳情頁、登入頁、註冊頁
3. 協同前台功能開發，包含編輯個人資料頁、常見問題頁
4. 協同後台管理常見問題頁的功能開發
5. 協同團隊建立 router
6. 協同團隊進行 Netlify 部署
7. 協同團隊確立專案規格（User Story、設計稿）

[Genie](https://github.com/4genie)

1. 負責前台功能開發，包含禮物貼文頁、常見問題頁
2. 負責後台功能開發，包含會員管理頁、贈物文管理頁、分類管理頁、常見問題管理頁
3. 協同團隊建立 router
4. 協同團隊確立專案規格（User Flow、Wireframe、設計稿）

[Wei](https://github.com/jweiliao)

1. 負責前台編輯個人資料頁的功能開發
2. 協同前台功能開發，包含物品圖片上傳、表單驗證
3. 協同團隊建立 router
4. 協同團隊進行 Netlify 部署
5. 協同團隊確立專案規格（User Flow、Wireframe、設計稿）

[Jennie Chu](https://jenniechu713.github.io/JennieChu713/)<!-- RESUME 連結 -->

1. 負責後端的開發，包括：
   - 登入、註冊，編輯使用者資料，包含密碼修改、頭像上傳等
   - 贈送文章的刊登、編輯與刪除
   - 新增、編輯或刪除刊登文上的留言和回覆，以及交易進程中 1:1 的留言與回覆
   - 建立或取消交易（會依照流程階段進行限制取消的機制）
   - 後台管理員身份驗證 endpoint、發文和留言權限操作等功能
2. 負責建立資料庫架構與設定種子資料
3. 進行 AWS EC2 部署，並設定 nginx 和 pm2
4. 協同團隊確立專案規格（User Flow、Wireframe、設計稿）
