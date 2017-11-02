<template>
    <div class="vue-root">
        <div id='collection-comparison-selector-cnt'>
            <button id='collection-comparison-btn' class="btn btn-orange btn-cspecial" style="color: white;" v-on:click="openComparison"> Compare with collection/recommendation (Beta)</button>
            <v-select id='collection-comparison-selector' placeholder='Please select a Collection or Recommendation' :options="collections"
                    :on-change="onSelectOtherCollection"></v-select>
            <img src="/static/img/three-dots.svg" id="top-spinner" class="hidden">
        </div>
        <div class="well col-md-8 hidden animated" id="comparison-well" style="margin:0 auto;">

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
</template>
<script>
import RecordComparison from './RecordComparison.vue';
import * as venn from 'venn.js';
import axios from 'axios';
import * as d3 from 'd3';

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
            chart: venn.VennDiagram()
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
            const thisone = this.thisRecord[field].map(x => x.name),
                otherone = this.otherRecord[field].map(x => x.name);
            const thisonly = thisone.filter(x => otherone.indexOf(x) === -1),
                otheronly = otherone.filter(x => thisone.indexOf(x) === -1),
                both = thisone.filter(x => otherone.includes(x));
            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            };
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

        selfComparison: function() {
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
        }

    }

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
