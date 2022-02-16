import axios from "axios";
import { config } from "dotenv";
import FormData from "form-data";

if (process.env.NODE_ENV !== "production") {
  config();
}

// axios setting
const imgurAPICommon = axios.create({
  baseURL: "https://api.imgur.com",
  mimeType: "multipart/form-data",
});

// imgur APIs
export default class ImgurAPIs {
  // get access token with refresh token
  static async getImgurToken() {
    const data = new FormData();
    data.append("refresh_token", process.env.IMGUR_REFRESH_TOKEN);
    data.append("client_id", process.env.IMGUR_CLIENT_ID);
    data.append("client_secret", process.env.IMGUR_CLIENT_SECRET);
    data.append("grant_type", "refresh_token");

    try {
      const getAccessToken = await imgurAPICommon.post("/oauth2/token", data, {
        headers: { ...data.getHeaders() },
      });
      if (getAccessToken) {
        const { access_token } = getAccessToken.data;
        return access_token;
      }
    } catch (err) {
      throw new Error(err);
    }
  }
  // upload image
  static async uploadToImgur(token, fillingData) {
    const data = new FormData();
    data.append("image", fillingData.image);
    data.append("type", "file");
    data.append("album", fillingData.album);
    try {
      const uploadData = await imgurAPICommon.post("/3/image", data, {
        headers: { Authorization: `Bearer ${token}`, ...data.getHeaders() },
      });
      if (uploadData) {
        const {
          data: { link, deletehash },
        } = uploadData.data;
        return { imgUrl: link, deleteHash: deletehash };
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  static async deleteImage(token, deletionId) {
    const data = new FormData();
    try {
      const response = await imgurAPICommon.delete(`/3/image/${deletionId}`, {
        headers: { Authorization: `Bearer ${token}`, ...data.getHeaders() },
      });
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }
}
