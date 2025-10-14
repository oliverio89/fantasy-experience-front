import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import UnderConstruction from "./UnderConstruction";
import Footer from "./Footer";
import FeedbackWidget from "./FeedbackWidget";

const Layout: FunctionComponent = () => {
  return (
    <>
      <Navbar />
      <UnderConstruction />
      <Outlet />
      <Footer />
      <FeedbackWidget />
    </>
  );
};

export default Layout;
