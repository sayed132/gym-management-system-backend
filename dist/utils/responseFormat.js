"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, { success, message, data, errorDetails, statusCode = 200 }) => {
    const response = {
        success,
        message,
    };
    if (data) {
        response.data = data;
    }
    if (errorDetails) {
        response.errorDetails = errorDetails;
    }
    if (statusCode) {
        response.statusCode = statusCode;
    }
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
