import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { assets } from "../assets/assets";
import { useLocation } from 'react-router-dom';
import { selectSearch, selectShowSearch, setSearch, setShowSearch } from '../store/slices/uiSlice';

const SearchBar: React.FC = () => {
    const dispatch = useDispatch();
    const search = useSelector(selectSearch);
    const showSearch = useSelector(selectShowSearch);
    const [visible, setVisible] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [location]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(setSearch(e.target.value));
    };

    const handleCloseSearch = (): void => {
        dispatch(setShowSearch(false));
    };

    return showSearch && visible ? (
        <div className="border-t border-b bg-gray-50 text-center">
            <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
                <input 
                    value={search} 
                    onChange={handleSearchChange} 
                    className="flex-1 outline-none bg-inherit text-sm" 
                    type="text" 
                    placeholder="Search" 
                />
                <img src={assets.search_icon} className="w-4" alt="" />
            </div>
            <img 
                src={assets.cross_icon} 
                className="inline w-3 cursor-pointer" 
                onClick={handleCloseSearch} 
                alt="" 
            />
        </div>
    ) : null;
};

export default SearchBar;