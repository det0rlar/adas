import React from "react";
import styles from "../src/style";
import {
  Ticketing,
  Business,
  Multillingual,
  Clients,
  CTA,
  Footer,
  Navbar,
  Stats,
  Faq,
  Hero,
} from "../src/components";
import Copy from "../src/components/Copy";

import TawkToScript from "../src/components/TawkToScript.jsx";
const Home = () => (
  <div className="bg-primary overflow-x-hidden relative">
    <div className="max-w-screen-xl mx-auto">
      <div className="w-full flex justify-center" style={{ zIndex: 9999 }}>
        <Navbar />
      </div>
      <div className={`bg-primary ${styles.flexStart}`}>
        <div className={`${styles.boxWidth} mx-auto`}>
          <Hero />
          <Copy />
        </div>
      </div>
    </div>
  </div>
);

export default Home;
