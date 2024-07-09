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

const CustomButton = styled(Button)(({ selected }) => ({
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

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00BFA5",
  color: "white",
  "&:hover": {
    backgroundColor: "#00a392",
  },
  "&:active": {
    backgroundColor: "#008c7a",
  },
}));

const EditOperationDialog = ({
  open,
  onClose,
  onEdit,
  operation,
  onDelete,
  transactionTypes,
}) => {
  const [type, setType] = useState(operation.type_id);
  const [category, setCategory] = useState(operation.category_id);
  const [amount, setAmount] = useState(operation.amount);
  const [description, setDescription] = useState(operation.comment);
  const [selectedDate, setSelectedDate] = useState(new Date(operation.date));
  const [selectedButton, setSelectedButton] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (operation) {
      setType(operation.type_id || "");
      setCategory(operation.category_id || "");
      setAmount(operation.amount || "");
      setDescription(operation.comment || "");
      setSelectedDate(operation.date ? new Date(operation.date) : new Date());

      // Fetch categories for the initial type
      if (operation.type_id) {
        fetchCategories(operation.type_id);
      }
    }
  }, [operation]);

  const fetchCategories = async (typeId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/categories/${typeId}`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleTransactionTypeChange = async (e) => {
    const selectedTypeId = e.target.value;
    setType(selectedTypeId);
    setCategory(""); // Сброс категории при изменении типа

    fetchCategories(selectedTypeId);
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
    onEdit({
      id: operation.id,
      type,
      category,
      amount,
      description,
      date: selectedDate,
    });
    setOpenSnackbar(true); // Показать уведомление
    setError(""); // Сбросить ошибки
    onClose(); // Закрыть диалог
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

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDelete = () => {
    onDelete(operation.id);
    onClose(); // Close the dialog after delete
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
            Изменить операцию
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
          <Button onClick={handleDelete} color="error">
            Удалить
          </Button>
          <Button onClick={onClose}>Отмена</Button>
          <EditButton onClick={handleSubmit}>Изменить</EditButton>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Операция успешно изменена!
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditOperationDialog;
