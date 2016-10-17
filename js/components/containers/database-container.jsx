import '../../../styles/biosharing-entities.scss';

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { TextInput, Textarea, Select, MultiSelect } from '../views/form';
import { getDatabaseSuccess, getTagsSuccess } from '../../actions/database-actions';
import { getRemoteError } from '../../actions/main-actions';
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
    contactORCID: {name: 'contactORCID', label: 'Contact\'s ORCID', placeholder: '', helpText: 'If the designated contact is an individual, their ORCID ID can be entered here.'},
    countries: {
        name: 'countries', label: 'Countries', placeholder: '',
        helpText: 'The country or countries in which the resource was developed and/or is currently maintained. As you type, you will be presented with a list of matching values. If the country provided does not match our approved country list, you will be asked to change the value supplied.',
        size: 12
    },
    taxonomies: {
        name: 'taxonomies', label: 'Taxonomy', placeholder: '',
        helpText: 'The taxonomies covered by this resource. Please use latin names where possible. As you type, you will be presented with a list of matching values in a scrollable, drop-down menu. If you do not find an appropriate species, you may enter your own.',
        size: 12
    },
    domains: {
        name: 'domains', label: 'Domains', placeholder: '',
        helpText: 'The biological domains covered by this resource. As you type, you will be presented with a list of matching values in a scrollable drop-down menu. If you do not find an appropriate term,  you may enter your own.',
        size: 12
    }
};

/**
 * @class
 * @name DatabaseEditForm
 */
 //TODO handle internationalisation issues
class DatabaseEditFormComponent extends React.Component {

    componentDidMount() {
        const biodbcoreId = this.props.params.biodbcoreId, { storeDatabase, storeTags, handleError } = this.props;
        Promise.all([
            databaseApi.getDatabase(biodbcoreId),
            databaseApi.getTags()
        ])
        .then(values => {
            storeDatabase(values.database);
            storeTags(values.tags);
        })
        .catch(err => {
            handleError(err);
        });
    }

    render() {

        if (this.props.error) {
            return (
                <div className="bs-entity-error">
                    {'An unexpected error occurred while retrieving the graph. Sorry for the inconvenience.' }
                </div>
            );
        }

        const { handleSubmit, pristine, reset, submitting, tags = {} } = this.props;

        return (
            <div className='bs-edit'>
                <h3> Edit <b>{this.props.params.biodbcoreId}</b></h3>
                <div className='bs-entity-form-cnt'>
                    <div className='container'>
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
                            <Row>
                                <MultiSelect field={_.omit(fields.countries, ['helpText', 'label', 'size'])} helpText={fields.countries.helpText}
                                    label={fields.countries.label} size={fields.countries.size} options={tags.countries}/>
                            </Row>
                            <Row>
                                <MultiSelect field={_.omit(fields.taxonomies, ['helpText', 'label', 'size'])} helpText={fields.taxonomies.helpText}
                                    label={fields.taxonomies.label} size={fields.taxonomies.size} options={tags.taxonomies} />
                            </Row>
                            <Row>
                                <MultiSelect field={_.omit(fields.domains, ['helpText', 'label', 'size'])} helpText={fields.domains.helpText}
                                    label={fields.domains.label} size={fields.domains.size} options={tags.domains} />
                            </Row>
                        </form>
                    </div>
                </div>
        </div>);
    }

}

let DatabaseEditForm = reduxForm({
    form: 'databaseEdit'
})(DatabaseEditFormComponent);

const mapStateToProps = function(store) {
    return {
        initialValues: store.databaseState.database,
        tags: store.databaseState.tags,
        isFetching: store.databaseState.isFetching,
        error: store.databaseState.error
    };
};

const mapDispatchToProps = function(dispatch) {
    return {

        storeDatabase: database => {
            dispatch(getDatabaseSuccess(database));
        },

        storeTags: tags => {
            dispatch(getTagsSuccess(tags));
        },

        handleError: err => {
            dispatch(getRemoteError(err));
        }

    };
};

DatabaseEditForm = connect(mapStateToProps, mapDispatchToProps)(DatabaseEditForm);

export default DatabaseEditForm;