/**
 * @author massi
 */
import React from 'react';
import ReactDOM from 'react-dom';

const Selector = React.createClass({

    componentDidUpdate: function() {
        
    },

    render: function() {

        const optList = [];

        for (const option of this.props.options) {
            optList.push(<option value={option} >option</option>);
        }
        return <select class="form-control">{optList}</select>;

    }

});

export default Selector;