import React from 'react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
                    <div className="space-y-4">
                        <p className="text-lg text-gray-700">
                            For any queries, please send an email to:
                        </p>
                        <a 
                            href="mailto:contactgreenelitedeveloper@gmail.com"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                        >
                            contactgreenelitedeveloper@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}