// components/Ticketing.jsx
import React from "react";
import styles, { layout } from "../style";
import Button from "./Button";
import { FaTicketAlt } from "react-icons/fa";
import events from "../assets/card.png";
const Ticketing = () => (
  <section id="ticketing" className={`${layout.section} flex-col md:flex-row`}>
    {/* Left Side: Image */}
    <div className={`${layout.sectionImg} relative flex justify-center`}>
      {/* Transparent Net Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          /* This creates a net-like grid using two radial gradients */
          backgroundImage: `
        radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px),
        radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)
      `,
          /* Adjust positions to widen the net (grid spacing) */
          backgroundPosition: "0 0, 30px 30px",
          backgroundSize: "60px 60px, 60px 60px",
          /* Optional: add an overall radial gradient for a subtle glow */
          backgroundColor: "rgba(0,0,0,0)", // fallback if needed
          /* If you want an additional radial gradient overlay behind the mesh, you can combine backgrounds: \n  background: \n    radial-gradient(circle, rgba(255,255,255,0.05), transparent),\n    radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px),\n    radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px); \n and adjust backgroundPosition and backgroundSize accordingly. */
        }}
      />
      {/* The image remains above the net background */}
      <img
        src={events} // Replace with your actual image path
        alt="Ticketing System"
        className="relative w-full h-full max-w-lg object-cover rounded-lg"
      />
    </div>

    {/* Right Side: Content */}
    <div className={`${layout.sectionInfo} mt-8 md:mt-0 md:ml-10`}>
      <h2 className={styles.heading2}>Seamless Ticketing Experience</h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        With our advanced ticketing system, event organizers can effortlessly
        create, manage, and sell tickets to their events. Enjoy complete
        flexibility with customizable pricing, real-time analytics, and secure
        payment processing. Our user-friendly interface ensures that both
        organizers and attendees have a smooth and hassle-free ticketing
        experience.
      </p>
      <Button styles="mt-10" text="Learn More" />
    </div>
  </section>
);

export default Ticketing;
