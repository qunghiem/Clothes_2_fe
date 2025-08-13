import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { selectCartItems, removeSelectedItems } from '../store/slices/cartSlice';
import { selectDeliveryFee, selectCurrency } from '../store/slices/shopSlice';
import { selectUser } from '../store/slices/authSlice';
import { addOrder } from '../store/slices/ordersSlice';
import { DeliveryInfo, OrderData, SelectedTotals } from '../types';

type PaymentMethod = 'stripe' | 'razorpay' | 'cod';

interface SelectedCartItem {
    _id: string;
    size: string;
    quantity: number;
    name?: string;
    price?: number;
    image?: string[];
}

interface LocationState {
    selectedItems: SelectedCartItem[];
    selectedTotals: SelectedTotals;
}

interface ValidationErrors {
    [key: string]: string;
}

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validatePostalCode = (zipCode: string, country: string): boolean => {
    if (!zipCode.trim()) return false;
    
    if (zipCode.trim().length < 3) return false;
    
    switch (country.toLowerCase()) {
        case 'usa':
        case 'united states':
            return /^\d{5}(-\d{4})?$/.test(zipCode);
        case 'canada':
            return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zipCode);
        default:
            return zipCode.trim().length >= 3;
    }
};

const validateName = (name: string): boolean => {
    return name.trim().length >= 0 && /^[\p{L}\p{M}\s'-]+$/u.test(name);
};

const PlaceOrder: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectUser);
    const cartItems = useSelector(selectCartItems);
    const deliveryFee = useSelector(selectDeliveryFee);
    const currency = useSelector(selectCurrency);
    
    const locationState = location.state as LocationState | null;
    const selectedItems = locationState?.selectedItems || [];
    const selectedTotals = locationState?.selectedTotals || { subtotal: 0, total: 0 };
    
    const [method, setMethod] = useState<PaymentMethod>("cod");
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
                if (!validateName(value)) return `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters and contain only letters (including Vietnamese characters)`;
                return '';
            
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!validateEmail(value)) return 'Please enter a valid email address';
                return '';
            
            case 'street':
                if (!value.trim()) return 'Street address is required';
                if (value.trim().length < 5) return 'Street address must be at least 5 characters';
                return '';
            
            case 'city':
                if (!value.trim()) return 'City is required';
                if (value.trim().length < 2) return 'City name must be at least 2 characters';
                return '';
            
            case 'state':
                if (!value.trim()) return 'State/Province is required';
                if (value.trim().length < 2) return 'State/Province must be at least 2 characters';
                return '';
            
            case 'zipCode':
                if (!value.trim()) return 'Postal code is required';
                if (!validatePostalCode(value, deliveryInfo.country)) {
                    return 'Please enter a valid postal code';
                }
                return '';
            
            case 'country':
                if (!value.trim()) return 'Country is required';
                if (value.trim().length < 2) return 'Country name must be at least 2 characters';
                return '';
            
            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                if (!validatePhone(value)) return 'Please enter a valid phone number (at least 10 digits)';
                return '';
            
            default:
                return '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        
        Object.keys(deliveryInfo).forEach(key => {
            const error = validateField(key, deliveryInfo[key as keyof DeliveryInfo]);
            if (error) {
                newErrors[key] = error;
            }
        });

        if (!newErrors.zipCode && !newErrors.country) {
            const zipError = validateField('zipCode', deliveryInfo.zipCode);
            if (zipError) {
                newErrors.zipCode = zipError;
            }
        }

        if (!selectedItems || selectedItems.length === 0) {
            newErrors.general = 'No products selected for ordering';
        }

        if (!method) {
            newErrors.paymentMethod = 'Please select a payment method';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        
        setDeliveryInfo(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        const fieldError = validateField(name, value);
        if (fieldError && value.trim()) { 
            setErrors(prev => ({
                ...prev,
                [name]: fieldError
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setIsSubmitting(true);

        try {
            // Validate form
            if (!validateForm()) {
                setIsSubmitting(false);
                return;
            }

            const orderItems = selectedItems.map(item => ({
                _id: item._id,
                size: item.size,
                quantity: item.quantity,
            }));

            const orderData: OrderData = {
                paymentMethod: method,
                totalAmount: selectedTotals.total,
            };

            await dispatch(addOrder({
                orderData,
                cartItems: orderItems,
                deliveryInfo
            }));

            const selectedItemsForRemoval = selectedItems.map(item => ({
                itemId: item._id,
                size: item.size
            }));
            
            dispatch(removeSelectedItems(selectedItemsForRemoval));
            
            navigate('/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            setErrors({ general: 'Failed to place order. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedItems || selectedItems.length === 0) {
        return (
            <div className="border-t pt-14 py-20">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">No products selected</h2>
                    <p className="text-gray-600 mb-6">Please go back to the cart and select products to order</p>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="bg-black text-white px-6 py-3 text-sm hover:bg-gray-800"
                    >
                        Back to cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
                {/* Left */}
                <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
                    <div className="text-xl sm:text-2xl my-3">
                        <Title text1={"DELIVERY"} text2={"INFORMATION"} />
                    </div>
                    
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                            {errors.general}
                        </div>
                    )}
                    
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <input 
                                required
                                type="text"
                                name="firstName"
                                value={deliveryInfo.firstName}
                                onChange={handleInputChange}
                                placeholder="First name"
                                className={`border rounded py-1.5 px-3.5 w-full ${
                                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <input 
                                required
                                type="text"
                                name="lastName"
                                value={deliveryInfo.lastName}
                                onChange={handleInputChange}
                                placeholder="Last name"
                                className={`border rounded py-1.5 px-3.5 w-full ${
                                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <input 
                            required
                            type="email"
                            name="email"
                            value={deliveryInfo.email}
                            onChange={handleInputChange}
                            placeholder="Email address"
                            className={`border rounded py-1.5 px-3.5 w-full ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    
                    <div>
                        <input 
                            required
                            type="text"
                            name="street"
                            value={deliveryInfo.street}
                            onChange={handleInputChange}
                            placeholder="Street address"
                            className={`border rounded py-1.5 px-3.5 w-full ${
                                errors.street ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.street && (
                            <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <input 
                                required
                                type="text"
                                name="city"
                                value={deliveryInfo.city}
                                onChange={handleInputChange}
                                placeholder="City"
                                className={`border rounded py-1.5 px-3.5 w-full ${
                                    errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.city && (
                                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <input 
                                required
                                type="text"
                                name="state"
                                value={deliveryInfo.state}
                                onChange={handleInputChange}
                                placeholder="State/Province"
                                className={`border rounded py-1.5 px-3.5 w-full ${
                                    errors.state ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.state && (
                                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <input 
                                required
                                type="text"
                                name="zipCode"
                                value={deliveryInfo.zipCode}
                                onChange={handleInputChange}
                                placeholder="Postal code"
                                className={`border rounded py-1.5 px-3.5 w-full ${
                                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.zipCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                            )}
                        </div>
                        <div className="w-1/2">
                            <input 
                                required
                                type="text"
                                name="country"
                                value={deliveryInfo.country}
                                onChange={handleInputChange}
                                placeholder="Country"
                                className={`border rounded py-1.5 px-3.5 w-full ${
                                    errors.country ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.country && (
                                <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <input 
                            required
                            type="tel"
                            name="phone"
                            value={deliveryInfo.phone}
                            onChange={handleInputChange}
                            placeholder="Phone number"
                            className={`border rounded py-1.5 px-3.5 w-full ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>
                </div> 

                {/* Right side */}
                <div className="mt-8">
                    <div className="mb-8">
                        <div className="text-xl mb-4">
                            <Title text1={"YOUR"} text2={"ORDER"} />
                        </div>
                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                            <div className="space-y-3">
                                {selectedItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <img 
                                                    src={item.image[0]} 
                                                    className="w-12 h-12 object-cover rounded"
                                                    alt={item.name}
                                                />
                                            )}
                                            <div>
                                                <span className="font-medium">{item.name || `Product ${item._id}`}</span>
                                                <div className="text-xs text-gray-500">
                                                    Size: {item.size} | Qty: {item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-medium">
                                            {currency}{((item.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Totals */}
                    <div className="mt-8 min-w-80">
                        <div className="w-full">
                            <div className="text-2xl">
                                <Title text1={"ORDER"} text2={"TOTALS"}/>
                            </div>
                            <div className="flex flex-col gap-2 mt-2 text-sm">
                                <div className="flex justify-between">
                                    <p>Subtotal ({selectedItems.length} items)</p>
                                    <p>{currency} {selectedTotals.subtotal}.00</p>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <p>Shipping Fee</p>
                                    <p>{currency} {selectedTotals.subtotal === 0 ? 0 : deliveryFee}.00</p>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <b>Total</b>
                                    <b>{currency} {selectedTotals.total}.00</b>
                                </div>
                                <hr />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mt-12">
                        <Title text1={"PAYMENT"} text2={"METHOD"}/>
                        {errors.paymentMethod && (
                            <p className="text-red-500 text-xs mt-1 mb-2">{errors.paymentMethod}</p>
                        )}
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div onClick={() => setMethod("stripe")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? "bg-green-500" : ""}`}></p>
                                <img src={assets.stripe_logo} className="h-5 mx-4" alt="" />
                            </div>
                            <div onClick={() => setMethod("razorpay")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? "bg-green-500" : ""}`}></p>
                                <img src={assets.razorpay_logo} className="h-5 mx-4" alt="" />
                            </div>
                            <div onClick={() => setMethod("cod")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? "bg-green-500" : ""}`}></p>
                                <p className="text-gray-500 text-sm font-medium mx-4">Cash on Delivery</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full text-end mt-8">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`px-16 py-3 text-sm transition-colors ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-black hover:bg-gray-800'
                            } text-white`}
                        >
                            {isSubmitting ? 'PLACING ORDER...' : `PLACE ORDER (${selectedItems.length} items)`}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;