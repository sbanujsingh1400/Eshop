import imagekit from "../../../../packages/libs/imageKit";
import { AuthError, NotFoundError, ValidationError } from "../../../../packages/libs/errorMiddleware";
import prisma from "../../../../packages/libs/prisma"
import { NextFunction,Request,Response } from "express"
import { Prisma } from "@prisma/client";

export const  getCategories = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        
     const config = await prisma.site_config.findFirst();
     if(!config){
        return res.status(404).json({message:"Categories not found"});

     }

     return res.status(200).json({
        categories:config.categories,
        subCategories:config.subCategories
     });


    } catch (error) {
     
        return next(error);
        
    }
}



export const  createDiscountCode = async (req:any,res:Response,next:NextFunction)=>{

try {
      
   const {public_name,discountType,discountValue,discountCode}= req.body;

   const isDiscountCodeExist= await prisma.discount_codes.findUnique({where:{discountCode}});
   if(isDiscountCodeExist){
   return next(new ValidationError("Discount code already available plese use a different code!"))
   }


      const discount_code = await prisma.discount_codes.create({
        data:{
            public_name,
            discountType,
            discountCode,
            discountValue:parseFloat(discountValue),
            sellerId:req.seller.id
        }
      })


return res.status(201).json({success:true,discount_code});
} catch (error) {
    return next(error);
}

}




export const  getDiscountCodes = async (req:any,res:Response,next:NextFunction)=>{

    try {
      
      
    
    
          const discount_code = await prisma.discount_codes.findMany({
           where:{
            sellerId:req.seller.id
           }
          })
    
          return res.status(201).json({success:true,discount_code});
    
    } catch (error) {
       return next(error);
    }
    
    }


    export const deleteDiscountCode= async (req:any,res:Response,next:NextFunction)=>{

       try {
        console.log('____________________deleteDiscountCode_____');
       const {id}=req.params;
       const sellerId = req.seller?.id;
       
       const discountCode = await prisma.discount_codes.findUnique({where:{id},select:{id:true,sellerId:true}});
        console.log(discountCode);
       if(!discountCode){
        return next(new NotFoundError("Discount code not found!"));


       }

          if(discountCode.sellerId!==sellerId){
            return next(new ValidationError("Unauthorized access!"));
          }

          await prisma.discount_codes.delete({where:{id}});

          return res.status(200).json({message:"Discount code successfully deleted"});




       } catch (error) {
        return   next(error);
       }

    }


    export const uploadProductImage= async (req:any,res:Response,next:NextFunction)=>{

          try {
            
            const {fileName} = req.body;

            const response = await imagekit.files.upload({ file: fileName, fileName: `product-${Date.now()}`,folder:'/products' });
              if(response)console.log('Upload image is successfulll')
            return res.status(201).json({file_url:response.url,fileId:response.fileId })


          } catch (error) {
            return    next(error);
          }


    }


    export const deleteProductImage= async (req:any,res:Response,next:NextFunction)=>{

      try {
        
        const {id:fileId} = req.params;

        const response = await imagekit.files.delete(fileId)
        console.log('Delete image is successfulll')
        return res.status(201).json({success:true,response })


      } catch (error) {
        return   next(error);
      }


}

export const createProduct= async (req:any,res:Response,next:NextFunction)=>{

   try {
        console.log('______INSIDECREATEPRODUCT_____',req.seller);
        
      const {
         title,
         short_description,
         detailed_description,
         warranty,
         custom_specifications,
         slug,
         tags,
         cash_on_delivery,
         brand,
         video_url,
         category,
         colors = [],
         sizes = [],
         discountCodes,
         stock,
         sale_price,
         regularPrice:regular_price,
         subcategory:subCategory,
         customProperties = {},
         images = [],
       } = req.body;


       if (!title ||
         !slug ||
         !short_description ||
         !category ||
         !subCategory ||
         !sale_price ||
         !images ||
         !tags ||
         !stock ||
         !regular_price ||
         !stock) {
             console.log(req.body);
            return next(new ValidationError("Missing required field"))
       }
       console.log({
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags?.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes?.map((codeId: string) => codeId),
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
         create: images.filter((image: any) =>image && image?.file_url && image?.fileId ).map((image: any) => ({
            file_id: image?.fileId,
            url: image?.file_url,
          }))
        }
        
      })
       if (!req.seller.id) {
        console.log("___________seller id not available_______________",slug,"____________________________-");
         return next(new AuthError("Only seller can create products!"));
       }
       console.log("___________slug issue_______________",slug,"____________________________-");
       const slugChecking = await prisma.products.findUnique({
         where: {
           slug
         },
       });

  // Check if a product with the given slug already exists
  console.log("____________PREEE SLUG CHECKING ____________________________")
if (slugChecking) {
  console.log("____________slugChecking issue_______________",slugChecking,"____________________________-");
   return next(
     new ValidationError("Slug already exist! Please use a different slug!")
   );
 }
 console.log("____________POST SLUG CHECKING ____________________________")
 console.log(req.body);

 // If the slug is unique, create the new product
 const newProduct = await prisma.products.create({
   data: {
     title,
     short_description,
     detailed_description,
     warranty,
     cashOnDelivery: cash_on_delivery,
     slug,
     shopId: req.seller?.shop?.id!,
     tags: Array.isArray(tags) ? tags : tags.split(","),
     brand,
     video_url,
     category,
     subCategory,
     colors: colors || [],
     discount_codes: discountCodes?.map((codeId: string) => codeId)|| [],
     sizes: sizes || [],
     stock: parseInt(stock),
     sale_price: parseFloat(sale_price),
     regular_price: parseFloat(regular_price),
     custom_properties: customProperties || {},
     custom_specifications: custom_specifications || {},
     images: {
      create: images.filter((image: any) =>image && image?.file_url && image.fileId ).map((image: any) => ({
         file_id: image.fileId,
         url: image.file_url,
       }))
     }
     
   },
   include:{images:true}
 });

console.log(newProduct)
 return res.status(201).json({success:true,newProduct})


   } catch (error) {
      console.log('______INSIDECREATEPRODUCT ERROR_____');
       console.log(error)
       console.log('______INSIDECREATEPRODUCT ERROR_____');
       return   next(error);
      
   }
}

export const getProduct = async (req:any,res:Response,next:NextFunction)=>{

   try {
        const {id}=req.seller;
        // console.log('________________________________-')
      //  console.log(req.seller);
      //  console.log('________________________________-')
        if(!id) return next(new ValidationError("seller id not present"));

        
         const products = await prisma.products.findMany({where:{shopId:req.seller.shop.id!},include:{images:true}})
          if(!products || products.length==0)return next(new ValidationError("products  not found"));
          // console.log(products)
         return res.status(200).json({message:"product successfully fetched",products});



   } catch (error) {
    console.log(error)
    return     next(error);
   }

}


export const deleteProduct = async (
  req: any, // Using 'any' as in the image, but a typed request object is better
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get product and seller IDs from the request
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    // 2. Find the product, selecting only necessary fields
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    // 3. Perform validation checks
    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"));
    }

    // 4. Update the product to mark it as deleted (soft delete)
    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        // Set a future timestamp for permanent deletion or restoration cutoff
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
      },
    });
    
    // 5. Send a success response
    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 hours. You can restore it within that time.",
      deletedAt: deletedProduct.deletedAt,
    });

  } catch (error) {
    // 6. Pass any errors to the error-handling middleware
    return next(error);
  }
};


// restore product
export const restoreProduct = async (
  req: any, // Using 'any' as in the image, but a typed request object is better
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get product and seller IDs from the request
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    // 2. Find the product, selecting only the necessary fields
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    // 3. Perform validation checks
    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }

    // Check if the product is actually deleted before trying to restore it
    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product is not in deleted state" });
    }

    // 4. Update the product to restore it
    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null }, // Set isDeleted to false and clear the deletedAt timestamp
    });

    // 5. Send a success response
    return res.status(200).json({ message: "Product successfully restored!" });

  } catch (error) {
    // 6. Handle any potential errors during the process
    return res.status(500).json({ message: "Error restoring product", error });
  }
};

// get seller stripe information
export const getStripeAccount =async ()=>{}

// get ALl products

export const getAllProduct = async (req:any,res:Response,next:NextFunction)=>{

  try {

       const page = parseInt(req.query.page as string) || 1 ;
       const limit = parseInt(req.query.limit as string) || 20 ;
       const skip =(page-1) * limit;
       const type = req.query.type;
       const baseFilter = {
        // OR:[
        //   {starting_date:null},
        //   {ending_date:null}
        // ]
       }

      //  const baseFilter = {
      //   AND:[
      //     {starting_date:null},
      //     {ending_date:null}
      //   ]
      //  }
   
       const orderBy :Prisma.productsOrderByWithRelationInput= type ==="latest" ?{createdAt:"desc" as Prisma.SortOrder} : {totalSales:"desc" as Prisma.SortOrder}

    const [products,total,top10Products]= await Promise.all([prisma.products.findMany({
      skip,
      take:limit,
      include:{
        images:true,
        Shop:true
      },
      where : baseFilter,
      orderBy:{
        totalSales:'desc'
      }
    }),
    prisma.products.count({where:baseFilter}),
    prisma.products.findMany({
      take:10,
      where:baseFilter,
      orderBy,
    })
  ])
  // console.log("__________________________")
  // console.log(page,limit,type,products,total)
  // console.log("__________________________")
    return res.status(200).json({
      products,
      top10By:type ==="latest" ?"latest":"topSales",
      top10Products,
      total,
      currentPage:page,
      totalPages:Math.ceil(total/limit)
    })



  } catch (error) {
   console.log(error)
   return    next(error);
  }

}


export const getProductDetails = async (req:any,res:Response,next:NextFunction)=>{

  try {
     
       
        const product = await prisma.products.findUnique({where:{slug:req?.params?.slug!},include:{images:true,Shop:{include:{sellers:true}},reviews:{include:{users:{include:{avatar:{select:{url:true}}}}}}}})
         if(!product)return next(new ValidationError("products  not found"));
         
        return res.status(200).json({success:true,product});



  } catch (error) {
   console.log(error)
   return   next(error);
  }

}



export const getFilteredProducts = async (req:any,res:Response,next:NextFunction)=>{

  try {

    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;
         
    const parsedPriceRange = typeof priceRange ==='string'? priceRange.split(',').map(Number): [0,10000];
        

        

        const parsedPage =Number(page);
        const parsedLimit =Number(limit);
        const skip =  (parsedPage-1)*parsedLimit;
        const filters:Record<string,any>= {
          sale_price:{
            gte:parsedPriceRange[0],
            lte:parsedPriceRange[1]
          },
          // starting_date:null    
        }
        if (categories && (categories as string[]).length > 0) {
          filters.category = {
            // Use the 'in' operator to find records where the category is one of the provided values
            in: Array.isArray(categories)
              ? categories
              : String(categories).split(","),
          };
        }
        
        if (colors && (colors as string[]).length > 0) {
          filters.colors = {
            // Use 'hasSome' for array fields to find records containing at least one of the values
            hasSome: Array.isArray(colors) ? colors : [colors],
          };
        }
        
        if (sizes && (sizes as string[]).length > 0) {
          filters.sizes = {
            // 'hasSome' is also used for the 'sizes' array field
            hasSome: Array.isArray(sizes) ? sizes : [sizes],
          };
        }  
        // console.log(filters)
         const [products,total] = await Promise.all([
          prisma.products.findMany({
            where:filters,
            skip,
            take:parsedLimit,
            include:{
              images:true,
              Shop:true
            }
          }),
          prisma.products.count({where:filters}),

         ]);
         if(!products)return next(new ValidationError("products  not found"));
         // console.log(products)
         const totalPages = Math.ceil(total/parsedLimit)
        return res.status(200).json({success:true,products,pagination:{total,page:parsedPage,totalPages}});



  } catch (error) {
   console.log(error)
   return   next(error);
  }

}


export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Destructure and set default values for query parameters
    const {
      priceRange = '[0,10000]', // Default as a string to be parsed
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    // 2. Parse all incoming query parameters into their correct types
    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];
    
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    // 3. Calculate pagination skip value
    const skip = (parsedPage - 1) * parsedLimit;

    // 4. Construct the base filter object for the Prisma query
    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0], // gte: greater than or equal to
        lte: parsedPriceRange[1], // lte: less than or equal to
      },
      // This filter clause finds products that DO have a starting_date (it's NOT null).
      // This is useful for showing only scheduled events or offers.
      NOT: {
        // starting_date: null,
      },
    };

    // 5. Conditionally add more filters to the object if they are provided
    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    // 6. Execute database queries concurrently for efficiency
    const [products, total] = await Promise.all([
      // Query to get the paginated list of products
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true,
        },
      }),
      // Query to get the total count of products matching the filters
      prisma.products.count({ where: filters }),
    ]);

    // 7. Calculate total pages for pagination metadata
    const totalPages = Math.ceil(total / parsedLimit);

    // 8. Send the final response
    return res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });

  } catch (error) {
    // Pass any errors to the global error handler
    return  next(error);
  }
};
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Destructure and set default values for query parameters
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    // 2. Parse pagination parameters into numbers
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    // 3. Initialize an empty filter object
    const filters: Record<string, any> = {};

    // 4. Conditionally add filters to the object if they are provided in the query
    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      // Assuming the 'shops' model has a 'country' field to filter by
      filters.country = {
        in: Array.isArray(countries)
          ? countries
          : String(countries).split(","),
      };
    }
    console.log("___filters________",filters,skip,parsedLimit,"___________")
    // 5. Execute database queries concurrently for efficiency
    const [shops, total] = await Promise.all([
      // Query to get the paginated list of shops
      
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          // followers: true, // Note: This was in the image but is not in your schema
          products: true,
        },
      }),
      // Query to get the total count of shops matching the filters
      prisma.shops.count({ where: filters }),
    ]);
    console.log("___shops total________",shops,total,"___________")
    // 6. Calculate total pages for pagination metadata
    const totalPages = Math.ceil(total / parsedLimit);

    // 7. Send the final response with shops and pagination info
    return res.json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });

  } catch (error) {
    // Pass any errors to the global error handler
    console.log(error);
    return   next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get the search query from the URL parameter 'q'
    const query = req.query.q as string;

    // 2. Validate that the search query is not empty
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // 3. Perform the database query using Prisma
    const products = await prisma.products.findMany({
      where: {
        // Use 'OR' to search in multiple fields
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive", // Makes the search case-insensitive
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      // Use 'select' to only return the data you need, optimizing the response
      select: {
        id: true,
        title: true,
        slug: true,
      },
      // Limit the number of results to 10
      take: 10,
      // Order the results by creation date, showing the newest products first
      orderBy: {
        createdAt: "desc",
      },
    });

    // 4. Send the found products as the response
    return res.status(200).json({ products });

  } catch (error) {
    // Pass any errors to the global error handler
    console.log(error);
    return  next(error);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Parse pagination parameters from the request query, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // 2. Define the base filter to only find products that are "events"
    const baseFilter = {
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
    };

    // 3. Execute all database queries concurrently for maximum efficiency
    const [events, total, top10BySales] = await Promise.all([
      // Query 1: Get the paginated list of events
      prisma.products.findMany({
        skip,
        take: limit,
        where: baseFilter,
        include: {
          images: true,
          Shop: true,
        },
        orderBy: {
          totalSales: "desc",
        },
      }),

      // Query 2: Get the total count of all events matching the filter
      prisma.products.count({ where: baseFilter }),

      // Query 3: Get a separate list of the top 10 events by sales
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        orderBy: {
          totalSales: "desc",
        },
      }),
    ]);

    // 4. Send the successful response with all the fetched data
    return res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    // 5. Handle any errors that occur during the process
   return res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const fetchHeroSectionDetails = async ( req: Request,
  res: Response,
  next: NextFunction
)=>{
// saleprice ,regular price ,product Title,shot_description
  
try {
  
  const products= await prisma.products.findMany({take:5,select:{regular_price:true,images:true,title:true,short_description:true,sale_price:true}});
     
  return res.status(200).json({success:true,products});

} catch (error) {
  console.log(error);
  return next(error)
}


}


export const searchProductsController = async (req: any, res: Response, next: NextFunction) => {
  // Get the search query from the URL, e.g., /api/search-products?q=watch
  const searchQuery = req.query.q as string;
  // console.log('_________________inside searchProducts ')
  // Don't perform a search if the query is empty or too short
  if (!searchQuery || searchQuery.trim().length < 2) {
    return res.json({ products: [] });
  }

  try {
    const products = await prisma.products.findMany({
      // Limit the number of suggestions to avoid sending too much data
      take: 10,
      where: {
        // Use OR to find a match in any of the following fields
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            brand: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            category: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              has: searchQuery.toLowerCase(), // Use 'has' for array fields
            },
          },
        ],
        // Ensure you don't show deleted or inactive products
        isDeleted: { not: true },
        status: 'Active',
      },
      // Select only the data you need for the suggestion dropdown
      select: {
        id: true,
        title: true,
        slug: true,
        sale_price: true,
        images: {
          take: 1, 
          select: {
            url: true,
          },
        },
      },
    });
// console.log(products);
    res.status(200).json({ products });
  } catch (error) {
    console.log(error)
    return  next(error);
  }
};



export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    
    // Step 1: Aggregate total sales per shop from the 'orders' collection.
    // This groups all orders by 'shopId' and calculates the sum of the 'total' field for each shop.
    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: {
        total: true, // The field to sum up
      },
      orderBy: {
        _sum: {
          total: "desc", // Order the groups by the sum in descending order
        },
      },
      take: 10, // Limit the result to the top 10
    });

    // Step 2: Extract the shop IDs from the aggregated data.
    const shopIds = topShopsData.map((item) => item.shopId);
// console.log(shopIds)
    // Step 3: Fetch the full details for only those top 10 shops.
    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds, // Find all shops whose ID is in our list of top shop IDs
        },
      },
      select: { // Select only the necessary fields for the response
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        // followers: true, // Note: This field from the image is not in your schema
        category: true,
      },
    });

    // Step 4: Merge the sales data with the shop details.
    const enrichedShops = shops.map((shop) => {
      // Find the corresponding sales data for the current shop
      const salesData = topShopsData.find((s) => s.shopId === shop.id);
      return {
        ...shop,
        // Add the totalSales to the shop object, defaulting to 0
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    // Step 5: Re-sort the final list to ensure it's in the correct order before sending.
    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales);
      // The .slice(0, 10) from the image is redundant because we already did `take: 10` in the database query.

    // Step 6: Send the final enriched list of top shops.
    return res.status(200).json({ shops: top10Shops });

  } catch (error) {
    console.error("Error fetching top shops:", error);
    return next(error);
  }
};


export const addReviews=async (req:any, res:Response,next:NextFunction) => {
  const { productId } = req.params;
  const userId  = req.user.id; // from auth middleware
  const { rating, comment } = req.body;
  //  console.log(userId)
  // 1. Validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    // 2. Check for Verified Purchase
    // (I'm assuming your 'orders' model has a 'status' and 'items' relation)
    const existingOrder = await prisma.orders.findFirst({
      where: {
        userId: userId,
        status: 'Delivered', // Or 'Completed'
        items: {
          some: { productId: productId }
        }
      }
    });

    const isVerified = !!existingOrder;

    // 3. Create the Review
    const newReview = await prisma.reviews.create({
      data: {
        rating: parseInt(rating, 10),
        comment: comment,
        isVerifiedPurchase: isVerified,
        productId: productId,
        userId: userId,
        createdAt: new Date(Date.now())
      }
    });

    // 4. Update the Product's Average Rating (CRITICAL)
    const stats = await prisma.reviews.aggregate({
      where: { productId: productId },
      _avg: {
        rating: true,
      },
    });

    const avgRating = stats._avg.rating || 0;

    await prisma.products.update({
      where: { id: productId },
      data: {
        ratings: avgRating
      }
    });
    
    // Pro-Tip: For your stack, you could push this aggregation
    // task (Step 4) to a Kafka topic and have a separate
    // service handle it to make your API faster.

   return  res.status(201).json(newReview);

  } catch (error:any) {
  return next(new ValidationError(error)) ;
  }
}

export const getReviews =  async (req:any, res:Response,next:NextFunction) => {
  const { productId } = req.params;
  // Add pagination (take=limit, skip=offset)
  const { skip = 0, take = 10 } = req.query; 

  try {
    const reviews = await prisma.reviews.findMany({
      where: { productId: productId },
      include: {
        users: {
          select: {
            name: true
            // Add 'avatar' here if you have it in your 'users' model
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(take, 10),
      skip: parseInt(skip, 10),
    });

    const totalReviews = await prisma.reviews.count({
      where: { productId: productId }
    });

    res.status(200).json({ reviews: reviews, total: totalReviews });

  } catch (error:any) {
    next(new ValidationError(error)) ;
  }
}


export const deleteReview =  async (req:any, res:Response,next:NextFunction) => {
  const { reviewId } = req.params;
  // Add pagination (take=limit, skip=offset)
  

  try {
    const reviews = await prisma.reviews.delete({
      where: { id: reviewId },
     
    });

   

   return res.status(200).json({ success:true,message:"Review deleted successfully"});

  } catch (error:any) {
    console.log(error)
    return  next(error) ;
  }
}

// ---------need to work on this dashboard controller------------
const getStartDate = (range: string = '30d'): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0); // Start of the day
  if (range === '90d') {
    date.setDate(date.getDate() - 90);
  } else if (range === '7d') {
    date.setDate(date.getDate() - 7);
  } else {
    // Default to 30 days
    date.setDate(date.getDate() - 30);
  }
  return date;
};



export const dashboardDetails = async(req: any, res: Response, next: NextFunction) => 
{
  try {
    // --- FOR TESTING --- 
    // Replace with your actual shopId from auth middleware (e.g., req.seller.shopId)
    const shopId = req?.seller?.shop?.id; 
    // ---------------------
    
    if (!shopId) {
       // Using return next(...) to pass the error to Express error handler
       return next(new ValidationError('Shop ID not found', { status: 401 })); // 401 Unauthorized likely better
    }

    // 2. Get date range (Use req.query for Express)
    const range = (req.query.range as string) || '30d'; // Get range from query string
    const startDate = getStartDate(range);
    const endDate = new Date(); // End of today

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // 3. Use Prisma.$transaction
    const [stats, recentOrders, lowStockProducts, recentReviews, orderStatusGroup, revenueData, shopDetails, visitorCount] = await prisma.$transaction([
      // Query 1: Get Key Statistics
      prisma.orders.aggregate({
        where: { 
          shopId, 
          // Only count revenue from completed/paid orders
          status: { in: ['Paid', 'Shipped', 'OutForDelivery', 'Delivered'] }, 
          ...dateFilter
        },
        _sum: { total: true },
        _count: { _all: true }, // Count orders matching the 'where' clause
      }),

      // Query 2: Get Recent Orders (5)
      prisma.orders.findMany({
        where: { shopId },
        include: {
          users: { select: { name: true } }, // Include user's name
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Query 3: Get Low Stock Products (5)
      prisma.products.findMany({
        where: { 
          shopId, 
          stock: { lt: 10 }, 
          isDeleted: false,
          status: 'Active' // Usually only show active low stock products
        },
        select: { // Select only needed fields
            id: true,
            title: true,
            stock: true,
            images: { take: 1, select: { url: true } }, 
        },
        orderBy: { stock: 'asc' },
        take: 5,
      }),

    //  // Query 4: Get Recent Reviews (3) - Corrected relation via product
    //  // Query 4: Get Recent Reviews (3) - CORRECTED relation name
prisma.reviews.findMany({ 
  where: { 
    // FIX: Use the correct relation field name 'products'
    products: { shopId: shopId }, 
    createdAt: { 
        gte: startDate,
        lte: endDate,
    }
  }, 
  include: {
    users: { select: { name: true, avatar: { select: { url: true } } } }, 
    products: { select: { title: true } } // Also use 'products' here if including
  },
  orderBy: { createdAt: 'desc' },
  take: 3,
}),
      
      // Query 5: Get Order Status Distribution (FIXED where clause)
      prisma.orders.groupBy({
        by: ["deliveryStatus"], 
        where: { 
            shopId, // Added shopId filter
            ...dateFilter // Added date filter
         }, 
        _count: { 
            _all: true 
        },
        orderBy: { 
          deliveryStatus: 'asc' 
        } 
      }),

      // Query 6: Get Revenue Over Time (Unchanged conceptually)
      prisma.orders.findMany({
        where: {
          shopId,
          status: { in: ['Paid', 'Shipped', 'OutForDelivery', 'Delivered'] },
          ...dateFilter
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: {
          createdAt: 'asc',
        }
      }),

      // Query 7: Get Shop Rating directly
      prisma.shops.findUnique({
          where: { id: shopId },
          select: { ratings: true } // Fetch only the average rating
      }),

      // Query 8: Get Total Visitors
      prisma.uniqueShopVisitors.count({
          where: { shopId, visitedAt: { gte: startDate, lte: endDate } }
      })

    ]);

   

    // Process Stats
    const dashboardStats = {
      totalRevenue: stats?._sum?.total || 0,
      totalOrders: stats?._count?._all || 0, // Safely access count
      totalVisitors: visitorCount || 0, // Use result from transaction
      averageRating: shopDetails?.ratings || 0, // Use result from transaction
    };
    console.log('_________________________________________________')
console.log(shopDetails)
console.log('_________________________________________________')
    // Process Order Status (FIXED safe access)
   // Process Order Status (FIXED safe access)
const orderStatus = orderStatusGroup.map(group => ({
  name: group.deliveryStatus,
  // FIX: Use optional chaining and nullish coalescing
  // @ts-ignore
  value: group._count?._all ?? 0, 
}));
    // Process Revenue Over Time (Group by day in JS)
    const dailyRevenue = new Map<string, number>();
     revenueData?.forEach(order => {
      // Ensure createdAt is a Date object if it's not already
      const orderDate = new Date(order.createdAt); 
      const date = orderDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      // Ensure total is a number
      const totalValue = typeof order.total === 'number' ? order.total : 0;
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + totalValue);
    });
    
    const revenueOverTime = Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
      name: date, // Keep as date string for charts
      revenue: parseFloat(revenue.toFixed(2)), // Ensure 2 decimal places
    }));

    // 5. Return all data in one object
    return res.status(200).json({ // Explicitly set status 200
      success: true, // Add a success flag
      data: { // Wrap data in a 'data' object
        stats: dashboardStats,
        recentOrders,
        lowStockProducts,
        recentReviews,
        orderStatus,
        revenueOverTime,
      }
    });

  } catch (error) {
    console.error('[DASHBOARD_GET_ERROR]', error); // Log error clearly
    // Pass error to Express error handler
    return next (error); 
  }
}

// ---------need to work on this dashboard controller------------

export const getShopDetails = async (req:any, res:Response,next:NextFunction)=>{

 try {
   
   const {shopId}= req.params;

   if(!shopId){
    return next(new ValidationError('Invalid shopId'));
   }

   const shop= await prisma.shops.findUnique({where:{id:shopId},include:{avatar:true,reviews:{include:{user:{include:{avatar:true}}}},products:{include:{images:true}}}})

   return res.status(200).json({success:true,shop});

 } catch (error) {
  
  console.log(error);
  return  next(error);
 }


}


export const createShopReview = async (req:any, res:Response,next:NextFunction)=>{

  try {
    
    let reviewData= req.body;
         reviewData={...reviewData,rating:Number.parseFloat(reviewData.rating)}
   
    const data = await prisma.shopReviews.create({data:reviewData})
    const aggregatedRatings = await prisma.shopReviews.aggregate({
      where: {
        shopId: data.shopId,
      },
      _avg: {
        rating: true, // Get the average
      },
    });

    

    const newAverage = aggregatedRatings._avg.rating || 0;
    await prisma.shops.update({
      where: {
        id: data.shopId!,
      },
      data: {
        ratings: newAverage,
      },
    });
    return res.status(201).json({success:true,message:'review created successfully',data});
 
  } catch (error) {
   
   console.log(error);
   return  next(error);
  }
 
 
 }

 export const addUniqueShopVisitors = async (req:any, res:Response,next:NextFunction)=>{

  try {
    
    const {userId,shopId}= req.body;
     if(!userId || !shopId){
      return next(new ValidationError('userId and shopId is required'));
     }     
    await prisma.uniqueShopVisitors.upsert({
      where: {
        shopId_userId: {
          shopId: shopId,
          userId: userId,
        },
      },
      create:{
        shopId,
        userId,
        visitCount:1
      },
      update:{
        visitCount:{increment:1}
      }
    })
    return res.status(201).json({success:true,message:'Visit Count updated'});
 
  } catch (error) {
   
   console.log(error);
   return  next(error);
  }
 
 
 }
 
 
 
 
 
 
 




