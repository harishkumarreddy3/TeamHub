
import { useMyHook } from "../../hooks/useMyHook";
import { useState, useEffect, forwardRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import "./styles.css";
import axios from "axios";

const fetchUsers = async (): Promise<any> => {
  const response = await axios.get("/api/users");
  return response.data;
};

export const UserList = (props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [extraData, setExtraData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/extra")
      .then((res) => res.json())
      .then((data) => setExtraData(data));
  }, []);

  const handleClick = () => {
    enqueueSnackbar("User updated successfully", { variant: "success" });
  };

  if (data && data.length > 0) {
    return (
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

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <div>Failed to load users</div>;
  }

  return <div>No users found</div>;
};

const CustomButton = forwardRef<HTMLButtonElement, { label: string }>(
  ({ label }, ref) => {
    return (
      <button ref={ref} style={{ color: "blue" }}>
        {label}
      </button>
    );
  }
);
export default UserList;


