import React from 'react';
import _ from 'lodash';
import Select from 'react-select';
import { TAG_TYPES } from '../../utils/api-constants';

const TAGS_SELECTS = _.values(TAG_TYPES);

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

});

/**
 * @class
 * @name TagsForm
 * @description form containing all the select boxes for the tags filtering
 */
const TagsForm = React.createClass({

    render: function() {

        if (!this.props.isTagsPanelVisible) {
            return false;
        }

        const tagSelectsList = [];

        for (let elem of TAGS_SELECTS) {
            let val = elem.value, tags = this.props.tags[elem.value];
            tagSelectsList.push(<TagsSelect key={val} tagType={val} tags={tags}
                onChange={this.props.tagsSelectChange} />);
        }

        return <form className="form">
            <div>{tagSelectsList}</div>
        </form>;

    }

});

export default TagsForm;
