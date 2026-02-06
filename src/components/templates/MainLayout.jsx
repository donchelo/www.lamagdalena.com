import React from 'react';
import NavBar from '../organisms/NavBar';

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <NavBar />
            {children}
        </div>
    );
};

export default MainLayout;
