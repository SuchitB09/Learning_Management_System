import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { faBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'antd';
import axios from 'axios';

function YourComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseId = location.pathname.split("/")[2];
  const [test, setTest] = useState([]);
  const [userId] = useState(localStorage.getItem("id"));
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [totalQsns, setTotalQsns] = useState(0);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    fetch(`http://localhost:8080/api/questions/${courseId}`)
      .then(res => res.json())
      .then(res => {
        setTest(res);
        setTotalQsns(res.length);
        setSelectedAnswers(new Array(res.length).fill(null));
      })
      .catch(error => console.error("Error fetching data:", error));
  }, [courseId]);

  useEffect(() => {
    let timer;
    if (started && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (started && timeLeft === 0) {
      setOpenModal(true);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setStarted(true);
  };

  const handleCheckboxChange = (questionIndex, selectedOption) => {
    if (!started || timeLeft <= 0) return;

    const updatedAnswers = [...selectedAnswers];
    const qsn = test[questionIndex];
    const alreadyCorrect = updatedAnswers[questionIndex] === qsn.answer;

    updatedAnswers[questionIndex] = selectedOption;

    const nowCorrect = selectedOption === qsn.answer;

    if (!alreadyCorrect && nowCorrect) {
      setCorrectCount(prev => prev + 1);
    } else if (alreadyCorrect && !nowCorrect) {
      setCorrectCount(prev => prev - 1);
    }

    setSelectedAnswers(updatedAnswers);
  };

  const handleMarks = () => {
    const data = {
      courseId,
      userId,
      marks: (correctCount / totalQsns) * 100
    };
    axios.post(`http://localhost:8080/api/assessments/add/${userId}/${courseId}`, data)
      .then(response => console.log('Request successful:', response.data))
      .catch(error => console.error('Error:', error));
  };

  const handleSubmit = () => {
    if (window.confirm("Are you sure you want to submit the test?")) {
      handleMarks();
      setOpenModal(true);
    }
  };

  const handleOk = () => setOpenModal(false);
  const handleCancel = () => setOpenModal(false);

  let message = '';
  if (correctCount === 5) {
    message = 'Awesome 😎';
  } else if (correctCount >= 3) {
    message = 'Good 😊';
  } else {
    message = 'Poor 😒';
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate(`/course/${courseId}`)}
        >
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <h1 style={styles.title}>Assessment</h1>
      </div>

      {!started ? (
        <div style={styles.centered}>
          <button style={styles.startButton} onClick={handleStartQuiz}>
            Start Quiz
          </button>
        </div>
      ) : (
        <div style={styles.timer}>
          Time Left: <span style={{ color: 'red' }}>{formatTime(timeLeft)}</span>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {started && test.map((question, index) => (
          <div key={question.no} style={styles.questionCard}>
            <h3>{question.question}</h3>
            {[question.option1, question.option2, question.option3, question.option4].map((option, i) => (
              <label key={i} style={styles.optionLabel}>
                <input
                  type="checkbox"
                  name={`question_${question.no}`}
                  value={option}
                  checked={selectedAnswers[index] === option}
                  onChange={() => handleCheckboxChange(index, option)}
                  disabled={timeLeft <= 0}
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            ))}
          </div>
        ))}

        {started && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => navigate(0)}
              style={{ ...styles.button, backgroundColor: '#999' }}
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              style={styles.button}
              disabled={timeLeft === 0}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      <Modal
        id="poppup"
        open={openModal}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{ padding: "10px" }}
      >
        <div style={styles.resultCard}>
          <h2 style={{ color: 'darkblue' }}>Assessment Result</h2>
          <h1 style={{ textAlign: "center" }}>{message}</h1>
          <h3 style={{ textAlign: 'center' }}>
            You scored {(correctCount / totalQsns * 100).toFixed(2)}%
          </h3>
          <p style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>
            🎉 Thank you for taking the test!
          </p>
        </div>
      </Modal>
    </div>
  );
}

// Inline Styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "auto",
    fontFamily: "'Segoe UI', sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px"
  },
  backButton: {
    background: "none",
    border: "none",
    color: "darkblue",
    fontSize: "24px",
    cursor: "pointer",
    marginRight: "10px"
  },
  title: {
    flexGrow: 1,
    textAlign: "center",
    backgroundColor: "darkblue",
    color: "white",
    padding: "10px 20px",
    borderRadius: "20px"
  },
  centered: {
    textAlign: "center",
    marginTop: "40px"
  },
  startButton: {
    padding: "10px 30px",
    fontSize: "18px",
    backgroundColor: "darkblue",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer"
  },
  timer: {
    textAlign: "center",
    fontSize: "20px",
    marginTop: "10px"
  },
  questionCard: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  optionLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "16px"
  },
  button: {
    backgroundColor: "green",
    color: "white",
    padding: "10px 20px",
    margin: "0 10px",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    cursor: "pointer"
  },
  resultCard: {
    padding: "10px",
    borderRadius: "12px",
    textAlign: "center"
  }
};

export default YourComponent;
