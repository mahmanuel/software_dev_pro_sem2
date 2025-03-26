import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Reports = () => {
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/reports/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setReportData(res.data));
  }, []);

  return (
    <div>
      <h2>Issue Reports & Analytics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={reportData}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Reports;
