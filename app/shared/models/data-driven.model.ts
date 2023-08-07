
export enum PageSize {
    Small = 'sm',
    Medium = 'md',
    Large = 'lg',
    XLarge = 'xl'
}

export enum PageType {
    Form = 'form',
    ModalForm = 'modalform',

    Grid = 'grid',  
    ModalGrid = 'modalgrid',

    TabForm = 'tabform',
    ModalTabForm = 'modaltabform',

    TabGrid = 'tabgrid',
    ModalTabGrid = 'modaltabgrid',

    TreeGrid = 'treegrid',
    ModalTreeGrid = 'modaltreegrid',

    TabWebPage = 'tabwebpage',
    ModalWebPage = 'modalwebpage',

    BrowserWebPage = 'browserwebpage',
    ModalBrowserWebPage = 'modalbrowserwebpage',

    Chart = 'graph',
    ModalChart = 'modalgraph',

    Kanban = 'kanban',
    ModalKanban = 'modalkanban',

    Scheduler = 'sheduler',
    ModalScheduler = 'modalsheduler',

    Timeline = 'timeline',
    ModalTimeline = 'modaltimeline',

    PDFView = "pdfview",
    ModalPDFView = 'modalpdfview',

    DeviceInfo = 'deviceinfo',
    ModalDeviceInfo = 'modaldeviceinfo',
    
    Calculator = 'calculator',
    ModalCalculator = 'modalcalculator',
    
    SubGrid = 'subgrid',
    Inventory = 'inventory',

    GridRefresh = 'gridrefresh',

    Packing = "packing",
    Picking = "picking",
    
    ReportGenerate = 'reportgenerate',
    Pivot = 'pivot',
    ModalPivot = 'modalpivot'
}

export enum ButtonType {
    Select = "select",
    View = "view",
    Add = "add",
    Edit = "edit",
    List = "list",
    Delete = "delete",
    Previous = "previous",
    Next = "next",
    Refresh = "refresh",
    Save = "save",
    Exit = "exit",
    Cancel = "cancel",
    Print = "print",
    Export = "export",
    Export_Excel = "export_xls",
    Export_XML = "export_xml",
    Export_CSV = "export_csv",
    Export_TSV = "export_tsv",
    Export_HTML = "export_html",
    Export_JSON = "export_json",
    Export_PDF = "export_pdf",
    OK = "ok"
}

export enum GridShowPosition {
    Top = 'top',
    Bottom = 'bottom'
}
export class OnClick {
    endpoint: string;
    rowrefresh?: string;
    pagesize?: PageSize;
    pagetype?: PageType;
    buttons: ButtonType[]=[];
    title?: any;
    hidefilter?: boolean;
    itemid?: any;
    fieldheight?: any;
    position?: GridShowPosition;
    refresh?: string;
    onclick?: OnClick;                  
}

export class TabPage {
    endpoint: string;
    pagesize?: PageSize;
    pagetype: PageType;
    tab: number;
    title: string;
    onclick?: OnClick;
    buttons?: ButtonType[]=[];
    edit?: 0 | 1;
    form_changed?: boolean = false;
}

export enum FormItemType {
    Button      = 'button',
    CheckBox    = 'checkbox',
    ComboBox    = 'combobox',
    DropDown    = 'dropdown',
    Text        = 'text',
    ReadText    = 'read_text',
    Int         = 'int',
    ReadInt     = 'read_int',   
    Float       = 'float',
    Label       = 'label',
    ReadFloat   = 'read_float',
    Phone       = 'phone',
    ReadPhone   = 'read_phone',
    Date        = 'date',
    Time        = 'time',
    ReadDate    = 'read_date',
    ReadTime    = 'read_time',
    Email       = 'email',
    Hidden      = 'hidden',
    HiddenText  = 'hidden_text',
    HiddenInt   = 'hidden_int',
    HiddenFloat = 'hidden_float',
    Lattitude   = 'lattitude',
    Longitude   = 'longitude',
    MultiLine   = 'multiline',
    Search      = 'search',
    SearchEdit  = 'searchedit',
    Grid        = 'grid',
    Draw        = 'draw',
    Signature   = 'signature',
    Image       = 'image',
    ImageCropper= 'imagecropper',
    Document    = 'document',
    Divider     = 'divider',
    Kanban      = 'kanban',
    Timeline    = 'timeline',
    Scheduler   = 'scheduler',
    ReadImage   = 'read_image',
    ReadSignature = 'read_signature',
    InputLookup = 'inputlookup'
}

export enum KanbanSourceType {
    Id          = "id",         //id - unique identifier of the item. This property is required!
    Status      = "status",     //status - sets the column where the item will be stored. Associated to column's dataField property. This property is required!
    Text        = "text",       //text - sets the item's text.
    Content     = "content",    //content - sets the content area. Could be filled with text/images/widgets etc.
    Tags        = "tags",       //tags - sets taggs stored in item footer div.
    Color       = "color",      //sets unique status color of the item.
    ResourceId  = "resourceId", //resourceId - contains resource id, associated to some resource from resources property.
    ClassName   = "className",  //className - sets individual css class about item.
    SortOrder   = "sortorder"
}

export enum KanbanColumnType {
    Text                    = "text",                   //text - sets the text in column's header.
    DataField               = "dataField",              //dataField - sets the column datafield.
    MaxItems                = "maxItems",               //maxItems - sets maximum number of items per column.
    Collapsible             = "collapsible",            //collapsible - determines whether the column can be collapsed or not.
    CollapseDirection       = "collapseDirection",      //collapseDirection - determines the column's collapse direction - "left" or "right".
    HeaderElement           = "headerElement",          //headerElement - gets the header element of the column after the widget is created.
    CollapsedHeaderElement  = "collapsedHeaderElement", //collapsedHeaderElement - gets the collapsed header element of the column after the widget is created.
    IconClassName           = "iconClassName",          //iconClassName - sets the class name of the header element's icon.
    CurrentItems            = "currentItems"
}

export enum KanbanResourceType {
    Id      = "id",     //id - unique identifier of the resource.
    Name    = "name",   //name - name of the resource.
    Image   = "image",  //image - image of the resource.
}

export enum ColorType {
    Primary = 'primary',
    Warning = 'warning',
    Info = 'info',
    Success = 'success',
    Danger = 'danger'
}

export enum FormItemPipe {
    UpperCase = 'uppercase',
    LowerCase = 'lowercase',
    TitleCase = 'titlecase'
}

export class FormItemLabel {
    display: string;
    fieldname: string;
    inputtype: FormItemType;
    data?: FormItemReturnData;
    length?: number;
    grid?: string;
    options?: any[];
    items?: any[];
    search?: any;
    onclick?: OnClick;
    ondrop?: OnClick;
    endpoint?: string;
    hidefilter?: string;
    validation?: string;
    server_error?: any;
    rows?: number;
    kanbantype?: KanbanSourceType;
    refresh?: boolean = false;
    fieldwidth?: number;
    fieldheight?: number;
    widgettype?: any;
    infobutton?: OnClick;
    style?: string;
    pipe?: FormItemPipe;
    notempty?: boolean;

    outline?: boolean;
    color?: ColorType;

    draggable?: boolean;

    progress?: number =0;
    showProgress?: boolean = false;
    isOpenedFormSet? : boolean = false;
}

export class KanbanField {
    
}

export class FormItemComboBox {
    value: string;
    option: string;
}

export class FormItemReturnData {
    buttons?: ButtonType[];
    file?: string;
    fieldname: string;
    endpoint: string;
    onclick?: OnClick;
    onedit?: OnClick;
    infobutton?: OnClick;
    pagesize?: PageSize;
    pagetype?: PageType;
}

export class ChangeViewInfo {
    page: PageType;
    itemid: any = -1;
    items?: any[];
    data?: any;
    onclick?: OnClick;
}

export enum ChartType {
    Column = "column",                                  // - simple column series
    StackedColumn = "stackedcolumn",                    // - stacked column series
    StackedColumn100 = "stackedcolumn100",              // - percentage stacked columns
    Line = "line" ,                                     // - simple streight lines connecting the value points
    Pie = "pie" ,                                       // - circular chart divided into sectors, illustrating proportion
    Donut = "donut",                                    // - chart divided into circular sectors with different inner and outer radius
    Bar = "bar",
    CandleStick = "candlestick" ,                       // - display candlestick series using open, high, low, close data points
    Ohlc = "ohlc",                                      // - display OHLC series using open, high, low, close data points
    Bubble = "bubble",                                  // - data is displayed as a collection of bubbles
    Scatter = "scatter" ,                               // - data is displayed as a collection of points
    StackedLine = "stackedline",                        // - stacked lines
    StackedLine100 = "stackedline100",                  // - percentage stacked lines
    Spline ="spline",                                   // - smooth lines connecting the value points
    StackedSpline = "stackedspline",                    // - smooth stacked lines
    StackedSpline100 = "stackedspline100" ,             // - percentage stacked smooth lines
    PolarSeries = "polarseries",
    SpiderSeries = "spiderseries",
    StackedArea = "stackedarea",                        // - stacked area with streight lines between the points
    Area ="area" ,                                      // - area connecting the value points with streight lines
    StackedArea100 = "stackedarea100",                  // - percentage stacked area
    AreaSpline = "areaspline",
    StackedAreaSpline = "stackedareaspline",
    StackedAreaSpline100 = "stackedareaspline100",
    WaterFall = "waterfall",                            // - waterfall chart

    RangeColumn = "rangecolumn",                        // - floating column between two values
    StepLine ="stepline" ,                              // - step line
    StackedStepline ="stackedstepline",                 // - stacked step line
    StackedStepline100 = "stackedstepline100" ,         // - percentage stacked step line
    RangeArea = "rangearea",                            // - floating area between pairs of value points
    SplineArea = "splinearea" ,                         // - smooth area connecting the value points
    SplineRangeArea ="splinerangearea",                 // - smooth floating area between pairs of value points
    StackedSplineArea = "stackedsplineara",             // - smooth stacked area
    StackedSplineArea100 = "stackedsplinearea100",      // - percentage stacked smooth area
    StepLineArea = "steplinearea",                      // - step area connecting the value points
    StackedStepLineara = "stackedsteplineara",          // - step stacked area
    StackedStepLineArea100 = "stackedsteplinearea100",  // - percentage stacked step area
    stackedWaterFall = "stackedwaterfall",              // - stacked waterfall chart
}



export enum SchedulerAppointmentField {
    AllDay = "allDay",
    Background = "background", 
    BorderColor = "borderColor", 
    Color ="color", 
    Description = "description",
    Draggable = "draggable",
    From = "from",
    Hidden = "hidden",
    Id = "id", 
    Location = "location",
    RecuuencePattern = "recurrencePattern",
    RecuurenceException ="recurrenceException",
    Resizable = "resizable",
    ResourceId ="resourceId",
    ResourceValue = "resourceValue",
    ReadOnly = "readOnly",
    Subject = "subject", 
    Style = "style",
    Status = "status",
    To = "to",
    Tooltip = "tooltip",
    TimeZone = "timeZone",
    FromDate = "fromdate",

    ToDate = "todate",
    FromTime = "fromtime",
    ToTime = "totime"
}

export enum GridSelectionMode{
    None = "none", 
    SingleRow = "singlerow", 
    MultipleRows = "multiplerows", 
    MultipleRowsExtended = "multiplerowsextended", 
    SingleCell = "singlecell", 
    MultipleCells = "multiplecells", 
    MultipleCellsExtended = "multiplecellsextended", 
    MultipleCellsAdvanced = "multiplecellsadvanced", 
    CheckBox = "checkbox"
}

export enum TypeView{
    Day             = "day",
    Week            = "week",
    Month           = "month",
    Agenda          = "agenda"
}