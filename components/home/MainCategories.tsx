// components/MainCategories.tsx
'use client';
import { 
  GiWheat, 
  GiRiceCooker, 
  GiChiliPepper, 
  GiHotMeal, 
  GiCupcake, 
  GiSaucepan,
  GiNoodles,
  GiCoffeeCup,
  GiSparkles
} from 'react-icons/gi';

const categories = [
  {
    id: 1,
    icon: <GiWheat className="text-4xl text-green-800" />,
    title: 'Flours and grains',
    description: 'Choose from rice flour, chickpea flour, and other typical Indian grains, ideal for bread, desserts, and traditional preparations.',
  },
  {
    id: 2,
    icon: <GiRiceCooker className="text-4xl text-green-800" />,
    title: 'Rice',
    description: 'From classic parboiled Basmati to the finest aromatic varieties, perfect for any Indian recipe.',
  },
  {
    id: 3,
    icon: <GiChiliPepper className="text-4xl text-green-800" />,
    title: 'Spices',
    description: 'Curry, cumin, turmeric, and other essential spices to give your dishes the true flavor of India.',
  },
  {
    id: 4,
    icon: <GiHotMeal className="text-4xl text-green-800" />,
    title: 'Ready-made meals',
    description: 'Practical solutions for enjoying authentic Indian recipes in just minutes, without sacrificing taste.',
  },
  {
    id: 5,
    icon: <GiCupcake className="text-4xl text-green-800" />,
    title: 'Sweets and Snacks',
    description: 'Traditional treats like cookies, coconut cakes, savory snacks, and more for a complete Indian experience.',
  },
  {
    id: 6,
    icon: <GiSaucepan className="text-4xl text-green-800" />,
    title: 'Sauces',
    description: 'Chutneys, hot sauces, and condiments to enhance any dish.',
  },
  {
    id: 7,
    icon: <GiNoodles className="text-4xl text-green-800" />,
    title: 'Pastas and pulps',
    description: 'Versatile ingredients for cooking traditional or modern dishes quickly and easily.',
  },
  {
    id: 8,
    icon: <GiCoffeeCup className="text-4xl text-green-800" />,
    title: 'Beverages',
    description: 'Indian tea, natural juices, and other traditional beverages to accompany your meals.',
  },
  {
    id: 9,
    icon: <GiSparkles className="text-4xl text-green-800" />,
    title: 'Home & Care',
    description: 'Home and personal care products directly from India, bringing authenticity to your everyday life.',
  },
];

const MainCategories = () => {
  return (
    <section className="w-[95%] mx-auto my-16 py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          Our main categories include:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 hover:border-green-800"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="shrink-0">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MainCategories;