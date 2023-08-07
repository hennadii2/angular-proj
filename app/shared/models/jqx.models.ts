export enum JqxGridDataType {
    Xml = 'xml',
    Json = 'json',
    Jsonp = 'jsonp',
    Tsv = 'tsv',
    Csv = 'csv',
    Local = 'local',
    Array = 'array',
    ObesrvableArray = 'observablearray'
}

export enum JqxGridColumnType {
    String = 'string',
    Number = 'number',
    Int = 'int',
    Float = 'float',
    Date = 'date',
    CheckBox = 'checkbox'
}

export enum JqxRequestType {
    Post = "POST",
    Get = "GET"
}

export class JqxGridDataField {
    name: string;
    type?: string;
    format?: any;
    map?: any;
    values?: any;
}

export class JqxGridDataSource {
    url?: string;
    data?: any;
    localdata?: any;
    datatype?: JqxGridDataType;
    type?: JqxRequestType;
    id?: string;
    root?: string;
    record?: string;
    datafields?: JqxGridDataField[];
    pagenum?: number;
    pagesize?: number;
    pager?: any;
    sortcolumn?: any;
    sortdirection?: 'asc' | 'desc';
    sort?: any;
    filter?: any;
    addrow?: any;
    deleterow?: any;
    updaterow?: any;
    processdata?: any;
    formatdata?: any;
    contenttype?: any;
}