# Guardian Setup UI/UX Redesign Specification

**Version:** 1.0  
**Date:** December 2024  
**Status:** Final Design Review  
**Author:** UI/UX Team

## Executive Summary

This document provides the complete UI/UX redesign specification for the Guardian Setup flow in the Social Recovery system. The redesign prioritizes mobile-first experience, reduces setup time to under 20 seconds, and improves accessibility for all user personas.

## Design Goals

1. **Speed**: Complete setup in under 20 seconds
2. **Simplicity**: Progressive disclosure with 4 clear steps
3. **Mobile-First**: Optimized for touch interactions
4. **Accessibility**: WCAG 2.1 AA compliant
5. **Trust**: Clear feedback and security indicators

## User Flow Overview

```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌────────┐
│ Welcome │ --> │  Select  │ --> │     Add     │ --> │ Review │
│  Step   │     │  Types   │     │  Guardians  │     │   &    │
│   (1)   │     │   (2)    │     │     (3)     │     │ Submit │
└─────────┘     └──────────┘     └─────────────┘     └────────┘
```

## Visual Design System

### Color Palette

```scss
// Primary Colors
$primary-500: #3B82F6;  // Main blue
$primary-600: #2563EB;  // Hover state
$primary-50:  #EFF6FF;  // Light background

// Semantic Colors
$success-500: #10B981;  // Success green
$success-50:  #D1FAE5;  // Success background
$danger-500:  #EF4444;  // Error red
$danger-50:   #FEE2E2;  // Error background

// Neutral Colors
$gray-900: #111827;     // Primary text
$gray-600: #4B5563;     // Secondary text
$gray-200: #E5E7EB;     // Borders
$gray-100: #F3F4F6;     // Backgrounds
$gray-50:  #F9FAFB;     // Subtle backgrounds
```

### Typography

```scss
// Font Family
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

// Type Scale
$heading-1: 600 24px/32px;   // Step titles
$heading-2: 600 20px/28px;   // Section headers
$body:      400 16px/24px;   // Regular text
$body-sm:   400 14px/20px;   // Helper text
$button:    500 16px/24px;   // Button text
```

### Spacing System

```scss
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
```

## Component Specifications

### 1. Progress Header Component

```tsx
interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  title: string;
}
```

**Visual Specs:**
- Height: 72px + safe-area-inset-top
- Background: White
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Progress bar height: 4px
- Progress bar radius: 2px

### 2. Step Indicator Component

```tsx
interface StepIndicatorProps {
  steps: number;
  currentStep: number;
}
```

**Visual Specs:**
- Indicator height: 4px
- Active color: $primary-500
- Inactive color: $gray-200
- Gap between indicators: 8px
- Animation: 300ms ease-out

### 3. Guardian Type Selector

```tsx
interface GuardianTypeSelectorProps {
  selected: GuardianType[];
  onSelect: (type: GuardianType) => void;
  types: Array<{
    type: GuardianType;
    icon: string;
    label: string;
    description: string;
  }>;
}
```

**Visual Specs:**
- Card height: 72px
- Border radius: 16px
- Border width: 2px
- Selected border: $primary-500
- Selected background: $primary-50
- Icon size: 32px
- Tap animation: scale(0.98)

### 4. Guardian Input Card

```tsx
interface GuardianInputCardProps {
  guardian: Guardian;
  onChange: (guardian: Guardian) => void;
  onRemove?: () => void;
}
```

**Visual Specs:**
- Background: $gray-50
- Border radius: 16px
- Padding: 16px
- Input height: 48px
- Input border radius: 12px
- Remove button: 40x40px

### 5. Floating Action Button

```tsx
interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

**Visual Specs:**
- Height: 56px
- Border radius: 16px
- Shadow: 0 10px 25px rgba(59, 130, 246, 0.25)
- Active scale: 0.95
- Disabled opacity: 0.5

## Screen Specifications

### Step 1: Welcome Screen

**Layout:**
```
┌─────────────────────────────┐
│         Progress Bar         │
├─────────────────────────────┤
│                             │
│      🛡️ (96x96px)         │
│                             │
│   Secure Your Wallet        │
│   with Guardians            │
│                             │
│   Replace complex seed      │
│   phrases with trusted      │
│   friends & family          │
│                             │
│                             │
│    [Get Started →]          │
│                             │
│        ⚫ ⚪ ⚪ ⚪          │
└─────────────────────────────┘
```

**Specifications:**
- Icon container: 96x96px, $primary-50 background
- Title: $heading-1, $gray-900
- Description: $body, $gray-600, max-width: 280px
- Button: Full width, $primary-500 gradient
- Dot indicators: 8x8px, 8px gap

### Step 2: Guardian Type Selection

**Layout:**
```
┌─────────────────────────────┐
│ < Back    Select Types      │
├─────────────────────────────┤
│                             │
│ Choose Guardian Types       │
│ Select how you want to      │
│ add your guardians          │
│                             │
│ ┌─────────────────────┐    │
│ │ 📧 Email           │ ✓  │
│ │ Fast & Easy        │    │
│ └─────────────────────┘    │
│                             │
│ ┌─────────────────────┐    │
│ │ 📱 Phone           │    │
│ │ SMS Verified       │    │
│ └─────────────────────┘    │
│                             │
│ ┌─────────────────────┐    │
│ │ 🔐 Wallet          │    │
│ │ Most Secure        │    │
│ └─────────────────────┘    │
│                             │
│     [Continue →]            │
└─────────────────────────────┘
```

**Interaction States:**
- Default: White background, $gray-200 border
- Hover/Focus: $gray-300 border
- Selected: $primary-50 background, $primary-500 border
- Disabled: 0.5 opacity

### Step 3: Add Guardians

**Layout:**
```
┌─────────────────────────────┐
│ < Back    Add Guardians     │
├─────────────────────────────┤
│                             │
│ Progress: 1/3 minimum       │
│ ████░░░░░░░░░░░░░░░        │
│                             │
│ Added Guardians:            │
│ ┌─────────────────────┐    │
│ │ John Doe         X │    │
│ │ john@email.com    │    │
│ └─────────────────────┘    │
│                             │
│ Add New Guardian:           │
│ ┌─────────────────────┐    │
│ │ Name: [________]   │    │
│ │ 📧  📱  🔐        │    │
│ │ Contact: [______]  │    │
│ │ [+ Add Guardian]   │    │
│ └─────────────────────┘    │
│                             │
│     [Review Setup →]        │
└─────────────────────────────┘
```

**Specifications:**
- Progress bar: 8px height, animated width
- Guardian cards: Swipe-to-delete enabled
- Input fields: 48px height, 12px radius
- Type toggles: 40px height, chip style
- Add button: Secondary style, disabled until valid

### Step 4: Review & Confirm

**Layout:**
```
┌─────────────────────────────┐
│ < Back    Review Setup      │
├─────────────────────────────┤
│                             │
│ Your Guardians:             │
│                             │
│ ┌─────────────────────┐    │
│ │ 📧 John Doe        │    │
│ │ john@email.com     │    │
│ └─────────────────────┘    │
│                             │
│ ┌─────────────────────┐    │
│ │ 📱 Jane Smith      │    │
│ │ +1234567890        │    │
│ └─────────────────────┘    │
│                             │
│ ┌─────────────────────┐    │
│ │ 🔐 Wallet Guardian │    │
│ │ 0x1234...5678      │    │
│ └─────────────────────┘    │
│                             │
│ ┌─────────────────────┐    │
│ │ ✓ 3 guardians      │    │
│ │ 2 needed to recover│    │
│ └─────────────────────┘    │
│                             │
│   [Send Invitations]        │
│   [← Back to Edit]          │
└─────────────────────────────┘
```

## Animation Specifications

### Page Transitions
```scss
// Enter animation
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

// Exit animation
@keyframes slideOutLeft {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
}

// Duration: 300ms
// Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Micro-interactions
- Button tap: scale(0.95), duration: 150ms
- Card selection: border color transition, duration: 200ms
- Progress bar: width transition, duration: 300ms
- Success checkmark: scale + fade, duration: 400ms

## Accessibility Requirements

### ARIA Labels
```tsx
// Example implementation
<button
  aria-label="Select email guardian type"
  aria-pressed={isSelected}
  role="checkbox"
>
  📧 Email
</button>
```

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter/Space activates buttons
- Arrow keys navigate between options
- Escape goes back one step

### Screen Reader Announcements
- Step changes announced
- Form validation errors announced
- Success/error states announced
- Progress updates announced

## Mobile Interaction Guidelines

### Touch Targets
- Minimum size: 44x44px
- Recommended size: 48x48px
- Spacing between targets: 8px minimum

### Gestures
- Swipe right: Go back
- Swipe left: Delete guardian (with confirmation)
- Pull to refresh: Disabled
- Long press: Show tooltips

### Safe Areas
```scss
// iOS safe areas
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);

// Android navigation bar
padding-bottom: 48px; // When gesture navigation is disabled
```

## Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Install Framer Motion
- [ ] Configure Tailwind for custom animations
- [ ] Set up component structure
- [ ] Create design tokens file

### Phase 2: Components (Day 2-3)
- [ ] Progress Header component
- [ ] Step Indicator component
- [ ] Guardian Type Selector
- [ ] Guardian Input Card
- [ ] Floating Action Button

### Phase 3: Screens (Day 4-5)
- [ ] Welcome screen
- [ ] Type selection screen
- [ ] Add guardians screen
- [ ] Review screen
- [ ] Success/error states

### Phase 4: Polish (Day 6-7)
- [ ] Animations and transitions
- [ ] Error handling
- [ ] Loading states
- [ ] Accessibility audit
- [ ] Performance optimization

### Phase 5: Testing (Day 8)
- [ ] Unit tests for components
- [ ] Integration tests for flow
- [ ] Accessibility testing
- [ ] Device testing (iOS/Android)
- [ ] Performance testing

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Setup completion time | < 20 seconds | Analytics timing |
| Setup completion rate | > 85% | Funnel analysis |
| Error rate | < 5% | Error tracking |
| Accessibility score | 100 | Lighthouse audit |
| User satisfaction | > 4.5/5 | Post-setup survey |

## Design Handoff Assets

### Required Exports
1. Component library in Figma/Sketch
2. Icon set (SVG format)
3. Animation specifications (Lottie/Video)
4. Device-specific mockups
5. Interaction prototype

### Developer Resources
1. This specification document
2. Component code examples
3. Animation timing functions
4. Accessibility checklist
5. Test scenarios

## Approval Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | _______ | _____ | _________ |
| Lead Designer | _______ | _____ | _________ |
| Frontend Lead | _______ | _____ | _________ |
| QA Lead | _______ | _____ | _________ |

---

**Note**: This specification is a living document. Updates require approval from all stakeholders listed above.