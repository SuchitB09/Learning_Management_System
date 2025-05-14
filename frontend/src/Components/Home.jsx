import React, { useState } from "react";
import { useUserContext } from "./UserContext";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import c1 from "./images/c1.jpg";
import c2 from "./images/html.png";
import c3 from "./images/sql.jpg";
import c4 from "./images/python.jpg";
import c5 from "./images/java.png";
import c6 from "./images/css.png";
import "./css/style.css";
import {
  faGraduationCap,
  faAward,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "./header and footer/Footer";

function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleSendMessage = () => {
    if (userInput.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: userInput },
      ]);
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Bot: How can I assist you today?" },
        ]);
      }, 1000);
      setUserInput("");
    }
  };

  return (
    <div>
      <Navbar page={"home"} />

      <section id="home">
        <h2>Unlock Your Potential with E-Learning Academy</h2>
        <p>
          E-Learning Academy empowers you to shape your future through
          world-class online education. Dive into expertly crafted courses
          featuring interactive lessons, real-world projects, and hands-on
          assessments — all designed to help you learn faster, smarter, and on
          your own schedule.
        </p>

        <div className="btn">
          <a className="blue" href="#features">Learn More</a>
          <a className="yellow" href="http://localhost:3000/courses">Visit Courses</a>
        </div>
      </section>

      <section id="features">
        <h1>Awesome Features</h1>
        <p>Chance to enhance yourself</p>
        <div className="fea-base">
          <div className="fea-box">
            <FontAwesomeIcon icon={faGraduationCap} className="i" />
            <h3>Scholarship Facility</h3>
            <p>Originality is the essence of true scholarship.</p>
          </div>
          <div className="fea-box">
            <FontAwesomeIcon icon={faStar} className="i" />
            <h3>Valuable Courses</h3>
            <p>Online education is like a rising tide, it's going to lift all boats.</p>
          </div>
          <div className="fea-box">
            <FontAwesomeIcon icon={faAward} className="i" />
            <h3>Global Certification</h3>
            <p>A certificate without knowledge is like a gun without bullets.</p>
          </div>
        </div>
      </section>

      <section id="course" style={{ marginBottom: "20px" }}>
        <h1>Our Popular Courses</h1>
        <p>10,000+ enrolled</p>
        <div className="course-box">
          {[{ img: c1, title: "JavaScript Beginner Course" }, { img: c2, title: "HTML Complete Course" }, { img: c3, title: "SQL Beginner Course" }, { img: c4, title: "Python Master Course" }, { img: c5, title: "Java Essentials" }, { img: c6, title: "CSS Complete Course" }].map((course, i) => (
            <div className="courses" key={i}>
              <img src={course.img} alt={course.title} />
              <div className="details">
                <p>Updated 12/08/23</p>
                <h6>{course.title}</h6>
                <div className="star">
                  {[...Array(5)].map((_, index) => (
                    <FontAwesomeIcon key={index} icon={faStar} className="i" />
                  ))}
                  <p>(239)</p>
                </div>
              </div>
              <div className="cost">$49.99</div>
            </div>
          ))}
        </div>
      </section>

      {/* 🎯 Updated Contact Section - Clean and Centered */}
      <section id="contact">
        <div className="contact-container">
          <h1>Contact Us</h1>
          <p>We’d love to hear from you. Reach out through any channel below.</p>
          <div className="contact-grid">
            <div className="contact-card">
              <i className="fas fa-phone contact-icon"></i>
              <h3>Phone</h3>
              <p><a href="tel:+917620495464">+91 7620495464</a></p>
            </div>
            <div className="contact-card">
              <i className="fas fa-envelope contact-icon"></i>
              <h3>Email</h3>
              <p><a href="mailto:Sahilchan@gmail.com">Sahilchan@gmail.com</a></p>
            </div>
            <div className="contact-card">
              <i className="fab fa-linkedin contact-icon"></i>
              <h3>LinkedIn</h3>
              <p><a href="https://www.linkedin.com/in/sahilchauhan/" target="_blank" rel="noreferrer">Visit Profile</a></p>
            </div>
          </div>
        </div>

        <style>{`
          #contact {
            background-color: #f9f9f9;
            padding: 60px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
          }

          .contact-container {
            max-width: 1200px;
            width: 100%;
          }

          .contact-container h1 {
            font-size: 36px;
            color: #333;
            margin-bottom: 10px;
          }

          .contact-container p {
            margin-bottom: 40px;
            color: #555;
          }

          .contact-grid {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 30px;
          }

          .contact-card {
            background: white;
            border-radius: 10px;
            padding: 25px 20px;
            width: 280px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
          }

          .contact-card:hover {
            transform: translateY(-6px);
          }

          .contact-icon {
            font-size: 28px;
            color: #6a1b9a;
            margin-bottom: 12px;
          }

          .contact-card h3 {
            font-size: 20px;
            color: #222;
            margin-bottom: 8px;
          }

          .contact-card a {
            color: #6a1b9a;
            text-decoration: none;
            font-weight: 600;
          }

          .contact-card a:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .contact-grid {
              flex-direction: column;
              align-items: center;
            }

            .contact-card {
              width: 90%;
            }
          }
        `}</style>
      </section>

      {/* Chatbot UI */}
      <div className="chatbot-wrapper">
        {isChatOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <h4>Chat with us</h4>
              <button onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="chatbot-body">
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong> {msg.text}
                </p>
              ))}
            </div>
            <div className="chatbot-input">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
        <button className="chatbot-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
          <i className="fas fa-comment-alt"></i>
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
