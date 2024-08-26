import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import JoveraLogoweb from '../../Assets/JoveraLogoweb.png';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [loginError, setLoginError] = useState(''); // State for API errors
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const userData = localStorage.getItem('phoneUserData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            const role = parsedData.role;

            // Navigate based on user role
            if (role === 'superadmin') {
                navigate('/superadmindashboard');
            } else if (
                role === 'Business_Banking_HOD' ||
                role === 'Personal_Loan_HOD' ||
                role === 'Mortgage_HOD' ||
                role === 'CEO_Mortgage_HOD'
            ) {
                navigate('/hodphonebook');
            } else if (role === 'CEO' || role === 'MD') {
                navigate('/ceophonebook');
            } else {
                navigate('/home');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        let validationErrors = {};

        if (!email) {
            validationErrors.email = "Email is Required";
        }

        if (!password) {
            validationErrors.password = "Password is Required";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true); // Start loading

        try {
            const response = await axios.post(
                `/api/users/login`,
                { email, password }
            );

            if (response.status === 200) {
                console.log("Login successful", response.data);

                // Save response data in localStorage
                localStorage.setItem('phoneUserData', JSON.stringify(response.data));

                const role = response.data.role;

                // Navigate based on user role
                if (role === 'superadmin') {
                    navigate('/superadmindashboard');
                } else if (
                    role === 'Business_Banking_HOD' ||
                    role === 'Personal_Loan_HOD' ||
                    role === 'Mortgage_HOD' ||
                    role === 'CEO_Mortgage_HOD'
                ) {
                    navigate('/hodphonebook');
                } else if (role === 'CEO' || role === 'MD') {
                    navigate('/ceophonebook');
                } else {
                    navigate('/home');
                }
            }
        } catch (error) {
            console.error("Login error", error.response?.data || error.message);
            setLoginError(error.response?.data?.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (e.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (e.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
        }
    };

    return (
        <div className='login_container'>
            <div className='card_main_container'>
                <Card>
                    <div className='joveralogo_image_container'>
                        <img src={JoveraLogoweb} alt="JoveraLogoweb" className='joveralogo_image' />
                    </div>

                    <h3 className="text-center">Member Login</h3>
                    <Card.Body className="d-flex flex-column">
                        <div className="flex-grow-1">
                            <Form onSubmit={handleLogin}>
                                <Form.Group>
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter Email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        isInvalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-danger">{errors.email}</p>}
                                </Form.Group>

                                <Form.Group className='mt-2'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        isInvalid={!!errors.password}
                                    />
                                    {errors.password && <p className="text-danger">{errors.password}</p>}
                                </Form.Group>

                                <Button type="submit" className='w-100 mt-4 gradient_button' disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </Button>
                            </Form>
                        </div>

                        {loginError && <p className="text-danger text-center mt-3">{loginError}</p>}

                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default Login;
