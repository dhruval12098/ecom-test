// components/WelcomeSection.tsx
'use client';

const WelcomeSection = () => {
  return (
    <section className="w-[95%] mx-auto my-12 py-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
         Tulsi — Belgium-based Indian grocery store
        </h1>
        
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Welcome to Tulsi Indian Grocery Store, your trusted destination for authentic Indian groceries in Ghent. Visit our physical store in Ghent or shop online from a wide selection of more than 500 products including spices, basmati rice, snacks and traditional Indian ingredients.
          </p>
          
          <p className="text-lg">
           Our mission is to bring the real taste of India to your kitchen with high-quality products and a friendly shopping experience. We offer fast delivery directly to your door in selected areas, making it easy and convenient to enjoy authentic Indian groceries at home.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
