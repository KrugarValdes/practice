import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Container, Typography, Box, Paper, Divider } from "@mui/material";
import { useUser } from "../UserContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Analytics = () => {
  const { user } = useUser();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchIncomes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/transactions/monthly-incomes/${user.id}`
        );
        setIncomes(response.data);
      } catch (error) {
        console.error("Error fetching monthly incomes:", error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/transactions/monthly-expenses/${user.id}`
        );
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching monthly expenses:", error);
      }
    };

    const fetchMonthlySummary = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/transactions/monthly/${user.id}`
        );
        setMonthlySummary(response.data);
      } catch (error) {
        console.error("Error fetching monthly summary:", error);
      }
    };

    const fetchTotalBudget = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/transactions/total/${user.id}`
        );
        setTotalBudget(response.data.total);
      } catch (error) {
        console.error("Error fetching total budget:", error);
      }
    };

    fetchIncomes();
    fetchExpenses();
    fetchMonthlySummary();
    fetchTotalBudget();
  }, [user]);

  const renderCategoryList = (data, total) =>
    data.map((item, index) => (
      <Box key={index} display="flex" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          <Box width={16} height={16} bgcolor={item.color} mr={1}></Box>
          <Typography>{item.category}</Typography>
        </Box>
        <Typography>{item.amount} ₽</Typography>
      </Box>
    ));

  const renderPieChart = (data) => (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="amount"
          label={(props) => {
            const {
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percent,
              index,
            } = props;
            const RADIAN = Math.PI / 180;
            const radius = 25 + innerRadius + (outerRadius - innerRadius);
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            return (
              <text
                x={x}
                y={y}
                fill="black"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
              >
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
          labelLine={false}
          textFill="black"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [
            `${value} ₽`,
            props.payload.category,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderSummaryList = (data) =>
    data.map((item, index) => (
      <Box key={index} display="flex" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          <Box
            width={16}
            height={16}
            bgcolor={COLORS[index % COLORS.length]}
            mr={1}
          ></Box>
          <Typography>{item.name}</Typography>
        </Box>
        <Typography>{item.value} ₽</Typography>
      </Box>
    ));

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const data = monthlySummary.map((item, index) => ({
    name: item.type,
    value: item.amount,
  }));

  return (
    <Box
      sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh", padding: "5px" }}
    >
      <Container>
        <Box mt={2} mb={4}>
          <Typography variant="h4" align="center" gutterBottom>
            Финансовая аналитика
          </Typography>
          <Divider variant="middle" />
        </Box>
        <Box display="flex" justifyContent="center" mb={2}>
          <Paper sx={{ flex: 1, m: 1, p: 2, maxWidth: "350px" }}>
            <Typography variant="h6" align="left">
              Общий бюджет за месяц: {totalBudget} ₽
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={(props) => {
                    const {
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      index,
                    } = props;
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="black"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                  textFill="black"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} ₽`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <Divider sx={{ my: 2 }} />
            {renderSummaryList(data)}
          </Paper>
        </Box>
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-around"
        >
          <Paper sx={{ flex: 1, m: 1, p: 2, maxWidth: "350px" }}>
            <Typography variant="h6" align="left">
              Доходы
            </Typography>
            {renderPieChart(incomes)}
            <Divider sx={{ my: 2 }} />
            {renderCategoryList(incomes, totalIncome)}
          </Paper>
          <Paper sx={{ flex: 1, m: 1, p: 2, maxWidth: "350px" }}>
            <Typography variant="h6" align="left">
              Расходы
            </Typography>
            {renderPieChart(expenses)}
            <Divider sx={{ my: 2 }} />
            {renderCategoryList(expenses, totalExpense)}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Analytics;
