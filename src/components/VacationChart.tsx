import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { VacationPeriod } from "../types";

interface Props {
  vacations: VacationPeriod[];
}

const VacationChart = ({ vacations }: Props) => {
  const data = vacations.map((vacation) => ({
    name: vacation.userName,
    start: new Date(vacation.startDate || "").getTime(),
    end: new Date(vacation.endDate || "").getTime(),
  }));

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => format(value, "MM/dd")}
          />
          <YAxis type="category" dataKey="name" />
          <Tooltip
            labelFormatter={(value) => format(value, "PP")}
            formatter={(value: any) => format(value, "PP")}
          />
          <Bar dataKey="start" stackId="a" fill="#8884d8" />
          <Bar dataKey="end" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VacationChart;
