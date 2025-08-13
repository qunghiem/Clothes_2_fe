// src/components/CartTotal.tsx
import React from "react";
import { useSelector } from 'react-redux';
import { selectCurrency, selectDeliveryFee } from '../store/slices/shopSlice';
import { selectCartAmount } from '../store/slices/cartSlice';
import Title from "./Title";

const CartTotal: React.FC = () => {
    const currency = useSelector(selectCurrency);
    const deliveryFee = useSelector(selectDeliveryFee);
    const cartAmount = useSelector(selectCartAmount);

    return (
        <div className="w-full">
            <div className="text-2xl">
                <Title text1={"CART"} text2={"TOTALS"}/>
            </div>
            <div className="flex flex-col gap-2 mt-2 text-sm">
                <div className="flex justify-between">
                    <p>SubTotal</p>
                    <p>{currency} {cartAmount}.00</p>
                </div>
                <hr />
                <div className="flex justify-between">
                    <p>Shipping Fee</p>
                    <p>{currency} {deliveryFee}.00</p>
                </div>
                <hr />
                <div className="flex justify-between">
                    <b>Total</b>
                    <b>{currency} {cartAmount === 0 ? 0 : cartAmount + deliveryFee}.00</b>
                </div>
                <hr />
            </div>
        </div>
    );
};

export default CartTotal;