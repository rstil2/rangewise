import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Onboarding } from "./components/Onboarding";
import { GamePage } from "./pages/GamePage";
import { StatsPage } from "./pages/StatsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { SupportPage } from "./pages/SupportPage";

const ONBOARDING_KEY = "rangewise_onboarding_done";

function AppRoutes() {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    setShowOnboarding(localStorage.getItem(ONBOARDING_KEY) !== "true");
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const isPublicLegal =
    location.pathname === "/privacy" || location.pathname === "/support";

  if (showOnboarding === null && !isPublicLegal) {
    return null;
  }

  if (showOnboarding && !isPublicLegal) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <Routes>
      <Route path="/" element={<GamePage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/support" element={<SupportPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
