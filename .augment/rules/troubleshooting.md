---
type: "agent_requested"
description: "Example description"
---
# Troubleshooting Guide
## GROW YouR NEED SaaS School Platform

## 🚨 Common Issues & Solutions

### 1. Missing Icon Errors
**Symptoms**: Console errors about undefined icons, broken UI elements

**Causes**:
- Icon not exported from icon files
- Incorrect import path
- Typo in icon name

**Solutions**:
```typescript
// Check if icon exists in icon system
view path="components/icons" type="directory"

// Add missing icon to appropriate file
// Example: Adding Minimize icon to shared.tsx
export const sharedIcons = {
  // ... existing icons
  Minimize: L.Minus, // or appropriate Lucide icon
};
```

### 2. Environment Variable Issues
**Symptoms**: AI features not working, API key errors

**Causes**:
- Missing .env file
- Incorrect variable names
- API key not set

**Solutions**:
```bash
# Create .env file
GEMINI_API_KEY=your_api_key_here

# Verify in vite.config.ts
const env = loadEnv(mode, '.', '');
console.log('API Key loaded:', !!env.GEMINI_API_KEY);
```

### 3. TypeScript Errors
**Symptoms**: Build failures, IDE errors

**Common Issues**:
- Missing type definitions
- Incorrect import paths
- Interface mismatches

**Solutions**:
```typescript
// Check diagnostics
diagnostics paths=["App.tsx", "components/modules"]

// Fix common issues
interface Props {
  // Add missing properties
  title: string;
  onClick: () => void;
}

// Fix import paths
import { Icons } from '../../icons'; // Correct relative path
```

### 4. CSS Styling Issues
**Symptoms**: Broken layouts, missing styles

**Causes**:
- Missing CSS files
- Incorrect CSS variable usage
- Conflicting styles

**Solutions**:
```css
/* Use existing CSS variables */
.my-component {
  background: var(--glass-background-base);
  border: var(--glass-border);
}

/* Check if CSS file exists */
view path="components/modules/MyModule.css" type="file"
```

### 5. AI API Failures
**Symptoms**: AI features not responding, error messages

**Causes**:
- Invalid API key
- Network issues
- Rate limiting
- Malformed prompts

**Solutions**:
```typescript
// Add proper error handling
try {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  if (!process.env.API_KEY) {
    throw new Error('API key not configured');
  }
  // ... API call
} catch (error) {
  console.error('AI API Error:', error);
  setError('AI service temporarily unavailable');
}
```

## 🔧 Development Issues

### Build Failures
**Check List**:
1. Run diagnostics to identify errors
2. Verify all imports are correct
3. Check TypeScript configuration
4. Ensure all dependencies are installed

**Commands**:
```bash
# Check for errors
npm run build

# Run development server
npm run dev

# Check TypeScript
npx tsc --noEmit
```

### Performance Issues
**Symptoms**: Slow loading, laggy interactions

**Solutions**:
1. **Large Bundle Size**:
   ```typescript
   // Use dynamic imports
   const LazyComponent = React.lazy(() => import('./LazyComponent'));
   ```

2. **Memory Leaks**:
   ```typescript
   // Clean up effects
   useEffect(() => {
     const cleanup = () => {
       // Cleanup logic
     };
     return cleanup;
   }, []);
   ```

3. **Unnecessary Re-renders**:
   ```typescript
   // Use React.memo
   const ExpensiveComponent = React.memo(({ data }) => {
     // Component logic
   });
   ```

### State Management Issues
**Symptoms**: State not updating, unexpected behavior

**Solutions**:
```typescript
// Check context provider wrapping
<AppContextProvider>
  <App />
</AppContextProvider>

// Verify state updates are immutable
setState(prevState => ({
  ...prevState,
  newProperty: newValue
}));
```

## 🐛 Debugging Strategies

### 1. Systematic Debugging
```
1. Identify the exact error message
2. Locate the source file and line
3. Check recent changes
4. Verify dependencies and imports
5. Test in isolation
6. Apply minimal fix
7. Verify fix doesn't break other features
```

### 2. Using Browser DevTools
```
Console Tab:
- Check for JavaScript errors
- Look for network failures
- Verify API responses

Network Tab:
- Check API call status
- Verify request/response data
- Look for failed resource loads

React DevTools:
- Inspect component state
- Check prop values
- Verify context values
```

### 3. Code Analysis Tools
```typescript
// Use codebase-retrieval to understand patterns
codebase-retrieval: "Find all components that use similar functionality"

// Use diagnostics to catch errors
diagnostics paths=["problematic-file.tsx"]

// Use view to examine file structure
view path="components/modules" type="directory"
```

## 🚑 Emergency Procedures

### Critical Bug in Production
1. **Immediate Response**:
   - Identify affected functionality
   - Assess user impact
   - Document the issue

2. **Quick Fix**:
   - Revert to last known good state
   - Apply minimal fix
   - Test thoroughly

3. **Follow-up**:
   - Root cause analysis
   - Implement proper fix
   - Add tests to prevent recurrence

### Build System Failure
1. **Check Dependencies**:
   ```bash
   npm install
   npm audit fix
   ```

2. **Clear Cache**:
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Verify Configuration**:
   - Check package.json scripts
   - Verify tsconfig.json
   - Check vite.config.ts

### Data Loss Prevention
1. **Backup Strategy**:
   - Regular code commits
   - Local storage backup
   - Configuration backup

2. **Recovery Procedures**:
   - Git history review
   - Local storage recovery
   - Configuration restoration

## 📊 Monitoring & Logging

### Error Tracking
```typescript
// Add error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to monitoring service
  }
}

// Log important events
console.log('User action:', action, { timestamp: new Date() });
```

### Performance Monitoring
```typescript
// Monitor API response times
const startTime = performance.now();
await apiCall();
const endTime = performance.now();
console.log(`API call took ${endTime - startTime} milliseconds`);
```

## 🔍 Diagnostic Commands

### File System Checks
```bash
# Check file existence
view path="missing-file.tsx" type="file"

# Check directory structure
view path="components" type="directory"

# Search for patterns
view path="App.tsx" type="file" search_query_regex="useState"
```

### Code Quality Checks
```bash
# TypeScript compilation
npx tsc --noEmit

# Linting (if configured)
npx eslint src/

# Test execution
npm test
```

### Dependency Checks
```bash
# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# Verify package integrity
npm ls
```

## 📝 Issue Documentation

### Bug Report Template
```
**Issue**: Brief description
**Steps to Reproduce**: 
1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Environment**: Browser, OS, Node version
**Error Messages**: Any console errors
**Screenshots**: If applicable
```

### Solution Documentation
```
**Problem**: What was wrong
**Root Cause**: Why it happened
**Solution**: How it was fixed
**Prevention**: How to avoid in future
**Related Issues**: Links to similar problems
```

## 🎯 Prevention Strategies

### Code Quality
- Use TypeScript strictly
- Implement comprehensive testing
- Follow coding standards
- Regular code reviews

### Error Prevention
- Validate all inputs
- Handle all error cases
- Use proper TypeScript types
- Test edge cases

### Performance Prevention
- Monitor bundle size
- Profile performance regularly
- Use React DevTools
- Implement proper caching

---

**Remember**: When troubleshooting, always start with the simplest explanation and work towards more complex causes. Document solutions for future reference.
