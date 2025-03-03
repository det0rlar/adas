import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import styles from "../style";
import { arrowUp } from "../assets";

const GetStarted = () => (
  <Link
    to="/events" // Navigate to the login page
    className={`${styles.flexCenter} w-[140px] h-[140px] rounded-full bg-blue-gradient p-[2px] cursor-pointer`}
  >
    <div
      className={`${styles.flexCenter} flex-col bg-primary w-[100%] h-[100%] rounded-full`}
    >
      <div className={`${styles.flexStart} flex-row`}>
        <p className="font-poppins font-medium text-[18px] leading-[23.4px]">
          <span className="text-gradient">Discover</span>
        </p>
        <img
          src={arrowUp}
          alt="arrow-up"
          className="w-[23px] h-[23px] object-contain ml-2"
        />
      </div>
      <p className="font-poppins font-medium text-[18px] leading-[23.4px] mt-2">
        <span className="text-gradient">Events</span>
      </p>
    </div>
  </Link>
);

export default GetStarted;
