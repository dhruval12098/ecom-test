import { FaLeaf, FaTruck, FaTags } from 'react-icons/fa';

const advantages = [
  {
    id: 1,
    icon: <FaLeaf className="text-green-800 text-3xl" />,
    title: 'Fresh & authentic Indian groceries',
    description: 'High-quality products from trusted brands',
  },
  {
    id: 2,
    icon: <FaTruck className="text-green-800 text-3xl" />,
    title: 'Fast delivery in Ghent',
    description: 'Same-day or next-day delivery available',
  },
  {
    id: 3,
    icon: <FaTags className="text-green-800 text-3xl" />,
    title: 'Weekly deals & special offers',
    description: 'Save more on your favorite products',
  },
  {
    id: 4,
    icon: <FaLeaf className="text-green-800 text-3xl" />,
    title: 'Fresh homemade meals (Tulsi Rasoi)',
    description: 'Ready-to-eat authentic Indian dishes',
  },
];

const ShopAdvantages = () => {
  return (
    <div className="w-[95%] mx-auto border border-black rounded-3xl my-12 bg-white">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Why shop at Tulsi Grocery?
          </h2>
          <p className="text-gray-600 mb-8 pb-8 border-b-2 border-gray-200">
            Authentic Indian groceries delivered fast in Ghent
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

        <div className="flex-1 p-[10px] pr-[10px] pt-[10px] pb-[10px]">
          <div className="rounded-2xl w-full overflow-hidden bg-gray-100 aspect-[4/3] sm:aspect-auto sm:min-h-[300px]">
            <img
              src="/brands/discover.JPEG"
              alt="Indian grocery store and fresh products"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAdvantages;
