import type { Response } from 'express';

export const handleHTTPError = (
  res: Response,
  message: string = 'ERROR_HAPPENED',
  code: number = 403,
  error?: unknown,
) => {
  res.status(code);
  res.send({
    error: message,
    response: error,
  });
};
