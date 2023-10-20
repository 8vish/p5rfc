<script lang="ts">
import DlcFilter from '@/components/DlcFilterComponent.vue';

import { Element } from '@/data/types';
import { Personas, type PersonaData } from '@/data/personas';
import { Skills, type SkillData } from '@/data/skills';
import { deserializeName, serializeName, getKeyOfValue } from '@/helpers';

const stripUnblockable = (o: object) => Object.keys(o).filter((_, idx) => idx < 10);

export default {
    data () {
        return {
            name: '',

            elements: Element,

            stripUnblockable,
            serializeName,
        }
    },
    components: {
        'dlc-filter': DlcFilter,
    },
    computed: {
        persona (): PersonaData { return Personas[this.name]; },
        trait (): SkillData|undefined { return this.persona.trait ? Skills[this.persona.trait] : undefined; },
    },
    methods: {
        getSkillData (skill: string): SkillData { return Skills[skill]; },
        getInheritance (persona: PersonaData): Element[] {
            return [ ...persona.inherits, Element.SUPPORT, Element.ALMIGHTY, Element.PASSIVE, Element.TRAIT ];
        },
        getElementIcon (element: Element): string {
            return `../assets/icon_${getKeyOfValue(Element, element).toLowerCase()}.png`;
        },
    },
    created () {
        if (typeof(this.$route.params.name) === 'string')
            this.name = deserializeName(this.$route.params.name);
    },
    mounted () {
        document.title = `${this.name} Datasheet | P5R Calculator`;
    },
}
</script>

<template>
    <router-link class="centered main-redirect redirect-banner" :to="{ name: 'Main' }">
        &lt;&lt; Back to List
    </router-link>

    <h1 id="page-title">{{ name }}</h1>

    <table id="persona-stats">
        <thead>
            <tr>
                <th class="column-header column-level" rowspan="2">Level</th>
                <th class="column-header column-arcana" rowspan="2">Arcana</th>
                <th class="column-header" colspan="5">Stats</th>
                <th class="column-header desktop-only" colspan="10">Affinities</th>
            </tr>
            <tr>
                <th class="column-stat">St</th>
                <th class="column-stat">Ma</th>
                <th class="column-stat">En</th>
                <th class="column-stat">Ag</th>
                <th class="column-stat">Lu</th>
                <th class="column-affinity desktop-only" v-for="element in stripUnblockable(elements)" :key="element">
                    <img class="element-icon" :src="`../assets/icon_${ element.toLowerCase() }.png`" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr :class="{ dlc: persona.dlc, max: persona.max, treasure: persona.treasure }">
                <td class="column-level centered">{{ persona.level }}</td>
                <td class="column-arcana centered">{{ persona.arcana }}</td>
                <td class="column-stat centered" v-for="stat in persona.stats" :key="stat">{{ stat }}</td>
                <td class="column-affinity centered desktop-only"
                    v-for="aff in persona.affinities" :key="aff">{{ aff }}</td>
            </tr>
        </tbody>
    </table>

    <table id="persona-affinities" class="mobile-only">
        <thead>
            <tr>
                <th class="column-header" colspan="10">Affinities</th>
            </tr>
            <tr>
                <th class="column-affinity" v-for="element in stripUnblockable(elements)" :key="element">
                    <img class="element-icon" :src="`../assets/icon_${ element.toLowerCase() }.png`" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr :class="{ dlc: persona.dlc, max: persona.max, treasure: persona.treasure }">
                <td class="column-affinity centered"
                    v-for="aff in persona.affinities" :key="aff">{{ aff }}</td>
            </tr>
        </tbody>
    </table>

    <table id="persona-inherits">
        <thead>
            <tr>
                <th class="column-header" :colspan="getInheritance(persona).length">
                    Skill elements that can be inherited:
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="centered column-inherit"
                    v-for="element in getInheritance(persona)" :key="element">
                    <img class="element-icon inherit-icon" :src="getElementIcon(element)" />
                </td>
            </tr>
        </tbody>
    </table>

    <table id="persona-skills">
        <thead>
            <tr>
                <th class="column-header" colspan="5">Skills</th>
            </tr>
            <tr>
                <th class="column-header column-skill-level">Level</th>
                <th class="column-header column-skill-element">Element</th>
                <th class="column-header column-skill-name">Name</th>
                <th class="column-header column-skill-effect">Effect</th>
                <th class="column-header column-skill-unique">Unique?</th>
            </tr>
        </thead>
        <tbody>
            <tr class="row-skill" v-if="persona.trait">
                <td class="column-skill-level centered">-</td>
                <td class="column-skill-element centered">
                    <img class="element-icon" src="@/assets/icon_trait.png" />
                </td>
                <td class="column-skill-name">{{ persona.trait }}</td>
                <td class="column-skill-effect" colspan="2">{{ trait ? trait.effect : '' }}</td>
            </tr>
            <tr class="row-skill" v-for="skill in persona.skills" :key="skill[0]">
                <td class="column-skill-level centered">{{ 0 < skill[1] ? skill[1] : '-' }}</td>
                <td class="column-skill-element centered">
                    <img class="element-icon skill-icon" :src="getElementIcon(getSkillData(skill[0]).element)" />
                </td>
                <td class="column-skill-name">{{ skill[0] }}</td>
                <td class="column-skill-effect">{{ getSkillData(skill[0]).effect }}</td>
                <td class="column-skill-unique centered">{{ getSkillData(skill[0]).unique ? 'x' : '' }}</td>
            </tr>
        </tbody>
    </table>

    <router-link class="centered fuse-redirect redirect-banner" v-if="!persona.treasure"
        :to="{ name: 'Fusion', params: { name: serializeName(persona.name) } }">
        Fuse &gt;&gt;
    </router-link>
</template>

<style scoped>
  /* General Styles */
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
  }
  a {
    color: #0078d4;
    text-decoration: none;
  }

  /* Page Title */
  #page-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin: 20px 0;
  }

  /* Redirect Banner */
  .centered {
    text-align: center;
  }
  .redirect-banner {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    background-color: #0078d4;
    color: #fff;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
  }
  .redirect-banner:hover {
    background-color: #005a9e;
  }

  /* Skill Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: center;
  }

  /* Skills Table Header */
  .column-header {
    font-weight: bold;
    background-color: #0078d4;
    color: #fff;
  }

  /* Stats Table Header */
  .column-stat {
    background-color: #0078d4;
    color: #fff;
  }

  /* Affinities Table Header */
  .column-affinity {
    background-color: #0078d4;
    color: #fff;
  }

  /* Skill Elements Icons */
  .element-icon {
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }

  /* Skill Level, Element, Name, Effect, Unique */
  .column-skill-level,
  .column-skill-element,
  .column-skill-name,
  .column-skill-effect,
  .column-skill-unique {
    text-align: center;
  }

  .row-skill:nth-child(odd) {
    background-color: #e1e1e1;
  }

  /* Mobile-only Styles */
  @media (max-width: 1023.98px) {
    /* Affinities Table */
    table#persona-affinities {
      display: block;
    }
    table#persona-affinities .column-header {
      display: none;
    }
    table#persona-affinities .column-affinity {
      display: inline-block;
      width: 50%;
      text-align: center;
    }

    /* Skills Table */
    table#persona-skills .column-skill-element {
      display: none;
    }
  }

  /* Custom Styles */
  /* Adjust these colors to your preference */
  .dlc {
    background-color: #e74c3c;
    color: #fff;
  }
  .max {
    background-color: #f1c40f;
    color: #000;
  }
  .treasure {
    background-color: #3498db;
    color: #fff;
  }

  /* Inheritance Elements Icons */
  .inherit-icon {
    width: 32px;
  }
</style>
