"use client"
import { useState, useEffect } from "react";
import { Heart, Leaf, Shield, Truck, MapPin, Mail, Phone } from "lucide-react";
import ApiService from '@/lib/api';

export default function AboutPage() {
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [storyContent, setStoryContent] = useState({
    description: '',
    image: ''
  });
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateNumbers(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load dynamic story content
  useEffect(() => {
    const fetchStoryContent = async () => {
      try {
        const story = await ApiService.getAboutStory();
        if (story) {
          setStoryContent({
            description: story.description || '',
            image: story.image_url || '/images/farm-partnership.jpg'
          });
        } else {
          // Fallback to default content
          setStoryContent({
            description: `Founded in 2020, FreshMart began with a simple mission: to bring fresh, healthy, and organic products 
                  directly from local farmers to your kitchen. We believe that everyone deserves access to high-quality 
                  food that's both nutritious and delicious.
                  
                  Starting as a small online platform connecting local producers with consumers, we've grown into a 
                  trusted marketplace serving thousands of customers across the country. Our commitment to sustainability, 
                  quality, and community remains at the heart of everything we do.
                  
                  Today, we partner with over 500 local farmers and producers, ensuring that our products meet the 
                  highest standards of freshness and quality while supporting local agriculture and sustainable farming practices.`,
            image: '/images/farm-partnership.jpg'
          });
        }
      } catch (error) {
        console.error('Error fetching story content:', error);
        // Fallback to default content on error
        setStoryContent({
          description: `Founded in 2020, FreshMart began with a simple mission: to bring fresh, healthy, and organic products 
                directly from local farmers to your kitchen. We believe that everyone deserves access to high-quality 
                food that's both nutritious and delicious.
                
                Starting as a small online platform connecting local producers with consumers, we've grown into a 
                trusted marketplace serving thousands of customers across the country. Our commitment to sustainability, 
                quality, and community remains at the heart of everything we do.
                
                Today, we partner with over 500 local farmers and producers, ensuring that our products meet the 
                highest standards of freshness and quality while supporting local agriculture and sustainable farming practices.`,
          image: '/images/farm-partnership.jpg'
        });
      } finally {
        setIsLoadingStory(false);
      }
    };

    fetchStoryContent();
  }, []);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const data = await ApiService.getFounders();
        if (Array.isArray(data) && data.length > 0) {
          setFounders(
            data.map((f) => ({
              name: f.name || '',
              role: f.role || '',
              image: f.image_url || '/team/sarah.jpg',
              bio: f.bio || ''
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching founders:', error);
      }
    };

    fetchFounders();
  }, []);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const data = await ApiService.getLeadership();
        if (Array.isArray(data) && data.length > 0) {
          setTeam(
            data.map((l) => ({
              name: l.name || '',
              role: l.title || '',
              image: l.image_url || '/team/priya.jpg',
              bio: l.description || ''
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching leadership:', error);
      }
    };

    fetchLeadership();
  }, []);
  
  useEffect(() => {
    if (animateNumbers) {
      const counters = document.querySelectorAll('.animate-countup');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const duration = 3000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            if (target >= 1000000) {
              counter.textContent = Math.ceil(current / 1000000) + 'M+';
            } else if (target >= 1000) {
              counter.textContent = Math.ceil(current / 1000) + 'K+';
            } else {
              counter.textContent = Math.ceil(current) + (target >= 100 ? '%' : '+');
            }
            requestAnimationFrame(updateCounter);
          } else {
            if (target >= 1000000) {
              counter.textContent = (target / 1000000) + 'M+';
            } else if (target >= 1000) {
              counter.textContent = (target / 1000) + 'K+';
            } else {
              counter.textContent = target + (target >= 100 ? '%' : '+');
            }
          }
        };
        
        updateCounter();
      });
    }
  }, [animateNumbers]);
  
  const [founders, setFounders] = useState([
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/team/sarah.jpg",
      bio: "10+ years in sustainable agriculture and food industry. Passionate about connecting farmers with consumers."
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      image: "/team/michael.jpg",
      bio: "Tech visionary with expertise in e-commerce platforms and supply chain optimization."
    }
  ]);

  const [team, setTeam] = useState([
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      image: "/team/priya.jpg",
      bio: "Supply chain expert ensuring quality and freshness in every delivery"
    },
    {
      name: "David Kumar",
      role: "Head of Sourcing",
      image: "/team/david.jpg",
      bio: "Building relationships with local farmers and ensuring product quality"
    },
    {
      name: "Emma Williams",
      role: "Customer Experience Lead",
      image: "/team/emma.jpg",
      bio: "Dedicated to creating exceptional customer journeys and satisfaction"
    }
  ]);

  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Hero Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About FreshMart</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Delivering fresh, organic, and premium quality products straight to your doorstep since 2020. 
              We connect local farmers with conscious consumers who care about quality and sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              {isLoadingStory ? (
                <div className="space-y-4">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                </div>
              ) : (
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  {storyContent.description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              {isLoadingStory ? (
                <div className="aspect-square rounded-2xl skeleton" />
              ) : (
                <div className="aspect-square rounded-2xl overflow-hidden border border-black">
                  <img 
                    src={storyContent.image || '/images/farm-partnership.jpg'} 
                    alt="Our Story"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="400" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".3em" fill="%236b7280"%3EOur Story%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-black rounded-2xl p-6 text-center hover:border-black transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-[#266000]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600 text-sm">
                We source only the freshest and highest quality products from trusted suppliers
              </p>
            </div>
            
            <div className="border border-black rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-[#266000]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Focused</h3>
              <p className="text-gray-600 text-sm">
                Supporting local farmers and producers while building lasting relationships
              </p>
            </div>
            
            <div className="border border-black rounded-2xl p-6 text-center hover:border-black transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#266000]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Transparency</h3>
              <p className="text-gray-600 text-sm">
                Providing clear information about our products and sourcing practices
              </p>
            </div>
            
            <div className="border border-black rounded-2xl p-6 text-center hover:border-black transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-[#266000]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Ensuring your fresh products reach you quickly and in perfect condition
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Meet Our Founders</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            The visionaries who transformed a simple idea into a thriving marketplace connecting farmers and consumers
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {founders.map((founder, index) => (
              <div key={index} className="bg-white border border-black rounded-3xl p-8 text-center">
                <div className="w-32 h-32 rounded-full border border-black mx-auto mb-6 overflow-hidden">
                  <img 
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="128" height="128" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="64" cy="64" r="64" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-size="48" text-anchor="middle" dy=".3em" fill="%236b7280"%3E' + founder.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{founder.name}</h3>
                <p className="text-[#266000] font-semibold mb-4">{founder.role}</p>
                <p className="text-gray-600 leading-relaxed">{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Leadership Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full border border-black mx-auto mb-4 overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="128" height="128" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="64" cy="64" r="64" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-size="48" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E' + member.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-[#266000] font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="w-full py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#266000] rounded-2xl p-12 mx-auto" style={{width: '95%'}}>
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Impact</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-white mb-2 animate-countup" data-target="500">0</div>
                <div className="text-green-100">Local Farmers Supported</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2 animate-countup" data-target="50000">0</div>
                <div className="text-green-100">Happy Customers</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2 animate-countup" data-target="2000000">0</div>
                <div className="text-green-100">Products Delivered</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2 animate-countup" data-target="98">0%</div>
                <div className="text-green-100">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
