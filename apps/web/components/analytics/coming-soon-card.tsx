'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LucideIcon } from 'lucide-react';

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function ComingSoonCard({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = "text-gray-500" 
}: ComingSoonCardProps) {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Clock className="h-12 w-12 text-gray-300" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="font-medium text-gray-600 mb-2">À venir</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
