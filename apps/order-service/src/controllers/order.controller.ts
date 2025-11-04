import redis from "../../../../packages/libs/redis";
import { ValidationError } from "../../../../packages/libs/errorMiddleware";
import  { NextFunction,Response } from "express";
import Stripe from 'stripe';
import prisma from "../../../../packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/send-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPaymentIntent = async (req:any,res:Response,next:NextFunction)=>{

    try {
        console.log("Inside createpayment intent")
     const {amount,sellerStripeAccountId,sessionId}= req.body;
     

     const customerAmount = Math.round(amount *100)
     const platformFee = Math.floor(customerAmount *0.1);

     const paymentIntent = await stripe.paymentIntents.create({
        amount:customerAmount,
        currency:"usd",
        payment_method_types:["card"],
        application_fee_amount:platformFee,
        transfer_data:{
            destination:sellerStripeAccountId,
        },
        metadata:{
            sessionId,
            userId:req.user.id
        }
     });

     return res.send({clientSecret:paymentIntent.client_secret})
    

    } catch (error) {
        console.log(error)
      return  next(error);
    }

}


export const createPaymentSession =  async (req:any,res:Response,next:NextFunction)=>{
    try {
      console.log("Inside createpaymentsession")
        const {cart,selectedAddressId,coupon}= req.body;
        const userId = req.user.id;

        if(!cart || !Array.isArray(cart) || cart.length===0){
            return next(new ValidationError("Cart is empty or invalid"))
        }
        
        const normalizedCart = JSON.stringify(
            cart.map((item:any)=>({id:item.id,quantity:item.quantity,sale_price:item.sale_price,shopId:item.shopId})).sort((a,b)=>a?.id?.localeCompare(b?.id)) 
        )
      
        const keys = await redis.keys("payment-session:*");
        for(const key of keys){
            const data = await  redis.get(key);
            if(data){
                const session = JSON.parse(data);
                if(session.userId===userId){
                    const existingCart=JSON.stringify(
                        session.cart.map((item:any)=>({id:item.id,quantity:item.quantity,sale_price:item.sale_price,shopId:item.shopId,selectedOptions:item.selectedOptions || {}})).sort((a:any,b:any)=>a.id.localeCompare(b.id)) 
                    );
                    if(existingCart===normalizedCart){
                        return res.status(200).json({sessionId:key.split(":")[1]});
                    } else {
                        await redis.del(key);
                    }
                }
            }
        }
  
        // fetch sellers and their stripe accounts 

        const  uniqueShopIds = [...new Set(cart.map((item:any)=>item.shopId))];

        const shops = await prisma.shops.findMany({
            where:{
                id:{in:uniqueShopIds}
            },
            select:{
                id:true,
                sellerId:true,
                sellers:{
                    select:{
                        stripeId:true
                    }
                }
            }
        })

  const sellerData = shops.map((shop)=>({
    shopId:shop.id,
    sellerId:shop.sellerId,
    stripeAccountId:shop?.sellers?.stripeId
  }))


//   calculate total

const totalAmount = cart.reduce((total:number,item:any)=>{
    return total +item.quantity * item.sale_price;
},0);

//    create session payload 

const sessionId = crypto.randomUUID();
const sessionData = {
    userId,
    cart,
    sellers:sellerData,
    totalAmount,
    shippingAddressid:selectedAddressId || null,
    coupon:coupon || null
}

await redis.setex(`payment-session:${sessionId}`,600,JSON.stringify(sessionData));


return res.status(201).json({sessionId});


    } catch (error) {
      console.log(error)  
      return next(error)
    }
}


export const verifyingPaymentSession = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Inside verifypayment session")
      // 1. Get the session ID from the request query string
      const sessionId = req.query.sessionId as string;
      
      // 2. Validate that the session ID was provided
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required." });
      }
  
      // 3. Fetch the session data from Redis using the constructed key
      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);
  
      // 4. Handle cases where the session is not found (or has expired)
      if (!sessionData) {
        return res.status(404).json({ error: "Session not found or expired." });
      }
  
      // 5. Parse the string data from Redis back into a JSON object
      const session = JSON.parse(sessionData);
  
      // 6. Send the successful response with the session details
      return res.status(200).json({
        success: true,
        session,
      });
  
    } catch (error) {
      // 7. Pass any errors to the global error handler
      console.log(error)
      return next(error);
    }
  };

//   create order 

export const createOrder = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    console.log("INCSIDE CREATE ORDER CONTROLLER",req.headers);
   try {
    
     const stripeSignature = req.headers['stripe-signature'] ;
     
     if(!stripeSignature){
        return res.status(400).send('Missiong stripe signature');

     }

     const rawBody = (req as any).body;
     let event;
      
  try {
    //  console.log(rawBody,req)
    event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
     )

  console.log(event.type)
  } catch (error:any) {
      
    console.log(error);
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const sessionId = paymentIntent.metadata.sessionId;
    const userId = paymentIntent.metadata.userId;
  
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
  
    if (!sessionData) {
      console.warn("Session data expired or missing for", sessionId);
      return res
        .status(200)
        .send("No session found, skipping order creation");
    }
    
    // The rest of the order creation logic would go here...
    const {cart,totalAmount,shippingAddressid,coupon}= JSON.parse(sessionData);
    const user = await prisma.users.findUnique({where:{id:userId}});
    const name = user?.name;
    const email = user?.email;
    
    const shopGrouped = cart.reduce((acc: any, item: any) => {
     
        if (!acc[item.shopId]) {
          acc[item.shopId] = [];
        }
        
        acc[item.shopId].push(item);
        return acc;
      }, {}); 
      
      
      
      for (const shopId in shopGrouped) {
        
        const orderItems = shopGrouped[shopId];
      let orderTotal = orderItems.reduce((sum:number,p:any)=>sum+p.quantity* p.sale_price,0)
      // console.log('----------------------------------',orderTotal,'----------------------------------')
       
      if(coupon && coupon.discountedProductId && orderItems.some((item:any)=>item.id ===coupon.discountedProductId )){
        const discountedItem = orderItems.find((item:any)=>item.id===coupon.discountedProductId);
        if(discountedItem){
            const discount = coupon.discountPercent >0 ?(discountedItem.sale_price*discountedItem.quantity*coupon.discountPercent)/100:(coupon.discountAmount);
            orderTotal -=discount
        }
      }
    //   create order 
    await prisma.orders.create({
        data: {
          userId,
          shopId,
          total: orderTotal,
          // to change this status to paymentStatus in future
          status: "Paid",
          shippingAddressId: shippingAddressid  || null,
          couponCode: coupon?.code || null,
          discountAmount: coupon?.discountAmount || 0,
          items: {
            // This is a nested write: create related orderItems at the same time
            create: orderItems.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.sale_price,
              selectedOptions: item.selectedOptions,
            })),
          },
        },
      });
    //   update product and analytics

    for (const item of orderItems) {
        // Destructure for clarity
        const { id: productId, quantity } = item;
    
        // 1. Update the product's stock and totalSales count atomically
        await prisma.products.update({
          where: { id: productId },
          data: {
            stock: { decrement: quantity },
            totalSales: { increment: quantity }, // Note: Assumes totalSales is a number type
          },
        });
    
        // 2. Update (or create) the analytics for this specific product
        await prisma.productAnalytics.upsert({
          where: { productId: productId },
          create: {
            productId,
            shopId,
            purchases: quantity,
            lastViewedAt: new Date(),
          },
          update: {
            purchases: { increment: quantity },
          },
        });
    
        // 3. Find the user's existing analytics record
        const existingAnalytics = await prisma.userAnalytics.findUnique({
          where: { userId },
        });
    
        // 4. Create a new "purchase" action object for this item
        const newAction = {
          productId,
          shopId,
          action: "purchase",
          timestamp: new Date(), // Corrected from Date.now() to create a Date object
        };
    
        // 5. Safely get the current list of actions, or an empty array
        const currentActions = Array.isArray(existingAnalytics?.actions)
          ? (existingAnalytics.actions as Prisma.JsonArray) // Type assertion for safety
          : [];
    
        // 6. Update or create the user's analytics record with the new action
        if (existingAnalytics) {
          // If analytics exist, update them
          await prisma.userAnalytics.update({
            where: { userId },
            data: {
              lastVisited: new Date(),
              // Add the new action to the end of the existing actions array
              actions: [...currentActions, newAction],
            },
          });
        } else {
          // If no analytics exist, create a new record
          await prisma.userAnalytics.create({
            data: {
              userId,
              lastVisited: new Date(),
              actions: [newAction],
            },
          });
        }
      }
      
     await sendEmail(email!,"Your Eshop Order Confirmation","order-confirmation",{
        name,cart,
        totalAmount:coupon?.discountAmount? totalAmount-coupon?.discountAmount:totalAmount,
        trackingUrl:`https://eshop.com/order/${sessionId}`
     })

//    Create notifications for sellers

 const createdShopIds = Object.keys(shopGrouped);
 const sellerShops = await prisma.shops.findMany({
    where:{id:{in:createdShopIds}},
    select:{
        id:true,
        sellerId:true,
        name:true
    }
 });

 for (const shop of sellerShops) {
    // Get a sample product from the order for this specific shop
    const firstProduct = shopGrouped[shop.id][0];
    const productTitle = firstProduct?.title || "new item";
  
    // Create a notification for the seller

    await prisma.notifications.create({
      data: {
        title: "🛍️ New Order Received",
        message: `A customer just ordered ${productTitle} from your shop.`,
        creatorId: userId,
        receiverId: shop.sellerId,
        redirect_link: `https://eshop.com/order/${sessionId}`,
      },
    });

    await prisma.notifications.create({
        data: {
          title: "🛍️ Platform Order Alert",
          message: `A new order was placed by ${name}.`,
          creatorId: userId,
          receiverId: "admin",
          redirect_link: `https://eshop.com/order/${sessionId}`,
        },
      });
  }

  await redis.del(sessionKey);
    
      }

  }
  
  return res.status(200).json({received:true})
   } catch (error) {
    console.log(error);
   return  next(error)
   }



  }


  //get sellers orders 
  export const getSellersOrders =async (req:any,res:Response,next:NextFunction)=>{
// console.log('lalalal')
      try {
        const shop = await prisma.shops.findUnique({
          where:{
            sellerId:req.seller.id
          }
        })   
     
          const orders = await prisma.orders.findMany({
            where:{
              shopId:shop?.id
            },
            include :{
              users:{
                select:{
                  id:true,
                  name:true,
                  email:true,
                  avatar:true
                }
              }
            },
            orderBy:{
              createdAt:"desc"
            }
          });

          return res.status(201).json({
            success:true,
            orders
          });


      } catch (error) {
        console.log(error);
        return next(error);
      }

  }


  // get Order Details 

  export const getOrderDetails =async (req:any,res:Response,next:NextFunction)=>{
   
   try {
    // console.log('inside order details');
    const orderId = req.params.id;

    const order = await prisma.orders.findUnique({where:{id:orderId},include:{items:true}});
     if(!order){
      return next(new ValidationError("Order not found with the id!"));
     }

     const shippingAddress = order.shippingAddressId ? await prisma.address.findUnique({where:{id:order?.shippingAddressId}}): null;

     const coupon = order.couponCode ? await prisma.discount_codes.findUnique({where:{discountCode:order.couponCode}}):null;
     const productIds = order.items.map((item)=>item.productId);
     const products = await prisma.products.findMany({
      where:{
        id:{in:productIds}
      },
      select:{
        id:true,
        title:true,
        images:true,
      }
     })

  const productMap =  new Map(products.map((p)=>[p.id,p]));

  const items = order.items.map((item)=>({...item,selectedOptions:item.selectedOptions,product:productMap.get(item.productId)|| null }));


    return res.status(200).json({success:true,order:{...order,items,shippingAddress,couponCode:coupon}});
   } catch (error) {
    console.log(error);
  next(error)

   }

  }

  export  const updateDeliveryStatus = async (req:any,res:Response,next:NextFunction)=>{
    try {
      
  const {orderId}= req.params ;
  const {deliveryStatus}= req.body;
  // console.log(orderId,deliveryStatus)

  if(!orderId || !deliveryStatus){
    return res.status(400).json({error:"Missing order Id or delivery status"});
  }

  const allowedStatuses= ["Ordered","Packed","Shipped",'Out for Delivery',"Delivered","Processing","Cancelled"];

  if(!allowedStatuses.includes(deliveryStatus)){
    return next(new ValidationError("Invalid delivery status"));
  }

  const existingOrder= await prisma.orders.findUnique({where:{id:orderId}});

  if(!existingOrder){
    return next(new ValidationError("Order not found"));
  }

  const updateOrder = await prisma.orders.update({
    where:{id:orderId},
    data:{
      deliveryStatus,
      updatedAt:new Date()
    }
  })

  return res.status(200).json({success:true,message:'Delivery status updated successfully',order:updateOrder});

    } catch (error) {
      
     return next(error);

    }
  }

  // update order status 
export const verifyCouponCode = async (req:any,res:Response,next:NextFunction)=>{

  try {
    
    const {couponCode,cart}= req.body;

    if(!couponCode || !cart){
      return next(new ValidationError('COupon cocde and cart are reuiqred'));

    }

      const discount = await prisma.discount_codes.findUnique({
        where:{discountCode:couponCode}
      });

      // FInd matching product that includes this discount code
      const matchingProduct = cart.find((item:any)=>item.discount_codes?.some((d:any)=>d===discount?.id));

      if(!matchingProduct){
        return res.status(200).json({valid:false,
        discount:0,
        discountAmount:0,
        message:"No matching product found in the cart for this coupon"
        });

       
      }
      let discountAmount = 0;
      const price = matchingProduct.sale_price * matchingProduct.quantity;

      if(discount?.discountType ==='percentage'){
        discountAmount= (price * discount?.discountValue) /100
      }else if(discount?.discountType ==='flat'){
        discountAmount=discount.discountValue;
      }
      // Prevent discount from being greater thantotal price
      discountAmount= Math.min(discountAmount,price);

      res.status(200).json({
        valid:true,
        discount:discount?.discountValue,
        discountAmount:discountAmount.toFixed(2),
        discountedProductId:matchingProduct.id,
        discountType:discount?.discountType,
        message:"Discount applied to 1 eligible product"
      });



  } catch (error) {
    console.log(error)
    next(error)
  }

}

export const getUserOrders = async (req:any,res:Response,next:NextFunction)=>{
  try {
    
   const orders = await prisma.orders.findMany({
    where:{
      userId:req.user.id,
    },
    include:{
      items:true,
      users:true
    },
    orderBy:{
      createdAt:"desc"
    }
   })

    res.status(200).json({success:true,orders})

  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const getUserProfileDetails = async (req:any,res:Response,next:NextFunction)=>{
  
  try {
    
      const user = req.user;
      
      if(!user){
        return res.status(500).json({success:false,message:"Unauthorized access!!"});
      }
    
      const orders = await prisma.orders.findMany({where:{userId:user?.id}});
        if(!orders){
          return next(new ValidationError('Orders not found'));
        }
      const totalOrder=orders.length;
      const processingOrders= orders.reduce((val,order)=>{ return order.status==='Processing'?val+1:val},0)
      const completedOrders= orders.reduce((val,order)=>{ return order.status==='Paid'?val+1:val},0)


      return res.status(200).json({totalOrder,processingOrders,completedOrders});

  } catch (error) {
     console.log(error);
    next(error);
  }
}



