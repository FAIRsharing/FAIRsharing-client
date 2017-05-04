import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import graphReducer from './reducers/graph-reducer';
import CollectionWidgetContainer from './components/containers/collection-widget-container';

// import { uniqueId } from 'lodash';


let CollConfig = {
    host: 'http://localhost:8000'
};

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
                    render: (args = {}) => {

                        const store = createStore(graphReducer),
                            component = <CollectionWidgetContainer collectionId={args.id || config.id || CollConfig.id }
                            apiKey={args.apiKey || config.apiKey || CollConfig.apiKey }
                            host={args.host || config.host || CollConfig.host}
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
