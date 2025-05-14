import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const AdminFeedback = ({ courseid = 1 }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [deletedFeedbackIds, setDeletedFeedbackIds] = useState(new Set());
  const [selectedFeedback, setSelectedFeedback] = useState(null); // For view card

  useEffect(() => {
    fetch(`http://localhost:8080/api/feedbacks/${courseid}`)
      .then((res) => res.json())
      .then((data) => {
        const firstThreeFeedbacks = data.slice(0, 3);
        setFeedbacks(firstThreeFeedbacks);
      })
      .catch((error) => console.error("Error fetching feedbacks:", error));
  }, [courseid]);

  const deleteFeedback = (feedbackId) => {
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.filter((item) => item.id !== feedbackId)
    );
    setDeletedFeedbackIds((prevDeleted) => new Set(prevDeleted.add(feedbackId)));

    fetch(`http://localhost:8080/api/feedbacks/${feedbackId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Feedback deleted!", {
            position: "top-right",
            autoClose: 2000,
          });
        } else {
          toast.error("Failed to delete feedback", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      })
      .catch((error) => {
        console.error("Error deleting feedback:", error);
        toast.error("Error deleting feedback", {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };

  const viewFeedback = (feedback) => {
    setSelectedFeedback(feedback); // Show card view
  };

  const closeCard = () => {
    setSelectedFeedback(null);
  };

  return (
    <div style={styles.feedbackMain}>
      <div style={styles.feedbackContainer}>
        <h2 style={styles.title}>📣 Course Feedback</h2>
        <ul style={styles.feedbackUl}>
          {feedbacks.length > 0 ? (
            feedbacks.map((item) =>
              !deletedFeedbackIds.has(item.id) ? (
                <li key={item.id} style={styles.feedbackItem}>
                  <p style={styles.comment}>"{item.comment}"</p>
                  <div style={styles.buttonsContainer}>
                    <button
                      onClick={() => deleteFeedback(item.id)}
                      style={styles.deleteBtn}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => viewFeedback(item)}
                      style={styles.viewBtn}
                    >
                      👁️ View
                    </button>
                  </div>
                </li>
              ) : null
            )
          ) : (
            <p style={styles.noFeedback}>No feedback yet.</p>
          )}
        </ul>
      </div>

      {/* Card View Modal */}
      {selectedFeedback && (
        <div style={styles.overlay}>
          <div style={styles.card}>
            <button style={styles.cardCloseBtn} onClick={closeCard}>
              ✖
            </button>
            <h3 style={styles.cardTitle}>Feedback Details</h3>
            <p style={styles.cardContent}>{selectedFeedback.comment}</p>
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
    alignItems: "flex-start",
    paddingTop: "60px",
    paddingBottom: "60px",
    background: "linear-gradient(to right, #f0f0f0, #e0e0e0)",
    minHeight: "100vh",
  },
  feedbackContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    padding: "30px",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: "25px",
  },
  feedbackUl: {
    listStyleType: "none",
    padding: "0",
    margin: "0",
  },
  feedbackItem: {
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderLeft: "5px solid #8e2de2",
  },
  comment: {
    fontSize: "16px",
    fontStyle: "italic",
    color: "#333",
    margin: 0,
  },
  buttonsContainer: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  deleteBtn: {
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  viewBtn: {
    backgroundColor: "#4a00e0",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  noFeedback: {
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    fontSize: "16px",
  },

  // Card View Styles
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "80%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    position: "relative",
  },
  cardTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    color: "#4a00e0",
  },
  cardContent: {
    fontSize: "16px",
    color: "#333",
    fontStyle: "italic",
  },
  cardCloseBtn: {
    position: "absolute",
    top: "10px",
    right: "15px",
    fontSize: "18px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
};

export default AdminFeedback;
