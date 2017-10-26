<template>
    <div>
         <div v-bind:id='id' class='alert alert-primary' style='margin: 5px;'>
             <p><b>{{ title }}:</b></p>
             <p>{{ currentName }} only ({{ current.length }}):</p>
             <p>
                 <ul class='bio-tags btsmall'>
                     <li v-bind:class="tagtype" v-for='item in current'>
                         <a :href="searchLink(link, item)" target='_blank'>
                             <span class='bio-icon-tag' style='padding-right: 5px'></span>
                             {{ item }}
                         </a>
                     </li>
                 </ul>
                 <div class='clearfix'></div>
             </p>
             <p><a v-bind:href="href" target='_blank'>{{ otherName }}</a>
             only ({{ other.length }}):</p>
             <p>
                 <ul class='bio-tags btsmall'>
                     <li v-bind:class="tagtype" v-for='item in other'>
                         <a v-bind:href="searchLink(link, item)" target='_blank'>
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
                     <li v-bind:class="tagtype" v-for='item in both'>
                         <a :href="searchLink(link, item)" target='_blank'>
                             <span class='bio-icon-tag' style='padding-right: 5px'></span>
                             {{ item }}
                         </a>
                     </li>
                 </ul>
                 <div class='clearfix'></div>
             </p>
         </div>
         <div class='clearfix'></div>
    </div>
</template>

<script>
export default {
    // delimiters: ['[[', ']]'],
    props: [
        'current', 'other', 'both', 'title', 'tagtype',
        'count', 'id', 'href', 'link', 'currentName', 'otherName',
        'recordIds'
    ],
    methods: {
        searchLink(url, item) {
            if (url.includes('taxonomies') || url.includes('domains')) {
                return `/search?q=&selected_facets=${url}:${item}`;
            } else {
                return `/${this.recordIds[item]}`;
            }
        }
    }

};
</script>
