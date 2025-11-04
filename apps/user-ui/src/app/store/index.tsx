import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import { sendKafkaEvent } from '../actions/track-user';

type Product = {
    id:string;
    title:string,
    price:string,
    image:string,
    quantity?:number,
    shopId:string
}

export  type Store= {
cart:Product[],
wishlist:Product[],
addToCart:(
    product:Product,
    user:any,
    location:any,
    deviceInfo:string,)=>void;

    removeFromCart:(
        id:string,
        user:any,
        location:any,
        deviceInfo:string
    )=>void,

    addToWishlist:(
        product:Product,
        user:any,
        location:any,
        deviceInfo:string
    )=>void,
    
    removeFromWishlist:(
        id:string,
        user:any,
        location:any,
        deviceInfo:string
    )=>void



}
 

export const useStore = create<Store>()(
    persist(
        (set,get)=>({
            cart:[],
            wishlist:[],
            addToCart:(product,user,location,deviceInfo)=>{
                
                set((state)=>{
                    const existing = state.cart?.find((item)=>item?.id === product?.id);
                    // console.log(state)
                    if(existing){
                        return {
                            cart:state.cart.map((item)=>item?.id===product?.id? {...item,quantity:(product.quantity?? 1)}:item)
                        }
                    }
                    return {
                        cart:[...state.cart,{...product,quantity:product?.quantity}]
                    }
                })
                 if(user?.id &&location && deviceInfo){
                    sendKafkaEvent({
                        userId:user?.id,
                        productId:product?.id,
                        shopId:product?.shopId,
                        action:"add_to_cart",
                        country:location.country ||"unknown",
                        city:location.city ||"unknown",
                        device:deviceInfo || "unknown device"
                    })
                 }
                
            }
            ,
            removeFromCart:(id,user,location,deviceInfo)=>{
                const removeProduct= get().cart.find((item)=>item.id ===id);
                
                set((state)=>{
                    // console.log(state?.cart[0].id===id)
                    // console.log(id)
                    return ({
                    cart:state.cart?.filter((item)=>item.id!==id)
                })})

                if(user?.id &&location && deviceInfo &&removeProduct){
                    sendKafkaEvent({
                        userId:user?.id,
                        productId:removeProduct?.id,
                        shopId:removeProduct?.shopId,
                        action:"remove_from_cart",
                        country:location.country ||"unknown",
                        city:location.city ||"unknown",
                        device:deviceInfo || "unknown device"
                    })
                 }
            },
            // add to wishlist
            addToWishlist:(product,user,location,deviceInfo)=>{
                  set((state)=>{
                    if(state.wishlist.find((item)=>item.id===product.id))return state;
                    return {wishlist:[...state.wishlist,product]};
                  });

                  if(user?.id &&location && deviceInfo ){
                    sendKafkaEvent({
                        userId:user?.id,
                        productId:product?.id,
                        shopId:product?.shopId,
                        action:"add_to_wishlist",
                        country:location.country ||"unknown",
                        city:location.city ||"unknown",
                        device:deviceInfo || "unknown device"
                    })
                 }
            },
            removeFromWishlist:(id,user,location,deviceInfo)=>{
                const removeProduct = get().wishlist.find((item)=>(item.id===id))
                set((state)=>({
                   wishlist:state.wishlist.filter((item)=>item.id !==id)
                  }));
                  if(user?.id &&location && deviceInfo &&removeProduct){
                    sendKafkaEvent({
                        userId:user?.id,
                        productId:removeProduct?.id,
                        shopId:removeProduct?.shopId,
                        action:"remove_from_wishlist",
                        country:location.country ||"unknown",
                        city:location.city ||"unknown",
                        device:deviceInfo || "unknown device"
                    })
                 }
            },
            
        }),{name:"store-storage"} 
    )
)
