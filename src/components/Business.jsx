import styles, { layout } from "../style";
import Button from "./Button";
import {
  FaTicketAlt,
  FaVideo,
  FaBullhorn,
  FaChartLine,
  FaUsers,
  FaFilm,
} from "react-icons/fa"; // Import React Icons

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, content, index }) => (
  <div
    className={`flex flex-row p-6 rounded-[20px] ${
      index !== 5 ? "mb-6" : "mb-0"
    } feature-card bg-darkBlue`}
  >
    <div
      className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}
    >
      <Icon className="text-white text-3xl" /> {/* Use React Icon here */}
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

// Business Section
const Business = () => (
  <section
    id="features"
    className={`${layout.section} flex flex-col-reverse lg:flex-row-reverse`}
  >
    {/* Right Column (Feature Cards) */}
    <div className={`${layout.sectionImg} flex flex-col`}>
      {[
        {
          id: 1,
          icon: FaTicketAlt,
          title: "Seamless Ticketing",
          content:
            "Create and sell tickets with ease. Customize pricing, seating charts, and more.",
        },
        {
          id: 2,
          icon: FaVideo,
          title: "Live Streaming",
          content:
            "Engage attendees globally with high-quality live streams for virtual events.",
        },
        {
          id: 3,
          icon: FaBullhorn,
          title: "Event Marketing",
          content:
            "Promote your event through targeted campaigns and reach a wider audience.",
        },
        {
          id: 4,
          icon: FaChartLine,
          title: "Customizable Dashboards",
          content:
            "Monitor real-time analytics and gain insights into attendee behavior and engagement.",
        },
        {
          id: 5,
          icon: FaUsers,
          title: "Networking Tools",
          content:
            "Facilitate connections between attendees with built-in networking features.",
        },
        {
          id: 6,
          icon: FaFilm,
          title: "Video Summarization",
          content:
            "Automatically generate summaries of recorded sessions to help attendees catch up on key moments.",
        },
      ].map((feature, index) => (
        <FeatureCard key={feature.id} {...feature} index={index} />
      ))}
    </div>

    {/* Left Column (Text Content) */}
    <div className={`${layout.sectionInfo} text-left w-full`}>
      <h2 className={`${styles.heading2} break-words`}>
        Host unforgettable events with ADAS. <br className="sm:block hidden" />
        We handle everything for you.
      </h2>
      <p
        className={`${styles.paragraph} max-w-[470px] mt-5 mx-auto lg:mx-0 break-words`}
      >
        With ADAS, you can effortlessly plan, manage, and promote your events.
        From ticketing to live streaming, we provide all the tools you need to
        make your event a success.
      </p>
      <div className="flex justify-center lg:justify-start">
        <Button styles={`mt-10`} />
      </div>
    </div>
  </section>
);

export default Business;
