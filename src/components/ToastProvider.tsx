"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  forwardRef,
} from "react";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import type { SlideProps } from "@mui/material/Slide";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface ToastContextType {
  showToast: (message: string, options?: { duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

// Canonical MUI Slide transition for top-right anchor, sliding in from right
const SlideTransition = forwardRef<unknown, SlideProps>(
  function SlideTransition(props, ref) {
    return <Slide {...props} direction="left" ref={ref} />;
  }
);

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(4000);

  const showToast = useCallback(
    (msg: string, options?: { duration?: number }) => {
      setMessage(msg);
      setDuration(options?.duration || 4000);
      setOpen(true);
    },
    []
  );

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        onClose={handleClose}
        message={message}
        autoHideDuration={duration}
        TransitionComponent={SlideTransition}
        action={
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            sx={{ color: "#1e3a8a" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          mt: 2,
          "& .MuiSnackbarContent-root": {
            background: "#fff",
            color: "#1e3a8a", // blue-800
            borderLeft: "6px solid #2563eb", // blue-600
            boxShadow: "0 4px 16px rgba(30,58,138,0.08)",
            fontWeight: 500,
            fontSize: "1rem",
            padding: "12px 20px",
            borderRadius: "8px",
            minWidth: "280px",
            maxWidth: "90vw",
          },
        }}
      />
    </ToastContext.Provider>
  );
};
