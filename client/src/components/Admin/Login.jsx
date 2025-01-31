import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import '../../styles/Login.css';
import Logo from "../../Assets/SDO_Logo.png";

const Login = () => {
    const formRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [remainingAttempts, setRemainingAttempts] = useState(3);
    const [showModal, setShowModal] = useState(false);
    const [retryAfter, setRetryAfter] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (retryAfter !== null) {
            setCountdown(retryAfter);
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev > 1) return prev - 1;
                    clearInterval(timer);
                    setRetryAfter(null);
                    setRemainingAttempts(3);
                    return 0;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [retryAfter]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const username = formRef.current.username.value;
        const password = formRef.current.password.value;

        try {
            const response = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);

                const decodedUser = jwtDecode(data.token);
                localStorage.setItem("user", JSON.stringify(decodedUser));

                navigate("/ticketdashboard");
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message);

                if (errorData.retryAfter) {
                    setRetryAfter(errorData.retryAfter);
                }

                if (errorData.remainingAttempts !== undefined) {
                    setRemainingAttempts(errorData.remainingAttempts);
                }

                setShowModal(true);
            }
        } catch (error) {
            console.error("Login error:", error);
            setShowModal(true);
        }
    };

    return (
        <Container className="login-container">
            <Card className="login-card">
                <Card.Body>
                    <div className="logo-container">
                        <img alt="Logo" src={Logo} className="Logo-login mx-auto" />
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
                            {remainingAttempts !== null && remainingAttempts > 0 && retryAfter === null && (
                                <p>You have {remainingAttempts} attempt(s) left.</p>
                            )}
                            {retryAfter !== null && countdown > 0 && (
                                <p>You can try again in <strong>{countdown}</strong> seconds.</p>
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
