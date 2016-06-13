/**
 * @author massi
 */
import 'react-select/scss/default.scss';

import React from 'react';
import Select from 'react-select';
import { GRAPH_LAYOUTS, BIOSHARING_ENTITIES, TAG_TYPES } from '../../utils/api-constants';
import _ from 'lodash';

const CHECKBOXES = _.values(BIOSHARING_ENTITIES);
const TAGS_SELECTS = _.values(TAG_TYPES);

const Checkbox = React.createClass({

    render: function () {

        return (
            <label className="checkbox-inline">
                <input type="checkbox" value={this.props.value} checked={this.props.isChecked} onChange={this.props.onChange} />
                {this.props.label}
            </label>
        );

    }

});

const TagsSelect = React.createClass({

    onValueClick: function(value) {
        this.refs.select.props.onChange(value);
    },

    render: function () {

        const tags = this.props.tags;
        const options = _.union(tags.selected, tags.unselected).map(opt => {
            return {value: opt, label: opt};
        });

        return (
            <Select ref="select" multi={true} options={options} value={tags.selected}
                    onChange={this.props.onChange(this.props.tagType)} onValueClick={this.onValueClick}  />
        );

    }

});

const LayoutForm = React.createClass({

    _toggleTagsSelectVisibility: function (ev) {
        const toggledCnt = this.refs[ev.target.value];
        if (ev.target.checked) {
            toggledCnt.style.display = '';
        }
        else {
            toggledCnt.style.display = 'none';
        }
    },

    render: function() {

        const optList = [], checkboxesList = [], tagSelectsList = [];
        const options = Object.keys(GRAPH_LAYOUTS).map(key => GRAPH_LAYOUTS[key]);

        for (let option of options) {
            optList.push(<option key={option} value={option} >{option}</option>);
        }

        for (let elem of CHECKBOXES) {
            const visibility = this.props.visibility && this.props.visibility[elem.value];
            checkboxesList.push(<Checkbox key={elem.value} value={elem.value} label={elem.label}
                                          isChecked={visibility} onChange={this.props.visibilityCheckboxChange} />);
        }
        checkboxesList.push(<Checkbox key='depth' value='depth' label='Depth' isChecked={this.props.depth > 1} onChange={this.props.depthCheckboxChange} />);

        // checkbox for tags visibility
        checkboxesList.push(<Checkbox key='tagsVisibility' value='tagsSelectsDiv' label='Show tags panel'
                                      isChecked={this.props.isTagsPanelVisible}
                                      onChange={this.props.tagsVisibilityCheckboxChange} />);

        if (this.props.isTagsPanelVisible) {
            for (let elem of TAGS_SELECTS) {
                let val = elem.value, tags = this.props.tags[elem.value];
                tagSelectsList.push(<TagsSelect key={val} tagType={val} tags={tags}
                                                onChange={this.props.tagsSelectChange}/>);
            }
        }

        const formStyle = {
            margin: '2px'
        };

        return <form className="form">
            <div className="row">
                <div className="form-group"  style={formStyle}>
                    <label htmlFor="layoutSelector" class="col-sm-2 col-xs-4">Layout </label>
                    <div className="col-sm-4 col-xs-8">
                        <select id="layoutSelector" className="form-control" onChange={this.props.handleLayoutChange} value={this.props.layoutName}>
                            {optList}
                        </select>
                    </div>
                </div>
            </div>
            <div className="row">{checkboxesList}</div>
            <div ref="tagsSelectsDiv" className="row">{tagSelectsList}</div>


        </form>;

    }

});

export default LayoutForm;
