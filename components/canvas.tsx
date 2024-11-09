"use client";
import React, { useEffect } from "react";
import { useFabricCanvas } from "@/lib/hooks/canvas/useFabricCanvas";
import LoadingDots from "./ui/loading-dots";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

declare global {
  var canvas: any;
}

export const Canvas = React.forwardRef<
  any,
  {
    onLoad?(canvas: any): void;
    Toolbar?: React.ComponentType<{
      canvas: any;
      isOpen: boolean;
      setIsOpen: (isOpen: boolean) => void;
    }>;
  }
>(({ onLoad, Toolbar }, ref) => {
  const { canvas, canvasRef, canvasParentRef } = useFabricCanvas(onLoad);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      canvas?.setDimensions({
        width: window.innerWidth - 64,
        height: window.innerHeight - 64,
      });
    } else {
      document.body.style.overflow = "unset";
      canvas?.setDimensions({
        width: canvasParentRef.current?.clientWidth,
        height: canvasParentRef.current?.clientHeight,
      });
    }
    canvas?.renderAll();
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, canvas]);

  React.useImperativeHandle(ref, () => canvas!, [canvas]);

  return (
    <div className="relative w-full shadow-lg rounded-xl">
      {!canvas ?? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <LoadingDots />
        </div>
      )}
      <div
        className={`${
          isOpen ? "fixed inset-0 p-16 bg-black/50 z-[1000]" : "relative"
        }  flex w-full h-full items-center justify-center `}
      >
        <div
          className="relative rounded-xl w-full h-full aspect-square "
          ref={canvasParentRef}
        >
          <canvas
            className="rounded-xl shadow-lg border-primary w-full h-full"
            ref={canvasRef}
          />
          {Toolbar && canvas && (
            <Toolbar canvas={canvas} isOpen={isOpen} setIsOpen={setIsOpen} />
          )}
        </div>
      </div>
    </div>
  );
});
