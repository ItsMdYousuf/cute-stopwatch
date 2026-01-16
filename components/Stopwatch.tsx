"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoHistory, GoScreenFull, GoTrash } from "react-icons/go";
import Button from "./Button";

const Stopwatch: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stopwatchRef = useRef<HTMLDivElement>(null);

  // --- Logic Functions ---
  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - time * 10;
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - (startTimeRef.current ?? 0)) / 10,
        );
        setTime(elapsed);
      }, 10);
    }
  }, [isRunning, time]);

  const stopTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTime(0);
    setLaps([]);
    startTimeRef.current = null;
  }, []);

  const recordLap = useCallback(() => {
    if (isRunning || time > 0) {
      setLaps((prevLaps) => [time, ...prevLaps]);
    }
  }, [isRunning, time]);

  const deleteLap = useCallback((index: number) => {
    setLaps((prevLaps) => prevLaps.filter((_, i) => i !== index));
  }, []);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      stopwatchRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        isRunning ? stopTimer() : startTimer();
      } else if (e.key.toLowerCase() === "l") {
        recordLap();
      } else if (e.key.toLowerCase() === "r") {
        resetTimer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, startTimer, stopTimer, recordLap, resetTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Formatting Helpers ---
  const formatTimeDisplay = (t: number) => {
    const centiseconds = `0${t % 100}`.slice(-2);
    const totalSeconds = Math.floor(t / 100);
    const seconds = `0${totalSeconds % 60}`.slice(-2);
    const minutes = Math.floor(totalSeconds / 60);
    const formattedMinutes = `0${minutes % 60}`.slice(-2);
    const hours = `0${Math.floor(minutes / 60)}`.slice(-2);

    return {
      hours,
      minutes,
      seconds,
      formattedMinutes,
      centiseconds,
      totalSeconds,
    };
  };

  const renderTime = (t: number, sizeClasses: string = "") => {
    const { hours, minutes, seconds, formattedMinutes, centiseconds } =
      formatTimeDisplay(t);
    // If over 60 mins, show Hours:Minutes:Seconds. Otherwise show Minutes:Seconds:MS
    const isOverHour = minutes >= 60;

    return (
      <div className={`flex justify-center ${sizeClasses}`}>
        <span className="tabular-nums">
          {isOverHour ? hours : formattedMinutes}
        </span>
        :
        <span className="tabular-nums">
          {isOverHour ? formattedMinutes : seconds}
        </span>
        :
        <span className="tabular-nums text-pink-400">
          {isOverHour ? seconds : centiseconds}
        </span>
      </div>
    );
  };

  const { minutes } = formatTimeDisplay(time);
  const isOverHour = minutes >= 60;

  return (
    <div
      ref={stopwatchRef}
      className="flex min-h-screen select-none flex-col items-center justify-center p-4 transition-colors duration-500 sm:p-6"
    >
      <style jsx>{`
        .dark-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .dark-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 5px;
        }
        .dark-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 5px;
        }
        .dark-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .dark-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
      `}</style>

      {/* Main Display */}
      <div className="py-4 text-white sm:py-8">
        {renderTime(
          time,
          "text-[12vw] sm:text-[7rem] md:text-[10rem] lg:text-[13rem] font-black leading-none",
        )}
        {/* New Dynamic Counters */}
        <div className="mb-10 flex w-full justify-around gap-12 text-sm font-black uppercase tracking-widest text-slate-300 sm:text-lg">
          <div className="flex flex-col items-center">
            <span>{isOverHour ? "Hours" : "Minutes"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span>Seconds</span>
          </div>
          <div className="flex flex-col items-center">
            <span>NanoSeconds</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid w-full max-w-xs grid-cols-2 gap-4 sm:flex sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        {!isRunning ? (
          <Button
            btnName={time > 0 ? "Resume" : "Start"}
            className="min-w-0 bg-emerald-500 px-6 py-3 text-lg font-bold text-white hover:bg-emerald-600 sm:min-w-[120px]"
            onClick={startTimer}
          />
        ) : (
          <Button
            onClick={stopTimer}
            btnName="Pause"
            className="min-w-0 bg-pink-500 px-6 py-3 text-lg font-bold text-white hover:bg-pink-600 sm:min-w-[120px]"
          />
        )}

        <Button
          onClick={recordLap}
          btnName="Lap"
          className="min-w-0 bg-blue-500 px-6 py-3 text-lg font-bold text-white hover:bg-blue-600 sm:min-w-[100px]"
        />

        <Button
          onClick={resetTimer}
          btnName="Reset"
          className="min-w-0 bg-zinc-700 px-6 py-3 text-lg font-bold text-white hover:bg-zinc-600 sm:min-w-[100px]"
        />

        <div className="col-span-2 flex justify-center sm:col-span-1 sm:ml-2">
          <GoScreenFull
            className="cursor-pointer text-3xl text-zinc-400 transition-colors hover:text-white"
            onClick={handleFullScreen}
            title="Toggle Fullscreen"
          />
        </div>
      </div>

      {/* Laps Section */}
      {laps.length > 0 && (
        <div className="mt-10 w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2 border-b border-zinc-800 p-4 text-zinc-400">
            <GoHistory />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Lap History
            </span>
          </div>
          <div className="dark-scrollbar max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            {laps.map((lapTime, index) => (
              <div
                key={index}
                className="group flex items-center justify-between border-b border-zinc-800/50 p-3 transition-colors last:border-0 hover:bg-zinc-800/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 sm:text-sm">
                    Lap {laps.length - index}
                  </span>
                  <button
                    onClick={() => deleteLap(index)}
                    className="opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0"
                    title="Delete lap"
                  >
                    <GoTrash className="text-red-500 hover:text-red-400" />
                  </button>
                </div>
                <span className="text-lg text-white sm:text-xl">
                  {renderTime(lapTime, "text-lg sm:text-xl")}
                </span>
                <span className="hidden text-xs text-zinc-500 sm:block">
                  +
                  {index === laps.length - 1
                    ? "0.00"
                    : ((laps[index] - laps[index + 1]) / 100).toFixed(2)}
                  s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Hint */}
      <p className="mt-8 hidden text-sm text-zinc-500 md:block">
        Press
        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">
          Space
        </span>
        to Start/Stop ·
        <span className="ml-1 rounded bg-zinc-800 px-2 py-1 text-zinc-300">
          L
        </span>
        for Lap ·
        <span className="ml-1 rounded bg-zinc-800 px-2 py-1 text-zinc-300">
          R
        </span>
        to Reset
      </p>
    </div>
  );
};

export default Stopwatch;
