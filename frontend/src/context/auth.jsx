import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";

const authContext = createContext();

export const AuthProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [profileFetched, setProfileFetched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider useEffect running...");
    // Check for admin token first
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setIsLoggedIn(true);
      setRole("admin");
      setUsername("admin");
      return;
    }

    // Check for regular user token
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");
    
    console.log("Auth State Check:", {
      token: !!token,
      storedRole,
      storedUsername,
      currentRole: role
    });

    if (token && storedRole && storedUsername) {
      const cleanRole = storedRole.replace(/"/g, '');
      setIsLoggedIn(true);
      setRole(cleanRole);
      setUsername(storedUsername.replace(/"/g, ''));
      
      console.log("Setting auth state:", {
        isLoggedIn: true,
        role: cleanRole,
        username: storedUsername.replace(/"/g, '')
      });
    } else {
      setIsLoggedIn(false);
      setRole("");
      setUsername("");
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        if (token && !profileFetched) {
            try {
                const response = await axios.get(`${config.BACKEND_API}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.user) {
                    setUserData(response.data.user);
                }
                setProfileFetched(true);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setProfileFetched(true);
            }
        }
    };

    if (isLoggedIn && !profileFetched) {
        fetchUserData();
    }
  }, [isLoggedIn, profileFetched]);

  const LogOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setRole("");
    setUsername("");
    setUserData(null);
    setProfileFetched(false);
    navigate("/");
  };

  const value = {
    theme,
    toggleTheme: () => setTheme(prev => prev === "light" ? "dark" : "light"),
    isLoggedIn,
    setIsLoggedIn,
    role,
    setRole,
    username,
    setUsername,
    userData,
    setUserData,
    profileFetched,
    setProfileFetched,
    LogOut,
  };

  console.log("Auth Context Current State:", {
    isLoggedIn,
    role,
    username
  });

  return (
    <authContext.Provider value={value}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
