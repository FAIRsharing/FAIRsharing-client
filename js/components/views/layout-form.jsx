/**
 * @author massi
 */
import React from 'react';
import { GRAPH_LAYOUTS } from '../../utils/api-constants';

const Checkbox = React.createClass({

    render: function () {

        return (
            <label class="checkbox-inline">
                <input type="checkbox" id="standardsCheckbox" value={this.props.value}
                       onClick={this.props.onClick} /> {this.props.label}
            </label>
        );

    }

});

const LayoutForm = React.createClass({
    /*
    handleLayoutChange: function (ev) {
        console.log(ev.target.value);
        store.dispatch(layoutSelectChange({ name: ev.target.value }));
    }, */

    render: function() {

        const optList = [];
        const options = Object.keys(GRAPH_LAYOUTS).map(key => GRAPH_LAYOUTS[key]);

        for (let option of options) {
            optList.push(<option key={option} value={option} >{option}</option>);
        }

        const formStyle = {
            margin: '2px'
        };

        return <form className="form">
            <div class="row">
                <div className="form-group"  style={formStyle}>
                    <label htmlFor="layoutSelector" class="col-sm-2 col-xs-4">Layout </label>
                    <div class="col-sm-4 col-xs-8">
                        <select id="layoutSelector" className="form-control" onChange={this.props.handleLayoutChange} value={this.props.layoutName}>
                            {optList}
                        </select>
                    </div>
                </div>
            </div>
            <div class="row">
                <Checkbox value="databases" label="Databases" onClick="" />
                <Checkbox value="standards" label="Standards" onClick="" />
                <Checkbox value="policies" label="Policies" onClick="" />
            </div>
        </form>;

    }

});

export default LayoutForm;