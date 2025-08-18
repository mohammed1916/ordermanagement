import React, { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const NavBar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const categories = [
        { name: 'Men', path: '/shop?category=men' },
        { name: 'New Arrivals', path: '/shop?category=new' },
        { name: 'Sale', path: '/shop?category=sale' },
        { name: 'About', path: '/about' },
    ];

    return (
        <header className="w-full">
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center justify-center space-x-6 py-4">
                {categories.map((category) => (
                    <Link
                        key={category.name}
                        href={category.path}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {category.name}
                    </Link>
                ))}
            </nav>

            {/* Mobile Toggle Button */}
            <div className="flex md:hidden justify-end p-4">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700">
                    {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg z-50">
                    <div className="flex flex-col items-center space-y-4 py-4">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={category.path}
                                className="text-gray-700 hover:text-gray-900"
                                onClick={() => setMobileOpen(false)}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default NavBar;
