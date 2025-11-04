const fs = require("fs");
const path = require("path");

const baseDir = path.resolve("client/src");
const ignoredFolders = ["node_modules", "dist", "build", "assets", ".git"];
const orphanedImports = [];
const orphanedRoutes = [];

/**
 * Recursively find all JS/JSX/TSX files
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!ignoredFolders.some((f) => filePath.includes(f))) {
        findFiles(filePath, fileList);
      }
    } else if (/\.(js|jsx|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Check if a file exists (with extensions .js, .jsx, .tsx)
 */
function fileExists(importPath, currentFile) {
  if (importPath.startsWith(".")) {
    const dir = path.dirname(currentFile);
    const resolved = path.resolve(dir, importPath);
    
    // Try different extensions
    const extensions = [".js", ".jsx", ".tsx", ".ts", ""];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return true;
      }
      // Also try as directory with index
      const indexPath = path.join(fullPath, "index.js");
      if (fs.existsSync(indexPath)) {
        return true;
      }
      const indexJsx = path.join(fullPath, "index.jsx");
      if (fs.existsSync(indexJsx)) {
        return true;
      }
    }
    return false;
  }
  // External packages - assume they exist
  return true;
}

/**
 * Scan for orphaned imports
 */
function scanOrphanedImports() {
  const files = findFiles(baseDir);
  
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    
    // Match import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node_modules, external packages, and special imports
      if (
        !importPath.startsWith(".") ||
        importPath.startsWith("http") ||
        importPath.startsWith("data:")
      ) {
        continue;
      }
      
      if (!fileExists(importPath, file)) {
        orphanedImports.push({
          file: path.relative(process.cwd(), file),
          importPath,
          line: match[0]
        });
      }
    }
  });
}

/**
 * Scan for orphaned routes (components that don't exist)
 */
function scanOrphanedRoutes() {
  const appFile = path.join(baseDir, "App.jsx");
  if (!fs.existsSync(appFile)) {
    return;
  }
  
  const content = fs.readFileSync(appFile, "utf8");
  
  // Find Route components that reference deleted components
  const deletedComponents = [
    "QuickPractice",
    "CambridgeTestLayout",
    "AIPracticeView",
    "PracticePlanPanel"
  ];
  
  deletedComponents.forEach((compName) => {
    // Check if component is imported
    const importRegex = new RegExp(`import\\s+${compName}\\s+from\\s+['"]([^'"]+)['"]`, "g");
    if (importRegex.test(content)) {
      // Check if Route uses it
      const routeRegex = new RegExp(`<Route[^>]*${compName}[^>]*/>`, "g");
      if (routeRegex.test(content)) {
        orphanedRoutes.push({
          component: compName,
          file: "client/src/App.jsx"
        });
      }
    }
  });
}

/**
 * Fix orphaned imports by commenting them out
 */
function fixOrphanedImports() {
  const fixedFiles = new Set();
  
  orphanedImports.forEach(({ file, importPath, line }) => {
    const fullPath = path.resolve(file);
    let content = fs.readFileSync(fullPath, "utf8");
    
    // Comment out the import line
    const escapedLine = line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^\\s*${escapedLine.replace(/\n/g, "\\s*")}`, "gm");
    content = content.replace(regex, (match) => {
      return `// ⚠️ Removed orphan import (${importPath})\n// ${match.trim()}`;
    });
    
    fs.writeFileSync(fullPath, content, "utf8");
    fixedFiles.add(file);
  });
  
  return fixedFiles.size;
}

/**
 * Fix orphaned routes by removing import and route declaration
 */
function fixOrphanedRoutes() {
  if (orphanedRoutes.length === 0) return 0;
  
  const appFile = path.resolve("client/src/App.jsx");
  let content = fs.readFileSync(appFile, "utf8");
  let modified = false;
  
  orphanedRoutes.forEach(({ component }) => {
    // Remove import
    const importRegex = new RegExp(
      `import\\s+${component}\\s+from\\s+['"][^'"]+['"];?\\s*\\n?`,
      "g"
    );
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `// ⚠️ Removed orphan import (${component})\n`);
      modified = true;
    }
    
    // Remove Route
    const routeRegex = new RegExp(
      `\\s*<Route[^>]*${component}[^>]*/>\\s*\\n?`,
      "g"
    );
    if (routeRegex.test(content)) {
      content = content.replace(routeRegex, `// ⚠️ Removed orphan route (${component})\n`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(appFile, content, "utf8");
    return orphanedRoutes.length;
  }
  
  return 0;
}

// Main execution
console.log("🔍 Scanning for orphaned imports and routes...\n");

scanOrphanedImports();
scanOrphanedRoutes();

if (orphanedImports.length === 0 && orphanedRoutes.length === 0) {
  console.log("✅ No orphaned imports or routes found. All clean!");
  process.exit(0);
}

// Report findings
if (orphanedImports.length > 0) {
  console.log(`🧹 Found ${orphanedImports.length} orphaned import(s):`);
  orphanedImports.forEach(({ file, importPath }) => {
    console.log(`   - ${file} imports ${importPath}`);
  });
  console.log();
}

if (orphanedRoutes.length > 0) {
  console.log(`🧹 Found ${orphanedRoutes.length} orphaned route(s):`);
  orphanedRoutes.forEach(({ component, file }) => {
    console.log(`   - ${file} uses deleted component: ${component}`);
  });
  console.log();
}

// Fix issues
let fixedImports = 0;
let fixedRoutes = 0;

if (orphanedImports.length > 0) {
  fixedImports = fixOrphanedImports();
  console.log(`✅ Fixed ${fixedImports} orphaned import(s).`);
}

if (orphanedRoutes.length > 0) {
  fixedRoutes = fixOrphanedRoutes();
  console.log(`✅ Fixed ${fixedRoutes} orphaned route(s).`);
}

console.log(`\n🎯 Cleanup complete! Fixed ${fixedImports + fixedRoutes} issue(s).`);

