import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const userId = localStorage.getItem("id");
  const authToken = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));

    if (userId) {
      fetch(`http://localhost:8080/api/learning/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          const enrolledCourseIds = data.map(item => item.course_id);
          setEnrolled(enrolledCourseIds);
        })
        .catch((error) => console.error("Error fetching enrolled courses:", error));
    }
  }, [userId]);

  const handlePaymentInput = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const simulatePayment = (course, callback) => {
    toast.info(`Processing payment of Rs.${course.price} for ${course.courseName}`, {
      position: 'top-center',
      autoClose: 1500
    });

    setTimeout(() => {
      toast.success("Payment Successful!", {
        position: 'top-right',
        autoClose: 1000
      });
      setShowModal(false); // Close the modal after successful payment
      setShowSuccessModal(true); // Show the success modal
      callback();
    }, 2000);
  };

  const enrollCourse = (courseId) => {
    const enrollRequest = {
      userId: userId,
      courseId: courseId
    };

    axios.post('http://localhost:8080/api/learning', enrollRequest)
      .then((response) => {
        if (response.data === "Enrolled successfully") {
          toast.success('Course Enrolled successfully', {
            position: 'top-right',
            autoClose: 1000
          });
          setTimeout(() => {
            navigate(`/course/${courseId}`);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error('Enrollment error:', error);
      });
  };

  const handleBuyNow = (course) => {
    if (!authToken) {
      toast.error('You need to login to continue', {
        position: 'top-right',
        autoClose: 1000
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setSelectedCourse(course);
      setShowModal(true);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentDetails.cardName && paymentDetails.cardNumber && paymentDetails.expiry && paymentDetails.cvv) {
      simulatePayment(selectedCourse, () => enrollCourse(selectedCourse.course_id));
    } else {
      toast.error("Please fill in all payment details");
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    enrollCourse(selectedCourse.course_id); // Enroll after showing success
  };

  return (
    <div>
      <Navbar page={"courses"} />
      <div className="courses-container" style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {courses.map((course) => (
          <div key={course.course_id} className="course-card" style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            width: "280px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)"
          }}>
            <img src={course.p_link} alt={course.course_name} className="course-image" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "6px" }} />
            <div className="course-details" style={{ marginTop: "10px" }}>
              <h3 className="course-heading" style={{ margin: "10px 0" }}>
                {course.courseName.length < 8
                  ? `${course.courseName} Tutorial`
                  : course.courseName}
              </h3>
              <p className="course-description" style={{ color: "grey" }}>Price: Rs.{course.price}</p>
              <p className="course-description">Tutorial by {course.instructor}</p>
            </div>
            {enrolled.includes(course.course_id) ? (
              <button className="enroll-button" style={{
                marginTop: "10px",
                backgroundColor: 'darkblue',
                color: '#F4D03F',
                fontWeight: 'bold',
                border: 'none',
                padding: '10px',
                width: '100%',
                borderRadius: '5px'
              }}
                onClick={() => navigate("/learnings")}>
                Enrolled
              </button>
            ) : (
              <button className="enroll-button" style={{
                marginTop: "10px",
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px',
                width: '100%',
                borderRadius: '5px'
              }} onClick={() => handleBuyNow(course)}>
                Buy Now
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            padding: "30px 25px",
            borderRadius: "12px",
            width: "360px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{ height: "30px", marginRight: "10px" }} />
              <h3 style={{ fontSize: "18px", margin: 0 }}>Secure Checkout</h3>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px", display: "block" }}>Cardholder Name</label>
              <input type="text" name="cardName" placeholder="e.g. John Doe"
                value={paymentDetails.cardName} onChange={handlePaymentInput} required
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginBottom: "15px",
                  width: "100%",
                  fontSize: "14px"
                }} />

              <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px", display: "block" }}>Card Number</label>
              <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber} onChange={handlePaymentInput} required
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginBottom: "15px",
                  width: "100%",
                  fontSize: "14px"
                }} />

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px", display: "block" }}>Expiry</label>
                  <input type="text" name="expiry" placeholder="MM/YY"
                    value={paymentDetails.expiry} onChange={handlePaymentInput} required
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginBottom: "15px",
                      width: "100%",
                      fontSize: "14px"
                    }} />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px", display: "block" }}>CVV</label>
                  <input type="text" name="cvv" placeholder="123"
                    value={paymentDetails.cvv} onChange={handlePaymentInput} required
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginBottom: "15px",
                      width: "100%",
                      fontSize: "14px"
                    }} />
                </div>
              </div>

              <button type="submit" style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "12px",
                border: "none",
                width: "100%",
                borderRadius: "6px",
                fontSize: "16px",
                marginBottom: "15px"
              }}>Pay ₹{selectedCourse?.price}</button>

              <button type="button" onClick={() => setShowModal(false)} style={{
                backgroundColor: "gray",
                color: "white",
                padding: "12px",
                border: "none",
                width: "100%",
                borderRadius: "6px",
                fontSize: "16px"
              }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            padding: "30px 25px",
            borderRadius: "12px",
            width: "360px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            textAlign: "center"
          }}>
            <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Welcome to the Course!</h3>
            <button onClick={handleSuccessModalClose} style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "12px",
              border: "none",
              width: "100%",
              borderRadius: "6px",
              fontSize: "16px"
            }}>Start Learning</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
