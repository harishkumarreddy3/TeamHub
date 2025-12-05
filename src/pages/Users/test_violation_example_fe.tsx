/** 
 * TEST FILE - Intentionally violates FE AGENTS.md guidelines for testing PR Agent
 * Use this file to create a PR and verify the agent catches guideline violations.
 * 
 * Project: TeamHub (FE Testing)
 * 
 * EXPECTED VIOLATIONS:
 * 1. Using useQuery directly in component (BLOCKED by ESLint per AGENTS.md)
 * 2. Using CircularProgress directly instead of Loading wra    pper
 * 3. Using enqueueSnackbar directly instead of snackbarHelper
 * 4. Wrong import order (not: React → external → internal)
 * 5. Using `any` type (should minimize any)
 * 6. Inline styles instead of sx prop for theme colors
 * 7. Missing Props interface
 * 8. Not destructuring props in signature
 * 9. Wrong conditional rendering order (Success before Loading)
 * 10. forwardRef without displayName
 * 11. Hardcoded user-facing strings (should use constants/strings.ts)
 * 12. Using useEffect for data fetching (should use React Query)
 */

// VIOLATION: Wrong import order - should be React → external → internal → CSS
import { useMyHook } from "../../hooks/useMyHook";
import { useState, useEffect, forwardRef } from "react";
import { Box, CircularProgress } from "@mui/material"; // VIOLATION: Direct CircularProgress import
import { useQuery } from "@tanstack/react-query"; // VIOLATION: Direct useQuery import in component
import { enqueueSnackbar } from "notistack"; // VIOLATION: Direct enqueueSnackbar import
import "./styles.css";
import axios from "axios";

// VIOLATION: Using `any` type - should use proper TypeScript types
const fetchUsers = async (): Promise<any> => {
  const response = await axios.get("/api/users");
  return response.data;
};

// VIOLATION: Missing Props interface with Props suffix
// VIOLATION: Not destructuring props in function signature
export const UserList = (props) => {
  // VIOLATION: Using useQuery directly in component - should wrap in custom hook
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // VIOLATION: Using useEffect for data fetching - should use React Query
  const [extraData, setExtraData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/extra")
      .then((res) => res.json())
      .then((data) => setExtraData(data));
  }, []);

  const handleClick = () => {
    // VIOLATION: Using enqueueSnackbar directly - should use toast from snackbarHelper
    enqueueSnackbar("User updated successfully", { variant: "success" });
  };

  // VIOLATION: Wrong conditional rendering order
  // Should be: Loading → Error → Empty → Success
  // But here we check data first, then loading
  if (data && data.length > 0) {
    return (
      // VIOLATION: Inline style with hardcoded theme color - should use sx prop
      <div style={{ backgroundColor: "#026AB7", padding: "16px" }}>
        {/* VIOLATION: Hardcoded user-facing string - should use constants/strings.ts */}
        <h1>User List</h1>
        {data.map((user: any) => (
          <div key={user.id}>{user.name}</div>
        ))}
        <button onClick={handleClick}>Update</button>
      </div>
    );
  }

  // VIOLATION: Using CircularProgress directly - should use Loading from components/shared/layout/Loading
  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    // VIOLATION: Hardcoded error message - should use displayMessage from constants/strings.ts
    return <div>Failed to load users</div>;
  }

  // VIOLATION: Hardcoded empty state message
  return <div>No users found</div>;
};

// VIOLATION: forwardRef without displayName
const CustomButton = forwardRef<HTMLButtonElement, { label: string }>(
  ({ label }, ref) => {
    return (
      <button ref={ref} style={{ color: "blue" }}>
        {label}
      </button>
    );
  }
);
// Missing: CustomButton.displayName = "CustomButton";

// VIOLATION: Default export for non-page component in .tsx file
// Per AGENTS.md, page components should use "export const Component"
export default UserList;


/* ============================================
   CORRECT EXAMPLE (for comparison):
   ============================================

import { useState, useCallback } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useUsers } from "../../hooks/react-query/useUsers";
import Loading from "../../components/shared/layout/Loading";
import ErrorDisplay from "../../components/shared/ErrorDisplay";
import EmptyContentDisplay from "../../components/shared/EmptyContentDisplay";
import { toast } from "../../utils/snackbarHelper";
import { displayMessage, toastMessage } from "../../constants/strings";

interface UserListProps {
  title: string;
  onUserSelect?: (userId: number) => void;
}

export const UserList = ({ title, onUserSelect }: UserListProps) => {
  const { data, isLoading, isError } = useUsers();

  const handleUpdate = useCallback(() => {
    toast(toastMessage.users.updateSuccess, { variant: "success" });
  }, []);

  // Correct order: Loading → Error → Empty → Success
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        primaryMessage={displayMessage.users.error}
        secondaryMessage={displayMessage.default.internalError}
        showReloadOption
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyContentDisplay
        primaryMessage={displayMessage.users.empty}
        secondaryMessage={displayMessage.default.emptyFilterResults}
      />
    );
  }

  return (
    <Box sx={{ backgroundColor: (theme) => theme.palette.primary.main, padding: 2 }}>
      <Typography variant="h5">{title}</Typography>
      {data.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </Box>
  );
};

*/

