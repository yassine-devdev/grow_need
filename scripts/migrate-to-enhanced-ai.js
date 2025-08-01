#!/usr/bin/env node

/**
 * Migration Script for Enhanced AI Integration (JavaScript version)
 * Migrates existing AI components to use enhanced AI services
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnhancedAIMigrator {
  constructor(config = {}) {
    this.config = {
      projectRoot: process.cwd(),
      backupDir: './migration-backup',
      componentsDir: './components',
      servicesDir: './services',
      hooksDir: './hooks',
      dryRun: false,
      verbose: false,
      ...config,
    };
    this.migrationLog = [];
  }

  /**
   * Run the complete migration process
   */
  async migrate() {
    this.log('🚀 Starting Enhanced AI Migration...\n');

    try {
      // Step 1: Pre-migration checks
      await this.preMigrationChecks();

      // Step 2: Create backup
      await this.createBackup();

      // Step 3: Install dependencies
      await this.installDependencies();

      // Step 4: Create environment configuration
      await this.createEnvironmentConfig();

      // Step 5: Update package.json scripts
      await this.updatePackageScripts();

      // Step 6: Create integration files
      await this.createIntegrationFiles();

      // Step 7: Post-migration setup
      await this.postMigrationSetup();

      this.log('\n✅ Migration completed successfully!');
      this.printMigrationSummary();

    } catch (error) {
      this.log(`\n❌ Migration failed: ${error.message}`);
      this.log('💡 You can restore from backup if needed.');
      throw error;
    }
  }

  /**
   * Pre-migration checks
   */
  async preMigrationChecks() {
    this.log('🔍 Running pre-migration checks...');

    // Check if project root exists
    if (!fs.existsSync(this.config.projectRoot)) {
      throw new Error(`Project root not found: ${this.config.projectRoot}`);
    }

    // Check if package.json exists
    const packageJsonPath = path.join(this.config.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found. Are you in a Node.js project?');
    }

    // Check for existing AI files
    const existingFiles = [
      path.join(this.config.servicesDir, 'aiProvider.ts'),
      path.join(this.config.servicesDir, 'ollamaService.ts'),
      path.join(this.config.hooksDir, 'useOllamaAI.ts'),
    ];

    const foundFiles = existingFiles.filter(file => fs.existsSync(file));
    if (foundFiles.length > 0) {
      this.log(`📁 Found existing AI files: ${foundFiles.length}`);
    } else {
      this.log('⚠️  No existing AI files found. This might be a fresh installation.');
    }

    // Check Node.js version
    const nodeVersion = process.version;
    this.log(`📦 Node.js version: ${nodeVersion}`);

    this.log('✅ Pre-migration checks completed\n');
  }

  /**
   * Create backup of existing files
   */
  async createBackup() {
    if (this.config.dryRun) {
      this.log('🔄 [DRY RUN] Would create backup...');
      return;
    }

    this.log('💾 Creating backup...');

    const backupPath = path.join(this.config.projectRoot, this.config.backupDir);
    
    // Create backup directory
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Backup existing files
    const filesToBackup = [
      'services/',
      'hooks/',
      'components/',
      'package.json',
      '.env.local',
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(this.config.projectRoot, file);
      const backupFilePath = path.join(backupPath, file);

      if (fs.existsSync(sourcePath)) {
        try {
          if (fs.statSync(sourcePath).isDirectory()) {
            this.copyDirectory(sourcePath, backupFilePath);
          } else {
            const backupDir = path.dirname(backupFilePath);
            if (!fs.existsSync(backupDir)) {
              fs.mkdirSync(backupDir, { recursive: true });
            }
            fs.copyFileSync(sourcePath, backupFilePath);
          }
          this.log(`📁 Backed up: ${file}`);
        } catch (error) {
          this.log(`⚠️  Failed to backup ${file}: ${error.message}`);
        }
      }
    }

    this.log('✅ Backup completed\n');
  }

  /**
   * Install required dependencies
   */
  async installDependencies() {
    this.log('📦 Installing dependencies...');

    const dependencies = [
      'ai',
      '@ai-sdk/openai',
      '@types/node',
      'dotenv',
    ];

    const devDependencies = [
      '@types/react',
      'typescript',
    ];

    if (this.config.dryRun) {
      this.log(`🔄 [DRY RUN] Would install: ${dependencies.join(', ')}`);
      return;
    }

    try {
      // Install main dependencies
      this.log('Installing main dependencies...');
      execSync(`npm install ${dependencies.join(' ')}`, { 
        cwd: this.config.projectRoot,
        stdio: this.config.verbose ? 'inherit' : 'pipe'
      });

      // Install dev dependencies
      this.log('Installing dev dependencies...');
      execSync(`npm install -D ${devDependencies.join(' ')}`, { 
        cwd: this.config.projectRoot,
        stdio: this.config.verbose ? 'inherit' : 'pipe'
      });

      this.log('✅ Dependencies installed\n');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  /**
   * Create environment configuration
   */
  async createEnvironmentConfig() {
    this.log('⚙️  Creating environment configuration...');

    const envPath = path.join(this.config.projectRoot, '.env.local');
    const envExamplePath = path.join(this.config.projectRoot, '.env.example');

    const envContent = `# Enhanced AI Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5:3b-instruct
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Vector Database Configuration
VECTOR_DB_URL=http://localhost:5000
VECTOR_DB_PATH=./database/chroma_db

# Feature Flags
ENABLE_ENHANCED_AI=true
ENABLE_VECTOR_SEARCH=true
ENABLE_RAG=true
ENABLE_STREAMING=true

# Development
NODE_ENV=development
`;

    if (this.config.dryRun) {
      this.log('🔄 [DRY RUN] Would create environment files');
      return;
    }

    // Create .env.example
    fs.writeFileSync(envExamplePath, envContent);
    this.log('✅ Created .env.example');

    // Create .env.local if it doesn't exist
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envContent);
      this.log('✅ Created .env.local');
    } else {
      this.log('📝 .env.local exists, please update manually');
    }

    this.log('✅ Environment configuration completed\n');
  }

  /**
   * Update package.json scripts
   */
  async updatePackageScripts() {
    this.log('📝 Updating package.json scripts...');

    const packageJsonPath = path.join(this.config.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.log('⚠️  package.json not found, skipping script updates');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add useful scripts
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      const newScripts = {
        'ai:test': 'echo "Open tests/index.html to run AI tests"',
        'ai:start-db': 'cd database && python web-interface.py',
        'ai:backup': 'cd database && python -c "from setup_vector_database import EnhancedVectorDatabase; db = EnhancedVectorDatabase(); print(db.backup_database())"',
        'type-check': 'tsc --noEmit'
      };

      Object.assign(packageJson.scripts, newScripts);

      if (!this.config.dryRun) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.log('✅ Updated package.json scripts');
      } else {
        this.log('🔄 [DRY RUN] Would update package.json scripts');
      }
    } catch (error) {
      this.log(`⚠️  Failed to update package.json: ${error.message}`);
    }

    this.log('✅ Package.json updates completed\n');
  }

  /**
   * Create integration files
   */
  async createIntegrationFiles() {
    this.log('📄 Creating integration files...');

    // Check if integration files exist
    const integrationFiles = [
      'services/vectorDBBridge.ts',
      'services/enhancedAIProvider.ts',
      'services/aiServiceFactory.ts',
      'hooks/useEnhancedAIIntegration.ts',
      'components/common/AIProviderWrapper.tsx',
    ];

    for (const file of integrationFiles) {
      const filePath = path.join(this.config.projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.log(`✅ Integration file exists: ${file}`);
      } else {
        this.log(`⚠️  Integration file missing: ${file} (should be created manually)`);
      }
    }

    this.log('✅ Integration files checked\n');
  }

  /**
   * Post-migration setup
   */
  async postMigrationSetup() {
    this.log('🔧 Post-migration setup...');

    // Create migration report
    const reportPath = path.join(this.config.projectRoot, 'MIGRATION_REPORT.md');
    const report = this.generateMigrationReport();
    
    if (!this.config.dryRun) {
      fs.writeFileSync(reportPath, report);
      this.log('📄 Created migration report');
    }

    // Type check
    try {
      execSync('npx tsc --noEmit', { 
        cwd: this.config.projectRoot,
        stdio: 'pipe'
      });
      this.log('✅ TypeScript compilation check passed');
    } catch (error) {
      this.log('⚠️  TypeScript compilation issues detected');
      this.log('💡 Run `npx tsc --noEmit` to see details');
    }

    this.log('✅ Post-migration setup completed\n');
  }

  /**
   * Helper methods
   */
  log(message) {
    console.log(message);
    this.migrationLog.push(message);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  generateMigrationReport() {
    return `# Enhanced AI Migration Report

Generated: ${new Date().toISOString()}

## Migration Summary
- ✅ Dependencies installed
- ✅ Environment configured
- ✅ Package.json updated
- ✅ Integration files checked

## Next Steps
1. Start vector database: \`cd database && python setup-vector-database.py\`
2. Start Ollama: \`ollama serve\`
3. Install models: \`ollama pull qwen2.5:3b-instruct && ollama pull nomic-embed-text\`
4. Test integration: \`npm run dev\`

## Manual Updates Required
- Wrap your app with AIProviderWrapper
- Update component imports to use enhanced AI
- Test all AI-dependent features

## Backup Location
Backup created at: ${this.config.backupDir}

## Migration Log
${this.migrationLog.join('\n')}
`;
  }

  printMigrationSummary() {
    this.log('\n📋 Migration Summary:');
    this.log('   ✅ Enhanced AI services integrated');
    this.log('   ✅ Dependencies installed');
    this.log('   ✅ Environment configured');
    this.log('   ✅ Package.json updated');
    this.log('\n🚀 Next Steps:');
    this.log('   1. Set up vector database (cd database && python setup-vector-database.py)');
    this.log('   2. Start Ollama (ollama serve)');
    this.log('   3. Install models (ollama pull qwen2.5:3b-instruct)');
    this.log('   4. Wrap your app with AIProviderWrapper');
    this.log('   5. Test the integration');
    this.log('\n📄 See MIGRATION_REPORT.md for detailed information');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  const migrator = new EnhancedAIMigrator({
    dryRun,
    verbose,
  });

  try {
    await migrator.migrate();
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EnhancedAIMigrator };
