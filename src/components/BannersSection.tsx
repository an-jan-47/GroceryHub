
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const BannersSection = () => {
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  if (!banners || banners.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-orange-100 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800">{banner.title}</h3>
            {banner.subtitle && (
              <p className="text-orange-600 text-sm">{banner.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannersSection;
