import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import './RegisteredNumber.css';
import { RxCross2 } from "react-icons/rx";
import HomeNavbar from '../navbar/Navbar';
import { MdOutlineAddCircle } from "react-icons/md";

const RegisteredNumber = () => {
    const [pipelines, setPipelines] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [phonebookData, setPhonebookData] = useState([]);
    const [show, setShow] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Fetch pipelines on component mount
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pipelines/get-pipelines`);
                setPipelines(response.data);
            } catch (error) {
                console.error('Error fetching pipelines:', error);
            }
        };

        fetchPipelines();
    }, []);

    // Fetch users based on selected pipeline
    useEffect(() => {
        const fetchUsers = async () => {
            if (selectedPipeline) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/get-users?pipelineId=${selectedPipeline}`);
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            }
        };

        fetchUsers();
    }, [selectedPipeline]);

    // Handle file input change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPipeline || !selectedUser || !file) {
            setMessage('Please select a pipeline, a user, and upload a CSV file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', selectedUser);
        formData.append('pipelineId', selectedPipeline);

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/phonebook/upload-csv`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setMessage('Error uploading CSV file.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    // Handle dropdown item click
    const handleDropdownItemClick = async (userId) => {
        setSelectedUser(userId);
        setIsDropdownOpen(false);

        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/phonebook/get-phonebook-by-user/${userId}?pipelineId=${selectedPipeline}`);
            setPhonebookData(response.data);
        } catch (error) {
            console.error('Error fetching phonebook data:', error);
            setMessage('Error fetching phonebook data.');
        }
    };

    // Get button position
    const getButtonPosition = () => {
        if (buttonRef.current) {
            const { top, left, width } = buttonRef.current.getBoundingClientRect();
            return { top, left, width };
        }
        return { top: 0, left: 0, width: '100%' };
    };

    const { top, left } = getButtonPosition();

    return (
        <>
            <HomeNavbar />
            <div style={{ marginTop: '2%' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} >
                    <Button variant="outline-success" ref={buttonRef} onClick={handleShow}> <MdOutlineAddCircle style={{ marginTop: '-2px' }} /> Import CSV</Button>
                    {/* <Button variant="outline-success" onClick={toggleDropdown}>
                        Get Phone Number By User
                    </Button> */}
                </div>

                {/* Dropdown */}
                {isDropdownOpen && (
                    <div style={dropdownStyles.overlay}>
                        <div
                            style={{
                                ...dropdownStyles.dropdown,
                                top: top + window.scrollY + 50,
                                left: left + window.scrollX,
                                width: '30%',
                            }}
                            ref={dropdownRef}>
                            <div style={dropdownStyles.header}>
                                <span style={dropdownStyles.title}>Select User</span>
                                <Button variant="link" onClick={() => setIsDropdownOpen(false)} style={dropdownStyles.closeButton}><RxCross2 /></Button>
                            </div>
                            <ul style={dropdownStyles.list}>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <li
                                            key={user._id}
                                            style={dropdownStyles.item}
                                            onClick={() => handleDropdownItemClick(user._id)}
                                        >
                                            {user.name || 'No data available'}
                                        </li>
                                    ))
                                ) : (
                                    <li style={dropdownStyles.item}>No Data Available</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Import CSV</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="pipelineSelect" className='mb-1'>Select Pipeline:</label>
                                <select
                                    id="pipelineSelect"
                                    value={selectedPipeline}
                                    onChange={(e) => setSelectedPipeline(e.target.value)}
                                    className='selectOptionModal'
                                >
                                    <option value="">-- Select Pipeline --</option>
                                    {pipelines.map((pipeline) => (
                                        <option key={pipeline._id} value={pipeline._id}>
                                            {pipeline.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="modalUser" className='mb-1'>Select User:</label>
                                <select
                                    id="modalUser"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className='selectOptionModal'
                                    disabled={!selectedPipeline}
                                >
                                    <option value="">-- Select User --</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="modalFile" className='mt-3'>Upload CSV:</label>
                                <input
                                    type="file"
                                    id="modalFile"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className='inputFileUpload'
                                />
                            </div>
                            <Button variant="secondary" type="submit" disabled={loading} className='w-100 mt-3'>
                                {loading ? 'Uploading...' : 'Upload'}
                            </Button>
                            {message && <p>{message}</p>}
                        </form>
                    </Modal.Body>
                </Modal>

                {/* Display phonebook data */}
                {phonebookData.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Phonebook Data:</h3>
                        <ul>
                            {phonebookData.map((entry, index) => (
                                <div key={index}>
                                    <li>{`Contact Number: ${entry.number} - Status: ${entry.status}`}</li>
                                </div>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

// Dropdown styles
const dropdownStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1001,
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '10px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    title: {
        fontWeight: 'bold',
    },
    closeButton: {
        color: 'black',
        fontSize: '1.2em',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    item: {
        padding: '8px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
    },
};

export default RegisteredNumber;
