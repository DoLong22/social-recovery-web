import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { guardianApi, GuardianType } from '../api/guardian';
import type { CreateSetupSessionDto } from '../api/guardian';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { ModernButton } from '../components/ui/ModernButton';
import { AnimatedShield } from '../components/ui/AnimatedShield';
import { Card } from '../components/ui/Card';
import { ProgressBar, StepDots } from '../components/ui/ProgressBar';
import { COLORS } from '../constants/design-system';
import { GRADIENTS, MODERN_COLORS, SHADOWS, MODERN_TYPOGRAPHY } from '../constants/modern-design-system';
import { useAuth } from '../contexts/AuthContext';
import { EnhancedThresholdSelector } from '../components/ui/EnhancedThresholdSelector';
import { EnhancedReviewSetup } from '../components/ui/EnhancedReviewSetup';
import { useSuccessAnimation } from '../components/ui/SuccessAnimation';
import { GuardianProgressSlots } from '../components/ui/GuardianProgressSlots';
import { ModernGuardianTypeSelector } from '../components/ui/ModernGuardianTypeSelector';
import { ModernGuardianCard } from '../components/ui/ModernGuardianCard';
import { HelpTooltip } from '../components/ui/HelpTooltip';
import { validateEmail, validatePhoneNumber, validateWalletAddress, formatPhoneNumber } from '../utils/validation';
import { Mail, Phone, Wallet, Shield, AlertCircle } from 'lucide-react';

interface Guardian {
  type: GuardianType;
  contactInfo: string;
  name: string;
}

// Auto-inject email list for testing
const AUTO_INJECT_EMAILS = [
  { email: 'doduclong2208@gmail.com', name: 'Long Do' },
  { email: 'longpeo2208@gmail.com', name: 'Long Peo' },
  { email: 'doduclong8022@gmail.com', name: 'Long 8022' },
];

export const ImprovedGuardianSetup: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { email } = useAuth();
  const { triggerSuccess, SuccessComponent } = useSuccessAnimation();
  // Start directly with Add Guardians step (skip welcome)
  const [currentStep, setCurrentStep] = useState(1); // Start with Add Guardians
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  const [autoInjectIndex, setAutoInjectIndex] = useState(0);

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
    contactInfo: '',
  });
  
  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  const MIN_GUARDIANS = 3;

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSetupSessionDto) =>
      guardianApi.createSetupSession(data),
    onSuccess: () => {
      triggerSuccess('Guardian invitations sent!');
      setTimeout(() => {
        navigate('/session-monitoring');
      }, 2000);
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create setup session');
    },
  });

  const handleAddGuardian = () => {
    // Reset validation error
    setValidationError('');
    
    // Validate name
    if (!newGuardian.name.trim()) {
      setValidationError('Guardian name is required');
      return;
    }
    
    // Validate contact info based on type
    let validation = { valid: false, error: '' };
    switch (newGuardian.type) {
      case GuardianType.EMAIL:
        validation = validateEmail(newGuardian.contactInfo);
        break;
      case GuardianType.PHONE:
        validation = validatePhoneNumber(newGuardian.contactInfo);
        break;
      case GuardianType.WALLET:
        validation = validateWalletAddress(newGuardian.contactInfo);
        break;
    }
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid contact information');
      return;
    }
    
    // Check for duplicates
    const isDuplicate = guardians.some(g => 
      g.type === newGuardian.type && 
      g.contactInfo.toLowerCase() === newGuardian.contactInfo.toLowerCase()
    );
    
    if (isDuplicate) {
      setValidationError('This guardian has already been added');
      return;
    }
    
    // Add guardian
    const newGuardians = [...guardians, newGuardian];
    setGuardians(newGuardians);
    // Update threshold to recommended default when guardians change
    setMinimumAcceptances(getDefaultThreshold(newGuardians.length));
    setNewGuardian({ type: GuardianType.EMAIL, name: '', contactInfo: '' });
    setIsAddingGuardian(false);
    setValidationError('');
    
    // Move to next auto-inject email
    if (autoInjectIndex < AUTO_INJECT_EMAILS.length) {
      setAutoInjectIndex(autoInjectIndex + 1);
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
      sessionMessage: 'Please help me secure my wallet',
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

  // Define step titles for dynamic header
  const stepTitles = [
    { number: 1, purpose: 'Add Your Guardians' },
    { number: 2, purpose: 'Choose Recovery Rule' },
    { number: 3, purpose: 'Review & Send Invites' }
  ];

  const steps = [
    {
      title: 'Add Guardians',
      component: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className='flex flex-col h-full'
        >
          {/* Compact Header with Gradient */}
          <div 
            className='px-4 py-4 border-b border-gray-100'
            style={{
              background: GRADIENTS.modalHeader,
            }}
          >
            <div className='flex items-center justify-between'>
              <GuardianProgressSlots 
                current={guardians.length} 
                minimum={MIN_GUARDIANS}
                maximum={5}
              />
              <HelpTooltip 
                title="What are guardians?"
                content="Guardians are trusted contacts who store encrypted pieces of your recovery key. They cannot access your wallet alone - multiple guardians must cooperate to help you recover access."
              />
            </div>
          </div>

          {/* Guardian List - Expandable */}
          <div className='flex-1 overflow-y-auto px-4 py-2'>
            <div className='space-y-2'>
              <AnimatePresence>
                {guardians.map((guardian, index) => (
                  <ModernGuardianCard
                    key={`${guardian.contactInfo}-${index}`}
                    guardian={guardian}
                    index={index}
                    onRemove={() => handleRemoveGuardian(index)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className='px-4 py-3 bg-white border-t border-gray-100'>
            <AnimatePresence mode='wait'>
              {isAddingGuardian ? (
                <motion.div
                  key='form'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className='space-y-3'
                >
                  {/* Form Header */}
                  <div className='flex items-center justify-between'>
                    <h3 className='font-medium text-gray-900'>New Guardian</h3>
                    <button
                      onClick={() => {
                        setIsAddingGuardian(false);
                        setNewGuardian({
                          name: '',
                          type: GuardianType.EMAIL,
                          contactInfo: '',
                        });
                      }}
                      className='w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Compact Form */}
                  <div className='space-y-3'>
                    <div className='relative'>
                      <input
                        type='text'
                        value={newGuardian.name}
                        onChange={(e) =>
                          setNewGuardian({
                            ...newGuardian,
                            name: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Guardian Name'
                        autoFocus
                      />
                      {/* Test data button - only for development */}
                      {process.env.NODE_ENV === 'development' && 
                        autoInjectIndex < AUTO_INJECT_EMAILS.length &&
                        newGuardian.type === GuardianType.EMAIL && (
                          <button
                            type='button'
                            onClick={() => {
                              const autoData =
                                AUTO_INJECT_EMAILS[autoInjectIndex];
                              setNewGuardian({
                                ...newGuardian,
                                name: autoData.name,
                                contactInfo: autoData.email,
                              });
                            }}
                            className='absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors'
                            title='Use test data'
                          >
                            Test Data
                          </button>
                        )}
                    </div>

                    {/* Guardian Type Selector */}
                    <ModernGuardianTypeSelector
                      selectedType={newGuardian.type}
                      onTypeChange={(type) => {
                        setNewGuardian({ ...newGuardian, type, contactInfo: '' });
                        setValidationError('');
                      }}
                    />

                    {/* Contact Input with validation */}
                    <div>
                      <input
                        type={
                          newGuardian.type === GuardianType.EMAIL
                            ? 'email'
                            : newGuardian.type === GuardianType.PHONE
                            ? 'tel'
                            : 'text'
                        }
                        value={newGuardian.contactInfo}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Auto-format phone numbers
                          if (newGuardian.type === GuardianType.PHONE) {
                            value = formatPhoneNumber(value);
                          }
                          setNewGuardian({
                            ...newGuardian,
                            contactInfo: value,
                          });
                          setValidationError('');
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={getContactPlaceholder(newGuardian.type)}
                      />
                      {validationError && (
                        <div className='flex items-center gap-2 mt-2 text-red-600'>
                          <AlertCircle className='w-4 h-4' />
                          <span className='text-sm'>{validationError}</span>
                        </div>
                      )}
                    </div>

                    {/* Security message */}
                    <div className='bg-gray-50 rounded-lg p-3'>
                      <p className='text-xs text-gray-600 flex items-center gap-2'>
                        <Shield className='w-4 h-4' />
                        Guardians only store encrypted pieces of your recovery key
                      </p>
                    </div>

                    <ModernButton
                      onClick={handleAddGuardian}
                      fullWidth
                      size='lg'
                      variant='primary'
                      disabled={!newGuardian.name || !newGuardian.contactInfo}
                    >
                      Add Guardian
                    </ModernButton>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key='actions'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className='space-y-2'
                >
                  {guardians.length < MIN_GUARDIANS ? (
                    <>
                      <ModernButton
                        onClick={() => {
                          setIsAddingGuardian(true);
                          // Reset auto-inject for new guardian
                          if (guardians.length >= autoInjectIndex) {
                            setAutoInjectIndex(guardians.length);
                          }
                        }}
                        fullWidth
                        size='lg'
                        variant='primary'
                        icon={
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                            />
                          </svg>
                        }
                        iconPosition='left'
                      >
                        Add Guardian
                      </ModernButton>
                      {/* Back button removed since we skip welcome step */}
                    </>
                  ) : (
                    <>
                      <ModernButton
                        onClick={() => setCurrentStep(1)}
                        fullWidth
                        size='lg'
                        variant='primary'
                        icon={
                          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                          </svg>
                        }
                      >
                        Continue to Security Settings
                      </ModernButton>
                      <div className='flex gap-2'>
                        <ModernButton
                          onClick={() => {
                            setIsAddingGuardian(true);
                            // Reset auto-inject for new guardian
                            if (guardians.length >= autoInjectIndex) {
                              setAutoInjectIndex(guardians.length);
                            }
                          }}
                          variant='ghost'
                          fullWidth
                        >
                          Add More
                        </ModernButton>
                        {/* Back button removed since we skip welcome step */}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Choose Security',
      component: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className='flex flex-col h-full'
        >
          {/* Scrollable content area */}
          <div className='flex-1 overflow-y-auto px-6 py-4'>
            <EnhancedThresholdSelector
              totalGuardians={guardians.length}
              threshold={minimumAcceptances}
              onThresholdChange={setMinimumAcceptances}
            />
          </div>

          {/* Fixed bottom navigation */}
          <div className='px-6 py-4 bg-white border-t border-gray-100'>
            <div className='flex gap-3'>
              <Button variant='ghost' onClick={() => setCurrentStep(0)} fullWidth>
                ← Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)} 
                fullWidth
                className='bg-primary-500 hover:bg-primary-600'
              >
                Review Setup →
              </Button>
            </div>
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Review & Send',
      component: (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className='flex flex-col h-full'
        >
          {/* Scrollable content area */}
          <div className='flex-1 overflow-y-auto px-6 py-4'>
            <EnhancedReviewSetup
              guardians={guardians}
              threshold={minimumAcceptances}
              onSubmit={handleSubmit}
              onEditSecurity={() => setCurrentStep(1)}
              isSubmitting={createSessionMutation.isPending}
            />
          </div>
        </motion.div>
      ),
    },
  ];

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* Clean Progress Header with Close */}
      {(
        <div className='px-4 py-2 bg-white/95 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100 relative'>
          {/* Close button - top right */}
          <button
            onClick={() => navigate('/dashboard')}
            className='absolute top-2 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>

          <div className='text-center mb-2 pr-8'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className='flex items-baseline justify-center gap-1.5 flex-wrap'>
                  <span className='text-sm font-semibold text-primary-500'>
                    Step {currentStep}:
                  </span>
                  <span className='text-base font-bold text-gray-900'>
                    {stepTitles[currentStep - 1].purpose}
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='text-sm text-gray-500 mt-1'
            >
              {currentStep === 1 && 'Choose trusted friends to help secure your wallet'}
              {currentStep === 2 && 'Set how many guardians are needed for recovery'}
              {currentStep === 3 && 'Confirm your setup before sending invitations'}
            </motion.p>
          </div>

          <div className='mt-2'>
            <ProgressBar value={((currentStep - 1) / 3) * 100} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className='flex-1 overflow-y-auto'>
        <AnimatePresence mode='wait'>
          <motion.div key={currentStep} className='h-full'>
            {steps[currentStep - 1].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Compact Step Dots */}
      {(
        <div className='px-4 py-3 bg-white border-t border-gray-100'>
          <StepDots totalSteps={3} currentStep={currentStep} />
        </div>
      )}

      {/* Success Animation */}
      <SuccessComponent />
    </div>
  );
};
