#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeChunks() {
  console.log('\n🔍 Bundle Analysis Report\n');
  console.log('=' .repeat(80));
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Dist folder not found. Run "npm run build" first.');
    return;
  }

  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.log('❌ Assets folder not found in dist.');
    return;
  }

  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));

  // Analyze JavaScript chunks
  console.log('\n📦 JavaScript Chunks:');
  console.log('-'.repeat(80));
  
  const jsChunks = jsFiles.map(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const name = file.replace(/\-[a-f0-9]+\.js$/, '');
    return {
      name,
      file,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size)
    };
  }).sort((a, b) => b.size - a.size);

  let totalJSSize = 0;
  jsChunks.forEach((chunk, index) => {
    totalJSSize += chunk.size;
    const status = chunk.size > 500000 ? '🔴' : chunk.size > 250000 ? '🟡' : '🟢';
    console.log(`${status} ${(index + 1).toString().padStart(2)}. ${chunk.name.padEnd(25)} ${chunk.sizeFormatted.padStart(10)} (${chunk.file})`);
  });

  // Analyze CSS files
  console.log('\n🎨 CSS Files:');
  console.log('-'.repeat(80));
  
  const cssChunks = cssFiles.map(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const name = file.replace(/\-[a-f0-9]+\.css$/, '');
    return {
      name,
      file,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size)
    };
  }).sort((a, b) => b.size - a.size);

  let totalCSSSize = 0;
  cssChunks.forEach((chunk, index) => {
    totalCSSSize += chunk.size;
    const status = chunk.size > 100000 ? '🔴' : chunk.size > 50000 ? '🟡' : '🟢';
    console.log(`${status} ${(index + 1).toString().padStart(2)}. ${chunk.name.padEnd(25)} ${chunk.sizeFormatted.padStart(10)} (${chunk.file})`);
  });

  // Summary
  console.log('\n📊 Summary:');
  console.log('-'.repeat(80));
  console.log(`Total JavaScript: ${formatBytes(totalJSSize)}`);
  console.log(`Total CSS: ${formatBytes(totalCSSSize)}`);
  console.log(`Total Assets: ${formatBytes(totalJSSize + totalCSSSize)}`);
  console.log(`Number of JS chunks: ${jsChunks.length}`);
  console.log(`Number of CSS files: ${cssChunks.length}`);

  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('-'.repeat(80));
  
  const largeChunks = jsChunks.filter(chunk => chunk.size > 500000);
  if (largeChunks.length > 0) {
    console.log('🔴 Large chunks detected (>500KB):');
    largeChunks.forEach(chunk => {
      console.log(`   - ${chunk.name}: ${chunk.sizeFormatted}`);
    });
    console.log('   Consider further splitting these chunks.');
  }

  const mediumChunks = jsChunks.filter(chunk => chunk.size > 250000 && chunk.size <= 500000);
  if (mediumChunks.length > 0) {
    console.log('🟡 Medium chunks detected (250-500KB):');
    mediumChunks.forEach(chunk => {
      console.log(`   - ${chunk.name}: ${chunk.sizeFormatted}`);
    });
    console.log('   Monitor these chunks for growth.');
  }

  const optimalChunks = jsChunks.filter(chunk => chunk.size <= 250000);
  if (optimalChunks.length > 0) {
    console.log('🟢 Optimal chunks detected (<250KB):');
    console.log(`   ${optimalChunks.length} chunks are well-sized.`);
  }

  // Performance insights
  console.log('\n⚡ Performance Insights:');
  console.log('-'.repeat(80));
  
  if (jsChunks.length > 20) {
    console.log('⚠️  High number of chunks may impact HTTP/2 performance');
  }
  
  if (totalJSSize > 2000000) {
    console.log('⚠️  Total JS size is quite large (>2MB)');
  }
  
  const coreChunks = jsChunks.filter(chunk => 
    chunk.name.includes('react') || 
    chunk.name.includes('vendor') || 
    chunk.name.includes('app-main')
  );
  
  if (coreChunks.length > 0) {
    console.log('📱 Core chunks (loaded first):');
    coreChunks.forEach(chunk => {
      console.log(`   - ${chunk.name}: ${chunk.sizeFormatted}`);
    });
  }

  // Check for bundle analysis file
  const analysisFile = path.join(distPath, 'bundle-analysis.html');
  if (fs.existsSync(analysisFile)) {
    console.log('\n🔍 Detailed Analysis:');
    console.log('-'.repeat(80));
    console.log(`Visual bundle analysis available at: ${analysisFile}`);
    console.log('Open this file in your browser for interactive analysis.');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Analysis complete!\n');
}

// Run the analysis
analyzeChunks();
