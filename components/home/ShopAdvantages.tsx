// components/ShopAdvantages.tsx
'use client';
import { FaLeaf, FaTruck, FaTags } from 'react-icons/fa';

const advantages = [
  {
    id: 1,
    icon: <FaLeaf className="text-green-800 text-3xl" />,
    title: 'Authentic Indian Foods',
    description: 'Over 200 Products in Stock',
  },
  {
    id: 2,
    icon: <FaTruck className="text-green-800 text-3xl" />,
    title: 'Free shipping in Europe',
    description: 'for orders over €69',
  },
  {
    id: 3,
    icon: <FaTags className="text-green-800 text-3xl" />,
    title: 'Fantastic discounts on the entire range',
    description: 'Take advantage regularly!',
  },
];

const ShopAdvantages = () => {
  return (
    <div className="w-[95%] mx-auto border border-black rounded-3xl my-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side: Heading + Points */}
        <div className="flex-1 p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Discover the advantages of our shop
          </h2>
          <p className="text-gray-600 mb-8 pb-8 border-b-2 border-gray-200">
            Discover the variety of India right in your kitchen.
          </p>

          <div className="space-y-6">
            {advantages.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Image Box with minimal padding */}
        <div className="flex-1 p-[10px] pr-[10px] pt-[10px] pb-[10px]">
          <div className="rounded-2xl w-full overflow-hidden bg-gray-100 aspect-[4/3] sm:aspect-auto sm:min-h-[300px]">
            <img 
              src="https://i.pinimg.com/736x/b6/d3/ed/b6d3ed14e86fa601c03ec89e054d8811.jpg" 
              alt="Indian spices and ingredients"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAdvantages;
