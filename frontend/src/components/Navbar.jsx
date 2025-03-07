import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import { Button } from "@mui/material";
import { useAuth } from "../context/auth";
import NotificationBell from './NotificationBell';
import Typography from '@mui/material/Typography';

function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();
  const userRole = window.localStorage.getItem("role")?.replace(/"/g, '');
  const username = window.localStorage.getItem("username")?.replace(/"/g, '');

  console.log("Current user role:", userRole);
  console.log("Is logged in:", isLoggedIn);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const LogOut = () => {
    setIsLoggedIn(false);
    window.localStorage.removeItem("token");
    navigate("/");
  };

  const navbarStyle = {
    position: "sticky",
    top: "0%",
    zIndex: 100,
    backdropFilter: "blur(10px)",
    margin: 0,
    overflowY: "hidden",
  };

  const renderNavLinks = () => {
    if (userRole === 'admin') {
      return null;
    }

    if (!isLoggedIn) {
      return (
        <>
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <Button
                disableRipple
                variant="text"
                style={{ fontFamily: "Quicksand" }}
                sx={{
                  "&:hover": {
                    borderBottom: "1px solid #03045e",
                    borderRadius: "5px",
                  },
                }}
              >
                Home
              </Button>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              <Button
                disableRipple
                variant="text"
                style={{ fontFamily: "Quicksand" }}
                sx={{
                  "&:hover": {
                    borderBottom: "1px solid #03045e",
                    borderRadius: "5px",
                  },
                }}
              >
                About Us
              </Button>
            </Link>
          </li>
        </>
      );
    }

    const commonLinks = (
      <>
        <li className="nav-item">
          <Link to="/" className="nav-link">
            <Button
              disableRipple
              variant="text"
              style={{ fontFamily: "Quicksand" }}
              sx={{
                "&:hover": {
                  borderBottom: "1px solid #03045e",
                  borderRadius: "5px",
                },
              }}
            >
              Home
            </Button>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/about" className="nav-link">
            <Button
              disableRipple
              variant="text"
              style={{ fontFamily: "Quicksand" }}
              sx={{
                "&:hover": {
                  borderBottom: "1px solid #03045e",
                  borderRadius: "5px",
                },
              }}
            >
              About Us
            </Button>
          </Link>
        </li>
      </>
    );

    switch(userRole) {
      case 'donor':
        return (
          <>
            {commonLinks}
            <li className="nav-item">
              <Link to="/donor/pickups" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  Pickups
                </Button>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/donor/rewards" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  Rewards
                </Button>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/donor/history" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  History
                </Button>
              </Link>
            </li>
         
          </>
        );
      case 'compostAgency':
        return (
          <>
            {commonLinks}
            <li className="nav-item">
              <Link to="/agency/rewards" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  Pickups
                </Button>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/agency/history" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  History
                </Button>
              </Link>
            </li>
          </>
        );
      case 'ngo':
        return (
          <>
            {commonLinks}
            <li className="nav-item">
              <Link to="/ngo/rewards" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  Pickups
                </Button>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/ngo/history" className="nav-link">
                <Button
                  disableRipple
                  variant="text"
                  style={{ fontFamily: "Quicksand" }}
                  sx={{
                    "&:hover": {
                      borderBottom: "1px solid #03045e",
                      borderRadius: "5px",
                    },
                  }}
                >
                  History
                </Button>
              </Link>
            </li>
          </>
        );
      default:
        return commonLinks;
    }
  };

  const renderMenuItems = () => {
    return [
      <MenuItem key="profile" onClick={() => { handleClose(); navigate('/profile'); }}>
        Profile
      </MenuItem>,
      <MenuItem key="feedback" onClick={() => { handleClose(); navigate('/feedback'); }}>
        Feedback
      </MenuItem>,
      <MenuItem key="logout" onClick={() => { handleClose(); LogOut(); }}>
        Logout
      </MenuItem>
    ];
  };

  return (
    <nav className="navbar navbar-expand-lg p-2" style={navbarStyle}>
      <div className="container-fluid">
        {/* Logo */}
        <Link
          className="navbar-brand"
          to="/"
          style={{
            fontWeight: "bold",
            fontSize: "xx-large",
            fontFamily: "Quicksand",
          }}
        >
          <i className="fa-solid fa-seedling"></i> SustainFLow
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <MenuIcon />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Center Welcome Message */}
          {isLoggedIn && (
            <div style={{ 
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'auto',
              zIndex: 1
            }}>
              <Typography 
                variant="subtitle1" 
                style={{ 
                  fontFamily: "Quicksand",
                  color: "#25396F",
                  fontWeight: "bold",
                  whiteSpace: 'nowrap'
                }}
              >
                Hey! {username}
              </Typography>
            </div>
          )}

          {/* Right Side Elements: Nav Links + Notification + Profile */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            {renderNavLinks()}
            
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <NotificationBell />
                </li>
                <li className="nav-item">
                  <div>
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <AccountCircleOutlinedIcon fontSize="large" />
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      {renderMenuItems()}
                    </Menu>
                  </div>
                </li>
              </>
            )}

            {!isLoggedIn && (
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  <Button
                    disableRipple
                    variant="outlined"
                    style={{ fontFamily: "Quicksand" }}
                    sx={{
                      "&:hover": {
                        borderBottom: "1px solid #03045e",
                        borderRadius: "5px",
                      },
                    }}
                  >
                    LogIn/SignUP
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
