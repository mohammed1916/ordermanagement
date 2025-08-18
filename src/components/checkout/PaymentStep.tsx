// Payment Step Component
import React, { useState } from 'react';
import { CheckoutForm } from '@/types/index';
import { FaCreditCard } from 'react-icons/fa';
import { SiPhonepe } from 'react-icons/si';
import { generatePhonePePaymentUrl } from '@/lib/payments/phonepe';

export const PaymentStep: React.FC<{
    formData: CheckoutForm;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onEditStep: (step: 'shipping') => void;
    total: number;
}> = ({ formData, onInputChange, onSubmit, onEditStep, total }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');

    const handlePhonePePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');

        try {
            // Generate a unique transaction ID
            const merchantTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Generate PhonePe payment URL
            const paymentUrl = await generatePhonePePaymentUrl({
                amount: total,
                merchantTransactionId,
                merchantUserId: 'USER_' + Date.now(), // Replace with actual user ID
                mobileNumber: formData.phoneNumber
            });

            // Redirect to PhonePe payment page
            window.location.href = paymentUrl;
        } catch (error) {
            console.error('Error initiating PhonePe payment:', error);
            setError(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={formData.paymentMethod === 'phonepe' ? handlePhonePePayment : onSubmit} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                        Select Payment Method
                    </label>
                    
                    <div className="space-y-4">
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit-card"
                                checked={formData.paymentMethod === 'credit-card'}
                                onChange={onInputChange}
                                className="h-4 w-4 text-blue-600"
                            />
                            <div className="ml-3 flex items-center">
                                <FaCreditCard className="h-6 w-6 text-gray-600" />
                                <span className="ml-2 text-gray-900">Credit Card</span>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="phonepe"
                                checked={formData.paymentMethod === 'phonepe'}
                                onChange={onInputChange}
                                className="h-4 w-4 text-blue-600"
                            />
                            <div className="ml-3 flex items-center">
                                <SiPhonepe className="h-6 w-6 text-[#5F259F]" />
                                <span className="ml-2 text-gray-900">PhonePe</span>
                            </div>
                        </label>
                    </div>
                </div>

                {formData.paymentMethod === 'credit-card' && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number
                            </label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={onInputChange}
                                placeholder="•••• •••• •••• ••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    id="cardExpiry"
                                    name="cardExpiry"
                                    value={formData.cardExpiry}
                                    onChange={onInputChange}
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-2">
                                    CVC
                                </label>
                                <input
                                    type="text"
                                    id="cardCvc"
                                    name="cardCvc"
                                    value={formData.cardCvc}
                                    onChange={onInputChange}
                                    placeholder="•••"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {formData.paymentMethod === 'phonepe' && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-center">
                            <SiPhonepe className="h-12 w-12 text-[#5F259F] mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                                You will be redirected to PhonePe to complete your payment
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-4">
                                    Amount to pay: ₹{total.toFixed(2)}
                                </p>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full py-3 px-4 rounded-md font-medium ${
                                        isProcessing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#5F259F] hover:bg-[#4a1d7a] text-white'
                                    }`}
                                >
                                    {isProcessing ? 'Processing...' : 'Pay with PhonePe'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={() => onEditStep('shipping')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    ← Back to Shipping
                </button>

                {formData.paymentMethod === 'credit-card' && (
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium"
                    >
                        Continue to Review
                    </button>
                )}
            </div>
        </form>
    );
};
