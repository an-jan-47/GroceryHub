
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Truck, Headphones, Star, Globe, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const AboutUs = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden shadow-lg mb-8">
          <div className="p-8 md:p-12 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About ShopNexus</h1>
            <p className="text-lg md:text-xl opacity-90 md:w-3/4">
              We're revolutionizing online shopping by connecting people with quality products from around the globe.
            </p>
          </div>
        </div>
        
        {/* Our Story */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            Founded in 2023, ShopNexus began with a simple idea: make quality products accessible to everyone, everywhere. 
            What started as a small operation with just five team members has grown into a thriving marketplace connecting 
            thousands of sellers with millions of customers worldwide.
          </p>
          <p className="text-gray-700">
            Our journey hasn't always been easy, but our commitment to quality, transparency, and customer satisfaction 
            has remained unwavering. Today, we're proud to be one of the fastest growing e-commerce platforms, 
            with operations spanning across 25 countries and a community of over 10,000 trusted sellers.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">25+</p>
              <p className="text-sm text-gray-600">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">10K+</p>
              <p className="text-sm text-gray-600">Sellers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">5M+</p>
              <p className="text-sm text-gray-600">Customers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">20M+</p>
              <p className="text-sm text-gray-600">Products</p>
            </div>
          </div>
        </div>
        
        {/* Our Values */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trust & Quality</h3>
              <p className="text-gray-600">We rigorously vet all sellers and products to ensure our customers receive only the highest quality items.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reliability</h3>
              <p className="text-gray-600">From secure payment processing to efficient delivery, we ensure a seamless experience every time.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Headphones className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer First</h3>
              <p className="text-gray-600">We believe in putting our customers first with responsive support and hassle-free returns.</p>
            </div>
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">
                "ShopNexus has completely transformed how I shop online. The quality of products and customer service is unmatched!"
              </p>
              <p className="font-semibold">Sarah J.</p>
              <p className="text-sm text-gray-500">Loyal customer since 2023</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">
                "As a small business owner, partnering with ShopNexus was the best decision I made. My sales have increased tenfold in just six months!"
              </p>
              <p className="font-semibold">Michael D.</p>
              <p className="text-sm text-gray-500">Partner seller since 2024</p>
            </div>
          </div>
        </div>
        
        {/* Our Team */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Our Leadership Team</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {name: 'Alex Johnson', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'},
              {name: 'Mia Williams', role: 'COO', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'},
              {name: 'David Chen', role: 'CTO', img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'},
              {name: 'Sophia Garcia', role: 'CMO', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Our Headquarters</p>
                <p className="text-gray-600">123 Commerce Street</p>
                <p className="text-gray-600">San Francisco, CA 94103</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-gray-600">support@shopnexus.com</p>
                <p className="text-gray-600">partners@shopnexus.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Globe className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Follow Us</p>
                <div className="flex items-center space-x-3 mt-2">
                  <a href="#" className="text-gray-600 hover:text-blue-600">Facebook</a>
                  <Separator orientation="vertical" className="h-4" />
                  <a href="#" className="text-gray-600 hover:text-blue-600">Twitter</a>
                  <Separator orientation="vertical" className="h-4" />
                  <a href="#" className="text-gray-600 hover:text-blue-600">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AboutUs;
