'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimelineState } from '@/types';

interface TimelineScrubberProps {
  startDate: Date;
  endDate: Date;
  onTimeChange: (time: Date) => void;
  onPlaybackChange: (isPlaying: boolean) => void;
  className?: string;
}

export default function TimelineScrubber({
  startDate,
  endDate,
  onTimeChange,
  onPlaybackChange,
  className = ''
}: TimelineScrubberProps) {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    start_date: startDate,
    end_date: endDate,
    current_time: startDate,
    is_playing: false,
    playback_speed: 1
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const totalDuration = endDate.getTime() - startDate.getTime();
  const currentProgress = (timelineState.current_time.getTime() - startDate.getTime()) / totalDuration;

  // Playback control
  const togglePlayback = useCallback(() => {
    const newIsPlaying = !timelineState.is_playing;
    setTimelineState(prev => ({ ...prev, is_playing: newIsPlaying }));
    onPlaybackChange(newIsPlaying);
  }, [timelineState.is_playing, onPlaybackChange]);

  const stopPlayback = useCallback(() => {
    setTimelineState(prev => ({ ...prev, is_playing: false }));
    onPlaybackChange(false);
  }, [onPlaybackChange]);

  const resetToStart = useCallback(() => {
    const newTime = startDate;
    setTimelineState(prev => ({ ...prev, current_time: newTime, is_playing: false }));
    onTimeChange(newTime);
    onPlaybackChange(false);
  }, [startDate, onTimeChange, onPlaybackChange]);

  const resetToEnd = useCallback(() => {
    const newTime = endDate;
    setTimelineState(prev => ({ ...prev, current_time: newTime, is_playing: false }));
    onTimeChange(newTime);
    onPlaybackChange(false);
  }, [endDate, onTimeChange, onPlaybackChange]);

  // Playback speed control
  const changePlaybackSpeed = useCallback((speed: number) => {
    setTimelineState(prev => ({ ...prev, playback_speed: speed }));
  }, []);

  // Mouse/touch event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartTime(timelineState.current_time);
  }, [timelineState.current_time]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current || !dragStartTime) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const deltaProgress = deltaX / rect.width;
    const deltaTime = deltaProgress * totalDuration;
    
    const newTime = new Date(dragStartTime.getTime() + deltaTime);
    const clampedTime = new Date(Math.max(startDate.getTime(), Math.min(endDate.getTime(), newTime.getTime())));
    
    setTimelineState(prev => ({ ...prev, current_time: clampedTime }));
    onTimeChange(clampedTime);
  }, [isDragging, dragStartX, dragStartTime, totalDuration, startDate, endDate, onTimeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartX(0);
    setDragStartTime(null);
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setDragStartTime(timelineState.current_time);
  }, [timelineState.current_time]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !sliderRef.current || !dragStartTime) return;

    const touch = e.touches[0];
    const rect = sliderRef.current.getBoundingClientRect();
    const deltaX = touch.clientX - dragStartX;
    const deltaProgress = deltaX / rect.width;
    const deltaTime = deltaProgress * totalDuration;
    
    const newTime = new Date(dragStartTime.getTime() + deltaTime);
    const clampedTime = new Date(Math.max(startDate.getTime(), Math.min(endDate.getTime(), newTime.getTime())));
    
    setTimelineState(prev => ({ ...prev, current_time: clampedTime }));
    onTimeChange(clampedTime);
  }, [isDragging, dragStartX, dragStartTime, totalDuration, startDate, endDate, onTimeChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartX(0);
    setDragStartTime(null);
  }, []);

  // Playback animation
  useEffect(() => {
    if (timelineState.is_playing) {
      playbackRef.current = setInterval(() => {
        setTimelineState(prev => {
          const newTime = new Date(prev.current_time.getTime() + (1000 * timelineState.playback_speed));
          
          if (newTime >= endDate) {
            // Stop at end
            onPlaybackChange(false);
            return { ...prev, current_time: endDate, is_playing: false };
          }
          
          onTimeChange(newTime);
          return { ...prev, current_time: newTime };
        });
      }, 100);
    } else if (playbackRef.current) {
      clearInterval(playbackRef.current);
      playbackRef.current = null;
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [timelineState.is_playing, timelineState.playback_speed, endDate, onTimeChange, onPlaybackChange]);

  // Global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(ms / (1000 * 60))}m`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatTime(timelineState.current_time)}
          </span>
          <span className="text-xs text-gray-400">
            ({formatDuration(totalDuration)} total)
          </span>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="mb-4">
        <div
          ref={sliderRef}
          className="relative h-8 bg-gray-200 rounded-lg cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg transition-all duration-100"
            style={{ width: `${currentProgress * 100}%` }}
          />
          
          {/* Current Time Indicator */}
          <div
            className="absolute top-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-2"
            style={{ left: `${currentProgress * 100}%` }}
          />
          
          {/* Time Labels */}
          <div className="absolute -top-6 left-0 text-xs text-gray-500">
            {formatTime(startDate)}
          </div>
          <div className="absolute -top-6 right-0 text-xs text-gray-500">
            {formatTime(endDate)}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayback}
            className={`p-2 rounded-full transition-colors ${
              timelineState.is_playing
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {timelineState.is_playing ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={stopPlayback}
            className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Reset Buttons */}
          <button
            onClick={resetToStart}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Go to start"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={resetToEnd}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Go to end"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Speed:</span>
          <select
            value={timelineState.playback_speed}
            onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>

      {/* Progress Info */}
      <div className="text-center text-sm text-gray-500">
        {Math.round(currentProgress * 100)}% complete
      </div>
    </div>
  );
}
