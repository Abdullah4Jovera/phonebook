import React, { useState, useEffect } from 'react';
import HomeNavbar from '../Components/navbar/Navbar';
import { Table, Form, Container } from 'react-bootstrap'; // Make sure you have react-bootstrap installed
import axios from 'axios'; // Ensure you have axios installed
import { useNavigate } from 'react-router-dom';
import './style.css';

const Blocklist = () => {
    const [blockedNumbers, setBlockedNumbers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNumbers, setFilteredNumbers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('phoneUserData'));
        if (!userData || !userData.token) {
            navigate('/');
        } else {
            // Fetch blocked numbers from the API
            axios.get(`/api/phonebook/get-blocked-numbers`, {
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    setBlockedNumbers(response.data);
                    setFilteredNumbers(response.data); // Initialize filtered numbers
                })
                .catch(error => {
                    console.error('Error fetching blocked numbers:', error);
                });
        }
    }, [navigate]);

    useEffect(() => {
        // Filter numbers based on search query
        if (searchQuery) {
            setFilteredNumbers(blockedNumbers.filter(entry =>
                entry.number.includes(searchQuery) || entry.status.includes(searchQuery)
            ));
        } else {
            setFilteredNumbers(blockedNumbers);
        }
    }, [searchQuery, blockedNumbers]);

    return (
        <div>
            <HomeNavbar />
            <Container>

                <div className="phonebook-container">

                    <div style={{ width: '100%', maxWidth: '1500px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }} >
                        <Form.Group controlId="searchBar" className='w-50'>
                            <Form.Control
                                type="text"
                                placeholder="Search by Number"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Form.Group>
                    </div>

                    {filteredNumbers.length > 0 ? (
                        <div  >
                            <Table striped bordered hover responsive className='mt-4' >
                                <thead className='table_head' >
                                    <tr className='table_head'>
                                        <th className="equal-width">Number</th>
                                        <th className="equal-width">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNumbers.map((entry, index) => (
                                        <tr key={index}>
                                            <td style={{ textAlign: 'center' }}>{entry.number}</td>
                                            <td style={{ textAlign: 'center' }}>{entry.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <p>No Blocked Numbers Available.</p>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default Blocklist;