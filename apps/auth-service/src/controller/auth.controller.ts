import { NextFunction, Request, Response } from "express";
import axios from 'axios'
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validationRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/libs/errorMiddleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { deleteCookie, setCookie } from "../utils/cookies/setCookies";
import Stripe from "stripe";
import imagekit from "../../../../packages/libs/imageKit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// register user and send otp
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("___USER REGIS CHECK_______");
    validationRegistrationData(req.body, "user");
    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exists with this email"));
    }

    await checkOtpRestrictions(email, next);

    await trackOtpRequests(email, next);
    // console.log("_____________controller____________")
    // console.log(email,name);
    // console.log("___________controller______________")
    await sendOtp(email, name, "user-activation-mail");
    return res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

// verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All Fields are required"));
    }
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }
    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.log(
      "_____________________error in controller  in verifyuser _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in verifyuser _____________________"
    );
    return next(error);
  }
};
// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ValidationError("email and password is required for login")
      );
    }

    const user = await prisma.users.findUnique({ where: { email },include:{avatar:true} });
    if (!user) {
      return next(new NotFoundError(`User with the email ${email} not found`));
    }

    const bool = await bcrypt.compare(password, user.password!);
    // console.log("____________bool in loginuser___________");
    // console.log(bool);
    // console.log("____________bool in loginuser___________");
    if (!bool) {
      return next(new ValidationError("Invalid password!"));
    }

    const secret = process.env.JWT_SECRET;
    const accessToken = jwt.sign({ id: user.id, role: "user" }, secret!, {
      expiresIn: "3600m",
    });
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      refreshSecret!,
      { expiresIn: "3600m" }
    );

    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);
    console.log("____________bool in loginuser___________");
    console.log(user);
    console.log("____________bool in loginuser___________");
    return res.status(200).json({
      message: "User logged in successfully",
      user: { id: user.id, email: user.email, name: user.name,avatar:user?.avatar },
    });
  } catch (error) {
    console.log(
      "_____________________error in controller  in loginUser _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in loginUser _____________________"
    );
    return next(error);
  }
};

// refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {

    let refreshToken;
    // const hostname = req.hostname;
    const referer = req.headers.referer;
    // 1. Check hostname to find the correct cookie
    if (referer.includes("eshop.user")) {
      refreshToken = req.cookies["access_token"];
    } else if (referer.includes("eshop.seller")) {
      refreshToken = req.cookies["seller-access_token"];
    }
    

    // const refreshToken = req.cookies["refresh_token"]||req.cookies["seller-refresh_token"] || req.headers.authorization?.split(" ")[1];
    if (!refreshToken)
      return next(new ValidationError("Unauthorized! no refresh token"));

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role)
      return next(new ValidationError("Invalid refresh token"));

      
if(decoded.role=='user'){
  const user = await prisma.users.findUnique({ where: { id: decoded.id } });

  if (!user) return next(new AuthError("Unauthorized! no user/seller found"));

}else {
  const seller = await prisma.sellers.findUnique({ where: { id: decoded.id } });

  if (!seller) return next(new AuthError("Unauthorized! no user/seller found"));

}
   
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
  if(decoded.role==='user')  setCookie(res, "access_token", newAccessToken);
  else setCookie(res, "seller-access_token", newAccessToken);
    return res.status(201).json({ success: true });
  } catch (error) {}
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('inside logged in user',req.user)
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(
      "_____________________error in controller  in getUser _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in getUser _____________________"
    );
    return next(error);
  }
};

//  user forgot password
export const userForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await handleForgotPassword(req, res, next, "user");
  } catch (error) {
    console.log(
      "_____________________error in controller  in userFOrgetPassword _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in userFOrgetPassword _____________________"
    );
    return next(error);
  }
};
//verify forgot password
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyForgotPasswordOtp(req, res, next);
  } catch (error) {
    console.log(
      "_____________________error in controller  in verifyUserForgotPassword _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in verifyUserForgotPassword _____________________"
    );
    return next(error);
  }
};

// reset password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //    console.log(req.body);
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("email and newPassword is required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) return next(new NotFoundError("User not found"));

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword)
      return next(
        new ValidationError(" newPassword cannot be same as the old password!")
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(
      "_____________________error in controller  in resetUserPassword _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in resetUserPassword _____________________"
    );
    return next(error);
  }
};

// register a new seller

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    validationRegistrationData(req.body, "seller");
    const { name, email } = req.body;
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(new ValidationError("Seller already exists with this email"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(email,name , "seller-activation");

    return res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    console.log(
      "_____________________error in controller  in registerSeller _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in registerSeller _____________________"
    );
    return next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("All fields are required"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!")
      );
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    return res
      .status(201)
      .json({ seller, message: "Seller registered successfully!" });
  } catch (error) {
    console.log(
      "_____________________error in controller  in registerSeller _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in registerSeller _____________________"
    );
    return next(error);
  }
};

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
console.log( name, bio, address, opening_hours, website, category, sellerId);
    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      
      !category ||
      !sellerId
    ) {
      return next(new ValidationError("All fields are required"));
    }

    const existingShop = await prisma.shops.findUnique({ where: { sellerId } });
    if (existingShop) {
      return next(
        new ValidationError("Shop already exists with this sellerId!")
      );
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };
    if (website && website.trim() !== "") {
      shopData.website = website;
    }
    const shop = await prisma.shops.create({ data: shopData });

    return res
      .status(201)
      .json({ shop, success: true, message: "Shop created successfully!" });
  } catch (error) {
    console.log(
      "_____________________error in controller  in createShop _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in createShop _____________________"
    );
    return next(error);
  }
};

// create stripe connect account link

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("sellerId is required!"));
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      return next(
        new ValidationError("no seller found with sellerId !" + sellerId)
      );
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SELLER_URI}/`,
      return_url: `${process.env.NEXT_PUBLIC_SELLER_URI}/`,
      type: "account_onboarding",
    });

   return res.status(200).json({url:accountLink.url})

  } catch (error) {
    console.log(
      "_____________________error in controller  in createStripeConnectLink _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in createStripeConnectLink _____________________"
    );
    return next(error);
  }
};

// login seller 

export const loginSeller =async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {
        
        const {email,password}= req.body;

           if(!email || !password){
            return next(
                new ValidationError("email and password is required!")
              );
           }

           const seller = await prisma.sellers.findUnique({where:{email}});

           if(!seller)            return next(
            new ValidationError("seller not found!")
          );

          const isMatch = await bcrypt.compare(password,seller.password);
          if(!isMatch)  return next(
            new ValidationError("invalid password or email!")
          );

          const accessToken = jwt.sign({id:seller.id,role:"seller"},process.env.ACCESS_TOKEN_SECRET as string,{expiresIn:'150m'})
          const refreshToken = jwt.sign({id:seller.id,role:"seller"},process.env.REFRESH_TOKEN_SECRET as string,{expiresIn:'350m'})

          setCookie(res,'seller-refresh_token',refreshToken);
          setCookie(res,'seller-access_token',accessToken);


          return res.status(200).json({message:"Login successfull!",seller:{id:seller.id,email:seller.email,name:seller.name}});




    } catch (error) {
       
        console.log(
            "_____________________error in controller  in loginSeller _____________________"
          );
          console.log(error);
          console.log(
            "_____________________error in controller  in loginSeller _____________________"
          );
          return next(error);
    }

  }


  // get logged in seller
export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
      // console.log('inside logged in user')
      const seller = req.seller;
      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      console.log(
        "_____________________error in controller  in getUser _____________________"
      );
      console.log(error);
      console.log(
        "_____________________error in controller  in getUser _____________________"
      );
      return next(error);
    }
  };

  export const addUserAddress = async (
    req: any, // Using 'any' as in the image, a typed request is recommended
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. Get the authenticated user's ID
      const userId = req.user?.id;
  
      // 2. Destructure the address details from the request body
      const { label, name, street, city, zip, country, isDefault } = req.body;
  
      // 3. Validate that all required fields are present
      if (!label || !name || !street || !city || !zip || !country) {
        return next(new ValidationError("All fields are required"));
      }
  
      // 4. If the new address is marked as default, first unset any existing default address.
      if (isDefault) {
        await prisma.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }
  
      // 5. Create the new address in the database
      const newAddress = await prisma.address.create({
        data: {
          userId,
          label,
          name,
          street,
          city,
          zip,
          country,
          isDefault,
        },
      });
  
      // 6. Send a successful response
      return res.status(201).json({
        success: true,
        address: newAddress,
      });
  
    } catch (error) {
      // 7. Pass any errors to the global error handler
      return next(error);
    }
  };


  export const deleteUserAddress = async (
    req: any, // Using 'any' as in the image, a typed request is recommended
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. Get the authenticated user's ID and the address ID from the request
      const userId = req.user?.id;
      const { addressId } = req.params;
  
      // 2. Validate that the address ID was provided
      if (!addressId) {
        return next(new ValidationError("Address ID is required"));
      }
  
      // 3. Find the address ONLY if it matches both the addressId and the userId
      const existingAddress = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: userId, // This ensures a user can only delete their own address
        },
      });
  
      // 4. If no matching address is found, return an error
      if (!existingAddress) {
        return next(new NotFoundError("Address not found or unauthorized"));
      }
  
      // 5. If the address was found, delete it
      await prisma.address.delete({
        where: {
          id: addressId,
        },
      });
  
      // 6. Send a success response
      return res.status(200).json({
        success: true,
        message: "Address deleted successfully",
      });
  
    } catch (error) {
      // 7. Pass any errors to the global error handler
      return next(error);
    }
  };



  export const getUserAddresses = async (req: any,res: Response,next: NextFunction) => {
    try {
      // 1. Get the authenticated user's ID
      const userId = req.user?.id;
  
      // 2. Fetch all addresses that belong to this user
      const addresses = await prisma.address.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc", // Order by creation date, newest first
        },
      });
  
      // 3. Send a successful response with the list of addresses
      return res.status(200).json({
        success: true,
        addresses,
      });
  
    } catch (error) {
      // 4. Pass any errors to the global error handler
     return  next(error);
    }
  };

  export const updateUserPassword = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;
  
      // 1. Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return next(new ValidationError("all fields are required"));
      }
  
      if (newPassword !== confirmPassword) {
        return next(new ValidationError("new passwords do not match"));
      }
  
      if (currentPassword === newPassword) {
        return next(
          new ValidationError("New password cannot be the same as the current password")
        );
      }
  
      // 2. Find the user
      const user = await prisma.users.findUnique({
        where: { id: userId },
      });
  
      if (!user || !user.password) {
        return next(new AuthError("user not found or password not set"));
      }
  
      // 3. Verify the current password
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
  
      if (!isPasswordCorrect) {
        return next(new AuthError("current password is incorrect"));
      }
  
      // 4. Hash the new password and update the user
      const hashedPassword = await bcrypt.hash(newPassword, 12);
  
      await prisma.users.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
  
      // 5. Send success response
      res.status(200).json({ message: "password updated successfully" });
    } catch (error) {
      next(error);
    }
  };



export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  

  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    // 2. Find the user
    const user:any = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("User doesn't exist!"));
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    // 4. Check if the user is an admin
    const isAdmin = user?.role === "admin";
    if (!isAdmin) {
    //   sendLog({
    //     type: "error",
    //     message: `Admin login failed for ${email} - not an admin`,
    //     source: "auth-service",
    //   });
    //   return next(new AuthError("Invalid access!"));
    // 
  }

    // // 5. Log successful admin login attempt
    // sendLog({
    //   type: "success",
    //   message: `Admin login successful: ${email}`,
    //   source: "auth-service",
    // });

    // 6. Clear any existing seller cookies to prevent conflicts
    res.clearCookie("seller-access_token");
    res.clearCookie("seller-refresh_token");

    // 7. Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // 8. Store the tokens in secure, httpOnly cookies
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    // 9. Send success response with user data
    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }

}

export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    // console.log('inside logged in user')
    // console.log("Aaaaaaaaaaaaaddddddddmmmmmmmmiiiiiiiinnnnnnn",req.admin)
    const admin = req.admin;
    res.status(201).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.log(
      "_____________________error in controller  in getUser _____________________"
    );
    console.log(error);
    console.log(
      "_____________________error in controller  in getUser _____________________"
    );
    return next(error);
  }
};

export const logoutUser = async (req: any, res: Response, next: NextFunction) => {

try {

  deleteCookie(res,"access_token");
  deleteCookie(res,"refresh_token");
  return res.status(200).json({
    success:true,
    message:"Logged out user successfully"
  })
  console.log()
} catch (error) {
  console.log(error)
    return next(error)
}


}

export const logoutSeller = async (req: any, res: Response, next: NextFunction) => {

  try {
  
    deleteCookie(res,"seller-access_token");
    deleteCookie(res,"seller-refresh_token");
    return res.status(200).json({
      success:true,
      message:"Logged out seller successfully"
    })
    
  } catch (error) {
    console.log(error)
      return next(error)
  }
  
  
  }

  export const googleAuth = async (req:any, res:any, next:NextFunction)=>{
     
  const {type,role}=req.query;
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const encodedState = Buffer.from(JSON.stringify({type,role})).toString('base64');
    const options:any = {
      redirect_uri: `${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL}/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      state:encodedState
    };
  
    const qs = new URLSearchParams(options);
   
    const googleAuthUrl = `${rootUrl}?${qs.toString()}`;
    
    // Redirect the user to the Google consent screen

    res.redirect(googleAuthUrl);
  }

  export const googleCallback=async (req:any, res:any) => {
    // Get the authorization code from the query parameters
    const code = req.query.code;
    const state =  req.query.state
    console.log(state);
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    const { type, role } = decodedState;
    // console.log(decodedState)
   
    try {
      // 1. Exchange the authorization code for an access token and ID token
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const tokenValues:any = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL}/google/callback`,
        grant_type: 'authorization_code',
      };
      
      const tokenResponse = await axios.post(tokenUrl, new URLSearchParams(tokenValues).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      
      const googleUser:any = jwt.decode(tokenResponse.data.id_token);

      
  
      
      let user = await prisma.users.findUnique({
        where: { email: googleUser.email },
      });
      if(user && role=='user' &&type=='signup'){

        return   res.status(500).redirect(`${process.env.NEXT_PUBLIC_USER_URI}/signup`);
         }
    
      
      if (!user) {

        user = await prisma.users.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            avatar:{
              create:[{
                url:googleUser?.picture,
                file_id:`google_${googleUser.sub}`,
                
              }]
            },
            googleId: googleUser.sub, // 'sub' is the unique Google user ID
          },
        });
      }
  
      // 4. Create your own JWT to manage the session
      const appJwt = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET!, {
        expiresIn: '1d',
      });
     
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      refreshSecret!,
      { expiresIn: "3600m" }
    );

    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", appJwt);
  
      // 5. Set the JWT in an HTTP-only cookie
      // setCookie(res,'token', appJwt, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   maxAge: 24 * 60 * 60 * 1000, // 1 day
      // });
      
      // console.log('___________________________google user created successfully________________');
      // 6. Redirect the user to your frontend application
    
      
      return   res.redirect(`${process.env.NEXT_PUBLIC_USER_URI}`);
      
  
    } catch (error) {
      console.error('Failed to authenticate with Google', error);
      res.redirect(`${process.env.NEXT_PUBLIC_USER_URI}/login?error=true`);
    }
  }

  export const updateUserProfilePic = async (req: any, res: Response, next: NextFunction) => {

    try {
       
      const {file}= req.body;
      const userId=req.user.id;
      if(!file || !userId){
        return next(new ValidationError('No File is provided'));
      }

      
         
     const existingImage = await prisma.images.findFirst({
      where:{
        userId:userId
      }
     })
    //  const 
     let image ;
     if(existingImage){
     
      // await imagekit.delete(existingImage?.file_id)
      image =await imagekit.files.upload({ file, fileName: `user-${userId}-${Date.now()}`,folder:'/userProfilePic' });
  
      const updateImage = await prisma.images.update({
        where:{id:existingImage.id},
        data:{
          file_id:image.fileId,
          url:image.url,
          imageType:'updateTest12'

        }
      })
      
      res.status(200).json({success:true,image:updateImage.url});
     }else {
         

      image =await imagekit.files.upload({ file, fileName: `user-${userId}-${Date.now()}`,folder:'/userProfilePic' });
      const updatedUser = await prisma.users.update({
        where:{id:userId},
        data:{
          avatar:{
            create:[
              {
               file_id:image.fileId!,
               url:image.url!,
               imageType:'profilePic'
            }
          ]
          }
        },
        include:{
          avatar:true
        }
      })

      res.status(200).json({success:true,image:updatedUser.avatar[0].url})
     }
       
    
    } catch (error) {
       console.log(error);
       return next(error)

    }

  }


  export const updateUserDetails = async (req: any, res: Response, next: NextFunction) => {

        try {
          const id=req.user.id;
          const {name,dob,phone,country}= req.body;
          if(!name && !dob && !phone && !country){
            return next(new ValidationError('No new data is available for Updation'));
          }
       let query:any={};
       if(name){
        query.name=name;
       }
       if(dob){
        query.dob=new Date(dob);
       }
       if(phone){
        query.phone=phone;
       }
       if(country){
        query.country=country;
       }
          await prisma.users.update({
            where:{id},
            data:query
          })
console.log("Update complete")
return res.status(201).json({success:true,message:"User Profile Updated successfullyd"})
        } catch (error) {
          console.log(error)
          next(error)
        }


  }



  export const updateShopCover = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {

    try {
       
      const {file}= req.body;
      const shopId=req.params.shopId;
      if(!file || !shopId){
        return next(new ValidationError('No File is provided'));
      }

      
         
     
     
     

    let  image =await imagekit.files.upload({ file, fileName: `shop-${shopId}-${Date.now()}`,folder:'/shopCoverBanner' });
      const updatedShop = await prisma.shops.update({
        where:{id:shopId},
        data:{          
          coverBanner:image.url!
        },
        include:{
          avatar:true
        }
      })

    return  res.status(200).json({success:true,image:updatedShop.coverBanner})
     
       
    
    } catch (error) {
       console.log(error);
       return next(error)

    }


  }



  export const updateSellerProfilePic = async (req: any, res: Response, next: NextFunction) => {

    try {
       
      const {file}= req.body;
      const sellerId=req.seller.id;
      if(!file || !sellerId){
        return next(new ValidationError('No File is provided'));
      }

      
         
     const existingImage = await prisma.images.findFirst({
      where:{
        sellerId:sellerId
      }
     })
    //  const 
     let image ;
     if(existingImage){
     
      // await imagekit.delete(existingImage?.file_id)
      image =await imagekit.files.upload({ file, fileName: `seller-${sellerId}-${Date.now()}`,folder:'/sellerProfilePic' });
  
      const updateImage = await prisma.images.update({
        where:{id:existingImage.id},
        data:{
          file_id:image.fileId,
          url:image.url,
          imageType:'sellerProfilePic'

        }
      })
      
    return  res.status(200).json({success:true,image:updateImage.url});
     }else {
         

      image =await imagekit.files.upload({ file, fileName: `seller-${sellerId}-${Date.now()}`,folder:'/sellerProfilePic' });
      const updatedUser = await prisma.sellers.update({
        where:{id:sellerId},
        data:{
          avatar:{
            create:[
              {
               file_id:image.fileId!,
               url:image.url!,
               imageType:'sellerProfilePic'
            }
          ]
          }
        },
        include:{
          avatar:true
        }
      })

    return   res.status(200).json({success:true,image:updatedUser.avatar[0].url})
     }
       
    
    } catch (error) {
       console.log(error);
       return next(error)

    }

  }



  export const updateSellerDetails = async (req: any, res: Response, next: NextFunction) => {

    try {
      const id=req.seller.id;
      const {name,phone_number,country}= req.body;
      if(!name &&  !phone_number && !country){
        return next(new ValidationError('No new data is available for Updation'));
      }
   let query:any={};
   if(name){
    query.name=name;
   }
  
   if(phone_number){
    query.phone_number=phone_number;
   }
   if(country){
    query.country=country;
   }
      await prisma.sellers.update({
        where:{id},
        data:query
      })
console.log("Update complete")
return res.status(201).json({success:true,message:"User Profile Updated successfullyd"})
    } catch (error) {
      console.log(error)
      next(error)
    }


}



export const updateShopDetails = async (req: any, res: Response, next: NextFunction) => {

  try {
    const id=req.seller.shop.id;
    const {name,bio,category,address,opening_hours,website}= req.body;
    if(!name &&  !bio && !address && !opening_hours && !website){
      return next(new ValidationError('No new data is available for Updation'));
    }
 let query:any={};
 if(name){
  query.name=name;
 }

 if(bio){
  query.bio=bio;
 }
 if(category){
  query.category=category;
 }
 if(address){
  query.address=address;
 }
 if(opening_hours){
  query.opening_hours=opening_hours;
 }
 if(website){
  query.website=website;
 }

    await prisma.shops.update({
      where:{id},
      data:query
    })
console.log("Update complete")
return res.status(201).json({success:true,message:"User Profile Updated successfullyd"})
  } catch (error) {
    console.log(error)
    next(error)
  }


}