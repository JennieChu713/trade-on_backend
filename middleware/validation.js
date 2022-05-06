import { errorResponse } from "../utils/errorMsgs.js";

export default class ValidationMiddleware {
  static idValidate(req, res, next) {
    const { id } = req.params;
    const { relatedId, categoryId } = req.body;
    if (relatedId) {
      if (relatedId.length !== 24 || !parseInt(relatedId, 16)) {
        errorResponse(res, 400);
        return;
      }
    }

    if (categoryId) {
      if (categoryId.length !== 24 || !parseInt(categoryId, 16)) {
        errorResponse(res, 400);
        return;
      }
    }

    if (id) {
      if (id.length !== 24 || !parseInt(id, 16)) {
        errorResponse(res, 404);
        return;
      }
    }
    next();
  }

  static tradingOptionsValidate(req, res, next) {
    const { chooseDealMethod } = req.body;
    const obj = JSON.parse(JSON.stringify(req.body)); // get rid of [Object: null prototype] in case
    res.locals.obj = obj;
    let { tradingOptions } = obj;
    if (chooseDealMethod) {
      return ["faceToFace", "sevenEleven", "familyMart"].includes(
        chooseDealMethod
      )
        ? next()
        : errorResponse(res, 400);
    }
    if (tradingOptions) {
      if (tradingOptions.length) {
        if (typeof tradingOptions === "string") {
          tradingOptions = tradingOptions.split(",");
        }
        if (
          !tradingOptions.every((opt) => ["面交", "7-11", "全家"].includes(opt))
        ) {
          return errorResponse(res, 400);
        }
        res.locals.tradingOptions = tradingOptions;
      }
    }
    next();
  }
}
