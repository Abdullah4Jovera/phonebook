import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'
import { CgProfile } from "react-icons/cg";
import joveraLogo from '../../Assets/JoveraLogoweb.png'
import '../../pages/style.css'
function HomeNavbar() {
    const navigate = useNavigate()

    const logoutHandler = () => {
        localStorage.removeItem('phoneUserData')
        navigate('/')
    }

    const joveraimagelogo = ()=>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <Navbar className="bg-body-tertiary sticky-top">
            <Container>
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }} >
                    <img src={joveraLogo} alt="joveraLogo" className='joveraLogo_image' onClick={joveraimagelogo} />
                    <h3>Phone Book Dashboard</h3>
                </div>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">

                    <div className='all_navbar_btn' >
                        <Button variant="outline-danger" onClick={logoutHandler} >Logout</Button>
                        <Button variant="outline-danger" onClick={() => navigate('/blocklist')} >BlockList Number</Button>
                        <CgProfile style={{ fontSize: '30px', cursor: 'pointer' }} onClick={() => navigate('/profile')} />
                    </div>

                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default HomeNavbar;