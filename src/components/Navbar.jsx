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
        {/* Wrapped initials div in Link to navigate to "/profile" */}
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
      <li className="font-bold cursor-pointer text-[16px] text-blue-500 mx-2 mr-6">
        <Link to="/login">Login</Link>
      </li>
      <li className="font-bold cursor-pointer text-[16px] text-blue-500 mx-2 mr-6">
        <Link to="/signup">Sign Up</Link>
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

      <ul className="list-none hidden sm:flex flex-1 justify-center items-center">
        <div className="flex justify-between w-full max-w-[600px]">
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className={`relative font-normal cursor-pointer text-[16px] ${
                active === nav.title ? "text-white" : "text-dimWhite"
              }`}
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
                  <FaAngleDown className="ml-2 mb-3 text-sm text-dimWhite" />
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

      <div className="sm:hidden flex flex-1 justify-end items-center relative">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] mx-4 object-contain cursor-pointer"
          onClick={() => setToggle(!toggle)}
          style={{ zIndex: 200 }}
        />
        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 bg-black-gradient absolute top-full right-0 w-full max-w-[300px] mx-4 my-2 rounded-xl sidebar`}
          style={{ zIndex: 9999 }}
        >
          <ul className="list-none flex flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`relative font-medium cursor-pointer text-[16px] ${
                  active === nav.title ? "text-white" : "text-dimWhite"
                } ${index === navLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => {
                  setActive(nav.title);
                  if (nav.id === "features") {
                    setFeaturesDropdownOpen(!featuresDropdownOpen);
                  }
                }}
              >
                <div className="flex items-center">
                  <Link to={nav.path} className="flex items-center">
                    {nav.title}
                    {nav.subLinks && (
                      <FaAngleDown
                        className="ml-2 text-sm text-dimWhite"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (nav.id === "features") {
                            setFeaturesDropdownOpen(!featuresDropdownOpen);
                          }
                        }}
                      />
                    )}
                  </Link>
                </div>
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
