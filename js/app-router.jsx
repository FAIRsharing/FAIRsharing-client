/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import { Router, Route, hashHistory } from 'react-router';
import DatabaseEditContainer from './components/containers/database-container';
import TimelineContainer from './components/containers/timeline-container';

export default (
    <Router history={hashHistory}>
        <Route path="database">
            <Route path="edit">
                <Route path=":biodbcoreId" component={DatabaseEditContainer} />
            </Route>
        </Route>
        <Route path='timeline' component={TimelineContainer} />
    </Router>
);
