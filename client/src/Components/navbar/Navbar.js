import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import joveraLogo from '../../Assets/JoveraLogoweb.png';
import { Link } from 'react-router-dom';
import '../../pages/style.css';
import './Navbar.css';
import { IoMdLogOut } from "react-icons/io";
import { MdOutlineBlock } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { IoHomeOutline } from "react-icons/io5";

function HomeNavbar() {
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem('phoneUserData');
        navigate('/');
    };

    const joveraimagelogo = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            <Navbar className="sticky-top navbar_container">
                <Container fluid>

                    <div style={{ display: 'flex', alignItems: 'center' }} onClick={joveraimagelogo}>
                        <img src={joveraLogo} alt="joveraLogo" className='joveraLogo_image' />
                        <h3 style={{ color: 'white', cursor: 'pointer' }}>PhoneBook Management</h3>
                    </div>

                    <Nav className="m-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link className='navbar_btn' to='/'> <IoHomeOutline style={{ marginTop: '-3px' }} /> Home</Link>
                            <Link className='navbar_btn' to='/profile'> <CgProfile style={{ marginTop: '-3px' }} /> Profile</Link>
                            <Link className='navbar_btn' to='/blocklist'> <MdOutlineBlock style={{ marginTop: '-2px' }} /> BlockList Number</Link>
                        </div>
                    </Nav>

                    <div className="ml-auto">
                        <Button variant="outline-danger" onClick={logoutHandler}> <IoMdLogOut style={{ marginTop: '-2px' }} /> Logout</Button>
                    </div>

                </Container>
            </Navbar>
        </>
    );
}

export default HomeNavbar;