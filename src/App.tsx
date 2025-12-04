import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppTheme } from "./theme";
import { queryClient } from "./queryClientProvider";
import { Component as UsersPage } from "./pages/Users/UsersPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={AppTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="div">
                FE Project Demo
              </Typography>
            </Toolbar>
          </AppBar>
          <UsersPage />
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

