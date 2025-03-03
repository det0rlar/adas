const Clients = () => {
  return (
    <div className="flex flex-col justify-center items-center my-10 overflow-hidden">
      {/* Tech Stacks Heading */}

      {/* Stack List */}
      <div className="flex flex-wrap justify-center lg:justify-between items-center gap-6 mb-4 w-full max-w-[90%]">
        {["Paystack", "Firestore", "React", "Gemmini"].map((tech, index) => (
          <span
            key={index}
            className="text-[#484848] font-bold text-5xl sm:text-4.3xl md:text-5xl tracking-wide font-[Poppins] px-4 uppercase text-left"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Clients;
