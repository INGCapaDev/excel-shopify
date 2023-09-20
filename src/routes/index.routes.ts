import { Router } from 'express';
import { handleHTTPError } from '../utils/handleError';

export const router = Router();

// * ROUTES
import { shopifyRouter } from './shopify.routes';
router.use('/shopify', shopifyRouter);

router.use((_, res) => {
  handleHTTPError(res, 'ERROR_INVALID_ROUTE', 404);
});
