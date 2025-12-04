import { useState } from "react";
import { Box, Typography, Button, Grid, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useUsers } from "../../hooks/react-query/useUsers";
import { displayMessage } from "../../constants/strings";
import Loading from "../../components/shared/layout/Loading";
import ErrorDisplay from "../../components/shared/ErrorDisplay";
import EmptyContentDisplay from "../../components/shared/EmptyContentDisplay";
import { UserCard } from "./UserCard";
import { AddUserDialog } from "./AddUserDialog";

export const Component = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: users, isLoading, isError } = useUsers();

  // 1. Loading (first)
  if (isLoading) {
    return <Loading label="users" />;
  }

  // 2. Error (second)
  if (isError) {
    return (
      <ErrorDisplay
        primaryMessage={displayMessage.users.error}
        secondaryMessage={displayMessage.default.internalError}
        showReloadOption
      />
    );
  }

  // 3. Empty (third)
  if (!users || users.length === 0) {
    return (
      <EmptyContentDisplay
        primaryMessage={displayMessage.users.empty}
        secondaryMessage={displayMessage.default.emptyFilterResults}
      />
    );
  }

  // 4. Success (render content)
  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" color="primary">
          {displayMessage.users.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          {displayMessage.users.addUser}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
            <UserCard user={user} />
          </Grid>
        ))}
      </Grid>

      <AddUserDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Box>
  );
};

