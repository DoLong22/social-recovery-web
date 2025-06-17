# Guardian Dashboard UI/UX Specification

**Version:** 1.0  
**Date:** December 2024  
**Status:** Design Review  
**Purpose:** Post-setup guardian management screen

## Overview

The Guardian Dashboard is the main screen users see after completing guardian setup. It provides a comprehensive view of guardian status, health monitoring, and management capabilities.

## API Endpoints Utilized

```typescript
// Primary endpoints
GET /api/v1/guardians                    // List all guardians
GET /api/v1/guardians/:id/health         // Individual health status
POST /api/v1/guardians/health-check      // Bulk health check
GET /api/v1/guardian/version/current/active  // Active version info
GET /api/v1/guardian/setup-sessions/history  // Setup history
```

## Screen Layout

```
┌─────────────────────────────┐
│  Guardian Dashboard         │
│  ┌──────────────────────┐  │
│  │ 🛡️ Wallet Protected  │  │
│  │ 3 Active Guardians   │  │
│  │ Last check: 2m ago   │  │
│  └──────────────────────┘  │
│                             │
│  Quick Actions              │
│  ┌─────────┐ ┌─────────┐  │
│  │   Add   │ │ Health  │  │
│  │Guardian │ │  Check  │  │
│  └─────────┘ └─────────┘  │
│                             │
│  Active Guardians           │
│  ┌──────────────────────┐  │
│  │ 📧 John Doe      ✅ │  │
│  │ john@email.com      │  │
│  │ Last active: 1d ago │  │
│  │ [Verify] [Replace]  │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ 📱 Jane Smith   ⚠️  │  │
│  │ +1 234-567-890      │  │
│  │ Needs verification  │  │
│  │ [Verify] [Replace]  │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ 🔐 Wallet Guard  ✅ │  │
│  │ 0x1234...5678       │  │
│  │ Last active: 2h ago │  │
│  │ [Verify] [Replace]  │  │
│  └──────────────────────┘  │
│                             │
│  Recovery Settings          │
│  ┌──────────────────────┐  │
│  │ Min Required: 2/3    │  │
│  │ Version: v1.2.3     │  │
│  │ [View History]      │  │
│  └──────────────────────┘  │
│                             │
│  [⚙️]  [📊]  [🏠]  [👤]   │
└─────────────────────────────┘
```

## Component Specifications

### 1. Status Overview Card

```tsx
interface StatusOverviewProps {
  totalGuardians: number;
  activeGuardians: number;
  lastHealthCheck: Date;
  overallHealth: 'healthy' | 'warning' | 'critical';
}
```

**Visual States:**
- Healthy: Green accent (#10B981)
- Warning: Yellow accent (#F59E0B)
- Critical: Red accent (#EF4444)

**Features:**
- Auto-refresh every 30 seconds
- Animated status transitions
- Pull-to-refresh on mobile

### 2. Guardian Card Component

```tsx
interface GuardianCardProps {
  guardian: {
    id: string;
    name: string;
    type: GuardianType;
    contactInfo: string;
    status: 'active' | 'pending' | 'inactive';
    healthStatus: 'healthy' | 'warning' | 'error';
    lastActive: Date;
    verificationStatus: 'verified' | 'unverified' | 'expired';
  };
  onVerify: () => void;
  onReplace: () => void;
  onViewDetails: () => void;
}
```

**Visual Design:**
- Card height: Auto (min 100px)
- Border radius: 16px
- Padding: 16px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)

**Status Indicators:**
- ✅ Healthy & Verified
- ⚠️ Needs Attention
- ❌ Critical Issue
- 🔄 Pending Verification

**Actions:**
- Primary: Verify (if needed)
- Secondary: Replace
- Tertiary: View Details (long press)

### 3. Quick Actions Section

```tsx
interface QuickActionsProps {
  onAddGuardian: () => void;
  onHealthCheck: () => void;
  onEmergencyReplace: () => void;
  isHealthCheckLoading: boolean;
}
```

**Button Specifications:**
- Height: 56px
- Border radius: 12px
- Icon size: 24px
- Horizontal layout on tablets

### 4. Recovery Settings Card

```tsx
interface RecoverySettingsProps {
  minimumRequired: number;
  totalGuardians: number;
  currentVersion: string;
  versionStatus: 'active' | 'outdated';
  onViewHistory: () => void;
  onUpdateSettings: () => void;
}
```

## Detailed Flows

### 1. Health Check Flow

```typescript
// User taps "Health Check"
┌─────────────────────────────┐
│  Checking Guardian Health   │
│                             │
│  ┌──────────────────────┐  │
│  │ John Doe         🔄  │  │
│  │ Checking...          │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ Jane Smith       ✅  │  │
│  │ Responsive           │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ Wallet Guard     ❌  │  │
│  │ Not responding       │  │
│  └──────────────────────┘  │
│                             │
│  [View Report]             │
└─────────────────────────────┘
```

### 2. Replace Guardian Flow

```typescript
// User taps "Replace" on a guardian
┌─────────────────────────────┐
│  Replace Guardian           │
│                             │
│  Current Guardian:          │
│  ┌──────────────────────┐  │
│  │ 📱 Jane Smith        │  │
│  │ +1 234-567-890       │  │
│  │ Status: Unresponsive │  │
│  └──────────────────────┘  │
│                             │
│  Replace with:              │
│  ┌──────────────────────┐  │
│  │ Type: [📧][📱][🔐]   │  │
│  │ Name: [___________]   │  │
│  │ Contact: [________]   │  │
│  └──────────────────────┘  │
│                             │
│  ⚠️ This will create a new │
│  version and invalidate     │
│  the old guardian's share   │
│                             │
│  [Cancel] [Replace Now]     │
└─────────────────────────────┘
```

### 3. Guardian Details Modal

```typescript
// Long press or "View Details"
┌─────────────────────────────┐
│  Guardian Details           │
│                             │
│  📧 John Doe               │
│  ━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│  Contact: john@email.com    │
│  Added: May 15, 2024        │
│  Type: Email Guardian       │
│  Status: Active & Verified  │
│                             │
│  Activity Log:              │
│  • Verified - May 16       │
│  • Health check - Today    │
│  • Invitation sent - May 15│
│                             │
│  Share Information:         │
│  Version: v1.2.3           │
│  Encrypted: ✅             │
│  Delivered: ✅             │
│                             │
│  Actions:                   │
│  [Send Test] [Re-verify]    │
│  [View Share] [Remove]      │
│                             │
│  [Close]                    │
└─────────────────────────────┘
```

## State Management

### Loading States
```tsx
// Initial load
<SkeletonCard count={3} />

// Refresh
<PullToRefresh onRefresh={refetchGuardians}>
  <GuardianList />
</PullToRefresh>

// Health check
guardians.map(g => (
  <GuardianCard 
    {...g} 
    isChecking={checkingIds.includes(g.id)}
  />
))
```

### Error States
```tsx
// No guardians
<EmptyState
  icon="🛡️"
  title="No Guardians Set"
  description="Add guardians to secure your wallet"
  action={{ label: "Setup Guardians", onClick: onSetup }}
/>

// Network error
<ErrorState
  icon="📡"
  title="Connection Error"
  description="Unable to fetch guardian status"
  action={{ label: "Retry", onClick: retry }}
/>
```

### Success Feedback
```tsx
// After health check
<Toast
  type="success"
  message="All guardians are healthy"
  duration={3000}
/>

// After replace
<Toast
  type="success"
  message="Guardian replaced successfully"
  action={{ label: "View", onClick: viewGuardian }}
/>
```

## Navigation

### Bottom Navigation
```
┌─────┬─────┬─────┬─────┐
│ ⚙️  │ 📊  │ 🏠  │ 👤  │
├─────┼─────┼─────┼─────┤
│Setup│Stats│ Home│ You │
└─────┴─────┴─────┴─────┘
```

- **Setup**: Guardian management
- **Stats**: Analytics & history
- **Home**: Dashboard (current)
- **You**: Profile & settings

## Interaction Patterns

### 1. Swipe Actions (iOS style)
```
← Swipe left on guardian card
┌──────────────┬─────────┐
│ Guardian     │ Replace │
│   Card       │ Remove  │
└──────────────┴─────────┘
```

### 2. Long Press Menu
- View Details
- Send Test Message
- Export Guardian Info
- Remove Guardian

### 3. Batch Operations
```typescript
// Select mode for multiple guardians
<Checkbox /> Select All
[Verify Selected] [Remove Selected]
```

## Performance Considerations

### 1. API Optimization
```typescript
// Batch health checks
POST /api/v1/guardians/health-check
{
  guardianIds: ["id1", "id2", "id3"]
}

// Cache guardian data
const { data } = useQuery({
  queryKey: ['guardians'],
  queryFn: fetchGuardians,
  staleTime: 30000, // 30 seconds
  cacheTime: 300000, // 5 minutes
});
```

### 2. Real-time Updates
```typescript
// WebSocket for live status
useEffect(() => {
  const ws = new WebSocket('wss://api/guardian-status');
  ws.on('health-update', (data) => {
    updateGuardianHealth(data);
  });
  return () => ws.close();
}, []);
```

## Accessibility

### Screen Reader Support
```tsx
<div
  role="list"
  aria-label="Guardian list"
>
  <div
    role="listitem"
    aria-label={`${guardian.name}, ${guardian.type} guardian, status: ${guardian.healthStatus}`}
  >
    {/* Guardian content */}
  </div>
</div>
```

### Keyboard Navigation
- Tab: Navigate between cards
- Enter: Primary action (Verify)
- Space: Select for batch operations
- Delete: Remove guardian (with confirmation)

## Implementation Notes

### 1. Component Structure
```
GuardianDashboard/
├── components/
│   ├── StatusOverview.tsx
│   ├── GuardianCard.tsx
│   ├── QuickActions.tsx
│   ├── RecoverySettings.tsx
│   └── GuardianDetailsModal.tsx
├── hooks/
│   ├── useGuardians.ts
│   ├── useHealthCheck.ts
│   └── useGuardianReplace.ts
└── GuardianDashboard.tsx
```

### 2. Sample Implementation

```tsx
export const GuardianDashboard: React.FC = () => {
  const { data: guardians, refetch } = useQuery({
    queryKey: ['guardians'],
    queryFn: () => guardianApi.getGuardians(),
    refetchInterval: 30000,
  });

  const healthCheckMutation = useMutation({
    mutationFn: () => guardianApi.bulkHealthCheck(),
    onSuccess: () => {
      showToast('Health check completed');
      refetch();
    },
  });

  const [selectedGuardian, setSelectedGuardian] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <StatusOverview
        totalGuardians={guardians?.length || 0}
        activeGuardians={guardians?.filter(g => g.status === 'active').length || 0}
        lastHealthCheck={lastHealthCheck}
        overallHealth={calculateOverallHealth(guardians)}
      />

      <QuickActions
        onAddGuardian={() => navigate('/guardians/add')}
        onHealthCheck={() => healthCheckMutation.mutate()}
        isHealthCheckLoading={healthCheckMutation.isPending}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {guardians?.map(guardian => (
          <GuardianCard
            key={guardian.id}
            guardian={guardian}
            onVerify={() => handleVerify(guardian.id)}
            onReplace={() => handleReplace(guardian.id)}
            onViewDetails={() => {
              setSelectedGuardian(guardian);
              setShowDetails(true);
            }}
          />
        ))}
      </div>

      <RecoverySettings
        minimumRequired={2}
        totalGuardians={guardians?.length || 0}
        currentVersion={version}
        onViewHistory={() => navigate('/guardians/history')}
      />

      <BottomNavigation activeTab="home" />

      {showDetails && (
        <GuardianDetailsModal
          guardian={selectedGuardian}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Health check frequency | > 1/day per user | Analytics |
| Guardian replacement time | < 2 minutes | Timer |
| Dashboard load time | < 1 second | Performance monitoring |
| Error rate | < 1% | Error tracking |

---

**Note**: This dashboard serves as the primary interface for guardian management post-setup and should be optimized for daily use.