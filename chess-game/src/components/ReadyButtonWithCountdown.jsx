import React, { useEffect, useState } from "react";

const ReadyButtonWithCountdown = ({
  isReady,
  onReady,
  countdownSeconds = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isReady && timeLeft > 0) {
      setTimerRunning(true);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isReady]);

  const handleClick = () => {
    if (!isReady) setTimeLeft(countdownSeconds);
    onReady();
  };

  return (
    <div className="relative w-64 h-64 flex flex-col justify-center items-center">
      <div
        className={`
          absolute w-full h-full rounded-full border-4 transition-all duration-300
          ${
            isReady
              ? "border-blue-500 animate-pulse shadow-blue-400 shadow-md"
              : "border-gray-400"
          }
        `}
      ></div>
      <div className="z-10 text-center">
        <div className="text-2xl font-bold text-white">
          {isReady ? "HỦY SẴN SÀNG" : "SẴN SÀNG"}
        </div>
        {isReady && timerRunning && (
          <div className="text-lg text-yellow-300 mt-1">{timeLeft}s</div>
        )}
        <button
          onClick={handleClick}
          className={`mt-4 px-6 py-2 rounded-full font-semibold transition
            ${
              isReady
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
            text-white shadow-lg`}
        >
          {isReady ? "Từ chối" : "Chơi luôn!"}
        </button>
      </div>
    </div>
  );
};

export default ReadyButtonWithCountdown;
