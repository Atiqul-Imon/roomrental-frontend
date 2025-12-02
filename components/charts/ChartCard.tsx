'use client';

import { ReactNode, useState } from 'react';
import { Download, MoreVertical } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  description?: string;
  onExport?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  children,
  description,
  onExport,
  actions,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-dark-text-primary">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-dark-text-muted mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Tooltip content="Export chart">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

