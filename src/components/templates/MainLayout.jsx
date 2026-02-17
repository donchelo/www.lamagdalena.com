import React from 'react';
import NavBar from '../organisms/NavBar';

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <header>
                <NavBar />
            </header>
            {children}
        </div>
    );
};

export default MainLayout;
