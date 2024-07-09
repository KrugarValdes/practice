import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  InputAdornment,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { styled } from "@mui/system";
import axios from "axios";

const CustomButton = styled(Button)(({ theme, selected }) => ({
  color: "black",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "2px",
    bottom: 0,
    left: 0,
    backgroundColor: selected ? "#00BFA5" : "transparent",
    transition: "background-color 0.3s",
  },
  "&:hover": {
    backgroundColor: "#00BFA5",
    color: "white",
  },
  "&:active": {
    backgroundColor: "#008c7a",
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00BFA5",
  color: "white",
  "&:hover": {
    backgroundColor: "#00a392",
  },
  "&:active": {
    backgroundColor: "#008c7a",
  },
}));

const AddOperation = ({ open, onClose, onAdd }) => {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedButton, setSelectedButton] = useState("");
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchTransactionTypes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/transaction_types"
        );
        setTransactionTypes(response.data);
      } catch (error) {
        console.error("Error fetching transaction types:", error);
      }
    };

    fetchTransactionTypes();
  }, []);

  const handleTransactionTypeChange = async (e) => {
    const selectedTypeId = e.target.value;
    setType(selectedTypeId);
    setCategory(""); // Сброс категории при изменении типа

    try {
      const response = await axios.get(
        `http://localhost:5000/api/categories/${selectedTypeId}`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedButton("other");
  };

  const handleSubmit = () => {
    if (amount <= 0) {
      setError("Сумма должна быть больше нуля");
      return;
    }
    if (!type || !category) {
      setError("Пожалуйста, выберите тип операции и категорию");
      return;
    }
    onAdd({ type, category, amount, description, date: selectedDate });
    setType("");
    setCategory("");
    setAmount("");
    setDescription("");
    setSelectedDate(new Date());
    setSelectedButton("");
    onClose();
    setOpenSnackbar(true);
  };

  const handleDateButtonClick = (option) => {
    const today = new Date();
    if (option === "today") {
      setSelectedDate(today);
      setSelectedButton("today");
    } else if (option === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setSelectedDate(yesterday);
      setSelectedButton("yesterday");
    } else {
      setSelectedButton("other");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            width: "40%",
            height: "auto",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            backgroundColor: "#00BFA5",
            color: "white",
            padding: "16px 24px",
            textAlign: "left",
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "1.5rem" }}>
            Добавить операцию
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: "24px", paddingTop: "10px" }}>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              paddingTop: "16px",
            }}
          >
            <TextField
              label="Количество"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₽</InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Тип операции"
              value={type}
              onChange={handleTransactionTypeChange}
            >
              {transactionTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Категория"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!type} // Категории недоступны до выбора типа
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Заметки"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              maxRows={4}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 2,
                marginBottom: 0,
              }}
            >
              <CustomButton
                onClick={() => handleDateButtonClick("today")}
                selected={selectedButton === "today"}
              >
                Сегодня
              </CustomButton>
              <CustomButton
                onClick={() => handleDateButtonClick("yesterday")}
                selected={selectedButton === "yesterday"}
              >
                Вчера
              </CustomButton>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                customInput={
                  <CustomButton selected={selectedButton === "other"}>
                    Другая дата
                  </CustomButton>
                }
              />
            </Box>
          </Box>
          {error && <Typography color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setType("");
              setCategory("");
              setAmount("");
              setDescription("");
              setSelectedDate(new Date());
              setSelectedButton("");
              setError("");
              onClose();
            }}
          >
            Отмена
          </Button>
          <AddButton onClick={handleSubmit}>Добавить</AddButton>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Операция успешно добавлена!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddOperation;
