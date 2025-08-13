import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { selectProducts, selectCurrency } from '../store/slices/shopSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Product as ProductType } from '../types';

const Product: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const products = useSelector(selectProducts);
    const currency = useSelector(selectCurrency);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [productData, setProductData] = useState<ProductType | null>(null);
    const [image, setImage] = useState<string>("");
    const [size, setSize] = useState<string>("");

    const fetchProductData = (): void => {
        products.forEach((item) => {
            if (item._id === productId) {
                setProductData(item);
                setImage(item.image[0]);
            }
        });
    };

    const handleAddToCart = (): void => {
        if (!isAuthenticated) {
            // Redirect to login page if not authenticated
            navigate('/login', { state: { from: { pathname: `/product/${productId}` } } });
            return;
        }

        if (!size) {
            // Size validation is handled in the cartSlice
            return;
        }

        if (productData) {
            dispatch(addToCart({ itemId: productData._id, size }));
        }
    };

    useEffect(() => {
        fetchProductData();
        setSize("");
        window.scrollTo(0, 0); // scroll to top when productId changes
    }, [productId, products]);

    return productData ? (
        <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
            {/* Product Data */}
            <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
                {/* Product Image */}
                <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
                    <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
                        {productData.image.map((item, index) => {
                            return (
                                <img
                                    onClick={() => setImage(item)}
                                    src={item}
                                    key={index}
                                    className="w-[24%] sm:w-full sm:mb-3 cursor-pointer"
                                    alt=""
                                />
                            );
                        })}
                    </div>
                    <div className="w-full sm:w-[80%]">
                        <img src={image} className="w-full h-auto" alt="" />
                    </div>
                </div>

                {/* Product Information */}
                <div className="flex-1">
                    <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
                    <div className="flex items-center gap-1 mt-2">
                        <img src={assets.star_icon} alt="" className="w-3" />
                        <img src={assets.star_icon} alt="" className="w-3" />
                        <img src={assets.star_icon} alt="" className="w-3" />
                        <img src={assets.star_icon} alt="" className="w-3" />
                        <img src={assets.star_dull_icon} alt="" className="w-3" />
                        <p className="pl-2">(90)</p>
                    </div>
                    <p className="text-3xl mt-5 font-medium">
                        {currency}
                        {productData.price}
                    </p>
                    <p className="mt-5 text-gray-500 md:w-4/5">
                        {productData.description}
                    </p>
                    <div className="flex flex-col gap-4 my-8">
                        <p>Select Size</p>
                        <div className="flex gap-2">
                            {productData.sizes.map((item, index) => (
                                <button
                                    onClick={() => setSize(prev => (prev === item ? "" : item))}
                                    className={`border py-2 px-4 bg-gray-100 ${
                                        item === size ? "border-orange-500" : ""
                                    }`}
                                    key={index}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleAddToCart} 
                        className={`px-8 py-3 text-sm text-white transition-colors ${
                            isAuthenticated 
                                ? 'bg-black hover:bg-gray-700 active:bg-gray-800' 
                                : 'bg-cus rounded-sm'
                        }`}
                    >
                        {isAuthenticated ? 'ADD TO CART' : 'SING IN TO BUY'}
                    </button>
                    
                    <hr className="mt-8 sm:w-4/5" />
                    <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
                        <p>100% Original product.</p>
                        <p>Cash on delivery is available on this product.</p>
                        <p>Easy return and exchange policy within 7 days.</p>
                    </div>
                </div>
            </div>

            {/* DESC & REVIEW PRODUCT */}
            <div className="mt-20">
                <div className="flex">
                    <b className="border px-5 py-3 text-sm">Description</b>
                    <p className="border px-5 py-3 text-sm">Reviews (122)</p>
                </div>
                <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-600">
                    <p>
                        An e-commerce website is an online platform that facilitates the
                        buying and selling of products or services over the internet. It
                        serves as a virtual marketplace where businesses and individuals can
                        showcase their products, interact with customers, and conduct
                        transactions without the need for a physical presence. E-commerce
                        websites have gained immense popularity due to their convenience,
                        accessibility, and the global reach they offer.
                    </p>
                    <p>
                        E-commerce websites typically display products or services along
                        with detailed descriptions, images, prices, and any available
                        variations (e.g., sizes, colors). Each product usually has its own
                        dedicated page with relevant information.
                    </p>
                </div>
            </div>

            {/* Related Products */}
            <RelatedProducts 
                category={productData.category} 
                subCategory={productData.subCategory}
            />
        </div>
    ) : (
        <div className="opacity-0">
            <h1>Không tìm thấy sản phẩm</h1>
        </div>
    );
};

export default Product;