import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { guardianApi, GuardianType } from '../api/guardian';
import type { CreateSetupSessionDto } from '../api/guardian';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ProgressBar, StepDots } from '../components/ui/ProgressBar';
import { GuardianTypeSelector } from '../components/ui/GuardianTypeChip';
import { GuardianCard } from '../components/guardian/GuardianCard';
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
  const progress = (guardians.length / MIN_GUARDIANS) * 100;

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
          className="px-6 py-4"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Add Your Guardians
            </h2>
            <p className="text-gray-600">
              Add at least {MIN_GUARDIANS} trusted contacts who can help you recover your wallet
            </p>
          </div>

          <ProgressBar 
            value={progress} 
            showPercentage={true}
            className="mb-6"
          />

          {/* Guardian List */}
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            <AnimatePresence>
              {guardians.map((guardian, index) => (
                <GuardianCard
                  key={index}
                  {...guardian}
                  index={index}
                  onRemove={() => handleRemoveGuardian(index)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Add Guardian Form */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="space-y-4">
              <Input
                label="Guardian Name"
                value={newGuardian.name}
                onChange={(e) => setNewGuardian({ ...newGuardian, name: e.target.value })}
                placeholder="John Doe"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Type
                </label>
                <GuardianTypeSelector
                  selectedType={newGuardian.type}
                  onTypeSelect={(type) => setNewGuardian({ ...newGuardian, type })}
                />
              </div>
              
              <Input
                label="Contact Information"
                value={newGuardian.contactInfo}
                onChange={(e) => setNewGuardian({ ...newGuardian, contactInfo: e.target.value })}
                placeholder={getContactPlaceholder(newGuardian.type)}
              />
              
              <Button
                onClick={handleAddGuardian}
                variant="secondary"
                fullWidth
                disabled={!newGuardian.name || !newGuardian.contactInfo}
              >
                + Add Guardian
              </Button>
            </div>
          </Card>

          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(0)}
              fullWidth
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={guardians.length < MIN_GUARDIANS}
              fullWidth
            >
              Continue →
            </Button>
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
              Back
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
              ← Back to Edit
            </Button>
          </div>
        </motion.div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Progress Header */}
      {currentStep > 0 && (
        <div className="px-6 pt-safe-top pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Guardian Setup
            </h1>
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
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

      {/* Step Dots */}
      <div className="p-6 pb-safe-bottom">
        <StepDots 
          totalSteps={steps.length} 
          currentStep={currentStep + 1}
        />
      </div>

      {/* Success Animation */}
      <SuccessComponent />
    </div>
  );
};