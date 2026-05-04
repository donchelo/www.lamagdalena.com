import React from 'react';
import { Link } from 'react-router-dom';
import Text from '../atoms/Text';

const Breadcrumbs = ({ items, className = '' }) => {
    return (
        <div className={`breadcrumbs ${className}`.trim()}>
            {items.map((item, index) => (
                <React.Fragment key={item.path}>
                    {item.path ? (
                        <Link to={item.path}>{item.label}</Link>
                    ) : (
                        <Text as="span">{item.label}</Text>
                    )}
                    {index < items.length - 1 && <Text as="span" className="separator"> / </Text>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;
