import React from 'react';
import ServiceCard from './ServiceCard';

const services = [
  {
    title: "Salon for Women",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035",
    rating: 4.8,
    price: "₹299",
    description: "Haircut, facial, waxing & more",
    provider: {
      name: "Glamour Beauty Salon",
      phone: "+91 98765 43210",
      availability: ["10:00 AM - 1:00 PM", "2:00 PM - 8:00 PM"],
      location: "Sector 18, Noida"
    }
  },
  {
    title: "Appliance Repair",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780",
    rating: 4.7,
    price: "₹199",
    description: "AC, washing machine, refrigerator repair",
    provider: {
      name: "Quick Fix Appliances",
      phone: "+91 98765 43211",
      availability: ["9:00 AM - 6:00 PM"],
      location: "Indirapuram, Ghaziabad"
    }
  },
  {
    title: "Home Cleaning",
    image: "https://images.unsplash.com/photo-1527515545081-5db817172677",
    rating: 4.9,
    price: "₹399",
    description: "Professional home deep cleaning",
    provider: {
      name: "CleanPro Services",
      phone: "+91 98765 43212",
      availability: ["8:00 AM - 5:00 PM"],
      location: "Vasant Kunj, Delhi"
    }
  },
  {
    title: "Plumbing Services",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39",
    rating: 4.6,
    price: "₹149",
    description: "Leakages, installations & repairs",
    provider: {
      name: "City Plumbers",
      phone: "+91 98765 43213",
      availability: ["9:00 AM - 7:00 PM"],
      location: "Dwarka, Delhi"
    }
  },
  {
    title: "Electrician",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
    rating: 4.8,
    price: "₹199",
    description: "Wiring, repairs & installations",
    provider: {
      name: "PowerFix Electric",
      phone: "+91 98765 43214",
      availability: ["8:00 AM - 8:00 PM"],
      location: "Greater Noida"
    }
  },
  {
    title: "Carpenter",
    image: "https://images.unsplash.com/photo-1601058268499-e52658b8bb88",
    rating: 4.7,
    price: "₹299",
    description: "Furniture repair & assembly",
    provider: {
      name: "WoodCraft Solutions",
      phone: "+91 98765 43215",
      availability: ["10:00 AM - 6:00 PM"],
      location: "Noida Extension"
    }
  },
  {
    title: "Pest Control",
    image: "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVzdCUyMGNvbnRyb2x8ZW58MHx8MHx8fDA%3D",
    rating: 4.9,
    price: "₹499",
    description: "Complete home pest control",
    provider: {
      name: "SafeHome Pest Control",
      phone: "+91 98765 43216",
      availability: ["9:00 AM - 5:00 PM"],
      location: "Ghaziabad"
    }
  },
  {
    title: "Painting Services",
    image: "https://media.istockphoto.com/id/509040406/photo/painter-painting-a-wall-with-paint-roller.webp?a=1&b=1&s=612x612&w=0&k=20&c=kw8V0A7N1baeODixME-ofLXIWStvq3oG1Oc32Ao6_ac=",
    rating: 4.8,
    price: "₹999",
    description: "Interior & exterior painting",
    provider: {
      name: "ColorPro Painters",
      phone: "+91 98765 43217",
      availability: ["8:00 AM - 6:00 PM"],
      location: "South Delhi"
    }
  }
];

const PopularServices = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularServices;