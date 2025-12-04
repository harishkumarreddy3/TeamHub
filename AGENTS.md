# Operations IOL WebApp - AGENTS Development Rules

<!-- cSpell:ignore typeof Lato pangea remeda -->

This document defines all coding standards, patterns, and conventions for the operations-iol-webapp codebase.

---

## 🎯 Project Overview

**Tech Stack:**

- React 18.3 + TypeScript 5.4 (strict mode)
- Vite 6 (build tool)
- Material-UI (MUI) v6
- TanStack Query v5 (React Query)
- React Hook Form + Zod validation
- AWS Amplify (auth) + Cognito
- Sentry (error tracking)
- Split.io (feature flags)
- dayjs (dates)
- Leaflet + MapLibre (maps)
- Vitest (unit) + Playwright (E2E)

**Node Requirements:**

- Node: 18.x - 22.x
- NPM: 9.x - 10.x

---

## 📁 Folder Structure

```
src/
├── assets/              # Static images, SVGs, videos
├── components/
│   └── shared/          # Reusable UI components
├── constants/           # App constants, strings, filters
├── context/             # React Context providers
├── devtools/            # Developer tools
├── featureFlags/        # Feature flag hooks
├── hooks/               # Custom hooks
│   └── react-query/     # TanStack Query hooks (queries & mutations)
├── mocks/               # MSW mock handlers
├── pages/               # Page components (feature-based)
├── routes/              # React Router configuration
├── services/            # API services
├── stores/              # Zustand stores
├── styles/              # Global styles
├── types/               # TypeScript type definitions (.type.ts)
├── utils/               # Utility functions
├── main.tsx             # Entry point
├── theme.ts             # MUI theme
└── queryClientProvider.ts  # TanStack Query setup
```

**Key Principles:**

- Feature-based organization in `pages/`
- Shared components in `components/shared/`
- Colocate tests with source files
- Use `.type.ts` suffix for type-only files
- ALL TanStack Query hooks go in `hooks/react-query/`

---

## 🧩 Component Structure & Naming

### File Naming

- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `UserCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useDebounce.ts`)
- Types: `camelCase.type.ts` (e.g., `role.type.ts`)
- Utils: `camelCase.ts` (e.g., `apiUrls.ts`)
- Constants: `PascalCase.ts` or `camelCase.ts`
- Tests: `matchesFileName.test.ts(x)`
- E2E Tests: `kebab-case.spec.ts`
- Stories: `PascalCase.stories.tsx`

### Component Pattern

```tsx
// 1. Imports (organized: React → external → internal → CSS)
import { useState, useCallback } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useMyCustomHook } from "../../hooks/useMyCustomHook";

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  variant?: "primary" | "secondary";
}

// 3. Component (always destructure props in signature)
export const MyComponent = ({
  title,
  onSubmit,
  variant = "primary",
}: MyComponentProps) => {
  // 4. Hooks
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useMyQuery();

  // 5. Handlers
  const handleClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  // 6. Early returns (loading/error states)
  if (isLoading) return <Loading />;

  // 7. JSX
  return (
    <Stack spacing={2}>
      <Typography variant="h5">{title}</Typography>
      {/* ... */}
    </Stack>
  );
};
```

### forwardRef Pattern

When components need to expose refs to parent components:

```tsx
import { forwardRef } from "react";

interface MyComponentProps {
  label: string;
  onClick?: () => void;
}

const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ label, onClick }, ref) => {
    return (
      <div ref={ref} onClick={onClick}>
        {label}
      </div>
    );
  }
);

// RECOMMENDED: Set displayName for better debugging
MyComponent.displayName = "MyComponent";

export default MyComponent;
```

**When to use:**

- When parent needs to access DOM node
- When integrating with drag-and-drop libraries
- When programmatically focusing elements

**Note:** Setting `displayName` is recommended but not enforced. ~74% of forwardRef components in the codebase have displayName set.

### Page Components (React Router Lazy Loading)

```tsx
// ✅ GOOD - Named export called "Component"
export const Component = () => {
  return <div>My Page</div>;
};

// ❌ BAD - Default export breaks lazy loading
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Export Conventions

```tsx
// ✅ GOOD - Named exports (preferred for .ts files)
export const Button = ({ children }: Props) => <button>{children}</button>;

// ✅ GOOD - Default exports (allowed for all .tsx files per ESLint)
const Button = ({ children }: Props) => <button>{children}</button>;
export default Button;

// ✅ GOOD - Barrel exports for related components
// components/totalizer/index.ts
export const Totalizer = {
  Root: TotalizerRoot,
  Content: TotalizerContent,
};

// ⚠️ AVOID - Re-export everything (makes imports unclear)
export * from "./components";
```

**ESLint Configuration:**

- **Named exports** are preferred for `.ts` files (`import/no-default-export` is a warning)
- **Default exports** are explicitly allowed for:
  - All `.tsx` component files
  - All `.stories.tsx` Storybook files
  - Config files (`vite.config.ts`, `vitest.config.ts`)
  - Wrapper components (`Loading.tsx`, `DragIcon.tsx`, etc.)

**Page Components Exception:**

- Page components use `export const Component` for React Router lazy loading
- This is the only exception where named export is required in pages

---

## 🪝 Custom Hooks

### Hook Conventions

```tsx
// Always prefix with "use"
export const useFormState = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Return object for multiple values
  return { value, setValue, error, setError };
};

// Return tuple for simple hooks
export const useToggle = (initial = false): [boolean, () => void] => {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
};
```

### React Hook Form Pattern

```tsx
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Zod schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  items: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

// 2. Form hook
export const useMyForm = (defaultValues?: FormData) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onTouched", // Validate on blur
    defaultValues:
      defaultValues ||
      {
        /* defaults */
      },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return { form, fields, append, remove };
};
```

### FormProvider Pattern

For nested forms or when form context needs to be shared:

```tsx
import { FormProvider, useFormContext } from "react-hook-form";

// Parent component
export const MyForm = () => {
  const methods = useForm<FormData>();

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NestedFormField />
      </form>
    </FormProvider>
  );
};

// Child component
const NestedFormField = () => {
  const { register, formState } = useFormContext<FormData>();
  return <input {...register("fieldName")} />;
};
```

---

## 🌐 API & Data Fetching

### **CRITICAL: TanStack Query Rules**

1. ❌ **NEVER** use `useQuery` directly in components (ESLint enforced)
2. ✅ **ALWAYS** wrap `useMutation` in custom hooks in `hooks/react-query/` (convention enforced)
3. ✅ **ALWAYS** place all query/mutation hooks in `hooks/react-query/`

**Enforcement Details:**

- `useQuery`: Blocked by ESLint (hard enforcement)
- `useMutation`: Not blocked by ESLint, but 99% wrapped in custom hooks (soft enforcement via team convention)
- **Exceptions**: Only 2 direct `useMutation` calls exist outside hooks (legacy code in outbound linehaul)

### Query Hook Pattern

```tsx
// hooks/react-query/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { http } from "../../utils/httpCommon";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await http.get("/users");
      return userSchema.array().parse(data); // Zod validation
    },
  });
};
```

### Mutation Hook Pattern

```tsx
// hooks/react-query/useUpdateUser.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../utils/snackbarHelper";
import { toastMessage } from "../../constants/strings";

export const useUpdateUser = ({
  onSuccess,
  onSettled,
}: {
  onSuccess?: (data: User) => void;
  onSettled?: () => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      const { data } = await http.put(`/users/${user.id}`, user);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast(toastMessage.users.updateSuccess, { variant: "success" });
      onSuccess?.(data);
    },
    onError: () => {
      toast(toastMessage.generics.error, { variant: "error" });
    },
    onSettled,
  });
};
```

### Optimistic Updates Pattern

For immediate UI feedback before server response:

```tsx
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Item) => {
      const { data } = await http.put(`/items/${item.id}`, item);
      return data;
    },
    // Save current state before mutation
    onMutate: async (updatedItem) => {
      // Cancel outgoing queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ["items", updatedItem.id] });

      // Get current data
      const previousItem = queryClient.getQueryData<Item>([
        "items",
        updatedItem.id,
      ]);

      // Optimistically update cache
      queryClient.setQueryData<Item>(["items", updatedItem.id], updatedItem);

      // Return context with previous value
      return { previousItem };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(["items", variables.id], context.previousItem);
      }
      toast(toastMessage.generics.error, { variant: "error" });
    },
    // Refetch after success or error
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", variables.id] });
    },
  });
};
```

### Query Keys

```tsx
// Define as constants or factory functions
const userKeys = {
  all: ["users"] as const,
  user: (id: number) => ["users", id] as const,
  byServiceCenter: (sicId: number) =>
    ["users", "serviceCenter", sicId] as const,
};
```

### API URLs: useApiUrls() vs Static Import

**When to use `useApiUrls()`:**

- When endpoints have different v1/v2 versions (e.g., inbound, zones, routes)
- The hook supports feature flag switching between API versions
- Add ESLint disable comment to avoid exhaustive-deps warning

```tsx
// ✅ GOOD - Endpoint has v1/v2 versions
export const useZones = (serviceCenterId: number) => {
  const urls = useApiUrls();

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["zones", serviceCenterId],
    queryFn: async () => {
      const { data } = await http.get(urls.getZones, {
        params: { sicId: serviceCenterId },
      });
      return zonesSchema.parse(data);
    },
  });
};
```

**When to use static `apiUrls` import:**

- When endpoints are identical in both apiUrls and apiUrlsV2
- No need for ESLint disable comment
- Cleaner code without unnecessary hook

```tsx
// ✅ GOOD - Endpoint is identical in v1 and v2
import { apiUrls } from "../../utils/apiUrls";

export const useRecentAccounts = () =>
  useQuery({
    queryKey: ["backOffice", "accounts", "recent"],
    queryFn: async () => {
      const { data } = await http.get(apiUrls.getRecentAccounts);
      return accountsSchema.parse(data);
    },
  });
```

**How to check:** Compare the endpoint in both `apiUrls.ts` and `apiUrlsV2.ts`. If identical, use static import.

**Important:** Query keys should only include dynamic parameters, never URLs.

```tsx
// ✅ GOOD - Only logical identifiers
queryKey: ["users", userId];

// ❌ BAD - Don't include URLs
queryKey: ["users", userId, url];
```

### HTTP Client

```tsx
import { http } from "../../utils/httpCommon";

// All requests use http instance (auto-adds auth, parses dates)
const { data } = await http.get<User[]>("/users");
await http.post<User>("/users", newUser);
await http.put<User>(`/users/${id}`, updatedUser);
await http.delete(`/users/${id}`);
```

### Axios Error Handling

```tsx
import axios from "axios";

// Check if error is from Axios
if (axios.isAxiosError(error)) {
  if (error.response?.status === 400) {
    // Handle bad request
  }
  if (error.response?.status === 404) {
    // Handle not found
  }
}
```

---

## 🎨 Styling & UI (Material-UI)

### Styling Approaches

**Preferred: Use `sx` Prop**

```tsx
// ✅ PREFERRED - sx prop with theme access
<Box
  sx={{
    backgroundColor: (theme) => theme.palette.primary.main,
    padding: 2,
    gap: 1,
  }}
/>
```

**Acceptable: Inline Styles for Simple Cases**

```tsx
// ✅ ACCEPTABLE - inline styles for simple positioning/sizing
<Box style={{ position: "absolute", top: 0, right: 0 }} />
<Icon style={{ width: 24, height: 24 }} />
```

**Guidelines:**

- Prefer `sx` for theme-aware styling (colors, spacing, breakpoints)
- Inline `style` is acceptable for simple positioning, dimensions, or z-index
- Never hardcode theme colors in inline styles - use `sx` for those

### Theme Configuration

All customizations in `src/theme.ts`:

```tsx
import { createTheme } from "@mui/material";

export const AppTheme = createTheme({
  palette: {
    primary: { main: "#026AB7" },
    // ... custom colors
  },
  typography: { fontFamily: "Lato" },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "capitalize" },
      },
    },
  },
});
```

### Restricted Components (Use Wrappers)

- ❌ `CircularProgress` → ✅ `components/shared/layout/Loading`
- ❌ `TimePicker` → ✅ `components/shared/TimePicker`
- ❌ `DragIndicator` → ✅ `components/shared/icons/DragIcon`
- ❌ `enqueueSnackbar` → ✅ `utils/snackbarHelper.ts`

### Layout Components

```tsx
// Prefer Stack for flex layouts
<Stack direction="row" spacing={2} alignItems="center">
  <Button>Submit</Button>
  <Button>Cancel</Button>
</Stack>

// Box for generic containers
<Box sx={{ padding: 2 }}>Content</Box>
```

---

## 🔒 TypeScript Conventions

### Type Definitions

```tsx
// 1. File naming: .type.ts suffix
// role.type.ts
import { z } from "zod";

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissionIds: z.array(z.number()),
});

export type Role = z.infer<typeof roleSchema>;

// 2. Component props: interface with Props suffix
interface ButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

// 3. Enums: use string unions or as const
type Status = "pending" | "approved" | "rejected";

export const ROUTES = {
  HOME: "/",
  INBOUND: "/inbound",
} as const;
```

### Strict Rules

- ❌ **Minimize `any`** - Use `unknown` or proper types when possible
- ✅ **Strict mode enabled**
- ✅ **Destructure props in function signatures**
- ✅ **Use type inference where possible**

**Note:** While `@typescript-eslint/no-explicit-any` is currently set to "off" in ESLint due to migration effort, minimizing `any` is still a strong team convention for all new code. Please avoid introducing `any` types, even though this is not yet enforced by ESLint.

```tsx
// ✅ GOOD
export const processUser = ({ id, name }: { id: number; name: string }) => {
  // ...
};

// ⚠️ AVOID (but not currently enforced)
export const processUser = (user: any) => {
  // ...
};
```

### Exhaustive Type Checking

For switch statements and conditional logic:

```tsx
type EditType = "Create" | "Edit" | "Delete";

function handleEdit(editType: EditType) {
  switch (editType) {
    case "Create":
      return createItem();
    case "Edit":
      return updateItem();
    case "Delete":
      return deleteItem();
    default:
      return assertExhaustive(editType);
  }
}

// Ensures all cases are handled at compile time
function assertExhaustive(value: never): never {
  throw new Error(`Unhandled case: ${value}`);
}
```

---

## 🚩 Feature Flags (Split.io)

```tsx
import { useIsFeatureFlagEnabled } from "../../featureFlags/useIsFeatureFlagEnabled";

export const MyComponent = () => {
  const isNewFeatureEnabled = useIsFeatureFlagEnabled("my-feature-flag-name");

  if (isNewFeatureEnabled) {
    return <NewFeature />;
  }
  return <OldFeature />;
};
```

**Naming convention**: `{domain}-{ticket}-{description}-client`

- Example: `"inbound-3697-refresh-after-auto-sequence-client"`

**All flags defined in**: `src/featureFlags/useIsFeatureFlagEnabled.ts`

---

## 📅 Date/Time Handling

### dayjs Configuration

Plugins initialized in `dayjsConfig.ts` (called in `main.tsx`):

- objectSupport, utc, timezone, toObject, weekOfYear, isoWeek

### Date Format Constants

**Preferred: Use DaylightDateFormat enum**

```tsx
import { DaylightDateFormat } from "../../constants/DaylightDateFormat";
import dayjs from "dayjs";

// ✅ PREFERRED - Use enum
dayjs(date).format(DaylightDateFormat.DATE); // "MM/DD/YYYY"
dayjs(date).format(DaylightDateFormat.DATE_TIME_12); // "MM/DD/YYYY hh:mm A"
```

**Acceptable: Inline formats for MUI DatePicker/TimePicker**

```tsx
// ✅ ACCEPTABLE - MUI component prop formats
<DatePicker
  format="MM/DD/YY"
  value={date}
  onChange={handleChange}
/>

<DateTimePicker format="MM/DD/YY - HH:mm" />
```

**Guidelines:**

- Use `DaylightDateFormat` enum for all dayjs formatting in TypeScript/JavaScript
- Inline format strings are acceptable for MUI DatePicker/TimePicker component props
- Use `DaylightDateFormat.ISO_DATE` for API requests and data storage

**Available formats**:

- `DATE` = "MM/DD/YYYY"
- `TIME_12` = "hh:mm A"
- `DATE_TIME_12` = "MM/DD/YYYY hh:mm A"
- `ISO_DATE` = "YYYY-MM-DD"
- `MILITARY_TIME` = "HHmm"
- Many more...

### Date Utilities

```tsx
import {
  utcTimestampToLocal,
  formatDate,
  timeToFormat,
} from "../../utils/dateTimeHelper";

utcTimestampToLocal(date, DaylightDateFormat.DATE_TIME_12);
formatDate(dateString, DaylightDateFormat.DATE);
timeToFormat("14:30", DaylightDateFormat.TIME_12); // "02:30 PM"
```

---

## 📊 Tables (TanStack Table)

```tsx
import Table from "../../components/shared/table/Table";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusTag status={row.original.status} />,
  },
];

export const MyTable = () => {
  const { data, isLoading } = useMyData();
  const tableRef = useRef<TableRef>(null);

  return (
    <Table
      ref={tableRef}
      data={data}
      columns={columns}
      caption="My Data Table" // REQUIRED for accessibility
      rowSelectionMode="checkbox" // "checkbox" | "checkbox-and-row-click" | "unselectable"
      isLoading={isLoading}
      onRowSelection={(selectedIds) => {
        /* ... */
      }}
      contextMenuActions={(row) => [
        { label: "Edit", onClick: () => handleEdit(row) },
      ]}
    />
  );
};
```

**Table ref methods**: `tableRef.current?.clearSelection()`

---

## 🖱️ Drag and Drop

### Three Libraries (Use Cases)

1. **@atlaskit/pragmatic-drag-and-drop** (Preferred for new features)

```tsx
import { useDraggable } from "../shared/dragndrop/hooks/useDraggable";

const { state, preview, closestEdge } = useDraggable({
  id: String(item.id),
  index,
  handle: dragHandleRef,
  element: itemRef,
  getInitialData: () => ({ item, index }),
  canDrag: () => isDraggable,
  canDrop: ({ source }) => source.data.id !== item.id,
});
```

2. **@hello-pangea/dnd** (Legacy - keep existing)
3. **react-dnd** (Legacy - keep existing)

---

## 🗺️ Maps (Leaflet + MapLibre)

```tsx
import {
  LeafletMap,
  INITIAL_MAP_ZOOM,
} from "../../components/shared/LeafletMap";
import { Marker, Popup } from "react-leaflet";

export const MyMapView = () => {
  const mapRef = useRef<L.Map>(null);

  return (
    <LeafletMap
      ref={mapRef}
      center={[37.7749, -122.4194]}
      zoom={INITIAL_MAP_ZOOM}
      isLoading={isLoadingData}
      showLayersControl={true}
    >
      <Marker position={[37.7749, -122.4194]}>
        <Popup>Location details</Popup>
      </Marker>
    </LeafletMap>
  );
};
```

**HERE Maps Integration**:

```tsx
import { useHereRoutes } from "../../hooks/react-query/hereAPI/useHereRoutes";
import { useHereAutocomplete } from "../../hooks/react-query/hereAPI/useHereAutocomplete";

const { data: routes } = useHereRoutes(plans, sicGeocode);
const { data: suggestions } = useHereAutocomplete(
  queryText,
  atLatLng,
  inCountry
);
```

---

## 📜 List Virtualization (react-window)

For lists with 50+ items:

```tsx
import { List, useDynamicRowHeight } from "react-window";

const StopsPanel = ({ stops }: Props) => {
  const rowHeight = useDynamicRowHeight();

  return (
    <List
      rowComponent={StopTileRowComponent}
      rowCount={stops.length}
      rowHeight={rowHeight}
      rowProps={{ stops, onStopSelected }}
    />
  );
};
```

---

## 🧪 Testing Patterns

### Unit Tests (Vitest)

```tsx
// MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render the title", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should call onSubmit when button is clicked", async () => {
    const onSubmit = vi.fn();
    render(<MyComponent onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

**Conventions**:

- Colocate with source (`.test.ts(x)`)
- Use `describe` and `it`/`test`
- Test naming: descriptive sentences

### E2E Tests (Playwright)

```ts
// tests/mocked/feature/my-feature.spec.ts
import { test, expect } from "@playwright/test";

test("should display success message when form is submitted", async ({
  page,
}) => {
  await page.goto("/my-feature");
  await page.getByRole("textbox", { name: /name/i }).fill("John Doe");
  await page.getByRole("button", { name: /submit/i }).click();
  await expect(page.getByText(/success/i)).toBeVisible();
});
```

**Locator preference**:

1. `getByRole()` - Semantic roles (best)
2. `getByLabel()` - Form labels
3. `getByPlaceholder()` - Input placeholders
4. `getByText()` - Visible text
5. Avoid: test IDs, classes

### MSW Mocking

```tsx
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ]);
  }),
];
```

---

## 🎨 Conditional Rendering Pattern

**Order is critical**:

```tsx
export const MyComponent = () => {
  const { data, isLoading, isError } = useMyQuery();

  // 1. Loading (first)
  if (isLoading) {
    return <Loading />;
  }

  // 2. Error (second)
  if (isError) {
    return (
      <ErrorDisplay
        primaryMessage={displayMessage.myFeature.error}
        secondaryMessage={displayMessage.default.internalError}
        showReloadOption
      />
    );
  }

  // 3. Empty (third)
  if (!data || data.length === 0) {
    return (
      <EmptyContentDisplay
        primaryMessage={displayMessage.myFeature.empty}
        secondaryMessage={displayMessage.default.emptyFilterResults}
      />
    );
  }

  // 4. Success (render content)
  return <Box>{/* actual content */}</Box>;
};
```

---

## 🎭 Standard UI Components

### Loading States

```tsx
import Loading from "../../components/shared/layout/Loading";

// Default loading spinner
<Loading />

// With custom size and label
<Loading size="6rem" label="users" />

// Full-page loading overlay
import LoadingBackdrop from "../../components/shared/LoadingBackdrop";
<LoadingBackdrop />
```

### Error States

```tsx
import ErrorDisplay from "../../components/shared/ErrorDisplay";

// Standard error display
<ErrorDisplay
  primaryMessage="Failed to load data"
  secondaryMessage="Please try again later"
  showReloadOption
/>;

// Global error boundary
import { ErrorBoundary } from "../../components/ErrorBoundary";

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>;
```

### Empty States

```tsx
import EmptyContentDisplay from "../../components/shared/EmptyContentDisplay";

<EmptyContentDisplay
  primaryMessage="No shipments found"
  secondaryMessage="Try adjusting your filters"
/>;
```

### Page Not Found

```tsx
import PageNotFound from "../../pages/PageNotFound";

// In route error handlers
if (notFound) {
  return <PageNotFound />;
}
```

---

## 📝 Constants & Strings

### Centralized Strings

```tsx
// constants/strings.ts
export const displayMessage = {
  default: {
    noResults: "Uh oh! We couldn't find any results for you.",
  },
  users: {
    error: "Failed to load users",
  },
};

export const toastMessage = {
  users: {
    updateSuccess: "User updated successfully.",
  },
};

// Usage
import { toastMessage } from "../../constants/strings";
toast(toastMessage.users.updateSuccess, { variant: "success" });
```

### Empty/Null Placeholders

```tsx
import { DASH_PLACEHOLDER } from "../../constants/dashPlaceholder";

// ✅ GOOD
const displayValue = value ?? DASH_PLACEHOLDER; // "-"

// ❌ BAD
const displayValue = value ?? "-";
```

---

## 🛠️ Utility Functions

### Number & Currency

```tsx
import { formatUsd, formatUsdWithoutSign } from "../../utils/currencyFormat";

formatUsd(1234.56); // "$1,234.56"
formatUsdWithoutSign(1234.56); // "1,234.56"
```

### String Manipulation

```tsx
import { capitalize } from "../../utils/capitalize";
import { toTitleCase } from "../../utils/toTitleCase";

capitalize("hello"); // "Hello"
toTitleCase("hello world"); // "Hello World"
```

### Pluralization

```tsx
import pluralize from "pluralize";

// ✅ GOOD
`${count} ${pluralize("shipment", count)}`; // "1 shipment" or "2 shipments"
pluralize(
  "route",
  count,
  true
) // "3 routes" (includes count)
// ❌ BAD
`${count} shipment${count > 1 ? "s" : ""}`;
```

### Text Formatting

```tsx
// Table formatting
import { formatDateTimeTableField } from "../../utils/tableFormat";
formatDateTimeTableField(date, DaylightDateFormat.DATE, timeZone);
```

---

## 🎨 Icons

### Custom SVG Icon Pattern

```tsx
import { SvgIcon, SvgIconProps } from "@mui/material";

const MyIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24" role="img" titleAccess="My Icon">
    <path d="..." fill={props.fill} />
  </SvgIcon>
);

export default MyIcon;
```

### Icon Colors

```tsx
import { iconFillColors } from "../../components/shared/icons/Icon.types";

<MyIcon fill={iconFillColors.darkGray} />
<MyIcon fill={iconFillColors.primaryDark} />
```

**Available**: `primaryDark`, `darkGray`, `lightGray`, `gray`

### Z-Index Management

**Preferred: Use zIndexes constant**

```tsx
import { zIndexes } from "../../utils/zIndexes";

<Dialog sx={{ zIndex: zIndexes.dialog }} />
<Tooltip sx={{ zIndex: zIndexes.tooltip }} />
```

**Acceptable: Hardcoded values for component-specific layering**

```tsx
// ✅ ACCEPTABLE - component-specific stacking
<Box sx={{ zIndex: 1000, position: "relative" }} />
<Icon sx={{ zIndex: 1 }} /> // Minor elevation adjustments
```

**Guidelines:**

- Use `zIndexes` constant for global UI elements (dialogs, tooltips, panels)
- Hardcoded values are acceptable for component-internal layering
- Document the reason if using a hardcoded value > 100
- Available constants: `summaryPanel`, `routeDetails`, `dialog`, `tooltip`, `mapButtons`, etc.

---

## 🧠 State Management

### React Context Pattern

```tsx
type MyContextValue = {
  data: MyData[];
  updateData: (data: MyData[]) => void;
};

const MyContext = createContext<MyContextValue | null>(null);

export function MyContextProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<MyData[]>([]);

  return (
    <MyContext.Provider value={{ data, updateData: setData }}>
      {children}
    </MyContext.Provider>
  );
}

// Custom hook with error handling
export function useMyContext(): MyContextValue {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyContextProvider");
  }
  return context;
}
```

### Zustand (For Global State Outside React)

```tsx
import { create } from "zustand";

type MyStoreState = {
  count: number;
  increment: () => void;
};

export const useMyStore = create<MyStoreState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

**Use when**: State needed outside React (e.g., query callbacks)

### Session Storage

```tsx
import useSessionStorage from "../hooks/utils/useSessionStorage";

export const useMyState = () => {
  const [value, setValue] = useSessionStorage<MyType>("storage-key");
  return [value, setValue] as const;
};
```

**Prefer sessionStorage over localStorage** (clears on tab close)

---

## ⚡ Performance Optimization

### React.memo

```tsx
// ✅ Use for expensive, frequently re-rendered components
export const ExpensiveRow = memo(({ data }: Props) => {
  // Complex rendering
  return <div>{/* ... */}</div>;
});
```

### useMemo

```tsx
// ✅ GOOD - Expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);

// ❌ BAD - Simple operations
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName]
);
```

### useCallback

```tsx
// ✅ GOOD - Passed to memoized children
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);

// ❌ BAD - Not in dependencies or passed to children
const handleSimpleClick = useCallback(() => {
  console.log("clicked");
}, []);
```

---

## 🔧 Environment Variables

```tsx
import { env } from "./utils/env";

// ✅ GOOD - Type-safe, validated
const apiUrl = env.VITE_API_URL;

// ❌ BAD - Unsafe
const apiUrl = import.meta.env.VITE_API_URL;
```

**All env vars**:

- Must be prefixed with `VITE_`
- Validated with Zod in `src/utils/env.ts`
- Type-safe throughout app

---

## 🔐 Security

### Log Sanitization

```tsx
import { sanitizeLog } from "./utils/logSanitizer";

// ✅ GOOD - Sanitized
console.error(sanitizeLog(userMessage));

// ❌ BAD - Direct logging
console.error(userMessage);
```

### Authentication Flow

1. `main.tsx` checks `useAuthenticatedUser()`
2. Authenticated → `<ProtectedRoutes user={user} />`
3. Not authenticated → `<UnprotectedRoutesProvider />`
4. Access token auto-added to requests via axios interceptor

---

## 🎨 Storybook

```tsx
// ComponentName.stories.tsx
import type { Meta, StoryFn } from "@storybook/react";
import { ComponentName } from "./ComponentName";

const meta = {
  title: "shared/ComponentName",
  component: ComponentName,
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["primary", "secondary"],
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;

const Template: StoryFn<typeof ComponentName> = (args) => (
  <ComponentName {...args} />
);

export const Default = Template.bind({});
Default.args = {
  variant: "primary",
};
```

---

## 🔀 React Router Patterns

### Loader Functions

```tsx
import { LoaderFunction, redirect, generatePath } from "react-router-dom";

const redirectWithSelectedDate =
  (path: string): LoaderFunction =>
  ({ request }) => {
    const url = new URL(request.url);
    const selectedDate = url.searchParams.get("selectedDate");

    return selectedDate
      ? redirect(generatePath(path, { date: selectedDate }))
      : redirect(path);
  };

// Usage in routes
{
  path: "my-route",
  loader: redirectWithSelectedDate("/my-route/:date")
}
```

---

## 📋 Import Organization (ESLint Enforced)

```tsx
// 1. React
import { useState, useEffect } from "react";

// 2. External libraries (alphabetical)
import { Box, Stack } from "@mui/material";
import dayjs from "dayjs";

// 3. Internal imports (relative paths)
import { useMyHook } from "../../hooks/useMyHook";
import { MyType } from "../../types/myType.type";

// 4. CSS (last)
import "./styles.css";
```

---

## 💬 Comment Conventions

### CSpell

```tsx
// CSpell:ignore maplibre pronotes uccc
import maplibre from "maplibre-gl";
```

### TODOs

```tsx
// ✅ GOOD - References ticket
// TODO(BOD-188): Refactor this component

// ❌ BAD
// TODO: Fix this later
```

---

## 🔍 ESLint Configuration

### Strictly Enforced Import Restrictions

ESLint prevents direct imports of certain components/functions:

```tsx
// ❌ BLOCKED by ESLint
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers";
import { enqueueSnackbar } from "notistack";

// ✅ ALLOWED - Use wrappers
import { useMyQuery } from "../../hooks/react-query/useMyQuery";
import Loading from "../../components/shared/layout/Loading";
import DragIcon from "../../components/shared/icons/DragIcon";
import TimePicker from "../../components/shared/TimePicker";
import { toast } from "../../utils/snackbarHelper";
```

### Override Rules for Specific Files

Some files are exempt from certain rules:

```javascript
// .eslintrc.cjs overrides
{
  files: ["src/hooks/react-query/**"],
  rules: { "no-restricted-imports": "off" }  // Can use useQuery directly
},
{
  files: ["src/**/*.tsx", ".storybook/*"],
  rules: { "import/no-default-export": "off" }  // Can use default exports
},
{
  files: ["*.config.ts"],
  rules: { "no-restricted-properties": "off" }  // Can use process.env
}
```

### TypeScript Strict Rules (Partially Disabled)

The following TypeScript rules are currently disabled due to migration effort:

- `@typescript-eslint/no-explicit-any` - Use sparingly in new code
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/no-misused-promises`

**Note:** While not enforced, avoid these patterns in new code when possible.

---

## 🪝 Git Hooks & Pre-commit

**Husky + lint-staged** runs on `git commit`:

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --cache --fix --max-warnings 0",
      "prettier --write",
      "vitest related --run"
    ],
    "tests/**/*.{js,jsx,ts,tsx}": [
      "eslint --cache --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.config.ts": ["prettier --write"],
    "*.{css,md}": "prettier --write"
  }
}
```

**What happens:**

1. ESLint auto-fixes
2. Prettier formats
3. **Vitest runs tests for changed files**
4. Commit fails if any step fails

**Setup**: Run `npm run prepare` after cloning

---

## 📝 Pull Request Checklist

**Required**:

- [ ] Code wrapped in Feature Flag (except bugs)
- [ ] Feature flag requested from APEX Release team
- [ ] Comprehensive tests (Vitest/Playwright)
- [ ] Manual testing completed
- [ ] Minimize `any` types (or justified with comments)
- [ ] Remove commented-out code (or justify with explanation)
- [ ] TODOs reference JIRA tickets when tracking specific work
- [ ] Acceptance criteria covered

---

## 🚨 Error Monitoring

**Sentry** initialized in `main.tsx`:

- 100% error sampling
- 100% trace sampling
- Per-environment configuration
- Console error capture
- Session replay (currently disabled)

---

## 📚 Utility Libraries

- **tiny-invariant**: Runtime assertions
- **remeda**: Functional utilities (alternative to lodash)
- **pluralize**: Text pluralization
- **zod**: Runtime validation
- **dayjs**: Date manipulation

---

## ⚠️ Common Pitfalls & Best Practices

### Strictly Enforced (ESLint)

1. ❌ Using `useQuery` directly in components → ✅ Wrap in custom hooks
2. ❌ Direct `CircularProgress` import → ✅ Use `components/shared/layout/Loading`
3. ❌ Direct `enqueueSnackbar` → ✅ Use `utils/snackbarHelper.ts`
4. ❌ Direct `DragIndicator` import → ✅ Use `components/shared/icons/DragIcon`
5. ❌ Direct `TimePicker` import → ✅ Use `components/shared/TimePicker`

### Strongly Recommended (Not Enforced)

6. ⚠️ Using `any` type without justification
7. ⚠️ Deeply nested ternaries in JSX
8. ⚠️ Using `useEffect` for data fetching (prefer React Query)
9. ⚠️ Leaving commented-out code (remove or add explanation)
10. ⚠️ Hardcoded user-facing strings (use `constants/strings.ts`)
11. ⚠️ Including URLs in query keys (only dynamic params)
12. ⚠️ Using `useApiUrls()` when endpoints are identical in v1/v2
13. ⚠️ Direct `useMutation` in pages (wrap in custom hooks per convention)

### Flexible Guidelines (Context-Dependent)

13. 🔵 Inline `style` prop - acceptable for simple positioning/sizing
14. 🔵 Hardcoded z-index - acceptable for component-internal layering
15. 🔵 Hardcoded date formats - acceptable for MUI DatePicker format props
16. 🔵 TODOs - should reference JIRA tickets when possible

---

## ✅ New Code Checklist

Before submitting:

**Required (ESLint Enforced):**

- [ ] No direct `useQuery` imports in components
- [ ] Use wrapper components (Loading, TimePicker, DragIcon, snackbarHelper)
- [ ] Props destructured in signature
- [ ] ESLint passes (0 warnings)
- [ ] Prettier applied

**Strongly Recommended:**

- [ ] TypeScript types defined (minimize `any`)
- [ ] Exports follow convention (named for .ts, flexible for .tsx)
- [ ] React Query hooks wrapped in custom hooks (in `hooks/react-query/`)
- [ ] Query keys use only dynamic params (no URLs)
- [ ] API URLs: use `useApiUrls()` for v1/v2 variants, static `apiUrls` if identical
- [ ] User-facing strings in `constants/strings.ts`
- [ ] API calls use `http` from `utils/httpCommon.ts`
- [ ] Feature flags use `useIsFeatureFlagEnabled`
- [ ] Forms use React Hook Form + Zod
- [ ] Tests colocated (`.test.ts(x)`)
- [ ] Imports organized (React → external → internal)
- [ ] Git hooks pass (tests run)

**Good Practices (When Applicable):**

- [ ] Prefer `sx` prop over inline styles (except simple positioning)
- [ ] Use `DaylightDateFormat` enum (except MUI DatePicker format props)
- [ ] Prefer `zIndexes` constant (except component-internal layering)
- [ ] forwardRef components should have `displayName` for easier debugging
- [ ] TODOs should reference JIRA tickets when tracking known work

---

## 📚 Key Files Reference

- **Theme**: `src/theme.ts`
- **Strings**: `src/constants/strings.ts`
- **API URLs**: `src/utils/apiUrls.ts`
- **HTTP Client**: `src/utils/httpCommon.ts`
- **Env Vars**: `src/utils/env.ts`
- **Query Client**: `src/queryClientProvider.ts`
- **Date Formats**: `src/constants/DaylightDateFormat.ts`
- **Z-Indexes**: `src/utils/zIndexes.ts`
- **Feature Flags**: `src/featureFlags/useIsFeatureFlagEnabled.ts`
- **Loading**: `src/components/shared/layout/Loading.tsx`
- **Error Display**: `src/components/shared/ErrorDisplay.tsx`
- **Empty Display**: `src/components/shared/EmptyContentDisplay.tsx`

---

**Last Updated**: January 2025

**Recent Changes:**

- Clarified styling guidelines to reflect actual practice (sx preferred, inline acceptable)
- Updated z-index guidance to allow component-specific hardcoded values
- Documented date format exceptions for MUI DatePicker props
- Changed forwardRef displayName from "REQUIRED" to "RECOMMENDED"
- Reorganized Common Pitfalls section into enforcement tiers
- Added ESLint configuration section explaining actual enforcement
- Updated New Code Checklist to distinguish required vs. recommended practices
