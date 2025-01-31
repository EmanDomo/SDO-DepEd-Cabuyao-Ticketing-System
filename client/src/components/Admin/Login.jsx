import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import '../../styles/Login.css';

const Login = () => {
    const formRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [remainingAttempts, setRemainingAttempts] = useState(null);
    const [showModal, setShowModal] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();  

        const username = formRef.current.username.value; 
        const password = formRef.current.password.value; 

        try {
            const response = await fetch(`http://localhost:8080/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); 
                navigate('/ticketdashboard');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
                
                if (errorData.remainingAttempts !== undefined) {
                    setRemainingAttempts(errorData.remainingAttempts);
                } else {
                    setRemainingAttempts(null);
                }
                setShowModal(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container className="login-container">
            <Card className="login-card">
                <Card.Body>
                    <div className="logo-container">
                        <img src="/sdo.png" alt="deped Logo" className="logo" />
                        <h2>DepEd Cabuyao</h2>
                    </div>
                    <Form ref={formRef}>
                        <Form.Group controlId="username">
                            <div className="input-group">
                                <span className="input-icon">
                                    <FontAwesomeIcon icon={faUser} />
                                </span>
                                <Form.Control name="username" type="text" placeholder="Username or Email" className="input-field" />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="password">
                            <div className="input-group">
                                <span className="input-icon">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                <Form.Control name="password" type="password" placeholder="Enter password" className="input-field" />
                            </div>
                        </Form.Group>

                        <Button variant="primary" className="login-btn" onClick={handleLogin}>
                            Login
                        </Button>
                    </Form>

                    <p className="forgot-password">
                        Forgot Password? <a href="#">Click here</a>
                    </p>
                </Card.Body>
            </Card>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Login Error</h4>
                        </div>
                        <div className="modal-body">
                            <p>{errorMessage}</p>
                            {remainingAttempts !== null && (
                                <p>You have {remainingAttempts} attempt(s) left.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default Login;
