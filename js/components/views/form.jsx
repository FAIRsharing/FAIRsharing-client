import 'react-select/scss/default.scss';
import classnames from 'classnames';
import { isArray } from 'lodash';
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
 * @description a help component containing a brief description of what is this component for:
 *              The info appears in a tooltip
 */
export class Help extends React.Component {

    static propTypes = {
        text: React.PropTypes.string.isRequired
    }

    render() {
        const tooltip = <Tooltip>{this.props.text}</Tooltip>;
        return (<OverlayTrigger overlay={tooltip} delayShow={300} delayHide={150}>
            {/*<Glyphicon className="Help" glyph="question-sign"/> */}
            <FontAwesome name="question-circle" />
        </OverlayTrigger>);
    }
}

/**
 * @class
 * @name FormField
 * @description A form field in Bootstrap 3
 */
export class FormField extends React.Component {

    static shouldFormFieldUpdate = shouldFormFieldUpdate

    static propTypes = {
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

    }

    static defaultProps = {
        size: 6
    }

    render() {
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

}

/**
 * @class
 * @name TextInput
 * @description a text input form field
 */
export class TextInput extends React.Component {

    static propTypes = {
        field: PropTypes.object.isRequired
    }

    //shouldComponentUpdate: FormField.shouldFormFieldUpdate,

    render() {
        const { field, helpText, label, size, onChange, ...inputProps } = this.props;

        return (<FormField field={field} helpText={helpText} inputProps={inputProps} label={label} size={size} >
            <Field component="input" type="text" {...inputProps } className="form-control"
                name={field.name} onBlur={field.onBlur} onChange={onChange && field.onChange}/>
        </FormField>);
    }

}

/**
 * @class
 * @name Textarea
 * @description a textarea input form field
 */
export class Textarea extends React.Component {

    static propTypes = {
        field: PropTypes.object.isRequired
    }

    //shouldComponentUpdate: FormField.shouldFormFieldUpdate,

    render() {
        const { field, helpText, label, size, onChange, ...inputProps } = this.props;

        return (<FormField field={field} helpText={helpText} inputProps={inputProps} label={label} size={size}>
            <Field component="textarea" {...inputProps } className="form-control" name={field.name}
                onBlur={field.onBlur} onChange={onChange && field.onChange}/>
        </FormField>);

    }

}

/**
 * @class
 * @name Select
 * @description a standard single option select box wrapper for react-redux
 */
export class Select extends React.Component {

    static propTypes = {
        field: PropTypes.object.isRequired
    }

    //shouldComponentUpdate: FormField.shouldFormFieldUpdate,

    render() {
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

}

/**
 * @class
 * @name ReactMultiSelectComponent
 * @description a wrapper component for the react-select library to be used within redux-form
 */
export class ReactMultiSelectComponent extends React.Component {

    render() {
        const { input: { value, onChange, onBlur }, options, creatable } = this.props;
        const optsArray = isArray(options) ? options.map(option => {
            return { value: option.value || option, label: option.label || option};
        }) : null;
        const selectProps = {
            value: value,
            options: optsArray,
            onChange: onChange,
            onBlur: () => onBlur(value)
        };
        return creatable ? (<ReactSelect.Creatable multi {...selectProps} />)
            : (<ReactSelect multi {...selectProps} />);
    }

}

/**
 * @class
 * @name ReactSelectAsyncComponent
 * @description a wrapper component for the async react-select to be used within redux-form
 */
export class ReactSelectAsyncComponent extends React.Component {

    constructor(props) {
        super(props);
        this.loadOptions = this.loadOptions.bind(this);
    }

    loadOptions(str) {
        const { options, getOptions, entityId } = this.props;
        const optsArray = isArray(options) ? options.map(option => {
            return {
                value: option.value || option[entityId] || option,
                label: option.label || option.name || option
            };
        }) : null;
        if (!str) {
            return optsArray;
        }
        return getOptions(str).then(retrievedOpts => {
            const res = retrievedOpts.concat(optsArray);
            return res;
        });
    }

    render() {
        const { input: { value, onChange, onBlur }, creatable, getOptions, entityId } = this.props;
        const formattedValue = isArray(value) ? value.map(elem => {
            return {
                value: elem[entityId] || elem,
                label: elem.name || elem
            };
        }) : null;
        const selectProps = {
            value: formattedValue,
            loadOptions: this.loadOptions,
            onChange: onChange,
            onBlur: () => onBlur(value)
        };
        return creatable ? <ReactSelect.CreatableAsync multi {...selectProps} />
            : <ReactSelect.Async multi {...selectProps} />;
    }

 }

/**
 * @class
 * @name MultiSelect
 * @description a multi-select for redux-form based on the ReactMultiSelectComponent
 */
export class MultiSelect extends React.Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        field: PropTypes.object.isRequired
    }

    render() {
        const { field, helpText, label, size, onChange, async, ...selectProps } = this.props;
        const ComponentClass = async ? ReactSelectAsyncComponent : ReactMultiSelectComponent;

        return(<FormField field={field} helpText={helpText} inputProps={selectProps} label={label} size={size}>
            <Field component={ComponentClass} {...selectProps} className="form-control" name={field.name} />
        </FormField>);

    }

}

/**
 *
/**
 *
 *
 export class Autocomplete extends React.Component {

     onSuggestionsFetchRequested = ({ value }) => {

     }

     render() {

     }

 } */
