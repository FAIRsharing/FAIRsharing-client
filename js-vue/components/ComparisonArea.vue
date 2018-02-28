<template>
    <div class="vue-root">
        <div id='collection-comparison-selector-cnt'>
            <button id='collection-comparison-btn' class="btn btn-orange btn-cspecial" style="color: white;" v-on:click="openComparison"> Compare with collection/recommendation (Beta)</button>
            <v-select id='collection-comparison-selector' placeholder='Please select a Collection or Recommendation' :options="collections"
                    :on-change="onSelectOtherCollection"></v-select>
            <img src="/static/img/three-dots.svg" id="top-spinner" class="hidden">
        </div>




        <div class="row">
            <div class="well col-md-12 hidden animated" id="comparison-well" style="margin:0 auto;">

                <div v-if="validResults">
                    <div v-if="selfComparison" class="alert alert-error col-md-12" style='margin: 5px;'>
                        <p>You are currently comparing a collection/recommendation with itself.</p>
                    </div>
                    <div v-else>
                        <p>Comparison of <b>{{ thisRecord.name }}</b> ({{ thisRecord.bsg_id }}) with
                        <b>{{ otherRecord.name }}</b> ({{ otherRecord.bsg_id }}):</p>
                        <p style="font-size: smaller;">
                            Clicking on a database, policy or standard name will take you to the record for that
                            resource. Clicking on a domain or species tag will take you to a list of resources
                            annotated with that tag.
                        </p>

                        <!-- taxonomies -->
                        <div class="row container col-md-12">
                            <div class="comparison-div">
                                <comparison tagtype="bio-tag taxonomy" title="Taxonomies"
                                            id="taxonomy_comparison"  link="taxonomies_exact"
                                            :href="otherRecord.bsg_id"
                                            :currentName="thisRecord.name"
                                            :otherName="otherRecord.name"
                                            :current="taxonomy.current"
                                            :other="taxonomy.other"
                                            :both="taxonomy.both"
                                            :recordIds="recordIds">
                                </comparison>
                            </div>
                            <div id='taxonomy_venn' class='alert alert-primary hidden animated' style='margin: 5px;'>
                                <div id="taxonomy_plot"></div>
                            </div>
                            <div class='clearfix'></div>

                            <!-- domains -->
                            <div class="comparison-div">
                                <comparison tagtype="bio-tag domain" title="Domains"
                                            id="domain_comparison" link="domains_exact"
                                            :href="otherRecord.bsg_id"
                                            :currentName="thisRecord.name"
                                            :otherName="otherRecord.name"
                                            :current="domains.current"
                                            :other="domains.other"
                                            :both="domains.both"
                                            :recordIds="recordIds">
                                </comparison>
                                <div id='domains_venn' class='alert alert-primary hidden animated' style='margin: 5px;'>
                                    <div id="domains_plot"></div>
                                </div>
                            </div>
                            <div class='clearfix'></div>

                            <!-- related standards -->
                            <div class="comparison-div">
                                <comparison tagtype="bio-tag standard" title="Standards"
                                            id="standard_comparison" link="standards_exact"
                                            :href="otherRecord.bsg_id"
                                            :currentName="thisRecord.name"
                                            :otherName="otherRecord.name"
                                            :current="standards.current"
                                            :other="standards.other"
                                            :both="standards.both"
                                            :recordIds="recordIds">
                                </comparison>
                                <div id='standards_venn' class='alert alert-primary hidden animated' style='margin: 5px;'>
                                    <div id="standards_plot"></div>
                                </div>
                            </div>
                            <div class='clearfix'></div>

                            <!-- related databases -->
                            <div class="comparison-div">
                                <comparison tagtype="bio-tag database" title="Databases"
                                            id="database_comparison" link="databases_exact"
                                            :href="otherRecord.bsg_id"
                                            :currentName="thisRecord.name"
                                            :otherName="otherRecord.name"
                                            :current="databases.current"
                                            :other="databases.other"
                                            :both="databases.both"
                                            :recordIds="recordIds">
                                </comparison>
                                <div id='databases_venn' class='alert alert-primary hidden animated' style='margin: 5px;'>
                                    <div id="databases_plot"></div>
                                </div>
                            </div>
                            <div class='clearfix'></div>

                            <!-- policies -->
                            <div class="comparison-div">
                                <comparison tagtype="bio-tag policy" title="Policies"
                                            id="policy_comparison" link="policies_exact"
                                            :href="otherRecord.bsg_id"
                                            :currentName="thisRecord.name"
                                            :otherName="otherRecord.name"
                                            :current="policies.current"
                                            :other="policies.other"
                                            :both="policies.both"
                                            :recordIds="recordIds">
                                </comparison>
                                <div id='policies_venn' class='alert alert-primary hidden animated' style='margin: 5px;'>
                                    <div id="policies_plot"></div>
                                </div>
                            </div>
                            <div class='clearfix'></div>

                        </div>
                    </div>

                </div>
                <div v-else>
                    <div style="margin: 5px;">
                    <img src="/static/img/three-dots.svg"
                         width="50px">
                    </div>
                </div>
                <button class="btn btn-danger" v-on:click="closeComparison">Close</button>
                <button class="btn btn-success hidden" v-on:click="plotGraphs"
                     id="show-graph-button" style="margin-left: 5px;">Show Plots</button>
                <button class="btn btn-success hidden" v-on:click="hideGraphs"
                     id="hide-graph-button" style="margin-left: 5px;">Hide Plots</button>
            </div>
        </div>

        <br/>

        <div class="row">
            <div id='collection-stats'>
                <div class="well col-md-12 animated">
                    <h4>General collection/recommendation statistics:</h4>
                    <div v-if="ownRecord">
                        <p>Stats for <b>{{ thisRecord.name }}</b> ({{ thisRecord.bsg_id }}):</p>
                        <p>
                            <button class="btn btn-success" v-on:click="showGeneralStats" id="show_stats">
                                Show Stats
                            </button>
                            <button class="btn btn-danger hidden" v-on:click="hideGeneralStats" id="hide_stats">
                                Hide Stats
                            </button>
                        </p>
                        <div class="container hidden" id="stats_container">

                            <div class="row">
                                <div  class="col-sm-6">
                                    <label>General Statistics</label>
                                    <div id="general_stats_plot"></div>
                                </div>
                                <div class="col-sm-6">
                                    <label>Standard Types</label>
                                    <div id="standard_types_plot"></div>
                                </div>
                                <br/>
                            </div>


                            <div class="row">
                                <div  class="col-sm-6">
                                    <label>Taxonomies (top ten)</label>
                                    <div id="stats_taxonomy_plot"></div>
                                </div>
                                <div  class="col-sm-6">
                                    <label>Domains (top ten)</label>
                                    <div id="stats_domains_plot"></div>
                                </div>
                                <br/>
                            </div>


                            <div class="row">
                                <div class="col-sm-6">
                                    <label>Database Standards Support (top ten)</label>
                                    <div id="formats_supported_plot"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div v-else>
                        <p><img src="/static/img/three-dots.svg" id="stats-spinner"></p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<script>
import RecordComparison from './RecordComparison.vue';
import * as venn from 'venn.js';
import axios from 'axios';
import * as d3 from 'd3';
import c3 from 'c3';
import { isEmpty, toPairs, sortBy, fromPairs } from 'lodash';

const PROPERTIES_TO_COMPARE = ['taxonomy', 'domains', 'standards', 'databases', 'policies'];

// Vue.component('comparison', RecordComparison);

export default {


    // delimiters: ['[[', ']]'],

    components: {
        'comparison': RecordComparison
    },

    props: ['collections', 'apiKey', 'thisRecord'],

    data() {
        return {
            // thisRecord: null,
            otherRecord: null,
            selectedBsgId: null,
            // apiKey: null,
            // thisCollectionId: null,
            recordIds: {},
            chart: venn.VennDiagram(),
            loaded: false,
            height: 400
        };
    },

    methods: {

        /* TODO: error handling */
        async getOther() {
            const response = await axios.get(`/api/collection/${this.selectedBsgId}`, {
                headers: {
                    'Api-Key': this.apiKey,
                    'Content-type': 'application/json'
                }
            });
            this.otherRecord = response.data;
            this.storeIds(this.thisRecord);
            this.storeIds(this.otherRecord);
            this.elementVis('show-graph-button','show');
            this.elementVis('top-spinner','hide');
            this.elementVis('collection-comparison-selector','show');
        },

        onSelectOtherCollection(otherCollection) {
            this.selectedBsgId = otherCollection.bsgId;
        },

        storeIds(json) {
            const rTypes = ['standards', 'policies', 'databases'];
            for (const rType of rTypes) {
                for (const el of json[rType]) {
                    this.recordIds[el.name] = el.bsg_id;
                }
            }
        },

        clear() {
            this.otherRecord = null;
            this.selectedBsgId = null;
        },

        fieldDifferences(field) {
            if (this.otherRecord === null) {
                return {}
            }
            const thisone = this.thisRecord[field],
                otherone = this.otherRecord[field];

            const thisonly = thisone.filter(x => otherone.indexOf(x) === -1),
                otheronly = otherone.filter(x => thisone.indexOf(x) === -1),
                both = thisone.filter(x => otherone.includes(x));
            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            };

        },

        objectDifferences(field) {
            if (this.otherRecord === null) {
                return {}
            }
            var thisone, otherone;
            if (this.thisRecord.recommendation === true) {
                console.log(this.thisRecord.name + " is a recommendation");
                thisone = this.convertRecommendation(this.thisRecord, field);
            } else {
                console.log(this.thisRecord.name + " is a collection");
                thisone = this.thisRecord[field].map(x => x.name);
            }
            if (this.otherRecord.recommendation === true) {
                console.log(this.otherRecord.name + " is a recommendation");
                otherone = this.convertRecommendation(this.thisRecord, field);

            } else {
                console.log(this.otherRecord.name + " is a collection");
                otherone = this.otherRecord[field].map(x => x.name);
            }

            const thisonly = thisone.filter(x => otherone.indexOf(x) === -1),
                otheronly = otherone.filter(x => thisone.indexOf(x) === -1),
                both = thisone.filter(x => otherone.includes(x));

            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            };
        },

        convertRecommendation(record, field) {
            const self = this;
            var names = [];
            record.master_policies.forEach(function(policy) {
                policy[self.fieldConversion(field)].forEach(function(record){
                    if (names.indexOf(record.data.name) === -1) {
                        names.push(record.data.name);
                    }
                })
            });
            return names;

        },

        // convert a collection's data field name to that of a  policy
        fieldConversion(field) {
            const lookup = {
                'standards': 'std_implementation',
                'databases': 'db_implementation',
                'policies': 'related_policies',
            };
            return lookup[field];

        },

        plotGraphs() {

            const plots = [], that = this;
            for (const prop of PROPERTIES_TO_COMPARE) {
                console.log(`ComparisonArea.plotGraphs - current prop is: ${prop}`);
                const data = this.getGraphData(prop);
                let s = data[0].size;
                let o = data[1].size;
                let b = data[2].size;
                if (s === 0 || o === 0) { // at least one has some tags...
                    continue;
                }
                if ((s === b) && (o === b)) {// ...but not fully overlapping
                    continue;
                }
                this.elementVis(prop + '_venn', 'show');
                const div = d3.select('#' + prop + '_plot');
                div.datum(data).call(this.chart);
                plots.push(div);
            }

            const tooltip = d3.select('body').append('div').attr('class', 'tooltip venntooltip');
            for (const div of plots) {
                // add listeners to all the groups to display tooltip on mouseover
                console.log(`ComparisonArea.plotGraphs - currentling doing div: ${div}`);
                div.selectAll('g')
                    .on('mouseover', (d, i, nodes) => {
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
                        const selection = d3.select(nodes[i]).transition('tooltip').duration(400);
                        selection.select('path')
                            .style('stroke', '#FFFFFF')
                            .style('stroke-width', 5)
                            .style('fill-opacity', d.sets.length == 1 ? .6 : .4)
                            .style('stroke-opacity', 1);
                    })

                    .on('mousemove', () => {
                        tooltip.style('left', (d3.event.pageX) + 'px')
                            .style('top', (d3.event.pageY - 28) + 'px');
                    })

                    .on('mouseout', (d, i, nodes) => {
                        tooltip.transition().duration(400).style('opacity', 0);
                        const selection = d3.select(nodes[i]).transition('tooltip').duration(400);
                        selection.select('path')
                            .style('fill-opacity', d.sets.length == 1 ? .25 : .0)
                            .style('stroke-opacity', 0);
                    });
                console.log(`ComparisonArea.plotGraphs - currentling finished div: ${div}`);
            }
            this.elementVis('show-graph-button','hide');
            this.elementVis('hide-graph-button','show');
        },

        getGraphData(field) {
            const one = this[field]['current'].length + this[field]['both'].length; // total in first record
            const two = this[field]['other'].length + this[field]['both'].length; // total in second
            const three = this[field]['both'].length; // intersection
            return [
                {sets: [this.thisRecord.name], size: one},
                {sets: [this.otherRecord.name], size: two},
                {sets: [this.thisRecord.name, this.otherRecord.name], size: three}
            ];
        },

        hideGraphs() {
            // These buttons may not be visible initially.
            this.elementVis('show-graph-button','show');
            this.elementVis('hide-graph-button','hide');
            // hide each individual graph
            for (const item of PROPERTIES_TO_COMPARE) {
                this.elementVis(`${item}_venn`,'hide');
            }
        },

        openComparison() {
            if (this.selectedBsgId) {
                this.elementVis('comparison-well','show');
                /*
                const regex = /bsg-c\d{6}/g;
                if (!this.selectedBsgId.match(regex)) {
                    this.otherRecord = null;
                }
                */
            } else {
                alert('Please select a collection/recommendation with which to make a comparison');
                return;
            }
            this.hideGraphs();
            this.elementVis('top-spinner','show');
            this.elementVis('collection-comparison-selector','hide');
            this.elementVis('hide-graph-button','hide');
            this.getOther();
        },

        closeComparison() {
            this.elementVis('comparison-well','hide');
        },

        showGeneralStats() {
            this.elementVis('stats_container','show');
            this.elementVis('show_stats','hide');
            this.elementVis('hide_stats','show');
            // TODO: Perhaps only run this on first show...
            if (!this.loaded) {
                console.log('Generating stats...');
                this.generalStats();
                this.loaded = true;
            } else {
                console.log('Stats already generated!');
            }
        },

        hideGeneralStats() {
            this.elementVis('stats_container','hide');
            this.elementVis('show_stats','show');
            this.elementVis('hide_stats','hide');
        },

        elementVis(name, type) {
            let element = document.getElementById(name);
            try {
                if (typeof element === undefined) {
                    //console.log('Failure when trying to '' + type + '' '' + name + '' (is undefined).');
                    return false;
                }
                if (element == null) {
                    //console.log('Failure when trying to '' + type + '' '' + name + '' (is null).');
                    return false;
                }
                if (type === 'show') {
                    element.classList.remove('hidden');
                } else if (type === 'hide') {
                    element.classList.add('hidden');
                } else {
                    console.log(`Don't know how to '${type}' an element.`);
                }
            } catch (err) {
                console.log(`Error: ${err}`);
                console.log(`Total fail when trying to '${type}' name.`);
            }
        },

        generalStats() {
            const recommendation = this.thisRecord.recommendation;
            var std_count, db_count, pol_count;
            // Total count of all three record types
            if (recommendation === true) {
                std_count = this.convertRecommendation(this.thisRecord, 'standards').length;
                db_count = this.convertRecommendation(this.thisRecord, 'databases').length;
                pol_count = this.convertRecommendation(this.thisRecord, 'policies').length;

            } else {
                std_count = this.thisRecord.standards.length;
                db_count = this.thisRecord.databases.length;
                pol_count = this.thisRecord.policies.length;
            }

            // Proportion of standards, policies, databases pie chart
            var chart_1 = c3.generate({
                bindto: "#general_stats_plot",
                data: {
                    columns: [
                        ['Standards', std_count],
                        ['Policies', pol_count],
                        ['Databases', db_count],
                    ],
                    type: 'pie',
                },
                size: {
                    height: this.height
                }
            });


            // Count of standards by type:
            /*
             * model/format
             * reporting guideline
             * terminology artifact
             * other
             */
            var std_model, std_report, std_term, std_other;
            var this_standards, this_databases, this_policies;
            var this_database_names = [];
            var this_standard_names = [];
            var this_policy_names = [];

            // Later, tags from standards, databases and policies are needed for plotting the first two bar charts.
            // This is a preparation for that step.
            if (recommendation === true) {
                this_standards = [];
                this_databases = [];
                this_policies = [];
            } else {
                this_standards = this.thisRecord.standards;
                this_databases = this.thisRecord.databases;
                this_policies = this.thisRecord.policies;
            }



            /*
             * At this point some conversions are done which are used for later graphs, as it is convenient to get
             * them all out of the way whilst looping through to sort out standards.
             */
            if (recommendation === true) {
                var self = this;
                this.thisRecord.master_policies.forEach(function(policy) {
                    policy[self.fieldConversion('standards')].forEach(function(record){
                        if (this_standard_names.indexOf(record.data.name) === -1) {
                            this_standard_names.push(record.data.name);
                            this_standards.push(record.data);
                        }
                    });
                    policy[self.fieldConversion('databases')].forEach(function(record){
                        if (this_database_names.indexOf(record.data.name) === -1) {
                            this_database_names.push(record.data.name);
                            this_databases.push(record.data);
                        }
                    });
                    policy[self.fieldConversion('policies')].forEach(function(record){
                        if (this_policy_names.indexOf(record.data.name) === -1) {
                            this_policy_names.push(record.data.name);
                            this_policies.push(record.data);
                        }
                    });
                });
                std_model = this_standards.filter(x => x.type == 'model/format');
                std_report = this_standards.filter(x => x.type == 'reporting guideline');
                std_term = this_standards.filter(x => x.type == 'terminology artifact');
                std_other = this_standards.filter(x => x.type == 'other');
            } else {
                std_model = this.thisRecord.standards.filter(x => x.type == 'model/format');
                std_report = this.thisRecord.standards.filter(x => x.type == 'reporting guideline');
                std_term = this.thisRecord.standards.filter(x => x.type == 'terminology artifact');
                std_other = this.thisRecord.standards.filter(x => x.type == 'other');
            }

            // Standard types pie chart
            var chart_2 = c3.generate({
                bindto: "#standard_types_plot",
                data: {
                    columns: [
                        ['Model/Format', std_model.length],
                        ['Reporting Guideline', std_report.length],
                        ['Terminology Artifact', std_term.length],
                        ['Other', std_other.length],
                    ],
                    type: 'pie',
                },
                size: {
                    height: this.height
                }
            });

            // All record types by taxonomy...
            //<div id="stats_taxonomy_plot"></div>
            // ...and all record types by domain.
            // <div id="stats_domains_plot"></div>
            // TODO: Re-write all the forEach calls in a more elegant manner...
            let taxonomies = {};
            let domains = {};
            let standards = {};
            this_standards.forEach(function(s) {
                s.taxonomies.forEach(function(t) {
                    if (taxonomies[t]) {
                        taxonomies[t] += 1
                    } else {
                        taxonomies[t] = 1
                    }
                });
                s.domains.forEach(function(d) {
                    if (domains[d]) {
                        domains[d] += 1
                    } else {
                        domains[d] = 1
                    }
                })
            });
            this_policies.forEach(function(p) {
                p.taxonomies.forEach(function(t) {
                    if (taxonomies[t]) {
                        taxonomies[t] += 1
                    } else {
                        taxonomies[t] = 1
                    }
                });
                p.domains.forEach(function(d) {
                    if (domains[d]) {
                        domains[d] += 1
                    } else {
                        domains[d] = 1
                    }
                })

            });
            this_databases.forEach(function(d) {
                d.taxonomies.forEach(function(t) {
                    if (taxonomies[t]) {
                        taxonomies[t] += 1
                    } else {
                        taxonomies[t] = 1
                    }
                });
                d.domains.forEach(function(d) {
                    if (domains[d]) {
                        domains[d] += 1
                    } else {
                        domains[d] = 1
                    }
                })

            });


            // Sort the hashes, most numerous domains/taxonomies first.
            // The ugly lodash is to be found below.
            var tax_data = [['x', 'Taxonomies']];
            var dom_data = [['x', 'Domains']];
            for (const key in this.sortMostNumerous(taxonomies)) {
               tax_data.push([key, taxonomies[key]])
            }
            tax_data = tax_data.slice(0,10);

            for (const key in this.sortMostNumerous(domains)) {
               dom_data.push([key, domains[key]])
            }
            dom_data = dom_data.slice(0,10);


            // Taxonomies bar chart
            var chart_3 = c3.generate({
                bindto: "#stats_taxonomy_plot",
                data: {
                        x: 'x',
                        columns: tax_data,
                        type: 'bar'

                },
                axis: {
                    x: {
                        type: 'category'
                    }

                },
                size: {
                    height: this.height
                }
            });

            // Domains bar chart
            var chart_4 = c3.generate({
                bindto: "#stats_domains_plot",
                data: {
                    x: 'x',
                    columns: dom_data,
                    type: 'bar'
                },
                axis: {
                    x: {
                        type: 'category'
                    }
                },
                size: {
                    height: this.height
                }
            });

            // Formats supported by databases
            var standards_implemented = [['x', 'Standards Implemented']];
            this_databases.forEach(function(db) {
                db.standardsImplemented.forEach(function(standard) {
                    let name = standard.data.name;
                    if (standards[name]) {
                        standards[name] += 1
                    } else {
                        standards[name] = 1
                    }
                })
            });
            for (const key in this.sortMostNumerous(standards)) {
                standards_implemented.push([key, standards[key]])
            }
            standards_implemented = standards_implemented.slice(0,10);

            // Another pie chart for the above.
            // Don't display if there's only 1 element, i.e. the title, on occasions where no standards are present.
            console.log("STD: " + JSON.stringify(standards_implemented));
            if (standards_implemented.length > 1) {
                var chart_5 = c3.generate({
                    bindto: "#formats_supported_plot",
                    data: {
                        x: 'x',
                        columns: standards_implemented,
                        type: 'bar'
                    },
                    axis: {
                        x: {
                            type: 'category'
                        }
                    },
                    size: {
                        height: this.height
                    }
                });
            } else {
                document.getElementById("formats_supported_plot").innerHTML = "<i>This collection does not contain any databases; the plot of database standards supported is therefore unavailable.</i>";
            }
        },
        // Return 10 largest tags...
        sortMostNumerous(type) {
            return _(type).toPairs().sortBy(1).reverse().fromPairs().value();
        }

    },

    computed: {

        validResults: function() {
            this.elementVis('collection-comparison-selector','show');
            this.elementVis('top-spinner','hide');
            if (this.thisRecord && this.otherRecord) {
                return true;
            }
            return false;
        },
        ownRecord: function() {
            if (!isEmpty(this.thisRecord)) {
                return true;
            }
            return false;
        },
        selfComparison: function() {
            if (this.otherRecord === null) {
                return false;
            }
            return this.thisRecord.bsg_id === this.otherRecord.bsg_id;
        },

        taxonomy: function() {
            return this.fieldDifferences('taxonomies');
        },

        domains: function() {
            return this.fieldDifferences('domains');
        },

        standards: function() {
            return this.objectDifferences('standards');
        },

        databases: function() {
            return this.objectDifferences('databases');
        },

        policies: function() {
            return this.objectDifferences('policies');
        },

    },

};
</script>

<style scoped lang="scss">
// $bs-head-color: #249acc;
// $header-font-size: 36px;

#collection-comparison-selector-cnt {
    margin-top: 10px;
    max-height: 42px;
    width: 100%;
    padding-bottom: 20px;
}

#collection-comparison-selector {
    min-width: 480px;
    display: inline-block;
}

#collection-comparison-btn {
    display: inline-block;
    vertical-align: top;
    margin: 0 0;
}

#top-spinner {
    width: 50px;
    margin-left: 5px;
    display: inline-block;
    vertical-align: middle;
    padding-top: 5px;
}

.hidden {
  display: none;
}

.animated {
  opacity: 1;
  animation-name: fadeInOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: 1.0s;
}

@keyframes fadeInOpacity {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}


.venntooltip {
  color: #FFFFFF;
  background: #4c3c5d;
  padding: 5px;
  border-radius: 2px;

}

</style>
