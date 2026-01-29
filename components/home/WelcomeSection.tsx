// components/WelcomeSection.tsx
'use client';

const WelcomeSection = () => {
  return (
    <section className="w-[95%] mx-auto my-12 py-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Your online Indian food store in Europe
        </h1>
        
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Welcome to <span className="font-semibold text-green-800">GRD FOOD</span>, your one-stop shop for authentic Indian food throughout Europe. Discover a wide selection of traditional and modern products, designed to bring the unique taste of India directly to your kitchen. With over 200 products available, our online shop offers everything you need to prepare delicious and authentic Indian dishes without leaving home.
          </p>
          
          <p className="text-lg">
            We offer fast and secure shipping throughout Europe, with reliable deliveries right to your door. Whether you're looking to try new recipes or simply rediscover the authentic flavors of India, <span className="font-semibold text-green-800">GRD FOOD</span> is the perfect choice.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;