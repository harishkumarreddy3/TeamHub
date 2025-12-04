import { useQuery } from "@tanstack/react-query";
import { userSchema, User } from "../../types/user.type";

// Mock data for demo purposes
const mockUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "guest" },
];

// Simulated API call
const fetchUsers = async (): Promise<User[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Validate with Zod schema
  return userSchema.array().parse(mockUsers);
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};

