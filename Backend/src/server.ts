import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dashboardRouter } from './routes/dashboard';
import { vesselRouter } from './routes/vessels';
import { portRouter } from './routes/ports';
import { shipmentRouter } from './routes/shipments';
import { optimizationRouter } from './routes/optimization';
import { freightRouter } from './routes/freight';
import { weatherRouter } from './routes/weather';
import { marketRouter } from './routes/market';

const app = express();
const PORT = process.env.PORT || 5000;
const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8000';
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/dashboard', dashboardRouter);
app.use('/api/vessels', vesselRouter);
app.use('/api/ports', portRouter);
app.use('/api/shipments', shipmentRouter);
app.use('/api/optimization', optimizationRouter);
app.use('/api/forecast', freightRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/market', marketRouter);
import { enquiriesRouter } from './routes/enquiries';
app.use('/api/enquiries', enquiriesRouter);
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});
app.listen(PORT, () => {
  console.log(`backend running on http://localhost:${PORT}`);
});
export { app, ML_ENGINE_URL };
