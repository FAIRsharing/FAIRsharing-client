import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './store-widget';
import CollectionWidgetContainer from './components/containers/collection-widget-container';

// import { uniqueId } from 'lodash';


let CollConfig = {
    host: 'https://biosharing.org'
};

export default {

    config: function(config) {
        CollConfig = config;
    },

    widgets: {

        collectionWidget: {

            new: config => {

                // const id = uniqueId('collection_widget_');

                return {

                    /**
                     * @method
                     * @name render
                     * @param{Object} args
                     */
                    render: (args = {}) => {

                        const component = <CollectionWidgetContainer collectionId={ args.id || config.id || CollConfig.id }
                            apiKey={ args.apiKey || config.apiKey || CollConfig.apiKey }
                            host={ args.host || config.host || CollConfig.host}
                            tableStyle={ args.tableStyle || config.tableStyle || null }
                            graphStyle={ args.graphStyle || config.graphStyle || null }
                        />;

                        ReactDOM.render(
                            <Provider store={store}>{component}</Provider>,
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
