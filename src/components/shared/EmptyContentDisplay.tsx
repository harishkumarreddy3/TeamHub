import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

interface EmptyContentDisplayProps {
  primaryMessage: string;
  secondaryMessage?: string;
}

const EmptyContentDisplay = ({
  primaryMessage,
  secondaryMessage,
}: EmptyContentDisplayProps) => {
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
      <InboxIcon sx={{ fontSize: 48, color: "text.disabled" }} />
      <Typography variant="h6" color="text.secondary">
        {primaryMessage}
      </Typography>
      {secondaryMessage && (
        <Typography variant="body2" color="text.disabled">
          {secondaryMessage}
        </Typography>
      )}
    </Box>
  );
};

export default EmptyContentDisplay;

