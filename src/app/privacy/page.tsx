import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                    <p className="mb-4">
                        We collect information you provide directly to us, such as when you create an account, 
                        make a purchase, or contact us for support. This may include:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Personal information (name, email address, phone number)</li>
                        <li>Billing and shipping addresses</li>
                        <li>Payment information</li>
                        <li>Communication preferences</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Analytics Information</h2>
                    <p className="mb-4">
                        We use Google Firebase Analytics to understand how our service is used. Firebase Analytics 
                        may collect the following information:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Device information (device model, operating system, browser type)</li>
                        <li>Usage data (pages visited, time spent, user interactions)</li>
                        <li>Location data (approximate location based on IP address)</li>
                        <li>User identifiers and session data</li>
                    </ul>
                    <p className="mb-4">
                        This data is collected automatically and helps us improve our service. You can opt-out of 
                        analytics tracking through your browser settings or by using our cookie preferences.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>To provide and maintain our service</li>
                        <li>To process orders and deliver products to your address</li>
                        <li>To improve user experience and site functionality</li>
                        <li>To analyze usage patterns and trends</li>
                        <li>To communicate with you about our service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
                    <p className="mb-4">
                        We do not sell or rent your personal information to third parties. We may share data with:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Google Analytics/Firebase for analytics purposes</li>
                        <li>Service providers who assist in operating our service</li>
                        <li>Shipping partners for order fulfillment (address information only)</li>
                        <li>Law enforcement when required by law</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                    <p className="mb-4">
                        You have the right to access, update, or delete your personal information including your address. 
                        You can also opt-out of analytics tracking.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at privacy@teemavenue.com
                    </p>
                </section>

                <div className="mt-8 text-sm text-gray-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}