'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon } from '@heroicons/react/24/outline';

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: string;
}

export function ComingSoonCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-gray-500 dark:text-gray-400"
}: ComingSoonCardProps) {
  return (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600" role="article" aria-labelledby="coming-soon-title">
      <CardHeader>
        <CardTitle id="coming-soon-title" className="flex items-center gap-2 text-light-text dark:text-dark-text">
          <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-light-textSecondary dark:text-dark-textSecondary py-8" role="status" aria-label="Fonctionnalité à venir">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <ClockIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden="true" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-400 dark:bg-orange-300 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="font-medium text-light-text dark:text-dark-text mb-2">À venir</p>
          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
