/**
 * fix-message Web Component
 *
 * Copyright (c) 2025 Andrei Samkov
 *
 * This source code is licensed under the MIT license found in the LICENSE.txt file.
 */
import {countries} from "./countries.mjs";
import {currencies} from "./currencies.mjs";
import {exchanges} from "./exchanges.mjs";
import {languages} from "./languages.mjs";

class FixMessageHTMLElement extends HTMLElement {
    static observedAttributes = ['message', 'delimiter', 'data-dictionary', 'mode'];
    static SOH = String.fromCharCode(1);
    static KnownTags = {
        MsgType: '35',
        CheckSum: '10',
        BeginString: '8',
        ApplVerID: '1128',
        ExecTransType: '20',
        ApplID: '1180',
        ApplSeqNum: '1181',
        EncryptedPasswordMethod: '1400',
        DefaultApplVerID: '1137',
        ManualOrderIndicator: '1028',
        QuoteEntryStatus: '1167',
        LastLiquidityInd: '851',
        TradeID: '1003',
        StrategyParameterName: '957'
    }

    static DictionaryCache = {};
    static url = import.meta.url;
    static parentUrl = FixMessageHTMLElement.url.substring(0, FixMessageHTMLElement.url.lastIndexOf('/') + 1);
    static VersionFiles = {
        'FIX.4.0': FixMessageHTMLElement.parentUrl + 'FIX40.xml',
        'FIX.4.1': FixMessageHTMLElement.parentUrl + 'FIX41.xml',
        'FIX.4.2': FixMessageHTMLElement.parentUrl + 'FIX42.xml',
        'FIX.4.3': FixMessageHTMLElement.parentUrl + 'FIX43.xml',
        'FIX.4.4': FixMessageHTMLElement.parentUrl + 'FIX44.xml',
        'FIX.5.0': FixMessageHTMLElement.parentUrl + 'FIX50.xml',
        'FIX.5.0S P1': FixMessageHTMLElement.parentUrl + 'FIX50SP1.xml',
        'FIX.5.0S P2': FixMessageHTMLElement.parentUrl + 'FIX50SP2.xml',
        'FIXT.1.1': FixMessageHTMLElement.parentUrl + 'FIXT11.xml'
    };
    static ApplVerIDs = {
        '2': 'FIX.4.0',
        '3': 'FIX.4.1',
        '4': 'FIX.4.2',
        '5': 'FIX.4.3',
        '6': 'FIX.4.4',
        '7': 'FIX.5.0',
        '8': 'FIX.5.0 SP1',
        '9': 'FIX.5.0 SP2',
    }
    dom;
    useHostDom;
    labelTag = 'Tag';
    labelTagName = 'Tag Name';
    labelValue = 'Value';
    labelValueDescription = 'Value Description';
    labelValueType = 'Value Type';
    labelSection = 'Section';
    labelSectionHeader = 'Header';
    labelSectionMessage = 'Message';
    labelSectionTrailer = 'Trailer';

    constructor() {
        super();
    }

    connectedCallback() {
        this.useHostDom = this.hasAttribute('use-host-dom');
        this.dom = this.useHostDom ? this : this.attachShadow({mode: "open"});
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.dom) {
            this.render();
        }
    }

    async render() {
        this.dom.textContent = 'Loading...';
        if (this.message) {
            if (this.mode === 'table') {
                await this.renderTable();
            } else {
                this.renderString();
            }
        } else {
            this.dom.textContent = 'No FIX message to display';
        }
        this.dispatchEvent(new CustomEvent('rendered'));
    }

    renderString() {
        this.dom.textContent = this.messageWithDelimiter;
    }

    async renderTable() {
        const model = await this.loadModel();
        const table = document.createElement('table');
        table.append(this.createTableRow(this.labelTag, this.labelTagName, this.labelValue, this.labelValueDescription, this.labelValueType, 'th'));
        table.append(this.createSectionRow(this.labelSectionHeader));
        this.buildTableBody(table, model.header);
        table.append(this.createSectionRow(this.labelSectionMessage));
        this.buildTableBody(table, model.message);
        table.append(this.createSectionRow(this.labelSectionTrailer));
        this.buildTableBody(table, model.trailer);
        this.dom.innerHTML = '';
        if (!this.useHostDom) {
            this.appendStyle();
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        this.pairs.forEach(([tag, value], index) => {
            const pair = document.createElement('span');
            pair.classList.add('pair');
            pair.textContent = `${tag}=${value}`;
            pair.dataset.index = index;
            pair.addEventListener('mouseover', e => {
                this.table.querySelector(`tr[data-index="${index}"]`).classList.add('highlight');
            });
            pair.addEventListener('mouseout', e => {
                this.table.querySelector(`tr[data-index="${index}"]`).classList.remove('highlight');
            });
            pair.addEventListener('click', e => {
                this.table.querySelector(`tr[data-index="${index}"]`).scrollIntoView();
            });
            messageDiv.append(pair);
            messageDiv.append(this.delimiter);
        });

        this.dom.append(messageDiv, table);
        this.table = table;
        this.messageDiv = messageDiv;
    }

    appendStyle() {
        const style = document.createElement('style')
        style.textContent = `


:host {
    --font-size: 14px;
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    --font-monospace: 'Consolas', 'Menlo', 'Courier New', monospace;
    --font-color: #000E24;
    --background-color: #FFF;
    --even-backgroud-color: #E5F0FF;
    --header-font-color: #E5F0FF;
    --header-background-color: #013A63;
    --section-font-color: #E5F0FF;
    --section-background-color: #66A3FF;
    --border-color: #CCE0FF;
    --tree-color: #cccccc;
    --tag-color: #0366d6;
    --string-value-color: #269141;
    --integer-value-color: #0366d6;
    --float-value-color: #0366d6;
    --char-value-color: #a61945;
    --boolean-value-color: #a61945;
    --datetime-value-color: #a61945;
    --type-color: #999;
    --indent-step: 25px;
}

div.message {
    font-family: var(--font-monospace), sans-serif;
    word-break: break-all;
    background: var(--background-color);
    color: var(--font-color);
}

div.message span.pair {
    background: var(--background-color);
    color: var(--font-color);
    display: inline-block;
}

div.message span.pair:hover, div.message span.pair.highlight {
    filter: invert(100%);
}

table {
    border-collapse: collapse;
    font-family: var(--font-family), sans-serif;
    color: var(--font-color);
}

tr {
    background-color: var(--background-color);
}

tr:nth-child(even) {
    background-color: var(--even-backgroud-color);
}

tr:nth-child(even):has(:not(td.section)):hover {
    background-color: color-mix(in srgb, var(--even-backgroud-color), black 5%);
}

tr:has(:not(td.section)):hover {
    background-color: color-mix(in srgb, var(--even-backgroud-color), black 5%);
}

table tr.highlight {
    background-color: color-mix(in srgb, var(--even-backgroud-color), black 5%);
}

th {
    background-color: var(--header-background-color);
    color: var(--header-font-color);
    text-align: left;
    font-weight: 600;
    padding: 15px 5px 5px 5px;
}

th:first-child {
 border-top-left-radius: 7px;
}

th:last-child {
 border-top-right-radius: 7px;
}

td {
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
    padding: 5px;
}

td.section {
    background-color: var(--section-background-color);
    color: var(--section-font-color);
    padding: 5px;
}

td.tag {
    font-family: var(--font-monospace), monospace;
    font-weight: bold;
    color: var(--tag-color);
}

td.name {
    font-weight: 600;
    color: var(--font-color);
}

td.value {
    font-family: var(--font-monospace), monospace;
    word-break: break-all;
}

td.value[data-type=INT],
td.value[data-type=SEQNUM],
td.value[data-type=LENGTH],
td.value[data-type=NUMINGROUP] {
    color: var(--integer-value-color);
}

td.value[data-type=PRICE],
td.value[data-type=AMT],
td.value[data-type=QTY],
td.value[data-type=FLOAT],
td.value[data-type=PRICEOFFSET],
td.value[data-type=PERCENTAGE] {
    color: var(--float-value-color);
}

td.value[data-type=STRING],
td.value[data-type=MULTIPLEVALUESTRING],
td.value[data-type=MULTIPLESTRINGVALUE],
td.value[data-type=EXCHANGE],
td.value[data-type=CURRENCY],
td.value[data-type=LOCALMKTDATE],
td.value[data-type=DATA],
td.value[data-type=MONTHYEAR],
td.value[data-type=DAYOFMONTH],
td.value[data-type=COUNTRY] {
    color: var(--string-value-color);
}

td.value[data-type=CHAR],
td.value[data-type=MULTIPLECHARVALUE] {
    color: var(--char-value-color);
    font-weight: bold;
}

td.value[data-type=BOOLEAN] {
    color: var(--boolean-value-color);
    font-style: italic;
}

td.value[data-type=UTCDATE],
td.value[data-type=UTCTIMEONLY],
td.value[data-type=UTCTIMESTAMP],
td.value[data-type=TIME] {
    color: var(--datetime-value-color);
}

td.description {
    font-family: var(--font-monospace), sans-serif;
    word-break: break-all;
}

td.type {
    font-family: var(--font-monospace), sans-serif;
    color: var(--type-color);
    line-height: 1;
    white-space: pre;
    width: 1%;
}

tr[class^="level-"] td.tag {
    position: relative;
}

tr[class^="level-"] td.tag::before {
    content: '├──';
    color: var(--tree-color);
    margin-right: 8px;
    font-family: monospace;
}

tr[class^="level-"].group-end td.tag::before {
    content: '└──';
    color: var(--tree-color);
    margin-right: 8px;
    font-family: monospace;
}

tr.level-0 td.tag::before {
    content: '';
    margin-right: 5px;
}


tr.level-0 td.tag {
    padding-left: 10px;
    font-weight: bold;
}

tr.level-1 td.tag {
    padding-left: calc(10px + var(--indent-step) * 1);
}

tr.level-2 td.tag {
    padding-left: calc(10px + var(--indent-step) * 2);
}

tr.level-3 td.tag {
    padding-left: calc(10px + var(--indent-step) * 3);
}

tr.level-1 td.name::before, tr.level-2 td.name::before {
    content: '│ ';
    color: var(--tree-color);
    margin-right: 8px;
    font-family: monospace;
}

tr[class="level-0"] td.name::before {
    content: '';
}

tr[class^="level-"].group-start td.name::before {
    content: '┌─';
}

tr[class^="level-"].group-end td.name::before {
    content: '└─';
}

tr.level-1 td.name {
    padding-left: calc(var(--indent-step) * 1);
}

tr.level-2 td.name {
    padding-left: calc(var(--indent-step) * 2);
}

tr.level-3 td.name {
    padding-left: calc(var(--indent-step) * 3);
}

@media screen and (max-width: 600px) {
    th {
        display: none;
    }

    tr {
        display: flex !important;
        border-bottom: 2px solid var(--border-color);
        flex-flow: wrap;
    }

    td:empty, td.type {
        display: none;
    }
    
    td {
        flex: 1 1 150px;
        box-sizing: border-box;
        padding-left: 5px !important;
        padding-right: 5px !important;
        word-break: auto-phrase !important;
    }

    td:nth-child(odd) {
        justify-content: flex-start;
        text-align: start !important;
    }
    
    td:nth-child(even) {
        justify-content: flex-end;
        text-align: end !important;
    }
    
    td:before {
        content: '' !important;
        padding: 0 !important;
        margin: 0 !important;
    }
}`;
        this.dom.append(style);
    }

    buildTableBody(table, model, level = 0) {
        for (let i = 0; i < model.length; i++) {
            const isFirst = i === 0;
            const isLast = i === model.length - 1;
            const isGroup = level > 0;
            const field = model[i];
            const tag = field.number;
            const value = field.value;
            const name = field.name || '';
            const type = field.type || '';
            const description = this.valueDescription(value, type, field.values, field.number);
            const tr = this.createTableRow(tag, name, value, description, type, 'td');
            tr.ariaLevel = String(level);
            tr.dataset.index = field.index;
            tr.classList.add(`level-${level}`);
            tr.classList.toggle('group-start', isFirst && isGroup);
            tr.classList.toggle('group-end', isLast && isGroup);

            tr.addEventListener('mouseover', e => {
                this.messageDiv.querySelector('span[data-index="' + field.index + '"]').classList.add('highlight');
            });
            tr.addEventListener('mouseout', e => {
                this.messageDiv.querySelector('span[data-index="' + field.index + '"]').classList.remove('highlight');
            });

            table.appendChild(tr);
            if (field.groups) {
                for (const group of field.groups) {
                    this.buildTableBody(table, group, level + 1);
                }
            }
        }
    }

    valueDescription(value, type, values, tag) {
        if (tag === FixMessageHTMLElement.KnownTags.CheckSum) {
            const result = this.validateFixChecksum();
            return result.isValid ? 'Checksum valid' : `Invalid checksum, expected ${result.calculated}`;
        }
        switch (type) {
            case 'BOOLEAN':
                return value === 'Y' ? 'True/Yes' : 'False/No';
            case 'UTCTIMESTAMP':
                return this.utcTimestampToLocalDateTime(value);
            case 'LOCALMKTDATE':
            case 'UTCDATEONLY':
                return this.localDate(value);
            case 'MONTHYEAR':
                return this.monthYearToLocal(value);
            case 'TZTIMEONLY':
                return this.zonedTimeToLocalTime(value);
            case 'TZTIMESTAMP':
                return this.zonedTimestampToLocalDateTime(value);
            case 'CURRENCY':
                return value ? currencies[value.toUpperCase()] || '' : '';
            case 'COUNTRY':
                return value ? countries[value.toUpperCase()] || '' : '';
            case 'EXCHANGE':
                return value ? exchanges[value.toUpperCase()] || '' : '';
            case 'LANGUAGE':
                return value ? languages[value.toUpperCase()] || '' : '';
            default:
                return values ? values[value] : '';
        }
    }

    createSectionRow(section) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = section;
        cell.classList.add('section');
        cell.ariaLabel = section;
        row.append(cell);
        row.ariaLabel = this.labelSection;
        return row;
    }

    createTableRow(tag = '', name = '', value = '', description = '', type = '', htmlTag = 'td') {
        const row = document.createElement('tr');
        const cellTag = document.createElement(htmlTag);
        const cellName = document.createElement(htmlTag);
        const cellValue = document.createElement(htmlTag);
        const cellType = document.createElement(htmlTag);
        const cellDescription = document.createElement(htmlTag);
        cellTag.classList.add('tag');
        cellTag.textContent = tag;
        cellTag.ariaLabel = this.labelTag;
        cellName.classList.add('name');
        cellName.textContent = name;
        cellName.ariaLabel = this.labelTagName;
        cellValue.classList.add('value');
        cellValue.textContent = value;
        cellValue.ariaLabel = this.labelValue;
        cellValue.dataset.type = type;
        cellType.classList.add('type');
        cellType.textContent = type;
        cellType.ariaLabel = this.labelValueType;
        cellDescription.classList.add('description');
        cellDescription.textContent = description;
        cellDescription.ariaLabel = this.labelValueDescription;
        row.append(cellTag, cellName, cellValue, cellDescription, cellType);
        return row;
    }

    async loadModel() {
        const version = this.getValueByTag(FixMessageHTMLElement.KnownTags.BeginString);
        let defaultDictionaryFile = FixMessageHTMLElement.VersionFiles[version];
        const transportDictionary = await this.loadDictionary(defaultDictionaryFile);
        if (version.startsWith('FIXT')) {
            defaultDictionaryFile = FixMessageHTMLElement.VersionFiles[this.detectDataVersion(transportDictionary, version)];
        }
        const dataDictionary = await this.loadDictionary(this.dataDictionary || defaultDictionaryFile);
        const msgType = this.getValueByTag(FixMessageHTMLElement.KnownTags.MsgType);
        const isTransportMessage = transportDictionary.messages.hasOwnProperty(msgType);
        const headerSchema = transportDictionary.header;
        const messageSchema = isTransportMessage ? transportDictionary.messages[msgType] : dataDictionary.messages[msgType];
        const trailerSchema = transportDictionary.trailer;
        const fields = this.pairs.map(([tag, value], index) => Object.assign({
            number: tag,
            index,
            value
        }, transportDictionary.fieldsByNumber[tag] || dataDictionary.fieldsByNumber[tag]));

        const headerFields = [];
        const messageFields = [];
        const trailerFields = [];
        let target = headerFields;
        for (let field of fields) {
            if (!headerSchema.hasOwnProperty(field.name) && !trailerSchema.hasOwnProperty(field.name)) {
                target = messageFields;
            } else if (trailerSchema.hasOwnProperty(field.name)) {
                target = trailerFields;
            }
            target.push(field);
        }


        const header = this.loadModelSection(headerFields, headerSchema);
        const message = this.loadModelSection(messageFields, messageSchema);
        const trailer = this.loadModelSection(trailerFields, trailerSchema);
        return {header, message, trailer};
    }

    loadModelSection(fields, schema) {
        this.sectionCursor = 0;
        const model = [];
        while (this.sectionCursor < fields.length) {
            const field = fields[this.sectionCursor++];
            let fieldSchema = schema[field.name];
            model.push(field);
            if (fieldSchema?.group) {
                let count = parseInt(field.value);
                field.groups = this.loadGroups(fields, fieldSchema.group, count);
            }
        }
        return model;
    }

    loadGroups(fields, schema, maxGroups) {
        const groups = [];
        const firstFieldName = Object.keys(schema)[0];
        const groupFieldTags = new Set();
        let currentGroup = [];
        let groupCounter = 0;
        while (this.sectionCursor < fields.length) {
            const field = fields[this.sectionCursor++];
            const fieldSchema = schema[field.name];
            const isFirstInGroup = field.name === firstFieldName;
            if (isFirstInGroup) {
                groupCounter++;
            }
            if (!(fieldSchema || groupFieldTags.has(field.number)) && groupCounter >= maxGroups) {
                this.sectionCursor--;
                break;
            }

            if (currentGroup.length > 0 && isFirstInGroup) {
                groups.push(currentGroup);
                currentGroup = [];
            }
            groupFieldTags.add(field.number);
            currentGroup.push(field);

            if (fieldSchema?.group) {
                let count = parseInt(field.value);
                field.groups = this.loadGroups(fields, fieldSchema.group, count);
            }
        }
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        return groups;
    }

    detectDataVersion(transportDictionary) {
        const beginString = this.getValueByTag(FixMessageHTMLElement.KnownTags.BeginString);
        const msgType = this.getValueByTag(FixMessageHTMLElement.KnownTags.MsgType);
        const message = transportDictionary.messages[msgType];
        if (message) {
            return beginString;
        } else {
            const applVerID = this.getValueByTag(FixMessageHTMLElement.KnownTags.ApplVerID);
            if (applVerID && FixMessageHTMLElement.ApplVerIDs[applVerID]) {
                return FixMessageHTMLElement.ApplVerIDs[applVerID];
            } else if (this.containsAnyTag(FixMessageHTMLElement.KnownTags.ExecTransType)) {
                return 'FIX.4.2';
            } else if (this.containsAnyTag(FixMessageHTMLElement.KnownTags.ApplID, FixMessageHTMLElement.KnownTags.ApplSeqNum, FixMessageHTMLElement.KnownTags.EncryptedPasswordMethod)) {
                return 'FIX.5.0 SP2';
            } else if (this.containsAnyTag(FixMessageHTMLElement.KnownTags.DefaultApplVerID, FixMessageHTMLElement.KnownTags.ManualOrderIndicator, FixMessageHTMLElement.KnownTags.QuoteEntryStatus)) {
                return 'FIX.5.0 SP1';
            } else if (this.containsAnyTag(FixMessageHTMLElement.KnownTags.LastLiquidityInd, FixMessageHTMLElement.KnownTags.TradeID, FixMessageHTMLElement.KnownTags.StrategyParameterName)) {
                return 'FIX.5.0';
            } else if (this.tags.map(Number).find(tag => tag >= 1400 && tag < 5000)) {
                return 'FIX.5.0 SP2';
            } else if (beginString === 'FIXT.1.1') {
                return 'FIX.5.0';
            }
        }
        return 'FIX.4.4';
    }

    containsAnyTag(...tags) {
        return this.pairs.some(([tag]) => tags.includes(tag));
    }

    getValueByTag(lookup) {
        return this.pairs.find(([tag]) => tag === lookup)?.[1] ?? null;
    }

    get tags() {
        return this.pairs.map(([tag]) => tag);
    }

    get pairs() {
        return this.messageWithDelimiter.split(this.delimiter).filter(Boolean).map(
            pair => pair.split('=', 2)
        );
    }

    get messageWithDelimiter() {
        let msg = this.message.replaceAll(FixMessageHTMLElement.SOH, this.delimiter);
        if (!this.delimiter.includes('\n')) {
            msg = msg.replaceAll('\r?\n\r?', '');
        }
        return msg;
    }

    get delimiter() {
        return this.getAttribute('delimiter') || '|';
    }

    set delimiter(value) {
        this.setAttribute('delimiter', value);
    }

    get message() {
        return this.getAttribute('message');
    }

    set message(value) {
        this.setAttribute('message', value);
    }

    get mode() {
        return this.getAttribute('mode');
    }

    set mode(value) {
        this.setAttribute('mode', value);
    }

    get dataDictionary() {
        return this.getAttribute('data-dictionary');
    }

    set dataDictionary(value) {
        this.setAttribute('data-dictionary', value);
    }

    async loadDictionary(file) {
        if (file && file.startsWith('<')) {
            return new Dictionary(file, 'application/xml');
        }

        if (FixMessageHTMLElement.DictionaryCache.hasOwnProperty(file)) {
            return FixMessageHTMLElement.DictionaryCache[file];
        }
        const response = await fetch(file, {
            headers: {
                'Accept': 'application/xml, text/xml'
            }
        });
        if (response.ok) {
            const data = new Dictionary(await response.text(), response.headers.get('Content-Type') || 'application/xml');
            FixMessageHTMLElement.DictionaryCache[file] = data;
            return data;
        } else {
            console.error('Error loading data dictionary:', response.statusText);
        }
    }

    utcTimestampToLocalDateTime(value) {
        // value in format 	20231120-14:30:00.000
        if (!value) {
            return null;
        }
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1; // Month is 0-indexed
        const day = parseInt(value.substring(6, 8), 10);
        const hour = parseInt(value.substring(9, 11), 10);
        const minute = parseInt(value.substring(12, 14), 10);
        const second = parseInt(value.substring(15, 17), 10);
        const millisecond = value.length > 17 ? parseInt(value.substring(18, 21), 10) : 0;
        const date = new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
        return `${date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
    }

    localDate(value) {
        // value in format 	20231120
        if (!value) {
            return null;
        }
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1; // Month is 0-indexed
        const day = parseInt(value.substring(6, 8), 10);
        return new Date(year, month, day).toLocaleDateString();
    }

    zonedTimestampToLocalDateTime(value) {
        if (!value) {
            return null;
        }
        // Regex handles YYYYMMDD-HH:MM:SS, variable fractional seconds, and optional TZ
        const regex = /^(\d{4})(\d{2})(\d{2})-(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:(Z)|([+-]\d{2})(?::?(\d{2}))?)?$/;
        const match = value.match(regex);

        if (!match) return "Invalid Format";

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
        const day = parseInt(match[3], 10);
        const hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);
        const second = parseInt(match[6], 10);

        // Take first 3 digits for MS, ignoring extra nano/pico precision for the Date object
        const fracStr = match[7] || "0";
        const milliseconds = parseInt(fracStr.padEnd(3, '0').substring(0, 3), 10);

        const isUTC = match[8] === 'Z';
        const offsetHourStr = match[9];
        const offsetMinStr = match[10];

        let date;

        if (isUTC || offsetHourStr) {
            let utcMs = Date.UTC(year, month, day, hour, minute, second, milliseconds);

            if (offsetHourStr) {
                const offsetHrs = parseInt(offsetHourStr, 10);
                const offsetMins = offsetMinStr ? parseInt(offsetMinStr, 10) : 0;
                // Invert offset to normalize to UTC
                const totalOffsetMs = (offsetHrs * 60 + (offsetHrs < 0 ? -offsetMins : offsetMins)) * 60 * 1000;
                utcMs -= totalOffsetMs;
            }
            date = new Date(utcMs);
        } else {
            date = new Date(year, month, day, hour, minute, second, milliseconds);
        }

        return `${date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
    }

    monthYearToLocal(value) {
        // value in format 	202311
        if (!value) {
            return null;
        }
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1; // Month is 0-indexed
        const date = new Date(year, month);
        let localDate = date.toLocaleString(undefined, {year: 'numeric', month: 'long'});
        if (value.length === 8) {
            const day = value.substring(6, 8);
            if (day.toLowerCase().startsWith('w')) {
                return `Week of ${localDate}, ${day.substring(1)}`
            }
            if (day !== '00') {
                return this.localDate(value);
            }
        }
        return localDate;
    }

    zonedTimeToLocalTime(value) {
        if (!value) {
            return null;
        }
        // Regex: HH:MM, optional :SS, optional whitespace, optional Timezone (Z or offset)
        const regex = /^(\d{2}):(\d{2})(?::(\d{2}))?\s*(?:(Z)|([+-]\d{2})(?::?(\d{2}))?)?$/;
        const match = value.match(regex);

        if (!match) return "Invalid Format";

        const hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const second = match[3] ? parseInt(match[3], 10) : 0;

        const isUTC = match[4] === 'Z';
        const offsetHourStr = match[5];
        const offsetMinStr = match[6];

        // Anchor to current date to handle DST correctly
        const now = new Date();
        let date;

        if (isUTC || offsetHourStr) {
            // 1. Construct base UTC time for today
            let utcMs = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                hour, minute, second
            );

            // 2. Adjust if there is a numeric offset
            if (offsetHourStr) {
                const offsetHrs = parseInt(offsetHourStr, 10);
                const offsetMins = offsetMinStr ? parseInt(offsetMinStr, 10) : 0;
                // Subtract offset to normalize to UTC
                // (e.g. Input +02:00 means we must subtract 2h to get UTC)
                const totalOffsetMs = (offsetHrs * 60 + (offsetHrs < 0 ? -offsetMins : offsetMins)) * 60 * 1000;
                utcMs -= totalOffsetMs;
            }
            date = new Date(utcMs);
        } else {
            // 3. No timezone? Assume local time for today
            date = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                hour, minute, second
            );
        }
        return `${date.toLocaleTimeString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
    }

    validateFixChecksum() {
        const expectedChecksum = this.getValueByTag(FixMessageHTMLElement.KnownTags.CheckSum);
        let sum = 0;
        const dataToCalculate = this.pairs
            .filter(([tag]) => tag !== FixMessageHTMLElement.KnownTags.CheckSum)
            .map(([tag, value]) => `${tag}=${value}${FixMessageHTMLElement.SOH}`)
            .join('');
        for (let i = 0; i < dataToCalculate.length; i++) {
            sum += dataToCalculate.charCodeAt(i);
        }
        const calculatedValue = sum % 256;
        const formattedChecksum = calculatedValue.toString().padStart(3, '0');

        return {
            isValid: formattedChecksum === expectedChecksum,
            expected: expectedChecksum,
            calculated: formattedChecksum
        };
    }
}

class Dictionary {
    version;
    header = new Map();
    trailer = new Map();
    messages = new Map();
    fieldsByNumber = new Map();
    fieldsByName = new Map();
    document;

    constructor(xml, contentType = 'application/xml') {
        const parser = new DOMParser();
        this.document = parser.parseFromString(xml, contentType);
        this.parse();
    }

    parse() {
        let fixElement = this.document.documentElement;
        this.version = `${fixElement.getAttribute('type') || 'FIX'}.${fixElement.getAttribute('major')}.${fixElement.getAttribute('minor')}`
        let fieldsElement = fixElement.getElementsByTagName('fields')[0];
        this.fieldsByNumber = new Map();
        this.fieldsByName = new Map();
        for (let fieldElement of fieldsElement.getElementsByTagName('field')) {
            let number = fieldElement.getAttribute('number');
            let name = fieldElement.getAttribute('name');
            let type = fieldElement.getAttribute('type');
            let values = Object
                .fromEntries(
                    Array
                        .from(fieldElement.getElementsByTagName('value'))
                        .map(valueElement => [
                            valueElement.getAttribute('enum'),
                            valueElement.getAttribute('description')
                        ])
                );
            this.fieldsByNumber[number] = {number, name, type, values};
            this.fieldsByName[name] = {number, name, type, values};
        }

        this.header = this.parseComponent(fixElement.getElementsByTagName('header')[0]);
        this.trailer = this.parseComponent(fixElement.getElementsByTagName('trailer')[0]);

        this.messages = new Map();
        let messagesElement = fixElement.getElementsByTagName('messages')[0];
        for (let messageElement of messagesElement.getElementsByTagName('message')) {
            let msgtype = messageElement.getAttribute('msgtype');
            this.messages[msgtype] = this.parseComponent(messageElement);
        }
    }

    parseComponent(root) {
        let result = new Map();
        for (let element of root.children) {
            if (element.tagName === 'field') {
                let name = element.getAttribute('name');
                result[name] = this.fieldsByName[name];
            } else if (element.tagName === 'group') {
                let name = element.getAttribute('name');
                let group = this.parseComponent(element);
                result[name] = Object.assign({group}, this.fieldsByName[name]);
            } else if (element.tagName === 'component') {
                let name = element.getAttribute('name');
                let xPathResult = this.document.evaluate(
                    `/fix/components/component[@name='${name}']`,
                    this.document,
                    null,
                    XPathResult.ANY_UNORDERED_NODE_TYPE,
                    null
                );
                let componentElement = xPathResult.singleNodeValue;
                let component = this.parseComponent(componentElement);
                for (let key of Object.keys(component)) {
                    result[key] = component[key];
                }
            }
        }
        return result;
    }
}

customElements.define('fix-message', FixMessageHTMLElement);

export default FixMessageHTMLElement;