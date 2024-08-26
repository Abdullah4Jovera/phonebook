import React, { useState } from 'react';
import HomeNavbar from '../Components/navbar/Navbar';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import JoveraLogoweb from '../Assets/JoveraLogoweb.png';
import './style.css';

const Profile = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Check if the password fields are empty
        if (!password || !confirmPassword) {
            setError('Password and confirm password cannot be empty');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('phoneUserData'))?.token;
            console.log(token, 'alltoken');

            if (!token) {
                setError('Token not found');
                return;
            }

            await axios.put(`/api/users/reset-password`, { password }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess('Password reset successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('An error occurred while resetting the password');
        }
    };

    return (
        <div>
            <HomeNavbar />

            <div className='resetPassword_container'>
                <div className='resetPassword'>
                    <Card>
                    <div className='joveralogo_image_container'>
                        <img src={JoveraLogoweb} alt="JoveraLogoweb" className='joveralogo_image' />
                    </div>
                        <h3 className="text-center">Reset Password</h3>
                        <Card.Body className="d-flex flex-column">
                            <div className="flex-grow-1">
                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter Password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className='mt-2'>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                        />
                                    </Form.Group>

                                    <Button type="submit" className='w-100 mt-4 gradient_button'>
                                        Reset Password
                                    </Button>
                                </Form>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
