import styles from "../style";

const FeedbackCard = ({ name, role, feedback, avatar }) => (
  <div
    className={`flex flex-col p-6 rounded-[20px] bg-darkBlue shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-primary`}
  >
    {/* Avatar */}
    <div className="flex items-center mb-4">
      <img
        src={avatar}
        alt={`${name} avatar`}
        className="w-[40px] h-[40px] rounded-full object-cover mr-3"
      />
      <div>
        <h4 className="font-poppins font-semibold text-white text-[16px] leading-[24px]">
          {name}
        </h4>
        <p className="font-poppins font-normal text-dimWhite text-[14px] leading-[20px]">
          {role}
        </p>
      </div>
    </div>

    {/* Feedback Text */}
    <p className="font-poppins font-normal text-dimWhite text-[16px] leading-[24px]">
      {feedback}
    </p>
  </div>
);

export default FeedbackCard;
