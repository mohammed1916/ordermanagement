'use client';
import React from 'react';
import Link from 'next/link';
import NavBar from './NavBar';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; // import firebase auth

const Header = () => {
    const { cart } = useCart();
    const { favorites } = useFavorites();
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const loginHref = `/account?redirect=${encodeURIComponent(pathname)}`;

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.push('/'); // Redirect after sign out, e.g., homepage
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-white shadow-md transition-colors duration-300">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold flex items-center gap-2 font-['Century751_BT'] text-gray-900"
                    >
                        <img src="/teemlogo.png" alt="Teem Avenue Logo" className="h-7 w-7" />
                        <span className="hidden md:inline">Teem Avenue</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <NavBar />

                        <div className="flex items-center space-x-4">
                            <Link href="/shop" className="text-gray-900 hover:text-gray-900 transition-colors">
                                Shop
                            </Link>

                            {user && 
                            <>
                                <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative transition-colors">
                                    Cart
                                    {cart && cart.items && cart.items.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                            {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                                        </span>
                                    )}
                                </Link>

                                <Link href="/favorites" className="text-gray-600 hover:text-gray-900 relative transition-colors">
                                    Favorites
                                    {favorites.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                            {favorites.length}
                                        </span>
                                    )}
                                </Link>
                            </>
                            }

                            {user ? (
                                <>
                                    <Link
                                        href="/orders"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Orders
                                    </Link>

                                    <Link
                                        href="/account/dashboard"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Account
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                        suppressHydrationWarning={true}
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link href={loginHref} className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Login
                                </Link>
                            )}

                            {user?.isAdmin && (
                                <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
