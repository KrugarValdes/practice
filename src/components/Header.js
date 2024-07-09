import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import logo from "./logo1.png"; // Убедитесь, что путь к логотипу верен
import { useUser } from "../UserContext"; // Обеспечивает доступ к состоянию пользователя

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // Получаем текущего пользователя и функцию для обновления состояния

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setUser(null); // Очищаем пользователя
    navigate("/login"); // Перенаправляем на страницу логина
  };

  const handleSettings = () => {
    navigate("/settings"); // Перенаправляем на страницу настроек
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#00BFA5" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <img src={logo} alt="Logo" style={{ height: 40 }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ ml: 2, fontFamily: "Gibson, sans-serif", fontWeight: "bold" }}
          >
            FitTrack
          </Typography>
          <Box sx={{ display: "flex", ml: 4 }}>
            <Button
              color="inherit"
              component={Link}
              to="/dashboard"
              sx={{
                textTransform: "capitalize",
                fontWeight: "700",
                fontFamily: "Gibson, sans-serif",
                fontSize: "1.1rem",
              }}
            >
              Сводка
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/operations"
              sx={{
                textTransform: "capitalize",
                fontWeight: "600",
                fontFamily: "Gibson, sans-serif",
                fontSize: "1.1rem",
              }}
            >
              Операции
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/analytics"
              sx={{
                textTransform: "capitalize",
                fontWeight: "600",
                fontFamily: "Gibson, sans-serif",
                fontSize: "1.1rem",
              }}
            >
              Аналитика
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="account"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={handleSettings}
              sx={{ fontFamily: "Gibson, sans-serif" }}
            >
              Настройки
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{ fontFamily: "Gibson, sans-serif" }}
            >
              Выйти
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
