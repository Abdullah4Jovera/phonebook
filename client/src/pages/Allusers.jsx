import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Dropdown, Menu, Modal, Button, Spin, Input, Form, message } from 'antd';
import { BsThreeDotsVertical } from "react-icons/bs";
import Select from 'react-select';

const Allusers = () => {
    const [users, setUsers] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [userToDelete, setUserToDelete] = useState(null);

    const authtoken = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, pipelineResponse, branchResponse] = await Promise.all([
                    axios.get(`/api/users/get-users`, {
                        headers: { Authorization: `Bearer ${authtoken}` },
                    }),
                    axios.get(`/api/pipelines/get-pipelines`, {
                        headers: { Authorization: `Bearer ${authtoken}` },
                    }),
                    axios.get(`/api/branches/get-branches`, {
                        headers: { Authorization: `Bearer ${authtoken}` },
                    }),
                ]);

                setUsers(userResponse.data);
                setPipelines(pipelineResponse.data);
                setBranches(branchResponse.data);
            } catch (error) {
                console.log(error, 'Error fetching data');
            }
        };
        fetchData();
    }, [authtoken]);

    const handleMenuClick = (e, user) => {
        if (e.key === "1") {
            setSelectedUser({
                ...user,
                pipeline: user.pipeline ? { value: user.pipeline._id, label: user.pipeline.name } : null,
                branch: user.branch ? { value: user.branch._id, label: user.branch.name } : null,
            });
            setIsModalVisible(true);
        } else if (e.key === "2") {
            setUserToDelete(user);
            setIsDeleteModalVisible(true);
        } else if (e.key === "3") {
            setSelectedUser(user);
            setIsPasswordModalVisible(true);
        }
    };

    const menu = (user) => (
        <Menu onClick={(e) => handleMenuClick(e, user)}>
            <Menu.Item key="1">Edit</Menu.Item>
            <Menu.Item key="2">Delete</Menu.Item>
            <Menu.Item key="3">Reset Password</Menu.Item>
        </Menu>
    );

    const handleOk = async () => {
        setIsUpdatingUser(selectedUser._id);
        try {
            const response = await axios.put(
                `/api/users/update-user/${selectedUser._id}`,
                {
                    name: selectedUser.name,
                    email: selectedUser.email,
                    role: selectedUser.role,
                    pipeline: selectedUser.pipeline ? selectedUser.pipeline.value : null,
                    branch: selectedUser.branch ? selectedUser.branch.value : null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authtoken}`,
                    },
                }
            );

            if (response.status === 200) {
                message.success('User updated successfully');
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === selectedUser._id
                            ? { ...user, ...response.data }
                            : user
                    )
                );
            }
        } catch (error) {
            console.error('Error updating user:', error);
            message.error('Failed to update user');
        } finally {
            setIsUpdatingUser(null);
            setIsModalVisible(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await axios.put(
                `/api/users/delete-user/${userToDelete._id}`,
                {
                    delstatus: true, // Set delStatus to true to indicate the user is deleted
                },
                {
                    headers: {
                        Authorization: `Bearer ${authtoken}`,
                    },
                }
            );

            if (response.status === 200) {
                message.success('User marked as deleted successfully');
                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user._id !== userToDelete._id)
                );
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Failed to mark user as deleted');
        } finally {
            setIsDeleteModalVisible(false);
            setUserToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalVisible(false);
        setUserToDelete(null);
    };

    const InputChangeHandler = (option, fieldName) => {
        setSelectedUser({
            ...selectedUser,
            [fieldName]: option
        });
    };

    const pipelineOptions = pipelines.map((pipeline) => ({
        value: pipeline._id,
        label: pipeline.name,
    }));

    const branchOptions = branches.map((branch) => ({
        value: branch._id,
        label: branch.name,
    }));

    const handlePasswordReset = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        try {
            const response = await axios.put(
                `/api/users/reset-password/${selectedUser._id}`,
                { password: passwords.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${authtoken}`,
                    },
                }
            );

            if (response.status === 200) {
                message.success('Password reset successfully');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            message.error('Failed to reset password');
        } finally {
            setIsPasswordModalVisible(false);
            setPasswords({ newPassword: '', confirmPassword: '' });
            setSelectedUser(null);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <div className="all-users-container">
                <Row>
                    <Col xs={24} sm={24} md={6} lg={4}>
                        {/* <Sidebar /> */}
                    </Col>
                    <Col xs={24} sm={24} md={18} lg={20}>
                        <div className="cards-container" style={{ marginTop: '5%' }}>
                            {/* {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <Spin size="large" style={{ color: 'black' }} />
                                </div>
                            ) : ( */}
                                <Row>
                                    {users.map((user) => (
                                        <Col
                                            xs={24}
                                            sm={12}
                                            md={12}
                                            lg={12}
                                            xxl={6}
                                            key={user._id}
                                            style={{ marginTop: '1%' }}
                                        >
                                            <Card
                                                hoverable
                                                style={{
                                                    width: '90%',
                                                    height: '100%',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                    pointerEvents: isUpdatingUser === user._id ? 'none' : 'auto',
                                                }}
                                                cover={
                                                    <div className="user_image_container" style={{ position: 'relative' }}>
                                                        {/* <img
                                                            src={user.image ? user.image : 'No Image Found'}
                                                            alt="user_image"
                                                            className="user_image"
                                                            style={{ display: isUpdatingUser === user._id ? 'none' : 'block' }}
                                                        /> */}
                                                        {isUpdatingUser === user._id && (
                                                            <Spin
                                                                size="large"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    zIndex: 1,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                }

                                            >
                                                <Dropdown overlay={menu(user)} trigger={['click']}>
                                                    <BsThreeDotsVertical
                                                        className="icons_class"
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </Dropdown>
                                                <div style={{ textAlign: 'center' }}>
                                                    <h3>{user.name}</h3>
                                                    <p>{user.email}</p>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            {/* )} */}
                        </div>
                    </Col>
                </Row>
            </div>

            {/* User Edit Modal */}
            <Modal
                title="Edit User"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={isUpdatingUser !== null}
            >
                <Form>
                    <Form.Item label="Name">
                        <Input
                            value={selectedUser?.name}
                            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Email">
                        <Input
                            value={selectedUser?.email}
                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Role">
                        <Input
                            value={selectedUser?.role}
                            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Pipeline">
                        <Select
                            value={selectedUser?.pipeline}
                            options={pipelineOptions}
                            onChange={(option) => InputChangeHandler(option, "pipeline")}
                        />
                    </Form.Item>
                    <Form.Item label="Branch">
                        <Select
                            value={selectedUser?.branch}
                            options={branchOptions}
                            onChange={(option) => InputChangeHandler(option, "branch")}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                title="Delete User"
                visible={isDeleteModalVisible}
                onOk={handleDelete}
                onCancel={handleCancelDelete}
                confirmLoading={isUpdatingUser !== null}
            >
                <p>Are you sure you want to delete this user?</p>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                title="Reset Password"
                visible={isPasswordModalVisible}
                onOk={handlePasswordReset}
                onCancel={() => setIsPasswordModalVisible(false)}
            >
                <Form>
                    <Form.Item label="New Password">
                        <Input.Password
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handlePasswordChange}
                        />
                    </Form.Item>
                    <Form.Item label="Confirm Password">
                        <Input.Password
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Allusers;
