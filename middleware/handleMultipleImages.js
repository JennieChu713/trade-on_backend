import ImgurAPIs from "../utils/imgurAPI.js";
const { uploadToImgur } = ImgurAPIs;

export default class UploadImagesMiddleware {
  static async uploadMulti(req, res, next) {
    if (!req.files || !req.files.length) {
      next();
    }
    try {
      let allImgUrls = [];
      for (let file of req.files) {
        let encode_image = file.buffer.toString("base64");
        let uploadImgur = {
          image: encode_image,
          album: process.env.IMGUR_ALBUM_POST_ID,
        };
        let getImgurData = await uploadToImgur(
          res.locals.imgurToken,
          uploadImgur
        );
        if (getImgurData) {
          allImgUrls.push(getImgurData);
        }
      }
      if (allImgUrls.length === req.files.length) {
        res.locals.imgs = allImgUrls;
        next();
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
