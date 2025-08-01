#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.join(__dirname, '../src');

// Component template for missing components
const createComponentTemplate = (componentName, category) => `import React from 'react';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className = '' }) => {
  return (
    <GlassmorphicContainer className={\`p-6 \${className}\`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">${componentName}</h2>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
          <div className="text-blue-400 text-lg mb-2">🚀 ${category} Module</div>
          <p className="text-gray-300">
            This is the ${componentName} component for the ${category} section.
            Real functionality will be implemented here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Feature 1</h3>
            <p className="text-gray-400 text-sm">Core functionality placeholder</p>
            <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Action
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Feature 2</h3>
            <p className="text-gray-400 text-sm">Advanced functionality placeholder</p>
            <button className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
              Configure
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Feature 3</h3>
            <p className="text-gray-400 text-sm">Integration functionality placeholder</p>
            <button className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm">
              Integrate
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          Component: ${componentName} | Category: ${category} | Status: Functional Placeholder
        </div>
      </div>
    </GlassmorphicContainer>
  );
};

export default ${componentName};
`;

// Extract imports from SchoolHubModule
function extractImportsFromSchoolHub() {
  const schoolHubPath = path.join(srcPath, 'components/modules/school-hub/SchoolHubModule.tsx');
  
  if (!fs.existsSync(schoolHubPath)) {
    console.log('❌ SchoolHubModule.tsx not found');
    return [];
  }
  
  const content = fs.readFileSync(schoolHubPath, 'utf8');
  const importRegex = /import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"];/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const [, componentName, relativePath] = match;
    const category = relativePath.split('/')[0];
    imports.push({
      componentName,
      relativePath,
      category,
      fullPath: path.join(srcPath, 'components/modules/school-hub', relativePath + '.tsx')
    });
  }
  
  return imports;
}

// Check if component file exists
function checkComponentExists(componentPath) {
  return fs.existsSync(componentPath);
}

// Create missing component
function createMissingComponent(componentInfo) {
  const { componentName, category, fullPath } = componentInfo;
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
  
  // Create component file
  const componentContent = createComponentTemplate(componentName, category);
  fs.writeFileSync(fullPath, componentContent);
  console.log(`✅ Created component: ${componentName} at ${fullPath}`);
}

// Main validation function
function validateComponents() {
  console.log('🔍 Validating School Hub Components...\n');
  console.log('=' .repeat(80));
  
  const imports = extractImportsFromSchoolHub();
  
  if (imports.length === 0) {
    console.log('❌ No imports found in SchoolHubModule.tsx');
    return;
  }
  
  console.log(`Found ${imports.length} component imports to validate:\n`);
  
  let missingCount = 0;
  let existingCount = 0;
  const missingComponents = [];
  
  imports.forEach((componentInfo, index) => {
    const { componentName, category, fullPath } = componentInfo;
    const exists = checkComponentExists(fullPath);
    
    if (exists) {
      console.log(`✅ ${(index + 1).toString().padStart(2)}. ${componentName.padEnd(25)} (${category})`);
      existingCount++;
    } else {
      console.log(`❌ ${(index + 1).toString().padStart(2)}. ${componentName.padEnd(25)} (${category}) - MISSING`);
      missingComponents.push(componentInfo);
      missingCount++;
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 Summary:`);
  console.log(`   Existing components: ${existingCount}`);
  console.log(`   Missing components: ${missingCount}`);
  console.log(`   Total components: ${imports.length}`);
  
  if (missingComponents.length > 0) {
    console.log('\n🔧 Creating missing components...\n');
    
    missingComponents.forEach(componentInfo => {
      createMissingComponent(componentInfo);
    });
    
    console.log(`\n✅ Created ${missingComponents.length} missing components!`);
  }
  
  // Group by category
  const byCategory = imports.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp.componentName);
    return acc;
  }, {});
  
  console.log('\n📋 Components by Category:');
  console.log('-'.repeat(80));
  Object.entries(byCategory).forEach(([category, components]) => {
    console.log(`${category.toUpperCase()}:`);
    components.forEach(comp => console.log(`   - ${comp}`));
    console.log('');
  });
  
  console.log('🎉 Component validation complete!\n');
}

// Run validation
validateComponents();
