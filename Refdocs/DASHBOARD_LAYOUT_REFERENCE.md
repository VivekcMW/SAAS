# Dashboard Layout Reference - CRITICAL POSITIONING RULES

## ⚠️ SUBNAV POSITIONING - DO NOT CHANGE ⚠️

### Current Layout Structure:
1. **Main Navbar**: Fixed at top (72px desktop, 64px mobile)
2. **DashboardSubnav**: Sticky positioned directly under navbar  
3. **Page Content**: Uses `padding-top: var(--subnav-height)` to prevent overlap

### Critical CSS Rules:

#### DashboardSubnav Component (`/components/dashboard/DashboardSubnav.vue`):
```css
.dashboard-subnav {
  position: sticky;    /* ⚠️ NEVER CHANGE */
  top: 72px;          /* ⚠️ NEVER CHANGE - Desktop navbar height */
  z-index: 90;        /* ⚠️ NEVER CHANGE - Must stay above content */
}

@media (max-width: 768px) {
  .dashboard-subnav {
    top: 64px;        /* ⚠️ NEVER CHANGE - Mobile navbar height */
  }
}
```

#### Global CSS Variables (`/assets/css/global.css`):
```css
--navbar-height: 72px;           /* Must match DashboardSubnav top */
--navbar-height-mobile: 64px;    /* Must match DashboardSubnav mobile top */
--subnav-height: 144px;          /* DashboardSubnav actual height */
```

#### Dashboard Pages (ALL must include):
```css
.page-container {
  padding-top: var(--subnav-height);  /* ⚠️ REQUIRED - Prevents content overlap */
}
```

### Pages Updated with Correct Padding:
- ✅ `/pages/dashboard/reviews.vue`
- ✅ `/pages/dashboard/overview.vue`
- ✅ `/pages/dashboard/settings.vue`
- ✅ `/pages/dashboard/user-management.vue`
- ✅ `/pages/dashboard/profile.vue`
- ✅ `/pages/dashboard/subscriptions.vue`
- ✅ `/pages/dashboard/documents.vue`

### Behavior:
- **Desktop**: Subnav sticks at 72px from top (under navbar)
- **Mobile**: Subnav sticks at 64px from top (under smaller navbar)
- **Scroll**: Subnav remains visible at top while content scrolls underneath
- **Content**: Never overlaps with subnav due to proper padding

### If Adding New Dashboard Pages:
Always include this CSS:
```css
.your-page-class {
  padding-top: var(--subnav-height); /* Prevents overlap with sticky subnav */
}
```

### Emergency Fix:
If subnav positioning breaks, check these 3 things:
1. DashboardSubnav has `position: sticky; top: 72px;`
2. CSS variables are correct in `global.css`
3. Page has `padding-top: var(--subnav-height);`

---
**Last Updated**: After permanent positioning fix
**Status**: ✅ STABLE - Subnav permanently positioned at top under navbar
