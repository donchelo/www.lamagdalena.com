import React from 'react'
import Button from '../atoms/Button'

const ShopFilters = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <nav className="shop-filters">
            <ul className="filter-list">
                {categories.map((category) => (
                    <li key={category}>
                        <Button
                            variant="none"
                            className={`filter-button ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => onCategoryChange(category)}
                        >
                            {category}
                        </Button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default ShopFilters
