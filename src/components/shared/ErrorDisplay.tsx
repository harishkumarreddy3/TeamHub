import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorDisplayProps {
  primaryMessage: string;
  secondaryMessage?: string;
  showReloadOption?: boolean;
}

const ErrorDisplay = ({
  primaryMessage,
  secondaryMessage,
  showReloadOption = false,
}: ErrorDisplayProps) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        gap: 2,
        textAlign: "center",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main" }} />
      <Typography variant="h6" color="error">
        {primaryMessage}
      </Typography>
      {secondaryMessage && (
        <Typography variant="body2" color="text.secondary">
          {secondaryMessage}
        </Typography>
      )}
      {showReloadOption && (
        <Button variant="outlined" onClick={handleReload}>
          Reload Page
        </Button>
      )}
    </Box>
  );
};

export default ErrorDisplay;

