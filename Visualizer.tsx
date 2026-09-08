import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { VisualizerMode } from '../types';

interface VisualizerProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  colorScheme?: 'lcd' | 'cyber' | 'neon';
  className?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  mode,
  isPlaying,
  colorScheme = 'lcd',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const peakValues = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 32;
    const freqData = new Uint8Array(bufferLength);
    const waveData = new Uint8Array(bufferLength);

    if (peakValues.current.length !== bufferLength) {
      peakValues.current = new Array(bufferLength).fill(0);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (mode === 'bars') {
        audioEngine.getFrequencyData(freqData);

        const barCount = 16;
        const gap = 3;
        const totalGap = (barCount - 1) * gap;
        const barWidth = Math.max(3, (width - totalGap) / barCount);
        const segments = 12;

        for (let i = 0; i < barCount; i++) {
          // Read value from frequency data
          const dataIdx = Math.floor((i / barCount) * bufferLength * 0.85);
          let value = isPlaying ? freqData[dataIdx] / 255 : 0;

          // Gentle ambient pulsing if paused
          if (!isPlaying) {
            value = 0.05 + 0.04 * Math.sin(Date.now() / 300 + i * 0.5);
          }

          // Update peak hold
          if (value > peakValues.current[i]) {
            peakValues.current[i] = value;
          } else {
            peakValues.current[i] = Math.max(0, peakValues.current[i] - 0.015);
          }

          const activeSegments = Math.round(value * segments);
          const x = i * (barWidth + gap);

          // Draw stacked LED segments
          const segHeight = Math.max(2, (height - segments * 2) / segments);

          for (let s = 0; s < segments; s++) {
            const segY = height - (s + 1) * (segHeight + 2);
            const isLit = s < activeSegments;
            const isPeak = Math.round(peakValues.current[i] * segments) === s + 1;

            if (isLit || isPeak) {
              if (s > segments - 3) {
                ctx.fillStyle = colorScheme === 'neon' ? '#ff3366' : '#e63946'; // Red peak
              } else if (s > segments - 6) {
                ctx.fillStyle = colorScheme === 'neon' ? '#ffbe0b' : '#f4a261'; // Yellow warning
              } else {
                ctx.fillStyle = colorScheme === 'neon' ? '#00f5d4' : '#2a9d8f'; // Cyan/Teal
              }
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = isLit ? 3 : 1;
            } else {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // unlit segment
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(x, segY, barWidth, segHeight);
          }
        }
      } else if (mode === 'wave') {
        audioEngine.getWaveformData(waveData);

        ctx.lineWidth = 2;
        ctx.strokeStyle = colorScheme === 'neon' ? '#00f5d4' : '#1d3557';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = isPlaying ? 4 : 1;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = waveData[i] / 128.0;
          if (!isPlaying) {
            v = 1.0 + 0.08 * Math.sin(Date.now() / 250 + i * 0.4);
          }
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      } else {
        // Dots mode
        audioEngine.getFrequencyData(freqData);
        const cols = 16;
        const rows = 8;
        const dotRadius = Math.min(width / (cols * 2.5), height / (rows * 2.5));
        const colSpacing = width / cols;
        const rowSpacing = height / rows;

        for (let c = 0; c < cols; c++) {
          const val = isPlaying ? freqData[c] / 255 : 0.08;
          const litRows = Math.round(val * rows);

          for (let r = 0; r < rows; r++) {
            const isLit = r < litRows;
            const cx = c * colSpacing + colSpacing / 2;
            const cy = height - (r * rowSpacing + rowSpacing / 2);

            ctx.beginPath();
            ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);

            if (isLit) {
              ctx.fillStyle = colorScheme === 'neon' ? '#38bdf8' : '#0284c7';
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 3;
            } else {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
              ctx.shadowBlur = 0;
            }
            ctx.fill();
          }
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [mode, isPlaying, colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={48}
      className={`w-full h-full block ${className}`}
    />
  );
};
