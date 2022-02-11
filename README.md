# Tradeon Backend API

Tradeon backend API 是以 node.js 環境，搭配 express 框架 和 mongoDB 資料庫的後端專案，部署於 AWS EC2，並依據 RESTful 的設計原則來滿足 [Tradeon 前端專案](https://github.com/Jane0901/trade-on-frontend/tree/main) 贈物網站中的資料需求。

## 目錄

- [Initial - 專案緣起](#Initial---專案緣起)
- [Features - 專案功能](#Features---專案功能)
- [DB Structure - 資料庫架構規劃](#DB-Structure---資料庫架構規劃)
- [API Reference - 格式範例](#API-Reference---格式範例)
- [Environment SetUp - 環境建置](#Environment-SetUp---環境建置)
- [Installing - 專案安裝流程](#Installing---專案安裝流程)
- [Contributor and Responsibility - 開發人員與職責分工](#Contributor-and-Responsibility---開發人員與職責分工)

## Initial - 專案緣起

專案始於程式導師實驗計畫第五期的期末專案，根據 [Jane](https://github.com/Jane0901) 發想的贈物平台為主題，建造前後端分離的作品，希望能透過技術解決並整合以往贈物社群上不一致的資訊規格與明確的贈送流程。

專案核心價值：

1. 對消費者的價值：提供一個物品狀態明確的資訊，清楚的贈送流程。

1. 對店家的價值：減省物品資訊提供多寡程度的問題並將資訊核心化，同時省去贈送流程期間的不確定性。

## Features - 專案功能

- 使用者 CRUD - 贈物文瀏覽、贈物文索取或詢問留言、建立索取交易、交易留言、交易瀏覽
- 管理員 CRUD - 贈物分類管理、使用者權限管理、留言管理、常見問題管理
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
| 信箱 | 密碼 | 權限 |
| -------- | -------- | -------- |
| evergreen111@example.com | eveergreen111 | 一般使用者 |
| snowball0913@ggmail.com | snowball0913 | 一般使用者 |
| cinnamon888bunbun@yufoo.tw | cinnamon888bunbun | 一般使用者 |
| admin123@mail.com | admin123 | 管理員 |

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

## Installing - 專案安裝流程

1. 打開你的 terminal，Clone 此專案至本機電腦

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

[Jane](https://github.com/Jane0901)

1. 負責團隊資源協調與協作機制建立，實踐各階段的產品開發目標
2. 負責專案核心分支管理，協助團隊 PR 審核
3. 協同團隊確立專案規格（User Story, Wireframe, ERD Model）

[Wei](https://github.com/jweiliao)

1. 負責團隊資源協調與協作機制建立，實踐各階段的產品開發目標
2. 負責專案核心分支管理，協助團隊 PR 審核
3. 協同團隊確立專案規格（User Story, Wireframe, ERD Model）

[Genie](https://github.com/4genie)

1. 負責團隊資源協調與協作機制建立，實踐各階段的產品開發目標
2. 負責專案分支管理，協助團隊 PR 審核
3. 協同團隊確立專案規格（User Story, Wireframe, ERD Model）

[Jennie Chu](https://jenniechu713.github.io/resume/)

1. 負責後端的開發，包括使用者登入和註冊、使用者資料修改、贈送文章的刊登、編輯與刪除，建立或取消交易，新增、編輯或刪除留言，以及後台管理員身份驗證等功能。
2. 協同團隊確立專案規格（User Story, Wireframe, ERD Model）
3. 協同團隊建立資料庫架構、種子資料與 EC2 部署
