import { Response } from "express";

type Props = {
  res: Response;
  status?: number;
  message: string;
  data?: any;
  error?: any;
}

export const sendResponse = ({
  res,
  status = 200,
  message,
  data = null,
  error = null,
}: Props) => {

  const success = status < 400

  if (error) {
    console.log("Error:", error);
  }

  res.status(status).json({
    status,
    message,
    success,
    data,
  });
}