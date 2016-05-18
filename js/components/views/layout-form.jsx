/**
 * @author massi
 */
import React from 'react';
import { GRAPH_LAYOUTS, BIOSHARING_ENTITIES } from '../../utils/api-constants';
import _ from 'lodash';

const CHECKBOXES = _.values(BIOSHARING_ENTITIES);

const VisibilityCheckbox = React.createClass({

    render: function () {
        
        return (
            <label className="checkbox-inline">
                <input type="checkbox" id="standardsCheckbox" value={this.props.value}
                       checked={this.props.visibility} onChange={this.props.onChange} />
                {this.props.label}
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

        const optList = [], checkboxesList = [];
        const options = Object.keys(GRAPH_LAYOUTS).map(key => GRAPH_LAYOUTS[key]);

        for (let option of options) {
            optList.push(<option key={option} value={option} >{option}</option>);
        }

        for (let checkbox of CHECKBOXES) {
            const visibility = this.props.visibility && this.props.visibility[checkbox];
            checkboxesList.push(<VisibilityCheckbox key={checkbox} value={checkbox} label={checkbox} visibility={visibility}
                                          onChange={this.props.visibilityCheckboxChange} />);
        }

        const formStyle = {
            margin: '2px'
        };

        return <form className="form">
            <div className="row">
                <div className="form-group"  style={formStyle}>
                    <label htmlFor="layoutSelector" class="col-sm-2 col-xs-4">Layout </label>
                    <div class="col-sm-4 col-xs-8">
                        <select id="layoutSelector" className="form-control" onChange={this.props.handleLayoutChange} value={this.props.layoutName}>
                            {optList}
                        </select>
                    </div>
                </div>
            </div>
            <div className="row">{checkboxesList}</div>
        </form>;

    }

});

export default LayoutForm;