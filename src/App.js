import { useState, useEffect } from "react";
import { generateAIQuestions } from "./utils/perplexity";
import "./styles/global.css";
import "./styles/CategorySelector.css";
import "./styles/Reactions.css";
import levelData from "./data/levels.json";
import WordCard from "./components/WordCard";
import grammarData from "./data/grammar.json";
import GrammarChallenge from "./components/GrammarChallenge";
import completionData from "./data/completion.json";
import CompleteSentence from "./components/CompleteSentence";
import ProgressBar from "./components/ProgressBar";
import { useRef } from "react";




function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


function App() {
  // UI state for current selections and game progress
  const [category, setCategory] = useState("Fruits");
  const [challengeType, setChallengeType] = useState("Word Matching");
  const [currentLevel, setCurrentLevel] = useState("LEVEL_1");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reaction, setReaction] = useState(null);
  const [isHurt, setIsHurt] = useState(false);
  const shuffledQuestionsRef = useRef({});

useEffect(() => {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    document.body.className = currentLevel.toLowerCase();
    setTimeout(() => document.body.classList.remove("fade-out"), 10);
  }, 800);
}, [currentLevel]);

  // Structure: LEVEL_X -> challenge_type -> category (for word_matching only)
  const [aiData, setAiData] = useState({
    LEVEL_1: { 
      word_matching: { Fruits: [], Vegetables: [], Animals: [], Places: [], Colors: [], Vehicles: [], Clothing: [] }, 
      grammar_challenge: [], 
      complete_sentence: [] 
    },
    LEVEL_2: { 
      word_matching: { Fruits: [], Vegetables: [], Animals: [], Places: [], Colors: [], Vehicles: [], Clothing: [] }, 
      grammar_challenge: [], 
      complete_sentence: [] 
    },
    LEVEL_3: { 
      word_matching: { Fruits: [], Vegetables: [], Animals: [], Places: [], Colors: [], Vehicles: [], Clothing: [] }, 
      grammar_challenge: [], 
      complete_sentence: [] 
    },
    loading: true,
    error: null
  });

  //PROGRESS AND GAMEPLAY
  const [progressPoints, setProgressPoints] = useState(0); // 0-20 (max score)
  const maxProgress = 20;
  const gemMilestones = [5, 9, 15];

  // Available categories for word matching challenges
  const categories = ["Fruits", "Vegetables", "Animals", "Places", "Colors", "Vehicles", "Clothing"];
  // Available challenge types in the app
  const challengeTypes = ["Word Matching", "Grammar Challenge", "Complete the Sentence"];


  // DATA CLEANING FUNCTION 
  /**
   * Cleans corrupted Sanskrit text from API responses
   * - Removes numeric codes (e.g., "मार746;रः" -> "मार्जारः")
   * - Preserves complete_sentence and grammar_challenge arrays intact
   * - Only cleans sanskrit text in word_matching data
   */
  const cleanSanskritData = (data) => {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map(item => cleanSanskritData(item));
    }
    if (typeof data === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === 'complete_sentence' || key === 'grammar_challenge') {
          cleaned[key] = value;
        } else if (key === 'sanskrit' && typeof value === 'string') {
          cleaned[key] = value.replace(/\d+;/g, '').replace(/[0-9]/g, '');
        } else if (key === 'sanskrit_corrected') {
          cleaned['sanskrit'] = value;
        } else {
          cleaned[key] = cleanSanskritData(value);
        }
      }
      return cleaned;
    }
    return data;
  };

  // API SHIT HERE
  /**
   * Generates all questions from Perplexity API on component mount
   * - Sends structured prompt to get Sanskrit learning questions
   * - Cleans corrupted data before storing in state
   * - Handles errors and fallback to static data
   */
  useEffect(() => {
    const generateAllQuestions = async () => {
      console.log("Starting question generation...");
      setAiData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const prompt = `Generate Sanskrit learning questions in JSON format. Return only valid JSON without markdown formatting.

{
  "LEVEL_1": {
    "word_matching": {
      "Fruits": [{"category": "Fruits", "sanskrit": "सेबः", "english": "Apple"}, {"category": "Fruits", "sanskrit": "केलः", "english": "Banana"}, {"category": "Fruits", "sanskrit": "आम्रः", "english": "Mango"}],
      "Vegetables": [{"category": "Vegetables", "sanskrit": "आलुकम्", "english": "Potato"}, {"category": "Vegetables", "sanskrit": "वर्ताकी", "english": "Brinjal"}, {"category": "Vegetables", "sanskrit": "गाजरः", "english": "Carrot"}],
      "Animals": [{"category": "Animals", "sanskrit": "सिंहः", "english": "Lion"}, {"category": "Animals", "sanskrit": "गजः", "english": "Elephant"}, {"category": "Animals", "sanskrit": "कुक्कुरः", "english": "Dog"}],
      "Places": [{"category": "Places", "sanskrit": "विद्यालयः", "english": "School"}, {"category": "Places", "sanskrit": "गृहः", "english": "Home"}, {"category": "Places", "sanskrit": "वनम्", "english": "Forest"}],
      "Colors": [{"category": "Colors", "sanskrit": "नीलः", "english": "Blue"}, {"category": "Colors", "sanskrit": "लोहितः", "english": "Red"}, {"category": "Colors", "sanskrit": "हरितः", "english": "Green"}],
      "Vehicles": [{"category": "Vehicles", "sanskrit": "यानम्", "english": "Vehicle"}, {"category": "Vehicles", "sanskrit": "रथः", "english": "Chariot"}, {"category": "Vehicles", "sanskrit": "विमानम्", "english": "Aeroplane"}],
      "Clothing": [{"category": "Clothing", "sanskrit": "शर्टः", "english": "Shirt"}, {"category": "Clothing", "sanskrit": "पादत्राणम्", "english": "Shoes"}, {"category": "Clothing", "sanskrit": "वस्त्राणि", "english": "Clothes"}]
    },
    "grammar_challenge": [{"correct": ["रामः", "पुस्तकम्", "पठति"]}, {"correct": ["सीता", "फलम्", "खादति"]}, {"correct": ["बालकः", "क्रीडति"]}],
    "complete_sentence": [{"id": 1, "sentence": ["रामः", "___", "पठति"], "correct": "पुस्तकम्", "options": ["पुस्तकम्", "गजः", "वनम्"]}, {"id": 2, "sentence": ["सीता", "___", "खादति"], "correct": "फलम्", "options": ["फलम्", "गृहम्", "पुस्तकम्"]}, {"id": 3, "sentence": ["बालकः", "___", "धावति"], "correct": "वनम्", "options": ["वनम्", "गजः", "पुस्तकम्"]}]
  },
  "LEVEL_2": {
    "word_matching": {
      "Fruits": [{"category": "Fruits", "sanskrit": "दाडिमम्", "english": "Pomegranate"}, {"category": "Fruits", "sanskrit": "नारङ्गम्", "english": "Orange"}, {"category": "Fruits", "sanskrit": "द्राक्षफलम्", "english": "Grapes"}],
      "Vegetables": [{"category": "Vegetables", "sanskrit": "बीजपूरकः", "english": "Cucumber"}, {"category": "Vegetables", "sanskrit": "लशुनम्", "english": "Garlic"}, {"category": "Vegetables", "sanskrit": "पलाण्डुः", "english": "Onion"}],
      "Animals": [{"category": "Animals", "sanskrit": "मार्जारः", "english": "Cat"}, {"category": "Animals", "sanskrit": "अश्वः", "english": "Horse"}, {"category": "Animals", "sanskrit": "वृषभः", "english": "Bull"}],
      "Places": [{"category": "Places", "sanskrit": "नगरम्", "english": "City"}, {"category": "Places", "sanskrit": "दुकानम्", "english": "Shop"}, {"category": "Places", "sanskrit": "अस्पतालयः", "english": "Hospital"}],
      "Colors": [{"category": "Colors", "sanskrit": "श्वेतः", "english": "White"}, {"category": "Colors", "sanskrit": "कृष्णः", "english": "Black"}, {"category": "Colors", "sanskrit": "पीतः", "english": "Yellow"}],
      "Vehicles": [{"category": "Vehicles", "sanskrit": "द्वิचक्रिकायानम्", "english": "Bicycle"}, {"category": "Vehicles", "sanskrit": "मोटरयानम्", "english": "Car"}, {"category": "Vehicles", "sanskrit": "नौका", "english": "Boat"}],
      "Clothing": [{"category": "Clothing", "sanskrit": "पेट्टिकः", "english": "Skirt"}, {"category": "Clothing", "sanskrit": "टोपी", "english": "Cap"}, {"category": "Clothing", "sanskrit": "चश्मकः", "english": "Glasses"}]
    },
    "grammar_challenge": [{"correct": ["गुरुः", "विद्यालयम्", "गच्छति"]}, {"correct": ["बालिका", "क्रीडाङ्गणम्", "धावति"]}, {"correct": ["गजः", "वनम्", "गच्छति"]}],
    "complete_sentence": [{"id": 1, "sentence": ["गुरुः", "___", "गच्छति"], "correct": "विद्यालयम्", "options": ["विद्यालयम्", "गजः", "बालकः"]}, {"id": 2, "sentence": ["बालिका", "___", "धावति"], "correct": "क्रीडाङ्गणम्", "options": ["क्रीडाङ्गणम्", "फलम्", "पुストकालयः"]}, {"id": 3, "sentence": ["गजः", "___", "पिबति"], "correct": "जलम्", "options": ["जलम्", "फलम्", "गृहम्"]}]
  },
  "LEVEL_3": {
    "word_matching": {
      "Fruits": [{"category": "Fruits", "sanskrit": "कर्पूरफलम्", "english": "Papaya"}, {"category": "Fruits", "sanskrit": "जम्बीरम्", "english": "Lemon"}, {"category": "Fruits", "sanskrit": "नारिकेलः", "english": "Coconut"}],
      "Vegetables": [{"category": "Vegetables", "sanskrit": "कट्टाहिपालकः", "english": "Spinach"}, {"category": "Vegetables", "sanskrit": "शिम्बीफलम्", "english": "Beans"}, {"category": "Vegetables", "sanskrit": "मूली", "english": "Radish"}],
      "Animals": [{"category": "Animals", "sanskrit": "वृकः", "english": "Wolf"}, {"category": "Animals", "sanskrit": "मुषकः", "english": "Mouse"}, {"category": "Animals", "sanskrit": "मकरः", "english": "Crocodile"}],
      "Places": [{"category": "Places", "sanskrit": "द्वारः", "english": "Gate"}, {"category": "Places", "sanskrit": "मार्गः", "english": "Road"}, {"category": "Places", "sanskrit": "पर्वतः", "english": "Mountain"}],
      "Colors": [{"category": "Colors", "sanskrit": "धूसरः", "english": "Grey"}, {"category": "Colors", "sanskrit": "कपिलः", "english": "Brown"}, {"category": "Colors", "sanskrit": "रक्तवर्णः", "english": "Maroon"}],
      "Vehicles": [{"category": "Vehicles", "sanskrit": "द्विचक्रिकम्", "english": "Scooter"}, {"category": "Vehicles", "sanskrit": "लोकयानम्", "english": "Bus"}, {"category": "Vehicles", "sanskrit": "रेलयानम्", "english": "Train"}],
      "Clothing": [{"category": "Clothing", "sanskrit": "पायसुः", "english": "Shorts"}, {"category": "Clothing", "sanskrit": "धोती", "english": "Dhoti"}, {"category": "Clothing", "sanskrit": "कुर्तकम्", "english": "Kurta"}]
    },
    "grammar_challenge": [{"correct": ["अहं", "पत्रम्", "लिखामि"]}, {"correct": ["त्वम्", "गृहम्", "गच्छसि"]}, {"correct": ["सः", "पुस्तकम्", "पठति"]}],
    "complete_sentence": [{"id": 1, "sentence": ["अहं", "___", "लिखामि"], "correct": "पत्रम्", "options": ["पत्रम्", "गजः", "वनम्"]}, {"id": 2, "sentence": ["त्वम्", "___", "गच्छसि"], "correct": "गृहम्", "options": ["गृहम्", "फलम्", "पुस्तकम्"]}, {"id": 3, "sentence": ["सः", "___", "पठति"], "correct": "पुस्तकम्", "options": ["पुस्तकम्", "गजः", "वनम्"]}]
  }
}

Generate similar structure with 5 items per category instead of 3. Increase difficulty of words with EACH LEVEL.`;

        const result = await generateAIQuestions(prompt);
        if (result && result.LEVEL_1) {
          const cleanedResult = cleanSanskritData(result);
          setAiData({ ...cleanedResult, loading: false, error: null });
        } else {
          setAiData(prev => ({ ...prev, error: "Invalid response", loading: false }));
        }
      } catch (error) {
        setAiData(prev => ({ ...prev, error: error.message, loading: false }));
      }
    };
    generateAllQuestions();
  }, []);

  //QUESTION RETRIEVAL LOGIC 
  /**
   * Gets the current question based on challenge type, level, and category
   */
const getCurrentQuestion = () => {
  let challengeKey;
  if (challengeType === "Word Matching") {
    challengeKey = "word_matching";
  } else if (challengeType === "Grammar Challenge") {
    challengeKey = "grammar_challenge";
  } else if (challengeType === "Complete the Sentence") {
    challengeKey = "complete_sentence";
  }

  let levelData;
  if (challengeType === "Word Matching") {
    levelData = aiData[currentLevel]?.word_matching?.[category];
  } else {
    levelData = aiData[currentLevel]?.[challengeKey];
  }

  if (levelData && levelData.length > 0) {
    // Generate a unique key for this category/level/challenge
    const shuffleKey = `${currentLevel}-${challengeKey}-${category}`;

    // shuffle set if not shuggfled
    if (!shuffledQuestionsRef.current[shuffleKey]) {
      shuffledQuestionsRef.current[shuffleKey] = shuffleArray([...levelData]);
    }

    // Get the question from the shuffled array
    return shuffledQuestionsRef.current[shuffleKey][currentIndex % levelData.length];
  }

  // Fallback
  switch(challengeType) {
    case "Word Matching":
      const filteredData = levelData.filter(item => item.category === category);
      return filteredData[currentIndex % filteredData.length];
    case "Grammar Challenge":
      return grammarData[currentIndex % grammarData.length];
    case "Complete the Sentence":
      return completionData[currentIndex % completionData.length];
    default:
      return null;
  }
};

  /**
   * Handles user's answer submission
   * - Updates score counters and progress points
   * - Decreases progress on incorrect answers (1st: -1, 2nd: -3, 3rd: -5)
   * - Shows reaction animation
   * - Advances to next question after delay
   */
const handleNext = (isCorrect) => {
  if (isCorrect) {
    setCorrectCount(prev => prev + 1);
    setReaction("correct");
    const pointsToAdd = currentLevel === "LEVEL_1" ? 1 : currentLevel === "LEVEL_2" ? 3 : 5;
    setProgressPoints(prev => Math.min(prev + pointsToAdd, maxProgress));
    setIsHurt(false);
  } else {
    setWrongCount(prev => prev + 1);
    setReaction("wrong");
    let deduction = 0;
    if (wrongCount === 0) deduction = 1;
    else if (wrongCount === 1) deduction = 3;
    else deduction = 5;
    
    //Only end game if progress drops below 0%
    const newProgress = progressPoints - deduction;
    if (newProgress < 0) {
      setProgressPoints(0);
      setCorrectCount(0);
      setWrongCount(0);
      setCurrentIndex(0);
      // game over message
      setTimeout(() => {
        alert("Progress reached 0%! Starting over.");
        setIsHurt(false);
      }, 1500);
    } else {
      setProgressPoints(newProgress);
    }
    setIsHurt(true);
    setTimeout(() => setIsHurt(false), 1500);
  }
  setTimeout(() => {
    setReaction(null);
    setCurrentIndex(prev => prev + 1);
  }, 1500);
};

  /**
   * Handle category selection change
   */
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentIndex(0);
  };

  /**
   * Handle difficulty level change
   */
  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    setCurrentIndex(0);
  };

  /**
   * Handle challenge type change
   */
  const handleChallengeTypeChange = (type) => {
    setChallengeType(type);
    setCurrentIndex(0);
  };

  //  RENDER LOGIC 
  // Get static filtered data for fallback
  const filteredData = levelData.filter(item => item.category === category);
  // Get current question to display
  const currentQuestion = getCurrentQuestion();

  return (
    <div className="app-container">
      {/* Loading overlay while generating questions */}
{aiData.loading && (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <p>Preparing your learning environment...</p>
  </div>
)}  
      
      {/* Error banner if API fails */}
      {aiData.error && (
        <div className="error-banner">
          System Note: {aiData.error} - Using fallback content
        </div>
      )}
      
      {/* App header with title and score */}
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

      {/* Progress bar with sprite animation */}
      <ProgressBar
        progressPoints={progressPoints}
        maxProgress={maxProgress}
        gemMilestones={gemMilestones}
        isHurt={isHurt}
      />

      {/* Challenge selectors */}
      <div className="level-selector" style={{ marginTop: "80px" }}>
        {["LEVEL_1", "LEVEL_2", "LEVEL_3"].map(level => (
          <button
            key={level}
            className={`level-btn ${currentLevel === level ? 'active' : ''}`}
            onClick={() => handleLevelChange(level)}
          >
            {level === "LEVEL_1" ? "Beginner" : level === "LEVEL_2" ? "Intermediate" : "Advanced"}
          </button>
        ))}
      </div>
      
      <div className="selectors">
        <select
          className="challenge-dropdown"
          value={challengeType}
          onChange={(e) => handleChallengeTypeChange(e.target.value)}
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
      
      {/* Reaction animations */}
      {reaction === "correct" && <div className="emoji reaction-right">😊</div>}
      {reaction === "wrong" && <div className="emoji reaction-left">😢</div>}
      
      {/* Challenge components */}
      {challengeType === "Word Matching" && currentQuestion && (
        <WordCard
          word={currentQuestion}
          onNext={handleNext}
          allWords={aiData[currentLevel]?.word_matching?.[category] || filteredData}
        />
      )}
      
      {challengeType === "Grammar Challenge" && currentQuestion && (
        <GrammarChallenge
          sentenceData={currentQuestion}
          onNext={handleNext}
        />
      )}
      
      {challengeType === "Complete the Sentence" && currentQuestion && (
        <CompleteSentence
          data={currentQuestion}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

export default App;
