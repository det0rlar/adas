// components/Navbar.jsx
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FaSignOutAlt, FaAngleDown } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import Adas from "../assets/ADAS.png";
import { close, logo, menu } from "../assets";

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const navLinks = [
    { id: "home", title: "Home", path: "/" },
    { id: "about", title: "About", path: "/about" },
    { id: "events", title: "Discover Events", path: "/events" },
  ];

  const getInitials = () => {
    if (user && user.displayName) {
      const names = user.displayName.split(" ");
      return (names[0][0] + (names[1] ? names[1][0] : "")).toUpperCase();
    } else if (user && user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "";
  };

  const authLinks = user ? (
    <>
      <li className="flex items-center gap-2 font-medium cursor-pointer text-[16px] mx-2">
        <Link to="/profile">
          <div
            className="w-8 h-8 flex items-center my-3 justify-center rounded-full"
            style={{ backgroundColor: "#5ce1e6", color: "white" }}
          >
            {getInitials()}
          </div>
        </Link>
      </li>
      <li
        className="font-medium cursor-pointer text-[16px] mr-8 text-red-500 mx-2"
        onClick={logout}
      >
        <FaSignOutAlt className="inline-block mr-1 mt-3" /> Logout
      </li>
    </>
  ) : (
    <>
      <li>
        <Link
          to="/login"
          className="font-[600] cursor-pointer text-[18px] text-white mx-2 mr-6 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6A0DAD] via-[#6E3995] to-[#9E0DAD] hover:opacity-90 transition duration-300"
        >
          Login
        </Link>
      </li>
      <li>
        <Link
          to="/signup"
          className="font-[600] cursor-pointer text-[18px] text-white mx-2 mr-6 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6A0DAD] via-[#6E3995] to-[#9E0DAD] hover:opacity-90 transition duration-300"
        >
          Sign Up
        </Link>
      </li>
    </>
  );

  return (
    <nav
      className="w-full flex py-6 items-center navbar border-b border-gray-200 relative"
      style={{ borderBottom: "1px solid #ffffff20", zIndex: 100 }}
    >
      <div className="flex items-center flex-1">
        <Link to="/">
          <img src={Adas} alt="logo" className="w-[124px] mx-10 h-[32px]" />
        </Link>
      </div>

      {/* Desktop Nav Links */}
      <ul className="list-none hidden sm:flex flex-1 justify-center items-center">
        <div className="flex justify-between w-full max-w-[600px]">
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className="relative font-normal cursor-pointer font-[500] text-[16px] text-black"
              onClick={() => {
                setActive(nav.title);
                if (nav.id === "features") {
                  setFeaturesDropdownOpen(!featuresDropdownOpen);
                }
              }}
            >
              <Link to={nav.path} className="flex items-center">
                {nav.title}
                {nav.subLinks && (
                  <FaAngleDown className="ml-2 mb-3 text-sm text-black" />
                )}
              </Link>
              {nav.subLinks && nav.id === "features" && (
                <ul
                  className={`absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg min-w-[150px] ${
                    featuresDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  {nav.subLinks.map((subLink) => (
                    <li
                      key={subLink.id}
                      className="p-2 hover:bg-gray-700 transition-colors duration-300"
                    >
                      <Link to={subLink.path}>{subLink.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </div>
      </ul>

      <ul className="list-none hidden sm:flex flex-1 justify-end items-center gap-6">
        {authLinks}
      </ul>

      {/* Mobile Hamburger and Full-Screen Menu */}
      <div className="sm:hidden flex flex-1 justify-end items-center text-black relative">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] text-black h-[28px] mx-4 object-contain cursor-pointer"
          onClick={() => setToggle(!toggle)}
          style={{ zIndex: 200 }}
        />
        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } fixed inset-0 p-6 bg-white flex flex-col items-center justify-center z-50`}
        >
          <ul className="list-none flex flex-col items-center">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className="relative font-medium cursor-pointer text-[16px] text-black mb-4"
                onClick={() => {
                  setActive(nav.title);
                  if (nav.id === "features") {
                    setFeaturesDropdownOpen(!featuresDropdownOpen);
                  }
                  setToggle(false); // close menu after selection
                }}
              >
                <Link to={nav.path} className="flex items-center">
                  {nav.title}
                  {nav.subLinks && (
                    <FaAngleDown className="ml-2 text-sm text-black" />
                  )}
                </Link>
                {nav.subLinks &&
                  nav.id === "features" &&
                  featuresDropdownOpen && (
                    <ul className="mt-2 bg-gray-800 rounded-lg shadow-lg min-w-[150px]">
                      {nav.subLinks.map((subLink) => (
                        <li
                          key={subLink.id}
                          className="p-2 hover:bg-gray-700 transition-colors duration-300"
                        >
                          <Link to={subLink.path}>{subLink.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
              </li>
            ))}
            {authLinks}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
