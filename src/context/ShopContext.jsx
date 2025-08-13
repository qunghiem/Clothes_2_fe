// import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   // Kí tự tiền tệ
//   const currency = `$`;

//   // Phí vận chuyển
//   const delivery_fee = 10;

//   const [search, setSearch] = useState("");
//   const [showSearch, setShowSearch] = useState(false);

//   const [cartItems, setCartItems] = useState(() => {
//     const storedCart = localStorage.getItem("cart");
//     return storedCart ? JSON.parse(storedCart) : {};
//   });

//   const navigate = useNavigate();


//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cartItems));
//   }, [cartItems]);

//   const addToCart = async (itemId, size) => {
//     if (!size) {
//       toast.error("Select Product Size");
//       return;
//     }

//     let cartData = structuredClone(cartItems);

//     if (cartData[itemId]) {
//       if (cartData[itemId][size]) {
//         cartData[itemId][size] += 1;
//       } else {
//         cartData[itemId][size] = 1;
//       }
//     } else {
//       cartData[itemId] = { [size]: 1 };
//     }

//     setCartItems(cartData);
//     toast.success("Thêm vào giỏ hàng thành công!", {
//       autoClose: 1500,
//     });
//   };

//   const getCartCount = () => {
//     let totalCount = 0;
//     for (const item in cartItems) {
//       for (const size in cartItems[item]) {
//         try {
//           if (cartItems[item][size] > 0) {
//             totalCount += cartItems[item][size];
//           }
//         } catch (error) {}
//       }
//     }
//     return totalCount;
//   };

//   // xoa + tang/giam
//   const updateQuantity = async (itemId, size, quantity, comfirm = false) => {
//     let cartData = structuredClone(cartItems);
//     cartData[itemId][size] = quantity;

//     if (comfirm && quantity === 0) {
//       const confirmed = window.confirm(
//         "Bạn có chắc chắn muốn xóa sản phẩm này không?"
//       );
//       if (!confirmed) {
//         toast.info("Đã hủy thao tác.", { autoClose: 1500 });
//         return;
//       }
//     }

//     if (quantity === 0) {
//       delete cartData[itemId][size];
//       if (Object.keys(cartData[itemId]).length === 0) {
//         delete cartData[itemId];
//       }
//     } else {
//       cartData[itemId][size] = quantity;
//     }

//     setCartItems(cartData);
//     toast.success("Cập nhật giỏ hàng thành công!", { autoClose: 1500 });
//   };

//   // thêm 
//  // Xóa nhiều sản phẩm được chọn
//   const removeSelectedItems = async (selectedItems) => {
//     if (selectedItems.length === 0) {
//       toast.warning("Vui lòng chọn sản phẩm để xóa!", { autoClose: 1500 });
//       return;
//     }

//     const confirmed = window.confirm(
//       `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn không?`
//     );
//     if (!confirmed) {
//       toast.info("Đã hủy thao tác.", { autoClose: 1500 });
//       return;
//     }

//     let cartData = structuredClone(cartItems);
    
//     selectedItems.forEach(item => {
//       if (cartData[item.itemId] && cartData[item.itemId][item.size]) {
//         delete cartData[item.itemId][item.size];
        
//         // Nếu sản phẩm không còn size nào, xóa luôn sản phẩm
//         if (Object.keys(cartData[item.itemId]).length === 0) {
//           delete cartData[item.itemId];
//         }
//       }
//     });
    
//     setCartItems(cartData);
//     toast.success(`Đã xóa ${selectedItems.length} sản phẩm khỏi giỏ hàng!`, { autoClose: 1500 });
//   };

//   // Xóa tất cả sản phẩm trong giỏ hàng
//   const clearCart = async () => {
//     if (Object.keys(cartItems).length === 0) {
//       toast.warning("Giỏ hàng trống!", { autoClose: 1500 });
//       return;
//     }

//     const confirmed = window.confirm(
//       "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?"
//     );
//     if (!confirmed) {
//       toast.info("Đã hủy thao tác.", { autoClose: 1500 });
//       return;
//     }

//     setCartItems({});
//     toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng!", { autoClose: 1500 });
//   };
//   // thêm 

//   const getCartAmount = () => {
//     let totalAmount = 0;
//     for (const items in cartItems) {
//       let itemInfor = products.find((product) => product._id === items);
//       for (const item in cartItems[items]) {
//         try {
//           if (cartItems[items][item] > 0) {
//             totalAmount += itemInfor.price * cartItems[items][item];
//           }
//         } catch (e) {}
//       }
//     }
//     return totalAmount;
//   };

//   const value = {
//     products,
//     currency,
//     delivery_fee,
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     cartItems,
//     addToCart,
//     getCartCount,
//     updateQuantity,
//     getCartAmount,
//     navigate,    
//     removeSelectedItems,
//   };

//   return (
//     <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;
