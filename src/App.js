import { useState } from "react";
import "./styles/global.css";
import "./styles/CategorySelector.css";
import "./styles/Reactions.css";
import levelData from "./data/levels.json";
import WordCard from "./components/WordCard";
import grammarData from "./data/grammar.json";
import GrammarChallenge from "./components/GrammarChallenge";
import completionData from "./data/completion.json";
import CompleteSentence from "./components/CompleteSentence";

function App() {
  const [category, setCategory] = useState("Fruits");
  const [challengeType, setChallengeType] = useState("Word Matching");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reaction, setReaction] = useState(null);

  const categories = [
    "Fruits", "Vegetables", "Animals",
    "Places", "Colors", "Vehicles", "Clothing"
  ];

  const challengeTypes = [
    "Word Matching", "Grammar Challenge", "Complete the Sentence"
  ];

  const filteredData = levelData.filter(item => item.category === category);
  const currentWord = filteredData[currentIndex % filteredData.length];

  const handleNext = (isCorrect) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setReaction("correct");
    } else {
      setWrongCount(prev => prev + 1);
      setReaction("wrong");
    }
    setTimeout(() => {
      setReaction(null);
      setCurrentIndex(prev => (prev + 1) % filteredData.length);
    }, 1500);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="title-block">
          <h1>🌍 Language Quest</h1>
          <p>Test your Sanskrit skills through fun and interactive challenges!</p>
        </div>
        <div className="scoreboard">
          <p>✅ Correct: {correctCount}</p>
          <p>❌ Wrong: {wrongCount}</p>
        </div>
      </div>

      <div className="selectors">
        <select
          className="challenge-dropdown"
          value={challengeType}
          onChange={(e) => setChallengeType(e.target.value)}
        >
          {challengeTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {challengeType === "Word Matching" && (
          <div className="category-selector">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${category === cat ? "active" : ""}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {reaction === "correct" && <div className="emoji reaction-left">😊</div>}
      {reaction === "wrong" && <div className="emoji reaction-right">😢</div>}

      {challengeType === "Word Matching" && (
        <WordCard
          word={currentWord}
          onNext={handleNext}
          allWords={filteredData}
        />
      )}

      {challengeType === "Grammar Challenge" && (
        <GrammarChallenge
          sentenceData={grammarData[currentIndex % grammarData.length]}
          onNext={handleNext}
        />
      )}

      {challengeType === "Complete the Sentence" && (
        <CompleteSentence
          data={completionData[currentIndex % completionData.length]}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

export default App;
