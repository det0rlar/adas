import styles from "../style";
import "../index.css"; // Import the CSS file

const Stats = () => (
  <section
    className={`${styles.flexCenter} flex-col lg:flex-row flex-wrap sm:mb-20 mb-6 stats-bg`}
  >
    {[
      { id: 1, value: "50K+", title: "events hosted" },
      { id: 2, value: "2M+", title: "attendees reached" },
      { id: 3, value: "100+", title: "cities covered" },
      { id: 4, value: "98%", title: "customer satisfaction" },
    ].map((stat) => (
      <div
        key={stat.id}
        className="w-full lg:w-auto flex flex-col justify-center items-center text-center mx-2 my-4 lg:m-10 "
      >
        <h4 className="font-poppins font-semibold text-[40px] xs:text-[50px] sm:text-[60px] md:text-[50px] lg:text-[60px] text-white">
          {stat.value}
        </h4>
        <p className="font-poppins font-normal text-[18px] xs:text-[22px] sm:text-[24px] md:text-[20px] text-gradient uppercase">
          {stat.title}
        </p>
      </div>
    ))}
  </section>
);

export default Stats;
