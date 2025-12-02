'use client';

import { useState } from 'react';
import { Trash2, CheckCircle, XCircle, Download, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'danger' | 'secondary';
  action: (selectedIds: string[]) => Promise<void> | void;
  confirmMessage?: string;
}

interface BulkActionsProps {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
  totalCount?: number;
}

export function BulkActions({
  selectedIds,
  actions,
  onClearSelection,
  totalCount,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  if (selectedIds.length === 0) return null;

  const handleAction = async (action: BulkAction) => {
    if (action.confirmMessage) {
      setConfirmAction(action);
    } else {
      await executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction) => {
    setIsProcessing(true);
    try {
      await action.action(selectedIds);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-dark-bg-secondary border border-dark-border-default rounded-xl shadow-dark-xl p-4 flex items-center gap-4">
          <Badge variant="primary" size="lg">
            {selectedIds.length} selected
            {totalCount && ` of ${totalCount}`}
          </Badge>

          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={() => handleAction(action)}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title="Confirm Action"
        >
          <div className="space-y-4">
            <p className="text-dark-text-secondary">
              {confirmAction.confirmMessage || `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedIds.length} item(s)?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
              <Button
                variant={confirmAction.variant}
                onClick={() => executeAction(confirmAction)}
                isLoading={isProcessing}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

