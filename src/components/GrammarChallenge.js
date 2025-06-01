import { useState, useEffect } from "react";
import useSound from "use-sound";
import correctSfx from "../assets/sounds/correct.wav";
import wrongSfx from "../assets/sounds/wrong.wav";
import "../styles/GrammarChallenge.css";

export default function GrammarChallenge({ sentenceData, onNext }) {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [playCorrect] = useSound(correctSfx);
  const [playWrong] = useSound(wrongSfx);

  useEffect(() => {
    const shuffled = [...sentenceData.correct].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setSelectedWords([]);
    setIsSubmitted(false);
  }, [sentenceData]);

  const handleSelect = (word) => {
    if (!isSubmitted && !selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const isCorrect = JSON.stringify(selectedWords) === JSON.stringify(sentenceData.correct);
    isCorrect ? playCorrect() : playWrong();
    setTimeout(() => {
      onNext(isCorrect);
    }, 1500);
  };

  return (
    <div className="grammar-container">
      <h2>Arrange the words to form a correct sentence</h2>
      <div className="word-bank">
        {shuffledWords.map((word, index) => (
          <button
            key={index}
            className={`word-btn ${selectedWords.includes(word) ? "used" : ""}`}
            onClick={() => handleSelect(word)}
            disabled={isSubmitted}
          >
            {word}
          </button>
        ))}
      </div>
      <div className="selected-area">
        {selectedWords.map((word, index) => (
          <span key={index} className="selected-word">{word}</span>
        ))}
      </div>
      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={selectedWords.length !== sentenceData.correct.length || isSubmitted}
      >
        Submit
      </button>
    </div>
  );
}
