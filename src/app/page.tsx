'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { GiReturnArrow } from "react-icons/gi";
import { motion } from 'framer-motion';

export default function Home() {
  const categories = [
    { name: 'Men', image: '/shirts/blue.jpeg', path: '/shop?category=men' },
    { name: 'New Arrivals', image: '/shirts/green.jpeg', path: '/shop?category=new' },
    { name: 'Sale', image: '/shirts/white.jpeg', path: '/shop?category=sale' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        className="relative h-[500px] bg-gradient-to-br from-[#FAF8F5] via-[#F5F2ED] to-[#EDE7DD] rounded-2xl overflow-hidden shadow-xl"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-black text-center px-6">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Quality T-Shirts for Everyone
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-10 max-w-3xl text-gray-700 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Discover our collection of premium t-shirts designed for comfort and style.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/shop" 
              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-gray-800 hover:to-gray-700"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Link href={category.path}>
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    objectFit="cover"
                    className="rounded-2xl transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.h3 
                      className="text-white text-2xl font-bold tracking-wide"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {category.name}
                    </motion.h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 shadow-inner"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="text-center group"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="inline-block p-6 bg-gradient-to-br from-[#faf8f5] to-[#f0ebe3] rounded-full mb-6 shadow-md group-hover:shadow-lg transition-shadow duration-300"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <GiReturnArrow className="text-2xl text-[#333] group-hover:text-blue-600 transition-colors duration-300" />
            </motion.div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Easy Returns</h3>
            <p className="text-gray-600 text-lg">30-day easy return policy</p>
          </motion.div>

          <motion.div 
            className="text-center group"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="inline-block p-6 bg-gradient-to-br from-[#faf8f5] to-[#f0ebe3] rounded-full mb-6 shadow-md group-hover:shadow-lg transition-shadow duration-300"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <RiSecurePaymentLine className="text-2xl text-[#333] group-hover:text-blue-600 transition-colors duration-300" />
            </motion.div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Secure Payments</h3>
            <p className="text-gray-600 text-lg">Your payments are safe with us</p>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
