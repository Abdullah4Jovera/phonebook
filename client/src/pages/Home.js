import React, { useEffect, useState } from 'react';
import HomeNavbar from '../Components/navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Button, Form, Dropdown } from 'react-bootstrap';
import { MdAdd } from 'react-icons/md';
import axios from 'axios';
import { GrView } from 'react-icons/gr';
import { CiEdit } from 'react-icons/ci';
import './style.css';

const Home = () => {
    const navigate = useNavigate();
    const [phonebookData, setPhonebookData] = useState([]);
    const [filteredPhonebookData, setFilteredPhonebookData] = useState([]);
    const [showAddCommentModal, setShowAddCommentModal] = useState(false);
    const [showViewCommentModal, setShowViewCommentModal] = useState(false);
    const [currentComment, setCurrentComment] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [commentsToView, setCommentsToView] = useState([]);
    const [dropdownEntry, setDropdownEntry] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('phoneUserData');
        if (!userData) {
            navigate('/');
        }
    }, [navigate]);

    const getPhoneNumber = async () => {
        const userData = JSON.parse(localStorage.getItem('phoneUserData'));

        if (userData && userData.token) {
            try {
                const response = await fetch(`/api/phonebook/get-all-phonebook-users`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Sort data by updatedAt in descending order
                    const sortedData = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                    setPhonebookData(sortedData);
                    setFilteredPhonebookData(sortedData); // Initialize filtered data
                } else {
                    console.error('Failed to fetch phonebook data:', response.status);
                }
            } catch (error) {
                console.error('Error fetching phonebook data:', error);
            }
        } else {
            navigate('/');
        }
    };

    useEffect(() => {
        getPhoneNumber();
    }, []);

    useEffect(() => {
        // Filter phonebook data based on search query
        if (searchQuery) {
            setFilteredPhonebookData(phonebookData.filter(entry =>
                entry.number.includes(searchQuery) || entry.status.includes(searchQuery)
            ));
        } else {
            setFilteredPhonebookData(phonebookData);
        }
    }, [searchQuery, phonebookData]);

    const handleAddCommentClick = (entry) => {
        setSelectedEntry(entry);
        setCurrentComment(entry.comment || '');
        setShowAddCommentModal(true);
    };

    const handleViewCommentsClick = (entry) => {
        setSelectedEntry(entry);
        setCommentsToView(entry.comments || []);
        setShowViewCommentModal(true);
    };

    const handleSaveComment = async () => {
        if (selectedEntry) {
            try {
                const userData = JSON.parse(localStorage.getItem('phoneUserData'));
                if (userData && userData.token) {
                    await axios.post(
                        `/api/phonebook/add-comment`,
                        {
                            phonebookId: selectedEntry._id,
                            comment: currentComment
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${userData.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    const updatedData = phonebookData.map((entry) =>
                        entry._id === selectedEntry._id ? { ...entry, comments: [...(entry.comments || []), { remarks: currentComment }] } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setPhonebookData(sortedUpdatedData);
                    setFilteredPhonebookData(sortedUpdatedData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }
        setShowAddCommentModal(false);
    };

    const handleCallStatusChange = async (status) => {
        if (dropdownEntry) {
            try {
                const userData = JSON.parse(localStorage.getItem('phoneUserData'));
                if (userData && userData.token) {
                    await axios.put(
                        `/api/phonebook/update-calstatus/${dropdownEntry._id}`,
                        {
                            calstatus: status
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${userData.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    const updatedData = phonebookData.map((entry) =>
                        entry._id === dropdownEntry._id ? { ...entry, calstatus: status } : entry
                    );
                    // Re-sort updated data by updatedAt
                    const sortedUpdatedData = updatedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setPhonebookData(sortedUpdatedData);
                    setFilteredPhonebookData(sortedUpdatedData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error updating call status:', error);
            }
        }
        setDropdownEntry(null); // Hide dropdown after selecting status
    };

    return (
        <div>
            <HomeNavbar />
            <div className="phonebook-container ">

                <div className='search_bar_container' >
                    <Form.Group controlId="searchBar" className='searchBar_container'>
                        <Form.Control
                            type="text"
                            placeholder="Search by Number"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Form.Group>
                </div>

                {filteredPhonebookData.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th className="equal-width">Number</th>
                                <th className="equal-width">Status</th>
                                <th className="equal-width">Call Status</th>
                                <th className="equal-width">Edit Status</th>
                                <th className="equal-width">Add Comments</th>
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
                                        {dropdownEntry && dropdownEntry._id === entry._id ? (
                                            <Dropdown>
                                                <Dropdown.Toggle className='dropdown_menu' id="dropdown-basic">
                                                    {entry.calstatus || 'Select Status'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleCallStatusChange('Req to call')}>Req to call</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleCallStatusChange('Interested')}>Interested</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleCallStatusChange('Rejected')}>Rejected</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleCallStatusChange('Convert to Lead')}>Convert to Lead</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        ) : (
                                            <CiEdit onClick={() => setDropdownEntry(entry)} style={{ fontSize: '20px', cursor: 'pointer' }} />
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <MdAdd
                                            style={{ fontSize: '24px', cursor: 'pointer' }}
                                            onClick={() => handleAddCommentClick(entry)}
                                        />
                                    </td>
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
                    <p>No phonebook data available.</p>
                )}
            </div>

            {/* Add Comment Modal */}
            <Modal show={showAddCommentModal} onHide={() => setShowAddCommentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formComment">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentComment}
                                onChange={(e) => setCurrentComment(e.target.value)}
                                placeholder="Enter comment"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {/* <Button variant="secondary" onClick={() => setShowAddCommentModal(false)}>Close</Button> */}
                    <Button variant="secondary" onClick={handleSaveComment}>Post Comment</Button>
                </Modal.Footer>
            </Modal>

            {/* View Comments Modal */}
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
                    <Button variant="secondary" onClick={() => setShowViewCommentModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Home;
