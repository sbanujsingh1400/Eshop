// create a new Conversation 

import { NextFunction,Response } from "express";
import { AuthError, NotFoundError, ValidationError } from "../../../../packages/libs/errorMiddleware";
import prisma from "../../../../packages/libs/prisma";

import redis from "../../../../packages/libs/redis";
import { clearUnseenCount, getUnseenCount } from "../../../../packages/libs/redis/message.redis";

export const newConversation = async (req:any,res:Response,next:NextFunction)=>{

    try {
        
        const {sellerId} = req.body;
        const userId = req.user.id;

        if(!sellerId){
            return next(new ValidationError("Seller Id is required!"));
        }

        
        // Directlycheck if a conversationGroup already exists for this user + seller

        const existingGroup = await prisma.conversationGroup.findFirst({
            where:{
                isGroup:false,
                participantIds:{
                    hasEvery:[userId,sellerId]
                }
            }
        });

        if (existingGroup){
            return res.status(200).json({conversation:existingGroup,isNew:false});
        }

        // create conversation +partici[ants 
    const newGroup = await prisma.conversationGroup.create({
        data:{
            isGroup:false,
            creatorId:userId,
            participantIds:[userId,sellerId]
        }
    });

const participants  = await prisma.participant.createMany({
    data:[
        {conversationId:newGroup.id,userId},
        {conversationId:newGroup.id,sellerId},
    ]
});

return res.status(201).json({conversation:newGroup,isNew:true});





    } catch (error) {
       return next(error);
    }


}


export const getUserConversations = async (req:any,res:Response,next:NextFunction)=>{

    try {
        
        const userId = req.user.id;

        // Find all conversationGroups where the use is a participants

        const conversations = await prisma.conversationGroup.findMany({
            where:{
                participantIds:{
                    has:userId
                },
            },
            orderBy:{
                updatedAt:'desc'
            }

        })

        const responseData = await Promise.all(conversations.map(async (group)=>{
            const sellerParticipant = await prisma.participant.findFirst({where:{
                conversationId:group.id,
                sellerId:{not:null}
            }})

            let sellers =null;
            if(sellerParticipant?.sellerId){
                sellers = await prisma.sellers.findUnique({where:{id:sellerParticipant.sellerId},include:{
                    shop:{include:{avatar:true}},
                
                }});
            }
            // get the last message of the conversation
            const lastMessage = await prisma.message.findFirst({
                where:{conversationId:group.id},
                orderBy:{
                    createdAt:"desc"
                }
            })


            // check online status from redis

            let isOnline = false;

            if(sellerParticipant?.sellerId){
                const redisKey = `online:seller:${sellerParticipant.sellerId}`;
                const redisResult = await redis.get(redisKey);
                isOnline =!!redisResult;
            }

            const unreadCount = await getUnseenCount("user",group.id);

            return {
                conversationId:group.id,
                seller:{
                    id:sellers?.id ||null,
                    name:sellers?.shop?.name || "Unknown",
                    isOnline,
                    avatar:sellers?.shop?.avatar
                },
                lastMessage:lastMessage?.content || "Say something to start a conversation",
                lastMessageAt:lastMessage?.createdAt || group.updatedAt,
                unreadCount
            }


        }));

        return res.status(200).json({conversations:responseData});

    } catch (error) {
       console.log(error);
       return next(error);
    }
}


export const getSellerConversations = async (req:any,res:Response,next:NextFunction)=>{

    try {
        
        const sellerId = req.seller.id;

        // Find all conversationGroups where the use is a participants

        const conversations = await prisma.conversationGroup.findMany({
            where:{
                participantIds:{
                    has:sellerId
                },
            },
            orderBy:{
                updatedAt:'desc'
            }

        })

        const responseData = await Promise.all(conversations.map(async (group)=>{
            const userParticipant = await prisma.participant.findFirst({where:{
                conversationId:group.id,
                userId:{not:null}
            }})

            let users =null;
            if(userParticipant?.userId){
                users = await prisma.users.findUnique({where:{id:userParticipant.userId},include:{avatar:true}});
            }
            // get the last message of the conversation
            const lastMessage = await prisma.message.findFirst({
                where:{conversationId:group.id},
                orderBy:{
                    createdAt:"desc"
                }
            })


            // check online status from redis

            let isOnline = false;

            if(userParticipant?.userId){
                const redisKey = `online:user:${userParticipant?.userId}`;
                const redisResult = await redis.get(redisKey);
                isOnline =!!redisResult;
            }

            const unreadCount = await getUnseenCount("seller",group.id);

            return {
                conversationId:group.id,
                user:{
                    id:users?.id ||null,
                    name:users?.name || "Unknown",
                    isOnline,
                    avatar:users?.avatar || null
                },
                lastMessage:lastMessage?.content || "Say something to start a conversation",
                lastMessageAt:lastMessage?.createdAt || group.updatedAt,
                unreadCount
            }


        }));

        return res.status(200).json({conversations:responseData});

    } catch (error) {
        console.log(error)
       return next(error);
    }
}


export const fetchMessages = async (req:any,res:Response,next:NextFunction)=>{


    try {
        
        const userId = req.user.id;
        const {conversationId}= req.params;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 10;
        if(!conversationId){
            return next(new ValidationError("Conversation id is required"))
        }

        const conversation = await prisma.conversationGroup.findUnique({
            where:{id:conversationId}
        });

        if(!conversation){
            return next(new NotFoundError("Conversation not found"));
        }


    const hasAccess = conversation.participantIds.includes(userId);

        if(!hasAccess){
            return next( new AuthError("Access denied to this conversation") );
        }
        
        // Clear unseen message for this user
        await clearUnseenCount("user",conversationId);

        // Get the seller participant 
        const sellerParticipant = await prisma.participant.findFirst({
            where:{
                conversationId,
                sellerId:{not:null}
            }
        })

        let seller= null;
        let isOnline=false;
        if(sellerParticipant?.sellerId){
            seller= await prisma.sellers.findUnique({
                where:{
                    id:sellerParticipant.sellerId
                },
                include:{
                    shop:{
                        include:{avatar:true}
                    }
                }
            })


            const redisKey = `online:seller:${sellerParticipant?.sellerId}`;
            const redisResult = await redis.get(redisKey);
            isOnline=!!redisResult;
        }

        const messages= await prisma.message.findMany({
            where:{conversationId},
            orderBy:{createdAt:'desc'},
            skip:(page-1) * pageSize,
            take:pageSize,
        })

        return res.status(200).json({
            messages,
            seller:{
                id:seller?.id || null,
                name:seller?.shop?.name || "Unknown",
                avatar:seller?.shop?.avatar || null,
                isOnline,
            },
            currentPage:page,
            hasMore:messages.length===pageSize
        })


    } catch (error) {
      console.log(error);
      return    next(error);  
    }


}


export const fetchSellerMessages = async (req:any,res:Response,next:NextFunction)=>{


    try {
        
        const sellerId = req.seller.id;
        const {conversationId}= req.params;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 10;
        if(!conversationId){
            return next(new ValidationError("Conversation id is required"))
        }

        const conversation = await prisma.conversationGroup.findUnique({
            where:{id:conversationId}
        });

        if(!conversation){
            return next(new NotFoundError("Conversation not found"));
        }


    const hasAccess = conversation.participantIds.includes(sellerId);

        if(!hasAccess){
            return next( new AuthError("Access denied to this conversation") );
        }
        
        // Clear unseen message for this user
        await clearUnseenCount("seller",conversationId);

        // Get the seller participant 
        const userParticipant = await prisma.participant.findFirst({
            where:{
                conversationId,
                userId:{not:null}
            }
        })

        let user= null;
        let isOnline=false;
        if(userParticipant?.userId){
            user= await prisma.users.findUnique({
                where:{
                    id:userParticipant.userId
                },
                include:{
                  avatar:true
                }
            })


            const redisKey = `online:user:${userParticipant?.userId}`;
            const redisResult = await redis.get(redisKey);
            isOnline=!!redisResult;
        }

        const messages= await prisma.message.findMany({
            where:{conversationId},
            orderBy:{createdAt:'desc'},
            skip:(page-1) * pageSize,
            take:pageSize,
        })

        return res.status(200).json({
            messages,
            user:{
                id:user?.id || null,
                name:user?.name || "Unknown",
                avatar:user?.avatar || null,
                isOnline,
            },
            currentPage:page,
            hasMore:messages.length===pageSize
        })


    } catch (error) {
      console.log(error);
      return    next(error);  
    }


}



