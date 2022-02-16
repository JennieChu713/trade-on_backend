const errorMsgs = {
  403: "Permission forbidden - 權利遭到禁止", //403狀態碼意為伺服器成功解析請求但是客戶端沒有存取該資源的權限。
  401: "Unauthorized - 沒有存取權限", //client lack credentials
  400: "field(s) required - 欄位不可空白", // The request could not be understood by the server due to malformed syntax. The client SHOULD NOT repeat the request without modifications.
  404: "The subject you are looking for does not exist - 指定項目不存在或已經刪除",
};

export const errorResponse = (response, code) => {
  if (errorMsgs[code]) {
    return response.status(code).json({ error: errorMsgs[code] });
  } else {
    return response.status(code).json({ error: "Error - 發生錯誤" });
  }
};
