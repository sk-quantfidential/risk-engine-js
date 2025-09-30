# Tailwind CSS v4 Migration Notes

## What Changed

Tailwind CSS v4 introduces a completely new configuration approach using CSS-first configuration instead of JavaScript config files.

### Key Changes

1. **No more `tailwind.config.ts`**
   - Removed JavaScript configuration file
   - All configuration now in CSS using `@theme` directive

2. **New Import Syntax**
   ```css
   /* Old (v3) */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* New (v4) */
   @import "tailwindcss";
   ```

3. **CSS Variables for Theme**
   ```css
   @theme {
     --color-background: #0a0f14;
     --color-primary: #00ff88;
     --font-mono: 'JetBrains Mono', monospace;
   }
   ```

4. **PostCSS Plugin Change**
   ```js
   // Old
   plugins: {
     tailwindcss: {},
   }

   // New
   plugins: {
     '@tailwindcss/postcss': {},
   }
   ```

5. **No More `@apply`**
   - Replaced with raw CSS
   - More explicit, better performance

## Files Modified

- ✅ `app/globals.css` - Converted to v4 syntax
- ✅ `postcss.config.mjs` - Updated plugin
- ✅ `package.json` - Added `@tailwindcss/postcss`
- ❌ `tailwind.config.ts` - Removed (no longer needed)

## Benefits of v4

1. **Better Performance** - CSS-first approach is faster
2. **Simpler Configuration** - All in one CSS file
3. **Better IntelliSense** - CSS variables are easier to autocomplete
4. **More Explicit** - No magic `@apply`, just regular CSS

## Custom Theme Preserved

All our custom war-room military theme colors are preserved:

```css
--color-background: #0a0f14       /* Deep tactical black */
--color-primary: #00ff88          /* Neon green */
--color-danger: #ff3366           /* Alert red */
--color-warning: #ffaa00          /* Caution orange */
--color-info: #00ccff             /* Intel blue */
```

## How to Use Custom Colors in Components

Instead of Tailwind utility classes, use CSS variables:

```tsx
// Use CSS variables directly
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Content
</div>

// Or use the component classes defined in globals.css
<div className="panel">
  <h2 className="panel-header">Title</h2>
</div>
```

## Reference

- [Tailwind CSS v4 Beta Docs](https://tailwindcss.com/docs/v4-beta)
- [Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [@theme Directive](https://tailwindcss.com/docs/functions-and-directives#theme)

---

**Result**: Application builds successfully with zero Tailwind errors ✅
