import { Heart, Leaf, Shield, Truck } from "lucide-react";
import ApiService from "@/lib/api";
import ImpactStatsClient from "@/components/about/ImpactStatsClient";
import ImageWithFallback from "@/components/about/ImageWithFallback";

export const metadata = {
  title: "About Tulsi | Indian Grocery Store in Ghent",
  description:
    "Learn about Tulsi, our story, founders, and commitment to authentic Indian groceries in Ghent. Fresh products, trusted suppliers, and friendly service."
};

type Founder = { name: string; role: string; image: string; bio: string };
type Leader = { name: string; role: string; image: string; bio: string };

const defaultStory = {
  description: `Tulsi is a Belgium-based Indian grocery store in Ghent, created to bring the real taste of India to your kitchen. 
        From spices and basmati rice to snacks and traditional ingredients, we curate a wide range of authentic products for everyday cooking.
        
        What began as a small local shop has grown into a trusted online destination so families across Belgium can access familiar staples with ease. 
        Our focus is freshness, fair pricing, and a friendly shopping experience.
        
        Today, Tulsi partners with reliable suppliers and regional distributors to keep shelves stocked and deliveries quick, while maintaining the care 
        and attention you expect from a neighborhood store.`,
  image: "/images/farm-partnership.jpg"
};

export default async function AboutPage() {
  let storyContent = defaultStory;
  try {
    const story = await ApiService.getAboutStory();
    if (story) {
      storyContent = {
        description: story.description || defaultStory.description,
        image: story.image_url || defaultStory.image
      };
    }
  } catch {
    storyContent = defaultStory;
  }

  let founders: Founder[] = [
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
  ];
  try {
    const data = await ApiService.getFounders();
    if (Array.isArray(data) && data.length > 0) {
      founders = data.map((f: any) => ({
        name: f.name || "",
        role: f.role || "",
        image: f.image_url || "/team/sarah.jpg",
        bio: f.bio || ""
      }));
    }
  } catch {
    // keep defaults
  }

  let team: Leader[] = [];
  try {
    const data = await ApiService.getLeadership();
    if (Array.isArray(data) && data.length > 0) {
      team = data.map((l: any) => ({
        name: l.name || "",
        role: l.title || "",
        image: l.image_url || "/team/priya.jpg",
        bio: l.description || ""
      }));
    }
  } catch {
    team = [];
  }

  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Hero Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About Tulsi</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tulsi is a Belgium-based Indian grocery store in Ghent, offering authentic Indian essentials and a friendly shopping experience.
              Shop in-store or online for spices, grains, snacks, and daily staples you trust.
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
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {storyContent.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden border border-black">
                <ImageWithFallback
                  src={storyContent.image || "/images/farm-partnership.jpg"}
                  alt="Our Story"
                  className="w-full h-full object-cover"
                  fallbackSvg="data:image/svg+xml,%3Csvg width=&quot;400&quot; height=&quot;400&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Crect width=&quot;400&quot; height=&quot;400&quot; fill=&quot;%23f3f4f6&quot;/%3E%3Ctext x=&quot;50%25&quot; y=&quot;50%25&quot; font-size=&quot;18&quot; text-anchor=&quot;middle&quot; dy=&quot;.3em&quot; fill=&quot;%236b7280&quot;%3EOur Story%3C/text%3E%3C/svg%3E"
                />
              </div>
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
                  <ImageWithFallback
                    src={founder.image}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                    fallbackSvg={`data:image/svg+xml,%3Csvg width=&quot;128&quot; height=&quot;128&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Ccircle cx=&quot;64&quot; cy=&quot;64&quot; r=&quot;64&quot; fill=&quot;%23e5e7eb&quot;/%3E%3Ctext x=&quot;50%25&quot; y=&quot;50%25&quot; font-size=&quot;48&quot; text-anchor=&quot;middle&quot; dy=&quot;.3em&quot; fill=&quot;%236b7280&quot;%3E${founder.name.charAt(0)}%3C/text%3E%3C/svg%3E`}
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

      {team.length > 0 && (
        <section className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Leadership Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 rounded-full border border-black mx-auto mb-4 overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      fallbackSvg={`data:image/svg+xml,%3Csvg width=&quot;128&quot; height=&quot;128&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Ccircle cx=&quot;64&quot; cy=&quot;64&quot; r=&quot;64&quot; fill=&quot;%23f3f4f6&quot;/%3E%3Ctext x=&quot;50%25&quot; y=&quot;50%25&quot; font-size=&quot;48&quot; text-anchor=&quot;middle&quot; dy=&quot;.3em&quot; fill=&quot;%239ca3af&quot;%3E${member.name.charAt(0)}%3C/text%3E%3C/svg%3E`}
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
      )}

      {/* Our Impact Section */}
      <section className="w-full py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#266000] rounded-2xl p-12 mx-auto" style={{ width: "95%" }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">Our Impact</h2>

            <ImpactStatsClient
              stats={[
                { target: 18, label: "Local Suppliers Partnered" },
                { target: 1200, label: "Orders Delivered Fresh" },
                { target: 600, label: "Repeat Weekly Customers" },
                { target: 24, label: "Neighborhood Jobs Created" }
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
