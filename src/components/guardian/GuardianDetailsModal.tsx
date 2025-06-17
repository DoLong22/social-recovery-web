import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface GuardianDetailsProps {
  guardian: {
    id: string;
    name: string;
    type: 'EMAIL' | 'PHONE' | 'WALLET';
    contactInfo: string;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
    healthScore?: number;
    lastActive?: string;
    verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  onSendTest: () => void;
  onRemove: () => void;
}

const GUARDIAN_TYPE_CONFIG = {
  EMAIL: { icon: '📧', label: 'Email Guardian' },
  PHONE: { icon: '📱', label: 'Phone Guardian' },
  WALLET: { icon: '🔐', label: 'Wallet Guardian' }
};

export const GuardianDetailsModal: React.FC<GuardianDetailsProps> = ({
  guardian,
  isOpen,
  onClose,
  onVerify,
  onSendTest,
  onRemove
}) => {
  if (!guardian) return null;

  const typeConfig = GUARDIAN_TYPE_CONFIG[guardian.type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe-bottom"
          >
            <Card className="max-w-lg mx-auto mb-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 -m-6 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">{typeConfig.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{guardian.name}</h3>
                    <p className="text-blue-100">{typeConfig.label}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <DetailRow label="Contact" value={guardian.contactInfo} />
                  <DetailRow label="Status" value={
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      guardian.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      guardian.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {guardian.status}
                    </span>
                  } />
                  <DetailRow label="Verification" value={
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      guardian.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                      guardian.verificationStatus === 'UNVERIFIED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {guardian.verificationStatus}
                    </span>
                  } />
                  <DetailRow label="Health Score" value={
                    guardian.healthScore ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              guardian.healthScore >= 80 ? 'bg-green-500' :
                              guardian.healthScore >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${guardian.healthScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{guardian.healthScore}%</span>
                      </div>
                    ) : 'No data'
                  } />
                  <DetailRow label="Last Active" value={guardian.lastActive || 'Never'} />
                </div>

                {/* Activity Log */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <ActivityItem time="2 hours ago" action="Health check passed" />
                    <ActivityItem time="1 day ago" action="Verified identity" />
                    <ActivityItem time="3 days ago" action="Added as guardian" />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  {guardian.verificationStatus === 'UNVERIFIED' && (
                    <Button onClick={onVerify} fullWidth>
                      Verify Guardian
                    </Button>
                  )}
                  
                  <Button onClick={onSendTest} variant="secondary" fullWidth>
                    Send Test Message
                  </Button>
                  
                  <Button onClick={onRemove} variant="danger" fullWidth>
                    Remove Guardian
                  </Button>
                  
                  <Button onClick={onClose} variant="ghost" fullWidth>
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 text-sm">{label}</span>
    <div className="text-gray-900 font-medium text-sm">{value}</div>
  </div>
);

const ActivityItem: React.FC<{ time: string; action: string }> = ({ time, action }) => (
  <div className="flex justify-between items-center text-gray-600">
    <span>{action}</span>
    <span className="text-xs">{time}</span>
  </div>
);