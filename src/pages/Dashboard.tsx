import { Routes, Route } from "react-router-dom"; 
import { DashboardCreator } from "@/components/dashboard/DashboardCreator";
import DashboardView from "./DashboardView";
import { FileUpload } from "@/components/upload/FileUpload";
import MyDashboards from "./MyDashboards";
import Help from "./Help";
import Home from "./Home";
import Profile from "./Profile";


export default function Dashboard() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<div className="p-6"><FileUpload onDataProcessed={() => {}} /></div>} />
      <Route path="/view/:id" element={<DashboardView />} />
      <Route path="/boards" element={<MyDashboards />} />
      <Route path="/help" element={<Help />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}