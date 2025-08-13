import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import { selectProducts } from '../store/slices/shopSlice';
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const RelatedProducts = ({ category, subCategory }) => {
    const products = useSelector(selectProducts);
    const [related, setRelated] = useState([]);
    const { productId } = useParams();

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => 
                category === item.category && item._id !== productId 
            );
            productsCopy = productsCopy.filter((item) => 
                subCategory === item.subCategory
            );

            setRelated(productsCopy.slice(0, 5));
        }
    }, [products, productId, category, subCategory]);

    return (
        <div className="my-24">
            <div className="text-center text-3xl py-2">
                <Title text1={"RELATED"} text2={"PRODUCTS"} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {related.map((item, index) => (
                    <ProductItem
                        key={index}
                        id={item._id}
                        image={item.image}
                        name={item.name}
                        price={item.price}
                    />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;