import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import type { Event, Sponsor, Settings } from "../types";
import EventCard from "../components/EventCard";
import SponsorBanner from "../components/SponsorBanner";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch all data in parallel — faster than sequential
        const [eventsRes, sponsorsRes, settingsRes] = await Promise.all([
          api.get("/events"),
          api.get("/sponsors"),
          api.get("/settings"),
        ]);
        setEvents(eventsRes.data);
        setSponsors(sponsorsRes.data);
        setSettings(settingsRes.data);
      } catch {
        setError(t("common.error"));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ mt: 4, mx: { xs: 2, md: 4 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "#1a1a2e",
          color: "white",
          py: { xs: 8, md: 14 },
          textAlign: "center",
          backgroundImage: settings?.heroImageUrl
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${settings.heroImageUrl}")`
            : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          width: "100%",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          <Typography
            variant="h2"
            fontFamily="Roboto"
            color="whitesmoke"
            sx={{ fontSize: { xs: "2rem", md: "3.5rem" }, mb: 2 }}
          >
            ✝️ {settings?.churchName || "St. George Church Events"}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.85,
              mb: 4,
              fontSize: { xs: "1rem", md: "1.5rem" },
            }}
          >
            {t("landing.subtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() =>
              document
                .getElementById("events")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            sx={{ bgcolor: "#e94560", px: 4, py: 1.5, fontSize: "1.1rem" }}
            startIcon={<CalendarMonthIcon />}
          >
            {t("landing.viewEvents")}
          </Button>
        </Box>
      </Box>

      {/* Sponsors Banner */}
      {sponsors.length > 0 && (
        <Box sx={{ bgcolor: "#f5f5f5", py: 4, width: "100%" }}>
          <Box sx={{ px: { xs: 2, md: 4 } }}>
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              color="text.secondary"
            >
              {t("landing.sponsors")}
            </Typography>
            <SponsorBanner sponsors={sponsors} />
          </Box>
        </Box>
      )}

      {/* Events Section */}
      <Box sx={{ width: "100%", py: 8, px: { xs: 2, md: 4 } }} id="events">
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          align="center"
          sx={{ mb: 6 }}
        >
          {t("landing.upcomingEvents")}
        </Typography>

        {events.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No upcoming events yet. Check back soon!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {events.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <EventCard 
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "#1a1a2e",
          color: "white",
          py: 6,
          mt: 8,
          width: "100%",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            <Grid size={{xs:12, md:4 }} >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ✝️ {settings?.churchName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Bringing our community together through faith and events.
              </Typography>
            </Grid>
            <Grid size={{xs:12, md:4}} >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Contact Us
              </Typography>
              {settings?.contactEmail && (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  📧 {settings.contactEmail}
                </Typography>
              )}
              {settings?.contactPhone && (
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  📞 {settings.contactPhone}
                </Typography>
              )}
            </Grid><Grid size={{xs:12, md:4}}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment
              </Typography>
              {settings?.cashPhone && (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  💵 Cash: {settings.cashPhone}
                </Typography>
              )}
              {settings?.instapayLink && (
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    mt: 1,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => window.open(settings.instapayLink!, "_blank")}
                >
                  💳 Instapay
                </Typography>
              )}
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            align="center"
            sx={{ opacity: 0.5, mt: 4 }}
          >
            © {new Date().getFullYear()} {settings?.churchName}. All rights
            reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
