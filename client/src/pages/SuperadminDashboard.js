import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RegisteredNumber from '../Components/registeredNumber/RegisteredNumber'

const SuperadminDashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('phoneUserData')
    const parsedData = userData ? JSON.parse(userData) : {}

    if (parsedData.role !== 'superadmin') {
      navigate('/')
    }
  }, [navigate])

  return (
    <div>
      <RegisteredNumber />
    </div>
  )
}

export default SuperadminDashboard
