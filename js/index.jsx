// import SASS files
import '../styles/main.scss';

// import JavaScript dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import store from './store';
import router from './router';

ReactDOM.render(<Provider store={store}>{router}</Provider>, document.getElementById('react-root'));
