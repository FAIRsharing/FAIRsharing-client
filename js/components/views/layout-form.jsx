/**
 * @author massi
 */
import React from 'react';
import ReactDOM from 'react-dom';
import store from '../../store';
import { GRAPH_LAYOUTS } from '../../utils/api-constants';
import { layoutSelectChange } from '../../actions/graph-actions';

const LayoutForm = React.createClass({

    handleLayoutChange: function (ev) {
        console.log(ev.target.value);
        store.dispatch(layoutSelectChange({ name: ev.target.value }));
    },

    render: function() {

        const optList = [];
        const options = Object.keys(GRAPH_LAYOUTS).map(key => GRAPH_LAYOUTS[key]);

        for (let option of options) {
            optList.push(<option key={option} value={option} >{option}</option>);
        }

        const formStyle = {
            margin: '2px'
        };

        return <form className="form-horizontal">
            <div class="row">
            <div className="form-group"  style={formStyle}>
                <label htmlFor="layoutSelector" class="control- col-sm-2">Layout </label>
                <div class="control-col-sm-2">
                    <select id="layoutSelector" className="form-control" onChange={this.handleLayoutChange} value={this.props.layoutName}>
                        {optList}
                    </select>
                </div>
            </div>
            </div>
        </form>;

    }

});

export default LayoutForm;