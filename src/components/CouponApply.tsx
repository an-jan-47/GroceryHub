
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Check, Copy } from 'lucide-react';

interface CouponApplyProps {
  couponCode: string;
  description: string;
  onApply: (code: string) => void;
}

const CouponApply = ({ couponCode, description, onApply }: CouponApplyProps) => {
  const [applied, setApplied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      toast('Coupon code copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleApply = () => {
    onApply(couponCode);
    setApplied(true);
    toast('Coupon applied successfully!');
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-lg">{couponCode}</span>
          <Button 
            onClick={handleCopy} 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      
      <Button 
        onClick={handleApply}
        disabled={applied}
        className="w-full"
        variant={applied ? "secondary" : "default"}
      >
        {applied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Applied
          </>
        ) : (
          'Apply Coupon'
        )}
      </Button>
    </div>
  );
};

export default CouponApply;
