import React from 'react'

const ShopFilters = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <nav className="shop-filters">
            <ul className="filter-list">
                {categories.map((category) => (
                    <li key={category}>
                        <button
                            className={`filter-button ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => onCategoryChange(category)}
                        >
                            {category}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default ShopFilters
