'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { 
  User, 
  Building2, 
  MessageSquare, 
  Shield, 
  Trash2, 
  Edit, 
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export interface ActivityLogEntry {
  id: string;
  type: 'user' | 'listing' | 'review' | 'admin' | 'system';
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout';
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: Date | string;
  details?: string;
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  activities: ActivityLogEntry[];
  isLoading?: boolean;
  limit?: number;
}

const actionIcons = {
  create: CheckCircle,
  update: Edit,
  delete: Trash2,
  approve: CheckCircle,
  reject: XCircle,
  login: CheckCircle,
  logout: XCircle,
};

const actionColors = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  approve: 'success',
  reject: 'danger',
  login: 'success',
  logout: 'warning',
} as const;

const typeIcons = {
  user: User,
  listing: Building2,
  review: MessageSquare,
  admin: Shield,
  system: AlertCircle,
};

export function ActivityLog({ activities, isLoading, limit }: ActivityLogProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const displayActivities = limit ? activities.slice(0, limit) : activities;

  if (displayActivities.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-dark-text-secondary py-8">No activity logs</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-dark-text-primary">
          Recent Activity
          {limit && <span className="text-sm text-dark-text-muted ml-2">({displayActivities.length})</span>}
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const ActionIcon = actionIcons[activity.action] || AlertCircle;
            const TypeIcon = typeIcons[activity.type] || AlertCircle;
            const actionColor = actionColors[activity.action] || 'default';

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-dark-bg-tertiary rounded-lg hover:bg-dark-bg-elevated transition-colors"
              >
                <div className={`p-2 rounded-lg bg-${actionColor === 'success' ? 'green' : actionColor === 'danger' ? 'red' : actionColor === 'warning' ? 'warning' : 'blue'}-500/20`}>
                  <ActionIcon className={`w-5 h-5 text-${actionColor === 'success' ? 'green' : actionColor === 'danger' ? 'red' : actionColor === 'warning' ? 'warning' : 'blue'}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeIcon className="w-4 h-4 text-dark-text-muted" />
                    <span className="font-medium text-dark-text-primary">
                      {activity.userName}
                    </span>
                    <Badge variant={actionColor as any} size="sm">
                      {activity.action}
                    </Badge>
                    <span className="text-sm text-dark-text-muted">
                      {activity.entity}
                    </span>
                  </div>
                  {activity.details && (
                    <p className="text-sm text-dark-text-secondary mb-1">
                      {activity.details}
                    </p>
                  )}
                  <p className="text-xs text-dark-text-muted">
                    {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

