# 🎨 Common App Card Design Preview

## Card Structure Overview

```
┌─────────────────────────────────────────┐
│  [LOGO]    AppName               ⭐4.5  │
│   64px     (Bold, 18px)          Rating │
│                                         │
│  👥 12.5k active users                  │
│  💰 $29/month                          │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ View Details│  │  ❤️ Favorites   │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

## Detailed Component Breakdown

### 📱 **Card Dimensions**
- **Width**: 100% (responsive grid)
- **Height**: Auto (consistent content-based)
- **Padding**: 20px
- **Border**: 1px solid #e5e7eb
- **Border Radius**: 8px (slightly rounded for modern look)
- **Shadow**: Subtle on hover

### 🎯 **Content Structure**

#### **Header Row**
```
Logo (64x64px) | App Name (flex-grow) | Rating (5⭐ + number)
```

#### **Metrics Row**  
```
👥 Active Users Count
💰 Pricing Information
```

#### **Actions Row**
```
[Primary Button: View Details] [Secondary Button: ❤️ Favorites]
```

## 🎨 **Visual Specifications**

### **Typography**
- **App Name**: Font size 18px, weight 700, color #1f2937
- **Rating**: Font size 14px, weight 600, color #374151
- **Metrics**: Font size 14px, weight 500, color #6b7280
- **Buttons**: Font size 14px, weight 600

### **Colors & States**
- **Primary Button**: #3b82f6 background, white text
- **Secondary Button**: White background, #374151 text, #e5e7eb border
- **Hover States**: Subtle elevation and color changes
- **Heart Icon**: #ef4444 when favorited, #6b7280 when not

### **Spacing**
- **Logo to Name**: 12px gap
- **Header to Metrics**: 16px gap
- **Metrics items**: 8px vertical gap
- **Metrics to Actions**: 20px gap
- **Action buttons**: 12px gap between them

## 📊 **Data Structure**

```typescript
interface AppCardData {
  id: string
  name: string
  logo: string
  rating: number
  reviewCount: number
  activeUsers: number
  pricing: {
    type: 'free' | 'paid' | 'trial'
    value?: number
    period?: string
  }
  isFavorited?: boolean
}
```

## 🎯 **Example Cards**

### Card 1: Paid App
```
┌─────────────────────────────────────────┐
│  [📊]    Salesforce CRM          ⭐4.7  │
│          (256 reviews)                  │
│                                         │
│  👥 125k active users                   │
│  💰 $29/month                          │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ View Details│  │  🤍 Favorites   │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

### Card 2: Free App
```
┌─────────────────────────────────────────┐
│  [💬]    Slack              ⭐4.9  │
│          (1.2k reviews)                 │
│                                         │
│  👥 2.1M active users                   │
│  💰 Free                               │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ View Details│  │  ❤️ Favorited   │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

### Card 3: Trial App
```
┌─────────────────────────────────────────┐
│  [🎨]    Adobe XD                ⭐4.5  │
│          (890 reviews)                  │
│                                         │
│  👥 67k active users                    │
│  💰 Free Trial                         │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ View Details│  │  🤍 Favorites   │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

## 🚀 **Key Features**

### ✅ **Simplicity**
- Clean, minimal design
- Clear information hierarchy
- No unnecessary elements

### ✅ **Consistency**
- Same layout for all apps
- Standardized spacing
- Unified typography

### ✅ **Functionality**
- Favorite toggle with visual feedback
- Clear call-to-action buttons
- Responsive design

### ✅ **Accessibility**
- Proper ARIA labels
- Keyboard navigation
- Screen reader friendly
- Color contrast compliant

## 📱 **Responsive Behavior**

### **Desktop (>768px)**
- Cards in 3-column grid
- Full button text visible
- Comfortable spacing

### **Tablet (481px-768px)**
- Cards in 2-column grid
- Slightly reduced padding

### **Mobile (<480px)**
- Cards in 1-column grid
- Buttons stack vertically for better touch targets
- Compact but readable

## 🎨 **Hover & Interaction States**

### **Card Hover**
```css
- Subtle elevation (shadow)
- Border color change
- Smooth transition (200ms)
```

### **Button States**
```css
Primary Button:
- Hover: Darker blue background
- Active: Pressed effect

Favorite Button:
- Hover: Heart grows slightly
- Toggle: Smooth color transition
```

## 💡 **Implementation Notes**

1. **Component Name**: `AppCard.vue`
2. **Usage**: Replace both MarketplaceGrid and CategoryApplications cards
3. **Props**: Simple app data object
4. **Events**: `@view-details` and `@toggle-favorite`
5. **Icons**: Use existing UIcon system
6. **Styling**: Scoped CSS with CSS variables for theming

---

## ❓ **Questions for Confirmation**

1. **Rating Display**: Show as "⭐4.5 (256 reviews)" or just "⭐4.5"?
2. **Active Users**: Use "12.5k" format or full numbers "12,500"?
3. **Button Style**: Keep current rectangular buttons or make them slightly rounded?
4. **Card Border**: Keep sharp corners or add subtle border-radius?
5. **Heart Icon**: Use outline heart 🤍 for unfavorited and filled heart ❤️ for favorited?

**Ready to implement?** Let me know if you'd like any adjustments to this design before I create the component!
