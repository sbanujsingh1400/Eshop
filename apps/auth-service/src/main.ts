import express from 'express';
import cors from 'cors'
// import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import errorMiddleware from '../../../packages/libs/errorMiddleware/errorMiddleware'; 
// import errorMiddleware from '@packages/libs/errorMiddleware/errorMiddleware';
import router from './routes/auth.router';

// import  AuthRouter from './routes/auth.router';
import  SwaggerUi  from 'swagger-ui-express';
import  {swaggerDocs}  from './utils/swagger-output';
import cookieParser from 'cookie-parser';

// import redis from '@packages/libs/redis';



const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(cookieParser());
app.use(cors({
  origin:["http://localhost:3000","http://localhost:3001","http://localhost:3003","http://210.79.129.107",  "https://210.79.129.107"],
  allowedHeaders:["Authorization", "Content-Type"],
  credentials:true
 }))

 app.use(express.json({limit:"100mb"}));
 app.use(express.urlencoded({limit:"100mb",extended:true}));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API auth service' });
});

// Routes
// app.use("/api",AuthRouter);
// export const swaggerDocs= 
// console.log('___REACHED AUTH SERVICE_____');
app.use('/api-docs',SwaggerUi.serve,SwaggerUi.setup(swaggerDocs));
app.get('/docs-json',(req,res)=>{
  res.json(swaggerDocs);
})



app.use('/',router);
app.use((err:any,req:any,res:any,next:any)=>errorMiddleware(err,req,res));
const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port} Auth service is running at http://localhost:${port}/api ` );
  console.log(`swagger Docs available at http:/localhost:${port}/docs`)
  
});
console.log('auth service is called');

server.on('error',(error)=>{
console.log("Server Error :  "+error)

})