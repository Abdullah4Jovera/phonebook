import React, { useState, useEffect } from 'react';
import HomeNavbar from '../Components/navbar/Navbar';
import axios from 'axios';
import Select from 'react-select';
import { Table, Modal, Button, Container, Form } from 'react-bootstrap';
import { GrView } from 'react-icons/gr';

const CEOphoneBook = () => {
  const [ceoPhoneBookData, setCeoPhoneBookData] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewCommentModal, setShowViewCommentModal] = useState(false);
  const [commentsToView, setCommentsToView] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('phoneUserData'))?.token;
        if (!token) {
          throw new Error('Token not found');
        }

        const [pipelinesResponse, usersResponse, phoneBookResponse] = await Promise.all([
          axios.get(`/api/pipelines/get-pipelines`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          axios.get(`/api/users/get-users`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          axios.get(`/api/phonebook/get-all-phonebook`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        setPipelines(pipelinesResponse.data.map(pipeline => ({
          value: pipeline._id,
          label: pipeline.name,
        })));

        setUsers(usersResponse.data.map(user => ({
          value: user._id,
          label: user.name,
          pipeline: user.pipeline?._id,
        })));

        const sortedData = phoneBookResponse.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setCeoPhoneBookData(sortedData);
        setFilteredData(sortedData);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      const pipelineUsers = users.filter(user => user.pipeline === selectedPipeline.value);
      setFilteredUsers(pipelineUsers);
    } else {
      setFilteredUsers(users);
    }
  }, [selectedPipeline, users]);

  useEffect(() => {
    let filtered = ceoPhoneBookData;

    if (selectedPipeline) {
      filtered = filtered.filter(entry => entry.pipeline._id === selectedPipeline.value);
    }

    if (selectedUser) {
      filtered = filtered.filter(entry => entry.user && entry.user._id === selectedUser.value);
    }

    if (searchQuery) {
      filtered = filtered.filter(entry => entry.number.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredData(filtered);
  }, [selectedPipeline, selectedUser, searchQuery, ceoPhoneBookData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleViewCommentsClick = (entry) => {
    handleViewComments(entry.comments);
  };

  const handleViewComments = (comments) => {
    setCommentsToView(comments);
    setShowViewCommentModal(true);
  };

  return (
    <>
      <HomeNavbar />
      <Container fluid>
        <h3>CEO Dashboard</h3>

        {/* Filter by pipeline */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '10px' }}>
          <div className="filter-container w-100">
            <label htmlFor="pipeline-filter">Filter by Pipeline:</label>
            <Select
              id="pipeline-filter"
              value={selectedPipeline}
              onChange={setSelectedPipeline}
              options={[{ value: '', label: 'All Pipelines' }, ...pipelines]}
              isClearable
            />
          </div>

          {/* Filter by user */}
          <div className="filter-container w-100">
            <label htmlFor="user-filter">Filter by User:</label>
            <Select
              id="user-filter"
              value={selectedUser}
              onChange={setSelectedUser}
              options={[{ value: '', label: 'All Users' }, ...filteredUsers]}
              isClearable
            />
          </div>

          {/* Search by Number */}
          <Form.Group controlId="searchBarNumber" className='w-100'>
            <label htmlFor="search-query">Search by Number:</label>
            <Form.Control
              type="text"
              placeholder="Search by Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
        </div>

        <Table striped bordered hover responsive className='mt-3'>
          <thead>
            <tr>
              <th className="equal-width">Number</th>
              <th className="equal-width">Status</th>
              <th className="equal-width">Call Status</th>
              <th className="equal-width">Pipeline</th>
              <th className="equal-width">User</th>
              <th className="equal-width">View Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((entry, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{entry.number}</td>
                  <td style={{ textAlign: 'center' }}>{entry.status}</td>
                  <td style={{ textAlign: 'center' }}>{entry.calstatus}</td>
                  <td style={{ textAlign: 'center' }}>{entry.pipeline.name}</td>
                  <td style={{ textAlign: 'center' }}>{entry.user?.name || 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <GrView
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => handleViewCommentsClick(entry)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No data available</td>
              </tr>
            )}
          </tbody>
        </Table>

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
              <p>No Comments Available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewCommentModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default CEOphoneBook;
