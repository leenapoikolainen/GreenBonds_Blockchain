import React from "react";

export default function Footer() {
  return (
    <>
      <footer className="bg-secondary">
        <div className="container pt-4 pb-4">
          <div className="text-center">
            <div className="w-full">
             <h4 className="text-white">Green Bond Platform</h4>
             <p className="text-white">Supports Green Bonds and Green Accreditation on a public blockchain ledger.</p>
            </div>
          </div>     
          <hr className="my-6 border-white" />

          <div className="items-center md:justify-between justify-center pb-10">
            <div className="text-center">
              <div className="text-sm text-white font-semibold pb-10">
                Copyright © {new Date().getFullYear()} {" "} Leena Poikolainen
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
