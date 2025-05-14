import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Button } from "antd";
import axios from "axios";
import styled from "styled-components";

function YourComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const courseId = location.pathname.split("/")[2];
  const [test, setTest] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem("id"));
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [totalQsns, SetTotalQsns] = useState(0);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
  const [isTimerActive, setIsTimerActive] = useState(false); // To start and stop the timer
  const [startClicked, setStartClicked] = useState(false); // Track if start was clicked

  useEffect(() => {
    fetch(`http://localhost:8080/api/questions/${courseId}`)
      .then((res) => res.json())
      .then((res) => {
        setTest(res);
        SetTotalQsns(res.length);
        setSelectedAnswers(new Array(res.length).fill(false));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [courseId]);

  const handleRadioChange = (questionIndex, selectedOption) => {
    const updatedSelectedAnswers = [...selectedAnswers];
    const qsn = test[questionIndex];
    if (qsn.answer === selectedOption) {
      setCorrectCount(correctCount + 1);
      updatedSelectedAnswers[questionIndex] = true;
    } else if (updatedSelectedAnswers[questionIndex] === true) {
      setCorrectCount(correctCount - 1);
      updatedSelectedAnswers[questionIndex] = false;
    }
    setSelectedAnswers(updatedSelectedAnswers);
  };

  const handleMarks = () => {
    const data = {
      courseId: courseId,
      userId: localStorage.getItem("id"),
      marks: (correctCount / totalQsns) * 100,
    };
    axios
      .post(`http://localhost:8080/api/assessments/add/${userId}/${courseId}`, data)
      .then((response) => {
        console.log("Request successful:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const showModal = () => {
    setOpenModal(true);
  };

  const handleOk = () => {
    setOpenModal(false);
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  let message = "";
  if (correctCount === 5) {
    message = "Awesome 😎";
  } else if (correctCount >= 3) {
    message = "Good 😊";
  } else {
    message = "Poor 😒";
  }

  // Timer Effect - starts countdown when the quiz starts
  useEffect(() => {
    let timer;
    if (isTimerActive) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer); // Stop the timer when it reaches 0
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Update every second
    }
    return () => clearInterval(timer); // Clean up interval on unmount
  }, [isTimerActive]);

  // Start the quiz and timer
  const handleStart = () => {
    setStartClicked(true);
    setTimeLeft(5 * 60); // Set timer to 5 minutes (300 seconds)
    setIsTimerActive(true);
  };

  // Format time to MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <QuizContainer>
      <Header>
        <BackButton onClick={() => navigate(`/course/${courseId}`)}>
          <FontAwesomeIcon icon={faBackward} /> Back
        </BackButton>
        <QuizTitle>Assessment Questions</QuizTitle>
      </Header>

      <TimerSection>
        {!startClicked ? (
          <StartButton onClick={handleStart}>Start Quiz</StartButton>
        ) : (
          <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>
        )}
      </TimerSection>

      <QuizForm>
        {test.map((question, index) => (
          <QuestionCard key={question.no}>
            <h3>{question.question}</h3>
            <Option>
              <input
                type="radio"
                name={`question_${question.no}`}
                value={question.option1}
                onChange={() => handleRadioChange(index, question.option1)}
              />
              {question.option1}
            </Option>
            <Option>
              <input
                type="radio"
                name={`question_${question.no}`}
                value={question.option2}
                onChange={() => handleRadioChange(index, question.option2)}
              />
              {question.option2}
            </Option>
            <Option>
              <input
                type="radio"
                name={`question_${question.no}`}
                value={question.option3}
                onChange={() => handleRadioChange(index, question.option3)}
              />
              {question.option3}
            </Option>
            <Option>
              <input
                type="radio"
                name={`question_${question.no}`}
                value={question.option4}
                onChange={() => handleRadioChange(index, question.option4)}
              />
              {question.option4}
            </Option>
          </QuestionCard>
        ))}

        <ButtonSection>
          <ResetButton onClick={() => navigate(0)}>Reset</ResetButton>
          <SubmitButton
            onClick={() => {
              handleMarks();
              setOpenModal(true);
              setIsTimerActive(false); // Stop the timer when submitting
            }}
          >
            Submit
          </SubmitButton>
        </ButtonSection>
      </QuizForm>

      <Modal
        open={openModal}
        onOk={handleOk}
        onCancel={handleCancel}
        title="Assessment Result"
        centered
        width={400}
        style={{ padding: "20px", textAlign: "center" }}
      >
        <h2>{message}</h2>
        <h3>You scored {(correctCount / totalQsns) * 100}%</h3>
      </Modal>
    </QuizContainer>
  );
}

export default YourComponent;

// Styled Components

const QuizContainer = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #0056b3;
  }
`;

const QuizTitle = styled.h1`
  background-color: #007bff;
  color: white;
  padding: 15px 30px;
  font-size: 1.5rem;
  border-radius: 25px;
  text-align: center;
  margin: 0 auto;
`;

const TimerSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const StartButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #388e3c;
  }
`;

const TimerDisplay = styled.div`
  font-size: 2rem;
  color: #e53935;
  font-weight: bold;
`;

const QuizForm = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const QuestionCard = styled.div`
  background-color: #fff0e6;
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Option = styled.label`
  display: block;
  margin: 10px 0;
  font-size: 1rem;
  input {
    margin-right: 10px;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const ResetButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  width: 48%;
  &:hover {
    background-color: #d32f2f;
  }
`;

const SubmitButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  width: 48%;
  &:hover {
    background-color: #388e3c;
  }
`;
