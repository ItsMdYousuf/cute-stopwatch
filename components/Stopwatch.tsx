"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoHistory, GoScreenFull } from "react-icons/go";
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
      // Adjust start time to account for already elapsed time
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
        e.preventDefault(); // Prevent page scroll
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
    const minutes = `0${Math.floor(totalSeconds / 60)}`.slice(-2);
    return { minutes, seconds, centiseconds };
  };

  const renderTime = (t: number, sizeClasses: string = "") => {
    const { minutes, seconds, centiseconds } = formatTimeDisplay(t);
    return (
      <div className={`flex justify-center ${sizeClasses}`}>
        <span className="tabular-nums">{minutes}</span>:
        <span className="tabular-nums">{seconds}</span>:
        <span className="tabular-nums text-pink-400">{centiseconds}</span>
      </div>
    );
  };

  return (
    <div
      ref={stopwatchRef}
      className="flex flex-col items-center justify-center p-6 transition-colors duration-500"
    >
      {/* Main Display */}
      <div className="py-8 text-white sm:py-12">
        {renderTime(
          time,
          "text-[4rem] sm:text-[7rem] md:text-[10rem] lg:text-[13rem] font-black  leading-none",
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {!isRunning ? (
          <Button
            btnName={time > 0 ? "Resume" : "Start"}
            className="min-w-[120px] bg-emerald-500 px-6 py-3 text-lg font-bold text-white hover:bg-emerald-600"
            onClick={startTimer}
          />
        ) : (
          <Button
            onClick={stopTimer}
            btnName="Pause"
            className="min-w-[120px] bg-pink-500 px-6 py-3 text-lg font-bold text-white hover:bg-pink-600"
          />
        )}

        <Button
          onClick={recordLap}
          btnName="Lap"
          className="min-w-[100px] bg-blue-500 px-6 py-3 text-lg font-bold text-white hover:bg-blue-600 disabled:opacity-50"
          // disabled={!isRunning}
        />

        <Button
          onClick={resetTimer}
          btnName="Reset"
          className="min-w-[100px] bg-zinc-700 px-6 py-3 text-lg font-bold text-white hover:bg-zinc-600"
        />

        <div className="ml-2 flex gap-4">
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
          <div className="custom-scrollbar max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            {laps.map((lapTime, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-zinc-800/50 p-3 transition-colors last:border-0 hover:bg-zinc-800/30"
              >
                <span className="text-zinc-500">Lap {laps.length - index}</span>
                <span className="text-xl text-white">
                  {renderTime(lapTime, "text-xl")}
                </span>
                <span className="text-xs text-zinc-500">
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
        Press{" "}
        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">
          Space
        </span>{" "}
        to Start/Stop ·
        <span className="ml-1 rounded bg-zinc-800 px-2 py-1 text-zinc-300">
          L
        </span>{" "}
        for Lap ·
        <span className="ml-1 rounded bg-zinc-800 px-2 py-1 text-zinc-300">
          R
        </span>{" "}
        to Reset
      </p>
    </div>
  );
};

export default Stopwatch;
