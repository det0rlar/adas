import styles, { layout } from "../style";
import events from "../assets/map.png";
import Button from "./Button";

const Multillingual = () => (
  <section className={`${layout.section} flex flex-col-reverse md:flex-row`}>
    {/* Content Section */}
    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Reach a global audience <br className="sm:block hidden" /> with our
        multilingual support.
      </h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        ADAS supports multiple languages, ensuring that your events are
        accessible to attendees from all over the world. Whether your audience
        speaks English, Spanish, French, or any other language, our platform
        adapts seamlessly.
      </p>
      <Button styles={`mt-10`} />
    </div>

    {/* Image Section */}
    <div className={layout.sectionImg}>
      <img
        src={events} // Replace with a globe-related image or icon
        alt="multilingual"
        className="w-[100%] h-[100%] sm:mb-7 object-contain"
      />
    </div>
  </section>
);

export default Multillingual;
