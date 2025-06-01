
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, Globe, Building } from 'lucide-react';
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About GroceryHub</h1>
            <p className="text-lg md:text-xl opacity-90 md:w-3/4">
            "जहां सुविधा और गुणवत्ता मिलती है" <p></p>
            Where convenience and quality meet.
            </p>
          </div>
        </div>
        
        
        
        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Visit Us</p>
                <p className="text-gray-600">123 Commerce Street</p>
                <p className="text-gray-600">San Francisco, CA 94103</p>
                <p className="text-gray-600 mt-1">Mon-Fri: 9AM-6PM PT</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-gray-600">support@shopnexus.com</p>
                <p className="text-gray-600">partners@shopnexus.com</p>
                <p className="text-gray-600 mt-1">Response within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Globe className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Connect With Us</p>
                <div className="flex items-center space-x-3 mt-2">
                  <a href="#" className="text-gray-600 hover:text-blue-600">Facebook</a>
                  <Separator orientation="vertical" className="h-4" />
                  <a href="#" className="text-gray-600 hover:text-blue-600">Twitter</a>
                  <Separator orientation="vertical" className="h-4" />
                  <a href="#" className="text-gray-600 hover:text-blue-600">Instagram</a>
                </div>
                <p className="text-gray-600 mt-3">Follow us for updates and promotions</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-500">
              Have questions or feedback? We'd love to hear from you! 
              Our customer support team is available 24/7 to assist you.
            </p>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AboutUs;
