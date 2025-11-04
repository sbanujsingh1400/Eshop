import express,{ Router } from "express";
import { addReviews, createDiscountCode, createProduct, createShopReview, dashboardDetails, deleteDiscountCode, deleteProduct, deleteProductImage, deleteReview, fetchHeroSectionDetails, getAllEvents, getAllProduct, getCategories, getDiscountCodes, getFilteredEvents, getFilteredProducts, getFilteredShops, getProduct, getProductDetails, getReviews, getShopDetails, getStripeAccount, restoreProduct, searchProducts, searchProductsController, topShops, uploadProductImage } from "../controllers/product.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";

const router :Router = express.Router()

router.get('/get-categories',getCategories);
router.post('/create-discount-code',isAuthenticated,createDiscountCode);
router.get('/get-discount-code',isAuthenticated,getDiscountCodes);
router.delete('/delete-discount-code/:id',isAuthenticated,deleteDiscountCode);
router.post('/upload-product-image',isAuthenticated,uploadProductImage);
router.delete('/delete-product-image/:id',isAuthenticated,deleteProductImage);
router.post('/create-product',isAuthenticated,createProduct);
router.get('/get-shop-product',isAuthenticated,getProduct);
router.delete("/delete-product/:productId",isAuthenticated,deleteProduct)
router.put("/restore-product/:productId",isAuthenticated,restoreProduct)
router.get('/get-stripe-account',isAuthenticated,isSeller,getStripeAccount);
router.get('/get-all-products',getAllProduct);
router.get('/get-all-events',getAllEvents);
router.get('/get-product/:slug',getProductDetails);
router.get("/get-filtered-products", getFilteredProducts);
router.get("/get-filtered-offers", getFilteredEvents);
router.get("/get-filtered-shops", getFilteredShops);
router.get("/search-products", searchProducts);
router.get("/get-hero-details", fetchHeroSectionDetails);
router.get("/top-shops", topShops);
router.get('/search-products-bar', searchProductsController);
router.post('/reviews/:productId',isAuthenticated,addReviews );
router.delete('/reviews/:reviewId',isAuthenticated,deleteReview );
router.get("/api/dashboard",isAuthenticated, dashboardDetails);
router.get('/reviews/:productId',isAuthenticated,getReviews);
router.get('/get-shop/:shopId',getShopDetails);
router.post('/shops/:shopId/reviews',createShopReview);


export default router