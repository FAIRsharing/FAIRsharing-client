import React from 'react';
import ReactDOM from 'react-dom';
import { values, union } from 'lodash';
import Select from 'react-select';
import { TAG_TYPES } from '../../utils/api-constants';

const TAGS_SELECTS = values(TAG_TYPES);

const TagsSelect = React.createClass({

    onValueClick: function(value) {
        this.refs.select.props.onChange(value);
    },

    render: function () {

        const tags = this.props.tags;
        const options = union(tags.selected, tags.unselected).map(opt => {
            return {value: opt, label: opt};
        });

        return (
            <div className="tag-select">
                <h4 className="tag-select-label">{this.props.label}</h4>
                <Select ref="select" multi={true} options={options} value={tags.selected}
                    onChange={this.props.onChange(this.props.tagType)} onValueClick={this.onValueClick}
                    clearAllText='Reset' backspaceToRemoveMessage=''  />
            </div>
        );

    }

});

/**
 * @class
 * @name TagsForm
 * @description form containing all the select boxes for the tags filtering
 */
const TagsForm = React.createClass({

    componentDidUpdate: function(prevProps) {
        // if the panel was activated scroll it into view
        if (this.props.isTagsPanelVisible && !prevProps.isTagsPanelVisible) {
            const rootNode = ReactDOM.findDOMNode(this);
            rootNode && rootNode.scrollIntoView();
        }
    },

    render: function() {

        if (!this.props.isTagsPanelVisible) {
            return false;
        }

        const tagSelectsList = [];

        for (let elem of TAGS_SELECTS) {
            let val = elem.value, tags = this.props.tags[elem.value];
            tagSelectsList.push(<TagsSelect label={elem.label} key={val} tagType={val} tags={tags}
                onChange={this.props.tagsSelectChange} />);
        }

        return <form id="tagsForm" className="form">
            <div>{tagSelectsList}</div>
        </form>;

    }

});

export default TagsForm;
