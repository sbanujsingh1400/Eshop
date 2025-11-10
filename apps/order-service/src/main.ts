/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'
import errorMiddleware from '../../../packages/libs/errorMiddleware/errorMiddleware'; 
import router from './routes/order.route';
import { createOrder } from './controllers/order.controller';

const app = express();


app.post('/create-order',bodyParser.raw({type:'application/json'}),createOrder);
app.use(cookieParser());


 
 app.use(express.json());
 
 
 app.use('/',router);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});
app.set("trust proxy",1);
app.use((err:any,req:any,res:any,next:any)=>errorMiddleware(err,req,res));
const port =  6004;
const host ='0.0.0.0'
const server = app.listen(port,host, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
