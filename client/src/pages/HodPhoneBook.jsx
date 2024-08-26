import React, { useState, useEffect } from 'react';
import HomeNavbar from '../Components/navbar/Navbar';
import axios from 'axios';
import { GrView } from 'react-icons/gr';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';

const HodPhoneBook = () => {
    const [hodData, setHodData] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [error, setError] = useState(null);
    const [showViewCommentModal, setShowViewCommentModal] = useState(false);
    const [commentsToView, setCommentsToView] = useState([]);
    const [hasAccess, setHasAccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);

    const allowedRoles = [
        'Business_Banking_HOD',
        'Personal_Loan_HOD',
        'Mortgage_HOD',
        'CEO_Mortgage_HOD',
    ];

    const getHodPhoneBookData = async (token) => {
        try {
            const response = await axios.get(
                `/api/phonebook/get-phonebook-by-pipeline`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const sortedData = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setHodData(sortedData);
            setFilteredPhonebookData(sortedData);

            getAllUsers(token);
        } catch (error) {
            console.log('Error fetching HOD Phone Book data:', error);
            setError('No Phone Book Data Available.');
        }
    };

    const getAllUsers = async (token) => {
        try {
            const response = await axios.get(
                `/api/users/get-users-by-pipeline`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const users = response.data;

            // Map users to options for React-Select
            const userOptions = users.map(user => ({
                value: user._id,
                label: user.name
            }));

            setAllUsers(userOptions);
        } catch (error) {
            console.log('Error fetching all users:', error);
        }
    };

    useEffect(() => {
        const phoneUserData = localStorage.getItem('phoneUserData');

        if (!phoneUserData) {
            setError('No user data found in local storage.');
            return;
        }

        const parsedUserData = JSON.parse(phoneUserData);
        const { token, role } = parsedUserData;

        if (!token) {
            setError('No token found in user data.');
            return;
        }

        if (allowedRoles.includes(role)) {
            setHasAccess(true);
            getHodPhoneBookData(token);
        } else {
            setError('You do not have access to this dashboard.');
        }
    }, []);

    useEffect(() => {
        const results = hodData.filter(entry =>
            entry.number.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (!selectedUser || entry.user._id === selectedUser.value)
        );
        setFilteredPhonebookData(results);
    }, [searchQuery, hodData, selectedUser]);

    const handleViewComments = (comments) => {
        setCommentsToView(comments);
        setShowViewCommentModal(true);
    };

    const handleViewCommentsClick = (entry) => {
        handleViewComments(entry.comments);
    };

    const clearSelectedUser = () => {
        setSelectedUser(null);
    };

    return (
        <>
            <HomeNavbar />
            <div className="phonebook-container">
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'flex-end' }}>
                    <Form.Group controlId="searchBarNumber">
                        <Form.Control
                            type="text"
                            placeholder="Search by Number"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="selectUser">
                        <Select
                            options={allUsers}
                            value={selectedUser}
                            onChange={setSelectedUser}
                            placeholder="Select User"
                            isClearable // Enables the 'clear' option (cross) in the select dropdown
                            onMenuClose={clearSelectedUser}
                        />
                    </Form.Group>
                </div>

                <div>
                    {error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : hasAccess ? (
                        filteredPhonebookData.length > 0 ? (
                            <Table striped bordered hover responsive className='mt-3'>
                                <thead>
                                    <tr>
                                        <th className="equal-width">Number</th>
                                        <th className="equal-width">Status</th>
                                        <th className="equal-width">Call Status</th>
                                        <th className="equal-width">View Comments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPhonebookData.map((entry, index) => (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center' }}>{entry.number}</td>
                                            <td style={{ textAlign: 'center' }}>{entry.status}</td>
                                            <td style={{ textAlign: 'center' }}>{entry.calstatus}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <GrView
                                                    style={{ fontSize: '20px', cursor: 'pointer' }}
                                                    onClick={() => handleViewCommentsClick(entry)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p>No data available for this pipeline.</p>
                        )
                    ) : (
                        <p>You do not have access to this dashboard.</p>
                    )}
                </div>

                <Modal show={showViewCommentModal} onHide={() => setShowViewCommentModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>View Comments</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {commentsToView.length > 0 ? (
                            <ul>
                                {commentsToView.map((comment, index) => (
                                    <li key={index}>{comment.remarks}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments available.</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowViewCommentModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default HodPhoneBook;
