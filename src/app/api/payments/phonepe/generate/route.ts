import { NextResponse } from 'next/server';
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

interface PhonePeResponse {
    success: boolean;
    data?: {
        instrumentResponse: {
            redirectInfo: {
                url: string;
            };
        };
    };
    message?: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received request body:', body);
        const { amount, merchantTransactionId, merchantUserId, mobileNumber } = body;

        if (!amount || !merchantTransactionId || !merchantUserId || !mobileNumber) {
            console.error('Missing required fields:', { amount, merchantTransactionId, merchantUserId, mobileNumber });
            return NextResponse.json({ 
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }

        // Updated PhonePe API endpoint for UAT environment
        const baseUrl = PHONEPE_ENV === 'UAT' 
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
            : 'https://api.phonepe.com/apis/hermes/pg/v1/pay';


        const payload: PhonePePaymentRequest = {
            merchantTransactionId,
            merchantUserId,
            amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/confirmation`,
            redirectMode: 'POST',
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/phonepe/callback`,
            mobileNumber: mobileNumber.replace('+', ''), // Remove + if present
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        console.log('PhonePe payload:', payload);

        // Convert payload to base64
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        console.log('Base64 payload:', base64Payload);

        // Generate SHA256 hash
        const hashData = base64Payload + '/pg/v1/pay' + PHONEPE_SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(hashData).digest('hex');
        const finalXHeader = sha256 + '###' + PHONEPE_SALT_INDEX;
        console.log('X-VERIFY header:', finalXHeader);

        // Updated headers for PhonePe API
        const headers = {
            'Content-Type': 'application/json',
            'X-VERIFY': finalXHeader,
            'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
            'Accept': 'application/json'
        };

        console.log('Making request to PhonePe API with headers:', headers);

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                request: base64Payload
            })
        });

        console.log('PhonePe API response status:', response.status);
        const responseData: PhonePeResponse = await response.json();
        console.log('PhonePe API response:', responseData);
        
        if (responseData.success && responseData.data?.instrumentResponse?.redirectInfo?.url) {
            return NextResponse.json({ 
                success: true,
                paymentUrl: responseData.data.instrumentResponse.redirectInfo.url 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                message: responseData.message || 'Failed to generate payment URL'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error generating PhonePe payment URL:', error);
        return NextResponse.json({ 
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
} 