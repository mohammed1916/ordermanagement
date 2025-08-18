// app/about/page.tsx or pages/about.tsx
import React from "react";

const AboutPage: React.FC = () => {
    return (
        <main className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-6">About Teem Avenue</h1>

            <p className="text-lg mb-4 text-justify">
            <strong>Where Passion Meets Threads – From Streets to Screen</strong>
            </p>

            <p className="mb-4 text-justify">
            For over 15 years, our founder walked the streets, markets, and fairs, building connections the old-fashioned way—one sale at a time. From selling honey and chocolates to bags and t-shirts, every product came with a story, a handshake, and a smile. That journey shaped a deep understanding of what people want: quality, honesty, and value.
            </p>

            <p className="mb-4 text-justify">
            Today, that same spirit lives on through <strong>Teem Avenue</strong>, an e-commerce brand dedicated to delivering high-quality t-shirts that balance comfort, design, and affordability.
            </p>

            <p className="mb-4 text-justify">
            Whether you're an individual looking for your next favorite tee or a business needing custom bulk orders, we’re here for both <strong>B2C and B2B</strong> customers. Our journey may have started offline, but our commitment remains the same — to provide quality without compromise.
            </p>

            <p className="mt-8 font-semibold text-justify">
            This is Teem Avenue — grounded in experience, driven by passion, and designed for everyone.
            </p>
        </main>
    );
};

export default AboutPage;
