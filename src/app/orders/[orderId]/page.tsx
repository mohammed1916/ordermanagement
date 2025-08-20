'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/lib/firestore/services';
import { Order, OrderTimeline } from '@/lib/firestore/schemas';
import { ConfirmModal, AlertModal, useModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiTruck, 
  FiCheck, 
  FiClock, 
  FiX, 
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
  FiDownload,
  FiCreditCard
} from 'react-icons/fi';

// Safe date formatting utility
const formatOrderDate = (date: any, formatStr: string = 'PPP'): string => {
  try {
    if (!date) return 'Date not available';
    
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      return format(date.toDate(), formatStr);
    }
    
    // Handle Date object or string
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Date not available';
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date not available';
  }
};

// Network connectivity check
const checkNetworkConnectivity = (): boolean => {
  return navigator.onLine;
};

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Modal hooks
  const confirmModal = useModal();
  const alertModal = useModal();
  const toast = useToast();

  const orderId = params?.orderId as string;

  useEffect(() => {
    if (user && !authLoading && orderId) {
      fetchOrder();
    }
  }, [user, authLoading, orderId]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;
    
    try {
      setIsLoading(true);
      const fetchedOrder = await orderService.getById(orderId);
      
      if (!fetchedOrder) {
        setError('Order not found');
        return;
      }
      
      // Check if user owns this order
      if (fetchedOrder.userId !== user.id) {
        setError('Access denied');
        return;
      }
      
      setOrder(fetchedOrder);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-6 h-6";
    
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

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    confirmModal.openModal({ title, message, onConfirm });
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    alertModal.openModal({ title, message, type });
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(title, message);
        break;
      case 'error':
        toast.error(title, message);
        break;
      case 'warning':
        toast.warning(title, message);
        break;
      case 'info':
        toast.info(title, message);
        break;
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !user) return;
    
    showConfirm(
      'Cancel Order',
      `Are you sure you want to cancel order #${order.orderNumber}? This action cannot be undone.`,
      async () => {
        // Check network connectivity first
        if (!checkNetworkConnectivity()) {
          confirmModal.closeModal();
          showAlert(
            'Connection Error',
            'No internet connection detected. Please check your network connection and try again.',
            'error'
          );
          return;
        }
        
        setIsCancelling(true);
        
        try {
          // Check if user is still authenticated
            if (!user.id) {
              toast.error('Authentication Required', 'Please log in to cancel your order.');
              setIsCancelling(false);
              return;
            }

          await orderService.cancelOrder(order.id!, 'Cancelled by customer', user.id);
          
          // Close confirmation modal and show success toast
          confirmModal.closeModal();
          showToast('Order Cancelled', 'Your order has been successfully cancelled.', 'success');
          
          // Refresh order data
          await fetchOrder();
          
        } catch (err: any) {
          console.error('Error cancelling order:', err);
          
          let errorTitle = 'Cancellation Failed';
          let errorMessage = 'Failed to cancel order. ';
          
          // Handle different types of errors
          if (err?.message?.includes('auth') || err?.message?.includes('permission') || err?.code === 'unauthenticated') {
            errorTitle = 'Authentication Error';
            errorMessage = 'Authentication issue detected. Please refresh the page and log in again.';
          } else if (err?.message?.includes('network') || err?.code === 'unavailable' || !checkNetworkConnectivity()) {
            errorTitle = 'Network Error';
            errorMessage = 'Network error detected. Please check your internet connection and try again.';
          } else if (err?.message?.includes('not found') || err?.code === 'not-found') {
            errorTitle = 'Order Not Found';
            errorMessage = 'Order not found. The page will refresh automatically.';
            setTimeout(() => window.location.reload(), 3000);
          } else if (err?.code === 'permission-denied') {
            errorTitle = 'Permission Denied';
            errorMessage = 'You do not have permission to cancel this order.';
          } else {
            errorMessage = 'Please try again later or contact support if the issue persists.';
          }
          
          // Close confirmation modal and show error
          confirmModal.closeModal();
          showAlert(errorTitle, errorMessage, 'error');
        } finally {
          setIsCancelling(false);
        }
      }
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <FiX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">Error</h1>
          <p className="text-red-800 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchOrder}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
            <Link
              href="/orders"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const canCancelOrder = ['pending', 'paid', 'processing'].includes(order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Placed on {formatOrderDate(order.createdAt, 'PPPp')}
            </p>
          </div>
          <div className="mt-4 md:mt-0 space-x-3">
            {canCancelOrder && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                  isCancelling 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            )}
            {order.status === 'delivered' && (
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <FiDownload className="w-4 h-4 inline mr-2" />
                Download Invoice
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.unitPrice.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline.map((timeline, index) => (
                  <div key={timeline.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(timeline.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">
                        {timeline.status.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">{timeline.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatOrderDate(timeline.timestamp, 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.pricing.subtotal.toFixed(2)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{order.pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{order.pricing.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{order.pricing.tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{order.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 && (
                        <><br />{order.shippingAddress.addressLine2}</>
                      )}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-600 text-sm">{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {order.paymentInfo.method.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`capitalize ${
                        order.paymentInfo.status === 'completed' ? 'text-green-600' : 
                        order.paymentInfo.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentInfo.status}
                      </span>
                    </p>
                  </div>
                </div>
                {order.paymentInfo.transactionId && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {order.paymentInfo.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tracking Information */}
          {order.shipping.trackingNumber && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tracking Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-mono text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded">
                      {order.shipping.trackingNumber}
                    </p>
                  </div>
                  {order.shipping.carrier && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Carrier</p>
                      <p className="font-medium text-gray-900">{order.shipping.carrier}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">
                      {formatOrderDate(order.shipping.estimatedDelivery, 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={confirmModal.modalData?.onConfirm || (() => {})}
        title={confirmModal.modalData?.title || ''}
        message={confirmModal.modalData?.message || ''}
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        type="danger"
        isLoading={isCancelling}
        loadingText="Cancelling..."
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.closeModal}
        title={alertModal.modalData?.title || ''}
        message={alertModal.modalData?.message || ''}
        type={alertModal.modalData?.type || 'info'}
      />
    </div>
  );
};

export default OrderDetailPage;
