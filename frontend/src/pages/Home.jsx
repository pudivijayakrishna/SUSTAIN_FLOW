import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Agency from "../components/Agency";
import Ngo from "../components/Ngo.jsx";
import Searchnearby from "../components/Searchnearby";
import { useAuth } from "../context/auth";
import Title from "../components/Title.jsx";
import ExtraInfo from "../components/ExtraInfo.jsx";

export default function Home() {
  const { isLoggedIn, role } = useAuth();

  return (
    <>
      <Title />
      {isLoggedIn ? (
        <>
          {role === 'compostAgency' && <Agency />}
          {role === 'ngo' && <Ngo />}
          {role === 'donor' && <Searchnearby />}
        </>
      ) : (
        <ExtraInfo />
      )}
    </>
  );
}