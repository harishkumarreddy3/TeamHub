import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingProps {
  size?: string;
  label?: string;
}

const Loading = ({ size = "3rem", label }: LoadingProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {label && (
        <Typography variant="body2" color="text.secondary">
          Loading {label}...
        </Typography>
      )}
    </Box>
  );
};

export default Loading;

