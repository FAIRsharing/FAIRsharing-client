/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import GraphContainer from './components/containers/graph-container';

export default (
    <Router>
        <div>
            <Route path="/collection/:graphId" component={GraphContainer}/>
        </div>
    </Router>
);
