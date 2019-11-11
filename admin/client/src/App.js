import React, { Component } from 'react';
import AppNavBar from './components/AppNavbar'
import QuestionList from './components/QuestionList';
import { Provider } from 'react-redux';
import store from './store';
import QuestionModal from './components/QuestionModal';
import { Container } from 'reactstrap';
//import AppChatButton from './components/AppChatButton';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <AppNavBar/>
          <Container>
            <QuestionModal/>
            <QuestionList/>
          </Container>
          
        </div>
      </Provider>
    );
  }
}

export default App;
