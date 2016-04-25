/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import { Router, Route, hashHistory} from 'react-router';
import GraphContainer from './components/containers/graph-container';

export default (
    <Router history={hashHistory}>
        <Route path="graph">
            <Route path=":graphId" component={GraphContainer}/>
        </Route>
    </Router>
);