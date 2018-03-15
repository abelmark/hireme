import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import * as actions from "../actions";

import Header from "./Header/Header";
import Dashboard from "./Dashboard/Dashboard";
import Landing from './Landing/Landing';
class App extends Component {
  componentDidMount() {
    this.props.fetchUser();
  }

  render() {
    return (
      <BrowserRouter>
        <div className="container">
          <Header />
          <Dashboard />
          <Route exact path="/" component={Landing} />
          <Route exact path="/api/surveys" component={Dashboard} />
        </div>
      </BrowserRouter>
    );
  }
}

export default connect(null, actions)(App);
