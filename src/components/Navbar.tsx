// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { setShowSearch } from "../store/slices/uiSlice";
import { selectCartCount } from "../store/slices/cartSlice";
import {
  selectUser,
  selectIsAuthenticated,
  logoutUser,
} from "../store/slices/authSlice";

const Navbar: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = useSelector(selectCartCount);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Đóng dropdown khi location thay đổi
  useEffect(() => {
    setShowProfileDropdown(false);
    setVisible(false); // Cũng đóng mobile menu
  }, [location.pathname]);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileDropdown]);

  const handleSearchClick = (): void => {
    dispatch(setShowSearch(true));
  };

  const handleLogout = (): void => {
    dispatch(logoutUser());
    setShowProfileDropdown(false);
    navigate("/");
  };

  const handleProfileClick = (): void => {
    if (isAuthenticated) {
      setShowProfileDropdown(!showProfileDropdown);
    } else {
      navigate("/login");
    }
  };

  // Xử lý navigation với delay để tránh đóng dropdown quá sớm
  const handleDropdownNavigation = (path: string): void => {
    // Đóng dropdown trước
    setShowProfileDropdown(false);
    // Navigate sau một delay nhỏ
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  return (
    <div className="flex items-center justify-between font-medium">
      <Link to="/">
        <img src={assets.adamoLogo} className="w-20" alt="" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6">
        <Link to={"/collection"}>
          <img
            onClick={handleSearchClick}
            src={assets.search_icon}
            className="w-5 cursor-pointer"
            alt="search-icon"
          />
        </Link>

        {/* Profile/Login Section */}
        <div className="group relative profile-dropdown-container">
          <div
            onClick={handleProfileClick}
            className="cursor-pointer flex items-center gap-2"
          >
            {isAuthenticated && user?.avatar ? (
              <img
                src={user.avatar}
                className="w-6 h-6 rounded-full object-cover"
                alt="Profile"
              />
            ) : (
              <img src={assets.profile_icon} className="w-5" alt="Profile" />
            )}
            {isAuthenticated && (
              <span className="hidden sm:block text-sm text-gray-600 max-w-20 truncate">
                {user?.name?.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Dropdown Menu */}
          {isAuthenticated && (
            <div
              className={`absolute dropdown-menu right-0 pt-4 z-50 ${
                showProfileDropdown ? "block" : "hidden"
              }`}
            >
              <div className="flex flex-col gap-2 w-56 py-3 px-4 bg-white shadow-lg rounded border">
                <div className="border-b pb-2 mb-2">
                  <p 
                    className="font-medium text-gray-800 truncate max-w-full" 
                    title={user?.name}
                  >
                    {user?.name}
                  </p>
                  <p 
                    className="text-sm text-gray-500 truncate max-w-full" 
                    title={user?.email}
                  >
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => handleDropdownNavigation("/profile")}
                  className="cursor-pointer hover:text-black text-gray-600 py-1 text-left"
                >
                  Personal Information
                </button>
                <button
                  onClick={() => handleDropdownNavigation("/orders")}
                  className="cursor-pointer hover:text-black text-gray-600 py-1 text-left"
                >
                  My Orders
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="cursor-pointer hover:text-red-600 text-gray-600 text-left py-1"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {cartCount}
          </p>
        </Link>

        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt=""
        />
      </div>

      {/* Sidebar menu for small screens */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-40 ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="" />
            <p>Back</p>
          </div>

          {/* User info in mobile menu */}
          {isAuthenticated && (
            <div className="px-6 py-3 border-b">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    alt="Profile"
                  />
                ) : (
                  <img
                    src={assets.profile_icon}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    alt="Profile"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-medium text-gray-800 truncate" 
                    title={user?.name}
                  >
                    {user?.name}
                  </p>
                  <p 
                    className="text-sm text-gray-500 truncate" 
                    title={user?.email}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact"
          >
            CONTACT
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border"
                to="/profile"
              >
                PROFILE
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border"
                to="/orders"
              >
                ORDERS
              </NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setVisible(false);
                }}
                className="py-2 pl-6 border text-left text-red-600"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/login"
            >
              LOGIN
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;