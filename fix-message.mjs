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

    render() {
        this.dom.textContent = 'Loading...';
        if (this.message) {
            if (this.mode === 'table') {
                this.renderTable();
            } else {
                this.renderString();
            }
        } else {
            this.dom.textContent = 'No fix message to display';
        }
    }

    renderString() {
        this.dom.textContent = this.messageWithDelimiter;
    }

    async renderTable() {
        const model = await this.loadModel();
        const table = document.createElement('table');
        table.append(this.createTableRow('', 'Tag', 'Name', 'Value', 'Description', 'Type', 'th'));
        table.append(this.createTableRow('Header'));
        this.buildTableBody(table, model.header);
        table.append(this.createTableRow('Message'));
        this.buildTableBody(table, model.message);
        table.append(this.createTableRow('Trailer'));
        this.buildTableBody(table, model.trailer);
        this.dom.innerHTML = '';
        if (!this.useHostDom) {
            this.appendStyle();
        }
        this.dom.append(table);
    }

    appendStyle() {
        const style = document.createElement('style')
        style.textContent = `
    :host {
        --font-size: 14px;
        --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        --font-monospace: 'Consolas', 'Menlo', 'Courier New', monospace;
        --font-color: #333;
        --value-color: #333;
        --type-color: #999;
        --string-value-color: #5daa69;
        --number-value-color: #0366d6;
        --boolean-value-color: #0366d6;
        --tag-color: #0366d6;
        --border-color: #e1e4e8;
        --background-color: #f6f8fa;
    }

    table {
        border-collapse: collapse;
        font-family: var(--font-family);
        color: var(--font-color);
        border: 1px solid var(--border-color);
    }

    th {
        background-color: color-mix(in srgb, var(--background-color), black 10%);
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid var(--border-color);
        color: var(--font-color);
    }

    td {
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
    }

    /* Section */
    td:nth-child(1) {
        font-family: var(--font-monospace);
        line-height: 1;
        white-space: pre;
        width: 1%;
    }

    /*Tag*/
    td:nth-child(2) {
        font-family: var(--font-monospace);
        font-weight: bold;
        color: var(--tag-color);
    }

    /*Name*/
    td:nth-child(3) {
        font-weight: 600;
        color: var(--font-color);
    }

    /*Value*/
    td:nth-child(4) {
        font-family: var(--font-monospace);
        color: var(--value-color);
        word-break: break-all;
    }
    
    td:nth-child(4)[data-type=STRING],
     td:nth-child(4)[data-type=CHAR],
     td:nth-child(4)[data-type=CURRENCY] {
        color: var(--string-value-color);
    }
    
    td:nth-child(4)[data-type=INT],
    td:nth-child(4)[data-type=AMT],
    td:nth-child(4)[data-type=QTY],
    td:nth-child(4)[data-type=PRICE],
    td:nth-child(4)[data-type=LENGTH],
    td:nth-child(4)[data-type=SEQNUM] {
        color: var(--number-value-color);
    }
    
    td:nth-child(4)[data-type=BOOLEAN] {
        color: var(--boolean-value-color);
    }
    
    /*Description*/
    td:nth-child(5) {
        font-family: var(--font-monospace);
        color: var(--value-color);
        word-break: break-all;
    }
    
    /* Type */
    td:nth-child(6) {
        font-family: var(--font-monospace);
        color: var(--type-color);
        line-height: 1;
        white-space: pre;
        width: 1%;
    }

    tr:nth-child(even) {
        background-color: color-mix(in srgb, var(--background-color), white 10%);
    }`;
        this.dom.append(style);
    }

    buildTableBody(table, model) {
        for (let i = 0; i < model.length; i++) {
            const item = model[i];
            const tag = item.tag;
            const value = item.value;
            const name = item.name || '';
            const type = item.type || '';
            const description = item.values ? item.values[value] : '';
            const last = i === model.length - 1;
            const tr = this.createTableRow(last ? '\u2514\u2500' : '\u251C\u2500', tag, name, value, description, type);
            table.appendChild(tr);
        }
    }

    createTableRow(section, tag = '', name = '', value = '', description = '', type= '', htmlTag = 'td') {
        const row = document.createElement('tr');
        const cellSection = document.createElement(htmlTag);
        const cellTag = document.createElement(htmlTag);
        const cellName = document.createElement(htmlTag);
        const cellValue = document.createElement(htmlTag);
        const cellType = document.createElement(htmlTag);
        const cellDescription = document.createElement(htmlTag);
        cellSection.textContent = section;
        cellSection.style.textAlign = 'right';
        cellTag.textContent = tag;
        cellName.textContent = name;
        cellValue.textContent = value;
        cellValue.dataset.type = type;
        cellType.textContent = type;
        cellDescription.textContent = description;
        row.append(cellSection, cellTag, cellName, cellValue, cellDescription, cellType);
        return row;
    }

    async loadModel() {
        const header = [];
        const message = [];
        const trailer = [];

        const version = this.getValueByTag(FixMessageHTMLElement.KnownTags.BeginString);
        let defaultDictionaryFile = FixMessageHTMLElement.VersionFiles[version];
        const transportDictionary = await this.loadDictionary(defaultDictionaryFile);
        if (version.startsWith('FIXT')) {
            defaultDictionaryFile = FixMessageHTMLElement.VersionFiles[this.detectDataVersion(transportDictionary, version)];
        }
        const dataDictionary = await this.loadDictionary(this.dataDictionary || defaultDictionaryFile);
        const allFields = Object.assign({}, this.getFields(transportDictionary), this.getFields(dataDictionary));

        const headerStructure = this.getStructure(transportDictionary.fix.header);
        const trainerStructure = this.getStructure(transportDictionary.fix.trailer);
        for (const [tag, value] of this.pairs) {
            const field = Object.assign({}, allFields[tag] || {}, {tag, value});
            if (headerStructure.includes(field.name)) {
                header.push(field);
            } else if (trainerStructure.includes(field.name)) {
                trailer.push(field);
            } else {
                message.push(field);
            }
        }

        return {header, message, trailer};
    }

    getStructure(root) {
        return root?.field?.map(field => field['@name']) || [];
    }

    getFields(dictionary) {
        return Object.fromEntries(dictionary?.fix?.fields?.field.map(field => {
            const tag = field['@number'];
            const name = field['@name'];
            const type = field['@type'];
            let values = {};
            if (field.hasOwnProperty('value')) {
                const keyValue = v => [v['@enum'], v['@description']];
                if (Array.isArray(field.value)) {
                    values = Object.fromEntries(field.value.map(keyValue));
                } else {
                    values = Object.fromEntries([keyValue(field.value)]);
                }
            }
            return [tag, {tag, name, type, values}];
        }) || []);
    }

    detectDataVersion(transportDictionary) {
        const msgType = this.getValueByTag(FixMessageHTMLElement.KnownTags.MsgType);
        const message = transportDictionary?.fix?.messages?.message?.find(message => message['@msgtype'] === msgType);
        if (message) {
            return this.getValueByTag(FixMessageHTMLElement.KnownTags.BeginString);
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
        return this.message.replaceAll(FixMessageHTMLElement.SOH, this.delimiter);
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
        if (FixMessageHTMLElement.DictionaryCache.hasOwnProperty(file)) {
            return FixMessageHTMLElement.DictionaryCache[file];
        }
        const response = await fetch(file, {
            headers: {
                'Accept': 'application/xml, text/xml'
            }
        });
        if (response.ok) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(await response.text(), response.headers.get('Content-Type') || 'application/xml');
            const data = this.xmlToObject(xmlDoc);
            FixMessageHTMLElement.DictionaryCache[file] = data;
            console.log('loaded dictionary', file, data);
            return data;
        } else {
            console.error('Error loading data dictionary:', response.statusText);
        }
    }

    xmlToObject(xmlDoc) {
        let obj = {};

        if (xmlDoc.nodeType === 1) { // element
            if (xmlDoc.attributes.length > 0) {
                for (let j = 0; j < xmlDoc.attributes.length; j++) {
                    const attribute = xmlDoc.attributes.item(j);
                    obj['@' + attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xmlDoc.nodeType === 3) { // text
            obj = xmlDoc.nodeValue;
        }

        if (xmlDoc.hasChildNodes()) {
            for (let i = 0; i < xmlDoc.childNodes.length; i++) {
                const item = xmlDoc.childNodes.item(i);
                const nodeName = item.nodeName;

                if (typeof (obj[nodeName]) === "undefined") {
                    obj[nodeName] = this.xmlToObject(item);
                } else {
                    if (typeof (obj[nodeName].push) === "undefined") {
                        const old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToObject(item));
                }
            }
        }
        return obj;
    }
}

customElements.define('fix-message', FixMessageHTMLElement);