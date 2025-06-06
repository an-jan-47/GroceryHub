
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Phone, Mail, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useNavigationGestures } from '@/hooks/useNavigationGestures';

const HelpSupport = () => {
  // Add navigation gestures
  useNavigationGestures();

  const supportPhone = "+91-9876543210";
  const supportEmail = "support@groceryhub.com";
  const whatsappNumber = "919876543210"; // Without + or spaces for WhatsApp link

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast(`Failed to copy ${label}`);
    }
  };

  const openPhone = () => {
    copyToClipboard(supportPhone, "Phone number");
    window.open(`tel:${supportPhone}`, '_self');
  };

  const openEmail = () => {
    copyToClipboard(supportEmail, "Email address");
    window.open(`mailto:${supportEmail}`, '_self');
  };

  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello, I need help with my GroceryHub order.`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <Header />
      
      <main className="container px-4 py-4 mx-auto max-w-2xl">
        <div className="py-3 flex items-center">
          <Link to="/profile" className="flex items-center text-gray-500">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Profile</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
        
        <div className="space-y-4">
          {/* Phone Support */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={openPhone}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Call Us</h3>
                    <p className="text-gray-600">{supportPhone}</p>
                    <p className="text-sm text-gray-500">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(supportPhone, "Phone number");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Support */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={openEmail}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Us</h3>
                    <p className="text-gray-600">{supportEmail}</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(supportEmail, "Email address");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Support */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={openWhatsApp}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">WhatsApp Chat</h3>
                    <p className="text-gray-600">Start a conversation</p>
                    <p className="text-sm text-gray-500">Quick response guaranteed</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">How can I track my order?</h4>
                  <p className="text-sm text-gray-600">You can track your order from the "My Orders" section in your profile.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">What is your return policy?</h4>
                  <p className="text-sm text-gray-600">We accept returns within 7 days of delivery for non-perishable items.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">How do I cancel my order?</h4>
                  <p className="text-sm text-gray-600">You can cancel your order before it's shipped from the order details page.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">What payment methods do you accept?</h4>
                  <p className="text-sm text-gray-600">We accept cash on delivery, credit/debit cards, and digital wallets through Razorpay.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4">Support Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday - Sunday</span>
                  <span className="font-medium">10:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Support</span>
                  <span className="font-medium">24/7 Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default HelpSupport;
