import React from 'react';

export default function Navbar() {
    return (
      <>
        {/* Navbar */}
        <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-dark mb-3">
     
          <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
            {/* Brand */}
            <a
              className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              Portal Name
            </a>
           
            {/* User 
            <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
              <UserDropdown />
            </ul>
            */}
          </div>
        </nav>
        {/* End Navbar */}
      </>
    );
  }