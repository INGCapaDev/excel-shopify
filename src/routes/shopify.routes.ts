import { Router } from 'express';

export const shopifyRouter = Router();

// * Controller
import shopifyController from '../controllers/shopify.controller';

// * Middlewares
import fileUploadMiddleware from '../middlewares/fileUploadMiddleware';

// * ROUTES
shopifyRouter.post(
  '/update-margin',
  fileUploadMiddleware,
  shopifyController.updateShopifyMargin,
);
