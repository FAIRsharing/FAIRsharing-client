/**
 * Created by milo on 15/09/2017.
 * @author milo
 * @author massi
 */
import Vue from 'vue';
import axios from 'axios';
import * as d3 from 'd3';
import * as venn from 'venn.js';

const recordComparison = new Vue({
    delimiters: ['[[', ']]'],
    el: '#comparison-area',
    data: {
        thisRecord: null,
        otherRecord: null,
        otherId: null,
        apiKey: null,
        thisCollectionId: null,
        recordIds: {},
        chart: venn.VennDiagram()
    },
    methods: {
        getOther: function () {
            const self = this;
            axios.get('/api/collection/' + self.otherId, {
                headers: {
                    'Api-Key': self.apiKey,
                    'Content-type': 'application/json'
                }
            })
            .then(function (response) {
                self.otherRecord = response.data;
                self.storeIds(response.data);
                self.elementVis('show-graph-button','show');
                self.elementVis('top-spinner','hide');
            })
            .catch(function (error) {
                console.log('Error fetching otherCollection: ' + error);
            })
        },
        storeIds: function (json) {
            const self = this;
            const rtypes = ['standards', 'policies', 'databases'];
            rtypes.forEach(function (rt) {
                json[rt].forEach(function (x) {
                    self.recordIds[x.name] = x.bsg_id;
                });
            });
        },
        clear: function () {
            const self = this;
            self.otherRecord = null;
            self.otherId = null;
        },
        fieldDifferences: function (field) {
            const self = this;
            const thisone = self.thisRecord[field];
            const otherone = self.otherRecord[field];
            const thisonly = thisone.filter(x => otherone.indexOf(x) === -1),
                otheronly = otherone.filter(x => thisone.indexOf(x) === -1),
                both = thisone.filter(x => otherone.includes(x));
            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            }

        },
        objectDifferences: function (field) {
            const self = this;
            const thisone = self.thisRecord[field].map(x => x.name);
            const otherone = self.otherRecord[field].map(x => x.name);
            const thisonly = thisone.filter(x => otherone.indexOf(x) === -1),
                otheronly = otherone.filter(x => thisone.indexOf(x) === -1),
                both = thisone.filter(x => otherone.includes(x));
            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            };
        },
        plotGraphs: function () {
            const self = this;
            const plots = [];
            ['taxonomy', 'domains', 'standards', 'databases', 'policies'].forEach(function (item) {
                const data = self.getGraphData(item);
                let s = data[0].size;
                let o = data[1].size;
                let b = data[2].size;
                if (s === 0 || o === 0) { // at least one has some tags...
                    return;
                }
                if ((s === b) && (o === b)) {// ...but not fully overlapping
                    return;
                }
                self.elementVis(item + '_venn', 'show');
                const div = d3.select('#' + item + '_plot');
                div.datum(data).call(self.chart);
                plots.push(div);
            })

            const tooltip = d3.select('body').append('div').attr('class', 'tooltip venntooltip');
            plots.forEach(function (div) {
                // add listeners to all the groups to display tooltip on mouseover
                div.selectAll('g')
                    .on('mouseover', function (d, i) {
                        // sort all the areas relative to the current item
                        venn.sortAreas(div, d);

                        // Display a tooltip with the current size
                        tooltip.transition().duration(400).style('opacity', .9);
                        let note = ' records';
                        if (d.size == 1) {
                            note = ' record';
                        }
                        tooltip.text(d.size + note);

                        // highlight the current path
                        const selection = d3.select(this).transition('tooltip').duration(400);
                        selection.select('path')
                            .style('stroke', '#FFFFFF')
                            .style('stroke-width', 5)
                            .style('fill-opacity', d.sets.length == 1 ? .6 : .4)
                            .style('stroke-opacity', 1);
                    })

                    .on('mousemove', function () {
                        tooltip.style('left', (d3.event.pageX) + 'px')
                            .style('top', (d3.event.pageY - 28) + 'px');
                    })

                    .on('mouseout', function (d, i) {
                        tooltip.transition().duration(400).style('opacity', 0);
                        const selection = d3.select(this).transition('tooltip').duration(400);
                        selection.select('path')
                            .style('fill-opacity', d.sets.length == 1 ? .25 : .0)
                            .style('stroke-opacity', 0);
                    });
            });
            self.elementVis('show-graph-button','hide');
            self.elementVis('hide-graph-button','show');
        },
        getGraphData: function (field) {
            const self = this;
            const one = self[field]['current'].length + self[field]['both'].length; // total in first record
            const two = self[field]['other'].length + self[field]['both'].length; // total in second
            const three = self[field]['both'].length; // intersection
            return [
                {sets: [self.thisRecord.name], size: one},
                {sets: [self.otherRecord.name], size: two},
                {sets: [self.thisRecord.name, self.otherRecord.name], size: three}
            ];
        },
        hideGraphs: function () {
            const self = this;
            // These buttons may not be visible initially.
            self.elementVis('show-graph-button','show');
            self.elementVis('hide-graph-button','hide');
            // hide each individual graph
            ['taxonomy', 'domains', 'standards', 'databases', 'policies'].forEach(function (item) {
                self.elementVis(item + '_venn','hide');
            })
        },
        searchLink: function (url, item) {
            const self = this;
            if (url.includes('taxonomies') || url.includes('domains')) {
                return '/search?q=&selected_facets=' + url + ':' + item;
            } else {
                return '/' + self.recordIds[item];
            }
        },
        openComparison: function () {
            const self = this;
            const bsg_id = document.getElementById('collection-comparison').value.split(':')[0].trim();
            if (bsg_id) {
                self.elementVis('comparison-well','show');
                const regex = /bsg-c\d{6}/g;
                if (bsg_id.match(regex)) {
                    self.otherId = bsg_id;
                } else {
                    self.otherRecord = null;
                }
            } else {
                alert('Please select a collection/recommendation with which to make a comparison');
            }
            self.hideGraphs();
            self.elementVis('top-spinner','show');
        },
        closeComparison: function () {
            self.elementVis('comparison-well','hide');
        },
        elementVis: function(name, type) {
            let element = document.getElementById(name);
            try {
                if (undefined === typeof element) {
                    //console.log('Failure when trying to '' + type + '' '' + name + '' (is undefined).');
                    return false;
                } else if (null === element) {
                    //console.log('Failure when trying to '' + type + '' '' + name + '' (is null).');
                    return false;
                } else {
                    if (type === 'show') {
                        element.classList.remove('hidden');
                    } else if (type === 'hide') {
                        element.classList.add('hidden');
                    } else {
                        console.log('Don\'t know how to \'' + type + '\' an element.');
                    }
                }
            } catch (err) {
                console.log('Error: ' + err);
                console.log(`Total fail when trying to '${type}' name.`);
            }

        }
    },
    watch: {
        otherId: function() {
            const self = this;
            console.log(`Other ID has changed: ${self.otherId}`);
            self.elementVis('hide-graph-button','hide');
            self.getOther();
        }
    },
    computed: {
        validResults: function() {
            const self = this;
            if (self.thisRecord && self.otherRecord) {
                return true;
            }
            return false;
        },
        selfComparison: function() {
            const self = this;
            if (self.thisRecord.bsg_id == self.otherRecord.bsg_id) {
                return true;
            }
            return false;
        },
        taxonomy: function() {
            const self = this;
            return self.fieldDifferences('taxonomies');
        },
        domains: function() {
            const self = this;
            return self.fieldDifferences('domains');
        },
        standards: function() {
            const self = this;
            return self.objectDifferences('standards');
        },
        databases: function() {
            const self = this;
            return self.objectDifferences('databases');
        },
        policies: function() {
            const self = this;
            return self.objectDifferences('policies');
        }
    },
    mounted: function() {
        const self = this;
        console.log('mounted');
        self.apiKey = document.getElementById('api-key').content;
        self.thisCollectionId = document.getElementById('view-id').content;

        /*
         * Get contents for the collection dropdown.
         */

        axios.get('/content/collections/')
            .then(function(response) {
                document.getElementById('collection-comparison').innerHTML = '';
                $.each(response['data'].sort(), function (key, val) {
                    const id = val.split(':')[0].trim();
                    if (id === self.thisCollectionId) {
                        return;
                    }
                    const option = document.createElement('option');
                    option.text = val;
                    option.value = val;
                    document.getElementById('collection-comparison').append(option);
                });
            })
            .catch(function(error) {
                console.log('Error fetching collections: ' + error);
            });

        /*
         * Get data for the current record via the API.
         */

        if (!self.thisRecord) {
            axios.get('/api/collection/' + self.thisCollectionId, {
                headers: {
                    'Api-Key': self.apiKey,
                    'Content-type': 'application/json'
                }
            })
            .then(function(response) {
                self.thisRecord = response['data'];
                self.storeIds(response['data']);
            })
            .catch(function(error) {
                console.log('Error fetching thisCollection: ' + error);
            });
        }
    }

});

Vue.component('comparison', {
    props: ['current', 'other', 'both', 'title', 'tagtype', 'count', 'id', 'href', 'link'],
    template: `<div v-bind:id='id' class='alert alert-primary' style='margin: 5px;'>
        <p><b>{{ title }}:</b></p>
        <p>{{ recordComparison.thisRecord['name'] }} only ({{ current.length }}):</p>
        <p>
            <ul class='bio-tags btsmall'>
                <li v-bind:class=\"tagtype\" v-for='item in current'>
                    <a :href=\"recordComparison.searchLink(link, item)\" target='_blank'>
                        <span class='bio-icon-tag' style='padding-right: 5px'></span>
                        {{ item }}
                    </a>
                </li>
            </ul>
            <div class='clearfix'></div>
        </p>
        <p><a v-bind:href=\"href\" target='_blank'>{{ recordComparison.otherRecord['name'] }}</a>
        only ({{ other.length }}):</p>
        <p>
            <ul class='bio-tags btsmall'>
                <li v-bind:class=\"tagtype\" v-for='item in other'>
                    <a v-bind:href=\"recordComparison.searchLink(link, item)\" target='_blank'>
                        <span class='bio-icon-tag' style='padding-right: 5px'></span>
                        {{ item }}
                    </a>
                </li>
            </ul>
            <div class='clearfix'></div>
        </p>
        <p>Shared ({{ both.length }})</span>:</p>
        <p>
            <ul class='bio-tags btsmall'>
                <li v-bind:class=\"tagtype\" v-for='item in both'>
                    <a :href=\"recordComparison.searchLink(link, item)\" target='_blank'>
                        <span class='bio-icon-tag' style='padding-right: 5px'></span>
                        {{ item }}
                    </a>
                </li>
            </ul>
            <div class='clearfix'></div>
        </p>
    </div>
    <div class='clearfix'></div>`

});

export default recordComparison;
