import React from "react";
import styles from "../style";
import { discount } from "../assets"; // Keep the discount image if needed
import GetStarted from "./GetStarted";
import Robot from "../assets/robot.png";

const Hero = () => {
  return (
    <section
      id="home"
      className={`relative flex md:flex-row flex-col ${styles.paddingY}`}
    >
      {/* Left Content (Text) */}
      <div
        className={`relative z-10 flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}
      >
        {/* Discount Banner (Optional) */}
        <div className="flex flex-row items-center py-1.5 px-4 bg-discount-gradient rounded-lg mb-2">
          <img src={discount} alt="discount" className="w-8 h-8" />
          <p className={`${styles.paragraph} ml-2`}>
            <span className="text-white">Special Offer:</span> Save{" "}
            <span className="text-white">20%</span> on Your First Event!
          </p>
        </div>

        {/* Main Title & Desktop GetStarted Button */}
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="flex-1 font-roboto font-semibold text-[24px] md:text-[62px] text-white leading-[30px] md:leading-[70px]">
            Host Your Next Event <br className="sm:block hidden" /> with{" "}
            <span className="text-gradient">ADAS</span>.
          </h1>
          {/* Desktop GetStarted Button */}
          <div className="hidden sm:ml-6 ss:flex md:mr-4 mr-0">
            <GetStarted />
          </div>
        </div>

        {/* Secondary Heading */}
        <h2 className="font-roboto font-semibold text-[18px] md:text-[42px] text-white leading-[22px] md:leading-[40px] mt-4 w-full">
          The Ultimate Platform for Event Hosting.
        </h2>

        {/* Description */}
        <p
          className={`${styles.paragraph} max-w-[470px] mt-5 text-xs md:text-sm`}
        >
          ADAS is the go-to platform for hosting, managing, and promoting events
          of all kinds. Whether it's a corporate conference or a community
          gathering, ADAS provides the tools you need to make your event
          unforgettable.
        </p>

        {/* Mobile GetStarted Button (shown only on mobile, centered) */}
        <div className="sm:hidden mt-6 flex justify-center">
          <GetStarted />
        </div>
      </div>

      {/* Right Content (Image) */}
      <div
        className={`relative z-10 flex-1 flex ${styles.flexCenter} md:my-0 my-10`}
      >
        {/* Replace 'Robot' with an event-related image */}
        <img
          src={Robot} // Replace this URL with your image if needed
          alt="event hosting"
          className="w-full max-w-full h-full relative z-[5] rounded-lg shadow-lg object-cover"
        />

        {/* Gradient Effects */}
        <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
      </div>
    </section>
  );
};

export default Hero;
