# Coding Standards
## GROW YouR NEED SaaS School Platform

## 🎯 Code Quality Principles

1. **Consistency**: Follow established patterns throughout the codebase
2. **Readability**: Write self-documenting code with clear naming
3. **Maintainability**: Structure code for easy modification and extension
4. **Performance**: Consider performance implications of all changes
5. **Security**: Always validate inputs and handle errors securely

## 📁 File Organization Standards

### Component Structure
```typescript
// ComponentName.tsx
import React from 'react';
import { Icons } from '../../icons';
import './ComponentName.css';

interface ComponentNameProps {
  // Props interface
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className="component-name-container">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### CSS File Naming
- Use kebab-case: `component-name.css`
- Match component file name
- Use BEM methodology for class names

### Import Order
1. React and React-related imports
2. Third-party libraries
3. Internal components and utilities
4. CSS imports (last)

## 🏗️ Component Standards

### Props Interface
```typescript
interface ComponentProps {
  // Required props first
  title: string;
  onSubmit: (data: FormData) => void;
  
  // Optional props with defaults
  isLoading?: boolean;
  className?: string;
  
  // Complex types
  items: Array<{
    id: string;
    name: string;
    value: number;
  }>;
}
```

### State Management
```typescript
// Use descriptive state names
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState<FormData>({});
const [error, setError] = useState<string | null>(null);

// Use useCallback for event handlers
const handleSubmit = useCallback((data: FormData) => {
  // Handler logic
}, [dependencies]);
```

### Error Handling
```typescript
// Always handle errors gracefully
try {
  const result = await apiCall();
  setData(result);
} catch (error) {
  console.error('API call failed:', error);
  setError('Failed to load data. Please try again.');
}
```

## 🎨 CSS Standards

### Class Naming Convention
```css
/* Component container */
.component-name-container {
  /* Styles */
}

/* Element within component */
.component-name-header {
  /* Styles */
}

/* Modifier classes */
.component-name-container.loading {
  /* Loading state styles */
}

/* State classes */
.component-name-button:hover {
  /* Hover styles */
}
```

### CSS Custom Properties
```css
/* Use existing CSS variables */
.my-component {
  background: var(--glass-background-base);
  border: var(--glass-border);
  border-radius: var(--border-radius-global);
}
```

## 🔧 TypeScript Standards

### Type Definitions
```typescript
// Use descriptive type names
type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

// Interface for complex objects
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Generic types when appropriate
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

### Function Signatures
```typescript
// Clear parameter and return types
const processUserData = (
  users: User[],
  filter: (user: User) => boolean
): User[] => {
  return users.filter(filter);
};

// Async functions
const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    const response = await api.getUser(userId);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};
```

## 🔐 Security Standards

### Input Validation
```typescript
// Always validate inputs
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user inputs
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### API Key Handling
```typescript
// Never hardcode API keys
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}
```

## 🧪 Testing Standards

### Test File Naming
- Use `.test.tsx` for component tests
- Use `.test.ts` for utility tests
- Place tests adjacent to source files

### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation
  });

  it('should handle error states', () => {
    // Test implementation
  });
});
```

## 📝 Documentation Standards

### Component Documentation
```typescript
/**
 * A reusable button component with loading and disabled states
 * 
 * @param title - The button text
 * @param onClick - Handler for click events
 * @param isLoading - Whether to show loading spinner
 * @param disabled - Whether the button is disabled
 */
interface ButtonProps {
  title: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}
```

### Code Comments
```typescript
// Explain complex logic
const calculateGrade = (scores: number[]): string => {
  // Filter out invalid scores and calculate average
  const validScores = scores.filter(score => score >= 0 && score <= 100);
  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  
  // Convert to letter grade using standard scale
  if (average >= 90) return 'A';
  if (average >= 80) return 'B';
  if (average >= 70) return 'C';
  if (average >= 60) return 'D';
  return 'F';
};
```

## ⚡ Performance Standards

### Component Optimization
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  // Component logic
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for stable references
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### Bundle Optimization
```typescript
// Use dynamic imports for code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

## 🚫 Code Review Checklist

Before submitting code:
- [ ] Follows naming conventions
- [ ] Includes proper TypeScript types
- [ ] Has appropriate error handling
- [ ] Includes necessary tests
- [ ] No console.log statements in production code
- [ ] No hardcoded values or API keys
- [ ] Follows component structure standards
- [ ] CSS follows naming conventions
- [ ] Performance considerations addressed

---

**Remember**: These standards ensure consistency, maintainability, and quality across the entire codebase.
