import React from 'react';
import ReactDOM from 'react-dom';
import CollectionWidgetContainer from './components/containers/collection-widget-container';

// import { uniqueId } from 'lodash';


let CollConfig = null;

export default {

    config: function(config) {
        CollConfig = config;
    },

    widgets: {

        singleViewWidget: {

            new: config => {

                // const id = uniqueId('collection_widget_');

                return {

                    /**
                     * @method
                     * @name render
                     * @param{Object} args
                     */
                    render: args => {

                        ReactDOM.render(
                            <CollectionWidgetContainer collectionId={args.id || config.id || CollConfig.id }
                                apiKey={args.apiKey || config.apiKey || CollConfig.apiKey }
                            />,
                            document.querySelector(config.selector)
                        );

                    },

                    /**
                     * @method
                     * @name unmount
                     */
                    unmount: () => {
                        ReactDOM.unmountComponentAtNode(document.querySelector(config.selector));
                    }

                };

            }

        }

    }

};
