import React from 'react';
import { Field, reduxForm } from 'redux-form';
import * as databaseApi from '../../api/graph-api';

const DatabaseEditForm = props => {
    return (<form></form>);
};

const DatabaseEditContainer = React.createClass({

    propTypes: {},

    componentDidMount: function() {
        const biodbcoreId = this.props.params.biodbcoreId;
        databaseApi.getDatabase(biodbcoreId);
    },

    render: function() {
        return null;
    }
    
});

export default DatabaseEditContainer;
