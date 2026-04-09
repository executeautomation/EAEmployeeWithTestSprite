# 📝 Quick Manual Testing Checklist

> **Fast Reference Guide for Manual Testing Sessions**

## 🚀 Pre-Test Setup (5 minutes)
- [ ] ✅ Application running at `http://localhost:5173`
- [ ] ✅ Backend server running on port 4000
- [ ] ✅ Browser cache cleared
- [ ] ✅ Test credentials ready:
  - Admin: `admin` / `password`
  - User: `user` / `123456`
  - Test: `test` / `test123`

---

## 🔐 Authentication Tests (10 minutes)

### ✅ Login Tests
- [ ] **T1**: Login page displays correctly
- [ ] **T2**: Admin login works (`admin`/`password`)
- [ ] **T3**: User login works (`user`/`123456`)
- [ ] **T4**: Test login works (`test`/`test123`)
- [ ] **T5**: Invalid credentials rejected
- [ ] **T6**: Empty fields show validation errors
- [ ] **T7**: Logout works and protects pages

**❌ Issues Found**: _______________

---

## 👥 Employee Management Tests (15 minutes)

### ✅ CRUD Operations
- [ ] **T8**: Employee list displays properly
- [ ] **T9**: Add new employee works
  - Test data: `John Smith`, `john@test.com`, `Developer`
- [ ] **T10**: Edit employee information works
- [ ] **T11**: Delete employee works (with confirmation)
- [ ] **T12**: Search by name works
- [ ] **T13**: Search by email works  
- [ ] **T14**: Search by position works

**❌ Issues Found**: _______________

---

## 🎨 UI/UX Tests (8 minutes)

### ✅ Interface Tests
- [ ] **T15**: Theme toggle works (light ↔ dark)
- [ ] **T16**: Theme persists after logout/login
- [ ] **T17**: Responsive design on mobile (resize browser)
- [ ] **T18**: Navigation between pages works
- [ ] **T19**: All buttons are clickable and visible

**❌ Issues Found**: _______________

---

## ✅ Form Validation Tests (10 minutes)

### ✅ Data Quality Tests
- [ ] **T20**: Required fields show errors when empty
- [ ] **T21**: Invalid email formats rejected
  - Test: `invalid`, `user@`, `@domain.com`
- [ ] **T22**: Valid email formats accepted
  - Test: `test@company.com`
- [ ] **T23**: Special characters in names work
  - Test: `José María`, `O'Connor`, `Mary-Jane`
- [ ] **T24**: Long names handled properly

**❌ Issues Found**: _______________

---

## 🔄 Integration Tests (12 minutes)

### ✅ End-to-End Workflows
- [ ] **T25**: Complete employee lifecycle
  1. Add → Edit → Delete employee
- [ ] **T26**: Multiple employees (add 3-5)
- [ ] **T27**: Cross-session persistence
  1. Add data → Logout → Login → Verify data exists
- [ ] **T28**: Different user accounts see same data
- [ ] **T29**: Browser refresh preserves data

**❌ Issues Found**: _______________

---

## 🚨 Error Handling Tests (5 minutes)

### ✅ Robustness Tests
- [ ] **T30**: Clear error messages for failures
- [ ] **T31**: Form data preserved on errors
- [ ] **T32**: Duplicate email handling (if applicable)
- [ ] **T33**: Page doesn't crash on invalid actions

**❌ Issues Found**: _______________

---

## ⚡ Performance Tests (5 minutes)

### ✅ Speed Tests
- [ ] **T34**: Login completes in < 3 seconds
- [ ] **T35**: Page navigation is instant (< 1 second)
- [ ] **T36**: Search results appear immediately
- [ ] **T37**: Form saving completes in < 2 seconds
- [ ] **T38**: Employee list loads in < 2 seconds

**❌ Issues Found**: _______________

---

## 📊 Test Session Summary

**Date**: ________________  
**Tester**: _______________  
**Browser**: ______________  
**Duration**: _____________  

### Results Overview
- **Total Tests Executed**: ___/38
- **Passed**: ___
- **Failed**: ___
- **Critical Issues**: ___
- **Minor Issues**: ___

### Critical Issues (Fix Immediately)
1. _________________________________
2. _________________________________
3. _________________________________

### Minor Issues (Fix When Possible)
1. _________________________________
2. _________________________________
3. _________________________________

### Recommendations
1. _________________________________
2. _________________________________
3. _________________________________

### Overall App Rating
- [ ] 🟢 **Excellent** - Ready for production
- [ ] 🟡 **Good** - Minor issues to fix
- [ ] 🟠 **Fair** - Several issues need attention
- [ ] 🔴 **Poor** - Major issues prevent use

**Notes**: 
_____________________________________
_____________________________________
_____________________________________

---

## 🛠️ Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Login fails | Clear browser cache, check server |
| Page won't load | Refresh, check internet connection |
| Changes don't save | Check browser console, restart server |
| Slow performance | Close other browser tabs, restart app |
| Layout broken | Try different browser, update browser |

---

**For detailed test procedures, see: [MANUAL-TEST-CASES.md](./MANUAL-TEST-CASES.md)**

*Total estimated testing time: ~70 minutes for complete manual test suite*