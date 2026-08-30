import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import UnderConstruction from "./UnderConstruction";
import Footer from "./Footer";
import FeedbackWidget from "./FeedbackWidget";

const showBanner = import.meta.env.VITE_SHOW_CONSTRUCTION_BANNER === "true";

const Layout: FunctionComponent = () => {
  return (
    <div className="fe-app-shell">
      <Navbar />
      {showBanner && <UnderConstruction />}
      <Outlet />
      <Footer />
      <FeedbackWidget />
    </div>
  );
};

export default Layout;
