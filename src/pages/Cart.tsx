import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import {
  selectProducts,
  selectCurrency,
  selectDeliveryFee,
} from "../store/slices/shopSlice";
import {
  selectCartItems,
  selectCurrentUserId,
  updateQuantity,
  removeSelectedItems,
} from "../store/slices/cartSlice";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { CartData, SelectedItem, SelectedTotals } from "../types";

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(selectProducts);
  const currency = useSelector(selectCurrency);
  const deliveryFee = useSelector(selectDeliveryFee);
  const cartItems = useSelector(selectCartItems);
  const currentUserId = useSelector(selectCurrentUserId);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [cartData, setCartData] = useState<CartData[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [selectedTotals, setSelectedTotals] = useState<SelectedTotals>({
    subtotal: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      setCartData([]);
      return;
    }

    const tempData: CartData[] = [];
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        if (cartItems[items][size] > 0) {
          tempData.push({
            _id: items,
            size: size,
            quantity: cartItems[items][size],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems, isAuthenticated, currentUserId]);

  useEffect(() => {
    let subtotal = 0;

    selectedItems.forEach((selectedItem) => {
      const cartItem = cartData.find(
        (item) =>
          item._id === selectedItem.itemId && item.size === selectedItem.size
      );

      if (cartItem) {
        const productData = products.find(
          (product) => product._id === cartItem._id
        );
        if (productData) {
          subtotal += productData.price * cartItem.quantity;
        }
      }
    });

    const total = subtotal === 0 ? 0 : subtotal + deliveryFee;

    setSelectedTotals({
      subtotal,
      total,
    });
  }, [selectedItems, cartData, products, deliveryFee]);

  const handleSelectItem = (itemId: string, size: string, isChecked: boolean): void => {
    if (isChecked) {
      setSelectedItems((prev) => [...prev, { itemId, size }]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((item) => !(item.itemId === itemId && item.size === size))
      );
    }
  };

  const handleSelectAll = (isChecked: boolean): void => {
    setSelectAll(isChecked);
    if (isChecked) {
      const allItems = cartData.map((item) => ({
        itemId: item._id,
        size: item.size,
      }));
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  };

  const isItemSelected = (itemId: string, size: string): boolean => {
    return selectedItems.some(
      (item) => item.itemId === itemId && item.size === size
    );
  };

  useEffect(() => {
    if (cartData.length > 0) {
      const allSelected = cartData.every((item) =>
        isItemSelected(item._id, item.size)
      );
      setSelectAll(allSelected);
    }
  }, [selectedItems, cartData]);

  const handleDeleteSelected = (): void => {
    const confirmed = window.confirm(
      `Are you sure you want to remove the ${selectedItems.length} selected items?`
    );
    if (confirmed) {
      dispatch(removeSelectedItems(selectedItems));
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const handleUpdateQuantity = (itemId: string, size: string, quantity: number): void => {
    if (quantity === 0) {
      const confirmed = window.confirm(
        "Are you sure you want to remove this item?"
      );
      if (confirmed) {
        dispatch(updateQuantity({ itemId, size, quantity }));
        setSelectedItems((prev) =>
          prev.filter((item) => !(item.itemId === itemId && item.size === size))
        );
      }
    } else {
      dispatch(updateQuantity({ itemId, size, quantity }));
    }
  };

  const handleProceedToCheckout = (): void => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    const selectedCartData = cartData
      .filter((item) =>
        selectedItems.some(
          (selected) =>
            selected.itemId === item._id && selected.size === item.size
        )
      )
      .map((item) => {
        const productData = products.find(
          (product) => product._id === item._id
        );
        return {
          ...item,
          name: productData?.name,
          price: productData?.price,
          image: productData?.image,
        };
      });

    navigate("/place-order", {
      state: {
        selectedItems: selectedCartData,
        selectedTotals: selectedTotals,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="border-t pt-14 py-20">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You need to log in
            </h3>
            <p className="text-gray-500 mb-6">
              Please log in to view your cart and continue shopping.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="bg-black text-white px-6 py-3 text-sm hover:bg-gray-700 transition-colors"
              >
                LOG IN
              </Link>
              <Link
                to="/collection"
                className="bg-gray-200 text-gray-700 px-6 py-3 text-sm hover:bg-gray-300 transition-colors"
              >
                BROWSE PRODUCTS
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartData.length === 0) {
    return (
      <div className="border-t pt-14 py-20">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
             Your cart is empty. Explore our amazing products!
            </p>
            <Link
              to="/collection"
              className="bg-black text-white px-6 py-3 text-sm hover:bg-gray-700 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {/* Cart Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-gray-50 rounded">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Select All ({cartData.length}{" "}
              {cartData.length > 1 ? "Products" : "Product"})
            </span>
          </label>
          {selectedItems.length > 0 && (
            <span className="text-sm text-blue-600">
              Selected {selectedItems.length} products
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600 transition-colors"
            >
              Delete ({selectedItems.length} selected)
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="">
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          );
          const isSelected = isItemSelected(item._id, item.size);

          return (
            <div
              key={index}
              className={`py-4 border-t border-b text-gray-700 grid grid-cols-[auto_4fr_0.5fr_0.5fr] sm:grid-cols-[auto_4fr_2fr_0.5fr] items-center gap-4 ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) =>
                  handleSelectItem(item._id, item.size, e.target.checked)
                }
                className="w-4 h-4 ml-2"
              />

              {/* Product Info */}
              <Link
                to={`/product/${productData?._id}`}
                className="flex items-start gap-6"
              >
                <img
                  src={productData?.image[0]}
                  className="w-16 sm:w-20"
                  alt=""
                />
                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData?.name}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {currency}
                      {productData?.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                      {item.size}
                    </p>
                  </div>
                </div>
              </Link>

              <input
                key={`quantity_${index}`}
                onChange={(e) =>
                  e.target.value === "" || e.target.value === "0"
                    ? null
                    : handleUpdateQuantity(
                        item._id,
                        item.size,
                        Number(e.target.value)
                      )
                }
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 text-center"
                type="number"
                min={1}
                value={item.quantity}
              />

              {/* DELETE */}
              <img
                onClick={() => handleUpdateQuantity(item._id, item.size, 0)}
                src={assets.bin_icon}
                className="w-4 mr-4 sm:w-5 cursor-pointer hover:opacity-70"
                alt=""
                title="Xóa sản phẩm"
              />
            </div>
          );
        })}
      </div>

      {/* Cart Total - Only for selected items */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          {/* Custom Cart Total Component for Selected Items */}
          <div className="w-full">
            <div className="text-2xl">
              <Title text1={"CART"} text2={"TOTALS"} />
            </div>
            <div className="flex flex-col gap-2 mt-2 text-sm">
              <div className="flex justify-between">
                <p>SubTotal ({selectedItems.length} items selected)</p>
                <p>
                  {currency} {selectedTotals.subtotal}.00
                </p>
              </div>
              <hr />
              <div className="flex justify-between">
                <p>Shipping Fee</p>
                <p>
                  {currency} {selectedTotals.subtotal === 0 ? 0 : deliveryFee}
                  .00
                </p>
              </div>
              <hr />
              <div className="flex justify-between">
                <b>Total</b>
                <b>
                  {currency} {selectedTotals.total}.00
                </b>
              </div>
              <hr />
            </div>
          </div>

          <div className="w-full text-end">
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedItems.length === 0}
              className={`text-sm my-8 px-8 py-3 transition-colors ${
                selectedItems.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-700"
              }`}
            >
              PROCEED TO CHECKOUT ({selectedItems.length} items)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;