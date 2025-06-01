import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import correctSfx from "../assets/sounds/correct.wav";
import wrongSfx from "../assets/sounds/wrong.wav";
import "../styles/WordCard.css";

export default function WordCard({ word, onNext, allWords }) {
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [playCorrect] = useSound(correctSfx);
  const [playWrong] = useSound(wrongSfx);

  useEffect(() => {
    setSelected(null);

    const incorrect = allWords
      .map(item => item.english)
      .filter(opt => opt !== word.english);

    const uniqueIncorrect = Array.from(new Set(incorrect))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const shuffled = [...uniqueIncorrect, word.english]
      .sort(() => Math.random() - 0.5);

    setOptions(shuffled);
  }, [word, allWords]);

  const handleClick = (choice) => {
    setSelected(choice);
    const isCorrect = choice === word.english;
    isCorrect ? playCorrect() : playWrong();
    setTimeout(() => {
      onNext(isCorrect);
    }, 1000);
  };

  return (
    <motion.div
      className="card-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="sanskrit-word">{word.sanskrit}</h2>
      <div className="options">
        {options.map((opt) => (
          <button
            key={opt}
            className={`option-btn ${selected && (opt === word.english ? "correct" : "wrong")}`}
            onClick={() => handleClick(opt)}
            disabled={!!selected}
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
