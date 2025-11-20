# GitUML Instructions for Automatic Class Diagram Generation

## Overview
GitUML is a tool that automatically generates UML class diagrams from your source code. This guide will help you use GitUML to create class diagrams for your Food Ordering Application.

## Method 1: Using GitUML Web Service

### Step 1: Prepare Your Repository
1. Ensure your code is committed and pushed to GitHub
2. Make sure your repository is public (or you have access credentials for private repos)

### Step 2: Access GitUML
1. Go to [GitUML.com](https://www.gituml.com/)
2. Sign in with your GitHub account (OAuth authentication)

### Step 3: Create a New Diagram
1. Click on "New Diagram" or "Create Diagram"
2. Select your repository: `FoodApp_Angular`
3. Choose the branch (usually `main` or `master`)

### Step 4: Select Files for Backend Diagram
For the **Backend Class Diagram**, select these files:
```
backend/src/models/user.model.ts
backend/src/models/food.model.ts
backend/src/routers/user.router.ts
backend/src/routers/food.router.ts
backend/src/routers/order.router.ts
backend/src/server.ts
```

### Step 5: Select Files for Frontend Diagram
For the **Frontend Class Diagram**, select these files:
```
frontend/src/app/shared/models/user.ts
frontend/src/app/shared/models/food.ts
frontend/src/app/shared/models/carts.ts
frontend/src/app/shared/models/cartsItems.ts
frontend/src/app/shared/models/order.ts
frontend/src/app/shared/models/tag.ts
frontend/src/app/services/user.service.ts
frontend/src/app/services/food.service.ts
frontend/src/app/services/cart.service.ts
frontend/src/app/services/order.service.ts
frontend/src/app/components/pages/home/home.component.ts
frontend/src/app/components/pages/food-page/food-page.component.ts
frontend/src/app/components/pages/cart-page/cart-page.component.ts
frontend/src/app/components/pages/login-page/login-page.component.ts
frontend/src/app/components/pages/register-page/register-page.component.ts
frontend/src/app/components/pages/checkout-page/checkout-page.component.ts
```

### Step 6: Generate and Customize
1. Click "Generate Diagram"
2. GitUML will automatically parse your TypeScript files and create class diagrams
3. You can customize the diagram:
   - Rearrange classes
   - Show/hide attributes and methods
   - Adjust relationships
   - Change colors and styles

### Step 7: Export
1. Click "Export" or "Download"
2. Choose your preferred format:
   - PNG (for images)
   - SVG (for scalable vector graphics)
   - PDF (for documents)

## Method 2: Using GitUML CLI (Command Line)

### Installation
```bash
npm install -g @gituml/cli
```

### Generate Diagram
```bash
# For backend
gituml generate --input "backend/src/**/*.ts" --output backend-diagram.png

# For frontend
gituml generate --input "frontend/src/app/**/*.ts" --output frontend-diagram.png
```

## Method 3: Using VS Code Extension

### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "GitUML" or "PlantUML"
4. Install the extension

### Usage
1. Open your TypeScript files
2. Right-click and select "Generate UML Diagram"
3. The diagram will be generated automatically

## Method 4: Using PlantUML (Alternative)

PlantUML is another tool that can generate UML diagrams from text descriptions. See the `class-diagram.puml` file included in this project.

### Online Editor
1. Go to [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copy the contents of `class-diagram.puml`
3. Paste and generate the diagram

### VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open `class-diagram.puml`
3. Press Alt+D to preview
4. Export as PNG/SVG

## Tips for Better Diagrams

1. **Organize by Layers**: Create separate diagrams for:
   - Models/Entities
   - Services
   - Components/Controllers
   - Routers

2. **Show Relationships**: Ensure relationships are visible:
   - Dependencies (uses)
   - Associations (has-a)
   - Compositions (contains)
   - Inheritances (is-a)

3. **Filter Attributes**: Hide getters/setters and focus on important properties

4. **Group Related Classes**: Use packages or namespaces to group related classes

5. **Add Notes**: Include notes explaining complex relationships

## Troubleshooting

### Issue: GitUML doesn't recognize TypeScript
- **Solution**: Make sure your files have proper TypeScript syntax
- GitUML supports TypeScript, but complex generics might need manual adjustment

### Issue: Missing relationships
- **Solution**: Manually add relationships in GitUML editor
- Or use the PlantUML file for more control

### Issue: Diagram is too cluttered
- **Solution**: Create separate diagrams for different layers
- Filter out less important methods/attributes

### Issue: Can't access private repository
- **Solution**: 
  - Make repository public temporarily
  - Or use GitUML CLI with local files
  - Or use PlantUML with local files

## Recommended Workflow

1. **Start with GitUML**: Use GitUML to generate initial diagrams automatically
2. **Refine Manually**: Adjust the generated diagrams in GitUML editor
3. **Export**: Save as PNG/SVG for documentation
4. **Document**: Add the diagrams to your project documentation

## Additional Resources

- [GitUML Documentation](https://www.gituml.com/docs)
- [PlantUML Documentation](https://plantuml.com/)
- [UML Class Diagram Guide](https://www.uml-diagrams.org/class-diagrams.html)

