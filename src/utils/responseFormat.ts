import { Response } from "express";

interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
  errorDetails?: any;
  statusCode?: number;
}

export const sendResponse = (
  res: Response,
  { success, message, data, errorDetails, statusCode = 200 }: ResponseData
) => {
  const response: any = {
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
