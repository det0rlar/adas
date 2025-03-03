import styles from "../style";
import Adas from "../assets/ADAS.png";
import { footerLinks, socialMedia } from "../constants";
const Copy = () => {
  <div className="w-full flex justify-between items-center md:flex-row flex-col pt-6 border-t-[1px] border-t-[#3F3E45]">
    <p className="font-poppins font-normal text-center text-[18px] leading-[27px] text-white">
      Copyright Ⓒ 2022 Adas. All Rights Reserved.
    </p>

    <div className="flex flex-row md:mt-0 mt-6">
      {socialMedia.map((social, index) => (
        <img
          key={social.id}
          src={social.icon}
          alt={social.id}
          className={`w-[21px] h-[21px] object-contain cursor-pointer ${
            index !== socialMedia.length - 1 ? "mr-6" : "mr-0"
          }`}
          onClick={() => window.open(social.link)}
        />
      ))}
    </div>
  </div>;
};
export default Copy;
