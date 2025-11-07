import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Instrument = {
  id: string;
  name: string;
};

interface InstrumentDropdownProps {
  instruments: Instrument[];
  selectedInstrumentId: string | null;
  onSelect: (instrumentId: string) => void;
  setIsModalOpen: () => void;
}

const InstrumentDropdown: React.FC<InstrumentDropdownProps> = ({
  instruments,
  selectedInstrumentId,
  onSelect,
  setIsModalOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedInstrument = instruments?.find(
    (inst) => inst?.id === selectedInstrumentId
  );

  const handleSelect = (instrumentId: string) => {
    onSelect(instrumentId);
    setIsOpen(false);
  };

  const listVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="flex items-center gap-[80px]">
        <p className="mb-1 text-sm text-center text-primary pl-2">
          Euro Vs US dollar
        </p>
        <div onClick={setIsModalOpen} className="text-primary mb-1">
          Indicators
        </div>
      </div>
      <div className="dropdown">
        <button
          className="btn h-[44px] w-full bg-secondaryBg border border-primary outline-none rounded-10 flex justify-between items-center px-4 text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          style={{ color: "#f9f9f9", boxShadow: "none", border: "none" }}
        >
          <div className="text-primary">
            {selectedInstrument?.name || "Select Symbol"}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} className="text-icon" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              className="dropdown-content z-[1] menu p-2 shadow bg-secondaryBg border border-primary rounded-box w-full max-h-60 overflow-y-auto text-primary"
              variants={listVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ position: "relative", scrollbarWidth: "none" }}
            >
              {instruments.map((instrument) => (
                <motion.li
                  className="border border-tertiary"
                  key={instrument.id}
                  variants={itemVariants}
                >
                  <button
                    type="button"
                    className={`w-full text-left px-2 py-1 ${
                      instrument.id === selectedInstrumentId
                        ? "font-semibold"
                        : ""
                    }`}
                    onClick={() => handleSelect(instrument.id)}
                  >
                    {instrument.name}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default InstrumentDropdown;

// src/components/instrumentDropdown/InstrumentDropdown.tsx
// import React, { useState } from "react";
// import { ChevronDown } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// // Define a simple type for the instrument object
// type Instrument = {
//   id: string;
//   name: string;
// };

// interface InstrumentDropdownProps {
//   instruments: Instrument[];
//   selectedInstrumentId: string | null;
//   onSelect: (instrumentId: string) => void;
// }

// const InstrumentDropdown: React.FC<InstrumentDropdownProps> = ({
//   instruments,
//   selectedInstrumentId,
//   onSelect,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const selectedInstrument = instruments?.find(
//     (inst) => inst?.id === selectedInstrumentId
//   );

//   const handleSelect = (instrumentId: string) => {
//     onSelect(instrumentId);
//     setIsOpen(false); // Close the dropdown after selection
//   };

//   const listVariants = {
//     closed: {
//       opacity: 0,
//       y: -20,
//       transition: { duration: 0.2 },
//     },
//     open: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.3,
//         staggerChildren: 0.07,
//         delayChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     closed: { opacity: 0, y: 10 },
//     open: { opacity: 1, y: 0 },
//   };

//   return (
//     <div className="dropdown">
//       <p className="mb-1 text-sm text-center text-primary">Euro Vs US dollar</p>
//       <button
//         className="btn h-[44px] w-full bg-secondaryBg border border-primary outline-none rounded-10 flex justify-between items-center px-4 text-primary"
//         onClick={() => setIsOpen(!isOpen)}
//         style={{ color: "#f9f9f9", boxShadow: "none", border: "none" }}
//       >
//         <div className="text-primary">
//           {selectedInstrument?.name || "Select Symbol"}
//         </div>
//         <motion.div
//           animate={{ rotate: isOpen ? 180 : 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <ChevronDown size={20} className="text-icon" />
//         </motion.div>
//       </button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.ul
//             className="dropdown-content z-[1] menu p-2 shadow bg-secondaryBg border border-primary rounded-box w-full max-h-60 overflow-y-auto text-primary"
//             variants={listVariants}
//             initial="closed"
//             animate="open"
//             exit="closed"
//             style={{ position: "relative", scrollbarWidth: "none" }}
//           >
//             {instruments.map((instrument) => (
//               <motion.li
//                 className="border border-tertiary"
//                 key={instrument.id}
//                 variants={itemVariants}
//               >
//                 <a
//                   className={
//                     instrument.id === selectedInstrumentId ? "active" : ""
//                   }
//                   onClick={() => handleSelect(instrument.id)}
//                 >
//                   {instrument.name}
//                 </a>
//               </motion.li>
//             ))}
//           </motion.ul>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default InstrumentDropdown;
