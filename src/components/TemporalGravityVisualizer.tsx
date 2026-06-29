import React, { useRef, useEffect, useState } from 'react';

export interface PhysicsTask {
  task_id: string;
  initial_x: number;
  anchor_y: number;
  mass: number;
  radius: number;
  gravitational_charge: number;
  spring_constant_k: number;
  color_gradient?: { start: string; end: string };
  requires_collision_warning?: boolean;
}

interface TemporalGravityVisualizerProps {
  tasksData: PhysicsTask[];
}

export const TemporalGravityVisualizer = ({ tasksData }: TemporalGravityVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 800 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    
    // Initial measure
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const centerX = canvasW / 2;

    // Initialize tasks with physics properties
    let particles = tasksData.map(t => ({
      id: t.task_id,
      x: centerX, 
      y: t.anchor_y,
      vx: 0,
      vy: 0,
      anchorY: t.anchor_y,
      mass: t.mass,
      radius: t.radius,
      gravity: t.gravitational_charge,
      k: t.spring_constant_k,
      pulse: 0
    }));

    const renderLoop = () => {
      // 1. Clear Canvas
      ctx.clearRect(0, 0, canvasW, canvasH);
      
      // 2. Animate and Pulse Tasks Data
      particles.forEach(p => {
        p.pulse += 0.05;
        // Hooke's Law spring pull back to ideal timeline slot: F = -k * x
        const springForceY = -p.k * (p.y - p.anchorY);
        
        // Acceleration = Force / Mass
        const ay = springForceY / p.mass;
        p.vy += ay;
        p.vy *= 0.85; // Friction/Damping coefficient to stabilize movement
        p.y += p.vy;
      });

      // 3. Draw Warped Temporal Background Grid
      ctx.strokeStyle = 'rgba(100, 180, 255, 0.15)';
      ctx.lineWidth = 1;
      
      const gridSpacingX = Math.max(10, canvasW / 40);
      const gridSpacingY = 30;

      for (let gridY = 0; gridY < canvasH; gridY += gridSpacingY) {
        ctx.beginPath();
        for (let gridX = 0; gridX <= canvasW; gridX += gridSpacingX) {
          let currentX = gridX;
          let currentY = gridY;

          // Apply spatial warp from every particle's gravitational field
          particles.forEach(p => {
            const dx = gridX - p.x;
            const dy = gridY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 250) {
              const pullFactor = (p.gravity * p.mass) / (distance + 30);
              // Distort the lines inward toward the massive task node
              currentY += (dy / distance) * pullFactor * Math.sin(p.pulse * 0.2);
            }
          });

          if (gridX === 0) ctx.moveTo(currentX, currentY);
          else ctx.lineTo(currentX, currentY);
        }
        ctx.stroke();
      }

      // 4. Draw Task Spheres
      particles.forEach(p => {
        const dynamicRadius = Math.max(1, p.radius + Math.sin(p.pulse) * 3);
        const gradient = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, dynamicRadius);
        
        // Dynamic shift to hot warning colors if gravity is high
        const colorBase = p.gravity > 7 ? '255, 77, 77' : '64, 156, 255';
        gradient.addColorStop(0, `rgba(${colorBase}, 1)`);
        gradient.addColorStop(1, `rgba(${colorBase}, 0.1)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius, 0, 2 * Math.PI);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [tasksData, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] sm:min-h-[600px] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        className="w-full h-full block touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
