import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./app-state";
import { Layout } from "./components";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
import { Play } from "./pages/Play";
import { Wallet } from "./pages/Wallet";
import { Deposit } from "./pages/Deposit";
import { Withdraw } from "./pages/Withdraw";
import { Profile } from "./pages/Profile";

export function App() {
  const { user, ready, t } = useApp();

  if (!ready) return <div className="center-screen">{t("loading")}</div>;
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }
  return (
    <Layout>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
  );
}
