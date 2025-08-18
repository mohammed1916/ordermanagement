import crypto from 'crypto';

// PhonePe test credentials
const PHONEPE_MERCHANT_ID = 'MERCHANTUAT';
const PHONEPE_SALT_KEY = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_SALT_INDEX = 1;
const PHONEPE_ENV = 'UAT'; // UAT for testing, PRODUCTION for live

interface PhonePePaymentRequest {
    merchantTransactionId: string;
    merchantUserId: string;
    amount: number;
    redirectUrl: string;
    redirectMode: string;
    callbackUrl: string;
    mobileNumber: string;
    paymentInstrument: {
        type: string;
    };
}

export const generatePhonePePaymentUrl = async (orderDetails: {
    amount: number;
    merchantTransactionId: string;
    merchantUserId: string;
    mobileNumber: string;
}) => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            // Validate input
            if (!orderDetails.amount || !orderDetails.merchantTransactionId || !orderDetails.merchantUserId || !orderDetails.mobileNumber) {
                throw new Error('Missing required fields');
            }

            const response = await fetch('/api/payments/phonepe/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...orderDetails,
                    amount: Number(orderDetails.amount),
                    mobileNumber: orderDetails.mobileNumber.replace('+', '')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.paymentUrl) {
                return data.paymentUrl;
            } else {
                throw new Error(data.message || 'Failed to generate payment URL');
            }
        } catch (error) {
            console.error(`Attempt ${retryCount + 1} failed:`, error);
            retryCount++;

            if (retryCount === maxRetries) {
                throw new Error(error instanceof Error ? error.message : 'Failed to generate payment URL after multiple attempts');
            }

            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error('Failed to generate payment URL after multiple attempts');
}; 