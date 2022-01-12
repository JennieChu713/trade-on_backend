import multer from "multer";

const fileFilter = (req, file, cb) => {
  const allowFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploadCheck = multer({ fileFilter });
