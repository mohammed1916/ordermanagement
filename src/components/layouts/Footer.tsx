import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[#faf5f500] py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Shop</h3>
                        <ul className="space-y-2">
                            <li><Link href="/shop?category=men" className="text-[#333] hover:text-black">Men</Link></li>
                            {/* <li><Link href="/shop?category=women" className="text-[#333] hover:text-black">Women</Link></li> */}
                            <li><Link href="/shop?category=new" className="text-[#333] hover:text-black">New Arrivals</Link></li>
                            <li><Link href="/shop?category=sale" className="text-[#333] hover:text-black">Sale</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li><Link href="/contact" className="text-[#333] hover:text-black">Contact Us</Link></li>
                            {/* <li><Link href="/faq" className="text-[#333] hover:text-black">FAQ</Link></li>
                            <li><Link href="/shipping" className="text-[#333] hover:text-black">Shipping</Link></li>
                            <li><Link href="/returns" className="text-[#333] hover:text-black">Returns</Link></li> */}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">About</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-[#333] hover:text-black">Our Story</Link></li>
                            {/* <li><Link href="/sustainability" className="text-[#333] hover:text-black">Sustainability</Link></li> */}
                            <li><Link href="/terms" className="text-[#333] hover:text-black">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="text-[#333] hover:text-black">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* <div>
                        <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
                        <p className="text-[#333] mb-4">Subscribe to get special offers and updates</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                            />
                            <button
                                type="submit"
                                className="bg-[#1a1a1a] text-white px-4 py-2 rounded-r hover:bg-black hover:scale-105 transition duration-200"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div> */}
                </div>

                <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Teem Avenue. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
