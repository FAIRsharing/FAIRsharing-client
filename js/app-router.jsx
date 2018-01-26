/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import DatabaseEditContainer from './components/containers/database-container';

export default (
    <Router>
        <Route path="database">
            <Route path="edit">
                <Route path=":biodbcoreId" component={DatabaseEditContainer} />
            </Route>
        </Route>
    </Router>
);
