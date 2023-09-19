import { Router } from 'express';
import { handleHTTPError } from '../utils/handleError';

export const router = Router();

// * ROUTES
router.use((_, res) => {
  handleHTTPError(res, 'ERROR_INVALID_ROUTE', 404);
});
