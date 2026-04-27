export function sendSuccess(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
}

export function sendError(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(data ? { data } : {}),
  });
}
