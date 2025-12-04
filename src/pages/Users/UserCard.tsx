import { Card, CardContent, Typography, Chip, Stack, Avatar } from "@mui/material";
import { User } from "../../types/user.type";

interface UserCardProps {
  user: User;
}

const getRoleColor = (role: User["role"]) => {
  switch (role) {
    case "admin":
      return "error";
    case "user":
      return "primary";
    case "guest":
      return "default";
  }
};

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: "1.5rem",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" textAlign="center">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Chip
            label={user.role.toUpperCase()}
            color={getRoleColor(user.role)}
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

