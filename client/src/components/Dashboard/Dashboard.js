import React from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ surveys }) => {
  return (
    <div>
      <div>
        <Link to="/surveys/new">
          <i className="material-icons">add</i>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
