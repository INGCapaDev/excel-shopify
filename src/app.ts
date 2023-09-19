import express, { Router } from 'express';
import './utils/handleEnv';
import cors from 'cors';
import { handleHTTPError } from './utils/handleError';

export const app = express();

// * Here set up the APP! 🤖
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Here call routes! 🤖
const router = Router();
router.use((_, res) => {
  handleHTTPError(res, 'ERROR_INVALID_ROUTE', 404);
});
app.use('/api', router);
