import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { guardianApi, GuardianType } from '../api/guardian';
import type { CreateSetupSessionDto } from '../api/guardian';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar, StepDots } from '../components/ui/ProgressBar';
import { ThresholdSelector } from '../components/ui/ThresholdSelector';
import { useSuccessAnimation } from '../components/ui/SuccessAnimation';

interface Guardian {
  type: GuardianType;
  contactInfo: string;
  name: string;
}

export const ImprovedGuardianSetup: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { triggerSuccess, SuccessComponent } = useSuccessAnimation();
  const [currentStep, setCurrentStep] = useState(0);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  
  // Smart default: 60% of guardians (recommended)
  const getDefaultThreshold = (totalGuardians: number) => {
    if (totalGuardians <= 3) return 2;
    return Math.ceil(totalGuardians * 0.6);
  };
  
  const [minimumAcceptances, setMinimumAcceptances] = useState(() => 
    getDefaultThreshold(guardians.length)
  );
  
  // Form state for adding guardian
  const [newGuardian, setNewGuardian] = useState<Guardian>({
    type: GuardianType.EMAIL,
    name: '',
    contactInfo: ''
  });

  const MIN_GUARDIANS = 3;

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSetupSessionDto) => guardianApi.createSetupSession(data),
    onSuccess: () => {
      triggerSuccess('Guardian invitations sent!');
      setTimeout(() => {
        navigate('/session-monitoring');
      }, 2000);
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create setup session');
    }
  });

  const handleAddGuardian = () => {
    if (newGuardian.name && newGuardian.contactInfo) {
      const newGuardians = [...guardians, newGuardian];
      setGuardians(newGuardians);
      // Update threshold to recommended default when guardians change
      setMinimumAcceptances(getDefaultThreshold(newGuardians.length));
      setNewGuardian({ type: GuardianType.EMAIL, name: '', contactInfo: '' });
      setIsAddingGuardian(false);
      
      // Auto-advance to next step if minimum met
      if (newGuardians.length >= MIN_GUARDIANS) {
        setTimeout(() => setCurrentStep(2), 500);
      }
    }
  };

  const handleRemoveGuardian = (index: number) => {
    const newGuardians = guardians.filter((_, i) => i !== index);
    setGuardians(newGuardians);
    // Update threshold to recommended default when guardians change
    if (newGuardians.length > 0) {
      setMinimumAcceptances(getDefaultThreshold(newGuardians.length));
    }
  };

  const handleSubmit = () => {
    const data: CreateSetupSessionDto = {
      guardians: guardians,
      minimumAcceptances: Math.min(minimumAcceptances, guardians.length),
      sessionMessage: 'Please help me secure my wallet'
    };
    createSessionMutation.mutate(data);
  };

  const getContactPlaceholder = (type: GuardianType) => {
    switch (type) {
      case GuardianType.EMAIL:
        return 'email@example.com';
      case GuardianType.PHONE:
        return '+1234567890';
      case GuardianType.WALLET:
        return '0x...';
      default:
        return '';
    }
  };

  const steps = [
    {
      title: 'Welcome',
      component: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center px-6"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">🛡️</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Secure Your Wallet with Guardians
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-xs">
            Replace complex seed phrases with trusted friends & family
          </p>
          
          <Button 
            onClick={() => setCurrentStep(1)} 
            size="lg"
            icon="→"
            fullWidth
          >
            Get Started
          </Button>
        </motion.div>
      )
    },
    {
      title: 'Add Guardians',
      component: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          {/* Compact Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Add Your Guardians</h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-600">
                {guardians.length} of {MIN_GUARDIANS} minimum
              </p>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      i <= guardians.length ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Guardian List - Expandable */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <div className="space-y-2">
              <AnimatePresence>
                {guardians.map((guardian, index) => (
                  <motion.div
                    key={`${guardian.contactInfo}-${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        guardian.type === GuardianType.EMAIL ? 'bg-blue-100' :
                        guardian.type === GuardianType.PHONE ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {guardian.type === GuardianType.EMAIL ? '📧' :
                         guardian.type === GuardianType.PHONE ? '📱' : '🔐'}
                      </div>
                      <div className="flex-1 ml-3 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{guardian.name}</p>
                        <p className="text-sm text-gray-500 truncate">{guardian.contactInfo}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveGuardian(index)}
                        className="ml-2 w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <AnimatePresence mode="wait">
              {isAddingGuardian ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-3"
                >
                  {/* Form Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">New Guardian</h3>
                    <button
                      onClick={() => {
                        setIsAddingGuardian(false);
                        setNewGuardian({ name: '', type: GuardianType.EMAIL, contactInfo: '' });
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Compact Form */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newGuardian.name}
                      onChange={(e) => setNewGuardian({ ...newGuardian, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Guardian Name"
                      autoFocus
                    />
                    
                    {/* Horizontal Type Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {[
                        { value: GuardianType.EMAIL, label: 'Email', icon: '📧' },
                        { value: GuardianType.PHONE, label: 'Phone', icon: '📱' },
                        { value: GuardianType.WALLET, label: 'Wallet', icon: '🔐' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewGuardian({ ...newGuardian, type: type.value })}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 whitespace-nowrap transition-all min-w-max ${
                            newGuardian.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <span className="text-lg">{type.icon}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Contact Input */}
                    <input
                      type={newGuardian.type === GuardianType.EMAIL ? 'email' : 
                           newGuardian.type === GuardianType.PHONE ? 'tel' : 'text'}
                      value={newGuardian.contactInfo}
                      onChange={(e) => setNewGuardian({ ...newGuardian, contactInfo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={getContactPlaceholder(newGuardian.type)}
                    />

                    <Button
                      onClick={handleAddGuardian}
                      disabled={!newGuardian.name || !newGuardian.contactInfo}
                      fullWidth
                      size="lg"
                    >
                      Add Guardian
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-2"
                >
                  {guardians.length < MIN_GUARDIANS ? (
                    <>
                      <Button
                        onClick={() => setIsAddingGuardian(true)}
                        fullWidth
                        size="lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Guardian
                      </Button>
                      <button
                        onClick={() => setCurrentStep(0)}
                        className="w-full text-center text-gray-500 text-sm hover:text-gray-700 py-2"
                      >
                        ← Back to Email
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        fullWidth
                        size="lg"
                      >
                        Continue → ({guardians.length} guardians)
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setIsAddingGuardian(true)}
                          variant="outline"
                          fullWidth
                        >
                          Add More
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentStep(0)}
                          fullWidth
                        >
                          ← Email
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )
    },
    {
      title: 'Choose Security',
      component: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-4"
        >
          <ThresholdSelector
            totalGuardians={guardians.length}
            threshold={minimumAcceptances}
            onThresholdChange={setMinimumAcceptances}
          />

          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(1)}
              fullWidth
            >
              ← Edit Guardians
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              fullWidth
            >
              Continue →
            </Button>
          </div>
        </motion.div>
      )
    },
    {
      title: 'Review & Send',
      component: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-4"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Review Your Setup
            </h2>
            <p className="text-gray-600">
              Confirm your guardians before sending invitations
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {guardians.map((guardian, index) => (
              <Card key={index} padding="sm">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {guardian.type === GuardianType.EMAIL ? '📧' : 
                     guardian.type === GuardianType.PHONE ? '📱' : '🔐'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{guardian.name}</p>
                    <p className="text-sm text-gray-600">{guardian.contactInfo}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Card className="bg-green-50 border-green-200 mb-6">
            <div className="flex items-center space-x-2 text-green-800">
              <span className="text-xl">✓</span>
              <div>
                <p className="font-medium">{guardians.length} guardians will secure your wallet</p>
                <p className="text-sm">You'll need at least {minimumAcceptances} to recover</p>
              </div>
            </div>
          </Card>
          
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              loading={createSessionMutation.isPending}
              fullWidth
              size="lg"
            >
              Send Invitations
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(2)}
              fullWidth
              disabled={createSessionMutation.isPending}
            >
              ← Edit Security
            </Button>
          </div>
        </motion.div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Clean Progress Header with Close */}
      {currentStep > 0 && (
        <div className="px-4 py-3 border-b border-gray-100 bg-white relative">
          {/* Close button - top right */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center mb-3 pr-8">
            <h1 className="text-lg font-semibold text-gray-900">
              Guardian Setup
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep} of {steps.length - 1}
            </p>
          </div>
          
          <ProgressBar value={(currentStep / (steps.length - 1)) * 100} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="h-full"
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Compact Step Dots */}
      {currentStep > 0 && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <StepDots 
            totalSteps={steps.length} 
            currentStep={currentStep + 1}
          />
        </div>
      )}

      {/* Success Animation */}
      <SuccessComponent />
    </div>
  );
};