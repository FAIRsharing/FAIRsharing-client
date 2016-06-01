import React from 'react';
import Modal from 'react-modal';
import _ from 'lodash';

const ModalDialog = React.createClass({

    shouldComponentUpdate: function(nextProps) {
        return true;
    },

    open: function() {
        return null;
    },

    close: function() {
        this.props.closeDetailsPanel();
    },

    render: function() {

        const attrList = [], data = this.props.data, attrs = data ? data.properties : {},
            label = data ? data.labels && data.labels[0] : '';
        for (const key of Object.keys(attrs)) {
            const value = _.isArray(attrs[key]) ? attrs[key].join(', ') : attrs[key];
            attrList.push(<li key={key} className="list-group-item"><b>{key}:</b> {value}</li>);
        }

        return (
            <Modal isOpen={this.props.isOpen} onRequestClose={this.close} >
                <h1>{attrs.shortName || attrs.name}</h1>
                <h2>{label}</h2>
                <ul className="list-group">{attrList}</ul>
            </Modal>
        );
    }

});

export default ModalDialog;
