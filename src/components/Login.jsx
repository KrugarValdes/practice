import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useUser } from "../UserContext"; // Импортируем хук useUser

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser(); // Используем setUser для обновления контекста пользователя

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      setUser({ id: response.data.userId, email }); // Сохраняем ID пользователя и email в контексте
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    }
  };

  const handleTestLogin = () => {
    // Implement your test login logic here
    setUser({ id: 1, email: "test@example.com" }); // Замените на реальные данные для тестового логина
    navigate("/dashboard");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ p: 4, mt: 10, fontFamily: "Gibson, sans-serif" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
            Войдите
          </Typography>
          <Typography
            component="p"
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: "normal" }}
          >
            чтобы пользоваться FiTrack
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { fontFamily: "Gibson, sans-serif" } }}
            InputProps={{ style: { fontFamily: "Gibson, sans-serif" } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { fontFamily: "Gibson, sans-serif" },
            }}
            InputLabelProps={{ style: { fontFamily: "Gibson, sans-serif" } }}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              textTransform: "capitalize",
              fontWeight: "600",
              fontFamily: "Gibson, sans-serif",
            }}
            onClick={handleLogin}
          >
            Войти
          </Button>
          <Typography
            component="p"
            variant="subtitle2"
            sx={{ alignSelf: "flex-end", fontFamily: "Gibson, sans-serif" }}
          >
            Забыл пароль?
          </Typography>
          <Divider
            sx={{
              my: 2,
              width: "100%",
              textAlign: "center",
              "&::before, &::after": { top: "50%" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontFamily: "Gibson, sans-serif", fontWeight: "normal" }}
            >
              или
            </Typography>
          </Divider>
          <Button
            type="button"
            fullWidth
            variant="outlined"
            sx={{
              textTransform: "capitalize",
              fontWeight: "600",
              fontFamily: "Gibson, sans-serif",
            }}
            onClick={handleTestLogin}
          >
            Тестовый вход
          </Button>
          <Typography sx={{ mt: 2, fontFamily: "Gibson, sans-serif" }}>
            Нет аккаунта?{" "}
            <Button
              onClick={() => navigate("/register")}
              color="primary"
              sx={{ textTransform: "capitalize", fontWeight: "700" }}
            >
              Создать аккакунт.
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
