import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import IndexRouter from './routes/index.routes'

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', IndexRouter);

export default app;