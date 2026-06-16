import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { audio } from './AudioEngine';

interface TracingCanvasProps {
  letter: string;
  lowercase: string;
  colorClass: string;
  onTraceComplete: () => void;
}

const BRUSH_COLORS = [
  { name: 'Red 🍎', value: '#EF4444' },
  { name: 'Blue 🐳', value: '#3B82F6' },
  { name: 'Green 🐸', value: '#10B981' },
  { name: 'Gold 🌟', value: '#F59E0B' },
  { name: 'Violet 🦄', value: '#8B5CF6' }
];

export default function TracingCanvas({ letter, lowercase, colorClass, onTraceComplete }: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [selectedBrushColor, setSelectedBrushColor] = useState(BRUSH_COLORS[0].value);
  const [brushWidth, setBrushWidth] = useState(24); // Large kid-friendly touch size

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use full container dimensions dynamically
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight || 320;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = selectedBrushColor;
    context.lineWidth = brushWidth;
    contextRef.current = context;

    clearAndRedrawBackground();
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = selectedBrushColor;
    }
  }, [selectedBrushColor]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushWidth;
    }
  }, [brushWidth]);

  const clearAndRedrawBackground = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);

    // Draw the tracing guide (large, beautiful dotted/dashed font in light gray)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 160px sans-serif';
    ctx.fillStyle = '#E5E7EB'; // standard tailwind gray-200
    ctx.strokeStyle = '#9CA3AF'; // dashed outline gray-400
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);

    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Draw Letter pair: "A a"
    const textToDraw = `${letter} ${lowercase}`;
    ctx.fillText(textToDraw, x, y);
    ctx.strokeText(textToDraw, x, y);
    ctx.restore();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    if (!contextRef.current) return;

    audio.playDraw();
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    // Play drawing sound less intensely
    if (Math.random() < 0.3) {
      audio.playDraw();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const handleFinish = () => {
    if (!hasDrawn) {
      audio.playError();
      audio.speak("Try drawing first!");
      return;
    }
    audio.playSuccess();
    audio.speakEncouragement();
    onTraceComplete();
    clearAndRedrawBackground();
  };

  return (
    <div id="tracing-canvas-container" className="flex flex-col h-full justify-between gap-4">
      {/* Upper Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-sky-100 border-4 border-slate-900 rounded-[28px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          SELECT CRAYON COLOR:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {BRUSH_COLORS.map((color) => (
            <button
              key={color.value}
              id={`color-brush-${color.value}`}
              onClick={() => {
                audio.playPop();
                setSelectedBrushColor(color.value);
              }}
              style={{ backgroundColor: color.value }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black text-white hover:scale-105 active:scale-95 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer ${
                selectedBrushColor === color.value ? 'ring-4 ring-yellow-350 scale-105' : 'opacity-90'
              }`}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 min-h-[240px] bg-white border-4 border-slate-900 rounded-[32px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] cursor-crosshair">
        <canvas
          ref={canvasRef}
          id="drawing-trace-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
        {!hasDrawn && (
          <div className="absolute top-4 left-4 pointer-events-none bg-yellow-200 border-2 border-slate-900 px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-[11px] font-black text-slate-900">
            ✨ Trace inside the lines!
          </div>
        )}
      </div>

      {/* Brush Size & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3 bg-slate-100 border-4 border-slate-900 px-4 py-2.5 rounded-2xl w-full sm:w-auto shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <span className="text-xs font-black text-slate-900 shrink-0">SIZE:</span>
          <input
            type="range"
            id="brush-size-slider"
            min="12"
            max="40"
            value={brushWidth}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBrushWidth(val);
            }}
            className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs font-mono font-black text-slate-900 shrink-0 w-8 text-right">
            {brushWidth}px
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto self-end">
          <button
            id="clear-trace-button"
            onClick={() => {
              audio.playPop();
              clearAndRedrawBackground();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-3 bg-slate-200 hover:bg-slate-350 text-slate-900 font-extrabold rounded-2xl border-4 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all text-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            Clear
          </button>

          <button
            id="finish-trace-button"
            onClick={handleFinish}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-3.5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all text-sm cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 animate-pulse shrink-0" />
            I Drew It! ⭐
          </button>
        </div>
      </div>
    </div>
  );
}
