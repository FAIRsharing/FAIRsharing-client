import React from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { ENTITY_LABELS_SINGULAR, BIOSHARING_ENTITIES } from '../../utils/api-constants';

const customStyles = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

const ModalDialog = React.createClass({
    /*
    shouldComponentUpdate: function(nextProps) {
        return true;
    },*/

    open: function() {
        return null;
    },

    close: function() {
        this.props.closeDetailsPanel();
    },

    render: function() {

        const attrList = [], data = this.props.data, attrs = data ? data.properties : {},
            label = this._generateLabel();
        for (const key of Object.keys(attrs)) {
            // add field only if in whitelist
            if (this.props.allowedFields.indexOf(key) > -1) {
                const value = _.isArray(attrs[key]) ? attrs[key].join(', ') : attrs[key];
                attrList.push(<li key={key} className="list-group-item"><b>{key}:</b> {value}</li>);
            }
        }

        return (
            <Modal isOpen={this.props.isOpen} onRequestClose={this.close} className="graph-dialog">
                <h1>{attrs.shortName || attrs.name}</h1>
                <h2>{label}</h2>
                <ul className="list-group">{attrList}</ul>
            </Modal>
        );
    },

    _generateLabel: function() {
        const data = this.props.data, entityType = data && data.labels && data.labels[0];
        let label = entityType ? ENTITY_LABELS_SINGULAR[entityType] : '';
        if (entityType === BIOSHARING_ENTITIES.STANDARD.value) {
            label = `${label} - ${data.properties.type}`;
        }
        return label;
    }

});

export default ModalDialog;
