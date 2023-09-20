import { NextFunction, Request, Response } from 'express';
import { handleHTTPError } from '../utils/handleError';
import multer from '../utils/handleStorage';

const fileUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  multer.single('file')(req, res, (error) => {
    if (!error) return next();
    handleHTTPError(res, 'ERROR_UPLOADING_FILE', 500, error);
  });
};

export default fileUploadMiddleware;
