import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Select from 'react-select';

const ImportCSVForm = ({ pipelines, users, onSubmit }) => {
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Filter users when the pipeline is selected
    useEffect(() => {
        if (selectedPipeline) {
            const pipelineUsers = users.filter(user => 
                user.pipelines.some(pipeline => pipeline._id === selectedPipeline.value)
            );
            setFilteredUsers(pipelineUsers);
        } else {
            setFilteredUsers(users);
        }
    }, [selectedPipeline, users]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPipeline || !selectedUser || !file) {
            setMessage('Please select a pipeline, a user, and upload a CSV file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', selectedUser.value);
        formData.append('pipelineId', selectedPipeline.value);

        setLoading(true);
        try {
            await onSubmit(formData);
            setMessage('File uploaded successfully.');
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setMessage('Error uploading CSV file.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="pipelineSelect" className="mb-1">Select Pipeline:</label>
                <Select
                    id="pipelineSelect"
                    options={pipelines}
                    value={selectedPipeline}
                    onChange={setSelectedPipeline}
                    className="selectOptionModal"
                />
            </div>

            <div>
                <label htmlFor="modalUser" className="mb-1">Select User:</label>
                <Select
                    id="modalUser"
                    options={filteredUsers.map(user => ({
                        value: user.value,
                        label: user.label,
                    }))}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    className="selectOptionModal"
                    isDisabled={!selectedPipeline}
                />
            </div>

            <div>
                <label htmlFor="modalFile" className="mt-3">Upload CSV:</label>
                <input
                    type="file"
                    id="modalFile"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="inputFileUpload"
                />
            </div>
            <Button variant="secondary" type="submit" disabled={loading} className="w-100 mt-3">
                {loading ? 'Uploading...' : 'Upload'}
            </Button>
            {message && <p style={{ color: 'red' }}>{message}</p>}
        </form>
    );
};

export default ImportCSVForm;
