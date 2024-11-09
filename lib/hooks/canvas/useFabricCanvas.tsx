'use client'
import { useEffect, useRef, useState } from "react";
import fabric from "fabric-with-erasing";

const DEV_MODE = process.env.NODE_ENV === "development";

export function useFabricCanvas(onLoad?: (canvas:any) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<any | null>(null);

  useEffect(() => {
    console.log(canvas, canvasRef, canvasParentRef);
  }, [canvas, canvasRef, canvasParentRef]);

  useEffect(() => {
    if (!canvasRef.current) return;

    fabric.fabric.Object.prototype.set({
        borderColor: "#F21414",
        cornerColor: "#F21414",
        cornerSize: 16,
        cornerStyle: 'circle'
    });

    const CANVAS_SIZE = 800;
    const newCanvas = new fabric.fabric.Canvas(canvasRef.current, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      selectionBorderColor: "#F21414",
      selectionColor: "#F2141456",
      altActionKey: "shiftKey",
      centeredRotation: true,
      backgroundColor: "white",
    });
    setCanvas(newCanvas);

    if (DEV_MODE) {
      (window as any).canvas = newCanvas;
    }

    onLoad?.(newCanvas);

    return () => {
      if (DEV_MODE) {
        delete (window as any).canvas;
      }
      newCanvas.dispose();
    };
  }, [onLoad]);

  useEffect(() => {
    if (!canvasParentRef.current || !canvas) return;

    const resizeCanvas = () => {
      const containerRect = canvasParentRef.current!.getBoundingClientRect();
      const size = Math.min(containerRect.width, containerRect.height);
      
      canvas.setDimensions({
        width: containerRect.width,
        height: containerRect.height
      }, { backstoreOnly: false });

      const scale = size / 800;
      canvas.setZoom(scale);
      
      const left = (containerRect.width - (800 * scale)) / 2;
      const top = (containerRect.height - (800 * scale)) / 2;
      
      canvas.setViewportTransform([scale, 0, 0, scale, left, top]);
      canvas.renderAll();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasParentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvas]);

  return { canvas, setCanvas, canvasRef, canvasParentRef };
}