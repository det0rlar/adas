import React from "react";
import styles from "../style";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FAQ = () => {
  // Slick Carousel Settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // show one FAQ per slide for clarity
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // FAQ Items – Feel free to adjust the questions/answers as needed
  const faqItems = [
    {
      id: 1,
      question: "How do I host my event with ADAS?",
      answer:
        "Hosting an event with ADAS is simple. Sign up, choose your event type, and use our intuitive dashboard to manage everything—from ticketing and seating to live streaming and post-event analytics.",
    },
    {
      id: 2,
      question: "What features does ADAS offer for event management?",
      answer:
        "ADAS is packed with features including seamless ticketing, high-quality live streaming, targeted event marketing, customizable dashboards, networking tools, and even video summarization to help attendees catch up on key moments.",
    },
    {
      id: 3,
      question: "How does ADAS ensure a smooth event experience?",
      answer:
        "Our robust platform has hosted over 50K events, reached 2M+ attendees across 100+ cities, and maintains a 98% customer satisfaction rate. We combine cutting-edge technology with dedicated support to ensure your event runs flawlessly.",
    },
    {
      id: 4,
      question: "How does ADAS support global events?",
      answer:
        "ADAS is built for a global audience. With multilingual support and scalable infrastructure, we make sure your event is accessible and engaging no matter where your attendees are located. Ticket verification, real-time analytics, and localized interfaces are just a few examples of how we help you succeed on the world stage.",
    },
  ];

  return (
    <section
      id="faq"
      className={`${styles.paddingY} ${styles.flexCenter} flex-col relative`}
    >
      {/* Header with Beautiful Logo */}
      <div className="mb-8 flex flex-col items-center px-4 sm:px-0">
        {/* Logo Container with Gradient Background */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2
          className={`${styles.heading2} text-center text-2xl sm:text-3xl md:text-4xl`}
        >
          Frequently Asked <br className="sm:block hidden" /> Questions
        </h2>
        <p
          className={`${styles.paragraph} text-center max-w-[450px] mt-4 text-sm sm:text-base md:text-lg`}
        >
          Find answers to some of the most common questions about hosting and
          managing your events with ADAS.
        </p>
      </div>

      {/* FAQ Slider */}
      <div className="w-full max-w-[800px] mx-auto overflow-hidden px-4">
        <Slider {...settings}>
          {faqItems.map((faq) => (
            <div key={faq.id} className="px-2 sm:px-4">
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default FAQ;
