import { useState, useCallback, useEffect, useRef } from 'react';
import type { ViewportState } from '../types';

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;
const ZOOM_SENSITIVITY = 0.002;
const PINCH_SENSITIVITY = 0.01;

/**
 * Custom hook for pan and zoom interactions on the SVG map.
 * Supports mouse drag, scroll zoom, and pinch-to-zoom on touch devices.
 */
export function useMapInteraction() {
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef(0);

  /** Reset viewport to initial state */
  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  /** Zoom in by a step */
  const zoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale * 1.3),
    }));
  }, []);

  /** Zoom out by a step */
  const zoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale / 1.3),
    }));
  }, []);

  /** Fit the map to center */
  const fitToCenter = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  /** Handle mouse wheel zoom */
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    
    setViewport((prev) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * (1 + delta)));
      
      // Zoom toward cursor position
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left - rect.width / 2;
        const cursorY = e.clientY - rect.top - rect.height / 2;
        const scaleFactor = newScale / prev.scale;
        
        return {
          x: cursorX - scaleFactor * (cursorX - prev.x),
          y: cursorY - scaleFactor * (cursorY - prev.y),
          scale: newScale,
        };
      }
      
      return { ...prev, scale: newScale };
    });
  }, []);

  /** Handle mouse down for panning */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  /** Handle mouse move for panning */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    
    setViewport((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  /** Handle mouse up */
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  /** Handle touch start */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  /** Handle touch move */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastPosition.current.x;
      const dy = e.touches[0].clientY - lastPosition.current.y;
      lastPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      
      setViewport((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = (distance - lastPinchDistance.current) * PINCH_SENSITIVITY;
      lastPinchDistance.current = distance;
      
      setViewport((prev) => ({
        ...prev,
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * (1 + delta))),
      }));
    }
  }, []);

  /** Handle touch end */
  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastPinchDistance.current = 0;
  }, []);

  /** Attach wheel event listener */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return {
    viewport,
    containerRef,
    resetViewport,
    zoomIn,
    zoomOut,
    fitToCenter,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
