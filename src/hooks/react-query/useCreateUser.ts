import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateUserInput, User } from "../../types/user.type";

interface UseCreateUserOptions {
  onSuccess?: (data: User) => void;
  onError?: (error: Error) => void;
}

// Simulated API call
const createUser = async (input: CreateUserInput): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Mock creating a user with a new ID
  return {
    ...input,
    id: Date.now(),
  };
};

export const useCreateUser = ({ onSuccess, onError }: UseCreateUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users query
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
};

