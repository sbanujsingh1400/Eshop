export  const navItems:NavItemsTypes[] = [
    {title:"Home",
     href:'/'
},
{title:"Products",
href:'/products'
},
{title:"Shops",
href:'/shops'
},
{title:"Offers",
href:'/offers'
},
{title:"Become A Seller",
href: process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SELLER_URI+"/signup":process.env.NEXT_PUBLIC_SELLER_URI_LOCAL+"/signup"!
}

]