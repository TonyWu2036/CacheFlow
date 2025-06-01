import { useState, useEffect } from "react";
import useSound from "use-sound";
import correctSfx from "../assets/sounds/correct.wav";
import wrongSfx from "../assets/sounds/wrong.wav";
import "../styles/CompleteSentence.css";

export default function CompleteSentence({ data, onNext }) {
  const [selected, setSelected] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [playCorrect] = useSound(correctSfx);
  const [playWrong] = useSound(wrongSfx);

  useEffect(() => {
    setSelected(null);
    setIsSubmitted(false);
  }, [data]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    const isCorrect = selected === data.correct;
    isCorrect ? playCorrect() : playWrong();
    setTimeout(() => {
      onNext(isCorrect);
    }, 1500);
  };

  return (
    <div className="completion-container">
      <h2>Complete the sentence</h2>
      <div className="sentence-display">
        {data.sentence.map((word, index) => (
          <span key={index} className="sentence-word">
            {word === "___" ? <strong>___</strong> : word}
          </span>
        ))}
      </div>
      <div className="option-buttons">
        {data.options.map((opt, index) => (
          <button
            key={index}
            className={`fill-option ${
              selected === opt ? "selected" : ""
            } ${isSubmitted && opt === data.correct ? "correct" : ""} ${
              isSubmitted && selected === opt && selected !== data.correct
                ? "wrong"
                : ""
            }`}
            onClick={() => setSelected(opt)}
            disabled={isSubmitted}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!selected || isSubmitted}
      >
        Submit
      </button>
    </div>
  );
}
