import '../../../styles/biosharing-entities.scss';

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { TextInput, Textarea, Select } from '../views/form';
import * as databaseApi from '../../api/database-api';
import { RESOURCE_STATUSES } from '../../utils/api-constants';


const fields = {
    name: { name: 'name', label: 'Name of the Database', placeholder: 'Name', helpText: 'The complete, full name of the resource.' },
    shortname: { name: 'shortname', label: 'Abbreviation',  placeholder: '', helpText: 'If the resource has an official or commonly-used abbreviation then please include it here. If there is no abbreviation, please leave blank. ' },
    status: { name: 'status', label: 'Resource Status', placeholder: '', helpText: 'The resource status.', options: RESOURCE_STATUSES },
    description: { name: 'description', label: 'Description', placeholder: '', helpText: 'Free text summary of the resource and its purpose.', size: 12 },
    homepage: { name: 'homepage', label: 'Homepage', placeholder: '', helpText: 'The homepage of the resource itself. If there is no official homepage, a related URL may be used. For policies, the resource homepage can be the policy document itself. URLs for related content such as organizations can be described in the Associated Organizations section.'},
    yearOfCreation: { name: 'yearOfCreation', label: 'Year of Creation', helpText: 'The year in which the resource was originally created.'},
    miriam_url: {name: 'miriam_url', label: 'MIRIAM URL', placeholder: '', helpText: 'Please add the MIRIAM URL (https://www.ebi.ac.uk/miriam/main/collections or http://identifiers.org) here. This is required for looking up the record there.'},
    contact: {name: 'contact', label: 'Contact Name', placeholder: '', helpText: 'A person responsible for the maintenance of the resource. Alternatively a group contact (e.g. a particular helpdesk or department) may be given.'},
    contactEmail: {name: 'contactEmail', label: 'Contact Email', placeholder: '', helpText: 'The contact email address for the contact. This may be an individual or a group address (e.g. Helpdesk).'},
    contactORCID: {name: 'contactORCID', label: 'Contact\'s ORCID', placeholder: '', helpText: 'If the designated contact is an individual, their ORCID ID can be entered here.'}
};

/**
 * @class
 * @name DatabaseEditForm
 */
 //TODO handle internationalisation issues
export let DatabaseEditForm = React.createClass({

    render: function() {

        const { handleSubmit, pristine, reset, submitting } = this.props;

        return (<div className='container'>
            <form className='form-horizontal' onSubmit={handleSubmit}>
                <Row>
                    <TextInput field={_.omit(fields.name, ['helpText', 'label'])} helpText={fields.name.helpText} label={fields.name.label} />
                    <TextInput field={_.omit(fields.shortname, ['helpText', 'label'])} helpText={fields.shortname.helpText} label={fields.shortname.label} />
                </Row>
                <Row>
                    <Select field={_.omit(fields.status, ['helpText', 'label', 'options'])}
                        helpText={fields.status.helpText} label={fields.status.label} options={fields.status.options}/>
                    <TextInput field={_.omit(fields.homepage, ['helpText', 'label'])} helpText={fields.homepage.helpText} label={fields.homepage.label} />
                </Row>
                <Row>
                    <Textarea field={_.omit(fields.description, ['helpText', 'label', 'size'])} helpText={fields.description.helpText} label={fields.description.label} size={fields.description.size}  />
                </Row>
                <Row>
                    <TextInput field={_.omit(fields.yearOfCreation, ['helpText', 'label'])} helpText={fields.yearOfCreation.helpText} label={fields.yearOfCreation.label} />
                    <TextInput field={_.omit(fields.miriam_url, ['helpText', 'label'])} helpText={fields.miriam_url.helpText} label={fields.miriam_url.label} />
                </Row>
                <Row>
                    <TextInput field={_.omit(fields.contact, ['helpText', 'label'])} helpText={fields.contact.helpText} label={fields.contact.label} />
                    <TextInput field={_.omit(fields.contactEmail, ['helpText', 'label'])} helpText={fields.contactEmail.helpText} label={fields.contactEmail.label} />
                </Row>
                <Row>
                    <TextInput field={_.omit(fields.contactORCID, ['helpText', 'label'])} helpText={fields.contactORCID.helpText} label={fields.contactORCID.label} />
                </Row>
            </form>
        </div>);
    }

});

/*
export let DatabaseEditForm = props => {

    const { handleSubmit, pristine, reset, submitting } = props;

    return (<form onSubmit={handleSubmit}>
        <div>
            <label>Full Name of Database</label>
            <div>
                <Field name='name' component='input' type='text' placeholder='' />
            </div>
        </div>
        <div>
            <label>Abbreviation</label>
            <div>
                <Field name='shortname' component='input' type='text' placeholder='' />
            </div>
        </div>
        <div>
            <label>Resource Status</label>
            <div>
                <Field name='status' component='select' >
                    {statusesOptions}
                </Field>
            </div>
        </div>
        <div>
            <label>Description</label>
            <div>
                <Field name='description' component='textarea' />
            </div>
        </div>
        <div>
            <label>Homepage</label>
            <div>
                <Field name='homepage' component='input' type='text' />
            </div>
        </div>
        <div>
            <label>Year Of Creation</label>
            <div>
                <Field name='yearOfCreation' component='input' type='text' />
            </div>
        </div>
        <div>
            <label>MIRIAM URL</label>
            <div>
                <Field name='miriam_url' component='input' type='text' />
            </div>
        </div>
        <div>
            <label>Contact Name</label>
            <div>
                <Field name='contact' component='input' type='text' />
            </div>
        </div>
        <div>
            <label>Contact Email</label>
            <div>
                <Field name='contactEmail' component='input' type='text' />
            </div>
        </div>
        <div>
            <label>Contact's ORCID</label>
            <div>
                <Field name='contactORCID' component='input' type='text' />
            </div>
        </div>
        <div>
            <button type="submit" disabled={pristine || submitting}>Submit</button>
            <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button>
        </div>
    </form>);
}; */

DatabaseEditForm = reduxForm({
    form: 'databaseEdit'
})(DatabaseEditForm);

const mapStateToProps = function(store) {
    return {
        initialValues: store.databaseState.database,
        isFetching: store.databaseState.isFetching,
        error: store.databaseState.error
    };
};

const mapDispatchToProps = function(dispatch) {
    return {};
};

DatabaseEditForm = connect(mapStateToProps, mapDispatchToProps)(DatabaseEditForm);


/**
 * @class
 * @name DatabaseEditContainer
 * @description containet class for the database editing operations
 */
const DatabaseEditContainer = React.createClass({

    propTypes: {},

    componentDidMount: function() {
        const biodbcoreId = this.props.params.biodbcoreId;
        databaseApi.getDatabase(biodbcoreId);
    },

    render: function() {
        if (this.props.error) {
            return (
                <div className="bs-entity-error">
                    {'An unexpected error occurred while retrieving the graph. Sorry for the inconvenience.' }
                </div>
            );
        }
        return (
        <div className='bs-edit'>
            <h3> Edit <b>{this.props.params.biodbcoreId}</b></h3>
            <div className='bs-entity-form-cnt'>
                <DatabaseEditForm />
            </div>
        </div>
        );
    }

});

export default DatabaseEditContainer;
