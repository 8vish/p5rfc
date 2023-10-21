<script lang="ts">
import DlcFilter from '@/components/DlcFilterComponent.vue';

import { Arcana, Element } from '@/data/types';
import { Personas, type PersonaData } from '@/data/personas';
import { getLockedDlc, serializeName } from '@/helpers';

const stripUnblockable = (o: object) => Object.keys(o).filter((_, idx) => idx < 10);

export default {
    data() {
        return {
            searchQuery: '',

            sortBy: 'level',
            sortReverse: false,

            elements: Element,

            stripUnblockable,
            serializeName,
        }
    },
    components: {
        'dlc-filter': DlcFilter,
    },
    computed: {
        personas(): PersonaData[] {
            return [...Object.values(Personas)]
                .sort((a, b) => {
                    if ('name' === this.sortBy)
                        return (this.sortReverse ? b.name : a.name).localeCompare(this.sortReverse ? a.name : b.name);

                    if (this.sortReverse && 'level' === this.sortBy)
                        return b.level - a.level;

                    return a.level - b.level;
                })
                .sort((a, b) => {
                    if ('arcana' === this.sortBy) {
                        const aValue = Object.values(Arcana).findIndex(_ => _ === a.arcana);
                        const bValue = Object.values(Arcana).findIndex(_ => _ === b.arcana);

                        return this.sortReverse ? bValue - aValue : aValue - bValue;
                    }

                    return 0;
                })
                .filter(persona => {
                    if (getLockedDlc().includes(persona.name))
                        return false;

                    if (0 === this.searchQuery.length)
                        return true;

                    return persona.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                });
        },
    },
    methods: {
        sort(sort: string) {
            if (sort === this.sortBy)
                this.sortReverse = !this.sortReverse;
            else {
                this.sortBy = sort;
                this.sortReverse = false;
            }
        },
    },
    mounted() {
        document.title = `Persona 5 Royal Fusion Calculator| P5RFC`;
    },
};
</script>

<template style="min-width: 90%;">
    <h1 id="page-title">P5R Fusion Calculator</h1>
    <input id="persona-search" placeholder="Search for a Persona..." type="text" :value="searchQuery"
        @input="event => searchQuery = event.target ? (event.target as HTMLTextAreaElement).value : ''" />

    <dlc-filter></dlc-filter>

    <table id="persona-list" style="background-color: rgb(105, 97, 97);">
        <thead>
            <tr>
                <th class="column-header column-level column-header-sortable"
                    :id="'level' === sortBy ? `sorting-${sortReverse ? 'dsc' : 'asc'}` : ''" rowspan="2"
                    @click="sort('level')">Level</th>
                <th class="column-header column-arcana column-header-sortable"
                    :id="'arcana' === sortBy ? `sorting-${sortReverse ? 'dsc' : 'asc'}` : ''" rowspan="2"
                    @click="sort('arcana')">Arcana</th>
                <th class="column-header column-name column-header-sortable"
                    :id="'name' === sortBy ? `sorting-${sortReverse ? 'dsc' : 'asc'}` : ''" rowspan="2"
                    @click="sort('name')">Name</th>
                <th class="column-header column-stat" colspan="5">Stats</th>
                <th class="column-header column-affinity" colspan="10">Affinities</th>
            </tr>
            <tr>
                <th class="column-stat">St</th>
                <th class="column-stat">Ma</th>
                <th class="column-stat">En</th>
                <th class="column-stat">Ag</th>
                <th class="column-stat">Lu</th>
                <th class="column-affinity" v-for="element in stripUnblockable(elements)" :key="element">
                    <img class="element-icon" :src="`assets/icon_${element.toLowerCase()}.png`" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="persona in personas" :key="persona.name"
                :class="{ dlc: persona.dlc, max: persona.max, treasure: persona.treasure }">
                <td class="column-level centered">{{ persona.level }}</td>
                <td class="column-arcana centered">{{ persona.arcana }}</td>
                <td class="column-name">
                    <router-link class="persona-redirect"
                        :to="{ name: 'Persona', params: { name: serializeName(persona.name) } }"
                        style="color: rgb(8, 226, 255);">
                        {{ persona.name }}
                    </router-link>
                </td>
                <td class="column-stat centered" v-for="stat in persona.stats" :key="stat">{{ stat }}</td>
                <td class="column-affinity centered" v-for="aff in persona.affinities" :key="aff">{{ aff }}</td>
                <td class="column-fuse">
                    <router-link class="fusion-redirect" v-if="!persona.treasure"
                        :to="{ name: 'Fusion', params: { name: serializeName(persona.name) } }"
                        style="color: rgb(223, 142, 35);">
                        Fuse <svg class="mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M14.4002 7.60002L9.2252 2.35002C9.0002 2.12502 8.6502 2.12502 8.4252 2.35002C8.2002 2.57502 8.2002 2.92502 8.4252 3.15002L12.6252 7.42502H2.0002C1.7002 7.42502 1.4502 7.67502 1.4502 7.97502C1.4502 8.27502 1.7002 8.55003 2.0002 8.55003H12.6752L8.4252 12.875C8.2002 13.1 8.2002 13.45 8.4252 13.675C8.5252 13.775 8.6752 13.825 8.8252 13.825C8.9752 13.825 9.1252 13.775 9.2252 13.65L14.4002 8.40002C14.6252 8.17502 14.6252 7.82503 14.4002 7.60002Z"
                                fill="white"></path>
                        </svg>
                    </router-link>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style></style>

<style scoped>
.column-stat,
.column-affinity {
    display: none;
}

input#persona-search {
    margin: auto;
    min-width: calc(100% - 8px);
    width: calc(100% - 8px);
    padding: 4px;
}

@media (min-width: 1280px) {
    input#persona-search {
        min-width: 100%;
        width: 100%;
    }
}

@media (min-width: 1024px) {

    td.column-fuse {
        min-width: 50px;
    }

    .column-stat,
    .column-affinity {
        display: table-cell !important;
    }
}

@media (max-width: 1023.98px) {
    input#persona-search {
        margin: 0 0 8px 0;
    }
}

@media (min-width: 800px) {
    template {
        min-width: 90vh;
    }
}</style>