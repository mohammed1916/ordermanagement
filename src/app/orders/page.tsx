'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/lib/firestore/services';
import { Order, OrderStatus } from '@/lib/firestore/schemas';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  FiPackage, 
  FiTruck, 
  FiCheck, 
  FiClock, 
  FiX, 
  FiRefreshCw,
  FiEye,
  FiDownload
} from 'react-icons/fi';

const OrdersPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      fetchOrders();
    }
  }, [user, authLoading, selectedStatus]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      let fetchedOrders;
      
      if (selectedStatus === 'all') {
        fetchedOrders = await orderService.getOrdersByUser(user.id);
      } else {
        const allOrders = await orderService.getOrdersByUser(user.id);
        fetchedOrders = allOrders.filter(order => order.status === selectedStatus);
      }
      
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    const iconClass = "w-5 h-5";
    
    switch (status) {
      case 'pending':
        return <FiClock className={`${iconClass} text-yellow-500`} />;
      case 'payment_failed':
        return <FiX className={`${iconClass} text-red-500`} />;
      case 'paid':
        return <FiCheck className={`${iconClass} text-green-500`} />;
      case 'processing':
        return <FiRefreshCw className={`${iconClass} text-blue-500`} />;
      case 'shipped':
        return <FiTruck className={`${iconClass} text-purple-500`} />;
      case 'out_for_delivery':
        return <FiTruck className={`${iconClass} text-orange-500`} />;
      case 'delivered':
        return <FiPackage className={`${iconClass} text-green-600`} />;
      case 'cancelled':
        return <FiX className={`${iconClass} text-red-600`} />;
      case 'refunded':
        return <FiRefreshCw className={`${iconClass} text-gray-500`} />;
      case 'returned':
        return <FiRefreshCw className={`${iconClass} text-orange-600`} />;
      default:
        return <FiClock className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'payment_failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'returned':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      payment_failed: 'Payment Failed',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      returned: 'Returned'
    };
    return labels[status] || status;
  };

  const canCancelOrder = (order: Order) => {
    return ['pending', 'paid', 'processing'].includes(order.status);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await orderService.cancelOrder(orderId, 'Cancelled by customer', user?.id);
      await fetchOrders(); // Refresh orders
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your order history</p>
      </motion.div>

      {/* Status Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value as OrderStatus | 'all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStatus === option.value
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {orders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12 bg-gray-50 rounded-xl"
            >
              <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {selectedStatus === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No orders with status "${getStatusLabel(selectedStatus as OrderStatus)}".`
                }
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {format(new Date(order.createdAt as any || Date.now()), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{order.pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-600 text-center py-2">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {order.shipping.trackingNumber && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">Tracking Information</h4>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Tracking Number:</span> {order.shipping.trackingNumber}
                      </p>
                      {order.shipping.carrier && (
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Carrier:</span> {order.shipping.carrier}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FiEye className="w-4 h-4" />
                      View Details
                    </Link>
                    
                    {order.shipping.trackingNumber && (
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200">
                        <FiTruck className="w-4 h-4" />
                        Track Order
                      </button>
                    )}
                    
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order.id!)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}
                    
                    {order.status === 'delivered' && (
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200">
                        <FiDownload className="w-4 h-4" />
                        Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OrdersPage;
