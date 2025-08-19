'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Address, User } from '@/types';
import { Cart, CartItem } from '@/lib/firestore/schemas';
import {PaymentStep} from '@/components/checkout/PaymentStep';
import { CheckoutForm } from '@/types/index';
import {ProgressBar} from '@/components/checkout/ProgressBar';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import {Step} from '@/types/index';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { processCartToOrder } from '@/lib/firestore/orderUtils';
import withAuth from '@/components/hoc/withAuth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '@/styles/phone-input.css';

// Phone Verification Step Component
const PhoneVerificationStep: React.FC<{
    formData: CheckoutForm;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onVerifyOtp: (e: React.FormEvent) => void;
    isOtpSent: boolean;
    isVerifying: boolean;
    verificationError: string;
    resetRecaptcha: () => Promise<void>;
}> = ({ formData, onInputChange, onSubmit, onVerifyOtp, isOtpSent, isVerifying, verificationError, resetRecaptcha }) => {
    const handlePhoneChange = (value: string) => {
        // Create a synthetic event to match the expected type
        const event = {
            target: {
                name: 'phoneNumber',
                value: `+${value}`
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(event);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Phone Verification</h2>
            
            {verificationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {verificationError}
                </div>
            )}
            
            {!isOtpSent ? (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <PhoneInput
                            country={'in'}
                            value={formData.phoneNumber.replace('+', '')}
                            onChange={handlePhoneChange}
                            inputClass="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            buttonClass="border-gray-300"
                            dropdownClass="border-gray-300"
                            searchClass="border-gray-300"
                            containerClass="phone-input-container"
                            inputProps={{
                                id: 'phoneNumber',
                                name: 'phoneNumber',
                                required: true,
                                placeholder: 'Enter phone number'
                            }}
                            enableSearch={true}
                            searchPlaceholder="Search country..."
                            searchNotFound="No country found"
                            preferredCountries={['in', 'us', 'gb', 'ca', 'au']}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            We'll send you a verification code via SMS
                        </p>
                    </div>
                    
                    {/* reCAPTCHA container */}
                    <div id="recaptcha-container"></div>
                    
                    {verificationError && (
                        <button
                            type="button"
                            onClick={resetRecaptcha}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 font-medium text-sm mb-2"
                        >
                            Reset reCAPTCHA
                        </button>
                    )}
                    
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className={`w-full py-3 px-4 rounded-md font-medium ${
                            isVerifying
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                        {isVerifying ? 'Sending...' : 'Send Verification Code'}
                    </button>
                </form>
            ) : (
                <form onSubmit={onVerifyOtp} className="space-y-4">
                    <div>
                        <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            id="otpCode"
                            name="otpCode"
                            value={formData.otpCode || ''}
                            onChange={onInputChange}
                            placeholder="Enter 6-digit code"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-center text-lg tracking-widest"
                            maxLength={6}
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Code sent to {formData.phoneNumber}
                        </p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isVerifying}
                        className={`w-full py-3 px-4 rounded-md font-medium ${
                            isVerifying
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Code'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="w-full text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Resend Code
                    </button>
                </form>
            )}
        </div>
    );
};

// Shipping Step Component (unchanged)
const ShippingStep: React.FC<{
    formData: CheckoutForm;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}> = ({ formData, onInputChange, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

            <div className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="shippingAddress.fullName"
                        value={formData.shippingAddress.fullName}
                        onChange={onInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
                        Address Line 1
                    </label>
                    <input
                        type="text"
                        id="addressLine1"
                        name="shippingAddress.addressLine1"
                        value={formData.shippingAddress.addressLine1}
                        onChange={onInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
                        Address Line 2 (Optional)
                    </label>
                    <input
                        type="text"
                        id="addressLine2"
                        name="shippingAddress.addressLine2"
                        value={formData.shippingAddress.addressLine2}
                        onChange={onInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="shippingAddress.city"
                            value={formData.shippingAddress.city}
                            onChange={onInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                            State
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="shippingAddress.state"
                            value={formData.shippingAddress.state}
                            onChange={onInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                            ZIP Code
                        </label>
                        <input
                            type="text"
                            id="zipCode"
                            name="shippingAddress.zipCode"
                            value={formData.shippingAddress.zipCode}
                            onChange={onInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                    </label>
                    <select
                        id="country"
                        name="shippingAddress.country"
                        value={formData.shippingAddress.country}
                        onChange={onInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        required
                    >
                        <option value="India">India</option>
                    </select>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
                >
                    Continue to Payment
                </button>
            </div>
        </form>
    );
};

// Review Step Component (unchanged)
const ReviewStep: React.FC<{
    formData: CheckoutForm;
    cart: Cart | null;
    onEditStep: (step: 'phone' | 'shipping' | 'payment') => void;
    onPlaceOrder: (e: React.FormEvent) => void;
    isProcessing: boolean;
    formatPrice: (price: number) => string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}> = ({ formData, cart, onEditStep, onPlaceOrder, isProcessing, formatPrice, subtotal, shipping, tax, total }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p>{formData.phoneNumber}</p>
                        <span className="text-green-600 text-sm">✓ Verified</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onEditStep('phone')}
                        className="text-blue-600 hover:text-blue-800 font-medium mt-2 text-sm"
                    >
                        Edit
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p>{formData.shippingAddress.fullName}</p>
                        <p>{formData.shippingAddress.addressLine1}</p>
                        {formData.shippingAddress.addressLine2 && (
                            <p>{formData.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                            {formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}
                        </p>
                        <p>{formData.shippingAddress.country}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onEditStep('shipping')}
                        className="text-blue-600 hover:text-blue-800 font-medium mt-2 text-sm"
                    >
                        Edit
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        {formData.paymentMethod === 'credit-card' ? (
                            <>
                                <p>Credit Card</p>
                                <p>•••• •••• •••• {formData.cardNumber.slice(-4)}</p>
                                <p>Expires: {formData.cardExpiry}</p>
                            </>
                        ) : (
                            <p>UPI</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => onEditStep('payment')}
                        className="text-blue-600 hover:text-blue-800 font-medium mt-2 text-sm"
                    >
                        Edit
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2">Order Items</h3>
                    <div className="divide-y divide-gray-200">
                        {cart && cart.items ? cart.items.map((item: CartItem) => (
                            <div key={item.productId} className="py-4 flex items-center">
                                <div className="h-16 w-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                    {item.productImage && (
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                            </div>
                        )) : (
                            <p className="text-gray-500 py-4">No items in cart</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={onPlaceOrder}>
                <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-md font-medium flex justify-center ${isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isProcessing ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        'Place Order'
                    )}
                </button>
            </form>
        </div>
    );
};

// Main Checkout Component
export default withAuth(function Checkout({ user }: { user: User }) {
    const router = useRouter();
    const { cart, clearCart } = useCart();

    const [step, setStep] = useState<Step>('phone');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [verificationError, setVerificationError] = useState<string>('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
    
    const [formData, setFormData] = useState<CheckoutForm>({
        phoneNumber: '',
        otpCode: '',
        shippingAddress: {
            fullName: user.name,
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
        },
        paymentMethod: 'credit-card',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        saveInfo: false,
    });

    // Initialize reCAPTCHA when component mounts
    React.useEffect(() => {
        if (!recaptchaVerifier) {
            try {
                const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'normal',
                    theme: 'light',
                    callback: () => {
                        // reCAPTCHA solved
                        console.log('reCAPTCHA solved successfully');
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired');
                        setVerificationError('reCAPTCHA expired. Please try again.');
                    },
                    'error-callback': (error: any) => {
                        console.error('reCAPTCHA error:', error);
                        setVerificationError('reCAPTCHA failed to load. Please check your internet connection.');
                    }
                });
                
                // Render the reCAPTCHA
                verifier.render().then(() => {
                    console.log('reCAPTCHA rendered successfully');
                }).catch((error: any) => {
                    console.error('Error rendering reCAPTCHA:', error);
                    setVerificationError('Failed to load reCAPTCHA. Please refresh the page.');
                });
                
                setRecaptchaVerifier(verifier);
            } catch (error: any) {
                console.error('Error initializing reCAPTCHA:', error);
                setVerificationError('Failed to initialize reCAPTCHA. Please refresh the page.');
            }
        }

        // Cleanup
        return () => {
            if (recaptchaVerifier) {
                try {
                    recaptchaVerifier.clear();
                } catch (error) {
                    console.error('Error clearing reCAPTCHA:', error);
                }
            }
        };
    }, [recaptchaVerifier]);

    // Redirect to cart if cart is empty or null
    React.useEffect(() => {
        if (!cart || !cart.items || cart.items.length === 0) {
            router.push('/cart');
        }
    }, [cart, router]);

    // Show loading or return null while redirecting
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to cart...</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...(formData[parent as keyof CheckoutForm] as any),
                    [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerificationError('');
        setIsVerifying(true);

        if (!recaptchaVerifier) {
            setVerificationError('reCAPTCHA not initialized. Please refresh the page.');
            setIsVerifying(false);
            return;
        }

        try {
            const phoneNumber = formData.phoneNumber;
            
            // Validate phone number format
            if (!phoneNumber.startsWith('+')) {
                setVerificationError('Please enter phone number with country code (e.g., +91)');
                setIsVerifying(false);
                return;
            }

            // Add timeout to the phone verification request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 seconds timeout
            });

            const signInPromise = signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);

            const confirmation = await Promise.race([signInPromise, timeoutPromise]) as ConfirmationResult;
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            console.log('OTP sent successfully');
            
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            
            let errorMessage = 'Failed to send verification code. Please try again.';
            
            if (error.message === 'Request timeout') {
                errorMessage = 'Request timed out. Please check your internet connection and try again.';
            } else if (error.code === 'auth/invalid-phone-number') {
                errorMessage = 'Invalid phone number format. Please include country code.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMessage = 'SMS quota exceeded. Please try again later.';
            } else if (error.code === 'auth/app-not-authorized') {
                errorMessage = 'App not authorized for phone authentication. Please contact support.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errorMessage = 'reCAPTCHA verification failed. Please try again.';
            }
            
            setVerificationError(errorMessage);
            
            // Reset reCAPTCHA on error
            try {
                if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        size: 'normal',
                        theme: 'light',
                        callback: () => {
                            console.log('reCAPTCHA solved successfully');
                        },
                        'expired-callback': () => {
                            setVerificationError('reCAPTCHA expired. Please try again.');
                        },
                        'error-callback': (error: any) => {
                            console.error('reCAPTCHA error:', error);
                            setVerificationError('reCAPTCHA failed to load. Please check your internet connection.');
                        }
                    });
                    
                    // Render the new reCAPTCHA
                    await newVerifier.render();
                    setRecaptchaVerifier(newVerifier);
                }
            } catch (recaptchaError) {
                console.error('Error resetting reCAPTCHA:', recaptchaError);
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setVerificationError('');

        if (!confirmationResult) {
            setVerificationError('No verification code sent. Please try again.');
            setIsVerifying(false);
            return;
        }

        if (!formData.otpCode) {
            setVerificationError('Please enter the verification code.');
            setIsVerifying(false);
            return;
        }

        try {
            // Add timeout to the OTP verification request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Verification timeout')), 15000); // 15 seconds timeout
            });

            const verificationPromise = confirmationResult.confirm(formData.otpCode);
            
            await Promise.race([verificationPromise, timeoutPromise]);
            
            setStep('shipping');
            window.scrollTo(0, 0);
            console.log('OTP verified successfully');
            
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            
            let errorMessage = 'Verification failed. Please try again.';
            
            if (error.message === 'Verification timeout') {
                errorMessage = 'Verification timed out. Please check your internet connection and try again.';
            } else if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid verification code. Please check and try again.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = 'Verification code expired. Please request a new one.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many verification attempts. Please try again later.';
            } else if (error.code === 'auth/session-expired') {
                errorMessage = 'Session expired. Please request a new verification code.';
            }
            
            setVerificationError(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const resetRecaptcha = async () => {
        if (recaptchaVerifier) {
            try {
                recaptchaVerifier.clear();
            } catch (error) {
                console.error('Error clearing reCAPTCHA:', error);
            }
        }

        try {
            const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'normal',
                theme: 'light',
                callback: () => {
                    console.log('reCAPTCHA solved successfully');
                },
                'expired-callback': () => {
                    setVerificationError('reCAPTCHA expired. Please try again.');
                },
                'error-callback': (error: any) => {
                    console.error('reCAPTCHA error:', error);
                    setVerificationError('reCAPTCHA failed to load. Please refresh the page.');
                }
            });

            await newVerifier.render();
            setRecaptchaVerifier(newVerifier);
            setVerificationError('');
            console.log('reCAPTCHA reset successfully');
        } catch (error) {
            console.error('Error resetting reCAPTCHA:', error);
            setVerificationError('Failed to reset reCAPTCHA. Please refresh the page.');
        }
    };

    const handleSubmitShipping = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
        window.scrollTo(0, 0);
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('review');
        window.scrollTo(0, 0);
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('User is not authenticated');
            setIsProcessing(false);
            return;
        }

        if (!user.id) {
            console.error('User ID is missing');
            setIsProcessing(false);
            return;
        }

        try {
            setIsProcessing(true);
            
            // Process cart to order using our new utility
            const result = await processCartToOrder(currentUser, {
                userId: user.id!,
                customerInfo: {
                    name: user.name || formData.shippingAddress.fullName,
                    email: user.email || '',
                    phoneNumber: formData.phoneNumber
                },
                shippingAddress: {
                    ...formData.shippingAddress,
                    phone: formData.phoneNumber
                },
                paymentMethod: 'cash_on_delivery', // Default payment method
            });

            if (result.success && result.orderId && result.orderNumber) {
                // Redirect to success page with order details
                router.push(`/checkout/success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
            } else {
                throw new Error(result.error || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setIsProcessing(false);
        }
    };

    const handleEditStep = (targetStep: 'phone' | 'shipping' | 'payment') => {
        if (targetStep === 'phone') {
            setIsOtpSent(false);
            setConfirmationResult(null);
            setVerificationError('');
            setFormData(prev => ({ ...prev, otpCode: '' }));
            
            // Reset reCAPTCHA
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'normal'
                });
                setRecaptchaVerifier(newVerifier);
            }
        }
        setStep(targetStep);
        window.scrollTo(0, 0);
    };

    // Calculate order summary - cart is already validated to not be null above
    const subtotal = cart!.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = 79;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    const formatPrice = (price: number) => {
        return `₹${price.toFixed(2)}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <ProgressBar step={step} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {step === 'phone' && (
                        <PhoneVerificationStep
                            formData={formData}
                            onInputChange={handleInputChange}
                            onSubmit={handleSendOtp}
                            onVerifyOtp={handleVerifyOtp}
                            isOtpSent={isOtpSent}
                            isVerifying={isVerifying}
                            verificationError={verificationError}
                            resetRecaptcha={resetRecaptcha}
                        />
                    )}
                    {step === 'shipping' && (
                        <ShippingStep
                            formData={formData}
                            onInputChange={handleInputChange}
                            onSubmit={handleSubmitShipping}
                        />
                    )}
                    {step === 'payment' && (
                        <PaymentStep
                            formData={formData}
                            onInputChange={handleInputChange}
                            onSubmit={handleSubmitPayment}
                            onEditStep={handleEditStep}
                            total={total}
                        />
                    )}
                    {step === 'review' && (
                        <ReviewStep
                            formData={formData}
                            cart={cart}
                            onEditStep={handleEditStep}
                            onPlaceOrder={handlePlaceOrder}
                            isProcessing={isProcessing}
                            formatPrice={formatPrice}
                            subtotal={subtotal}
                            shipping={shipping}
                            tax={tax}
                            total={total}
                        />
                    )}
                </div>

                <div className="lg:col-span-1">
                    <OrderSummary
                        cart={cart}
                        formatPrice={formatPrice}
                        subtotal={subtotal}
                        shipping={shipping}
                        tax={tax}
                        total={total}
                    />
                </div>
            </div>
        </div>
    );
});