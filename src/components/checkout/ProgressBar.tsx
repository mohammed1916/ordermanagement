import React from 'react';
import { Step } from '@/types';
// Progress Bar Component
export const ProgressBar: React.FC<{ step: Step }> = ({ step }) => {
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <div className={`font-medium ${step === 'shipping' ? 'text-blue-600' : 'text-gray-500'}`}>
                    1. Shipping
                </div>
                <div className={`font-medium ${step === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
                    2. Payment
                </div>
                <div className={`font-medium ${step === 'review' ? 'text-blue-600' : 'text-gray-500'}`}>
                    3. Review
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                        step === 'shipping' ? 'w-1/3' : step === 'payment' ? 'w-2/3' : 'w-full'
                    }`}
                />
            </div>
        </div>
    );
};