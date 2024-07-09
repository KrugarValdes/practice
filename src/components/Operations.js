import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Fab,
  Checkbox,
  ListItemText,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddOperationDialog from "./AddOperation";
import { useUser } from "../UserContext";
import EditOperationDialog from "./EditOperation";

const Operation = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    type: "",
    categories: [],
  });
  const [totalCount, setTotalCount] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchFilteredTransactions = async () => {
      try {
        const transactionsResponse = await axios.get(
          `http://localhost:5000/api/transactions/paginated/${user.id}`,
          {
            params: {
              page: page + 1,
              limit: rowsPerPage,
              startDate: filter.startDate,
              endDate: filter.endDate,
              type: filter.type,
              categories: filter.categories,
            },
          }
        );
        setTransactions(transactionsResponse.data.transactions);
        setTotalCount(transactionsResponse.data.totalCount);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFilteredTransactions();

    axios
      .get("http://localhost:5000/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error(error));

    axios
      .get("http://localhost:5000/api/transaction_types")
      .then((response) => setTransactionTypes(response.data))
      .catch((error) => console.error(error));
  }, [user, page, rowsPerPage, filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setFilter({
      ...filter,
      categories: typeof value === "string" ? value.split(",") : value,
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const startDate = filter.startDate ? new Date(filter.startDate) : null;
    const endDate = filter.endDate ? new Date(filter.endDate) : null;

    return (
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate) &&
      (!filter.type ||
        transaction.type === filter.type ||
        filter.type === "Все типы") &&
      (filter.categories.length === 0 ||
        filter.categories.includes(transaction.category))
    );
  });

  const calculateTotalAmount = (type) => {
    return filteredTransactions
      .filter((transaction) => transaction.type === type)
      .reduce((acc, transaction) => acc + transaction.amount, 0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDialogOpen = () => {
    setOpenAddDialog(true);
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
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

  return (
    <Box
      sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh", padding: "5px" }}
    >
      <Container>
        <Box mt={2} mb={2}>
          <Typography variant="h4" align="center">
            Операции
          </Typography>
        </Box>
        <Box mb={2} display="flex" justifyContent="space-between">
          <TextField
            label="Начальная дата"
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            style={{ marginRight: 16, flex: 1 }}
          />
          <TextField
            label="Конечная дата"
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            style={{ marginRight: 16, flex: 1 }}
          />
          <FormControl fullWidth style={{ marginRight: 16, flex: 1 }}>
            <InputLabel>Фильтр по типу</InputLabel>
            <Select
              label="Фильтр по типу"
              name="type"
              value={filter.type}
              onChange={handleFilterChange}
            >
              <MenuItem value="Все типы">Все типы</MenuItem>
              {transactionTypes.map((type) => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ flex: 1, minWidth: 240 }}>
            <InputLabel
              style={{ backgroundColor: "#f9f9f9", padding: "0 4px" }}
            >
              Фильтр по категориям
            </InputLabel>
            <Select
              multiple
              value={filter.categories}
              onChange={handleCategoryChange}
              renderValue={(selected) => selected.join(", ")}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  <Checkbox
                    checked={filter.categories.indexOf(category.name) > -1}
                  />
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
                {filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    hover
                    onClick={() => handleEditDialogOpen(transaction)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {transaction.type === "Доход" ? (
                        <span
                          style={{
                            backgroundColor:
                              transaction.type === "Доход"
                                ? "#d4f7dc"
                                : "#f7d4d4",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          + {transaction.amount}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "red",
                            backgroundColor: "#f7d4d4",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          - {transaction.amount}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.comment}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Нет операций
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[8, 16, 24]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <AddOperationDialog
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
        <Box mt={4} display="flex" justifyContent="space-between">
          <Typography variant="h6" align="left">
            Сумма доходов на странице: {calculateTotalAmount("Доход")} ₽
          </Typography>
          <Typography variant="h6" align="left">
            Сумма расходов на странице: {calculateTotalAmount("Расход")} ₽
          </Typography>
        </Box>
        <Box position="fixed" bottom={16} right={16}>
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
      </Container>
    </Box>
  );
};

export default Operation;
