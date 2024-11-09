"use client";
import { useState, useEffect } from "react";
import MaxWidthWrapper from "./max-width-wrapper";
import { createPortal } from "react-dom";
import { useMediaQuery } from "usehooks-ts";
import { motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { MotionDiv } from "@/types/framer-fix";


interface ModalProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onExit?: () => void;
}

export const removeScrollBlock = () => {
  const scrollJuice = document.getElementById("scroll-juice");
  const overflowValue = "auto"

  if (scrollJuice) {
    scrollJuice.style.overflow = overflowValue;
  }

  document.body.style.overflow = overflowValue;
}


const Modal: React.FC<ModalProps> = ({
  children,
  className,
  isOpen,
  onExit,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const internalOnExit = () => {
    removeScrollBlock()
    if(onExit){
      onExit()
    }
   
  }

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 350); // Match with your animation duration
    }
  }, [isOpen]);

  

  useEffect(() => {
    const scrollJuice = document.getElementById("scroll-juice");
    const overflowValue = isOpen ? "hidden" : "auto";

    if (scrollJuice) {
      scrollJuice.style.overflow = overflowValue;
    }

    document.body.style.overflow = overflowValue;
  }, [isOpen]);

  if (!isVisible) return null; // Only render the modal if it's visible

  if (isMobile) {
    return (
      <>
        {createPortal(
          <MaxWidthWrapper>
            <MotionDiv
              className="fixed inset-0 w-full h-screen max-h-screen bg-white z-[100]"
              initial={{ x: "100%" }}
              animate={{ x: isOpen ? 0 : "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onAnimationComplete={() => {
                if (!isOpen) internalOnExit?.();
              }}
            >
              <div className="h-full flex flex-col">
                <button
                  onClick={internalOnExit}
                  type="button"
                  className="self-start mt-4 ml-4 mb-4 p-2 hover:bg-neutral-200 text-mainPink rounded-none flex items-center space-x-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Close panel</span>
                </button>

                <div className="w-full h-full overflow-auto p-8" onClick={(e) => e.stopPropagation()}>
                  {children}
                </div>
              </div>
            </MotionDiv>
          </MaxWidthWrapper>,
          document.body
        )}
      </>
    );
  } else {
    return (
      <>
        {createPortal(
          <MaxWidthWrapper>
            <div
              className={`h-screen w-full  fixed top-0 left-0 z-[50] flex justify-center items-center ${
                !isOpen ? "hidden" : ""
              }`}
            >
              <MotionDiv
                className={`z-50 bg-black/40 h-full w-full p-16 relative flex justify-center items-center ${className}`}
                onClick={internalOnExit}
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                onAnimationComplete={() => {
                  if (!isOpen) {
                    setIsVisible(false);
                    internalOnExit?.();
                  }
                }}
              >

                <div className="p-4 rounded-md max-h-full overflow-auto bg-white flatBoxShadow " onClick={(e) => e.stopPropagation()}>
                  {children}
                </div>
              </MotionDiv>
            </div>
          </MaxWidthWrapper>,
          document.body
        )}
      </>
    );
  }
};
export default Modal