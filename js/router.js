/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import { Router, Route, hashHistory } from 'react-router';
import GraphContainer from './components/containers/graph-container';
import DatabaseEditContainer from './components/containers/database-edit-container';

export default (
    <Router history={hashHistory}>
        <Route path="graph">
            <Route path=":graphId" component={GraphContainer}/>
        </Route>
        <Route path="database">
            <Route path="edit">
                <Route path=":id" component={DatabaseEditContainer} />
            </Route>
        </Route>
    </Router>
);
