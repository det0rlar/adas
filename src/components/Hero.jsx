import React from "react";
import styles from "../style";
import Robot from "../assets/robots.png";

const Hero = () => {
  return (
    <section
      id="home"
      className={`relative h-screen overflow-hidden bg-white ${styles.paddingY}`}
    >
      {/* Container to center content and bottom border */}
      <div className=" mx-auto px-4 flex flex-col md:flex-row items-center md:items-start text-center md:text-left h-full">
        {/* Left Content (Text with radial gradient) */}
        <div
          className={`
            relative z-10 flex-1 w-full
            flex flex-col items-center md:items-start
            px-6 sm:px-16 p-16 h-64 mt-14 m-14
            bg-[radial-gradient(circle_at_left,_#F5E8FF,_#fff_70%)]
          `}
        >
          {/* Title */}
          <div className="w-full mb-6 mt-4">
            <h1
              className="
                font-poppins font-bold
                text-[1.6rem] md:text-[4rem]
                leading-[2rem] md:leading-[4.5rem]
                text-black
              "
            >
              Welcome to
              <span
                className="
                  inline-block
                  bg-gradient-to-r from-[#6A0DAD] via-[#6E3995] to-[#9E0DAD]
                  bg-clip-text text-transparent
                "
              >
                ADAS
              </span>
            </h1>
          </div>

          {/* Description */}
          <p
            className="
              max-w-[35rem]
              mt-[1.5rem]
              text-black font-[400]
               md:text-lg
              text-lg
            "
          >
            ADAS is the go-to platform for hosting, managing, and promoting
            events of all kinds. Whether it's a corporate conference or a
            community gathering, ADAS provides tools you would need to make your
            event unforgettable.
          </p>

          {/* Button */}
          <button
            className="
              bg-gradient-to-r from-[#6A0DAD] via-[#6E3995] to-[#9E0DAD]
              text-white font-bold
              px-6 py-3
              rounded-lg shadow-lg
              hover:opacity-90
              transition duration-300
              mt-16
            "
          >
            Host Your Next Event Here
          </button>
        </div>

        {/* Right Content (Image) */}
        <div
          className={`
            relative z-10 flex-1
            flex justify-center items-center
            md:my-0 my-10
          `}
        >
          <img
            src={Robot}
            alt="event hosting"
            className="w-full max-w-full h-full relative z-[5] rounded-lg object-cover"
          />

          {/* Optional gradient decorations */}
          <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
          <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
          <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
        </div>
      </div>

      {/* Thin line at the bottom */}
      <div className="container mx-auto px-4">
        <div className="w-full border-b border-[#9E0DADB2] mt-4 mb-4" />
      </div>
    </section>
  );
};

export default Hero;
