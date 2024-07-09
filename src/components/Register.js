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
import { useUser } from "../UserContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        email,
        password,
      });

      console.log("Registration response:", response.data); // Добавим отладочный вывод

      if (response.data && response.data.userId) {
        setUser({ id: response.data.userId, email });
        console.log("User set with ID:", response.data.userId); // Отладочный вывод для подтверждения
        navigate("/dashboard");
      } else {
        console.error("No userId in response");
        alert("Registration failed: no userId returned");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed");
    }
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
            Регистрация
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
            onClick={handleRegister}
          >
            Регистрация
          </Button>
          <Typography
            component="p"
            variant="subtitle2"
            sx={{ alignSelf: "flex-end", fontFamily: "Gibson, sans-serif" }}
          >
            Уже есть аккаунт?{" "}
            <Button
              onClick={() => navigate("/login")}
              color="primary"
              sx={{ textTransform: "capitalize", fontWeight: "700" }}
            >
              Войти.
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
