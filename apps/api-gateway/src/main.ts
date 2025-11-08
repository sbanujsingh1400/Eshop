import express from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from  "express-http-proxy";
// import morgan from 'morgan'; 
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
// import swaggerUi from 'swagger-ui-express';
// import axios from 'axios';
import cookieParser from 'cookie-parser';
import initializeConfig from './libs/InitializeSiteConfig';



const app = express();
const user_uri =process.env.NEXT_PUBLIC_SELLER_URI!
const seller_uri =process.env.NEXT_PUBLIC_USER_URI!

//Middlewares declaration
console.log(user_uri,seller_uri)
 app.use(cors({
  origin:[user_uri,seller_uri],
  allowedHeaders:["Authorization", "Content-Type"],
  credentials:true
 }))

 app.use(express.json({limit:"100mb"}));
 app.use(express.urlencoded({limit:"100mb",extended:true}));
 app.use(cookieParser());
 app.set("trust proxy",1);
  
const limiter = rateLimit({
  windowMs:15 * 60 * 1000,
  max:(req:any)=>(req.user? 1000 :100),
  message:{error:"Too many requests, please try again later"},
  standardHeaders:true,
  legacyHeaders:true,
  keyGenerator:(req:any)=>ipKeyGenerator(req)
})


app.use(limiter);






app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!!' });
});
const CHATTING_URL =process.env.NODE_ENV=='production'? process.env.CHATTING_SERVICE_URL: process.env.CHATTING_SERVICE_URL_LOCAL;
const ORDER_URL =process.env.NODE_ENV=='production'?  process.env.ORDER_SERVICE_URL:process.env.ORDER_SERVICE_URL_LOCAL;
const PRODUCT_URL =process.env.NODE_ENV=='production'?  process.env.PRODUCT_SERVICE_URL:process.env.PRODUCT_SERVICE_URL_LOCAL;
const AUTH_URL =process.env.NODE_ENV=='production'?  process.env.AUTH_SERVICE_URL:process.env.AUTH_SERVICE_URL_LOCAL;
console.log( process.env.CHATTING_SERVICE_URL)
app.use("/chatting", proxy(CHATTING_URL!));
app.use("/order", proxy(ORDER_URL!)); 
app.use("/product", proxy(PRODUCT_URL!));
app.use("/", proxy(AUTH_URL!));




const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
try {
     initializeConfig();
     console.log('site config initialize successfully')
} catch (error) {
  console.log("Failed to initialize site config",error);
}

});
server.on('error', console.error);