/**
 * Created by milo on 15/09/2017.
 */


import Vue from 'vue';
import axios from 'axios';
import d3 from 'd3';
import venn from 'venn.js';

export default { }

var recordcomparison = new Vue({
    delimiters: ['[[', ']]'],
    el: '#comparison-area',
    data: {
        thisrecord: null,
        otherrecord: null,
        otherid: null,
        api_key: null,
        this_collection_id: null,
        record_ids: {},
        chart: venn.VennDiagram()
    },
    methods: {
        getother: function () {
            var self = this;
            axios.get('/api/collection/' + self.otherid, {
                headers: {
                    'Api-Key': self.api_key,
                    'Content-type': 'application/json'
                }
            })
            .then(function (response) {
                self.otherrecord = response['data'];
                self.store_ids(response['data']);
                self.element_vis('show-graph-button','show');
                self.element_vis('top-spinner','hide');
            })
            .catch(function (error) {
                console.log('Error fetching otherCollection: ' + error);
            })
        },
        store_ids: function (json) {
            var self = this;
            rtypes = ['standards', 'policies', 'databases'];
            rtypes.forEach(function (rt) {
                json[rt].forEach(function (x) {
                    self.record_ids[x.name] = x.bsg_id;
                })
            })
        },
        clear: function () {
            var self = this;
            self.otherrecord = null;
            self.otherid = null;
        },
        field_differences: function (field) {
            var self = this;
            var thisone = self.thisrecord[field];
            var otherone = self.otherrecord[field];
            thisonly = thisone.filter(x => otherone.indexOf(x) == -1);
            otheronly = otherone.filter(x => thisone.indexOf(x) == -1);
            both = thisone.filter(x => otherone.includes(x));
            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            }

        },
        object_differences: function (field) {
            var self = this;
            var thisone = self.thisrecord[field].map(x => x['name']);
            var otherone = self.otherrecord[field].map(x => x['name']);
            thisonly = thisone.filter(x => otherone.indexOf(x) == -1);
            otheronly = otherone.filter(x => thisone.indexOf(x) == -1);
            both = thisone.filter(x => otherone.includes(x));
            return {
                'current': thisonly,
                'other': otheronly,
                'both': both,
            }
        },
        plot_graphs: function () {
            var self = this;
            var plots = [];
            ['taxonomy', 'domains', 'standards', 'databases', 'policies'].forEach(function (item) {
                var data = self.get_graph_data(item);
                let s = data[0]['size'];
                let o = data[1]['size'];
                let b = data[2]['size'];
                if (s === 0 || o === 0) { // at least one has some tags...
                    return;
                }
                if ((s === b) && (o === b)) {// ...but not fully overlapping
                    return;
                }
                self.element_vis(item + '_venn', 'show');
                var div = d3.select("#" + item + "_plot");
                div.datum(data).call(self.chart);
                plots.push(div);
            })

            var tooltip = d3.select("body").append("div").attr("class", "tooltip venntooltip");
            plots.forEach(function (div) {
                // add listeners to all the groups to display tooltip on mouseover
                div.selectAll("g")
                    .on("mouseover", function (d, i) {
                        // sort all the areas relative to the current item
                        venn.sortAreas(div, d);

                        // Display a tooltip with the current size
                        tooltip.transition().duration(400).style("opacity", .9);
                        var note = ' records';
                        if (d.size == 1) {
                            note = ' record';
                        }
                        tooltip.text(d.size + note);

                        // highlight the current path
                        var selection = d3.select(this).transition("tooltip").duration(400);
                        selection.select("path")
                            .style("stroke", '#FFFFFF')
                            .style("stroke-width", 5)
                            .style("fill-opacity", d.sets.length == 1 ? .6 : .4)
                            .style("stroke-opacity", 1);
                    })

                    .on("mousemove", function () {
                        tooltip.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })

                    .on("mouseout", function (d, i) {
                        tooltip.transition().duration(400).style("opacity", 0);
                        var selection = d3.select(this).transition("tooltip").duration(400);
                        selection.select("path")
                            .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
                            .style("stroke-opacity", 0);
                    });
            });
            self.element_vis('show-graph-button','hide');
            self.element_vis('hide-graph-button','show');
        },
        get_graph_data: function (field) {
            var self = this;
            var one = self[field]['current'].length + self[field]['both'].length; // total in first record
            var two = self[field]['other'].length + self[field]['both'].length; // total in second
            var three = self[field]['both'].length; // intersection
            return [
                {sets: [self.thisrecord.name], size: one},
                {sets: [self.otherrecord.name], size: two},
                {sets: [self.thisrecord.name, self.otherrecord.name], size: three}
            ];
        },
        hide_graphs: function () {
            var self = this;
            // These buttons may not be visible initially.
            self.element_vis('show-graph-button','show');
            self.element_vis('hide-graph-button','hide');
            // hide each individual graph
            ['taxonomy', 'domains', 'standards', 'databases', 'policies'].forEach(function (item) {
                self.element_vis(item + '_venn','hide');
            })
        },
        search_link: function (url, item) {
            var self = this;
            if (url.includes('taxonomies') || url.includes('domains')) {
                return "/search?q=&selected_facets=" + url + ":" + item;
            } else {
                return "/" + self.record_ids[item];
            }
        },
        open_comparison: function (bsg_id) {
            var self = this;
            var bsg_id = document.getElementById('collection-comparison').value.split(':')[0].trim();
            if (bsg_id) {
                self.element_vis('comparison-well','show');
                var regex = /bsg-c\d{6}/g;
                if (bsg_id.match(regex)) {
                    self.otherid = bsg_id;
                } else {
                    self.otherrecord = null;
                }
            } else {
                alert('Please select a collection/recommendation with which to make a comparison');
            }
            self.hide_graphs();
            self.element_vis('top-spinner','show');
        },
        close_comparison: function () {
            self.element_vis('comparison-well','hide');
        },
        element_vis: function(name, type) {
            let element = document.getElementById(name);
            try {
                if (undefined === typeof element) {
                    //console.log("Failure when trying to '" + type + "' '" + name + "' (is undefined).");
                    return false;
                } else if (null === element) {
                    //console.log("Failure when trying to '" + type + "' '" + name + "' (is null).");
                    return false;
                } else {
                    if (type === 'show') {
                        element.classList.remove('hidden');
                    } else if (type === 'hide') {
                        element.classList.add('hidden');
                    } else {
                        console.log("Don't know how to '" + type + "' an element.");
                    }
                }
            } catch (err) {
                console.log("Error: " + err);
                console.log("Total fail when trying to '" + type + "' '" + name + "'.");
            }

        }
    },
    watch: {
        otherid: function(id) {
            var self = this;
            console.log('Other ID has changed: ' + self.otherid);
            self.element_vis('hide-graph-button','hide');
            self.getother();
        }
    },
    computed: {
        valid_results: function() {
            var self = this;
            if (self.thisrecord && self.otherrecord) {
                return true;
            }
            return false;
        },
        self_comparison: function() {
            var self = this;
            if (self.thisrecord.bsg_id == self.otherrecord.bsg_id) {
                return true;
            }
            return false;
        },
        taxonomy: function() {
            var self = this;
            return self.field_differences('taxonomies');
        },
        domains: function() {
            var self = this;
            return self.field_differences('domains');
        },
        standards: function() {
            var self = this;
            return self.object_differences('standards');
        },
        databases: function() {
            var self = this;
            return self.object_differences('databases');
        },
        policies: function() {
            var self = this;
            return self.object_differences('policies');
        }
    },
    mounted: function() {
        var self = this;
        console.log('mounted');
        self.api_key = document.getElementById('api-key').content;
        self.this_collection_id = document.getElementById('view-id').content;

        /*
         * Get contents for the collection dropdown.
         */

        axios.get('/content/collections/')
            .then(function(response) {
                document.getElementById('collection-comparison').innerHTML = '';
                $.each(response['data'].sort(), function (key, val) {
                    var id = val.split(':')[0].trim();
                    if (id === self.this_collection_id) {
                        return;
                    }
                    var option = document.createElement('option');
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

        if (!self.thisrecord) {
            axios.get('/api/collection/' + self.this_collection_id, {
                    headers: {
                        'Api-Key': self.api_key,
                        'Content-type': 'application/json'
                    }
                })
                .then(function(response) {
                    self.thisrecord = response['data'];
                    self.store_ids(response['data']);
                })
                .catch(function(error) {
                    console.log('Error fetching thisCollection: ' + error);
                })
        }
    }

});

Vue.component('comparison', {
    props: ['current', 'other', 'both', 'title', 'tagtype', 'count', 'id', 'href', 'link'],
    template: "<div v-bind:id='id' class='alert alert-primary' style='margin: 5px;'> " +
              "<p><b>{{ title }}:</b></p>" +
              "<p>{{ recordcomparison.thisrecord['name'] }} only ({{ current.length }}):</p>" +
              "<p>" +
              "<ul class='bio-tags btsmall'>" +
              "<li v-bind:class=\"tagtype\" v-for='item in current'>" +
              "<a :href=\"recordcomparison.search_link(link, item)\" target='_blank'>" +
              "<span class='bio-icon-tag' style='padding-right: 5px'></span>" +
              "{{ item }}" +
              "</a>" +
              "</li>" +
              "</ul>" +
              "<div class='clearfix'></div>" +
              "</p>" +
              "<p><a v-bind:href=\"href\" target='_blank'>{{ recordcomparison.otherrecord['name'] }}</a>" +
              " only ({{ other.length }}):</p>" +
              "<p>" +
              "<ul class='bio-tags btsmall'>" +
              "<li v-bind:class=\"tagtype\" v-for='item in other'>" +
              "<a v-bind:href=\"recordcomparison.search_link(link, item)\" target='_blank'>" +
              "<span class='bio-icon-tag' style='padding-right: 5px'></span>" +
              "{{ item }}" +
              "</a>" +
              "</li>" +
              "</ul>" +
              "<div class='clearfix'></div>" +
              "</p>" +
              "<p>Shared ({{ both.length }})</span>:</p>" +
              "<p>" +
              "<ul class='bio-tags btsmall'>" +
              "<li v-bind:class=\"tagtype\" v-for='item in both'>" +
              "<a :href=\"recordcomparison.search_link(link, item)\" target='_blank'>" +
              "<span class='bio-icon-tag' style='padding-right: 5px'></span>" +
              "{{ item }}" +
              "</a>" +
              "</li>" +
              "</ul>" +
              "<div class='clearfix'></div>" +
              "</p>" +
              "</div>" +
              "<div class='clearfix'></div>"

});

