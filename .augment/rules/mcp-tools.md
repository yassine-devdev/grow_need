---
type: "agent_requested"
description: "Example description"
---
# MCP Tools Usage Guide
## GROW YouR NEED SaaS School Platform

## 🛠️ Available Tools Overview

### 📁 File Management Tools
- `view` - Examine files and directories
- `str-replace-editor` - Edit existing files
- `save-file` - Create new files
- `remove-files` - Delete files safely

### 🔍 Code Analysis Tools
- `codebase-retrieval` - Search and analyze codebase
- `git-commit-retrieval` - Analyze git history
- `diagnostics` - Get IDE error reports

### 🌐 Web Tools
- `web-search` - Search for information
- `web-fetch` - Fetch web content
- `open-browser` - Open URLs

### 🚀 Process Management
- `launch-process` - Run commands
- `read-process` - Read process output
- `write-process` - Send input to processes

### 📋 Task Management
- `view_tasklist` - View current tasks
- `add_tasks` - Create new tasks
- `update_tasks` - Update task status

## 🎯 Tool Usage Best Practices

### File Examination (`view`)
```
ALWAYS use view before editing files to understand current state
```

**Best Practices**:
- Use `search_query_regex` to find specific code patterns
- Use `view_range` for large files to focus on specific sections
- Check directory structure before making changes

**Example Usage**:
```
view path="components/modules" type="directory"
view path="App.tsx" type="file" search_query_regex="useEffect"
```

### File Editing (`str-replace-editor`)
```
ALWAYS read the file first, then make precise edits
```

**Best Practices**:
- Always include `instruction_reminder`
- Use exact string matching for `old_str`
- Include line numbers for disambiguation
- Make small, focused changes

**Example Usage**:
```
str-replace-editor:
  command: "str_replace"
  path: "App.tsx"
  instruction_reminder: "ALWAYS BREAK DOWN EDITS INTO SMALLER CHUNKS OF AT MOST 150 LINES EACH."
  old_str_1: "const [state, setState] = useState(false);"
  new_str_1: "const [state, setState] = useState<boolean>(false);"
  old_str_start_line_number_1: 15
  old_str_end_line_number_1: 15
```

### File Creation (`save-file`)
```
Use for new files only, never to overwrite existing files
```

**Best Practices**:
- Always include `instructions_reminder`
- Limit initial content to 300 lines
- Use `str-replace-editor` for additional content
- Follow project naming conventions

### Code Analysis (`codebase-retrieval`)
```
Use to understand existing patterns before implementing new features
```

**Best Practices**:
- Be specific in information requests
- Look for similar implementations
- Understand existing patterns
- Check for dependencies and imports

**Example Usage**:
```
codebase-retrieval:
  information_request: "Find all components that use the Icons system and how they import icons"
```

### Process Management (`launch-process`)
```
Use for running tests, builds, and development servers
```

**Best Practices**:
- Use `wait=true` for short commands
- Use `wait=false` for long-running processes
- Always specify `cwd` parameter
- Set appropriate `max_wait_seconds`

## 🔄 Common Workflows

### 1. Implementing New Feature
```
1. codebase-retrieval - Understand existing patterns
2. view - Examine related files
3. save-file - Create new component
4. str-replace-editor - Update imports/exports
5. launch-process - Run tests
6. diagnostics - Check for errors
```

### 2. Fixing Bugs
```
1. diagnostics - Identify error locations
2. view - Examine problematic files
3. codebase-retrieval - Find similar implementations
4. str-replace-editor - Apply fixes
5. launch-process - Test fixes
6. diagnostics - Verify resolution
```

### 3. Adding Tests
```
1. view - Examine component to test
2. codebase-retrieval - Find existing test patterns
3. save-file - Create test file
4. launch-process - Run tests
5. str-replace-editor - Fix failing tests
```

## ⚠️ Tool Usage Rules

### DO's
- ✅ Always read files before editing
- ✅ Use specific, descriptive search queries
- ✅ Include proper error handling
- ✅ Follow established patterns
- ✅ Test changes immediately
- ✅ Update documentation

### DON'Ts
- ❌ Never edit files without reading them first
- ❌ Don't make large changes in single edits
- ❌ Don't ignore diagnostic errors
- ❌ Don't skip testing after changes
- ❌ Don't hardcode values
- ❌ Don't break existing functionality

## 🚨 Error Prevention

### Before Making Changes
1. **Understand Context**: Use `codebase-retrieval` to understand existing patterns
2. **Check Current State**: Use `view` to see current file contents
3. **Verify Dependencies**: Check imports and exports
4. **Plan Changes**: Break large changes into small steps

### After Making Changes
1. **Check Diagnostics**: Use `diagnostics` to catch errors
2. **Run Tests**: Use `launch-process` to run relevant tests
3. **Verify Functionality**: Test the changed feature
4. **Update Documentation**: Keep docs current

## 📊 Task Management Integration

### Creating Tasks
```
add_tasks:
  tasks:
    - name: "Implement user authentication"
      description: "Add login/logout functionality with role-based access"
      state: "NOT_STARTED"
```

### Updating Progress
```
update_tasks:
  tasks:
    - task_id: "uuid-here"
      state: "IN_PROGRESS"
    - task_id: "uuid-here"
      state: "COMPLETE"
```

### Tracking Work
- Update task status when starting work
- Mark complete when all acceptance criteria met
- Add new tasks when discovering additional work
- Use task descriptions to track context

## 🎯 Quality Assurance

### Before Committing Changes
- [ ] All diagnostics clear
- [ ] Tests passing
- [ ] Code follows standards
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Error handling implemented

### Code Review Checklist
- [ ] Changes are minimal and focused
- [ ] Existing patterns followed
- [ ] TypeScript types included
- [ ] Error handling appropriate
- [ ] Performance considered
- [ ] Security implications reviewed

---

**Remember**: These tools are powerful - use them systematically and carefully to maintain code quality and project integrity.
