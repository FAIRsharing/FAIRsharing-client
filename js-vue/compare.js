import Vue from 'vue';
import vSelect from 'vue-select';
import ComparisonApp from './components/ComparisonArea.vue';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { sortByPropertyAlt as sortByProperty } from '../js/utils/helper-funcs';

Vue.component('vSelect', vSelect);

const CollectionCompareMain = {

    el: '#collectionsCompareMain',

    components: {
        vSelect: vSelect
    },

    render(createElement) {
        return createElement(ComparisonApp, {
            props: {
                collections: this.collections,
                thisRecord: this.currentCollection,
                apiKey: this.apiKey
            }
        });
    },

    data() {
        return {
            collections: [],
            currentCollection: {},
            currentCollectionId: null,
            apiKey: null
        };
    },

    methods: {

        /* TODO: error handling */
        async getCollections() {
            /* Get contents for the collection dropdown. */
            let response = await axios.get('/api/collection/summary/', {
                headers: {
                    'Api-Key': this.apiKey,
                    'Content-type': 'application/json'
                }
            });
            const collections = response.data && response.data.results && response.data.results.sort();
            // Remove currentCollectionId from the dropdown to prevent self-matching
            const localmatch = this.currentCollectionId;
            this.collections = collections.map(coll => {
                if (coll.bsg_id !== localmatch ) {
                    return {
                        label: coll.name,
                        bsgId: coll.bsg_id,
                        pk: coll.pk
                    }
                }
                return {};
            }).sort((a, b) => sortByProperty(a, b, 'label'));
            /* Get data for the current record via the API. */
            if (isEmpty(this.currentCollection)) {
                response = await axios.get(`/api/collection/${this.currentCollectionId}`, {
                    headers: {
                        'Api-Key': this.apiKey,
                        'Content-type': 'application/json'
                    }
                });
                const currentCollection = response.data;
                this.currentCollection = currentCollection;
            }
        }

    },

    mounted() {
        this.apiKey = document.getElementById('api-key').content;
        this.currentCollectionId = document.getElementById('view-id').content;
        this.getCollections();
    }

};

new Vue(CollectionCompareMain);

export default CollectionCompareMain;
