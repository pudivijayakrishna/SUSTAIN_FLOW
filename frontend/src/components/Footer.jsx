import React, { useEffect, useState } from "react";
import {
  MDBFooter,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBCarousel as MDBCarouselElement,
  MDBCarouselItem,
} from "mdb-react-ui-kit";
import feedbackApi from '../services/feedbackApi';

export default function Footer() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch feedbacks...');  // Debug log
        const data = await feedbackApi.getAllFeedbacks();
        console.log('Fetched feedbacks:', data);
        setFeedbacks(data || []);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Render testimonials section only if there are feedbacks
  const renderTestimonials = () => {
    if (loading) {
      return <p className="text-center py-3">Loading testimonials...</p>;
    }

    if (error) {
      return <p className="text-center py-3 text-danger">Error loading testimonials</p>;
    }

    if (!feedbacks || feedbacks.length === 0) {
      return <p className="text-center py-3">No testimonials available</p>;
    }

    return (
      <div className="testimonials-wrapper" style={{ 
        background: 'white', 
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#4CAF50',
            borderRadius: '10px'
          }
        }}>
          {feedbacks.map((feedback, index) => (
            <div
              key={feedback._id || index}
              style={{
                padding: '20px',
                borderBottom: index !== feedbacks.length - 1 ? '1px solid #eee' : 'none',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'relative',
                padding: '0 30px'
              }}>
                <MDBIcon 
                  icon="quote-left" 
                  style={{
                    color: '#4CAF50',
                    opacity: 0.2,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    fontSize: '24px'
                  }}
                />
                <p style={{ 
                  color: '#333',
                  fontSize: '1.1rem',
                  fontStyle: 'italic',
                  lineHeight: '1.6',
                  margin: '0 0 15px 0'
                }}>
                  {feedback.feedback}
                </p>
                <MDBIcon 
                  icon="quote-right" 
                  style={{
                    color: '#4CAF50',
                    opacity: 0.2,
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    fontSize: '24px'
                  }}
                />
              </div>
              <div style={{
                textAlign: 'right',
                marginTop: '10px'
              }}>
                <h6 style={{ 
                  color: '#2e7d32',
                  fontWeight: '600',
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  - {feedback.name}
                </h6>
                <small style={{ 
                  color: '#666',
                  fontSize: '0.8rem'
                }}>
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mt-5"> </div>
      <div className="mt-5"> </div>
      <MDBFooter
        className="text-center text-lg-start text-muted"
        style={{ backgroundColor: "#DFFFFF" }}
      >
        <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
          <div className="me-5 d-none d-lg-block">
            <span>Get connected with us on social networks:</span>
          </div>

          <div>
            <a href="" className="me-4 text-reset">
              <MDBIcon fab icon="youtube" />
            </a>
            <a href="" className="me-4 text-reset">
              <MDBIcon fab icon="instagram" />
            </a>
            <a href="" className="me-4 text-reset">
              <MDBIcon fab icon="linkedin" />
            </a>
            <a href="" className="me-4 text-reset">
              <MDBIcon fab icon="github" />
            </a>
          </div>
        </section>

        <section className="">
          <MDBContainer className="text-center text-md-start mt-5">
            <MDBRow className="mt-3">
              <MDBCol md="3" lg="4" xl="3" className="mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  <MDBIcon icon="gem" className="me-3" />
                  TEAM-10
                </h6>
                <p>
                "There must be a better way to make the things we want, a way that doesn't spoil the sky, or the rain or the land." - Paul McCartney.
                </p>
              </MDBCol>

              {/* Updated Feedback Carousel Section */}
              <MDBCol md="6" lg="6" xl="6" className="mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">
                  <MDBIcon icon="comments" className="me-3" />
                  User Testimonials
                </h6>
                {renderTestimonials()}
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </section>

        <div
          className="text-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
        >
          <a className="text-reset fw-bold" href="https://github.com/pudivijayakrishna?tab=repositories">
            TEAM-10
          </a>
        </div>
      </MDBFooter>
    </>
  );
}
