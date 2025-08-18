import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { GiReturnArrow } from "react-icons/gi";

export default function Home() {
  const categories = [
    { name: 'Men', image: '/shirts/blue.jpeg', path: '/shop?category=men' },
    { name: 'New Arrivals', image: '/shirts/green.jpeg', path: '/shop?category=new' },
    { name: 'Sale', image: '/shirts/white.jpeg', path: '/shop?category=sale' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-96 bg-[#FAF8F5] rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-[#FAF8F5] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-black text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Quality T-Shirts for Everyone</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">Discover our collection of premium t-shirts designed for comfort and style.</p>
          <Link href="/shop" className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition duration-200">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.path} className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  objectFit="cover"
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-20 transition duration-200" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-[#faf8f5] rounded-full mb-4">
              <GiReturnArrow className="text-xl text-[#333] hover:text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
            <p className="text-gray-600">30-day easy return policy</p>
          </div>

          <div className="text-center">
            <div className="inline-block p-4 bg-[#faf8f5] rounded-full mb-4">
              <RiSecurePaymentLine className="text-xl text-[#333] hover:text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">Your payments are safe with us</p>
          </div>
        </div>
      </section>
    </div>
  );
}
