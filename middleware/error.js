import ErrorResponse from "../utils/errorResponse.js";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  //console.log(err);

  if (err.code === 11000) {
    // duplicate error key in mongoose
    const message = `Duplicate Field value Enter`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "validationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorHandler;
