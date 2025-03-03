import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { layout } from "../src/style";
import {
  FaTicketAlt,
  FaComments,
  FaPoll,
  FaChartLine,
  FaUsers,
  FaFilm,
} from "react-icons/fa";

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, content }) => (
  <div className={`flex flex-row p-6 rounded-[20px] feature-card bg-darkBlue`}>
    <div
      className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}
    >
      <Icon className="text-white text-3xl" />
    </div>
    <div className="flex-1 flex flex-col ml-3">
      <h4 className="font-poppins font-semibold text-white text-lg leading-6 mb-1 text-left">
        {title}
      </h4>
      <p className="font-poppins font-normal text-dimWhite text-base leading-6 text-left">
        {content}
      </p>
    </div>
  </div>
);

const About = () => {
  return (
    <section id="about" className={`${layout.section} flex flex-col`}>
      {/* Navbar */}
      <div className="max-w-screen-xl mx-auto">
       

        <div className=" overflow-x-hidden relative">
          {/* Use a centered container that limits the maximum width */}
          <div className="max-w-screen-xl mx-auto">
            {/* Other Sections */}
            <div className={` ${styles.paddingX} ${styles.flexCenter}`}>
              <div className={`${styles.boxWidth} mx-auto`}>
        <Navbar />
                <Stats />
                <Business />
                <Ticketing />
                <Multillingual />
                <Faq />
                <Clients />
                <CTA />
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
