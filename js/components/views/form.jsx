import classnames from 'classnames';
import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Col, Row, OverlayTrigger, Glyphicon, Tooltip } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import { Field } from 'redux-form';
import ReactSelect from 'react-select';

const FIELD_EVENT_HANDLER = /^(?:on|handle)[A-Z]/;

/**
 * @method
 * @name fieldShallowEquals
 * @param{Object} field
 * @param{Object} nextField
 * @return{boolean}
 * Perform shallow equals comparison of two redux-form field objects to
 * determine if the field has changed.
 */
function fieldShallowEquals(field, nextField) {
    for (const prop in field) {
        // Ignore event handlers, as they continually get recreated by redux-form
        if (!FIELD_EVENT_HANDLER.test(prop) && field[prop] !== nextField[prop]) {
            return false;
        }
    }
    return true;
}

 /**
 * @method
 * @name shouldFormFieldUpdate
 * @param{Object} nextProps
 * @return{boolean}
 * Perform shallow equals comparison to determine if the props of the context
 * form field component have changed, with special-case handling for the "field"
 * prop, provided by redux-form.
 * Use this as shouldComponentUpdate() on components which compose a
 * FormField in their render() method and they will only re-render when
 * necessary.
 */
function shouldFormFieldUpdate(nextProps) {
    const keys = Object.keys(this.props), nextKeys = Object.keys(nextProps);
    if (keys.length !== nextKeys.length)
        return true;
    const nextHasOwnProperty = Object.prototype.hasOwnProperty.bind(nextProps);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!nextHasOwnProperty(key) || key === 'field' ? !fieldShallowEquals(this.props[key], nextProps[key])
            : this.props[key] !== nextProps[key])
        {
            return true;
        }
    }
    return false;
}

/**
 * @class
 * @name Help
 */
export const Help = React.createClass({

    propTypes: {
        text: React.PropTypes.string.isRequired
    },

    render: function() {
        const tooltip = <Tooltip>{this.props.text}</Tooltip>;
        return (<OverlayTrigger overlay={tooltip} delayShow={300} delayHide={150}>
            {/*<Glyphicon className="Help" glyph="question-sign"/> */}
            <FontAwesome name="question-circle" />
        </OverlayTrigger>);
    }
});

/**
 * A form field in Bootstrap 3
 */
export const FormField = React.createClass({

    statics: {
        shouldFormFieldUpdate: shouldFormFieldUpdate
    },

    propTypes: {
        // A redux-form field Object
        field: PropTypes.object,
        // Help text to be displayed next to the input containers
        helpText: PropTypes.string,
        // an additional class to be applied to the input containers
        inputClass: PropTypes.string,
        // props to be used for the input (id is used to link the label to the input)
        inputProps: PropTypes.object,
        // label text
        label: PropTypes.string,
        // loading state
        loading: PropTypes.bool,
        // if the form field size (a third, half or the full row)
        size: PropTypes.oneOf([6, 12])

    },

    getDefaultProps: function() {
        return {
            size: 6
        };
    },

    render: function() {
        const { field, helpText, inputClass, inputProps, label, loading, size } = this.props;

        // TODO ?? understand this
        const error = field.touched && field.error;

        return (<Col sm={size}>
            <Row className={classnames('form-group', {'has-error': error})}>
                <Col sm={ size === 6 ? 4 : 2} className='control-label'>
                    <label className="bs-form-label" htmlFor={inputProps.id}>{label}</label>
                    { helpText && <Help text={helpText} />}
                </Col>
                <Col sm={ size === 6 ? 8 : 10} className={inputClass} >
                    {this.props.children}
                    { error && <p className='help-block' style={{marginBottom: 0}}>{error}</p> }
                </Col>
            </Row>
        </Col>);

    }

});

/**
 * @class
 * @name TextInput
 * @description a text input form field
 */
export const TextInput = React.createClass({

    propTypes: {
        field: PropTypes.object.isRequired
    },

    shouldComponentUpdate: FormField.shouldFormFieldUpdate,

    render: function() {
        const { field, helpText, label, size, onChange, ...inputProps } = this.props;

        return (<FormField field={field} helpText={helpText} inputProps={inputProps} label={label} size={size} >
            <Field component="input" type="text" {...inputProps } className="form-control"
                name={field.name} onBlur={field.onBlur} onChange={onChange && field.onChange}/>
        </FormField>);
    }

});

/**
 * @class
 * @name Textarea
 * @description a textarea input form field
 */
export const Textarea = React.createClass({

    propTypes: {
        field: PropTypes.object.isRequired
    },

    shouldComponentUpdate: FormField.shouldFormFieldUpdate,

    render: function() {
        const { field, helpText, label, size, onChange, ...inputProps } = this.props;

        return (<FormField field={field} helpText={helpText} inputProps={inputProps} label={label} size={size}>
            <Field component="textarea" {...inputProps } className="form-control" name={field.name}
                onBlur={field.onBlur} onChange={onChange && field.onChange}/>
        </FormField>);

    }

});

export const Select = React.createClass({

    propTypes: {
        field: PropTypes.object.isRequired
    },

    shouldComponentUpdate: FormField.shouldFormFieldUpdate,

    render: function() {
        const { field, helpText, label, size, onChange, options, ...selectProps } = this.props;
        const optsArray = [];

        for (const opt of options) {
            optsArray.push(<option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
            </option>);
        }

        return (<FormField field={field} helpText={helpText} inputProps={selectProps} label={label} size={size}>
            <Field component="select" {...selectProps } className="form-control" name={field.name}
                onBlur={field.onBlur} onChange={onChange && field.onChange}>
                {optsArray}
            </Field>
        </FormField>);


    }

});

/**
 * @class
 * @name ReactMultiSelectComponent
 * @description a wrapper component for the react-select library to be used within redux-form
 */
export class ReactMultiSelectComponent extends React.Component {

    render() {
        const { input: { value, onChange } } = this.props;
        const optsArray = _.isArray(value) ? value.map(option => {
            return { value: option.value || option, label: option.label || option};
        }) : null;
        return (<ReactSelect multi value={value} options={optsArray} />);
    }

}

export class MultiSelect extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { field, helpText, label, size, onChange, ...selectProps } = this.props;

        return(<FormField field={field} helpText={helpText} inputProps={selectProps} label={label} size={size}>
            <Field component={ReactMultiSelectComponent} {...selectProps} className="form-control" name={field.name} />
        </FormField>);

    }

}
