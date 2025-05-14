import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminFeedback = (props) => {
  const [feedback, setFeedback] = useState("");
  const courseId = props.courseid;
  const [feedbacks, setFeedbacks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/feedbacks/${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        const firstThreeFeedbacks = data.slice(0, 3);
        setFeedbacks(firstThreeFeedbacks);
      })
      .catch((error) => console.error("Error:", error));
  }, [courseId]);

  const sendFeedback = () => {
    if (feedback.trim() === "") {
      toast.error("Please enter feedback to submit", {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      fetch("http://localhost:8080/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: feedback, course_id: courseId }),
      })
        .then((response) => {
          if (response.ok) {
            setFeedback("");
            toast.success("Feedback submitted!", {
              position: "top-right",
              autoClose: 2000,
            });
            setShowModal(true);
            return fetch(`http://localhost:8080/api/feedbacks/${courseId}`);
          }
        })
        .then((res) => res.json())
        .then((data) => {
          const firstThreeFeedbacks = data.slice(0, 3);
          setFeedbacks(firstThreeFeedbacks);
        })
        .catch((error) => console.error("Error:", error));
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const removeFeedback = (feedbackId, indexToRemove) => {
    fetch(`http://localhost:8080/api/feedbacks/${feedbackId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          toast.success("Feedback deleted!", {
            position: "top-right",
            autoClose: 2000,
          });
          removeFeedbackLocally(indexToRemove);
        } else {
          toast.error("Failed to delete feedback", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error deleting feedback", {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };

  const removeFeedbackLocally = (indexToRemove) => {
    const updatedFeedbacks = feedbacks.filter((_, index) => index !== indexToRemove);
    setFeedbacks(updatedFeedbacks);
  };

  return (
    <div style={styles.feedbackMain}>
      <div style={styles.feedbackContainer}>
        <div style={styles.getInput}>
          <label htmlFor="feedback" style={styles.feedbackLabel}>
            Your Feedback
          </label>
          <textarea
            style={styles.feedbackInput}
            placeholder="Write your feedback here..."
            onChange={(e) => setFeedback(e.target.value)}
            value={feedback}
            rows="4"
          />
          <button onClick={sendFeedback} style={styles.submitBtn}>
            Submit Feedback
          </button>
        </div>

        <div style={styles.feedbackList}>
          <h3>Recent Feedbacks:</h3>
          <ul style={styles.feedbackUl}>
            {feedbacks.length > 0 ? (
              feedbacks.map((item, index) => (
                <li key={item.id} style={styles.feedbackItem}>
                  <p>{item.comment}</p>
                  <button
                    onClick={() => removeFeedback(item.id, index)}
                    style={styles.deleteBtn}
                  >
                    ✕
                  </button>
                </li>
              ))
            ) : (
              <p>No feedback yet. Be the first to share your thoughts!</p>
            )}
          </ul>
        </div>
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Thank you for your feedback!</h2>
            <p>Your feedback has been submitted successfully.</p>
            <button onClick={closeModal} style={styles.closeModalBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  feedbackMain: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px",
    minHeight: "100vh",
    backgroundColor: "#f4f4f9",
  },
  feedbackContainer: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  feedbackLabel: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  feedbackInput: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    resize: "vertical",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "20px",
    backgroundColor: "darkviolet",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
  },
  feedbackList: {
    marginTop: "30px",
  },
  feedbackUl: {
    listStyleType: "none",
    padding: "0",
  },
  feedbackItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "10px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    maxWidth: "400px",
  },
  closeModalBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "darkviolet",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AdminFeedback;
