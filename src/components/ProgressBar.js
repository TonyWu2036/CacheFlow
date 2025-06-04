import { useState, useEffect } from "react";
import "../styles/ProgressBar.css";

function Sprite({ src, frameWidth, frameCount, isAnimating, height }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frameCount);
    }, 120);
    return () => clearInterval(interval);
  }, [isAnimating, frameCount]);

  return (
    <div
      style={{
        width: frameWidth,
        height: height,
        background: `url(${src}) left center / auto 100%`,
        backgroundPosition: `-${frame * frameWidth}px 0px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

export default function ProgressBar({ progressPoints, maxProgress, gemMilestones, isHurt }) {
  const progressPercent = Math.min((progressPoints / maxProgress) * 100, 100);

  // Animation logic
  let spriteSrc = "/sprites/IDLE.png";
  let frameWidth = 96;
  let frameCount = 10;
  let spriteHeight = 96;

  if (isHurt) {
    spriteSrc = "/sprites/HURT.png";
    frameWidth = 96;
    frameCount = 4;
    spriteHeight = 96;
  } else if (progressPoints > 0) {
    spriteSrc = "/sprites/RUN.png";
    frameWidth = 128;
    frameCount = 12;
    spriteHeight = 128;
  }

  return (
    <div className="progress-container">
      {/* Background Path */}
      <div className="progress-path">
        {/* Filled Progress */}
        <div 
          className="filled-path" 
          style={{ width: `${progressPercent}%` }}
        ></div>
        
        {/* Gems */}
        {gemMilestones.map((milestone) => (
          <img
            key={milestone}
            src="/sprites/gem.gif"
            alt="Gem"
            className="gem"
            style={{
              left: `${(milestone / maxProgress) * 100}%`,
              opacity: progressPoints >= milestone ? 1 : 0.3
            }}
          />
        ))}

        {/* Character sprite */}
        <div 
          className="character-container"
          style={{ left: `${progressPercent}%` }}
        >
          <Sprite
            src={spriteSrc}
            frameWidth={frameWidth}
            frameCount={frameCount}
            isAnimating={progressPoints > 0 || isHurt}
            height={spriteHeight}
          />
        </div>
      </div>
    </div>
  );
}
