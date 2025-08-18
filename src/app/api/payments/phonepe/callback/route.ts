import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PHONEPE_SALT_KEY = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_SALT_INDEX = 1;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { merchantTransactionId, code, success } = body;

        // Verify the callback
        const xVerify = request.headers.get('x-verify');
        if (!xVerify) {
            return NextResponse.json({ error: 'Missing verification header' }, { status: 400 });
        }

        // In a real implementation, you would verify the callback signature here
        // For testing purposes, we'll just check if the payment was successful

        if (success) {
            // Update the order status in your database
            // For now, we'll just return a success response
            return NextResponse.json({ 
                success: true,
                message: 'Payment successful',
                merchantTransactionId 
            });
        } else {
            return NextResponse.json({ 
                success: false,
                message: 'Payment failed',
                merchantTransactionId 
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing PhonePe callback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 