/**
* @author massi
*/
import 'react-select/scss/default.scss';
import '../../../styles/main.scss';

import React from 'react';
// import Select from 'react-select';
import { Col } from 'react-bootstrap';
import { GRAPH_LAYOUTS, TAG_TYPES, ENTITY_LABELS_PLURAL} from '../../utils/api-constants';
import _ from 'lodash';

//const CHECKBOXES = _.values(BIOSHARING_ENTITIES);
const TAGS_SELECTS = _.values(TAG_TYPES);

const Checkbox = React.createClass({

    render: function () {

        return (
            <label className="checkbox-inline" style={this.props.labelStyle}>
                <input type="checkbox" value={this.props.value} checked={this.props.isChecked}
                    data-entity-type={this.props.entityType} data-depth-level={this.props.depthLevel}
                    onChange={this.props.onChange} />
                {this.props.label}
            </label>
        );

    }

});

/*
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
                onChange={this.props.onChange(this.props.tagType)} onValueClick={this.onValueClick}
                clearAllText='Reset' backspaceToRemoveMessage=''  />
        );

    }

}); */

const LayoutForm = React.createClass({
    /*
    inlineStyle: {
        backgroundColor: '#f3ffff'
    }, */

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

        const optList = [], tagSelectsList = [], innerCheckboxes = [], outerCheckboxes = [];
        const options = Object.keys(GRAPH_LAYOUTS).map(key => GRAPH_LAYOUTS[key]);

        // checkbox for tags visibility
        const tagsVisibilityCheckbox = <Checkbox key='tagsVisibility' value='tagsSelectsDiv'
            label='Show tags panel' labelStyle={{marginTop: 6}}
            isChecked={this.props.isTagsPanelVisible} onChange={this.props.tagsVisibilityCheckboxChange} />;

        const outerCheckboxLabelStyle = {
            fontWeight: 'bold',
            marginTop: 6
        };

        const outerCheckbox = <Checkbox key='depth' value='depth' label='Outer' labelStyle={outerCheckboxLabelStyle}
            isChecked={this.props.depth > 1} onChange={this.props.depthCheckboxChange} />;

        for (let option of options) {
            optList.push(<option key={option} value={option} >{option.toUpperCase()}</option>);
        }

        for (let elem of Object.keys(this.props.visibility)) {
            for (let depthLevel of Object.keys(this.props.visibility[elem])) {
                const visibility = this.props.visibility[elem][depthLevel];
                const targetList = depthLevel <= 1 ? innerCheckboxes : outerCheckboxes;

                if (depthLevel > 1 && this.props.depth <= 1) continue;

                targetList.push(<Checkbox key={`${elem}-${depthLevel}`}
                    value={`${elem}-${depthLevel}`}
                    label={`${ENTITY_LABELS_PLURAL[elem]}`}
                    entityType={elem} depthLevel={depthLevel}
                    isChecked={visibility} onChange={this.props.visibilityCheckboxChange}/>
                );
            }
        }
        /*
        if (this.props.isTagsPanelVisible) {
            for (let elem of TAGS_SELECTS) {
                let val = elem.value, tags = this.props.tags[elem.value];
                tagSelectsList.push(<TagsSelect key={val} tagType={val} tags={tags}
                    onChange={this.props.tagsSelectChange} />);
            }
        } */

        /*
        const formStyle = {
            margin: '2px'
        }; */

        return <Col xs={12}>
            <form className="form layout-form">
                <div className="">
                    <div className="form-group layout-selector-div">
                        <label htmlFor="layoutSelector" className="col-xs-4">Layout </label>
                        <div className="col-xs-8">
                            <select id="layoutSelector" className="form-control" onChange={this.props.handleLayoutChange} value={this.props.layoutName}>
                                {optList}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="">{tagsVisibilityCheckbox}</div>
                <div className=""><div style={{ marginTop: 6}}><b>Inner</b></div></div>
                <div className="">{innerCheckboxes}</div>
                <div className="">{outerCheckbox}</div>
                <div className="">{outerCheckboxes}</div>
                {/* <div ref="tagsSelectsDiv" className="">{tagSelectsList}</div> */}
            </form>
        </Col>;

    }

});

export default LayoutForm;
