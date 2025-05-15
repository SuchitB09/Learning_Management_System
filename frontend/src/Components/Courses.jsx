import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
  });
  const [loading, setLoading] = useState(true); // Loading state
  const [clientSecret, setClientSecret] = useState(""); // State for client_secret
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if payment is being processed

  const userId = localStorage.getItem("id");
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();

  const stripe = useStripe(); // Declare hooks here
  const elements = useElements();

  useEffect(() => {
    setLoading(true); // Start loading while fetching courses

    fetch("http://localhost:8080/api/courses")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false); // Stop loading even if there's an error
      });

    if (userId) {
      fetch(`http://localhost:8080/api/learning/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          const enrolledCourseIds = data.map((item) => item.course_id);
          setEnrolled(enrolledCourseIds);
        })
        .catch((error) => console.error("Error fetching enrolled courses:", error));
    }
  }, [userId]); // Add userId as dependency to fetch enrolled courses when it changes

  const handlePaymentInput = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const enrollCourse = (courseId) => {
    const enrollRequest = {
      userId: userId,
      courseId: courseId,
    };

    axios
      .post("http://localhost:8080/api/learning", enrollRequest)
      .then((response) => {
        if (response.data === "Enrolled successfully") {
          toast.success("Course Enrolled successfully", {
            position: "top-right",
            autoClose: 1000,
          });
          setTimeout(() => {
            navigate(`/course/${courseId}`);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Enrollment error:", error);
        toast.error("Error enrolling in the course");
      });
  };

  const handleBuyNow = (course) => {
    if (!authToken) {
      toast.error("You need to login to continue", {
        position: "top-right",
        autoClose: 1000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setSelectedCourse(course);
      setShowModal(true);
      fetchPaymentIntent(course.course_id); // Call to get payment intent (client_secret)
    }
  };

  // Function to fetch the payment intent from the backend
  const fetchPaymentIntent = (courseId) => {
    axios
      .post(`http://localhost:8080/api/payment-intent`, { courseId })
      .then((response) => {
        if (response.data.clientSecret) {
          setClientSecret(response.data.clientSecret); // Set client_secret from backend
        } else {
          toast.error("Error: Payment intent could not be created.");
        }
      })
      .catch((error) => {
        console.error("Error fetching payment intent:", error);
        toast.error("Error fetching payment details. Please try again.");
      });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true); // Start payment process

    if (!stripe || !elements || !clientSecret) {
      toast.error("Stripe.js has not loaded yet.");
      setIsSubmitting(false); // End payment process if there's an issue
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      toast.error("Card details are missing.");
      setIsSubmitting(false); // End payment process if there's an issue
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: paymentDetails.cardName,
        },
      },
    });

    if (error) {
      toast.error(`Payment failed: ${error.message}`);
      setIsSubmitting(false); // End payment process on failure
    } else if (paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      setShowModal(false);
      setShowSuccessModal(true);
      enrollCourse(selectedCourse.course_id);
      setIsSubmitting(false); // End payment process on success
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    enrollCourse(selectedCourse.course_id); // Enroll after showing success
  };

  return (
    <div>
      <Navbar page={"courses"} />
      <div
        className="courses-container"
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {loading ? (
          <div>Loading...</div> // Show loading text if courses are being fetched
        ) : (
          courses.map((course) => (
            <div
              key={course.course_id}
              className="course-card"
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                width: "280px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                minHeight: "380px", // Increased height to fit all the content
              }}
            >
              <img
                src={course.p_link}
                alt={course.course_name}
                className="course-image"
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
              <div className="course-details" style={{ marginTop: "10px" }}>
                <h3 className="course-heading" style={{ margin: "10px 0" }}>
                  {course.courseName.length < 8
                    ? `${course.courseName} Tutorial`
                    : course.courseName}
                </h3>
                <p className="course-description" style={{ color: "grey" }}>
                  Price: Rs.{course.price}
                </p>
                <p className="course-description">Tutorial by {course.instructor}</p>
              </div>
              {enrolled.includes(course.course_id) ? (
                <button
                  className="enroll-button"
                  style={{
                    marginTop: "10px",
                    backgroundColor: "darkblue",
                    color: "#F4D03F",
                    fontWeight: "bold",
                    border: "none",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "5px",
                  }}
                  onClick={() => navigate("/learnings")}
                >
                  Enrolled
                </button>
              ) : (
                <button
                  className="enroll-button"
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "5px",
                  }}
                  onClick={() => handleBuyNow(course)}
                >
                  Buy Now
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "30px 25px",
              borderRadius: "12px",
              width: "450px",  // Increased width to make the card larger
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Stripe_Logo%2C_revised_2016.svg"
                alt="Stripe"
                style={{ height: "30px", marginRight: "10px" }}
              />
              <h3 style={{ fontSize: "18px", margin: 0 }}>Secure Checkout</h3>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "10px", // Adjusted for more space
                  display: "block",
                }}
              >
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardName"
                placeholder="e.g. John Doe"
                value={paymentDetails.cardName}
                onChange={handlePaymentInput}
                required
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginBottom: "20px", // Adjusted space between fields
                  width: "100%",
                  fontSize: "16px", // Increased font size for better readability
                }}
              />
              {/* Stripe's CardElement will handle the card number, expiry, CVV */}
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                      padding: "15px", // Increased padding for better visual space
                      marginBottom: "20px",
                      border: "1px solid #ccc",
                    },
                  },
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "14px",
                  border: "none",
                  width: "100%",
                  borderRadius: "6px",
                  fontSize: "16px",
                  marginBottom: "20px", // More space for button
                }}
                disabled={isSubmitting || !stripe || !elements || !clientSecret}
              >
                Pay ₹{selectedCourse?.price}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "gray",
                  color: "white",
                  padding: "14px",
                  border: "none",
                  width: "100%",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "30px 25px",
              borderRadius: "12px",
              width: "360px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <h3>Payment Successful!</h3>
            <p>Your payment has been successfully processed.</p>
            <button
              onClick={handleSuccessModalClose}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "12px",
                border: "none",
                width: "100%",
                borderRadius: "6px",
                fontSize: "16px",
              }}
            >
              Continue to Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
