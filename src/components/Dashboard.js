import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Paper,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddTransactionDialog from "./AddOperation";
import EditOperationDialog from "./EditOperation";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  typography: {
    fontFamily: "Lato, sans-serif",
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 500,
    },
    body2: {
      fontWeight: 500,
    },
  },
});

const getBudgetColorAndSign = (income, expenses) => {
  const budget = income - expenses;
  if (budget > 0) {
    return { color: "green", sign: "+" };
  } else if (budget < 0) {
    return { color: "red", sign: "-" };
  } else {
    return { color: "gray", sign: "" };
  }
};

const SummaryItem = ({ title, amount, period, color, sign }) => (
  <Box
    className="block summaryItemContainer clickable"
    sx={{
      padding: "10px",
      textAlign: "center",
      backgroundColor: "white",
      borderRadius: "4px",
      margin: "0px",
      flex: 1,
    }}
  >
    <Typography
      className="quickSummaryTitle semiBold preferBold"
      variant="body2"
      color="black"
    >
      {title}
    </Typography>
    <Typography
      className="UIAmount"
      sx={{ color: color, fontSize: "20px", marginTop: "1px" }}
    >
      {sign} {amount}
    </Typography>
    <Typography className="periodContainer" variant="caption" color="black">
      {" "}
      {period}
    </Typography>
  </Box>
);

const Dashboard = () => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const [totalBudget, setTotalBudget] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState({
    income: 0,
    expenses: 0,
    budgets: 0,
  });

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:5000/api/transactions/${user.id}`)
      .then((response) => {
        setTransactions(response.data);
      })
      .catch((error) => console.error(error));

    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error(error));

    axios
      .get("http://localhost:5000/api/transaction_types")
      .then((response) => setTransactionTypes(response.data))
      .catch((error) => console.error(error));

    axios
      .get(`http://localhost:5000/api/transactions/total/${user.id}`)
      .then((response) => {
        setTotalBudget(response.data.total || 0);
      })
      .catch((error) => console.error(error));

    axios
      .get(`http://localhost:5000/api/transactions/monthly/${user.id}`)
      .then((response) => {
        const income =
          response.data.find((item) => item.type === "Доход")?.amount || 0;
        const expenses =
          response.data.find((item) => item.type === "Расход")?.amount || 0;
        const budgets =
          response.data.find((item) => item.type === "Бюджет")?.amount || 0;
        setMonthlySummary({ income, expenses, budgets });
      })
      .catch((error) => console.error(error));
  }, [user]);

  const handleDialogOpen = () => {
    setOpenAddDialog(true);
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
  };

  const handleEditDialogOpen = (transaction) => {
    const selectedCategory = categories.find(
      (cat) => cat.name === transaction.category
    );
    const selectedType = transactionTypes.find(
      (type) => type.name === transaction.type
    );
    setSelectedTransaction({
      ...transaction,
      category_id: selectedCategory ? selectedCategory.id : null,
      type_id: selectedType ? selectedType.id : null,
    });
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedTransaction(null);
  };

  const handleEdit = async (updatedTransaction) => {
    if (!user) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/transactions/${updatedTransaction.id}`,
        {
          category_id: updatedTransaction.category,
          type_id: updatedTransaction.type,
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
          comment: updatedTransaction.description,
        }
      );

      if (response.status === 200) {
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? response.data
              : transaction
          )
        );
        handleEditDialogClose();
      }
    } catch (error) {
      console.error("Error editing transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/transactions/${id}`
      );

      if (response.status === 200) {
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction.id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleAdd = async (transaction) => {
    if (!user) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/transactions",
        {
          user_id: user.id,
          category_id: transaction.category,
          type_id: transaction.type,
          amount: transaction.amount,
          date: transaction.date,
          comment: transaction.description,
        }
      );

      if (response.status === 201) {
        setTransactions([...transactions, response.data]);
        handleDialogClose();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const formatAmount = (amount, typeName) => {
    return (
      <span
        style={{
          backgroundColor: typeName === "Доход" ? "#d4f7dc" : "#f7d4d4",
          padding: "4px 8px",
          borderRadius: "4px",
        }}
      >
        {typeName === "Доход" ? (
          <span style={{ color: "green" }}>+ {amount}</span>
        ) : (
          <span style={{ color: "red" }}>- {amount}</span>
        )}
      </span>
    );
  };

  const budgetColorAndSign = getBudgetColorAndSign(
    monthlySummary.income,
    monthlySummary.expenses
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "#f9f9f9",
          minHeight: "30vh",
          padding: "4px",
        }}
      >
        <Container>
          <Box mt={2}>
            <Box display="flex" justifyContent="center" mb={2}>
              <Box
                sx={{
                  display: "flex",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                  padding: "16px",
                  width: "100%",
                  maxWidth: "800px",
                }}
              >
                <SummaryItem
                  title="ТЕКУЩИЙ БАЛАНС"
                  amount={`${totalBudget} ₽`}
                  period="НА ДАННЫЙ МОМЕНТ"
                  color="#333"
                  sign=""
                />
                <SummaryItem
                  title="ДОХОД"
                  amount={`${monthlySummary.income} ₽`}
                  period="В ЭТОМ МЕСЯЦЕ"
                  color="green"
                  sign="+"
                />
                <SummaryItem
                  title="РАСХОДЫ"
                  amount={`${monthlySummary.expenses} ₽`}
                  period="В ЭТОМ МЕСЯЦЕ"
                  color="red"
                  sign="-"
                />
                <SummaryItem
                  title="ИЗМЕНЕНИЕ БЮДЖЕТА"
                  amount={`${Math.abs(
                    monthlySummary.income - monthlySummary.expenses
                  )} ₽`}
                  period="В ЭТОМ МЕСЯЦЕ"
                  color={budgetColorAndSign.color}
                  sign={budgetColorAndSign.sign}
                />
              </Box>
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom>
            Последние операции:
          </Typography>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Дата</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Сумма
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Категория</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Описание</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Тип операции</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      hover
                      onClick={() => handleEditDialogOpen(transaction)}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell component="th" scope="row">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.comment}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Нет операций
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
        <AddTransactionDialog
          open={openAddDialog}
          onClose={handleDialogClose}
          onAdd={handleAdd}
          categories={categories}
          transactionTypes={transactionTypes}
        />
        {selectedTransaction && (
          <EditOperationDialog
            open={openEditDialog}
            onClose={handleEditDialogClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
            operation={selectedTransaction}
            categories={categories}
            transactionTypes={transactionTypes}
          />
        )}
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
        >
          <Fab
            sx={{
              backgroundColor: "#F0E68C",
              "&:hover": { backgroundColor: "#BDB76B" },
            }}
            onClick={handleDialogOpen}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
