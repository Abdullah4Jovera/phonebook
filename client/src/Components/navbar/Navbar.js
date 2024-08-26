import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'
import { CgProfile } from "react-icons/cg";
import joveraLogo from '../../Assets/JoveraLogoweb.png'
import '../../pages/style.css'
import './Navbar.css'
function HomeNavbar() {
    const navigate = useNavigate()

    const logoutHandler = () => {
        localStorage.removeItem('phoneUserData')
        navigate('/')
    }

    const joveraimagelogo = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <Navbar className="sticky-top navbar_container ">
            <Container>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                    <img src={joveraLogo} alt="joveraLogo" className='joveraLogo_image' onClick={joveraimagelogo} />
                    <h3 style={{ color: 'white' }} >Phone Book Dashboard</h3>
                </div>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">

                    <div className='all_navbar_btn' >

                        <div style={{display:'flex', gap:'10px'}} >
                            <Button variant="outline-success" style={{color:'white'}} onClick={() => navigate('/')} >Home</Button>
                            <Button variant="outline-success" style={{color:'white'}} onClick={() => navigate('/profile')} >Profile</Button>
                            <Button variant="outline-danger" onClick={() => navigate('/blocklist')} >BlockList Number</Button>
                        </div>

                        <Button variant="outline-danger" onClick={logoutHandler} >Logout</Button>
                    </div>

                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default HomeNavbar;