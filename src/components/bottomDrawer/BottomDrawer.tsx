import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
// import { useAppSelector } from "../../../store/hook";

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomDrawer = ({ isOpen, onClose, children }: BottomDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const [translateY, setTranslateY] = useState(0);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    if (!isOpen) setTranslateY(0);
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Touch events for swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
  };

  const drawerVariants = {
    hidden: {
      y: "100%", // Start off-screen at the bottom
    },
    visible: {
      y: "0%", // Move to its original position (fully on-screen)
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 120,
      } as Transition,
    },
    exit: {
      y: "100%", // Animate back off-screen when closing
      transition: {
        duration: 0.3,
      },
    },
  };
  //   const theme = useAppSelector((state) => state.theme.mode);

  const theme = "dark";
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className={`
              fixed bottom-0 left-0 right-0 ${
                theme === "dark" ? "bg-primaryBg" : "bg-lightDrawerBg"
              } backdrop-blur-md text-primary rounded-t-[10px] shadow-xl z-50
              w-full max-w-[390px] mx-auto border border-primary
            `}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ translateY: translateY }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Gray top bar inside drawer */}
            {/* <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 z-50 w-28 h-1 bg-gray-600 rounded-full" /> */}

            <div className="p-2.5 h-full overflow-y-auto relative">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomDrawer;
