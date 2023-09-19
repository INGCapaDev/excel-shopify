import express from 'express';
import './utils/handleEnv';
import cors from 'cors';

export const app = express();

// * Here set up the APP! 🤖
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Here call routes! 🤖
import { router } from './routes/index.routes';
// * localhost:PORT/api/----
app.use('/api', router);
