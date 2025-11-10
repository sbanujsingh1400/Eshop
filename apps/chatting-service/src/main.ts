
import express from 'express';
import cookieParser from 'cookie-parser'
import { createWebSocketServer } from './websocket';
import { startConsumer } from './chat-message.consumer';
import router from './routes/chat.routes';

const app = express();
const port = 6006;
const host ='0.0.0.0'
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy",1);
app.use('/',router)
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});


const server = app.listen(port as number , host, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
//websocket server
createWebSocketServer(server);
startConsumer().catch((error:any)=>{
  console.log(error);
});






server.on('error', console.error);
