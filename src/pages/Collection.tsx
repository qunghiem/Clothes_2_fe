import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { selectProducts } from '../store/slices/shopSlice';
import { 
    selectSearch, 
    selectShowSearch, 
    selectShowFilter,
    selectFilters,
    setShowFilter,
    toggleCategory,
    toggleSubCategory,
    setSortType
} from '../store/slices/uiSlice';
import { Product } from '../types';

const Collection: React.FC = () => {
    const dispatch = useDispatch();
    const products = useSelector(selectProducts);
    const search = useSelector(selectSearch);
    const showSearch = useSelector(selectShowSearch);
    const showFilter = useSelector(selectShowFilter);
    const filters = useSelector(selectFilters);

    const [filterProducts, setFilterProducts] = useState<Product[]>([]);
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [productsPerPage] = useState<number>(12); // Số sản phẩm mỗi trang
    
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filterProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filterProducts.length / productsPerPage);
    
    const getPageNumbers = (): (number | string)[] => {
        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5; 
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxVisiblePages; i++) {
                    pageNumbers.push(i);
                }
                if (totalPages > maxVisiblePages) {
                    pageNumbers.push('...');
                    pageNumbers.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    const handleToggleFilter = (): void => {
        dispatch(setShowFilter(!showFilter));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(toggleCategory(e.target.value));
        setCurrentPage(1); 
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(toggleSubCategory(e.target.value));
        setCurrentPage(1); 
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        dispatch(setSortType(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber: number): void => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const applyFilter = (): void => {
        let productsCopy = products.slice();

        if (search) {
            productsCopy = productsCopy.filter(item => 
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (filters.category.length > 0) {
            productsCopy = productsCopy.filter((item) =>
                filters.category.includes(item.category)
            );
        }
        
        if (filters.subCategory.length > 0) {
            productsCopy = productsCopy.filter((item) =>
                filters.subCategory.includes(item.subCategory)
            );
        }
        
        setFilterProducts(productsCopy);
    };

    const sortProduct = (): void => {
        let productsCopy = filterProducts.slice();

        switch(filters.sortType) {
            case 'low-high':
                setFilterProducts(productsCopy.sort((a, b) => (a.price - b.price)));
                break;
            case 'high-low':
                setFilterProducts(productsCopy.sort((a, b) => (b.price - a.price)));
                break;
            default: 
                applyFilter();
                break;
        }
    };

    useEffect(() => {
        sortProduct();
    }, [filters.sortType]);

    useEffect(() => {
        applyFilter();
        setCurrentPage(1); 
    }, [filters.category, filters.subCategory, search, showSearch, products]);

    return (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
            <div className="min-w-60">
                <p
                    onClick={handleToggleFilter}
                    className="my-2 text-xl flex items-center gap-2 cursor-pointer"
                >
                    FILTERS
                    <img
                        src={assets.dropdown_icon}
                        className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
                        alt=""
                    />
                </p>

                {/* CATEGORY FILTER */}
                <div className={`border border-gray-300 pl-5 mt-6 py-3 ${showFilter ? "" : "hidden"} sm:block`}>
                    <p className="mb-3 text-sm font-medium">CATEGORIES</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        <p className="flex gap-2">
                            <input
                                type="checkbox"
                                className="w-3"
                                onChange={handleCategoryChange}
                                value={"Men"}
                                checked={filters.category.includes("Men")}
                            />
                            Men
                        </p>
                        <p className="flex gap-2">
                            <input
                                type="checkbox"
                                className="w-3"
                                onChange={handleCategoryChange}
                                value={"Women"}
                                checked={filters.category.includes("Women")}
                            />
                            Women
                        </p>
                        <p className="flex gap-2">
                            <input
                                type="checkbox"
                                className="w-3"
                                onChange={handleCategoryChange}
                                value={"Kids"}
                                checked={filters.category.includes("Kids")}
                            />
                            Kids
                        </p>
                    </div>
                </div>

                {/* Type - SubCategory Filter */}
                <div className={`border border-gray-300 pl-5 my-5 py-3 ${showFilter ? "" : "hidden"} sm:block`}>
                    <p className="mb-3 text-sm font-medium">TYPE</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        <p className="flex gap-2">
                            <input
                                type="checkbox"
                                className="w-3"
                                value={"Topwear"}
                                onChange={handleSubCategoryChange}
                                checked={filters.subCategory.includes("Topwear")}
                            />
                            Topwear
                        </p>
                        <p className="flex gap-2">
                            <input
                                type="checkbox"
                                className="w-3"
                                value={"Bottomwear"}
                                onChange={handleSubCategoryChange}
                                checked={filters.subCategory.includes("Bottomwear")}
                            />
                            Bottomwear
                        </p>
                        <p className="flex gap-2">
                            <input
                                type="checkbox"
                                className="w-3"
                                value={"Winterwear"}
                                onChange={handleSubCategoryChange}
                                checked={filters.subCategory.includes("Winterwear")}
                            />
                            Winterwear
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1">
                <div className="flex justify-between text-base sm:text-2xl mb-4">
                    <Title text1={"ALL"} text2={"COLLECTIONS"} />

                    {/* Sort Product */}
                    <select 
                        onChange={handleSortChange} 
                        value={filters.sortType}
                        className="border-2 border-gray-300 text-sm px-2"
                    >
                        <option value="relavent">Sort by: Relavent</option>
                        <option value="low-high">Sort by: Low to High</option>
                        <option value="high-low">Sort by: High to Low</option>
                    </select>
                </div>

                {/* Products Info */}
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                    <p>
                    Showing {indexOfFirstProduct + 1}–{Math.min(indexOfLastProduct, filterProducts.length)} of {filterProducts.length} products

                    </p>
                    <p>Page {currentPage} / {totalPages}</p>
                </div>

                {/* Map Products */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                    {currentProducts.map((item, index) => (
                        <ProductItem
                            key={index}
                            id={item._id}
                            image={item.image}
                            name={item.name}
                            price={item.price}
                        />
                    ))}
                </div>

                {/* No products found */}
                {filterProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                        <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 mb-8">
                        <div className="flex items-center space-x-1">
                            {/* Previous button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-black hover:bg-gray-100'
                                }`}
                            >
                                « Prev
                            </button>

                            {/* Page numbers */}
                            {getPageNumbers().map((pageNumber, index) => (
                                <span key={index}>
                                    {pageNumber === '...' ? (
                                        <span className="px-3 py-2 text-gray-500">...</span>
                                    ) : (
                                        <button
                                            onClick={() => handlePageChange(pageNumber as number)}
                                            className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                                currentPage === pageNumber
                                                    ? 'bg-black text-white'
                                                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    )}
                                </span>
                            ))}

                            {/* Next button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-black hover:bg-gray-100'
                                }`}
                            >
                                Next »
                            </button>
                        </div>
                    </div>
                )}

                {/* Go to page input (for large datasets) */}
                {totalPages > 10 && (
                    <div className="flex justify-center items-center mt-4 mb-8">
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">Đi đến trang:</span>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                    const page = parseInt(e.target.value);
                                    if (page >= 1 && page <= totalPages) {
                                        handlePageChange(page);
                                    }
                                }}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            />
                            <span className="text-gray-600">/ {totalPages}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Collection;