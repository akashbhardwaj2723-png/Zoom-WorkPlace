
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
  Container,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);

  const [meeting, setMeeting] = useState([]);
  const routeTo = useNavigate();
  const history = getHistoryOfUser();
  console.log("Meeting History:", history);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeeting(history);
      } catch (e) {
        console.log("Something went wrong", e);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f7fb",
        py: 3,
      }}
    >
      <Container maxWidth="xl">

        {/* Navbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                background: "#2D8CFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <VideoCallIcon sx={{ fontSize: 28 }} />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#172B4D" }}
              >
                AK Zoom Workplace
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Your meetings, all in one place
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Go to Home">
            <IconButton
              onClick={() => routeTo("/home")}
              sx={{
                width: 46,
                height: 46,
                background: "white",
                color: "#2D8CFF",
                boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                "&:hover": {
                  background: "#e8f2ff",
                },
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Heading */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <HistoryIcon sx={{ color: "#2D8CFF", fontSize: 30 }} />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#172B4D",
                fontSize: { xs: 28, md: 34 },
              }}
            >
              Meeting History
            </Typography>
          </Stack>

          <Typography color="text.secondary">
            View and manage your previous meetings.
          </Typography>

          <Chip
            label={`${meeting.length} Meetings`}
            sx={{
              mt: 2,
              background: "#e5f1ff",
              color: "#1677e8",
              fontWeight: 700,
            }}
          />
        </Box>

        {/* Meeting Cards */}
        {meeting.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {meeting.map((e, idx) => (
              <Card
                key={e._id || idx}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e8edf5",
                  background: "#ffffff",
                  transition: "all 0.25s ease",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(45,140,255,0.12)",
                    borderColor: "#b9d8ff",
                  },
                }}
              >
                {/* Card Top */}
                <Box
                  sx={{
                    height: 7,
                    background:
                      "linear-gradient(90deg, #2D8CFF, #73b5ff)",
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 3 }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 3,
                        background: "#edf5ff",
                        color: "#2D8CFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <VideoCallIcon sx={{ fontSize: 30 }} />
                    </Box>

                    <Chip
                      label={`Meeting ${idx + 1}`}
                      size="small"
                      sx={{
                        background: "#eaf8ef",
                        color: "#25834b",
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 750,
                      color: "#172B4D",
                      mb: 1,
                    }}
                  >
                    Meeting Room
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    Meeting ID
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 2 }}
                  >
                    <CalendarMonthIcon sx={{ color: "#2D8CFF" }} />

                    <Typography variant="body2" color="text.secondary">
                      {e.data
                        ? new Date(Number(e.data)).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "Date not available"}
                    </Typography>
                  </Stack>


                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "#f5f7fb",
                      border: "1px solid #edf0f5",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: "#344563",
                        letterSpacing: 0.4,
                      }}
                    >
                      {e.meetingCode || "No meeting ID available"}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => routeTo("/home")}
                      sx={{
                        py: 1.2,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        background: "#2D8CFF",
                        boxShadow: "none",
                        "&:hover": {
                          background: "#1677e8",
                          boxShadow: "0 5px 12px rgba(45,140,255,0.25)",
                        },
                      }}
                    >
                      Join Meeting
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setMeeting((prev) =>
                          prev.filter((item) => item._id !== e._id)
                        );
                      }}
                      sx={{
                        py: 1.1,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#ffd6d6",
                        "&:hover": {
                          background: "#fff1f1",
                          borderColor: "#ef4444",
                        },
                      }}
                    >
                      Clear History
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          /* Empty State */
          <Box
            sx={{
              py: 9,
              px: 2,
              textAlign: "center",
              background: "white",
              borderRadius: 4,
              border: "1px dashed #cbd5e1",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#edf5ff",
                color: "#2D8CFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <HistoryIcon sx={{ fontSize: 42 }} />
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#172B4D", mb: 1 }}
            >
              No Meeting History
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your previous meetings will appear here.
            </Typography>

            <Button
              variant="contained"
              startIcon={<VideoCallIcon />}
              onClick={() => routeTo("/home")}
              sx={{
                background: "#2D8CFF",
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.2,
              }}
            >
              Start a Meeting
            </Button>
          </Box>
        )}

      </Container>
    </Box>
  );
}
