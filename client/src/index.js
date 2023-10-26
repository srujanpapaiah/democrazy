import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import history from "./history";
import MyApp from "./components/App";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/ConductTransaction";
import TransactionPool from "./components/TransactionPool";
import "./index.css";

const App = () => {
  return (
    <BrowserRouter history={history}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blocks" element={<Blocks />} />
        <Route path="/conduct-transaction" element={<ConductTransaction />} />
        <Route path="/transaction-pool" element={<TransactionPool />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
