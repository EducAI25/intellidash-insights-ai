import { Routes, Route } from "react-router-dom"; 
import DashboardView from "./DashboardView";
import MyDashboards from "./MyDashboards";
import Help from "./Help";
import Home from "./Home";
import Profile from "./Profile";
import Upload from "./Upload";


export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/view/:id" element={<DashboardView />} />
      <Route path="/boards" element={<MyDashboards />} />
      <Route path="/help" element={<Help />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}