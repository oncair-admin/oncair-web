# Copilot Instructions for CairOn Frontend

This is an Angular 18 application (`Spike`). Use this guide for effective contributions to the codebase.

## Quick Commands

**Development:**
- `npm start` — Start dev server (http://localhost:4200)
- `npm run watch` — Continuous development build

**Quality Checks:**
- `npm run lint` — Run ESLint on `src/**/*.ts` and `src/**/*.html`
- `npm test` — Run Karma/Jasmine unit tests
- `npm test -- --browsers=Chrome --watch` — Run single test suite in watch mode

**Production:**
- `npm run build` — Create production build in `dist/Spike`

## Project Structure

```
src/app/
├── components/       Reusable UI components (shared across pages)
├── pages/           Routed screens (route-level feature components)
├── layouts/         Page shells (FullComponent for main layout)
├── services/        Domain services (API calls via ApiController)
├── interceptors/    HTTP interceptors (auth.interceptor.ts for tokens)
├── models/          Shared TypeScript interfaces
├── lookups/         Lookup/reference data
├── app.routes.ts    Application routing with lazy-loaded features
└── app.config.ts    Angular 18 provideApplicationConfig setup
services/            Top-level services (e.g., branch.service.ts)
src/assets/
├── i18n/           i18n JSON translation files (@ngx-translate)
├── scss/           Shared SCSS styles (imported in styles.scss)
└── images/         Static images
src/environments/   Environment-specific config (development/production)
```

## Architecture Patterns

### HTTP Requests
- **ApiController** (`services/CarRental.serviceEnd.ts`) — Central HTTP client
  - Services inject `ApiController` and call `getApi(endpoint)` → returns `Observable<any>`
  - Common response shape: `{ succeeded: boolean, data: T, message: string }`
- **Auth Interceptor** — Handles token attachment and refresh via HTTP interceptor provider

### Routing
- Lazy-loaded feature modules via `loadChildren` in `app.routes.ts`
- Example: Dashboard loads via `import('./pages/pages.routes').then(m => m.PagesRoutes)`

### Styling & UI
- **CSS Framework:** Bootstrap 5.3 + Material Design (Angular Material 18)
- **Material Modules:** Centralized in `material.module.ts` (form controls, navigation, layout, data tables, etc.)
- **SCSS:** Component-level (2-space indentation, single quotes in TypeScript)
- **Icons:** TablerIcons (angular-tabler-icons) and FontAwesome 7

### i18n
- Translation library: `@ngx-translate/core` with HTTP loader
- i18n files in `src/assets/i18n/` (e.g., `en.json`, `ar.json`)

### Real-time Communication
- SignalR (`@microsoft/signalr`) available; check top-level services for usage patterns

## Naming & Conventions

### Components
- **Selector:** `app-feature-name` (kebab-case with `app` prefix, element selector)
- **Files:** `feature-name.component.ts`, `feature-name.component.html`, `feature-name.component.scss`, `feature-name.component.spec.ts` (colocated)
- Example: `app-car-card.component.ts`

### Directives
- **Selector:** `[appHighlight]` (camelCase with `app` prefix, attribute selector)

### Services
- **Files:** Feature-oriented names (e.g., `branch.service.ts`, not `data.service.ts`)
- **Injection:** Use `providedIn: 'root'` for singleton services
- **Responses:** Return `Observable<any>` from API methods; consumers handle typing

### Code Style
- **Indentation:** 2 spaces
- **Quotes:** Single quotes in TypeScript
- **Line endings:** Final newline, trim trailing whitespace
- **UTF-8 files** always

### TypeScript
- `noImplicitOverride: true` — Mark overridden methods with `override`
- `noPropertyAccessFromIndexSignature: true` — Type-safe property access
- `strictInjectionParameters: true` — Strict DI type checking in templates
- `strictTemplates: true` — Full template type checking

## Testing

**Framework:** Karma + Jasmine

- Place tests next to source code (e.g., `my-component.component.spec.ts` next to `my-component.component.ts`)
- Coverage is minimal; add focused tests when changing components, services, or routes
- Run tests before submitting changes: `npm test`

## Configuration & Deployment

**Environment Files:**
- `src/environments/environment.ts` — Development config
- Build automatically selects the right environment

**Runtime Config:**
- Optional: `src/assets/config.json` for runtime-loaded config (not versioned; document required keys in PRs)

**Deployment:**
- Built output: `dist/Spike/`
- Netlify config: `netlify.toml` (SPA redirect enabled)

## Pull Request Checklist

- [ ] Run `npm run lint` — No linting errors
- [ ] Run `npm test` — Existing tests still pass; new features have focused tests
- [ ] Commit message: Short, imperative (e.g., "Add branch filter to dashboard")
- [ ] Include brief summary, testing notes, and screenshots for UI changes
- [ ] Link to issue/task if available
- [ ] **Configuration changes:** Note in PR if editing `src/environments`, `src/assets/config.json`, or `netlify.toml`
- [ ] **Secrets:** Never commit tokens, API keys, or credentials

## Common Patterns

### Creating a New Page
1. Create folder in `src/app/pages/feature-name/`
2. Generate component: `ng generate component pages/feature-name/feature-name`
3. Add route in appropriate `.routes.ts` file
4. Import into layout if navigation needed

### Calling an API
```typescript
// In service
constructor(private apiController: ApiController) {}

getItems(): Observable<any> {
  return this.apiController.getApi('api/Items/getItems');
}

// In component
constructor(private itemService: ItemService) {}

ngOnInit() {
  this.itemService.getItems().subscribe(response => {
    if (response.succeeded) {
      this.items = response.data;
    }
  });
}
```

### Adding Material Components
1. Material modules are already centralized in `material.module.ts`
2. Import `MaterialModule` in `app.config.ts` (already done)
3. Use Material components directly in templates (e.g., `<mat-card>`, `<mat-button>`)

## Files to Know

- `app.config.ts` — Global provider config (HTTP, routing, i18n, animations, Material)
- `app.routes.ts` — Main route definitions
- `auth.interceptor.ts` — Token handling and request/response interception
- `material.module.ts` — All Material module exports
- `eslint.config.js` — Linting rules (component/directive selector naming, etc.)
- `tsconfig.json` — TypeScript compiler options (strict mode off but controlled strictness)
